import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingScreenProps {
  onDone: () => void;
}

const slides = [
  {
    icon: "🌿",
    title: "GreenPulse дегеніміз не?",
    description:
      "Chlorella vulgaris балдырлары негізіндегі биореактор скамейкасы — ауаны тазартып, CO₂ жұтады.",
    color: "from-green-500/20 to-cyan-500/20",
    glow: "rgba(0,255,136,0.3)",
  },
  {
    icon: "⚡",
    title: "Қалай жұмыс істейді?",
    description:
      "ESP32 сенсорлары температура, pH, CO₂ және жарық деңгейін бақылайды. AI деректерді талдайды.",
    color: "from-cyan-500/20 to-blue-500/20",
    glow: "rgba(0,212,255,0.3)",
  },
  {
    icon: "🚀",
    title: "Мониторингті бастаңыз",
    description:
      "Нақты уақытта станцияларды бақылаңыз, AI анализ алыңыз және қоршаған ортаға оң әсер етіңіз.",
    color: "from-blue-500/20 to-green-500/20",
    glow: "rgba(0,255,136,0.2)",
  },
];

const OnboardingScreen = ({ onDone }: OnboardingScreenProps) => {
  const [current, setCurrent] = useState(0);

  const next = () => {
    if (current < slides.length - 1) setCurrent(current + 1);
    else onDone();
  };

  const slide = slides[current];

  return (
    <div className="fixed inset-0 bg-[#060C06] flex flex-col z-[9998]">
      {/* Skip */}
      <div className="flex justify-end p-6">
        <button onClick={onDone} className="text-gray-500 text-sm">
          Өткізу →
        </button>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center text-center gap-6"
          >
            {/* Icon circle */}
            <div
              className={`w-32 h-32 rounded-full bg-gradient-to-br ${slide.color} flex items-center justify-center text-6xl border border-white/10`}
              style={{ boxShadow: `0 0 60px ${slide.glow}` }}
            >
              {slide.icon}
            </div>

            <h2 className="text-2xl font-bold text-white leading-tight">
              {slide.title}
            </h2>
            <p className="text-gray-400 text-base leading-relaxed max-w-sm">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots + button */}
      <div className="p-8 flex flex-col items-center gap-6">
        {/* Dots */}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "w-6 h-2 bg-green-400"
                  : "w-2 h-2 bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* Next / Start button */}
        <button
          onClick={next}
          className="w-full max-w-xs py-4 rounded-2xl font-bold text-black text-base bg-gradient-to-r from-cyan-400 to-green-400 shadow-[0_0_24px_rgba(0,255,136,0.4)] active:scale-95 transition-transform"
        >
          {current < slides.length - 1 ? "Келесі →" : "🚀 Бастау"}
        </button>
      </div>
    </div>
  );
};

export default OnboardingScreen;
