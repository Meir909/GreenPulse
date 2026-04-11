"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Thermometer, Droplets, Wind, FlaskConical, Activity, Maximize2, Minimize2, Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useSensorSocket } from "@/hooks/useSensorSocket";
import { calculateAQI } from "@/lib/aqi";

const MOCK_HISTORY = Array.from({ length: 20 }, (_, i) => ({
  t: `${String(Math.floor(i * 3)).padStart(2,"0")}:00`,
  co2: 420 + Math.round(Math.sin(i / 3) * 40 + Math.random() * 20),
}));

function photoEfficiency(co2?: number | null) {
  if (co2 == null) return null;
  if (co2 > 1200) return { label: "Optimal", color: "#00ff88" };
  if (co2 > 600)  return { label: "Good",    color: "#00d4ff" };
  return               { label: "Low",     color: "#f97316" };
}

export default function DashboardSection() {
  const ref        = useRef(null);
  const inView     = useInView(ref, { once: true, margin: "-80px" });
  const [full, setFull] = useState(false);
  const { sensorData, connected, offline, loading } = useSensorSocket();

  const aqi       = sensorData ? calculateAQI(sensorData.co_ppm, sensorData.co2_ppm, sensorData.temperature) : null;
  const photoEff  = photoEfficiency(sensorData?.co2_ppm);
  const algaeOk   = sensorData?.ph != null && sensorData.ph >= 6.5 && sensorData.ph <= 8.5;

  const val = (v: number | undefined | null, dec = 1) =>
    v != null ? v.toFixed(dec) : "—";

  return (
    <section id="dashboard" className={`relative py-28 px-4 ${full ? "fixed inset-0 z-40 bg-[#020a05] overflow-auto py-8" : ""}`} ref={ref}>
      <div className={`mx-auto ${full ? "max-w-full px-4" : "max-w-6xl container"}`}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <p className="text-xs uppercase tracking-widest text-[#00ff88] mb-2" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
              Нақты уақыт
            </p>
            <h2
              className="font-display text-4xl md:text-5xl font-bold text-white"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Мониторинг{" "}
              <span className="gradient-green">панелі</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border ${
              connected
                ? "text-[#00ff88] border-[rgba(0,255,136,0.22)] bg-[rgba(0,255,136,0.06)]"
                : "text-white/30 border-white/10 bg-white/3"
            }`} style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
              {connected ? <Wifi size={11} /> : <WifiOff size={11} />}
              {connected ? "Live" : offline ? "Offline" : "..."}
            </div>
            <button
              onClick={() => setFull(v => !v)}
              className="p-2 rounded-lg text-white/30 hover:text-white border border-white/8 hover:border-white/20 transition-all cursor-pointer"
              aria-label={full ? "Exit fullscreen" : "Fullscreen"}
            >
              {full ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
        </motion.div>

        {/* Offline notice */}
        {!connected && !loading && (
          <div
            className="mb-6 rounded-2xl p-4 flex gap-3 items-start"
            style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.18)" }}
          >
            <AlertTriangle size={14} className="text-[#f97316] mt-0.5 shrink-0" />
            <p className="text-xs text-white/40 leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>
              <strong className="text-[#f97316]">ESP32 офлайн.</strong>{" "}
              Сенсорлардан нақты деректер жоқ — барлық мәндер «—» күйінде. CO₂ графигі — демонстрациялық (demo history).
            </p>
          </div>
        )}

        {/* Bento grid */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="grid grid-cols-4 grid-rows-3 gap-3 auto-rows-[140px]"
        >
          {/* Temperature — col 1, row span 2 */}
          <div className="glass-card rounded-2xl p-5 col-span-1 row-span-2 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs text-white/30" style={{ fontFamily: "var(--font-inter)" }}>
              <Thermometer size={13} className="text-[#f97316]" /> Температура
            </div>
            <div>
              <p className="font-mono text-5xl font-bold text-white" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                {val(sensorData?.temperature)}
              </p>
              <p className="text-sm text-white/30 mt-1">°C</p>
            </div>
            <div className="h-1 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: sensorData?.temperature != null ? `${Math.min((sensorData.temperature / 50) * 100, 100)}%` : "0%",
                  background: "linear-gradient(90deg,#00ff88,#f97316)",
                }}
              />
            </div>
          </div>

          {/* CO₂ chart — col 2-3, row 1 */}
          <div className="glass-card rounded-2xl p-5 col-span-2 row-span-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs text-white/30" style={{ fontFamily: "var(--font-inter)" }}>
                <Wind size={12} className="text-[#00d4ff]" /> CO₂ (ppm)
                {!connected && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono text-[#f97316]" style={{ background: "rgba(249,115,22,0.1)", fontFamily: "var(--font-jetbrains-mono)" }}>
                    DEMO
                  </span>
                )}
              </div>
              <span
                className="font-mono text-lg font-bold"
                style={{ fontFamily: "var(--font-jetbrains-mono)", color: "#00d4ff" }}
              >
                {val(sensorData?.co2_ppm, 0)}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={65}>
              <AreaChart data={MOCK_HISTORY} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                <defs>
                  <linearGradient id="co2g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.2)" }} interval={4} />
                <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.2)" }} />
                <Tooltip
                  contentStyle={{ background: "#111827", border: "1px solid rgba(0,255,136,0.15)", borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: "rgba(255,255,255,0.4)" }}
                  itemStyle={{ color: "#00d4ff" }}
                />
                <Area type="monotone" dataKey="co2" stroke="#00d4ff" strokeWidth={1.5} fill="url(#co2g)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* AQI — col 4, row 1 */}
          <div className={`glass-card rounded-2xl p-5 col-span-1 row-span-1 flex flex-col justify-between ${aqi?.bgColor ?? ""}`}>
            <div className="flex items-center gap-2 text-xs text-white/30" style={{ fontFamily: "var(--font-inter)" }}>
              <Activity size={12} /> AQI
            </div>
            <div>
              <p className={`font-mono text-3xl font-bold ${aqi?.color ?? "text-white/40"}`} style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                {aqi?.score ?? "—"}
              </p>
              <p className={`text-xs mt-0.5 ${aqi?.color ?? "text-white/25"}`} style={{ fontFamily: "var(--font-inter)" }}>
                {aqi?.label ?? "Нет данных"}
              </p>
            </div>
          </div>

          {/* Humidity — col 2, row 2 */}
          <div className="glass-card rounded-2xl p-5 col-span-1 row-span-1">
            <div className="flex items-center gap-2 text-xs text-white/30 mb-2" style={{ fontFamily: "var(--font-inter)" }}>
              <Droplets size={12} className="text-[#00d4ff]" /> Ылғалдылық
            </div>
            <p className="font-mono text-3xl font-bold text-white" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
              {val(sensorData?.humidity)}
              <span className="text-sm text-white/30 ml-1">%</span>
            </p>
          </div>

          {/* CO — col 3, row 2 */}
          <div className="glass-card rounded-2xl p-5 col-span-1 row-span-1">
            <div className="flex items-center gap-2 text-xs text-white/30 mb-2" style={{ fontFamily: "var(--font-inter)" }}>
              <Wind size={12} className="text-[#f97316]" /> CO (ppm)
            </div>
            <p className="font-mono text-3xl font-bold text-white" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
              {val(sensorData?.co_ppm)}
            </p>
          </div>

          {/* pH — col 4, row 2 */}
          <div className="glass-card rounded-2xl p-5 col-span-1 row-span-1">
            <div className="flex items-center gap-2 text-xs text-white/30 mb-2" style={{ fontFamily: "var(--font-inter)" }}>
              <FlaskConical size={12} className="text-[#7c3aed]" /> pH
            </div>
            <p
              className="font-mono text-3xl font-bold"
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                color: sensorData?.ph != null ? (algaeOk ? "#00ff88" : "#ef4444") : "rgba(255,255,255,0.4)",
              }}
            >
              {val(sensorData?.ph)}
            </p>
          </div>

          {/* Photo efficiency — col 1-2, row 3 */}
          <div className="glass-card rounded-2xl p-5 col-span-2 row-span-1 flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: (photoEff?.color ?? "#00ff88") + "15", border: `1px solid ${photoEff?.color ?? "#00ff88"}28` }}
            >
              <Activity size={20} style={{ color: photoEff?.color ?? "#00ff88" }} />
            </div>
            <div>
              <p className="text-xs text-white/28 mb-1" style={{ fontFamily: "var(--font-inter)" }}>Фотосинтез тиімділігі</p>
              <p
                className="font-mono font-bold text-lg"
                style={{ fontFamily: "var(--font-jetbrains-mono)", color: photoEff?.color ?? "rgba(255,255,255,0.3)" }}
              >
                {photoEff?.label ?? "No data"}
              </p>
            </div>
          </div>

          {/* Algae status + station — col 3-4, row 3 */}
          <div className="glass-card rounded-2xl p-5 col-span-2 row-span-1 flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: algaeOk ? "rgba(0,255,136,0.10)" : "rgba(239,68,68,0.10)", border: `1px solid ${algaeOk ? "rgba(0,255,136,0.22)" : "rgba(239,68,68,0.22)"}` }}
            >
              <FlaskConical size={20} style={{ color: algaeOk ? "#00ff88" : "#ef4444" }} />
            </div>
            <div>
              <p className="text-xs text-white/28 mb-1" style={{ fontFamily: "var(--font-inter)" }}>Балдыр күйі</p>
              <p
                className="font-mono font-bold text-lg"
                style={{ fontFamily: "var(--font-jetbrains-mono)", color: sensorData?.ph != null ? (algaeOk ? "#00ff88" : "#ef4444") : "rgba(255,255,255,0.3)" }}
              >
                {sensorData?.ph != null ? (algaeOk ? "Норма" : "Тексеру қажет") : "—"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
