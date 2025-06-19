import { useState, useEffect } from 'react';

export const useChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  // Auto-open chatbot with welcome message after 10 seconds (optional)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setHasNewMessage(true);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [isOpen]);

  const openChat = () => {
    setIsOpen(true);
    setHasNewMessage(false);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  const toggleChat = () => {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  };

  return {
    isOpen,
    hasNewMessage,
    openChat,
    closeChat,
    toggleChat
  };
};
