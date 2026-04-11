"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FlaskConical, Thermometer, Droplets, Sun, AlertTriangle, BookOpen, CheckCircle2 } from "lucide-react";
import { SENSOR_THRESHOLDS, CO2_MODEL } from "@/lib/dataTypes";

const organism = {
  name: "Chlorella vulgaris",
  kingdom: "Viridiplantae",
  type: "Unicellular green microalgae",
  mechanism: "Oxygenic photosynthesis",
  formula: "6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂",
};

const parameters = [
  {
    Icon: Thermometer,
    color: "#f97316",
    label: "Temperature",
    optimal: "20–30°C",
    range: "0–40°C (active)",
    note: "Growth rate drops >50% outside 15–35°C",
    measured: true,
  },
  {
    Icon: Droplets,
    color: "#00d4ff",
    label: "pH",
    optimal: "6.5–7.5",
    range: "6.0–8.5 (tolerable)",
    note: "pH monitored live; deviations indicate culture stress",
    measured: true,
  },
  {
    Icon: Sun,
    color: "#f59e0b",
    label: "Light intensity",
    optimal: "400–600 lux",
    range: ">200 lux (minimum)",
    note: "Photosaturation ~3000 µmol/m²/s; LDR sensor monitors sufficiency",
    measured: true,
  },
  {
    Icon: FlaskConical,
    color: "#00ff88",
    label: "CO₂ absorption",
    optimal: "~4.34 g/h at 100% eff.",
    range: "0–4.34 g/h (model)",
    note: "Estimated via temperature model — not directly measured (no inlet/outlet CO₂ differential sensor in this unit)",
    measured: false,
  },
];

const validationStages = [
  {
    stage: "Literature baseline",
    status: "verified",
    desc: "38 kg CO₂/year absorption rate sourced from Converti et al. (2009) for Chlorella vulgaris, 1m² photobioreactor culture under controlled conditions.",
  },
  {
    stage: "Sensor calibration",
    status: "verified",
    desc: "ESP32 sensors (DHT22, MH-Z19, MQ-7, pH probe) calibrated against manufacturer specifications. ±0.5°C temperature accuracy, ±50 ppm CO₂ accuracy.",
  },
  {
    stage: "Efficiency model",
    status: "partial",
    desc: "Temperature-based efficiency curve validated against growth literature. Light and pH factors not yet integrated into CO₂ estimate model.",
  },
  {
    stage: "Direct CO₂ measurement",
    status: "pending",
    desc: "Inlet/outlet CO₂ differential measurement requires additional sensor (NDIR CO₂ sensor on exhaust port). Planned for next hardware iteration.",
  },
  {
    stage: "Long-term culture stability",
    status: "pending",
    desc: "Multi-month outdoor culture performance data not yet collected. Current dataset: pilot measurements from controlled lab environment.",
  },
];

const STATUS_COLOR = {
  verified: { text: "text-[#00ff88]", bg: "bg-[rgba(0,255,136,0.10)]", border: "border-[rgba(0,255,136,0.22)]" },
  partial:  { text: "text-[#f97316]", bg: "bg-[rgba(249,115,22,0.08)]",  border: "border-[rgba(249,115,22,0.22)]"  },
  pending:  { text: "text-white/30",  bg: "bg-white/4",                   border: "border-white/10"                  },
};

export default function ScientificValidationSection() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="science" className="relative py-28 px-4" ref={ref}>
      <div className="container mx-auto max-w-6xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-widest text-[#00ff88] mb-3" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
            Scientific basis
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Technology &{" "}
            <span className="gradient-green">Validation</span>
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto" style={{ fontFamily: "var(--font-inter)" }}>
            What is measured, what is estimated, and what the current validation stage is.
            We distinguish between literature values and measured results.
          </p>
        </motion.div>

        {/* Organism card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-card rounded-2xl p-7 mb-8 flex flex-col md:flex-row gap-6 items-start"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(0,255,136,0.12)", border: "1px solid rgba(0,255,136,0.25)" }}
          >
            <FlaskConical size={24} className="text-[#00ff88]" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-xs px-2.5 py-0.5 rounded-md text-[#00ff88] font-mono" style={{ background: "rgba(0,255,136,0.08)", fontFamily: "var(--font-jetbrains-mono)" }}>
                {organism.kingdom}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-md text-white/35" style={{ background: "rgba(255,255,255,0.04)", fontFamily: "var(--font-inter)" }}>
                {organism.type}
              </span>
            </div>
            <h3 className="font-display text-2xl font-bold text-white mb-1 italic" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              {organism.name}
            </h3>
            <p className="text-white/40 text-sm mb-3" style={{ fontFamily: "var(--font-inter)" }}>
              Mechanism: {organism.mechanism}
            </p>
            <div
              className="inline-block rounded-xl px-5 py-3"
              style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.15)" }}
            >
              <p className="font-mono text-sm text-[#00ff88] font-bold tracking-wider" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                {organism.formula}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Measured parameters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <p className="text-xs uppercase tracking-widest text-white/28 mb-5" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
            Monitored parameters
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {parameters.map(({ Icon, color, label, optimal, range, note, measured }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.25 + i * 0.08 }}
                className="glass-card rounded-2xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: color + "14", border: `1px solid ${color}28` }}
                  >
                    <Icon size={16} style={{ color }} />
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${measured ? "text-[#00ff88]" : "text-[#f97316]"}`}
                    style={{
                      background: measured ? "rgba(0,255,136,0.08)" : "rgba(249,115,22,0.08)",
                      fontFamily: "var(--font-jetbrains-mono)"
                    }}
                  >
                    {measured ? "MEASURED" : "ESTIMATED"}
                  </span>
                </div>
                <p className="font-display font-bold text-sm text-white mb-1" style={{ fontFamily: "var(--font-space-grotesk)" }}>{label}</p>
                <p className="font-mono text-xs text-[#00ff88] mb-1" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>Optimal: {optimal}</p>
                <p className="text-[10px] text-white/28 mb-2" style={{ fontFamily: "var(--font-inter)" }}>Range: {range}</p>
                <p className="text-[10px] text-white/38 leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>{note}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Validation status table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card rounded-2xl p-7"
        >
          <div className="flex items-center gap-3 mb-6">
            <BookOpen size={16} className="text-[#00d4ff]" />
            <p className="text-xs uppercase tracking-widest text-white/28" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
              Validation status
            </p>
          </div>
          <div className="space-y-3">
            {validationStages.map(({ stage, status, desc }, i) => {
              const c = STATUS_COLOR[status as keyof typeof STATUS_COLOR];
              return (
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, x: -12 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.45, delay: 0.45 + i * 0.07 }}
                  className={`flex gap-4 p-4 rounded-xl border ${c.bg} ${c.border}`}
                >
                  <div className="shrink-0 mt-0.5">
                    {status === "verified"
                      ? <CheckCircle2 size={14} className="text-[#00ff88]" />
                      : status === "partial"
                        ? <AlertTriangle size={14} className="text-[#f97316]" />
                        : <div className="w-3.5 h-3.5 rounded-full border border-white/20 mt-0.5" />
                    }
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-space-grotesk)" }}>{stage}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${c.text}`} style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                        {status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>{desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div
            className="mt-5 p-4 rounded-xl flex gap-3"
            style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)" }}
          >
            <AlertTriangle size={14} className="text-[#00d4ff] shrink-0 mt-0.5" />
            <p className="text-xs text-white/45 leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>
              <strong className="text-white/65">Reference:</strong>{" "}
              {CO2_MODEL.source}. Accuracy of CO₂ estimates: {CO2_MODEL.accuracy}.{" "}
              {CO2_MODEL.confidence}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
