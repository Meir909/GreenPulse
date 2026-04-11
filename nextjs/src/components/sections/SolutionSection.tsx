"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Sprout, Wind, Leaf, Droplets, CheckCircle2 } from "lucide-react";

const steps = [
  { Icon: Sprout,       title: "Балдыр өсіру",        desc: "Algae culture grows",   color: "#00ff88" },
  { Icon: Wind,         title: "Ластанған ауа кіреді", desc: "Polluted air enters",   color: "#f97316" },
  { Icon: Leaf,         title: "CO₂ сіңіреді",         desc: "Algae absorbs CO₂",     color: "#00d4ff" },
  { Icon: Droplets,     title: "Сорғы айналдырады",    desc: "Pump circulates",       color: "#7c3aed" },
  { Icon: CheckCircle2, title: "Таза ауа шығады",       desc: "Clean air exits",       color: "#00ff88" },
];

export default function SolutionSection() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="solution" className="relative py-28 px-4" ref={ref}>
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
          className="text-center mb-16"
        >
          <p
            className="text-xs uppercase tracking-widest text-[#00ff88] mb-3"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            Шешім
          </p>
          <h2
            className="font-display text-4xl md:text-5xl font-bold text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Қалай{" "}
            <span className="gradient-green">жұмыс істейді?</span>
          </h2>
        </motion.div>

        {/* Steps grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-16">
          {steps.map(({ Icon, title, desc, color }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card rounded-2xl p-5 text-center relative"
            >
              <div
                className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-black"
                style={{ background: color, fontFamily: "var(--font-jetbrains-mono)" }}
              >
                {i + 1}
              </div>
              <div
                className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
                style={{ background: color + "15", border: "1px solid " + color + "28" }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <p
                className="font-display font-bold text-xs text-white mb-1 leading-tight"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {title}
              </p>
              <p className="text-[10px] text-white/30" style={{ fontFamily: "var(--font-inter)" }}>
                {desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Formula card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.65, delay: 0.6 }}
          className="glass-card rounded-2xl p-8 max-w-2xl mx-auto text-center"
        >
          <p
            className="text-xs text-white/25 mb-3 uppercase tracking-widest"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            Фотосинтез реакциясы
          </p>
          <p
            className="font-mono text-xl md:text-2xl text-[#00ff88] font-bold tracking-wider"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂
          </p>
          <p className="text-xs text-white/32 mt-3" style={{ fontFamily: "var(--font-inter)" }}>
            Микробалдырлар CO₂-ні сіңіріп, O₂ шығарады
          </p>
        </motion.div>
      </div>
    </section>
  );
}
