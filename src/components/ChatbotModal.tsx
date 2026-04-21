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
        "👋 Сәлем! Мен GreenPulse AI көмекшісімін. Жүйе, климаттық жағдайлар және ұсынымдар туралы сұрақтарыңызға жауап бере аламын. Сізге қалай көмектесе аламын?",
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
        content: data.response || "Кешіріңіз, жауап алу мүмкін болмады. Қайта көріңіз.",
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
    const responses: Record<string, string> = {
      температур: "GreenPulse жүйесі үшін оптималды температура 20-25°C. Қазіргі температура 22.5°C — идеалды диапазонда! 🌡️",
      ылғал: "Ұсынылатын ауа ылғалдылығы: 60-80%. Қазіргі деңгей 65% — фотосинтез үшін тамаша. 💧",
      co2: "CO2 — балдырлардың негізгі қорегі. Оптимум 400-450 ppm. Қазіргі деңгей 420 ppm — өте жақсы! 🌿",
      ph: "Оптималды өсу үшін pH 6.5-7.5 аралығында болуы керек. Қазіргі мән 6.8 — идеалды! ⚗️",
      балдыр: "Балдырлар — фотосинтез арқылы ауадан CO2 сіңіретін микроорганизм. Бір GreenPulse орындығы жылына 38 кг CO2 тазартады! 🌍",
      тиімділік: "GreenPulse 92% тиімділікпен жұмыс істейді — бұл стандартты шешімдерден әлдеқайда жоғары. Бұл жылына 15 ағашқа тең! 🌳",
      жарық: "Жарық интенсивтілігі 400-600 люкс болуы керек. Қазіргі деңгей 450 люкс — фотосинтез үшін оптималды! ☀️",
      баға: "Бір GreenPulse орындығының құны: $500-800. Ауаны тазартуда жылына $1,900 үнемдейді. 💰",
    };

    for (const [keyword, response] of Object.entries(responses)) {
      if (userInput.toLowerCase().includes(keyword)) {
        return response;
      }
    }

    return "Қызықты сұрақ! 🤔 GreenPulse жүйесі, балдырлардың өсу жағдайлары, қоршаған орта параметрлері және оңтайландыру ұсынымдары туралы ақпарат бере аламын. Нақты бір нәрсе сұрай аласыз?";
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
          />

          {/* Модальное окно */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-32px)] h-[600px] bg-gradient-to-br from-black to-black/80 rounded-2xl shadow-2xl border border-cyan-500/30 flex flex-col z-[9999] overflow-hidden"
          >
            {/* Заголовок */}
            <div className="bg-gradient-to-r from-cyan-600 to-green-600 px-6 py-4 flex items-center justify-between border-b border-cyan-500/30">
              <div>
                <h3 className="text-lg font-bold text-white">GreenPulse AI</h3>
                <p className="text-xs text-cyan-100">Сіздің AI көмекшісі</p>
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
                    <span className="text-sm">Жазып жатыр...</span>
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
                  placeholder="Хабарламаңызды жазыңыз..."
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
