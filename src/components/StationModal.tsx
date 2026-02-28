import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader, MapPin } from "lucide-react";

interface Station {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  co2_ppm: number;
  ph: number;
  light_intensity: number;
  status: "active" | "inactive";
}

interface StationModalProps {
  station: Station | null;
  isOpen: boolean;
  onClose: () => void;
}

const StationModal = ({ station, isOpen, onClose }: StationModalProps) => {
  const [activeTab, setActiveTab] = useState<"analysis" | "prediction" | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!station) return null;

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
          humidity: station.humidity,
          light_intensity: station.light_intensity,
          co2_ppm: station.co2_ppm,
          latitude: station.latitude,
          longitude: station.longitude,
          satellites: 8,
        }),
      });
      const data = await res.json();
      setResult(data.analysis || "Не удалось получить анализ.");
    } catch {
      setResult("Ошибка соединения с сервером. Проверьте подключение.");
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
          ph: station.ph,
          temperature: station.temperature,
          light_intensity: station.light_intensity,
        }),
      });
      const data = await res.json();
      setResult(data.prediction || "Не удалось получить прогноз.");
    } catch {
      setResult("Ошибка соединения с сервером. Проверьте подключение.");
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
          {/* Оверлей */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000]"
          />

          {/* Модальное окно */}
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
              {/* Шапка */}
              <div className="sticky top-0 bg-gradient-to-r from-cyan-900/80 to-green-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-cyan-500/30 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_8px_#00ff88]" />
                  <div>
                    <h2 className="text-lg font-bold text-white">{station.name}</h2>
                    <p className="text-xs text-cyan-300 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {station.latitude.toFixed(4)}°N, {station.longitude.toFixed(4)}°E
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Статус */}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400 text-sm font-medium">Активна</span>
                </div>

                {/* Координаты */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-lg p-3 border border-cyan-500/20">
                    <p className="text-xs text-gray-400 mb-1">Широта</p>
                    <p className="text-white font-mono text-sm">{station.latitude.toFixed(4)}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-cyan-500/20">
                    <p className="text-xs text-gray-400 mb-1">Долгота</p>
                    <p className="text-white font-mono text-sm">{station.longitude.toFixed(4)}</p>
                  </div>
                </div>

                {/* Параметры */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-cyan-500/10 to-transparent rounded-xl p-4 border border-cyan-500/20">
                    <p className="text-xs text-cyan-400 mb-1">Температура</p>
                    <p className="text-2xl font-bold text-cyan-300">{station.temperature}°C</p>
                    <p className="text-xs text-gray-500 mt-1">Оптимум: 20–25°C</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/10 to-transparent rounded-xl p-4 border border-green-500/20">
                    <p className="text-xs text-green-400 mb-1">Влажность</p>
                    <p className="text-2xl font-bold text-green-300">{station.humidity}%</p>
                    <p className="text-xs text-gray-500 mt-1">Оптимум: 60–80%</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl p-4 border border-purple-500/20">
                    <p className="text-xs text-purple-400 mb-1">pH</p>
                    <p className="text-2xl font-bold text-purple-300">{station.ph.toFixed(1)}</p>
                    <p className="text-xs text-gray-500 mt-1">Оптимум: 6.5–7.5</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-500/10 to-transparent rounded-xl p-4 border border-yellow-500/20">
                    <p className="text-xs text-yellow-400 mb-1">CO2</p>
                    <p className="text-2xl font-bold text-yellow-300">{station.co2_ppm} ppm</p>
                    <p className="text-xs text-gray-500 mt-1">Оптимум: 400–450</p>
                  </div>
                  <div className="col-span-2 bg-gradient-to-br from-orange-500/10 to-transparent rounded-xl p-4 border border-orange-500/20">
                    <p className="text-xs text-orange-400 mb-1">Интенсивность света</p>
                    <p className="text-2xl font-bold text-orange-300">{station.light_intensity} люкс</p>
                    <p className="text-xs text-gray-500 mt-1">Оптимум: 400–600 люкс</p>
                  </div>
                </div>

                {/* Кнопки AI */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                      activeTab === "analysis"
                        ? "bg-cyan-600 text-white border border-cyan-400 shadow-[0_0_12px_rgba(0,212,255,0.4)]"
                        : "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20"
                    }`}
                  >
                    📊 Анализ ИИ
                  </button>
                  <button
                    onClick={handlePredict}
                    disabled={isLoading}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                      activeTab === "prediction"
                        ? "bg-green-600 text-white border border-green-400 shadow-[0_0_12px_rgba(0,255,136,0.4)]"
                        : "bg-green-500/10 text-green-300 border border-green-500/30 hover:bg-green-500/20"
                    }`}
                  >
                    🔮 Прогноз ИИ
                  </button>
                </div>

                {/* Результат ИИ */}
                <AnimatePresence>
                  {(isLoading || result) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={`rounded-xl p-4 border ${
                        activeTab === "analysis"
                          ? "bg-cyan-500/5 border-cyan-500/30"
                          : "bg-green-500/5 border-green-500/30"
                      }`}
                    >
                      <p className={`text-xs font-semibold mb-3 ${
                        activeTab === "analysis" ? "text-cyan-400" : "text-green-400"
                      }`}>
                        {activeTab === "analysis" ? "📊 Результат анализа" : "🔮 Прогноз поглощения CO2"}
                      </p>

                      {isLoading ? (
                        <div className="flex items-center gap-3 text-gray-400">
                          <Loader className="w-4 h-4 animate-spin text-cyan-400" />
                          <span className="text-sm">ИИ анализирует данные...</span>
                        </div>
                      ) : (
                        <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                          {result}
                        </p>
                      )}
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
