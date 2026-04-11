"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const MOCK_REPLIES = [
  "GreenPulse — бұл Chlorella vulgaris микробалдырларын пайдаланатын биореактор орындық. 1 орындық жылына 38 кг CO₂ сіңіреді.",
  "Сенсорлар ESP32 арқылы температура, ылғалдылық, CO₂, CO, pH деректерін нақты уақытта жібереді.",
  "Фотосинтез реакциясы: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Балдырлар күн сәулесін пайдаланып CO₂ сіңіреді.",
  "Бір орындық 15 ағашқа тең экологиялық тиімділік көрсетеді.",
];

let mockIdx = 0;

export default function ChatbotFloatingButton() {
  const [open, setOpen]       = useState(false);
  const [msgs, setMsgs]       = useState<Message[]>([
    { role: "assistant", text: "Сәлем! Мен GreenPulse AI көмекшісімін. Жоба туралы сұрақтарыңызға жауап беруге дайынмын." },
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const endRef                = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMsgs(p => [...p, { role: "user", text }]);
    setLoading(true);

    try {
      const res  = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      const reply = data.reply ?? data.message ?? MOCK_REPLIES[mockIdx++ % MOCK_REPLIES.length];
      setMsgs(p => [...p, { role: "assistant", text: reply }]);
    } catch {
      setMsgs(p => [...p, { role: "assistant", text: MOCK_REPLIES[mockIdx++ % MOCK_REPLIES.length] }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-6 left-6 z-50 w-13 h-13 rounded-full flex items-center justify-center shadow-lg cursor-pointer btn-shimmer"
        style={{
          background: "linear-gradient(135deg,#00ff88,#00d4ff)",
          width: 52,
          height: 52,
          boxShadow: "0 0 30px rgba(0,255,136,0.35)",
        }}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}><X size={20} color="#000" /></motion.span>
            : <motion.span key="c" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}><MessageCircle size={20} color="#000" /></motion.span>
          }
        </AnimatePresence>
      </motion.button>

      {/* Chat modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.94 }}
            transition={{ duration: 0.22 }}
            className="fixed bottom-24 left-6 z-50 w-80 sm:w-96 glass-card rounded-2xl overflow-hidden flex flex-col"
            style={{ height: 420 }}
          >
            {/* Header */}
            <div
              className="px-4 py-3 flex items-center gap-2.5 border-b border-white/6"
              style={{ background: "rgba(0,255,136,0.06)" }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,255,136,0.15)" }}>
                <Bot size={14} className="text-[#00ff88]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white" style={{ fontFamily: "var(--font-space-grotesk)" }}>GreenPulse AI</p>
                <p className="text-[10px] text-white/30" style={{ fontFamily: "var(--font-inter)" }}>Экология туралы сұраңыз</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-xs leading-relaxed ${
                      m.role === "user"
                        ? "text-black rounded-br-sm"
                        : "text-white/75 border border-white/8 rounded-bl-sm"
                    }`}
                    style={{
                      background: m.role === "user" ? "linear-gradient(135deg,#00ff88,#00d4ff)" : "rgba(255,255,255,0.04)",
                      fontFamily: "var(--font-inter)",
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="px-3.5 py-2.5 rounded-xl rounded-bl-sm border border-white/8 text-xs text-white/30" style={{ background: "rgba(255,255,255,0.04)", fontFamily: "var(--font-inter)" }}>
                    <span className="inline-flex gap-1">
                      <span className="animate-bounce" style={{ animationDelay: "0ms" }}>·</span>
                      <span className="animate-bounce" style={{ animationDelay: "150ms" }}>·</span>
                      <span className="animate-bounce" style={{ animationDelay: "300ms" }}>·</span>
                    </span>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-white/6 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && send()}
                placeholder="Сұрақ жазыңыз..."
                className="flex-1 bg-white/4 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[rgba(0,255,136,0.35)] transition-colors"
                style={{ fontFamily: "var(--font-inter)" }}
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer disabled:opacity-30"
                style={{ background: "linear-gradient(135deg,#00ff88,#00d4ff)" }}
                aria-label="Send"
              >
                <Send size={13} color="#000" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
