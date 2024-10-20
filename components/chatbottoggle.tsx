// components/ChatbotToggle.tsx

'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface ChatbotToggleProps {
  onClick: () => void
}

export default function ChatbotToggle({ onClick }: ChatbotToggleProps) {
  return (
    <motion.button
      onClick={onClick}
      className="bg-blue-500 text-white p-4 rounded-full shadow-lg focus:outline-none"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        repeat: Infinity,
        duration: 2,
        ease: 'easeInOut',
      }}
      aria-label="Open Chatbot"
    >
      &#128172; {/* Unicode for speech balloon */}
    </motion.button>
  )
}
