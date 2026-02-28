import { motion } from "framer-motion";
import { Loader, AlertCircle, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface Station {
  id: number;
  name: string;
  temperature: number;
  humidity: number;
  co2_ppm: number;
  ph: number;
  light_intensity: number;
  latitude: number;
  longitude: number;
  satellites?: number;
}

interface AIAnalysisPanelProps {
  station: Station | null;
  type: "analysis" | "prediction";
  isLoading: boolean;
  result: string | null;
}

const AIAnalysisPanel = ({
  station,
  type,
  isLoading,
  result,
}: AIAnalysisPanelProps) => {
  if (!station) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-md rounded-2xl p-6 border border-cyan-500/30 overflow-hidden"
    >
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-cyan-300 flex items-center gap-2">
            {type === "analysis" ? "📊 Анализ ИИ" : "🔮 Прогноз ИИ"}
          </h3>
          <p className="text-sm text-gray-400 mt-1">{station.name}</p>
        </div>
        <div className="text-4xl opacity-20">
          {type === "analysis" ? "📈" : "🎯"}
        </div>
      </div>

      {/* Содержание */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Loader className="w-8 h-8 text-cyan-400" />
            </motion.div>
            <p className="text-gray-400 mt-3">Анализируем данные...</p>
          </div>
        ) : result ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {/* Результат анализа */}
            <div className="bg-white/5 rounded-xl p-4 border border-cyan-500/20">
              <p className="text-white leading-relaxed whitespace-pre-wrap">
                {result}
              </p>
            </div>

            {/* Параметры станции */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-cyan-500/10 to-transparent rounded-lg p-3 border border-cyan-500/20">
                <p className="text-xs text-gray-400">Температура</p>
                <p className="text-lg font-bold text-cyan-300">
                  {station.temperature}°C
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-500/10 to-transparent rounded-lg p-3 border border-green-500/20">
                <p className="text-xs text-gray-400">Влажность</p>
                <p className="text-lg font-bold text-green-300">
                  {station.humidity}%
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-transparent rounded-lg p-3 border border-purple-500/20">
                <p className="text-xs text-gray-400">pH</p>
                <p className="text-lg font-bold text-purple-300">
                  {station.ph?.toFixed(1) ?? "—"}
                </p>
              </div>

              <div className="bg-gradient-to-br from-yellow-500/10 to-transparent rounded-lg p-3 border border-yellow-500/20">
                <p className="text-xs text-gray-400">CO2</p>
                <p className="text-lg font-bold text-yellow-300">
                  {station.co2_ppm} ppm
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-500/10 to-transparent rounded-lg p-3 border border-orange-500/20">
                <p className="text-xs text-gray-400">Свет</p>
                <p className="text-lg font-bold text-orange-300">
                  {station.light_intensity} лк
                </p>
              </div>

              {station.satellites && (
                <div className="bg-gradient-to-br from-blue-500/10 to-transparent rounded-lg p-3 border border-blue-500/20">
                  <p className="text-xs text-gray-400">Спутники</p>
                  <p className="text-lg font-bold text-blue-300">
                    {station.satellites}
                  </p>
                </div>
              )}
            </div>

            {/* Статус */}
            <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-sm text-green-300">
                Анализ завершен успешно
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-8 h-8 text-gray-500 mb-3" />
            <p className="text-gray-400">
              Выберите станцию для анализа данных
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AIAnalysisPanel;
