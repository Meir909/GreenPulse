import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, Tooltip } from "recharts";

interface SensorData {
  temperature: number | null;
  ph: number | null;
  co2_ppm: number | null;
  humidity: number | null;
  light_intensity: number | null;
}

const DashboardSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [offline, setOffline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [co2History, setCo2History] = useState<{ time: string; value: number }[]>([]);
  const [lastCo2, setLastCo2] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/sensor-data");
      const json = await res.json();

      if (json.status === "offline" || !json.data) {
        setOffline(true);
        setLoading(false);
        return;
      }

      const d: SensorData = json.data;
      setSensorData(d);
      setOffline(false);
      setLoading(false);

      // Обновляем историю CO2 (последние 5 точек)
      setCo2History(prev => {
        const now = new Date();
        const label = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
        const reduction = (lastCo2 != null && d.co2_ppm != null && lastCo2 !== 0)
          ? ((lastCo2 - d.co2_ppm) / lastCo2) * 100
          : 0;
        const next = [...prev, { time: label, value: parseFloat(reduction.toFixed(1)) }];
        return next.slice(-5);
      });
      setLastCo2(d.co2_ppm);

    } catch {
      setOffline(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // обновляем каждые 10 сек
    return () => clearInterval(interval);
  }, []);

  // pH gauge angle
  const ph = sensorData?.ph ?? 0;
  const phAngle = ph > 0 ? ((ph - 0) / 14) * 180 : 0;

  return (
    <section id="dashboard" className="relative py-24 px-4" ref={ref}>
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest text-primary mb-3 font-mono-data">Live Monitor</p>
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground">
            Нақты уақыт <span className="text-gradient">мониторингі</span>
          </h2>
        </motion.div>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            className="glass rounded-xl p-10 neon-border text-center"
          >
            <div className="text-4xl mb-4 animate-pulse">📡</div>
            <p className="text-muted-foreground">Деректер жүктелуде... / Загрузка данных...</p>
          </motion.div>
        ) : offline ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="glass rounded-xl p-10 neon-border text-center"
          >
            <div className="text-5xl mb-4">📡</div>
            <p className="text-xl font-bold text-muted-foreground mb-2">ESP32 офлайн</p>
            <p className="text-sm text-muted-foreground">
              Деректер жоқ. ESP32 станциясын қосыңыз.
            </p>
            <p className="text-xs text-muted-foreground mt-1 opacity-60">
              Нет данных. Подключите ESP32 станцию.
            </p>
          </motion.div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* pH Gauge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="glass rounded-xl p-6 neon-border lg:col-span-2"
              >
                <p className="text-sm text-muted-foreground mb-2">pH деңгейі</p>
                <div className="relative w-48 h-24 mx-auto overflow-hidden">
                  <svg viewBox="0 0 200 100" className="w-full">
                    <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="hsl(144 30% 15%)" strokeWidth="12" strokeLinecap="round" />
                    <path
                      d="M 10 100 A 90 90 0 0 1 190 100"
                      fill="none"
                      stroke="url(#phGrad)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${(phAngle / 180) * 283} 283`}
                    />
                    <defs>
                      <linearGradient id="phGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="hsl(0,75%,60%)" />
                        <stop offset="50%" stopColor="hsl(60,75%,60%)" />
                        <stop offset="100%" stopColor="hsl(153,100%,50%)" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <p className="font-mono-data text-4xl font-bold text-center text-primary">
                  {sensorData?.ph != null ? sensorData.ph.toFixed(1) : "—"}
                </p>
              </motion.div>

              {/* Temperature */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="glass rounded-xl p-6 neon-border"
              >
                <p className="text-sm text-muted-foreground mb-2">Температура</p>
                <p className="font-mono-data text-4xl font-bold text-primary">
                  {sensorData?.temperature != null ? `${sensorData.temperature.toFixed(1)}°C` : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-2">Оптималды: 20-25°C</p>
              </motion.div>

              {/* Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="glass rounded-xl p-6 neon-border"
              >
                <p className="text-sm text-muted-foreground mb-2">Жүйе күйі</p>
                {sensorData ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-3 h-3 rounded-full bg-primary animate-pulse-glow" />
                      <span className="font-headline font-bold text-primary">Белсенді</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Барлық датчиктер қалыпты</p>
                  </>
                ) : (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-3 h-3 rounded-full bg-gray-500" />
                    <span className="font-headline font-bold text-gray-500">Жүктелуде...</span>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              {/* CO2 chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="glass rounded-xl p-6 neon-border"
              >
                <p className="text-sm text-muted-foreground mb-1">CO₂ (ppm)</p>
                <p className="font-mono-data text-3xl font-bold text-primary mb-4">
                  {sensorData ? sensorData.co2_ppm : "—"}
                </p>
                {co2History.length > 1 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={co2History}>
                      <XAxis dataKey="time" tick={{ fill: "hsl(140 15% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "hsl(140 15% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Bar dataKey="value" fill="hsl(153 100% 50%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    График 2+ өлшем кейін пайда болады...
                  </p>
                )}
              </motion.div>

              {/* Humidity + Light */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="glass rounded-xl p-6 neon-border"
              >
                <p className="text-sm text-muted-foreground mb-4">Қосымша деректер</p>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Ылғалдылық / Влажность</p>
                    <p className="font-mono-data text-3xl font-bold text-primary">
                      {sensorData?.humidity != null ? `${sensorData.humidity.toFixed(0)}%` : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">Оптималды: 60-80%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Жарық / Освещённость</p>
                    <p className="font-mono-data text-3xl font-bold text-primary">
                      {sensorData ? `${sensorData.light_intensity} lux` : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">Оптималды: 400-600 lux</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default DashboardSection;
