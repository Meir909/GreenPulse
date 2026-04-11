"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Leaf, Wind, Gauge, ArrowRight, ChevronDown, FlaskConical } from "lucide-react";
import { useSensorSocket } from "@/hooks/useSensorSocket";
import { calculateAQI } from "@/lib/aqi";
import { getDataState, DATA_STATE_LABEL, DATA_STATE_COLOR } from "@/lib/dataTypes";

export default function HeroSection() {
  const { sensorData, connected, offline, loading, lastUpdate } = useSensorSocket();
  const aqi = sensorData ? calculateAQI(sensorData.co_ppm, sensorData.co2_ppm, sensorData.temperature) : null;
  const dataState = getDataState(connected, offline, loading, lastUpdate);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-28 pb-16 overflow-hidden noise-grid">
      <div className="aurora-bg" aria-hidden="true" />

      {/* Data status badge */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative z-10 mb-8"
      >
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border ${
          dataState === "live"
            ? "bg-[rgba(0,255,136,0.08)] border-[rgba(0,255,136,0.22)]"
            : "bg-white/4 border-white/10"
        }`} style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            dataState === "live" ? "bg-[#00ff88] animate-pulse" : "bg-white/20"
          }`} />
          <span className={DATA_STATE_COLOR[dataState]}>
            {dataState === "live"
              ? `${DATA_STATE_LABEL[dataState]} · ${sensorData?.station_name ?? "GreenPulse-01"}`
              : DATA_STATE_LABEL[dataState]}
          </span>
        </div>
      </motion.div>

      {/* Main heading */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.2 }}
        className="relative z-10 text-center max-w-4xl"
      >
        <h1
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-5"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          <span className="gradient-full">GreenPulse</span>
        </h1>
        <p
          className="text-xl sm:text-2xl md:text-3xl font-semibold text-white/80 mb-5"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Algae bioreactor bench for urban air quality
        </p>
        <p className="text-base md:text-lg text-white/45 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>
          Chlorella vulgaris microalgae absorb CO₂ via photosynthesis.
          ESP32 sensors monitor air quality in real time.
          Designed for cities, campuses, and public spaces.
        </p>
      </motion.div>

      {/* Key metrics — with explicit data origin */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.38 }}
        className="relative z-10 flex flex-wrap gap-3 justify-center mt-8 mb-8"
      >
        {[
          { value: "~38 kg",  label: "CO₂ / year",     sub: "literature estimate",  color: "#00ff88", Icon: Leaf    },
          { value: "≈15",     label: "tree equivalent", sub: "avg 2.5 kg/tree/yr",   color: "#00d4ff", Icon: Wind    },
          { value: "4+",      label: "sensors live",    sub: "T · H · CO · CO₂",     color: "#7c3aed", Icon: Gauge   },
        ].map(({ value, label, sub, color, Icon }) => (
          <div
            key={label}
            className="flex items-center gap-3 px-5 py-3 rounded-xl"
            style={{ background: color + "0a", border: `1px solid ${color}20` }}
          >
            <Icon size={16} style={{ color }} />
            <div>
              <span className="font-mono font-bold text-white text-base" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                {value}
              </span>
              <span className="text-white/50 text-sm ml-1.5" style={{ fontFamily: "var(--font-inter)" }}>{label}</span>
              <p className="text-[10px] text-white/22 mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>{sub}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.5 }}
        className="relative z-10 flex flex-wrap gap-3 justify-center"
      >
        <a
          href="#dashboard"
          className="btn-shimmer flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-black cursor-pointer transition-all duration-200 hover:scale-[1.02]"
          style={{ background: "linear-gradient(135deg,#00ff88,#00d4ff)", fontFamily: "var(--font-inter)" }}
        >
          <Gauge size={15} /> View Live Dashboard
        </a>
        <Link
          href="/stations"
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-white/5 border border-white/12 hover:bg-white/8 hover:border-white/20 transition-all duration-200 cursor-pointer"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Stations <ArrowRight size={14} />
        </Link>
        <a
          href="#science"
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white/55 border border-white/8 hover:text-white/80 hover:border-white/18 transition-all duration-200 cursor-pointer"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          <FlaskConical size={14} /> Scientific Basis
        </a>
      </motion.div>

      {/* Live sensor cards — only when actually live */}
      {dataState === "live" && sensorData && (
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 w-full max-w-2xl"
        >
          {[
            { label: "Temperature", value: sensorData.temperature != null ? `${sensorData.temperature.toFixed(1)}°C` : "—", color: "#f97316" },
            { label: "CO₂",         value: sensorData.co2_ppm != null ? `${sensorData.co2_ppm.toFixed(0)} ppm` : "—",       color: "#00d4ff" },
            { label: "Humidity",    value: sensorData.humidity != null ? `${sensorData.humidity.toFixed(0)}%` : "—",         color: "#00d4ff" },
            { label: "AQI Score",   value: aqi ? `${aqi.score}/100` : "—",                                                   color: aqi?.color.replace("text-[","").replace("]","") ?? "#00ff88" },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-card rounded-xl p-4 text-center">
              <p className="text-[10px] text-white/30 mb-1 uppercase tracking-wider" style={{ fontFamily: "var(--font-inter)" }}>{label}</p>
              <p className="font-mono text-xl font-bold" style={{ fontFamily: "var(--font-jetbrains-mono)", color }}>{value}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Pilot note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="relative z-10 mt-6 text-xs text-white/18 text-center"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        Prototype · Pilot stage · Infomatrix 2025
      </motion.p>

      {/* Scroll hint */}
      <motion.a
        href="#what-is"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/20 hover:text-white/50 transition-colors cursor-pointer z-10"
        aria-label="Scroll down"
      >
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <ChevronDown size={22} />
        </motion.div>
      </motion.a>
    </section>
  );
}
