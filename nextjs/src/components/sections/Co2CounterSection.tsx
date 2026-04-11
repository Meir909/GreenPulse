"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect } from "react";
import { animate, useMotionValue, useSpring } from "framer-motion";
import { Leaf, TreePine, Gauge, AlertTriangle, Info } from "lucide-react";
import { useSensorSocket } from "@/hooks/useSensorSocket";
import { CO2_MODEL, photoEfficiency, getDataState, DATA_STATE_LABEL, DATA_STATE_COLOR } from "@/lib/dataTypes";

function AnimatedNumber({ target, decimals = 0 }: { target: number; decimals?: number }) {
  const ref      = useRef<HTMLSpanElement>(null);
  const motionVal = useMotionValue(0);
  const spring   = useSpring(motionVal, { stiffness: 80, damping: 22 });

  useEffect(() => {
    const controls = animate(motionVal, target, { duration: 2.5, ease: "easeOut" });
    return controls.stop;
  }, [target, motionVal]);

  useEffect(() => {
    return spring.on("change", (v) => {
      if (ref.current) ref.current.textContent = v.toFixed(decimals);
    });
  }, [spring, decimals]);

  return <span ref={ref}>0</span>;
}

export default function Co2CounterSection() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const { sensorData, connected, offline, loading, lastUpdate } = useSensorSocket();
  const dataState = getDataState(connected, offline, loading, lastUpdate);
  const isLive    = dataState === "live";

  // Use real temperature only when live; otherwise 0 efficiency (don't pretend)
  const efficiency   = isLive ? photoEfficiency(sensorData?.temperature) : 0;
  const co2PerYear   = +(CO2_MODEL.maxKgPerYear * efficiency).toFixed(1);
  const treesEquiv   = isLive ? Math.round(co2PerYear / 2.5) : 0;
  const pctEfficiency = Math.round(efficiency * 100);

  const stateLabel = DATA_STATE_LABEL[dataState];
  const stateColor = DATA_STATE_COLOR[dataState];

  return (
    <section id="co2" className="relative py-28 px-4" ref={ref}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent via-[rgba(0,255,136,0.2)] to-transparent" />

      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-widest text-[#00ff88] mb-3" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
            Экологиялық импакт
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            1 орындық ≈{" "}
            <span className="gradient-green">15 ағаш</span>
          </h2>
          <p className="text-white/35 text-sm mt-3" style={{ fontFamily: "var(--font-inter)" }}>
            Зертхана базасы: {CO2_MODEL.source}
          </p>

          {/* Data state badge */}
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-white/8"
            style={{ background: "rgba(255,255,255,0.03)", fontFamily: "var(--font-jetbrains-mono)" }}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-[#00ff88] animate-pulse" : "bg-white/20"}`} />
            <span className={stateColor}>{stateLabel}</span>
            {isLive && sensorData?.temperature != null && (
              <span className="text-white/30 ml-1">· {sensorData.temperature.toFixed(1)}°C → {pctEfficiency}% eff.</span>
            )}
          </div>
        </motion.div>

        {/* Offline notice */}
        {!isLive && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="mb-8 rounded-2xl p-4 flex gap-3 items-start"
            style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.18)" }}
          >
            <AlertTriangle size={14} className="text-[#f97316] mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-[#f97316] mb-0.5" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                ESP32 офлайн — нақты деректер жоқ
              </p>
              <p className="text-xs text-white/35 leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>
                CO₂ сіңіру тек ESP32-ден температура алынғанда ғана есептеледі.
                Нақты температурасыз тиімділік есептелмейді.
                Литература бойынша теориялық максимум: {CO2_MODEL.maxKgPerYear} кг/жыл ({CO2_MODEL.accuracy}).
              </p>
            </div>
          </motion.div>
        )}

        {/* Counter cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-16">
          {[
            {
              Icon: Leaf,
              color: "#00ff88",
              label: "CO₂ сіңіру / жыл",
              value: isLive ? co2PerYear : CO2_MODEL.maxKgPerYear,
              unit: " кг",
              subLabel: isLive ? `температура: ${sensorData?.temperature?.toFixed(1)}°C` : `теориялық макс. · ${CO2_MODEL.accuracy}`,
              dim: !isLive,
            },
            {
              Icon: TreePine,
              color: "#00d4ff",
              label: "Балама ағаш саны",
              value: isLive ? treesEquiv : CO2_MODEL.treeEquivalent,
              unit: " ағаш",
              subLabel: isLive ? "нақты темп. бойынша" : "теориялық · 2.5 кг/ағаш/жыл",
              dim: !isLive,
            },
            {
              Icon: Gauge,
              color: "#7c3aed",
              label: "Тиімділік",
              value: isLive ? pctEfficiency : 0,
              unit: "%",
              subLabel: isLive ? "фотосинтездік тиімділік" : "ESP32 байланысы жоқ",
              dim: !isLive,
            },
          ].map(({ Icon, color, label, value, unit, subLabel, dim }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.12 }}
              className="glass-card rounded-2xl p-7 text-center"
              style={{ opacity: dim ? 0.5 : 1 }}
            >
              <div
                className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                style={{ background: color + "14", border: `1px solid ${color}28` }}
              >
                <Icon size={24} style={{ color: dim ? "rgba(255,255,255,0.2)" : color }} />
              </div>
              <p className="text-xs text-white/30 mb-2" style={{ fontFamily: "var(--font-inter)" }}>{label}</p>
              <p className="font-mono text-5xl font-bold" style={{ fontFamily: "var(--font-jetbrains-mono)", color: dim ? "rgba(255,255,255,0.18)" : color }}>
                {inView ? <AnimatedNumber target={value} /> : "0"}
                <span className="text-2xl ml-1">{unit}</span>
              </p>
              <p className="text-[10px] text-white/22 mt-2" style={{ fontFamily: "var(--font-inter)" }}>{subLabel}</p>
            </motion.div>
          ))}
        </div>

        {/* Comparison bars */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.65, delay: 0.5 }}
          className="glass-card rounded-2xl p-8"
        >
          <p className="text-xs uppercase tracking-widest text-white/25 mb-6 text-center" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
            Сіңіру мүмкіндігі — теориялық салыстыру
          </p>
          <div className="space-y-4">
            {[
              { label: "GreenPulse орындық",  kg: 38,  color: "#00ff88", pct: 100 },
              { label: "Кәдімгі ағаш (бір)",  kg: 2.5, color: "#00d4ff", pct: 7   },
              { label: "Шалғын (1 м²/жыл)",   kg: 0.6, color: "#7c3aed", pct: 2   },
            ].map(({ label, kg, color, pct }) => (
              <div key={label}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-white/50" style={{ fontFamily: "var(--font-inter)" }}>{label}</span>
                  <span className="font-mono text-sm font-bold" style={{ fontFamily: "var(--font-jetbrains-mono)", color }}>
                    {kg} кг/жыл
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={inView ? { width: `${pct}%` } : {}}
                    transition={{ duration: 1.4, delay: 0.6 }}
                    className="h-full rounded-full"
                    style={{ background: color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Methodology note */}
          <div
            className="mt-6 pt-5 border-t border-white/5 flex gap-3"
          >
            <Info size={12} className="text-white/20 shrink-0 mt-0.5" />
            <p className="text-[10px] text-white/28 leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>
              <strong className="text-white/45">Методология:</strong>{" "}
              Деректер {CO2_MODEL.source} негізінде. Нақты сіңіру культура тығыздығына, жарық қарқынына,
              CO₂ градиентіне байланысты өзгереді. Дәлдік: {CO2_MODEL.accuracy}.{" "}
              {CO2_MODEL.confidence}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
