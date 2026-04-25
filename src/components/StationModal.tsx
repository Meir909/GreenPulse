import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader, MapPin } from "lucide-react";

interface Station {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  temperature: number;
  temp_inside?: number;
  humidity: number;
  co2_ppm: number;
  air_quality_index?: number;
  ph: number;
  light_intensity: number;
  status: "active" | "inactive";
}

interface StationModalProps {
  station: Station | null;
  isOpen: boolean;
  onClose: () => void;
}

const airQualityLabel = (aqi?: number) => {
  if (!aqi) return { label: "—", color: "text-gray-400" };
  if (aqi <= 50)  return { label: "Өте жақсы", color: "text-green-400" };
  if (aqi <= 100) return { label: "Жақсы",     color: "text-lime-400" };
  if (aqi <= 150) return { label: "Орташа",    color: "text-yellow-400" };
  if (aqi <= 200) return { label: "Нашар",     color: "text-orange-400" };
  return             { label: "Қауіпті",   color: "text-red-400" };
};

const StationModal = ({ station, isOpen, onClose }: StationModalProps) => {
  const [activeTab, setActiveTab] = useState<"analysis" | "prediction" | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!station) return null;

  const aqiInfo = airQualityLabel(station.air_quality_index);

  const handleAnalyze = async () => {
    setActiveTab("analysis");
    setResult(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai-analyze-sensors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temperature: station.temperature,
          temp_inside: station.temp_inside,
          humidity: station.humidity,
          co2_ppm: station.co2_ppm,
          air_quality_index: station.air_quality_index,
          ph: station.ph,
          light_intensity: station.light_intensity,
          latitude: station.latitude,
          longitude: station.longitude,
        }),
      });
      const data = await res.json();
      setResult(data.analysis || "Анализ алу мүмкін болмады.");
    } catch {
      setResult("Сервермен байланыс қатесі. Қосылымды тексеріңіз.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePredict = async () => {
    setActiveTab("prediction");
    setResult(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai-predict-growth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temperature: station.temperature,
          temp_inside: station.temp_inside,
          humidity: station.humidity,
          co2_ppm: station.co2_ppm,
          air_quality_index: station.air_quality_index,
          ph: station.ph,
          light_intensity: station.light_intensity,
        }),
      });
      const data = await res.json();
      setResult(data.prediction || "Болжам алу мүмкін болмады.");
    } catch {
      setResult("Сервермен байланыс қатесі. Қосылымды тексеріңіз.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setActiveTab(null);
    setResult(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 22, stiffness: 300 }}
            className="fixed inset-0 z-[2001] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto bg-black/95 border border-cyan-500/30 rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-cyan-900/80 to-green-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-cyan-500/30 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_8px_#00ff88] animate-pulse" />
                  <div>
                    <h2 className="text-lg font-bold text-white">{station.name}</h2>
                    <p className="text-xs text-cyan-300 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {station.latitude?.toFixed(4)}N, {station.longitude?.toFixed(4)}E
                    </p>
                  </div>
                </div>
                <button onClick={handleClose} className="text-gray-400 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400 text-sm font-medium">Белсенді</span>
                  <span className="ml-auto text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">ESP32 WiFi</span>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Температура</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-orange-500/10 to-transparent rounded-xl p-4 border border-orange-500/20">
                      <p className="text-xs text-orange-300 mb-1">Сыртқы (DHT22)</p>
                      <p className="text-2xl font-bold text-orange-200 font-mono">{station.temperature}C</p>
                      <p className="text-xs text-gray-500 mt-1">Оптимум: 20-25C</p>
                    </div>
                    <div className="bg-gradient-to-br from-red-500/10 to-transparent rounded-xl p-4 border border-red-500/20">
                      <p className="text-xs text-red-300 mb-1">Ішкі (DS18B20)</p>
                      <p className="text-2xl font-bold text-red-200 font-mono">
                        {station.temp_inside != null ? station.temp_inside + "C" : "net"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">3D модель ішінде</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Датчиктер</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-cyan-500/10 to-transparent rounded-xl p-4 border border-cyan-500/20">
                      <p className="text-xs text-cyan-400 mb-1">Ылғалдылық</p>
                      <p className="text-2xl font-bold text-cyan-300 font-mono">{station.humidity}%</p>
                      <p className="text-xs text-gray-500 mt-1">Оптимум: 60-80%</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl p-4 border border-purple-500/20">
                      <p className="text-xs text-purple-400 mb-1">pH</p>
                      <p className="text-2xl font-bold text-purple-300 font-mono">{station.ph?.toFixed(1) ?? "net"}</p>
                      <p className="text-xs text-gray-500 mt-1">Оптимум: 6.5-7.5</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/10 to-transparent rounded-xl p-4 border border-green-500/20">
                      <p className="text-xs text-green-400 mb-1">CO2 (MQ135)</p>
                      <p className="text-2xl font-bold text-green-300 font-mono">{station.co2_ppm} ppm</p>
                      <p className="text-xs text-gray-500 mt-1">Норма: 1000 ppm</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-500/10 to-transparent rounded-xl p-4 border border-yellow-500/20">
                      <p className="text-xs text-yellow-400 mb-1">Жарық</p>
                      <p className="text-2xl font-bold text-yellow-300 font-mono">{station.light_intensity} лк</p>
                      <p className="text-xs text-gray-500 mt-1">Оптимум: 400-600</p>
                    </div>
                  </div>
                </div>

                {station.air_quality_index != null && (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Ауа сапасы (MQ135 AQI)</p>
                      <span className={"text-sm font-bold " + aqiInfo.color}>{aqiInfo.label}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: Math.min(100, (station.air_quality_index / 300) * 100) + "%",
                          background: station.air_quality_index <= 50 ? "#00ff88"
                            : station.air_quality_index <= 100 ? "#b5ff3d"
                            : station.air_quality_index <= 150 ? "#ffe03d" : "#ff4d6d"
                        }}
                      />
                    </div>
                    <p className="text-right text-xs font-mono mt-1 text-gray-500">{station.air_quality_index} / 300</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-lg p-3 border border-cyan-500/20">
                    <p className="text-xs text-gray-400 mb-1">Ендік</p>
                    <p className="text-white font-mono text-sm">{station.latitude?.toFixed(4) ?? "net"}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-cyan-500/20">
                    <p className="text-xs text-gray-400 mb-1">Бойлық</p>
                    <p className="text-white font-mono text-sm">{station.longitude?.toFixed(4) ?? "net"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className={"py-3 px-4 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 " + (
                      activeTab === "analysis"
                        ? "bg-cyan-600 text-white border border-cyan-400"
                        : "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20"
                    )}
                  >
                    AI Анализ
                  </button>
                  <button
                    onClick={handlePredict}
                    disabled={isLoading}
                    className={"py-3 px-4 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 " + (
                      activeTab === "prediction"
                        ? "bg-green-600 text-white border border-green-400"
                        : "bg-green-500/10 text-green-300 border border-green-500/30 hover:bg-green-500/20"
                    )}
                  >
                    AI Болжам
                  </button>
                </div>

                <AnimatePresence>
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-3 py-3 px-4 rounded-xl bg-white/5 border border-cyan-500/20 text-gray-400"
                    >
                      <Loader className="w-4 h-4 animate-spin text-cyan-400 shrink-0" />
                      <span className="text-sm">o4-mini деректерді талдап жатыр...</span>
                    </motion.div>
                  )}
                  {!isLoading && result && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={"rounded-xl border overflow-hidden " + (activeTab === "analysis" ? "border-cyan-500/30" : "border-green-500/30")}
                    >
                      <div className={"px-4 py-2 text-xs font-bold " + (activeTab === "analysis" ? "bg-cyan-500/15 text-cyan-300" : "bg-green-500/15 text-green-300")}>
                        {activeTab === "analysis" ? "AI Анализ (o4-mini)" : "AI Болжам (o4-mini)"}
                      </div>
                      <div className="bg-black/40 divide-y divide-white/5">
                        {result.split("\n").filter(l => l.trim()).map((line, i) => (
                          <div key={i} className="px-4 py-2 text-sm text-gray-200 leading-snug">{line}</div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default StationModal;
