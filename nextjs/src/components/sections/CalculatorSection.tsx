"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Calculator, Leaf, TreePine, Info } from "lucide-react";
import { CO2_MODEL } from "@/lib/dataTypes";

export default function CalculatorSection() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const [benches, setBenches] = useState(10);

  // Formula: benches × 38 kg/yr (literature max, 100% efficiency assumed)
  const co2PerYear = +(benches * CO2_MODEL.maxKgPerYear).toFixed(0);
  const treesEquiv = Math.round(co2PerYear / 2.5);

  return (
    <section id="calculator" className="relative py-28 px-4" ref={ref}>
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-widest text-[#00ff88] mb-3" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
            Калькулятор
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Импактыңды{" "}
            <span className="gradient-green">есепте</span>
          </h2>
          <p className="text-white/35 text-sm mt-3" style={{ fontFamily: "var(--font-inter)" }}>
            Теориялық максимум. Нақты мән ±30–50% ауытқуы мүмкін.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="glass-card rounded-2xl p-8"
        >
          {/* Slider */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white/50" style={{ fontFamily: "var(--font-inter)" }}>
                <Calculator size={15} className="text-[#00ff88]" />
                <span className="text-sm">GreenPulse орындық саны</span>
              </div>
              <span className="font-mono text-3xl font-bold text-[#00ff88]" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                {benches}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              value={benches}
              onChange={(e) => setBenches(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(90deg, #00ff88 ${benches}%, rgba(255,255,255,0.08) ${benches}%)`,
              }}
            />
            <div className="flex justify-between text-xs text-white/20 mt-1.5" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
              <span>1</span><span>100</span>
            </div>
          </div>

          {/* Formula display */}
          <div
            className="rounded-xl px-5 py-3.5 mb-6"
            style={{ background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.12)" }}
          >
            <p className="font-mono text-xs text-white/35 mb-1" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
              Формула:
            </p>
            <p className="font-mono text-sm text-[#00ff88]" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
              {benches} орындық × {CO2_MODEL.maxKgPerYear} кг/жыл = {co2PerYear} кг CO₂/жыл
            </p>
            <p className="text-[10px] text-white/22 mt-1" style={{ fontFamily: "var(--font-inter)" }}>
              Ағаш балама: {co2PerYear} кг ÷ 2.5 кг/ағаш/жыл = {treesEquiv} ағаш
            </p>
          </div>

          {/* Results */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                Icon: Leaf,
                color: "#00ff88",
                label: "CO₂ сіңіру / жыл",
                value: `~${co2PerYear} кг`,
                note: "теориялық макс.",
              },
              {
                Icon: TreePine,
                color: "#00d4ff",
                label: "Балама ағаш",
                value: `~${treesEquiv} ағаш`,
                note: "орт. 2.5 кг/ағаш/жыл",
              },
            ].map(({ Icon, color, label, value, note }) => (
              <div
                key={label}
                className="rounded-xl p-5 text-center"
                style={{ background: color + "08", border: `1px solid ${color}20` }}
              >
                <Icon size={18} style={{ color }} className="mx-auto mb-2" />
                <p className="text-xs text-white/30 mb-1" style={{ fontFamily: "var(--font-inter)" }}>{label}</p>
                <p className="font-mono text-2xl font-bold" style={{ fontFamily: "var(--font-jetbrains-mono)", color }}>
                  {value}
                </p>
                <p className="text-[10px] text-white/22 mt-1" style={{ fontFamily: "var(--font-inter)" }}>{note}</p>
              </div>
            ))}
          </div>

          {/* Assumptions note */}
          <div className="mt-6 flex gap-2.5 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <Info size={12} className="text-white/20 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-white/30 leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>
                <strong className="text-white/45">Болжамдар:</strong>{" "}
                100% фотосинтездік тиімділік, оңтайлы температура (20–30°C), жеткілікті жарық.
                Нақты жағдайда тиімділік төмен болады.
              </p>
              <p className="text-[10px] text-white/22 mt-1" style={{ fontFamily: "var(--font-inter)" }}>
                Дереккөз: {CO2_MODEL.source}. Дәлдік: {CO2_MODEL.accuracy}.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
