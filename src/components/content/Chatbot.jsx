// import { config } from "../../config"
import { useState, useRef, useEffect } from "react"
import LoadingSpinner from "../ui/loading"
import { getProfileImageUrl } from "../../utils/profile-images"

// Define the API base URL
const apiBaseUrl = "https://api.ayuwoki.my.id/chatbot"

const apiFetch = async (method, endpoint, data = null) => {
  const token = localStorage.getItem("accessToken")
  if (!token) {
    throw new Error("No access token found")
  }
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
  const options = {
    method,
    headers,
  }
  if (data) {
    options.body = JSON.stringify(data)
  }
  const response = await fetch(`${apiBaseUrl}${endpoint}`, options)
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`)
  }
  return response.json()
}

// Function to safely parse date from string or fallback to current time
const parseSafeDate = (dateStr) => {
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? new Date() : date
}

const Chatbot = ({ user }) => {
  // Menerima prop user
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [currentChatId, setCurrentChatId] = useState(null)
  const [chatHistory, setChatHistory] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  // Hapus state loggedInUser, karena akan menggunakan prop user
  // const [loggedInUser, setLoggedInUser] = useState(null)

  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load current chat ID from localStorage and fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken")
        if (!token) {
          console.error("No access token found")
          return
        }
        // Hapus pengambilan profil pengguna, karena akan bergantung pada prop `user`
        // const userResponse = await fetch("https://api.ayuwoki.my.id/users/api/me", { ... })
        // if (userResult.status === "success" && userResult.data?.username) { setLoggedInUser(userResult.data) }

        // Fetch sessions
        const sessionsResponse = await apiFetch("GET", "/api/session")
        const sessions = sessionsResponse.data.map((session) => ({
          id: session._id,
          title: session.title || "Percakapan Baru", // Default to "Percakapan Baru" if title is missing
          lastMessage: "",
          timestamp: parseSafeDate(session.createdAt),
          messages: [],
        }))
        setChatHistory(sessions)

        // Restore last active chat from localStorage
        const savedChatId = localStorage.getItem("currentChatId")
        if (savedChatId && sessions.some((s) => s.id === savedChatId)) {
          selectChat(savedChatId)
        } else if (sessions.length > 0) {
          selectChat(sessions[0].id)
        } else {
          createNewChat()
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, []) // Tidak ada dependensi pada `user` di sini, karena ini untuk pemuatan riwayat obrolan awal

  // Select a chat and fetch its messages
  const selectChat = async (chatId) => {
    setCurrentChatId(chatId)
    localStorage.setItem("currentChatId", chatId) // Save current chat ID
    try {
      const response = await apiFetch("GET", `/api/chat/history/${chatId}`)
      const fetchedMessages = response.data.map((msg) => ({
        id: msg._id,
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.message,
        timestamp: parseSafeDate(msg.createdAt),
      }))
      setMessages(fetchedMessages)
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  // Create a new chat session
  const createNewChat = async () => {
    try {
      const response = await apiFetch("POST", "/api/session")
      const newSession = response.data
      const newChat = {
        id: newSession._id,
        title: "Percakapan Baru", // Set default title to "Percakapan Baru"
        lastMessage: "",
        timestamp: parseSafeDate(newSession.createdAt),
        messages: [],
      }
      setChatHistory((prev) => [newChat, ...prev])
      setCurrentChatId(newChat.id)
      setMessages(newChat.messages) // No welcome message, just empty array
      localStorage.setItem("currentChatId", newChat.id) // Save new chat ID
    } catch (error) {
      console.error("Error creating new session:", error)
    }
  }

  // Send a message to the chatbot
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)

    try {
      const response = await apiFetch("POST", "/api/chat", {
        sessionId: currentChatId,
        message: userMessage.content,
      })
      const botResponse = response.data
      const botMessage = {
        id: botResponse.id,
        role: "assistant",
        content: botResponse.message,
        timestamp: parseSafeDate(botResponse.timestamp),
      }
      setMessages((prev) => [...prev, botMessage])

      // Update chat history with last message and title (if first message)
      setChatHistory((prev) =>
        prev.map((chat) => {
          if (chat.id === currentChatId) {
            const isFirstMessage = newMessages.length === 1
            return {
              ...chat,
              title: isFirstMessage ? generateChatTitle(userMessage.content) : chat.title,
              lastMessage: getFirstFourWords(userMessage.content),
              timestamp: new Date(),
            }
          }
          return chat
        }),
      )
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Delete a chat session
  const deleteChat = async (chatId, e) => {
    e.stopPropagation()
    if (chatHistory.length === 1) return

    try {
      await apiFetch("DELETE", `/api/session/${chatId}`)
      setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId))
      if (currentChatId === chatId) {
        const remainingChats = chatHistory.filter((chat) => chat.id !== chatId)
        if (remainingChats.length > 0) {
          selectChat(remainingChats[0].id)
        }
      }
    } catch (error) {
      console.error("Error deleting session:", error)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px"
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [input])

  const formatTime = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return "Waktu Tidak Valid"
    }
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  const formatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return "Tanggal Tidak Valid"
    }
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Hari ini"
    if (diffDays === 2) return "Kemarin"
    if (diffDays <= 7) return `${diffDays - 1} Hari yang Lalu`
    return date.toLocaleDateString()
  }

  const generateChatTitle = (userInput) => {
    const words = userInput.trim().split(/\s+/)

    if (words.length <= 3) {
      return userInput.trim()
    } else if (words.length <= 6) {
      return words.slice(0, 4).join(" ")
    } else {
      const importantWords = words.filter(
        (word) =>
          word.length > 3 &&
          ![
            "yang",
            "dan",
            "atau",
            "untuk",
            "dengan",
            "pada",
            "dari",
            "ke",
            "di",
            "the",
            "and",
            "or",
            "for",
            "with",
            "on",
            "from",
            "to",
            "in",
          ].includes(word.toLowerCase()),
      )

      if (importantWords.length >= 2) {
        return importantWords.slice(0, 3).join(" ")
      } else {
        return words.slice(0, 4).join(" ")
      }
    }
  }

  const getFirstFourWords = (text) => {
    const words = text.trim().split(/\s+/)
    return words.slice(0, 6).join(" ")
  }

  const filteredChats = chatHistory.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const profileImgSrc = getProfileImageUrl(user?.profilePicture)
  const hasProfilePicture = user?.profilePicture && user.profilePicture !== ""

  return (
    <div className="h-screen bg-white flex flex-col lg:flex-row overflow-auto max-w-full">
      <div
        className={`bg-white text-[#ff3131] transition-all duration-300 flex flex-col fixed inset-y-0 left-0 z-40 lg:relative lg:inset-auto lg:z-auto border-r border-gray-200 ${
          isSidebarOpen ? "w-3/4 lg:w-1/4" : "w-0"
        } overflow-hidden`}
      >
        <div className={`pt-16 flex flex-col h-full ${isSidebarOpen ? "block" : "hidden"}`}>
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-[#ff3131] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-[#ff3131]">Diagnify AI</h1>
                  <p className="text-base text-gray-500">Asisten Kesehatan</p>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="hidden lg:flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-[#ff3131] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-[#ff3131]">Diagnify AI</h1>
                  <p className="text-base text-gray-500">Asisten Kesehatan</p>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <button
              onClick={createNewChat}
              className="w-full flex items-center space-x-4 px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-base font-medium">Percakapan Baru</span>
            </button>
          </div>
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <svg
                className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Cari Riwayat"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-[#ff3131] focus:border-[#ff3131] transition-colors"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Riwayat Percakapan</h3>
              <div className="space-y-2">
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => {
                      selectChat(chat.id)
                    }}
                    className={`group flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors ${
                      currentChatId === chat.id ? "bg-[#ff3131] text-white" : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-medium truncate">{chat.title}</h4>
                      {chat.lastMessage && (
                        <p
                          className={`text-sm truncate mt-1 ${
                            currentChatId === chat.id ? "text-red-100" : "text-gray-400"
                          }`}
                        >
                          {chat.lastMessage}
                        </p>
                      )}
                      <p className={`text-sm mt-1 ${currentChatId === chat.id ? "text-red-200" : "text-gray-500"}`}>
                        {formatDate(chat.timestamp)}
                      </p>
                    </div>
                    {chatHistory.length > 1 && (
                      <button
                        onClick={(e) => deleteChat(chat.id, e)}
                        className={`opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-opacity ${
                          currentChatId === chat.id ? "hover:bg-red-600" : "hover:bg-gray-200"
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`relative flex-1 flex flex-col transition-all duration-300 min-w-0 ${
          isSidebarOpen ? "lg:opacity-100 opacity-80" : "opacity-100"
        }`}
      >
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-1/2 left-0 z-30 transform -translate-y-1/2 bg-[#ff3131] hover:bg-red-600 text-white shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            style={{
              width: "32px",
              height: "64px",
              borderTopRightRadius: "32px",
              borderBottomRightRadius: "32px",
              borderTopLeftRadius: "0",
              borderBottomLeftRadius: "0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              paddingLeft: "4px",
            }}
          ></button>
        )}
        <div className="absolute inset-0 flex flex-col">
          <div className="flex-1 overflow-y-auto pt-20 lg:pt-16 pb-40">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center px-8 lg:px-16 py-8 lg:py-12">
                <div className="text-center max-w-4xl w-full">
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-6">
                    Halo, {user?.username || ""}! {/* Gunakan prop user */}
                  </h2>
                  <p className="text-gray-600 mb-8 lg:mb-12 text-lg lg:text-xl">
                    Aku adalah Diagnify AI. Ada yang bisa Aku bantu hari ini?
                  </p>
                </div>
              </div>
            ) : (
              <div className="px-8 lg:px-16 py-8 space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`flex max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      <div className={`flex-shrink-0 ${message.role === "user" ? "ml-4" : "mr-4"}`}>
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${
                            message.role === "user" ? "bg-gray-600" : "bg-[#ff3131]"
                          }`}
                        >
                          {message.role === "user" ? (
                            hasProfilePicture ? (
                              <img
                                src={profileImgSrc || "/placeholder.svg"}
                                alt="User Profile"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold uppercase">
                                {user?.username ? user.username.charAt(0) : "U"} {/* Gunakan user.username */}
                              </div>
                            )
                          ) : (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}>
                        <div
                          className={`px-5 py-4 rounded-2xl max-w-full ${
                            message.role === "user"
                              ? "bg-[#ff3131] text-white rounded-br-md"
                              : "bg-white border border-gray-200 text-gray-900 rounded-bl-md shadow-sm"
                          }`}
                        >
                          <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        </div>
                        <span className="text-sm text-gray-500 mt-2 px-1">{formatTime(message.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex max-w-[85%]">
                      <div className="flex-shrink-0 mr-4">
                        <div className="w-10 h-10 rounded-full bg-[#ff3131] flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-5 py-4 shadow-sm">
                        <div className="flex items-center space-x-3">
                          <LoadingSpinner size="sm" />
                          <span className="text-base text-gray-600">AI sedang berpikir...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-8 lg:px-16 py-6">
            <form onSubmit={handleSubmit} className="flex items-end space-x-4 max-w-6xl mx-auto">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ketik di sini"
                  className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#ff3131] focus:border-[#ff3131] resize-none transition-colors text-base leading-relaxed"
                  style={{ minHeight: "56px", maxHeight: "140px" }}
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 w-14 h-14 bg-[#ff3131] hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors focus:ring-2 focus:ring-[#ff3131] focus:ring-offset-2"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                )}
              </button>
            </form>
            <div className="mt-3 px-1 max-w-6xl mx-auto">
              <p className="text-sm text-gray-500">
                Tekan Enter untuk mengirim pesan, Shift + Enter untuk membuat baris baru.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chatbot