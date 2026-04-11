"use client";
import { useEffect, useRef, useState } from "react";

export interface SensorData {
  temperature?: number;
  humidity?: number;
  co2_ppm?: number;
  co_ppm?: number;
  ph?: number;
  light_intensity?: number;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  gps_valid?: boolean;
  timestamp?: string;
  station_name?: string;
}

export interface SensorState {
  sensorData: SensorData | null;
  connected: boolean;
  offline: boolean;
  loading: boolean;
  lastUpdate: Date | null;
}

const POLL_INTERVAL = 5000;
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export function useSensorSocket(): SensorState {
  const [sensorData, setSensorData]   = useState<SensorData | null>(null);
  const [connected, setConnected]     = useState(false);
  const [offline, setOffline]         = useState(false);
  const [loading, setLoading]         = useState(true);
  const [lastUpdate, setLastUpdate]   = useState<Date | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = async () => {
    try {
      const res  = await fetch(`${API_BASE}/api/sensor-data`, { cache: "no-store" });
      const json = await res.json();
      if (json.status === "ok" && json.data) {
        setSensorData(json.data);
        setConnected(true);
        setOffline(false);
        setLastUpdate(new Date());
      } else {
        setConnected(false);
        setOffline(true);
      }
    } catch {
      setConnected(false);
      setOffline(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Try WebSocket (socket.io) if available
    let socket: any = null;
    if (typeof window !== "undefined") {
      import("socket.io-client").then(({ io }) => {
        socket = io(API_BASE || window.location.origin, {
          transports: ["websocket", "polling"],
          timeout: 5000,
          reconnectionAttempts: 3,
        });
        socket.on("connect", () => {
          setConnected(true);
          setOffline(false);
          setLoading(false);
        });
        socket.on("disconnect", () => {
          setConnected(false);
        });
        socket.on("sensor_update", (data: SensorData) => {
          setSensorData(data);
          setConnected(true);
          setOffline(false);
          setLastUpdate(new Date());
        });
        socket.on("connect_error", () => {
          // Fall back to polling
          setConnected(false);
          if (!pollRef.current) {
            pollRef.current = setInterval(fetchData, POLL_INTERVAL);
          }
        });
      }).catch(() => {
        // socket.io not available — just poll
        pollRef.current = setInterval(fetchData, POLL_INTERVAL);
      });
    }
    return () => {
      socket?.disconnect();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  return { sensorData, connected, offline, loading, lastUpdate };
}
