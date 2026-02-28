import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import { useState } from "react";
import { LatLngExpression } from "leaflet";
import L from "leaflet";
import { motion } from "framer-motion";
import { X } from "lucide-react";

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

interface StationsMapComponentProps {
  onStationSelect: (station: Station) => void;
  onAnalyzeClick: (station: Station) => void;
  onPredictClick: (station: Station) => void;
}

// Демо станции в Актау и Алматы
const demoStations: Station[] = [
  {
    id: 1,
    name: "GreenPulse Station - Актау (Главная площадь)",
    latitude: 43.6452,
    longitude: 51.1694,
    temperature: 22.3,
    humidity: 65.0,
    co2_ppm: 420,
    ph: 6.5,
    light_intensity: 450,
    status: "active",
  },
  {
    id: 2,
    name: "GreenPulse Station - Алматы (Бульвар Nazarbayev)",
    latitude: 43.2425,
    longitude: 76.9481,
    temperature: 23.1,
    humidity: 68.5,
    co2_ppm: 415,
    ph: 6.9,
    light_intensity: 480,
    status: "active",
  },
  {
    id: 3,
    name: "GreenPulse Station - Алматы (Парк Кентау)",
    latitude: 43.2387,
    longitude: 76.9503,
    temperature: 21.8,
    humidity: 62.0,
    co2_ppm: 425,
    ph: 6.7,
    light_intensity: 420,
    status: "active",
  },
];

// Радиус очистки воздуха одной станции в км (0.8 км = 800 метров)
const PURIFICATION_RADIUS = 0.8;

// Создаем кастомные иконки для маркеров
const createStationIcon = (status: string) => {
  return L.divIcon({
    html: `
      <div class="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-cyan-600 to-green-600 border-2 border-cyan-300 shadow-lg shadow-cyan-500/50">
        <div class="text-white text-sm font-bold">📍</div>
      </div>
    `,
    className: "custom-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const StationsMapComponent = ({
  onStationSelect,
  onAnalyzeClick,
  onPredictClick,
}: StationsMapComponentProps) => {
  const [selectedStationModal, setSelectedStationModal] = useState<Station | null>(null);

  // Центр карты между Актау и Алматы
  const mapCenter: LatLngExpression = [43.4425, 64.059];
  const mapZoom = 8;

  return (
    <div className="relative w-full h-screen rounded-2xl border border-cyan-500/30 overflow-hidden">
      {/* Карта */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ width: "100%", height: "100%", zIndex: 0 }}
        className="bg-black"
      >
        {/* Слой карты */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
          className="opacity-75"
        />

        {/* Станции и их радиусы очистки */}
        {demoStations.map((station) => (
          <div key={station.id}>
            {/* Круг радиуса очистки воздуха */}
            <Circle
              center={[station.latitude, station.longitude]}
              radius={PURIFICATION_RADIUS * 1000} // Конвертируем км в метры
              pathOptions={{
                color: "hsl(153 100% 50% / 0.5)",
                weight: 2,
                opacity: 0.4,
                fillColor: "hsl(153 100% 50%)",
                fillOpacity: 0.1,
                dashArray: "5, 5",
              }}
            />

            {/* Маркер станции */}
            <Marker
              position={[station.latitude, station.longitude]}
              icon={createStationIcon(station.status)}
              eventHandlers={{
                click: () => {
                  setSelectedStationModal(station);
                  onStationSelect(station);
                },
              }}
            >
              <Popup>
                <div className="bg-black/90 text-white p-3 rounded-lg border border-cyan-500/30 max-w-xs">
                  <h3 className="font-bold text-cyan-300 mb-2">{station.name}</h3>
                  <div className="text-xs space-y-1 mb-3">
                    <p>🌡️ Температура: {station.temperature}°C</p>
                    <p>💧 Влажность: {station.humidity}%</p>
                    <p>🌱 CO2: {station.co2_ppm} ppm</p>
                    <p>⚗️ pH: {station.ph}</p>
                    <p>☀️ Свет: {station.light_intensity} люкс</p>
                    <p>📍 Радиус очистки: {PURIFICATION_RADIUS} км</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onAnalyzeClick(station);
                        setSelectedStationModal(null);
                      }}
                      className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded text-xs font-bold transition-colors"
                    >
                      📊 Анализ
                    </button>
                    <button
                      onClick={() => {
                        onPredictClick(station);
                        setSelectedStationModal(null);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-bold transition-colors"
                    >
                      🔮 Прогноз
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          </div>
        ))}
      </MapContainer>

      {/* Панель информации о карте */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-6 left-6 bg-gradient-to-br from-black/90 to-black/80 backdrop-blur-md p-4 rounded-xl border border-cyan-500/30 max-w-xs z-10"
      >
        <h3 className="text-sm font-bold text-cyan-300 mb-2">📡 Статус сети</h3>
        <div className="text-xs text-gray-300 space-y-1">
          <p>✅ Активных станций: {demoStations.filter(s => s.status === 'active').length}</p>
          <p>🌍 Охват территории: {(demoStations.length * PURIFICATION_RADIUS * 3.14).toFixed(1)} км²</p>
          <p>👥 Обслуживаемые люди: {demoStations.length * 15000}</p>
          <p className="text-cyan-400 mt-2">💚 Экономия: ${demoStations.length * 1900}/год</p>
        </div>
      </motion.div>

      {/* Легенда карты */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-6 right-6 bg-gradient-to-br from-black/90 to-black/80 backdrop-blur-md p-4 rounded-xl border border-cyan-500/30 max-w-xs z-10"
      >
        <h3 className="text-sm font-bold text-cyan-300 mb-2">🗺️ Легенда</h3>
        <div className="text-xs text-gray-300 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-600 to-green-600 border border-cyan-300"></div>
            <span>Активная станция</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-0.5 border-t-2 border-dashed border-green-500/50"></div>
            <span>Радиус очистки (0.8 км)</span>
          </div>
          <div className="text-cyan-400 text-xs mt-2">
            Нажмите на станцию для деталей
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StationsMapComponent;
