import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { SlidersHorizontal, TreePine, Users, DollarSign, Leaf } from "lucide-react";

const cities = ["Алматы", "Темиртау", "Ақтау", "Астана"];

const CalculatorSection = () => {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [benches, setBenches] = useState(10);
  const [city, setCity]       = useState("Алматы");

  const co2     = benches * 38;
  const trees   = Math.round(co2 * 15);
  const people  = benches * 300;
  const savings = benches * 19000;

  const results = [
    { Icon: Leaf,       label: "CO₂ жылына",    value: `${co2.toLocaleString()} кг`,   color: "#00ff88" },
    { Icon: TreePine,   label: "Ағаш баламасы", value: `${trees.toLocaleString()}`,     color: "#00d4ff" },
    { Icon: Users,      label: "Адамдар",        value: `${people.toLocaleString()}`,    color: "#7c3aed" },
    { Icon: DollarSign, label: "Үнемдеу",        value: `$${savings.toLocaleString()}`, color: "#f97316" },
  ];

  return (
    <section id="calculator" className="relative py-24 px-4" ref={ref}>
      <div className="container mx-auto max-w-4xl">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-widest text-[#00ff88] mb-3 font-mono-data">Калькулятор</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
            CO₂{" "}
            <span className="bg-gradient-to-r from-[#00ff88] to-[#00d4ff] bg-clip-text text-transparent">
              калькуляторы
            </span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="glass-card rounded-2xl p-8"
        >
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Slider */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal size={14} className="text-[#00ff88]" />
                <label className="text-sm text-white/50 font-body">Орындықтар саны</label>
              </div>
              <input
                type="range"
                min={1}
                max={1000}
                value={benches}
                onChange={(e) => setBenches(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-5
                  [&::-webkit-slider-thumb]:h-5
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-[#00ff88]
                  [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(0,255,136,0.6)]
                  [&::-webkit-slider-thumb]:cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #00ff88 ${(benches / 1000) * 100}%, rgba(255,255,255,0.08) ${(benches / 1000) * 100}%)`
                }}
              />
              <p className="font-mono-data text-5xl font-bold mt-4 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] bg-clip-text text-transparent">
                {benches}
              </p>
            </div>

            {/* City */}
            <div>
              <label className="text-sm text-white/50 mb-4 block font-body">Қала</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-white/5 border border-[rgba(0,255,136,0.15)] rounded-xl px-4 py-3 text-white font-body focus:outline-none focus:border-[rgba(0,255,136,0.4)] transition-colors appearance-none cursor-pointer"
              >
                {cities.map((c) => (
                  <option key={c} value={c} className="bg-[#050a0e]">{c}</option>
                ))}
              </select>
              <p className="text-xs text-white/25 mt-3 font-body">
                38 кг CO₂/год · 15 деревьев · 300 чел. / скамейка
              </p>
            </div>
          </div>

          {/* Results grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {results.map(({ Icon, label, value, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.3 + i * 0.07 }}
                className="glass-card rounded-xl p-4 text-center"
              >
                <div
                  className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center"
                  style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                >
                  <Icon size={14} style={{ color }} />
                </div>
                <p className="text-[10px] text-white/35 mb-1.5 uppercase tracking-widest font-mono-data">{label}</p>
                <p className="font-mono-data text-lg font-bold" style={{ color }}>{value}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default CalculatorSection;
