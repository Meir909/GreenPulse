import { motion } from "framer-motion";
import { useState } from "react";
import { MapPin, TrendingDown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

const mockStations: Station[] = [
  {
    id: 1,
    name: "GreenPulse Station 01",
    latitude: 55.7558,
    longitude: 37.6173,
    temperature: 22.5,
    humidity: 65.0,
    co2_ppm: 420,
    ph: 6.8,
    light_intensity: 450,
    status: "active",
  },
  {
    id: 2,
    name: "GreenPulse Station 02",
    latitude: 55.7489,
    longitude: 37.6159,
    temperature: 23.1,
    humidity: 68.5,
    co2_ppm: 415,
    ph: 6.9,
    light_intensity: 480,
    status: "active",
  },
  {
    id: 3,
    name: "GreenPulse Station 03",
    latitude: 55.7614,
    longitude: 37.6245,
    temperature: 21.8,
    humidity: 62.0,
    co2_ppm: 425,
    ph: 6.7,
    light_intensity: 420,
    status: "active",
  },
];

interface StationDetailsProps {
  station: Station | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAnalyze: (station: Station) => void;
  onPredict: (station: Station) => void;
}

const StationDetailsDialog = ({
  station,
  isOpen,
  onOpenChange,
  onAnalyze,
  onPredict,
}: StationDetailsProps) => {
  if (!station) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-black/95 border border-cyan-500/30 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
            <MapPin className="w-6 h-6" />
            {station.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Статус */}
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Статус</span>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  station.status === "active" ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-white capitalize">
                {station.status === "active" ? "Активна" : "Неактивна"}
              </span>
            </div>
          </div>

          {/* Координаты */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-3 border border-cyan-500/20">
              <p className="text-xs text-gray-400 mb-1">Широта</p>
              <p className="text-white font-mono">{station.latitude.toFixed(4)}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-cyan-500/20">
              <p className="text-xs text-gray-400 mb-1">Долгота</p>
              <p className="text-white font-mono">{station.longitude.toFixed(4)}</p>
            </div>
          </div>

          {/* Параметры в сетке */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-cyan-500/10 to-transparent rounded-xl p-4 border border-cyan-500/20">
              <p className="text-xs text-cyan-400 mb-2">Температура</p>
              <p className="text-2xl font-bold text-cyan-300">
                {station.temperature}°C
              </p>
              <p className="text-xs text-gray-500 mt-1">Оптимум: 20-25°C</p>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-transparent rounded-xl p-4 border border-green-500/20">
              <p className="text-xs text-green-400 mb-2">Влажность</p>
              <p className="text-2xl font-bold text-green-300">
                {station.humidity}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Оптимум: 60-80%</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl p-4 border border-purple-500/20">
              <p className="text-xs text-purple-400 mb-2">pH</p>
              <p className="text-2xl font-bold text-purple-300">
                {station.ph.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Оптимум: 6.5-7.5</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/10 to-transparent rounded-xl p-4 border border-yellow-500/20">
              <p className="text-xs text-yellow-400 mb-2">CO2</p>
              <p className="text-2xl font-bold text-yellow-300">
                {station.co2_ppm} ppm
              </p>
              <p className="text-xs text-gray-500 mt-1">Оптимум: 400-450</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500/10 to-transparent rounded-xl p-4 border border-orange-500/20">
              <p className="text-xs text-orange-400 mb-2">Свет</p>
              <p className="text-2xl font-bold text-orange-300">
                {station.light_intensity} лк
              </p>
              <p className="text-xs text-gray-500 mt-1">Оптимум: 400-600</p>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => onAnalyze(station)}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white border border-cyan-400 rounded-lg flex items-center justify-center gap-2"
            >
              <TrendingDown className="w-4 h-4" />
              Анализ ИИ
            </Button>
            <Button
              onClick={() => onPredict(station)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white border border-green-400 rounded-lg flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Прогноз ИИ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface StationsMapProps {
  onAnalyzeClick?: (station: Station) => void;
  onPredictClick?: (station: Station) => void;
}

const StationsMap = ({ onAnalyzeClick, onPredictClick }: StationsMapProps) => {
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleStationClick = (station: Station) => {
    setSelectedStation(station);
    setIsDetailsOpen(true);
  };

  const handleAnalyze = (station: Station) => {
    onAnalyzeClick?.(station);
    setIsDetailsOpen(false);
  };

  const handlePredict = (station: Station) => {
    onPredictClick?.(station);
    setIsDetailsOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Карта сетка станций */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockStations.map((station, index) => (
          <motion.div
            key={station.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            onClick={() => handleStationClick(station)}
            className="group cursor-pointer"
          >
            {/* Карточка станции */}
            <div className="relative h-full bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-md rounded-2xl p-6 border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden">
              {/* Фоновое свечение */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-transparent to-green-500/0 group-hover:from-cyan-500/10 group-hover:to-green-500/10 transition-all duration-500" />

              {/* Контент */}
              <div className="relative z-10 space-y-4">
                {/* Заголовок с статусом */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-cyan-300 group-hover:text-cyan-200 transition-colors">
                      {station.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 font-mono">
                      {station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}
                    </p>
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      station.status === "active" ? "bg-green-500" : "bg-red-500"
                    } animate-pulse`}
                  />
                </div>

                {/* Основные параметры */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-lg p-2.5 border border-cyan-500/10">
                    <p className="text-xs text-gray-400">Температура</p>
                    <p className="text-lg font-bold text-cyan-300">
                      {station.temperature}°
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2.5 border border-green-500/10">
                    <p className="text-xs text-gray-400">Влажность</p>
                    <p className="text-lg font-bold text-green-300">
                      {station.humidity}%
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2.5 border border-purple-500/10">
                    <p className="text-xs text-gray-400">pH</p>
                    <p className="text-lg font-bold text-purple-300">
                      {station.ph.toFixed(1)}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2.5 border border-yellow-500/10">
                    <p className="text-xs text-gray-400">CO2</p>
                    <p className="text-lg font-bold text-yellow-300">
                      {station.co2_ppm}
                    </p>
                  </div>
                </div>

                {/* Кнопка подробнее */}
                <Button
                  onClick={() => handleStationClick(station)}
                  className="w-full mt-4 bg-gradient-to-r from-cyan-600 to-green-600 hover:from-cyan-700 hover:to-green-700 text-white border-0 rounded-lg font-medium transition-all duration-300 group-hover:shadow-lg group-hover:shadow-cyan-500/20"
                >
                  Подробнее
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Модальное окно с деталями */}
      <StationDetailsDialog
        station={selectedStation}
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onAnalyze={handleAnalyze}
        onPredict={handlePredict}
      />
    </div>
  );
};

export default StationsMap;
