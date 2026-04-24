import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface SplashScreenProps {
  onDone: () => void;
}

const SplashScreen = ({ onDone }: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const steps = [
      { pct: 20, delay: 200 },
      { pct: 45, delay: 600 },
      { pct: 70, delay: 1000 },
      { pct: 90, delay: 1400 },
      { pct: 100, delay: 1800 },
    ];
    steps.forEach(({ pct, delay }) =>
      setTimeout(() => setProgress(pct), delay)
    );
    setTimeout(onDone, 2400);
  }, [onDone]);

  const label =
    progress < 30 ? "Жүйе іске қосылуда..." :
    progress < 60 ? "Биореактор инициализациясы..." :
    progress < 90 ? "Сенсорларға қосылуда..." :
    "Дайын!";

  return (
    <div className="fixed inset-0 bg-[#060C06] flex flex-col items-center justify-center z-[9999]">
      {/* Radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-80 h-80 rounded-full bg-green-500/10 blur-3xl" />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center gap-4 mb-12"
      >
        {/* Water drop logo */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-[60%_40%_40%_60%/60%_60%_40%_40%] bg-gradient-to-br from-cyan-400 to-green-400 shadow-[0_0_40px_rgba(0,255,136,0.5)]" />
          <div className="absolute inset-[6px] rounded-[60%_40%_40%_60%/60%_60%_40%_40%] bg-gradient-to-br from-cyan-300/40 to-transparent" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-wider">
            Green<span className="text-green-400">Pulse</span>
          </h1>
          <p className="text-cyan-400/70 text-xs text-center tracking-widest mt-1">
            БИОРЕАКТОР МОНИТОРИНГІ
          </p>
        </div>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-64 flex flex-col items-center gap-3"
      >
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 to-green-400 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between w-full">
          <span className="text-gray-500 text-xs">{label}</span>
          <span className="text-green-400 text-xs font-mono">{progress}%</span>
        </div>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
