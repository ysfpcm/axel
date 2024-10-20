// components/Chatbot.tsx

'use client'

import { useChat } from 'ai/react'
import React, { useRef, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

interface ChatbotProps {
  onClose: () => void
}

export default function Chatbot({ onClose }: ChatbotProps) {
  const { messages, input, handleInputChange, handleSubmit, error, isLoading } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    if (messagesEndRef.current && !isScrolled) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isScrolled])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollHeight - scrollTop === clientHeight) {
      setIsScrolled(false)
    } else {
      setIsScrolled(true)
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto border rounded-lg shadow-lg bg-white relative">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        aria-label="Close Chatbot"
      >
        &#10005; {/* Unicode for 'X' */}
      </button>

      <div className="p-4 bg-white border-b">
        <h2 className="text-xl font-bold text-black">Hi! I&apos;m Axel, your Exatouch assistant. Ask me anything!</h2>
      </div>
      <div
        className="h-[400px] overflow-y-auto p-4 bg-white"
        onScroll={handleScroll}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.role === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block p-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-100 text-black'
                  : 'bg-gray-100 text-black'
              }`}
            >
              {message.role === 'user' ? (
                message.content
              ) : (
                <ReactMarkdown>{message.content}</ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="mb-4 text-center text-gray-500">
            Axel is typing...
          </div>
        )}
        {error && (
          <div className="mb-4 text-center text-red-500">
            An error occurred: {error.message}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-grow p-2 border rounded bg-white text-black"
            aria-label="Message input"
          />
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
            disabled={isLoading}
            aria-label="Send message"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
