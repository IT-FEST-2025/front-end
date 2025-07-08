// fitur chatbot

import { useState, useRef, useEffect } from "react"
import LoadingSpinner from "../ui/loading"

const Chatbot = ({ user }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content:
        "Hello! I'm your AI health assistant. How can I help you today? You can describe your symptoms or ask any health-related questions.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [currentChatId, setCurrentChatId] = useState(1)
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      title: "Percakapan baru",
      lastMessage: "",
      timestamp: new Date(),
      messages: [
        {
          id: 1,
          role: "assistant",
          content:
            "Hello! I'm your AI health assistant. How can I help you today? You can describe your symptoms or ask any health-related questions.",
          timestamp: new Date(),
        },
      ],
    },
  ])
  const [searchQuery, setSearchQuery] = useState("")

  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // fungsi untuk generate title dari inputan user
  const generateChatTitle = (userInput) => {
    const words = userInput.trim().split(/\s+/)

    // fungsi untuk mengambil title chat history berdasarkan inputan user
    if (words.length <= 3) {
      return userInput.trim()
    } else if (words.length <= 6) {
      return words.slice(0, 4).join(" ")
    } else {
      // menghapus konjungsi untuk title di chat history
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

  // fungsi untuk mengambiil 6 pesan terakhir untuk di chat history
  const getFirstFourWords = (text) => {
    const words = text.trim().split(/\s+/)
    return words.slice(0, 6).join(" ")
  }

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

    const currentInput = input.trim()
    setInput("")
    setIsLoading(true)

    // update chat inputan user ke chat history
    setChatHistory((prev) =>
      prev.map((chat) => {
        if (chat.id === currentChatId) {
          const isFirstMessage = chat.title === "Percakapan baru"

          return {
            ...chat,
            title: isFirstMessage ? generateChatTitle(currentInput) : chat.title,
            messages: newMessages,
            lastMessage: getFirstFourWords(currentInput),
            timestamp: new Date(),
          }
        }
        return chat
      }),
    )

    // simulasi respons AI
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          "Thank you for sharing your symptoms. Based on what you've described, I recommend consulting with a healthcare professional for a proper diagnosis. In the meantime, here are some general suggestions that might help...",
        timestamp: new Date(),
      }

      const finalMessages = [...newMessages, aiResponse]
      setMessages(finalMessages)
      setIsLoading(false)

      // update title di chat history berdasarkan inputan user
      setChatHistory((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: finalMessages,
                timestamp: new Date(),
              }
            : chat,
        ),
      )
    }, 2000)
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
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  // format data untuk di chat history
  const formatDate = (date) => {
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Hari ini"
    if (diffDays === 2) return "Kemarin"
    if (diffDays <= 7) return `${diffDays - 1} Hari yang Lalu`
    return date.toLocaleDateString()
  }

  // membuat chat baru
  const createNewChat = () => {
    const newChatId = Date.now()
    const newChat = {
      id: newChatId,
      title: "Percakapan baru",
      lastMessage: "",
      timestamp: new Date(),
      messages: [
        {
          id: 1,
          role: "assistant",
          content:
            "Hello! I'm your AI health assistant. How can I help you today? You can describe your symptoms or ask any health-related questions.",
          timestamp: new Date(),
        },
      ],
    }

    setChatHistory((prev) => [newChat, ...prev])
    setCurrentChatId(newChatId)
    setMessages(newChat.messages)
  }

  // pilih chat
  const selectChat = (chatId) => {
    const selectedChat = chatHistory.find((chat) => chat.id === chatId)
    if (selectedChat) {
      setCurrentChatId(chatId)
      setMessages(selectedChat.messages)
    }
  }

  // hapus chat history
  const deleteChat = (chatId, e) => {
    e.stopPropagation()
    if (chatHistory.length === 1) return

    setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId))

    if (currentChatId === chatId) {
      const remainingChats = chatHistory.filter((chat) => chat.id !== chatId)
      if (remainingChats.length > 0) {
        selectChat(remainingChats[0].id)
      }
    }
  }

  const filteredChats = chatHistory.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="h-screen bg-white flex flex-col lg:flex-row overflow-hidden max-w-full">
      {/* Sidebar */}
      <div
        className={`bg-white text-[#ff3131] transition-all duration-300 flex flex-col fixed inset-y-0 left-0 z-40 lg:relative lg:inset-auto lg:z-auto border-r border-gray-200 ${
          isSidebarOpen ? "w-full lg:w-3/4" : "w-0"
        } overflow-hidden`}
      >
        {/* Sidebar content */}
        <div className={`pt-16 flex flex-col h-full ${isSidebarOpen ? "block" : "hidden"}`}>
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200">
            {/* Mobile header with close button */}
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
                  <p className="text-base text-gray-500">Health Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Desktop header */}
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
                  <p className="text-base text-gray-500">Health Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* New Chat Button */}
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

          {/* Search */}
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
                placeholder="Cari Riwayat Percakapan"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-[#ff3131] focus:border-[#ff3131] transition-colors"
              />
            </div>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Chats</h3>
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
                        className={`opacity-0 group-hover:opacity-100 p-2 rounded transition-all ${
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

      {/* Main Content */}
      <div
        className={`relative flex-1 flex flex-col transition-all duration-300 min-w-0 ${
          isSidebarOpen ? "lg:opacity-100 opacity-80" : "opacity-100"
        }`}
      >
        {/* Half-Circle Sidebar Toggle Button */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-1/2 left-0 z-30 transform -translate-y-1/2 bg-[#ff3131] hover:bg-red-600 text-white shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            style={{
              width: "48px",
              height: "96px",
              borderTopRightRadius: "48px",
              borderBottomRightRadius: "48px",
              borderTopLeftRadius: "0",
              borderBottomLeftRadius: "0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              paddingLeft: "8px",
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Messages Container */}
        <div className="absolute inset-0 flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto pt-20 lg:pt-16 pb-40">
            {messages.length === 1 ? (
              // Welcome Screen
              <div className="h-full flex items-center justify-center px-8 lg:px-16 py-8 lg:py-12">
                <div className="text-center max-w-4xl w-full">
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-6">
                    Halo, {user?.username || "Nama"}!
                  </h2>
                  <p className="text-gray-600 mb-8 lg:mb-12 text-lg lg:text-xl">
                    Aku adalah Diagnify AI. Ada yang bisa Aku bantu hari ini?
                  </p>
                </div>
              </div>
            ) : (
              // Chat Messages
              <div className="px-8 lg:px-16 py-8 space-y-6">
                {messages.slice(1).map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`flex max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      {/* Avatar */}
                      <div className={`flex-shrink-0 ${message.role === "user" ? "ml-4" : "mr-4"}`}>
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            message.role === "user" ? "bg-gray-600" : "bg-[#ff3131]"
                          }`}
                        >
                          {message.role === "user" ? (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
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

                      {/* Message Content */}
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

                {/* Loading indicator */}
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

          {/* Input Area - Made Much Wider */}
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
            {/* Helper text */}
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