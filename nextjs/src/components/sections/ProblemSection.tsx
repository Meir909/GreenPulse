"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { AlertTriangle, Info } from "lucide-react";

// Source: WHO Global Air Quality Guidelines (2021); IQAir World Air Quality Report (2023)
// Almaty PM2.5 annual mean ~28 µg/m³ (IQAir 2023); WHO guideline: 5 µg/m³
// Temirtau industrial zone; Aktau relatively better
const cities = [
  { name: "Алматы",   pm25: 28.2, whoMult: 5.6, danger: true,  source: "IQAir 2023" },
  { name: "Темиртау", pm25: 35.7, whoMult: 7.1, danger: true,  source: "IQAir 2023" },
  { name: "Ақтау",    pm25: 18.1, whoMult: 3.6, danger: false, source: "IQAir 2023" },
];

export default function ProblemSection() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="problem" className="relative py-28 px-4" ref={ref}>
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
          className="text-center mb-16"
        >
          <p
            className="text-xs uppercase tracking-widest text-[#ef4444] mb-3"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            Мәселе
          </p>
          <h2
            className="font-display text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Ауа ластануы —{" "}
            <span
              style={{
                background: "linear-gradient(135deg,#ef4444,#f97316)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              тыныш дағдарыс
            </span>
          </h2>
          <p
            className="text-white/40 text-lg max-w-xl mx-auto"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Қазақстан қалаларындағы PM2.5 деңгейі ДДҰ нормасынан бірнеше есе асып кетеді.
          </p>
        </motion.div>

        {/* City cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-16">
          {cities.map((city, i) => (
            <motion.div
              key={city.name}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.13 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="font-display font-bold text-xl text-white"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {city.name}
                </h3>
                {city.danger && <AlertTriangle size={15} className="text-[#ef4444]" />}
              </div>
              <p
                className="font-mono text-4xl font-bold text-white mb-1"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                {city.pm25}
                <span className="text-sm text-white/28 ml-1.5">мкг/м³</span>
              </p>
              <p
                className="text-sm font-semibold mb-3"
                style={{ color: city.danger ? "#ef4444" : "#00ff88", fontFamily: "var(--font-inter)" }}
              >
                {city.whoMult}× WHO нормасы
              </p>
              <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: "rgba(255,255,255,0.05)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${Math.min((city.whoMult / 8) * 100, 100)}%` } : {}}
                  transition={{ duration: 1.2, delay: i * 0.18 + 0.3 }}
                  className="h-full rounded-full"
                  style={{ background: city.danger ? "#ef4444" : "#00ff88" }}
                />
              </div>
              <p className="text-[10px] text-white/20" style={{ fontFamily: "var(--font-inter)" }}>
                Дереккөз: {city.source}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Global stat */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.65, delay: 0.5 }}
          className="text-center"
        >
          <p
            className="font-mono text-7xl md:text-9xl font-bold mb-3"
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              background: "linear-gradient(135deg,#ef4444,#f97316)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 40px rgba(239,68,68,0.22))",
            }}
          >
            7M+
          </p>
          <p className="text-lg text-white/45" style={{ fontFamily: "var(--font-inter)" }}>
            адам жыл сайын ауа ластануынан қайтыс болады
          </p>
          <div className="mt-4 flex items-center justify-center gap-1.5">
            <Info size={11} className="text-white/18" />
            <p className="text-xs text-white/22" style={{ fontFamily: "var(--font-inter)" }}>
              WHO: Ambient air pollution — A global assessment of exposure and burden of disease (2016)
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
