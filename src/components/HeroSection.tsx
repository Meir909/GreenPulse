import { motion } from "framer-motion";
import { Thermometer, Droplets, Wind, FlaskConical, Leaf, ChevronDown } from "lucide-react";
import { useSensorSocket } from "@/hooks/useSensorSocket";

const STATIC_FEATURES = [
  { icon: Leaf, label: "38 кг CO₂/год", sub: "1 скамейка = 15 деревьев", color: "#00ff88" },
  { icon: Thermometer, label: "20–30°C", sub: "Оптим. температура", color: "#f97316" },
  { icon: Wind, label: "92% КПД", sub: "Фотосинтез хлореллы", color: "#00d4ff" },
  { icon: Leaf, label: "$1 900/год", sub: "Экономия на 1 ед.", color: "#7c3aed" },
];

const HeroSection = () => {
  const { sensorData, connected, offline } = useSensorSocket();

  const temperature = sensorData?.temperature ?? null;
  const ph          = sensorData?.ph ?? null;
  const co2         = sensorData?.co2_ppm ?? null;
  const humidity    = sensorData?.humidity ?? null;
  const coPpm       = sensorData?.co_ppm ?? null;

  const liveSensors = [
    { icon: Thermometer, label: "Температура", value: temperature != null ? `${temperature.toFixed(1)}°C` : null, color: "#f97316" },
    { icon: Droplets,    label: "Ылғалдылық",  value: humidity   != null ? `${humidity.toFixed(0)}%`   : null, color: "#00d4ff" },
    { icon: Wind,        label: "CO (MQ-7)",   value: coPpm      != null ? `${coPpm.toFixed(0)} ppm`   : null, color: coPpm != null && coPpm > 50 ? "#ef4444" : "#00ff88" },
    { icon: FlaskConical,label: "pH деңгейі",  value: ph         != null ? ph.toFixed(1)               : null, color: "#00ff88" },
  ].filter(c => c.value !== null);

  const hasLive = liveSensors.length > 0;

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden pt-20">
      {/* Aurora animated backdrop */}
      <div className="aurora-bg" />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(rgba(0,255,136,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 text-center max-w-5xl mx-auto w-full">
        {/* WS status badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs font-mono-data mb-8"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${offline ? "bg-gray-500" : connected ? "bg-[#00ff88] animate-pulse" : "bg-yellow-400 animate-pulse"}`} />
          <span className="text-white/60">
            {offline ? "ESP32 офлайн" : connected ? "WebSocket Live" : "Подключение..."}
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        >
          <h1 className="font-display font-bold tracking-tight mb-4 leading-none">
            <span
              className="block text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] bg-gradient-to-r from-[#00ff88] via-[#00d4ff] to-[#7c3aed] bg-clip-text text-transparent"
            >
              GreenPulse
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/70 max-w-2xl mx-auto mb-3 leading-relaxed font-body">
            Биореакторлық орындық — қалалық ауаны тазартудың болашағы
          </p>
          <p className="text-sm text-white/35 mb-10 font-mono-data tracking-widest uppercase">
            Chlorella vulgaris · Spirulina · Microalgae Bioreactor
          </p>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-14"
        >
          <a
            href="#dashboard"
            className="btn-shimmer inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black hover:opacity-90 transition-opacity shadow-[0_0_30px_rgba(0,255,136,0.3)]"
          >
            <Wind size={15} /> Мониторинг
          </a>
          <a
            href="/stations"
            className="btn-shimmer inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm glass-card text-white/80 hover:text-white border border-[rgba(0,255,136,0.25)] hover:border-[rgba(0,255,136,0.5)] transition-all"
          >
            <Leaf size={15} /> Станции
          </a>
        </motion.div>

        {/* Live sensor cards (only when ESP32 connected) */}
        {hasLive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className={`grid gap-3 mb-10 max-w-3xl mx-auto ${
              liveSensors.length === 1 ? "grid-cols-1 max-w-xs" :
              liveSensors.length === 2 ? "grid-cols-2 max-w-sm" :
              liveSensors.length === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"
            }`}
          >
            {liveSensors.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.55 + i * 0.07 }}
                  className="glass-card rounded-xl p-4 text-left relative"
                >
                  {i === 0 && (
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                  )}
                  <Icon size={16} className="mb-2" style={{ color: card.color }} />
                  <p className="text-xs text-white/40 mb-0.5">{card.label}</p>
                  <p className="font-mono-data text-2xl font-bold transition-all duration-700" style={{ color: card.color }}>
                    {card.value}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Static feature pills (always visible) */}
        {!hasLive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10 max-w-3xl mx-auto"
          >
            {STATIC_FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 + i * 0.07 }}
                  className="glass-card rounded-xl p-4 text-left"
                >
                  <Icon size={16} className="mb-2" style={{ color: f.color }} />
                  <p className="font-mono-data text-lg font-bold" style={{ color: f.color }}>{f.label}</p>
                  <p className="text-xs text-white/40 mt-0.5">{f.sub}</p>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Scroll indicator */}
        <motion.a
          href="#problem"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="inline-flex flex-col items-center gap-1 text-white/25 hover:text-white/60 transition-colors"
        >
          <span className="text-xs font-mono-data tracking-widest uppercase">Scroll</span>
          <ChevronDown size={18} className="animate-bounce" />
        </motion.a>
      </div>
    </section>
  );
};

export default HeroSection;
