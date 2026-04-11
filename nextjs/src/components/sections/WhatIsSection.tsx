"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FlaskConical, BarChart2, Globe, Radio } from "lucide-react";

const features = [
  {
    Icon: FlaskConical,
    color: "#00ff88",
    title: "Биореактор",
    desc: "Chlorella vulgaris микробалдырлары — табиғи CO₂ жұтқыш. 1 орындық = 38 кг CO₂/жыл.",
  },
  {
    Icon: BarChart2,
    color: "#00d4ff",
    title: "Нақты мониторинг",
    desc: "ESP32 сенсорлары: температура, ылғалдылық, CO, CO₂, pH, GPS деректері секундтан-секундта.",
  },
  {
    Icon: Globe,
    color: "#7c3aed",
    title: "Экология Impact",
    desc: "1 орындық = 15 ағашқа тең. Қала ортасына органикалық орналастыруға арналған.",
  },
  {
    Icon: Radio,
    color: "#f97316",
    title: "IoT платформа",
    desc: "WebSocket + REST API арқылы деректер нақты уақытта бөлісіледі. Open-source архитектура.",
  },
];

export default function WhatIsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="what-is" className="relative py-28 px-4" ref={ref}>
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
            GreenPulse деген не?
          </p>
          <h2
            className="font-display text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Экология + технология{" "}
            <span className="gradient-green">бірге</span>
          </h2>
          <p
            className="text-white/42 text-lg max-w-xl mx-auto leading-relaxed"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Биореактор орындық — бұл тек жиhaz емес. Бұл тыныс алатын, деректер жинайтын, ауаны тазартатын IoT-экожүйе.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(({ Icon, color, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 flex flex-col gap-3 cursor-default"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: color + "14", border: `1px solid ${color}28` }}
              >
                <Icon size={20} style={{ color }} />
              </div>
              <h3
                className="font-display font-bold text-base text-white"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {title}
              </h3>
              <p
                className="text-sm text-white/40 leading-relaxed"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Tech core card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.65, delay: 0.5 }}
          className="mt-8 glass-card rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8"
        >
          <div className="flex-1 text-center md:text-left">
            <p
              className="text-xs uppercase tracking-widest text-white/28 mb-2"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              Технологиялық жүрек
            </p>
            <h3
              className="font-display text-2xl font-bold text-white mb-3"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Chlorella vulgaris
            </h3>
            <p className="text-white/40 text-sm leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>
              Жасыл микробалдыр — фотосинтез арқылы CO₂ жұтады, оттегі шығарады. Бір шаршы метр биореактор 15 ағашқа тең жұмыс атқарады.
            </p>
          </div>
          <div className="shrink-0">
            <div
              className="rounded-xl px-6 py-4 text-center"
              style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.18)" }}
            >
              <p
                className="font-mono text-lg text-[#00ff88] font-bold tracking-wider"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                6CO₂ + 6H₂O
              </p>
              <p
                className="font-mono text-xs text-white/28 my-1"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                ──────────────→
              </p>
              <p
                className="font-mono text-lg text-[#00d4ff] font-bold tracking-wider"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                C₆H₁₂O₆ + 6O₂
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
