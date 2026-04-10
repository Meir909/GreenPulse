import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Thermometer, Droplets, Wind, FlaskConical, Activity, Maximize2, Minimize2, Leaf } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area } from "recharts";
import { useSensorSocket } from "@/hooks/useSensorSocket";
import { calculateAQI } from "@/lib/aqi";

function photoEfficiency(temp: number): number {
  if (temp >= 40 || temp < 0) return 0;
  if (temp < 10)  return 0.02;
  if (temp < 15)  return 0.15;
  if (temp < 20)  return 0.45;
  if (temp <= 30) return 1.0;
  if (temp <= 35) return 0.5;
  return 0.1;
}

function algaeStatus(temp: number): { label: string; color: string } {
  if (temp >= 40 || temp < 0) return { label: "Критично", color: "#ef4444" };
  if (temp < 10)  return { label: "Қауіп зона",  color: "#f97316" };
  if (temp < 20)  return { label: "Баяу режим",  color: "#eab308" };
  if (temp <= 30) return { label: "Оптималды",   color: "#00ff88" };
  if (temp <= 35) return { label: "Стресс",      color: "#f97316" };
  return           { label: "Өте қауіпті",      color: "#ef4444" };
}

const BASE_CO2 = 430;

const DashboardSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [fullscreen, setFullscreen] = useState(false);

  const { sensorData, connected, offline, loading } = useSensorSocket();

  const [simCo2, setSimCo2] = useState(BASE_CO2);
  const [simPh, setSimPh]   = useState(7.0);
  const [co2History, setCo2History] = useState<{ t: string; v: number }[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFullscreen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!sensorData?.temperature) return;
    const interval = setInterval(() => {
      const temp = sensorData.temperature!;
      const eff = photoEfficiency(temp);
      setSimCo2(prev => {
        const next = prev - eff * 1.5 + (Math.random() - 0.5) * 2;
        return parseFloat(Math.max(380, Math.min(450, next + (BASE_CO2 - next) * 0.01)).toFixed(1));
      });
      setSimPh(prev => {
        const next = prev + eff * 0.005 + (Math.random() - 0.5) * 0.02;
        return parseFloat(Math.max(6.5, Math.min(7.8, next - (next - 7.0) * 0.005)).toFixed(2));
      });
      setCo2History(prev => {
        const now = new Date();
        const label = `${now.getHours()}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`;
        return [...prev, { t: label, v: parseFloat(simCo2.toFixed(1)) }].slice(-20);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [sensorData?.temperature, simCo2]);

  const temp     = sensorData?.temperature ?? null;
  const humidity = sensorData?.humidity    ?? null;
  const co2      = sensorData?.co2_ppm     ?? simCo2;
  const coPpm    = sensorData?.co_ppm      ?? null;
  const ph       = sensorData?.ph          ?? simPh;
  const eff      = temp != null ? Math.round(photoEfficiency(temp) * 100) : 0;
  const algae    = temp != null ? algaeStatus(temp) : null;
  const aqi      = calculateAQI(coPpm, co2, temp);

  const coColor  = !coPpm ? "#6b7280" : coPpm > 200 ? "#ef4444" : coPpm > 50 ? "#f97316" : "#00ff88";

  const sectionClass = fullscreen
    ? "fixed inset-0 z-40 bg-[#050a0e] overflow-y-auto py-8 px-4"
    : "relative py-24 px-4";

  return (
    <section id="dashboard" className={sectionClass} ref={ref}>
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <p className="text-xs uppercase tracking-widest text-[#00ff88] mb-2 font-mono-data">Live Monitor</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
              Нақты уақыт{" "}
              <span className="bg-gradient-to-r from-[#00ff88] to-[#00d4ff] bg-clip-text text-transparent">
                мониторингі
              </span>
            </h2>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-end">
            {/* AQI badge */}
            <span className={`text-xs px-3 py-1.5 rounded-full border font-mono-data font-semibold ${aqi.bgColor} ${aqi.color}`}>
              {aqi.emoji} AQI {aqi.score} — {aqi.label}
            </span>
            {/* WS status */}
            <span className="flex items-center gap-1.5 text-xs font-mono-data text-white/50">
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-[#00ff88] animate-pulse" : offline ? "bg-red-500" : "bg-yellow-400 animate-pulse"}`} />
              {connected ? "WS Live" : offline ? "Офлайн" : "..."}
            </span>
            {/* Fullscreen button */}
            <button
              onClick={() => setFullscreen(f => !f)}
              className="p-1.5 rounded-lg glass-card text-white/40 hover:text-[#00ff88] transition-colors"
              title={fullscreen ? "Выйти (Esc)" : "Полный экран"}
            >
              {fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>
        </motion.div>

        {loading ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Activity size={40} className="mx-auto text-[#00ff88] animate-pulse mb-4" />
            <p className="text-white/50 font-body">Загрузка данных...</p>
          </div>
        ) : offline ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Activity size={40} className="mx-auto text-white/20 mb-4" />
            <p className="text-white/50 font-body">ESP32 офлайн — нет данных</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-auto md:grid-rows-3 gap-4">

            {/* Temp — tall card, row-span-2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-5 md:row-span-2 flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <Thermometer size={18} className="text-[#f97316]" />
                <span className="text-xs font-mono-data text-white/30">ESP32</span>
              </div>
              <p className="text-xs text-white/40 mb-1">Температура</p>
              <p className="font-mono-data text-5xl font-bold text-[#f97316] transition-all duration-700 mb-1">
                {temp != null ? temp.toFixed(1) : "—"}
              </p>
              <p className="text-xs text-white/30 mb-4">°C · норма 20–30°C</p>
              {temp != null && (
                <>
                  <div className="flex-1 flex flex-col justify-end">
                    <div className="w-full bg-white/5 rounded-full h-1.5 mb-2">
                      <div
                        className="h-1.5 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, (temp / 40) * 100)}%`, background: "#f97316" }}
                      />
                    </div>
                    {algae && (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: algae.color }} />
                        <span className="text-xs" style={{ color: algae.color }}>{algae.label}</span>
                      </div>
                    )}
                    <p className="text-xs text-white/25 mt-2">Фотосинтез: {eff}%</p>
                    <div className="w-full bg-white/5 rounded-full h-1 mt-1">
                      <div className="h-1 rounded-full transition-all duration-700" style={{ width: `${eff}%`, background: algae?.color }} />
                    </div>
                  </div>
                </>
              )}
            </motion.div>

            {/* CO₂ chart — wide, col-span-2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-5 col-span-2 md:col-span-2"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Leaf size={16} className="text-[#00ff88]" />
                  <span className="text-xs text-white/40">CO₂ (ppm)</span>
                </div>
                <span className="text-xs font-mono-data text-white/30">{sensorData?.co2_ppm ? "ESP32" : "Симуляция"}</span>
              </div>
              <p className="font-mono-data text-3xl font-bold text-[#00ff88] mb-3 transition-all duration-700">
                {co2.toFixed(1)}
              </p>
              {co2History.length > 1 ? (
                <ResponsiveContainer width="100%" height={90}>
                  <AreaChart data={co2History}>
                    <defs>
                      <linearGradient id="co2G" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00ff88" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="t" hide />
                    <YAxis domain={[375, 455]} hide />
                    <Tooltip
                      contentStyle={{ background: "#050a0e", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 8, fontSize: 11 }}
                    />
                    <Area type="monotone" dataKey="v" stroke="#00ff88" strokeWidth={2} fill="url(#co2G)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[90px] flex items-center justify-center text-xs text-white/25">
                  Ожидание данных...
                </div>
              )}
              <p className="text-xs text-white/25 mt-1">норма 400–450 ppm</p>
            </motion.div>

            {/* Humidity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl p-5 flex flex-col gap-2"
            >
              <Droplets size={16} className="text-[#00d4ff]" />
              <p className="text-xs text-white/40">Ылғалдылық</p>
              <p className="font-mono-data text-3xl font-bold text-[#00d4ff] transition-all duration-700">
                {humidity != null ? `${humidity.toFixed(0)}%` : "—"}
              </p>
              {humidity != null && (
                <div className="w-full bg-white/5 rounded-full h-1">
                  <div className="h-1 rounded-full bg-[#00d4ff] transition-all duration-700" style={{ width: `${Math.min(100, humidity)}%` }} />
                </div>
              )}
              <p className="text-xs text-white/25">норма 60–80%</p>
            </motion.div>

            {/* CO (MQ-7) — wide second row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.35 }}
              className="glass-card rounded-2xl p-5 col-span-2 md:col-span-2 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <Wind size={16} style={{ color: coColor }} />
                <span className="text-xs font-mono-data px-2 py-0.5 rounded-full"
                  style={{ color: coColor, background: `${coColor}18`, border: `1px solid ${coColor}40` }}
                >
                  {!coPpm ? "—" : coPpm > 200 ? "Критично" : coPpm > 50 ? "Повышен" : "Норма"}
                </span>
              </div>
              <p className="text-xs text-white/40">CO угарный газ (MQ-7)</p>
              <p className="font-mono-data text-4xl font-bold transition-all duration-700" style={{ color: coColor }}>
                {coPpm != null ? `${coPpm.toFixed(0)} ppm` : "—"}
              </p>
              {coPpm != null && (
                <div className="w-full bg-white/5 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, (coPpm / 200) * 100)}%`, background: coColor }}
                  />
                </div>
              )}
              <p className="text-xs text-white/25">норма &lt; 50 ppm · опасно &gt; 200 ppm</p>
            </motion.div>

            {/* pH gauge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.4 }}
              className="glass-card rounded-2xl p-5 flex flex-col gap-2"
            >
              <FlaskConical size={16} className="text-[#00ff88]" />
              <p className="text-xs text-white/40">pH деңгейі</p>
              <p className="font-mono-data text-3xl font-bold text-[#00ff88] transition-all duration-700">
                {ph.toFixed(2)}
              </p>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div
                  className="h-1 rounded-full bg-[#00ff88] transition-all duration-700"
                  style={{ width: `${Math.min(100, ((ph - 6.5) / (8.0 - 6.5)) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-white/25">норма 6.5–7.5</p>
            </motion.div>

          </div>
        )}
      </div>
    </section>
  );
};

export default DashboardSection;
