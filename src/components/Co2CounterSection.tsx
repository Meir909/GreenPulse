import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const Co2CounterSection = () => {
  const [grams, setGrams] = useState<number>(0);
  const [records, setRecords] = useState<number>(0);
  const [displayGrams, setDisplayGrams] = useState<number>(0);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const fetchAbsorbed = async () => {
    try {
      const res = await fetch("/api/co2-absorbed");
      const json = await res.json();
      if (json.status === "ok") {
        setGrams(json.grams);
        setRecords(json.records);
      }
    } catch {
      // offline — keep showing previous
    }
  };

  useEffect(() => {
    fetchAbsorbed();
    const interval = setInterval(fetchAbsorbed, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Smooth counting animation
  useEffect(() => {
    if (animRef.current) clearInterval(animRef.current);
    const start = displayGrams;
    const end = grams;
    const duration = 1200;
    const startAt = performance.now();
    const animate = (now: number) => {
      const t = Math.min(1, (now - startAt) / duration);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      setDisplayGrams(start + (end - start) * eased);
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [grams]);

  // Real-time ticking (adds estimated grams per second = 4.34 g/hr / 3600)
  useEffect(() => {
    const tickMs = 1000;
    const gramsPerTick = 4.34 / 3600; // ~0.0012 g/s at 100% efficiency
    const tick = setInterval(() => {
      setGrams(prev => prev + gramsPerTick);
    }, tickMs);
    return () => clearInterval(tick);
  }, []);

  const trees = (displayGrams / 1000 / 38 * 15).toFixed(3); // 38 kg/year = 15 trees equiv
  const kg = (displayGrams / 1000).toFixed(4);

  return (
    <section className="relative py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass rounded-2xl neon-border overflow-hidden"
        >
          <div className="h-1.5 w-full bg-gradient-to-r from-green-600 via-primary to-cyan-400" />
          <div className="p-8 text-center">
            <p className="text-sm uppercase tracking-widest text-primary mb-2 font-mono-data">
              Live Counter
            </p>
            <h3 className="font-headline text-2xl font-bold text-foreground mb-6">
              🌿 Поглощено CO₂ с момента запуска
            </h3>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Main grams counter */}
              <div className="glass rounded-xl p-6 border border-primary/20">
                <p className="text-xs text-muted-foreground mb-2">Поглощено</p>
                <p className="font-mono-data text-5xl font-bold text-primary">
                  {displayGrams.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">граммов CO₂</p>
                <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-1.5 bg-gradient-to-r from-primary to-green-400 rounded-full"
                    animate={{ width: `${Math.min(100, (displayGrams / 38000) * 100)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">из 38 000 г/год</p>
              </div>

              {/* Kilograms */}
              <div className="glass rounded-xl p-6 border border-cyan-500/20">
                <p className="text-xs text-muted-foreground mb-2">В килограммах</p>
                <p className="font-mono-data text-4xl font-bold text-cyan-400">
                  {kg}
                </p>
                <p className="text-sm text-muted-foreground mt-1">кг CO₂</p>
                <p className="text-xs text-muted-foreground mt-3">
                  {records} показаний от ESP32
                </p>
              </div>

              {/* Tree equivalents */}
              <div className="glass rounded-xl p-6 border border-green-500/20">
                <p className="text-xs text-muted-foreground mb-2">Эквивалент деревьев</p>
                <p className="font-mono-data text-4xl font-bold text-green-400">
                  {trees}
                </p>
                <p className="text-sm text-muted-foreground mt-1">🌳 дерево-дней</p>
                <p className="text-xs text-muted-foreground mt-3">
                  1 GreenPulse = 15 деревьев/год
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              Расчёт на основе реальных данных температуры ESP32 + модели фотосинтеза хлореллы
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Co2CounterSection;
