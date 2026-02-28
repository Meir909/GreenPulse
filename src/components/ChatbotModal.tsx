import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatbotModal = ({ isOpen, onClose }: ChatbotModalProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "👋 Привет! Я ИИ помощник GreenPulse. Я могу ответить на вопросы о системе, климатических условиях и рекомендациях. Чем я могу вам помочь?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    // Добавляем сообщение пользователя
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Получаем историю сообщений для контекста
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      // Отправляем запрос на Flask API
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputValue,
          history: conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "Извините, не удалось получить ответ. Пожалуйста, попробуйте снова.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);

      // Fallback на генерирование ответа если API недоступен
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateAIResponse(inputValue),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = (userInput: string): string => {
    const responses = {
      температур: "Оптимальная температура для системы GreenPulse составляет 20-25°C. Текущая температура 22.5°C находится в идеальном диапазоне! 🌡️",
      влажност: "Рекомендуемая влажность воздуха: 60-80%. Текущий уровень 65% идеален для фотосинтеза. 💧",
      co2: "CO2 (углекислый газ) - главное питание для балдырей. Оптимум 400-450 ppm. Текущий уровень 420 ppm отличный! 🌿",
      ph: "pH должен быть в диапазоне 6.5-7.5 для оптимального роста. Текущее значение 6.8 идеально! ⚗️",
      балдыр: "Балдыри (Baldyria) - это микроорганизм, который поглощает CO2 из воздуха через фотосинтез. Одна скамейка GreenPulse очищает 38 кг CO2 в год! 🌍",
      эффектив: "GreenPulse работает с эффективностью 92%, что значительно выше стандартных решений. Это эквивалент 15 деревьев за год! 🌳",
      свет: "Интенсивность света должна быть 400-600 люкс. Текущий уровень 450 люкс оптимален для фотосинтеза! ☀️",
      стоимост: "Стоимость одной скамейки GreenPulse: $500-800 USD. Она экономит $1,900 в год на очистке воздуха. 💰",
    };

    for (const [keyword, response] of Object.entries(responses)) {
      if (userInput.toLowerCase().includes(keyword)) {
        return response;
      }
    }

    return "Это интересный вопрос! 🤔 Я могу помочь с информацией о системе GreenPulse, условиях роста балдырей, параметрах окружающей среды и рекомендациями по оптимизации. Можете спросить что-нибудь конкретное?";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Фоновый оверлей */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Модальное окно */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-32px)] h-[600px] bg-gradient-to-br from-black to-black/80 rounded-2xl shadow-2xl border border-cyan-500/30 flex flex-col z-50 overflow-hidden"
          >
            {/* Заголовок */}
            <div className="bg-gradient-to-r from-cyan-600 to-green-600 px-6 py-4 flex items-center justify-between border-b border-cyan-500/30">
              <div>
                <h3 className="text-lg font-bold text-white">GreenPulse AI</h3>
                <p className="text-xs text-cyan-100">Ваш ИИ помощник</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Область сообщений */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                      message.role === "user"
                        ? "bg-cyan-600 text-white rounded-br-none"
                        : "bg-white/10 text-gray-100 rounded-bl-none border border-cyan-500/20"
                    }`}
                  >
                    {message.content}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/10 text-gray-100 px-4 py-2 rounded-lg rounded-bl-none border border-cyan-500/20 flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin text-cyan-400" />
                    <span className="text-sm">Печатает...</span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Форма ввода */}
            <div className="bg-black/50 border-t border-cyan-500/20 p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Напишите сообщение..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 bg-white/10 border-cyan-500/30 text-white placeholder:text-gray-500 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 rounded-lg"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatbotModal;
