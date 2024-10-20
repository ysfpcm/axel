'use client'
import Chatbot from '@/components/Chatbot'
import ChatbotToggle from '@/components/chatbottoggle'
import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export default function Home() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)

  const openChatbot = () => {
    setIsChatbotOpen(true)
  }

  const closeChatbot = () => {
    setIsChatbotOpen(false)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Title and Subtitle */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-black">Meet Axel!</h1>
        <p className="text-lg text-gray-700">Axel is an assistant with knowledge of Exatouch, ready to help you with your questions!</p>
        <p className="text-sm text-gray-600 mt-2">Press the button to start chatting with Axel!</p>
      </div>

      <div className="flex-grow flex items-center justify-center">
        {/* Chatbot Toggle Button */}
        <ChatbotToggle onClick={openChatbot} />
      </div>

      {/* Chatbot Modal */}
      <AnimatePresence>
        {isChatbotOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Chatbot onClose={closeChatbot} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="w-full text-center py-8">
        <p className="text-xl text-black">
          Powered by <span className="text-blue-800 font-semibold">Exatouch</span>
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Electronic Payments Inc.
        </p>
      </footer>
    </div>
  )
}
