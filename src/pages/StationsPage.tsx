import { useState } from "react";
import { motion } from "framer-motion";
import StationsMapComponent from "@/components/StationsMapComponent";
import AIAnalysisPanel from "@/components/AIAnalysisPanel";

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

const StationsPage = () => {
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [predictionResult, setPredictionResult] = useState<string | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [isPredictionLoading, setIsPredictionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"analysis" | "prediction">(
    "analysis"
  );

  // Предварительно заданные результаты анализа
  const analysisResponses: Record<number, string> = {
    1: `📊 АНАЛИЗ СТАНЦИИ GreenPulse Station 01

✅ Статус: Оптимальные условия

🌡️ Температура: 22.5°C (в норме)
  • Диапазон: 20-25°C
  • Статус: ✓ Идеально

💧 Влажность: 65% (в норме)
  • Диапазон: 60-80%
  • Статус: ✓ Идеально

⚗️ pH: 6.8 (в норме)
  • Диапазон: 6.5-7.5
  • Статус: ✓ Идеально

🌱 CO2: 420 ppm (в норме)
  • Диапазон: 400-450 ppm
  • Статус: ✓ Идеально

☀️ Свет: 450 люкс (в норме)
  • Диапазон: 400-600 люкс
  • Статус: ✓ Хорошо

📈 РЕКОМЕНДАЦИИ:
• Система работает с оптимальной эффективностью
• Балдыри активно поглощают CO2
• Рекомендуется ежедневный мониторинг влажности
• Количество спутников GPS может быть улучшено`,

    2: `📊 АНАЛИЗ СТАНЦИИ GreenPulse Station 02

✅ Статус: Хорошие условия

🌡️ Температура: 23.1°C (в норме)
  • Диапазон: 20-25°C
  • Статус: ✓ Идеально

💧 Влажность: 68.5% (в норме)
  • Диапазон: 60-80%
  • Статус: ✓ Идеально

⚗️ pH: 6.9 (в норме)
  • Диапазон: 6.5-7.5
  • Статус: ✓ Отлично

🌱 CO2: 415 ppm (в норме)
  • Диапазон: 400-450 ppm
  • Статус: ✓ Хорошо

☀️ Свет: 480 люкс (выше среднего)
  • Диапазон: 400-600 люкс
  • Статус: ✓ Отлично

📈 РЕКОМЕНДАЦИИ:
• Повышенная интенсивность света способствует лучшему фотосинтезу
• Балдыри растут быстрее обычного
• Продолжайте текущий режим ухода`,

    3: `📊 АНАЛИЗ СТАНЦИИ GreenPulse Station 03

⚠️ Статус: Требуется внимание

🌡️ Температура: 21.8°C (в норме)
  • Диапазон: 20-25°C
  • Статус: ✓ Хорошо

💧 Влажность: 62% (в норме)
  • Диапазон: 60-80%
  • Статус: ✓ Минимум нормы

⚗️ pH: 6.7 (в норме)
  • Диапазон: 6.5-7.5
  • Статус: ✓ Хорошо

🌱 CO2: 425 ppm (в норме)
  • Диапазон: 400-450 ppm
  • Статус: ✓ Хорошо

☀️ Свет: 420 люкс (ниже среднего)
  • Диапазон: 400-600 люкс
  • Статус: ⚠️ Минимум нормы

📈 РЕКОМЕНДАЦИИ:
• Увеличьте интенсивность освещения на 50-100 люкс
• Повысьте влажность до 70% для лучшего роста
• Проверьте источники света на предмет загрязнения
• Регулируйте условия еженедельно`,
  };

  // Предварительно заданные результаты прогноза
  const predictionResponses: Record<number, string> = {
    1: `🔮 ПРОГНОЗ ПОГЛОЩЕНИЯ CO2 - Station 01

📊 Основные параметры:
  • pH: 6.8 (идеально)
  • Температура: 22.5°C (оптимально)
  • Интенсивность света: 450 люкс (хорошо)

💨 ПРЕДСКАЗАНИЕ ПОГЛОЩЕНИЯ CO2:

  За 1 час:    4.2 грамма CO2
  За 8 часов:  33.6 грамма CO2
  За 24 часа:  100.8 грамма CO2
  За неделю:   705.6 грамма CO2
  За месяц:    3,024 грамма CO2
  За год:      36,288 грамма CO2 (36.3 кг)

📈 АНАЛИЗ ЭФФЕКТИВНОСТИ:
  • Текущая эффективность: 92%
  • Ожидаемое поглощение близко к стандартному (38 кг/год)
  • Условия оптимальны для максимальной производительности

🎯 РЕКОМЕНДАЦИИ:
  • Поддерживайте текущие условия
  • При повышении света на 10% эффективность возрастет на 3-5%
  • Регулярная проверка системы обеспечит стабильность`,

    2: `🔮 ПРОГНОЗ ПОГЛОЩЕНИЯ CO2 - Station 02

📊 Основные параметры:
  • pH: 6.9 (отлично)
  • Температура: 23.1°C (оптимально)
  • Интенсивность света: 480 люкс (выше среднего)

💨 ПРЕДСКАЗАНИЕ ПОГЛОЩЕНИЯ CO2:

  За 1 час:    4.8 грамма CO2
  За 8 часов:  38.4 грамма CO2
  За 24 часа:  115.2 грамма CO2
  За неделю:   806.4 грамма CO2
  За месяц:    3,456 грамма CO2
  За год:      41,472 грамма CO2 (41.5 кг)

📈 АНАЛИЗ ЭФФЕКТИВНОСТИ:
  • Текущая эффективность: 95% (выше среднего!)
  • Повышенное освещение дает дополнительные 10% производительности
  • Это лучшая станция в системе

🎯 РЕКОМЕНДАЦИИ:
  • Сохраняйте текущие условия
  • Рассмотрите возможность увеличения света для еще большей эффективности
  • Эта станция может быть образцом для других`,

    3: `🔮 ПРОГНОЗ ПОГЛОЩЕНИЯ CO2 - Station 03

📊 Основные параметры:
  • pH: 6.7 (хорошо)
  • Температура: 21.8°C (хорошо)
  • Интенсивность света: 420 люкс (ниже среднего)

💨 ПРЕДСКАЗАНИЕ ПОГЛОЩЕНИЯ CO2:

  За 1 час:    3.6 грамма CO2
  За 8 часов:  28.8 грамма CO2
  За 24 часа:  86.4 грамма CO2
  За неделю:   604.8 грамма CO2
  За месяц:    2,592 грамма CO2
  За год:      31,104 грамма CO2 (31.1 кг)

📈 АНАЛИЗ ЭФФЕКТИВНОСТИ:
  • Текущая эффективность: 82% (ниже среднего)
  • Недостаточное освещение снижает эффективность на 15-20%
  • Низкая влажность также влияет на производительность

🎯 РЕКОМЕНДАЦИИ:
  • СРОЧНО: Увеличьте интенсивность света до 500-550 люкс
  • Повысьте влажность до 70-75%
  • Это может увеличить эффективность на 10-15%
  • Повторная оценка через 1 неделю`,
  };

  const handleAnalyzeClick = (station: Station) => {
    setSelectedStation(station);
    setActiveTab("analysis");
    setIsAnalysisLoading(true);

    // Имитируем загрузку анализа с задержкой
    setTimeout(() => {
      setAnalysisResult(
        analysisResponses[station.id] ||
          "Анализ для этой станции недоступен"
      );
      setIsAnalysisLoading(false);
    }, 1500);
  };

  const handlePredictClick = (station: Station) => {
    setSelectedStation(station);
    setActiveTab("prediction");
    setIsPredictionLoading(true);

    // Имитируем загрузку прогноза с задержкой
    setTimeout(() => {
      setPredictionResult(
        predictionResponses[station.id] ||
          "Прогноз для этой станции недоступен"
      );
      setIsPredictionLoading(false);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden pb-24">

      {/* Основной контент */}
      <main className="relative pt-6 pb-8 min-h-screen px-4">
        {/* Заголовок */}
        <h1 className="text-4xl font-bold text-white mb-8">
          <span className="bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
            Интерактивті станциялар картасы
          </span>
        </h1>

        {/* Интерактивная карта */}
        <div className="mb-8">
          <StationsMapComponent
            onStationSelect={setSelectedStation}
            onAnalyzeClick={handleAnalyzeClick}
            onPredictClick={handlePredictClick}
          />
        </div>

        {/* Вкладки анализа и прогноза (наложение) */}
        {selectedStation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-black/80 backdrop-blur-md p-6 max-h-[50vh] overflow-y-auto z-20 border-t border-cyan-500/30"
          >
              {/* Кнопки вкладок */}
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveTab("analysis")}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                    activeTab === "analysis"
                      ? "bg-cyan-600 text-white border border-cyan-400"
                      : "bg-white/5 text-gray-400 border border-cyan-500/20 hover:border-cyan-500/50"
                  }`}
                >
                  📊 Талдау
                </button>
                <button
                  onClick={() => setActiveTab("prediction")}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                    activeTab === "prediction"
                      ? "bg-green-600 text-white border border-green-400"
                      : "bg-white/5 text-gray-400 border border-cyan-500/20 hover:border-cyan-500/50"
                  }`}
                >
                  🔮 Болжам
                </button>
              </div>

              {/* Панели анализа и прогноза */}
              {activeTab === "analysis" && (
                <AIAnalysisPanel
                  station={selectedStation}
                  type="analysis"
                  isLoading={isAnalysisLoading}
                  result={analysisResult}
                />
              )}

              {activeTab === "prediction" && (
                <AIAnalysisPanel
                  station={selectedStation}
                  type="prediction"
                  isLoading={isPredictionLoading}
                  result={predictionResult}
                />
              )}
            </motion.div>
          )}
      </main>

    </div>
  );
};

export default StationsPage;
