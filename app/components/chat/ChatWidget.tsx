/**
 * ChatWidget - Main floating chatbot widget
 *
 * This component renders a floating chat button that expands to show
 * the chat panel. It's designed to be non-invasive and positioned
 * in the bottom-right corner of the screen.
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatPanel from "./ChatPanel";

interface ChatWidgetProps {
  isLoggedIn?: boolean;
}

export default function ChatWidget({
  isLoggedIn = false,
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={toggleChat}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#E31837] text-white shadow-lg hover:bg-[#c41530] transition-colors duration-200 flex items-center justify-center group"
            aria-label="Open chat"
          >
            {/* Chat Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 group-hover:scale-110 transition-transform"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
              />
            </svg>

            {/* Pulse animation */}
            <span className="absolute inset-0 rounded-full bg-[#E31837] animate-ping opacity-25" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <ChatPanel isLoggedIn={isLoggedIn} onClose={closeChat} />
        )}
      </AnimatePresence>
    </>
  );
}
