import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import { motion } from "framer-motion";
import { io, Socket } from "socket.io-client";
import "leaflet/dist/leaflet.css";
import StationModal from "./StationModal";
import BluetoothConnect from "./BluetoothConnect";

interface Station {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  co2_ppm: number;
  co_ppm?: number;
  ph: number;
  light_intensity: number;
  satellites?: number;
  status: "active" | "inactive";
}

interface GpsPoint {
  lat: number;
  lng: number;
  timestamp: string;
}

interface StationsMapComponentProps {
  onStationSelect?: (station: Station) => void;
}

const PURIFICATION_RADIUS = 0.8;
const KAZAKHSTAN_CENTER: [number, number] = [48.0196, 66.9237];

const esp32Icon = L.divIcon({
  html: `<div style="width:28px;height:28px;background:#00ff88;border:3px solid white;border-radius:50%;box-shadow:0 0 16px #00ff88,0 0 8px rgba(0,0,0,0.8);cursor:pointer;position:relative;">
    <div style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:#00ff88;color:black;font-size:9px;font-weight:bold;padding:1px 5px;border-radius:4px;white-space:nowrap;">LIVE</div>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  className: "",
});

const userIcon = L.divIcon({
  html: `<div style="width:18px;height:18px;background:#00d4ff;border:3px solid white;border-radius:50%;box-shadow:0 0 12px #00d4ff,0 0 6px rgba(0,0,0,0.8);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  className: "",
});

// Серый маркер — последняя позиция без GPS сигнала
const lastKnownIcon = L.divIcon({
  html: `<div style="width:18px;height:18px;background:#666;border:3px solid white;border-radius:50%;box-shadow:0 0 8px rgba(0,0,0,0.6);opacity:0.7;"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  className: "",
});

const StationsMapComponent = ({ onStationSelect }: StationsMapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const esp32MarkerRef = useRef<L.Marker | null>(null);
  const esp32CircleRef = useRef<L.Circle | null>(null);
  const gpsTrackRef = useRef<L.Polyline | null>(null);
  const lastKnownMarkerRef = useRef<L.Marker | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [esp32Station, setEsp32Station] = useState<Station | null>(null);
  const [esp32Online, setEsp32Online] = useState(false);
  const [bleConnected, setBleConnected] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [trackLength, setTrackLength] = useState(0);
  const [trackPoints, setTrackPoints] = useState(0);
  const [lastGpsPos, setLastGpsPos] = useState<{ lat: number; lng: number } | null>(null);
  const [fullGpsTrack, setFullGpsTrack] = useState<GpsPoint[]>([]);
  const [showTrackTable, setShowTrackTable] = useState(false);
  const heatLayerRef = useRef<L.LayerGroup | null>(null);

  const openStation = (station: Station) => {
    setSelectedStation(station);
    setModalOpen(true);
    onStationSelect?.(station);
  };

  // Вычислить длину трека в км
  const calcTrackLength = (points: GpsPoint[]): number => {
    if (points.length < 2) return 0;
    let total = 0;
    for (let i = 1; i < points.length; i++) {
      const from = L.latLng(points[i - 1].lat, points[i - 1].lng);
      const to = L.latLng(points[i].lat, points[i].lng);
      total += from.distanceTo(to);
    }
    return parseFloat((total / 1000).toFixed(2));
  };

  // Загрузка GPS трека с сервера и отрисовка polyline
  const loadGpsTrack = useCallback(async () => {
    if (!leafletMap.current) return;
    try {
      const res = await fetch("/api/gps-track");
      const json = await res.json();
      if (!json.track || json.track.length < 2) return;

      const points: GpsPoint[] = json.track;
      const latlngs: [number, number][] = points.map(p => [p.lat, p.lng]);

      if (gpsTrackRef.current) {
        gpsTrackRef.current.setLatLngs(latlngs);
      } else {
        gpsTrackRef.current = L.polyline(latlngs, {
          color: "#00ff88",
          weight: 3,
          opacity: 0.8,
          dashArray: undefined,
          smoothFactor: 1.5,
        }).addTo(leafletMap.current);
      }

      setFullGpsTrack(points);
      setTrackPoints(points.length);
      setTrackLength(calcTrackLength(points));
    } catch {
      // GPS трек недоступен
    }
  }, []);

  // Добавить одну точку к треку (при WS обновлении)
  const addTrackPoint = useCallback((lat: number, lng: number) => {
    if (!leafletMap.current) return;
    const latLng = L.latLng(lat, lng);

    if (gpsTrackRef.current) {
      gpsTrackRef.current.addLatLng(latLng);
    } else {
      gpsTrackRef.current = L.polyline([[lat, lng]], {
        color: "#00ff88",
        weight: 3,
        opacity: 0.8,
        smoothFactor: 1.5,
      }).addTo(leafletMap.current);
    }

    setTrackPoints(prev => prev + 1);
  }, []);

  // Heatmap: draw colored pollution rings around ESP32
  const updateHeatmap = useCallback((lat: number, lng: number, station: Station) => {
    if (!leafletMap.current) return;
    if (heatLayerRef.current) heatLayerRef.current.clearLayers();
    else heatLayerRef.current = L.layerGroup().addTo(leafletMap.current);

    // Colour based on CO level
    const co = station.co_ppm ?? 0;
    const heatColor = co > 200 ? "#ff2200" : co > 100 ? "#ff7700" : co > 50 ? "#ffcc00" : "#00ff88";
    const heatOpacity = co > 50 ? 0.18 : 0.08;

    // Three rings: clean zone (800m), moderate (400m), hotspot (150m)
    [[800, 0.04], [400, 0.08], [150, heatOpacity]].forEach(([r, opacity]) => {
      L.circle([lat, lng], {
        radius: r as number,
        color: heatColor,
        weight: 0,
        fillColor: heatColor,
        fillOpacity: opacity as number,
      }).addTo(heatLayerRef.current!);
    });
  }, []);

  // Обновить позицию маркера ESP32
  const updateEsp32Marker = useCallback((lat: number, lng: number, station: Station) => {
    if (!leafletMap.current) return;

    if (esp32MarkerRef.current) esp32MarkerRef.current.remove();
    if (esp32CircleRef.current) esp32CircleRef.current.remove();
    if (lastKnownMarkerRef.current) lastKnownMarkerRef.current.remove();

    esp32CircleRef.current = L.circle([lat, lng], {
      radius: PURIFICATION_RADIUS * 1000,
      color: "#00ff88",
      weight: 2,
      opacity: 0.5,
      fillColor: "#00ff88",
      fillOpacity: 0.06,
      dashArray: "8, 5",
    }).addTo(leafletMap.current);

    esp32MarkerRef.current = L.marker([lat, lng], { icon: esp32Icon })
      .on("click", () => openStation(station))
      .addTo(leafletMap.current);

    updateHeatmap(lat, lng, station);
  }, [updateHeatmap]);

  // Обработчик данных от WebSocket
  const handleSensorUpdate = useCallback((data: any) => {
    const hasGPS = data.gps_valid && data.latitude && data.longitude &&
                   data.latitude !== 0 && data.longitude !== 0;

    const station: Station = {
      id: data.station_id || 4,
      name: data.station_name || "GreenPulse ESP32",
      latitude: data.latitude,
      longitude: data.longitude,
      temperature: data.temperature,
      humidity: data.humidity,
      co2_ppm: data.co2_ppm,
      co_ppm: data.co_ppm,
      ph: data.ph,
      light_intensity: data.light_intensity,
      satellites: data.satellites,
      status: "active",
    };

    setEsp32Station(station);
    setEsp32Online(hasGPS);

    if (hasGPS) {
      const lat = data.latitude;
      const lng = data.longitude;

      setLastGpsPos({ lat, lng });
      updateEsp32Marker(lat, lng, station);
      addTrackPoint(lat, lng);

      // Плавно следим за станцией только при первом появлении GPS
      if (!lastGpsPos && leafletMap.current) {
        leafletMap.current.setView([lat, lng], 15, { animate: true, duration: 1.5 });
      }
    } else if (lastGpsPos) {
      // GPS потерян — показываем серый маркер на последней известной позиции
      if (esp32MarkerRef.current) esp32MarkerRef.current.remove();
      if (esp32CircleRef.current) esp32CircleRef.current.remove();
      if (lastKnownMarkerRef.current) lastKnownMarkerRef.current.remove();

      if (leafletMap.current) {
        lastKnownMarkerRef.current = L.marker([lastGpsPos.lat, lastGpsPos.lng], { icon: lastKnownIcon })
          .bindPopup(`<div style="background:#111;color:#aaa;padding:6px;border-radius:4px;font-size:11px;">
            Последняя известная позиция<br/>GPS сигнал потерян
          </div>`)
          .addTo(leafletMap.current);
      }
    }
  }, [lastGpsPos, updateEsp32Marker, addTrackPoint]);

  // Загрузка данных с ESP32 (WiFi режим — fallback)
  const fetchEsp32Data = useCallback(async () => {
    if (wsConnected) return; // WS работает — HTTP не нужен
    try {
      const res = await fetch("/api/sensor-data");
      if (!res.ok) return;
      const json = await res.json();
      if (json.status === "offline" || !json.data) return;
      handleSensorUpdate(json.data);
    } catch {
      // ESP32 недоступен
    }
  }, [wsConnected, handleSensorUpdate]);

  // Обработчик данных с ESP32 по BLE
  const handleBleData = (data: {
    temperature: number; humidity: number; co2_ppm: number; co_ppm?: number;
    ph: number; light_intensity: number; station_id: number; station_name: string;
    latitude: number; longitude: number; satellites: number; gps_valid: boolean;
  }) => {
    setBleConnected(true);
    handleSensorUpdate(data);

    const hasGPS = data.gps_valid && data.latitude !== 0 && data.longitude !== 0;
    if (hasGPS && leafletMap.current) {
      leafletMap.current.setView([data.latitude, data.longitude], 15, { animate: true });
    }
  };

  // Очистить трек
  const clearTrack = async () => {
    try {
      await fetch("/api/gps-track", { method: "DELETE" });
      if (gpsTrackRef.current) {
        gpsTrackRef.current.setLatLngs([]);
      }
      setTrackPoints(0);
      setTrackLength(0);
    } catch {
      // offline
    }
  };

  // Инициализация карты
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current, {
      center: KAZAKHSTAN_CENTER,
      zoom: 5,
      zoomControl: true,
    });

    leafletMap.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; OpenStreetMap contributors &copy; CartoDB",
      maxZoom: 19,
    }).addTo(map);

    // Геолокация пользователя
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setUserLocation({ lat: coords.latitude, lng: coords.longitude });
          map.setView([coords.latitude, coords.longitude], 12);
          L.marker([coords.latitude, coords.longitude], { icon: userIcon })
            .bindPopup(`<div style="background:#000;color:#fff;padding:8px;border:1px solid #00d4ff;border-radius:4px;font-family:sans-serif;">
              <b style="color:#00d4ff;">Ваша локация</b><br/>
              <span style="font-size:12px;">${coords.latitude.toFixed(4)}°N, ${coords.longitude.toFixed(4)}°E</span>
            </div>`)
            .addTo(map);
        },
        () => {}
      );
    }

    return () => {
      map.remove();
      leafletMap.current = null;
    };
  }, []);

  // WebSocket подключение
  useEffect(() => {
    const socket = io(window.location.origin, {
      transports: ["websocket", "polling"],
      reconnectionDelay: 3000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setWsConnected(true);
      // Запрашиваем полный трек
      socket.emit("request_track");
    });

    socket.on("full_track", (data: { track: GpsPoint[] }) => {
      if (data.track && data.track.length >= 2 && leafletMap.current) {
        const latlngs: [number, number][] = data.track.map(p => [p.lat, p.lng]);
        if (gpsTrackRef.current) {
          gpsTrackRef.current.setLatLngs(latlngs);
        } else {
          gpsTrackRef.current = L.polyline(latlngs, {
            color: "#00ff88", weight: 3, opacity: 0.8,
          }).addTo(leafletMap.current);
        }
        setFullGpsTrack(data.track);
        setTrackPoints(data.track.length);
        setTrackLength(calcTrackLength(data.track));
      }
    });

    socket.on("sensor_update", handleSensorUpdate);

    socket.on("track_cleared", () => {
      if (gpsTrackRef.current) gpsTrackRef.current.setLatLngs([]);
      setTrackPoints(0);
      setTrackLength(0);
    });

    socket.on("disconnect", () => setWsConnected(false));

    return () => { socket.disconnect(); };
  }, [handleSensorUpdate]);

  // Загружаем GPS трек и ESP32 данные при старте
  useEffect(() => {
    loadGpsTrack();
    fetchEsp32Data();
    const interval = setInterval(() => {
      loadGpsTrack();
      fetchEsp32Data();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadGpsTrack, fetchEsp32Data]);

  return (
    <>
      <div className="relative w-full rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl" style={{ height: "620px" }}>
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

        {/* Статус подключения */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 bg-black/85 backdrop-blur-md p-3 rounded-xl border border-cyan-500/30 text-xs z-[1000] space-y-1.5 min-w-[160px]"
        >
          {userLocation ? (
            <div className="text-green-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              Ваша геолокация
            </div>
          ) : (
            <div className="text-yellow-400">📍 Карта Казахстана</div>
          )}
          {wsConnected ? (
            <div className="text-primary flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse inline-block" />
              WebSocket Live
            </div>
          ) : bleConnected ? (
            <div className="text-blue-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse inline-block" />
              BLE подключён
            </div>
          ) : esp32Online ? (
            <div className="text-green-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
              ESP32 онлайн
            </div>
          ) : (
            <div className="text-gray-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-500 inline-block" />
              ESP32 офлайн
            </div>
          )}
          {trackPoints > 0 && (
            <div className="text-cyan-300 flex items-center gap-1.5 border-t border-white/10 pt-1.5">
              <span className="text-xs">📍</span>
              Трек: {trackPoints} т. / {trackLength} км
            </div>
          )}
        </motion.div>

        {/* Легенда */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 bg-black/85 backdrop-blur-md p-3 rounded-xl border border-cyan-500/30 max-w-[180px] text-xs z-[1000]"
        >
          <h4 className="text-cyan-300 font-bold mb-2">Легенда</h4>
          <ul className="text-gray-300 space-y-1.5">
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-400 flex-shrink-0 shadow-[0_0_6px_#00ff88]" />
              ESP32 Live
            </li>
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400 flex-shrink-0 shadow-[0_0_6px_#00d4ff]" />
              Ваша локация
            </li>
            <li className="flex items-center gap-2">
              <span className="w-8 h-0.5 bg-green-400 flex-shrink-0 opacity-80" />
              GPS трек
            </li>
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-500 flex-shrink-0" />
              Последн. GPS
            </li>
          </ul>
          {trackPoints > 0 && (
            <button
              onClick={clearTrack}
              className="mt-2 w-full text-center text-red-300 border border-red-500/30 rounded-lg py-1 hover:bg-red-500/10 transition-colors text-xs"
            >
              Очистить трек
            </button>
          )}
        </motion.div>

        {/* Панель ESP32 данных */}
        {esp32Station && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 right-4 bg-black/85 backdrop-blur-md p-3 rounded-xl border border-green-500/40 text-xs z-[1000] min-w-[175px]"
          >
            <div className={`font-bold mb-2 flex items-center gap-1.5 ${esp32Online ? "text-green-400" : "text-gray-400"}`}>
              <span className={`w-2 h-2 rounded-full inline-block ${esp32Online ? "bg-green-400 animate-pulse" : "bg-gray-500"}`} />
              {esp32Online ? "ESP32 Live" : "ESP32 (нет GPS)"}
            </div>
            <div className="text-gray-300 space-y-1">
              {esp32Station.temperature != null && <div>🌡️ {esp32Station.temperature}°C</div>}
              {esp32Station.humidity != null && <div>💧 {esp32Station.humidity}%</div>}
              {esp32Station.co2_ppm != null && <div>🌱 CO₂: {esp32Station.co2_ppm} ppm</div>}
              {esp32Station.co_ppm != null && (
                <div className={esp32Station.co_ppm > 50 ? "text-orange-300" : "text-gray-300"}>
                  ⚠️ CO: {esp32Station.co_ppm} ppm
                </div>
              )}
              {esp32Station.ph != null && <div>⚗️ pH: {esp32Station.ph}</div>}
              {esp32Station.satellites != null && <div>🛰️ {esp32Station.satellites} спутников</div>}
            </div>
            <button
              onClick={() => openStation(esp32Station)}
              className="mt-2 w-full text-center text-green-300 border border-green-500/40 rounded-lg py-1 hover:bg-green-500/10 transition-colors"
            >
              Подробнее →
            </button>
          </motion.div>
        )}
      </div>

      {/* BLE подключение */}
      <div className="mt-3">
        <BluetoothConnect onDataReceived={handleBleData} />
      </div>

      {/* Track points table */}
      {fullGpsTrack.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowTrackTable(t => !t)}
            className="flex items-center gap-2 text-sm px-4 py-2 glass rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-all"
          >
            📍 {showTrackTable ? "Скрыть" : "Показать"} таблицу трека ({fullGpsTrack.length} точек)
          </button>
          {showTrackTable && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 glass rounded-xl neon-border overflow-hidden"
            >
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-xs font-mono-data">
                  <thead className="sticky top-0 bg-black/90">
                    <tr className="border-b border-white/10 text-left text-muted-foreground">
                      <th className="px-4 py-2">#</th>
                      <th className="px-4 py-2">Время</th>
                      <th className="px-4 py-2">Широта</th>
                      <th className="px-4 py-2">Долгота</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fullGpsTrack.map((p, i) => (
                      <tr
                        key={i}
                        className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                        onClick={() => leafletMap.current?.setView([p.lat, p.lng], 16, { animate: true })}
                      >
                        <td className="px-4 py-1.5 text-muted-foreground">{i + 1}</td>
                        <td className="px-4 py-1.5 text-foreground/70">{p.timestamp?.slice(11, 19)}</td>
                        <td className="px-4 py-1.5 text-primary">{p.lat.toFixed(6)}</td>
                        <td className="px-4 py-1.5 text-primary">{p.lng.toFixed(6)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      )}

      <StationModal
        station={selectedStation}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default StationsMapComponent;
