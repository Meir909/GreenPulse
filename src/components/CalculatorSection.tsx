import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const cities = ["Алматы", "Темиртау", "Ақтау", "Астана"];

const CalculatorSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [benches, setBenches] = useState(10);
  const [city, setCity] = useState("Алматы");

  const co2 = benches * 38;
  const trees = Math.round(co2 * 15);
  const people = benches * 300;
  const savings = benches * 19000;

  return (
    <section id="calculator" className="relative py-24 px-4" ref={ref}>
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-sm uppercase tracking-widest text-primary mb-3 font-mono-data">Калькулятор</p>
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground">
            CO₂ <span className="text-gradient">калькуляторы</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="glass rounded-2xl p-8 neon-border"
        >
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Slider */}
            <div>
              <label className="text-sm text-muted-foreground mb-3 block">Орындықтар саны</label>
              <input
                type="range"
                min={1}
                max={1000}
                value={benches}
                onChange={(e) => setBenches(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,255,136,0.5)]"
              />
              <p className="font-mono-data text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400 mt-4 drop-shadow-[0_0_12px_rgba(0,212,255,0.6)]">{benches}</p>
            </div>

            {/* City select */}
            <div>
              <label className="text-sm text-muted-foreground mb-3 block">Қала</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg p-3 text-foreground font-body focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <ResultCard label="CO₂ жылына" value={`${co2.toLocaleString()} кг`} />
            <ResultCard label="Ағаш баламасы" value={`🌳 ${trees.toLocaleString()}`} />
            <ResultCard label="Адамдар" value={`${people.toLocaleString()}`} />
            <ResultCard label="Үнемдеу" value={`$${savings.toLocaleString()}`} />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const ResultCard = ({ label, value }: { label: string; value: string }) => (
  <div className="glass rounded-lg md:rounded-xl p-3 md:p-4 text-center border border-primary/40 bg-gradient-to-br from-cyan-500/10 to-green-500/10 hover:border-primary/60 transition-all">
    <p className="text-[10px] md:text-xs text-primary/90 mb-2 uppercase tracking-widest font-semibold">{label}</p>
    <p className="font-mono-data text-xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-primary to-green-400 drop-shadow-[0_0_12px_rgba(0,212,255,0.6)]">{value}</p>
  </div>
);

export default CalculatorSection;
