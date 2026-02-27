import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import ChatbotModal from "./ChatbotModal";

const ChatbotFloatingButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Плавающая кнопка */}
      <motion.button
        onClick={() => setIsOpen(true)}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 300, delay: 0.2 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-600 to-green-600 text-white shadow-lg shadow-cyan-500/50 flex items-center justify-center hover:shadow-xl hover:shadow-cyan-500/70 transition-all duration-300 border border-cyan-400/50 hover:border-cyan-300 cursor-pointer group"
      >
        {/* Светящееся кольцо */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full border border-cyan-400/30"
        />

        {/* Иконка */}
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <MessageCircle className="w-6 h-6" />
        </motion.div>

        {/* Тултип */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          whileHover={{ opacity: 1, x: 0 }}
          className="absolute right-16 bg-black/90 px-3 py-2 rounded-lg text-sm font-medium text-white whitespace-nowrap border border-cyan-500/30 pointer-events-none"
        >
          ИИ Помощник
        </motion.div>
      </motion.button>

      {/* Модальное окно чатбота */}
      <ChatbotModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default ChatbotFloatingButton;
