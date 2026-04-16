import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface StatCard {
  label: string;
  value: number;
  unit: string;
  prefix?: string;
  decimals: number;
  delta: () => number;
}

const stats: StatCard[] = [
  { label: "Температура", value: 24.3, unit: "°C", decimals: 1, delta: () => (Math.random() - 0.5) * 0.4 },
  { label: "pH деңгейі", value: 7.2, unit: "", decimals: 1, delta: () => Math.random() * 0.05 },
  { label: "CO₂ азайды", value: -18, unit: "%", decimals: 0, delta: () => -(Math.random() * 0.3) },
  { label: "Биомасса", value: 0.55, unit: "OD", decimals: 2, delta: () => Math.random() * 0.01 },
];

const HeroSection = () => {
  const [values, setValues] = useState(stats.map((s) => s.value));

  useEffect(() => {
    const interval = setInterval(() => {
      setValues((prev) =>
        prev.map((v, i) => {
          const newVal = v + stats[i].delta();
          // Keep within reasonable bounds
          if (i === 0) return Math.max(22, Math.min(26, newVal));
          if (i === 1) return Math.max(6.8, Math.min(7.8, newVal));
          if (i === 2) return Math.min(-10, Math.max(-25, newVal));
          return Math.max(0.4, Math.min(0.8, newVal));
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      <div className="mesh-gradient absolute inset-0 z-0" />
      <div className="relative z-10 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="font-headline text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-gradient mb-6 tracking-tight">
            GreenPulse
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto mb-4 leading-relaxed">
            Биореакторлық орындық — қалалық ауаны тазартудың болашағы
          </p>
          <p className="text-sm text-muted-foreground mb-12">
            Chlorella vulgaris · Spirulina · Microalgae Bioreactor Technology
          </p>
        </motion.div>

        {/* Live Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="glass rounded-xl p-4 sm:p-5 neon-border relative group hover:scale-105 transition-transform duration-300"
            >
              {i === 0 && (
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
                  <span className="text-[10px] font-mono text-primary uppercase tracking-wider">Live</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="font-mono-data text-2xl sm:text-3xl font-bold text-primary transition-all duration-700">
                {stat.prefix}
                {values[i].toFixed(stat.decimals)}
                <span className="text-sm text-muted-foreground ml-1">{stat.unit}</span>
              </p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="mt-16"
        >
          <a href="#problem" className="text-muted-foreground hover:text-primary transition-colors">
            <svg className="w-6 h-6 mx-auto animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
