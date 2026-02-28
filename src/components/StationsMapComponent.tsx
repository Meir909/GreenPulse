import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from "react-leaflet";
import { useState, useEffect, useRef } from "react";
import { LatLngExpression } from "leaflet";
import L from "leaflet";
import { motion } from "framer-motion";

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

// Радиус очистки воздуха в км
const PURIFICATION_RADIUS = 0.8;

// Казахстан координаты (центр)
const KAZAKHSTAN_CENTER: LatLngExpression = [48.0196, 66.9237];

// Создаем кастомные иконки
const createStationIcon = () => {
  return L.divIcon({
    html: `
      <div class="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-cyan-600 to-green-600 border-2 border-cyan-300 shadow-lg shadow-cyan-500/50 relative">
        <div class="text-white text-lg font-bold">📍</div>
        <div class="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-75"></div>
      </div>
    `,
    className: "custom-marker",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

const createUserIcon = () => {
  return L.divIcon({
    html: `
      <div class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 border-2 border-blue-300 shadow-lg shadow-blue-500/50">
        <div class="text-white text-sm font-bold">📍</div>
      </div>
    `,
    className: "user-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Компонент для управления геолокацией
const LocationControl = ({ onLocationFound }: { onLocationFound: (lat: number, lng: number) => void }) => {
  const map = useMap();
  const [hasLocation, setHasLocation] = useState(false);

  useEffect(() => {
    // Запрашиваем геолокацию
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          onLocationFound(latitude, longitude);
          setHasLocation(true);
          // Центрируем на пользователя
          map.setView([latitude, longitude], 12);
        },
        (error) => {
          console.log("Геолокация отклонена или недоступна:", error);
          // Если геолокация недоступна, показываем Казахстан
          map.setView(KAZAKHSTAN_CENTER, 5);
        }
      );
    }
  }, [map, onLocationFound]);

  return null;
};

const StationsMapComponent = ({
  onStationSelect,
  onAnalyzeClick,
  onPredictClick,
}: StationsMapComponentProps) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [hasLocationAccess, setHasLocationAccess] = useState(false);
  const mapRef = useRef(null);

  const handleLocationFound = (lat: number, lng: number) => {
    setUserLocation({ lat, lng });
    setHasLocationAccess(true);
  };

  // Начальный центр карты - Казахстан если нет доступа, иначе будет установлено в LocationControl
  const mapCenter = userLocation ? [userLocation.lat, userLocation.lng] : KAZAKHSTAN_CENTER;
  const mapZoom = userLocation ? 12 : 5;

  return (
    <div className="relative w-full h-full rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl">
      {/* Карта */}
      <MapContainer
        center={mapCenter as LatLngExpression}
        zoom={mapZoom}
        style={{ width: "100%", height: "100%", zIndex: 0 }}
        className="bg-black"
        ref={mapRef}
      >
        {/* Слой карты OSM */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
          className="opacity-75"
        />

        {/* Управление геолокацией */}
        <LocationControl onLocationFound={handleLocationFound} />

        {/* Маркер пользователя (если разрешена геолокация) */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={createUserIcon()}
          >
            <Popup>
              <div className="bg-black/90 text-white p-2 rounded-lg border border-blue-500/30">
                <h4 className="font-bold text-blue-300">Ваша локация</h4>
                <p className="text-xs text-gray-300">
                  {userLocation.lat.toFixed(4)}°N, {userLocation.lng.toFixed(4)}°E
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Станции и их радиусы очистки */}
        {demoStations.map((station) => (
          <div key={station.id}>
            {/* Круг радиуса очистки воздуха */}
            <Circle
              center={[station.latitude, station.longitude]}
              radius={PURIFICATION_RADIUS * 1000}
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
              icon={createStationIcon()}
              eventHandlers={{
                click: () => {
                  onStationSelect(station);
                },
              }}
            >
              <Popup>
                <div className="bg-black/90 text-white p-3 rounded-lg border border-cyan-500/30 min-w-max">
                  <h3 className="font-bold text-cyan-300 mb-2 text-sm">{station.name}</h3>
                  <div className="text-xs space-y-1 mb-3">
                    <p>🌡️ Температура: {station.temperature}°C</p>
                    <p>💧 Влажность: {station.humidity}%</p>
                    <p>🌱 CO2: {station.co2_ppm} ppm</p>
                    <p>⚗️ pH: {station.ph}</p>
                    <p>☀️ Свет: {station.light_intensity} люкс</p>
                    <p>📍 Радиус: {PURIFICATION_RADIUS} км</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onAnalyzeClick(station);
                      }}
                      className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-2 py-1 rounded text-xs font-bold transition-colors"
                    >
                      📊 Анализ
                    </button>
                    <button
                      onClick={() => {
                        onPredictClick(station);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-bold transition-colors"
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

      {/* Статус геолокации */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 left-4 bg-black/80 backdrop-blur-md p-2 rounded-lg border border-cyan-500/30 text-xs z-10"
      >
        {userLocation ? (
          <div className="text-green-400">
            ✅ Геолокация включена
          </div>
        ) : (
          <div className="text-yellow-400">
            📍 Геолокация отключена - показана вся карта Казахстана
          </div>
        )}
      </motion.div>

      {/* Инструкция */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md p-3 rounded-lg border border-cyan-500/30 max-w-xs text-xs z-10"
      >
        <h4 className="text-cyan-300 font-bold mb-2">🗺️ Как использовать</h4>
        <ul className="text-gray-300 space-y-1">
          <li>📍 Нажмите на станцию для получения информации</li>
          <li>💚 Зеленые круги - радиус очистки воздуха (0.8 км)</li>
          <li>🔵 Синий маркер - ваша локация (если разрешена)</li>
          <li>⚙️ Используйте zoom для приближения/отдаления</li>
        </ul>
      </motion.div>
    </div>
  );
};

export default StationsMapComponent;
