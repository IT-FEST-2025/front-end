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
      } else {
        // If no chats left, create a new empty chat
        createNewChat();
      }
    }
  }

  const filteredChats = chatHistory.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const userProfilePicture = user?.profilePicture || "/default-avatar.jpg";

  return (
    <div className="h-screen bg-white flex flex-col lg:flex-row overflow-auto max-w-full">
      {/* Sidebar - Modified widths: 3/4 on mobile/tablet, 1/4 on desktop */}
      <div
        className={`bg-white text-[#ff3131] transition-all duration-300 flex flex-col fixed inset-y-0 left-0 z-40 lg:relative lg:inset-auto lg:z-auto border-r border-gray-200 ${
          isSidebarOpen ? "w-3/4 lg:w-1/4" : "w-0"
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-[#ff3131]">Diagnify AI</h1>
                  <p className="text-base text-gray-500">Health Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {/* Desktop header (always visible on larger screens) */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="w-10 h-10 bg-[#ff3131] rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-[#ff3131]">Diagnify AI</h1>
                <p className="text-base text-gray-500">Health Assistant</p>
              </div>
            </div>
            {/* Search */}
            <div className="mt-6 relative">
              <input
                type="text"
                placeholder="Cari percakapan..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff3131] focus:border-transparent text-gray-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
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
            </div>
            {/* New Chat Button */}
            <button
              onClick={createNewChat}
              className="mt-6 w-full bg-[#ff3131] hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Buat Chat Baru</span>
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {filteredChats.length > 0 ? (
              filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => selectChat(chat.id)}
                  className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors duration-200 group relative ${
                    currentChatId === chat.id
                      ? "bg-red-50 border-l-4 border-[#ff3131] text-[#ff3131] font-semibold"
                      : "bg-white hover:bg-gray-100 border-l-4 border-transparent text-gray-700"
                  }`}
                >
                  <div>
                    <h3 className="text-sm line-clamp-1">{chat.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                      {chat.lastMessage || "Mulai percakapan..."}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(chat.timestamp)} - {formatTime(chat.timestamp)}
                    </p>
                  </div>
                  {chatHistory.length > 1 && ( // Only show delete if more than one chat
                    <button
                      onClick={(e) => deleteChat(chat.id, e)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full bg-gray-200 text-gray-500 hover:bg-red-200 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      title="Hapus Chat"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
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
              ))
            ) : (
              <p className="text-center text-gray-500">Tidak ada percakapan ditemukan.</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50 relative">
        {/* Navbar Toggle for Mobile */}
        <div className="lg:hidden fixed top-0 left-0 w-full bg-white border-b border-gray-200 flex items-center h-16 px-4 z-30 shadow-sm">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
          <span className="ml-4 text-lg font-semibold text-gray-800">Chatbot AI</span>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 pt-20 lg:pt-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#ff3131] flex items-center justify-center text-white text-lg font-bold mr-3">
                  AI
                </div>
              )}
              {message.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden mr-3">
                  <img src={userProfilePicture} alt="User Avatar" className="w-full h-full object-cover"/>
                </div>
              )}
              <div
                className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                  message.role === "user"
                    ? "bg-[#ff3131] text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                <span
                  className={`block text-right mt-1 ${
                    message.role === "user" ? "text-white text-opacity-80" : "text-gray-500"
                  } text-xs`}
                >
                  {formatTime(message.timestamp)}
                </span>
              </div>
              {/* If user message, photo is on the left; otherwise, it's assistant, photo is on the right. */}
              {/* The current implementation puts user photo on the left. Let's keep it this way. */}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <form
          onSubmit={handleSubmit}
          className="p-4 bg-white border-t border-gray-200 flex items-end space-x-3 sticky bottom-0 left-0 right-0 z-20"
        >
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ketik pesan Anda..."
              rows={1}
              className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff3131] focus:border-transparent resize-none transition-colors text-base leading-relaxed"
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
            Tekan Enter untuk mengirim pesan, Shift + Enter untuk baris baru.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Chatbot