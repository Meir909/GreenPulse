import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface SensorData {
  temperature: number;
  humidity: number;
  co2_ppm: number;
  ph: number;
  light_intensity: number;
  status: "online" | "offline" | "mock";
}

const MOCK: SensorData = {
  temperature: 22.4,
  humidity: 68,
  co2_ppm: 418,
  ph: 7.1,
  light_intensity: 512,
  status: "mock",
};

const sensors = [
  { key: "temperature",     label: "Температура",  unit: "°C",  icon: "🌡️", optimal: "20–25°C",  color: "#ff8a3d" },
  { key: "humidity",        label: "Ылғалдылық",   unit: "%",   icon: "💧", optimal: "60–80%",   color: "#00d4ff" },
  { key: "co2_ppm",         label: "CO₂",          unit: "ppm", icon: "🌱", optimal: "400–450",  color: "#00ff88" },
  { key: "ph",              label: "pH",            unit: "",    icon: "⚗️", optimal: "6.5–7.5",  color: "#b5ff3d" },
  { key: "light_intensity", label: "Жарық",         unit: "lux", icon: "☀️", optimal: "400–600",  color: "#ffe03d" },
];

const DashboardScreen = () => {
  const [data, setData] = useState<SensorData>(MOCK);
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/sensor-data");
        const json = await res.json();
        if (json.status === "online" && json.data) {
          setData({ ...json.data, status: "online" });
        } else {
          setData(MOCK);
        }
      } catch {
        setData(MOCK);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const runAI = async () => {
    setAiLoading(true);
    setAiAnalysis("");
    try {
      const res = await fetch("/api/ai-analyze-sensors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      setAiAnalysis(json.analysis || json.error || "Қате орын алды");
    } catch {
      setAiAnalysis("Сервермен байланыс қатесі");
    } finally {
      setAiLoading(false);
    }
  };

  const greenScore = Math.min(
    100,
    Math.round(
      (data.temperature >= 20 && data.temperature <= 25 ? 20 : 10) +
      (data.humidity >= 60 && data.humidity <= 80 ? 20 : 10) +
      (data.ph >= 6.5 && data.ph <= 7.5 ? 20 : 10) +
      (data.light_intensity >= 400 && data.light_intensity <= 600 ? 20 : 10) +
      (data.co2_ppm <= 450 ? 20 : 10)
    )
  );

  const scoreColor =
    greenScore >= 80 ? "#00ff88" : greenScore >= 60 ? "#ffe03d" : "#ff4d6d";

  return (
    <div className="min-h-screen bg-[#060C06] pb-24 pt-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Дашборд</h1>
          <p className="text-gray-500 text-xs mt-0.5">Нақты уақытты мониторинг</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
          data.status === "online"
            ? "border-green-500/40 text-green-400 bg-green-500/10"
            : data.status === "mock"
            ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
            : "border-gray-500/40 text-gray-400 bg-gray-500/10"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${data.status === "online" ? "bg-green-400 animate-pulse" : "bg-amber-400"}`} />
          {data.status === "online" ? "ESP32 онлайн" : data.status === "mock" ? "Мок деректер" : "Офлайн"}
        </div>
      </div>

      {/* Green Score */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 flex items-center gap-4"
      >
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
            <circle
              cx="32" cy="32" r="26"
              fill="none"
              stroke={scoreColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(greenScore / 100) * 163} 163`}
              style={{ filter: `drop-shadow(0 0 6px ${scoreColor})` }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
            {greenScore}
          </span>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Green Score</p>
          <p className="text-white font-bold text-lg" style={{ color: scoreColor }}>
            {greenScore >= 80 ? "Өте жақсы 🌟" : greenScore >= 60 ? "Жақсы 👍" : "Назар қажет ⚠️"}
          </p>
          <p className="text-gray-500 text-xs">Жалпы жағдай бағасы</p>
        </div>
      </motion.div>

      {/* Sensor cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {sensors.map((s, i) => {
          const val = data[s.key as keyof SensorData];
          return (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{s.icon}</span>
                <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                  {s.optimal}
                </span>
              </div>
              <p
                className="text-2xl font-bold font-mono"
                style={{ color: s.color, textShadow: `0 0 12px ${s.color}60` }}
              >
                {typeof val === "number" ? val.toFixed(val < 10 ? 1 : 0) : val}
                <span className="text-sm font-normal ml-1">{s.unit}</span>
              </p>
              <p className="text-gray-500 text-xs mt-1">{s.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* AI Analysis button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex gap-3 mb-4"
      >
        <button
          onClick={runAI}
          disabled={aiLoading}
          className="flex-1 py-3 rounded-xl font-semibold text-sm text-black bg-gradient-to-r from-cyan-400 to-green-400 disabled:opacity-50 active:scale-95 transition-transform"
        >
          {aiLoading ? "⏳ Талдауда..." : "🤖 AI Анализ"}
        </button>
      </motion.div>

      {/* AI result */}
      {aiAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 text-sm text-gray-300 whitespace-pre-line leading-relaxed"
        >
          {aiAnalysis}
        </motion.div>
      )}
    </div>
  );
};

export default DashboardScreen;
