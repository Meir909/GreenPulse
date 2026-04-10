import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Leaf, TreePine, Gauge } from "lucide-react";

const Co2CounterSection = () => {
  const [grams, setGrams]             = useState<number>(0);
  const [records, setRecords]         = useState<number>(0);
  const [displayGrams, setDisplayGrams] = useState<number>(0);

  const fetchAbsorbed = async () => {
    try {
      const res  = await fetch("/api/co2-absorbed");
      const json = await res.json();
      if (json.status === "ok") {
        setGrams(json.grams);
        setRecords(json.records);
      }
    } catch { /* offline */ }
  };

  useEffect(() => {
    fetchAbsorbed();
    const interval = setInterval(fetchAbsorbed, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Smooth counting animation
  useEffect(() => {
    const start   = displayGrams;
    const end     = grams;
    const startAt = performance.now();
    const animate = (now: number) => {
      const t      = Math.min(1, (now - startAt) / 1200);
      const eased  = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      setDisplayGrams(start + (end - start) * eased);
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [grams]);

  // Real-time ticking
  useEffect(() => {
    const gramsPerTick = 4.34 / 3600;
    const tick = setInterval(() => {
      setGrams(prev => prev + gramsPerTick);
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const trees = (displayGrams / 1000 / 38 * 15).toFixed(3);
  const kg    = (displayGrams / 1000).toFixed(4);
  const pct   = Math.min(100, (displayGrams / 38000) * 100);

  return (
    <section className="relative py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          {/* top accent bar */}
          <div className="h-0.5 w-full bg-gradient-to-r from-[#00ff88] via-[#00d4ff] to-[#7c3aed]" />

          <div className="p-8">
            <div className="text-center mb-8">
              <p className="text-xs uppercase tracking-widest text-[#00ff88] mb-2 font-mono-data">
                Live Counter
              </p>
              <h3 className="font-display text-2xl font-bold text-white">
                Поглощено CO₂ с момента запуска
              </h3>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {/* Grams */}
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Leaf size={15} className="text-[#00ff88]" />
                  <p className="text-xs text-white/40 font-mono-data">Поглощено</p>
                </div>
                <p className="font-mono-data text-4xl font-bold text-[#00ff88] mb-1">
                  {displayGrams.toFixed(2)}
                </p>
                <p className="text-xs text-white/30 mb-3">граммов CO₂</p>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-1 rounded-full bg-gradient-to-r from-[#00ff88] to-[#00d4ff]"
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-[10px] text-white/20 mt-1 font-mono-data">из 38 000 г/год</p>
              </div>

              {/* kg */}
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Gauge size={15} className="text-[#00d4ff]" />
                  <p className="text-xs text-white/40 font-mono-data">Килограммах</p>
                </div>
                <p className="font-mono-data text-4xl font-bold text-[#00d4ff] mb-1">
                  {kg}
                </p>
                <p className="text-xs text-white/30 mb-3">кг CO₂</p>
                <p className="text-[10px] text-white/20 font-mono-data">
                  {records} показаний от ESP32
                </p>
              </div>

              {/* Trees */}
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <TreePine size={15} className="text-[#00ff88]" />
                  <p className="text-xs text-white/40 font-mono-data">Эквивалент</p>
                </div>
                <p className="font-mono-data text-4xl font-bold text-[#00ff88] mb-1">
                  {trees}
                </p>
                <p className="text-xs text-white/30 mb-3">дерево-дней</p>
                <p className="text-[10px] text-white/20 font-mono-data">
                  1 GreenPulse = 15 деревьев/год
                </p>
              </div>
            </div>

            <p className="text-xs text-white/20 mt-6 text-center font-body">
              Расчёт на основе реальных данных температуры ESP32 + модели фотосинтеза хлореллы
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Co2CounterSection;
