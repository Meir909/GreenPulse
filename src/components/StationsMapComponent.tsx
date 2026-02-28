import { useEffect, useRef, useState } from "react";
import L, { LatLngExpression, Map as LeafletMap } from "leaflet";
import { motion } from "framer-motion";
import "leaflet/dist/leaflet.css";

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

const PURIFICATION_RADIUS = 0.8;
const KAZAKHSTAN_CENTER: LatLngExpression = [48.0196, 66.9237];

// Создаём простой HTML маркер без CDN зависимостей
const createSimpleMarker = (color: string) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
    iconSize: [20, 20],
    className: "simple-marker",
  });
};

const StationsMapComponent = ({
  onStationSelect,
  onAnalyzeClick,
  onPredictClick,
}: StationsMapComponentProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || mapInitialized) return;

    console.log("🗺️ Инициализация карты...", mapContainer.current);

    // Инициализируем карту
    const initialCenter = KAZAKHSTAN_CENTER;
    const initialZoom = 5;

    try {
      map.current = L.map(mapContainer.current, {
        center: initialCenter,
        zoom: initialZoom,
        zoomControl: true,
        attributionControl: true,
      });

      console.log("✅ Карта инициализирована");

      // Добавляем tile layer (используем CartoDB Dark вместо OSM)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; OpenStreetMap contributors, &copy; CartoDB',
        maxZoom: 19,
        opacity: 0.85,
        crossOrigin: true,
      }).addTo(map.current);

      console.log("✅ Тайлы загружены");

      setMapInitialized(true);

      // Запрашиваем геолокацию
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });
            if (map.current) {
              map.current.setView([latitude, longitude], 12);

              // Добавляем маркер пользователя (синий круг)
              L.marker([latitude, longitude], {
                icon: createSimpleMarker("#0084ff"),
              })
                .bindPopup(
                  `<div style="background: black; color: white; padding: 8px; border: 1px solid #00d4ff; border-radius: 4px;">
                    <h4 style="color: #00d4ff; margin: 0 0 4px 0; font-weight: bold;">Ваша локация</h4>
                    <p style="margin: 0; font-size: 12px;">
                      ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E
                    </p>
                  </div>`
                )
                .addTo(map.current);
            }
          },
          () => {
            console.log("Геолокация отклонена или недоступна");
          }
        );
      }
    } catch (error) {
      console.error("Ошибка инициализации карты:", error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapInitialized]);

  // Добавляем станции на карту когда она загружена
  useEffect(() => {
    if (!map.current || !mapInitialized) return;

    demoStations.forEach((station) => {
      // Добавляем круг радиуса
      L.circle([station.latitude, station.longitude], {
        radius: PURIFICATION_RADIUS * 1000,
        color: "hsl(153 100% 50% / 0.5)",
        weight: 2,
        opacity: 0.4,
        fillColor: "hsl(153 100% 50%)",
        fillOpacity: 0.1,
        dashArray: "5, 5",
      }).addTo(map.current!);

      // Добавляем маркер станции (зелёный круг)
      const marker = L.marker([station.latitude, station.longitude], {
        icon: createSimpleMarker("#00ff88"),
      });

      const popupContent = `
        <div style="background: rgba(0,0,0,0.9); color: white; padding: 12px; border: 1px solid #00d4ff; border-radius: 6px; min-width: 200px;">
          <h3 style="color: #00d4ff; margin: 0 0 8px 0; font-weight: bold; font-size: 14px;">${station.name}</h3>
          <div style="font-size: 12px; margin: 0 0 10px 0; line-height: 1.6;">
            <p style="margin: 2px 0;">🌡️ Температура: ${station.temperature}°C</p>
            <p style="margin: 2px 0;">💧 Влажность: ${station.humidity}%</p>
            <p style="margin: 2px 0;">🌱 CO2: ${station.co2_ppm} ppm</p>
            <p style="margin: 2px 0;">⚗️ pH: ${station.ph}</p>
            <p style="margin: 2px 0;">☀️ Свет: ${station.light_intensity} люкс</p>
            <p style="margin: 2px 0;">📍 Радиус: ${PURIFICATION_RADIUS} км</p>
          </div>
          <div style="display: flex; gap: 6px;">
            <button onclick="window.analyzeStation(${station.id})" style="flex: 1; background: #00d4ff; color: black; border: none; padding: 4px 8px; border-radius: 3px; font-size: 11px; font-weight: bold; cursor: pointer;">📊 Анализ</button>
            <button onclick="window.predictStation(${station.id})" style="flex: 1; background: #00ff88; color: black; border: none; padding: 4px 8px; border-radius: 3px; font-size: 11px; font-weight: bold; cursor: pointer;">🔮 Прогноз</button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.addTo(map.current!);

      // Добавляем глобальные функции для кнопок
      (window as any).analyzeStation = (id: number) => {
        const station = demoStations.find((s) => s.id === id);
        if (station) {
          onAnalyzeClick(station);
          onStationSelect(station);
        }
      };

      (window as any).predictStation = (id: number) => {
        const station = demoStations.find((s) => s.id === id);
        if (station) {
          onPredictClick(station);
          onStationSelect(station);
        }
      };
    });
  }, [mapInitialized, onStationSelect, onAnalyzeClick, onPredictClick]);

  return (
    <div className="relative w-full rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl bg-black" style={{ height: "600px" }}>
      {/* Контейнер карты */}
      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "600px",
          zIndex: 1,
          position: "absolute",
          top: 0,
          left: 0,
          backgroundColor: "#000000",
        }}
        className="leaflet-container"
      />

      {/* Статус геолокации */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 left-4 bg-black/80 backdrop-blur-md p-2 rounded-lg border border-cyan-500/30 text-xs z-10"
      >
        {userLocation ? (
          <div className="text-green-400">✅ Геолокация включена</div>
        ) : (
          <div className="text-yellow-400">📍 Геолокация отключена - показана вся карта Казахстана</div>
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
          <li>📍 Нажмите на станцию для информации</li>
          <li>💚 Зеленые круги - радиус очистки (0.8 км)</li>
          <li>🔵 Синий маркер - ваша локация</li>
          <li>⚙️ Zoom для приближения/отдаления</li>
        </ul>
      </motion.div>
    </div>
  );
};

export default StationsMapComponent;
