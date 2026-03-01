import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface SensorData {
  temperature: number | null;
  ph: number | null;
  co2_ppm: number | null;
  humidity: number | null;
  light_intensity: number | null;
}

// Вычисляет эффективность фотосинтеза (0–1) по температуре
function photoEfficiency(temp: number): number {
  if (temp >= 40) return 0;           // смерть
  if (temp < 0)   return 0;           // лёд — гибель
  if (temp < 10)  return 0.02;        // почти стоп
  if (temp < 15)  return 0.15;        // спячка
  if (temp < 20)  return 0.45;        // замедление
  if (temp <= 30) return 1.0;         // оптимум
  if (temp <= 35) return 0.5;         // стресс
  return 0.1;                         // близко к гибели
}

// Статус балдыря по температуре
function algaeStatus(temp: number): { label: string; color: string; hint: string } {
  if (temp >= 40) return { label: "Қауіп! Балдыр өледі", color: "text-red-500",    hint: "Температура > 40°C — гибель клеток" };
  if (temp < 0)   return { label: "Мұз! Жүйе бұзылды",  color: "text-red-500",    hint: "Вода замерзает — клетки разрушаются" };
  if (temp < 10)  return { label: "Қауіпті зона",        color: "text-orange-500", hint: "Клетки повреждаются" };
  if (temp < 15)  return { label: "Ұйқы режимі",         color: "text-yellow-500", hint: "Минимальный фотосинтез" };
  if (temp < 20)  return { label: "Баяу режим",           color: "text-yellow-400", hint: "Фотосинтез замедлен" };
  if (temp <= 30) return { label: "Оптималды",            color: "text-primary",    hint: "Максимальное поглощение CO₂" };
  if (temp <= 35) return { label: "Стресс",               color: "text-orange-400", hint: "Фотосинтез снижается" };
  return           { label: "Өте қауіпті",               color: "text-red-400",    hint: "Балдыр стрессует, скоро погибнет" };
}

const BASE_CO2 = 430; // базовый уровень CO2 без поглощения

const DashboardSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [offline, setOffline] = useState(false);
  const [loading, setLoading] = useState(true);

  // Симулированные CO2 и pH на основе температуры
  const [simCo2, setSimCo2] = useState(BASE_CO2);
  const [simPh, setSimPh] = useState(7.0);
  const [co2History, setCo2History] = useState<{ time: string; value: number }[]>([]);

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

    } catch {
      setOffline(true);
      setLoading(false);
    }
  };

  // Симуляция CO2 и pH каждые 3 секунды на основе температуры
  useEffect(() => {
    if (!sensorData?.temperature) return;

    const interval = setInterval(() => {
      const temp = sensorData.temperature!;
      const eff = photoEfficiency(temp);

      // CO2 снижается пропорционально эффективности, с небольшим шумом
      setSimCo2(prev => {
        const noise = (Math.random() - 0.5) * 2;
        const absorption = eff * 1.5; // макс 1.5 ppm за тик при 100% эффективности
        const next = prev - absorption + noise;
        // Держим в диапазоне 380–450 (дрейфует обратно к базовому уровню)
        const drifted = next + (BASE_CO2 - next) * 0.01;
        return parseFloat(Math.max(380, Math.min(450, drifted)).toFixed(1));
      });

      // pH растёт при фотосинтезе (CO2 потребляется → H+ уменьшается → pH растёт)
      setSimPh(prev => {
        const noise = (Math.random() - 0.5) * 0.02;
        const delta = eff * 0.005;
        const next = prev + delta + noise;
        // Держим в диапазоне 6.5–7.8
        const drifted = next - (next - 7.0) * 0.005;
        return parseFloat(Math.max(6.5, Math.min(7.8, drifted)).toFixed(2));
      });

      // Обновляем историю CO2
      setCo2History(prev => {
        const now = new Date();
        const label = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
        return [...prev, { time: label, value: parseFloat(simCo2.toFixed(1)) }].slice(-10);
      });

    }, 3000);

    return () => clearInterval(interval);
  }, [sensorData?.temperature, simCo2]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const ph = simPh;
  const phAngle = ((ph - 6.5) / (7.8 - 6.5)) * 180;

  const temp = sensorData?.temperature ?? null;
  const status = temp != null ? algaeStatus(temp) : null;
  const eff = temp != null ? Math.round(photoEfficiency(temp) * 100) : 0;

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
            <p className="text-sm text-muted-foreground">Деректер жоқ. ESP32 станциясын қосыңыз.</p>
            <p className="text-xs text-muted-foreground mt-1 opacity-60">Нет данных. Подключите ESP32 станцию.</p>
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
                <p className="text-sm text-muted-foreground mb-2">pH деңгейі <span className="text-xs opacity-50">(симуляция)</span></p>
                <div className="relative w-48 h-24 mx-auto overflow-hidden">
                  <svg viewBox="0 0 200 100" className="w-full">
                    <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="hsl(144 30% 15%)" strokeWidth="12" strokeLinecap="round" />
                    <path
                      d="M 10 100 A 90 90 0 0 1 190 100"
                      fill="none"
                      stroke="url(#phGrad)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${Math.max(0, Math.min(1, phAngle / 180)) * 283} 283`}
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
                <p className="font-mono-data text-4xl font-bold text-center text-primary transition-all duration-1000">
                  {simPh.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground text-center mt-1">Норма: 6.5–7.5</p>
              </motion.div>

              {/* Temperature (реальная) */}
              {temp != null && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="glass rounded-xl p-6 neon-border"
                >
                  <p className="text-sm text-muted-foreground mb-2">Температура <span className="text-xs opacity-50">(ESP32)</span></p>
                  <p className="font-mono-data text-4xl font-bold text-primary">
                    {temp.toFixed(1)}°C
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Оптималды: 20-30°C</p>
                </motion.div>
              )}

              {/* Статус балдыря */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="glass rounded-xl p-6 neon-border"
              >
                <p className="text-sm text-muted-foreground mb-2">Балдыр күйі</p>
                {status ? (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-3 h-3 rounded-full ${eff > 50 ? "bg-primary animate-pulse-glow" : eff > 20 ? "bg-yellow-500" : "bg-red-500"}`} />
                      <span className={`font-bold text-sm ${status.color}`}>{status.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{status.hint}</p>
                    <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                      <div
                        className="h-1.5 rounded-full transition-all duration-1000"
                        style={{
                          width: `${eff}%`,
                          background: eff > 50 ? "hsl(153,100%,50%)" : eff > 20 ? "hsl(45,100%,50%)" : "hsl(0,75%,60%)"
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Фотосинтез: {eff}%</p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">Деректер жоқ</p>
                )}
              </motion.div>
            </div>

            {/* CO2 chart */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="glass rounded-xl p-6 neon-border"
              >
                <p className="text-sm text-muted-foreground mb-1">CO₂ (ppm) <span className="text-xs opacity-50">(симуляция)</span></p>
                <p className="font-mono-data text-3xl font-bold text-primary mb-4 transition-all duration-1000">
                  {simCo2.toFixed(1)}
                </p>
                {co2History.length > 1 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={co2History}>
                      <XAxis dataKey="time" tick={{ fill: "hsl(140 15% 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[375, 455]} tick={{ fill: "hsl(140 15% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: "#000", border: "1px solid hsl(153,100%,50%)", borderRadius: 8, fontSize: 11 }}
                        labelStyle={{ color: "hsl(153,100%,50%)" }}
                      />
                      <Bar dataKey="value" fill="hsl(153 100% 50%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    График 2+ өлшем кейін пайда болады...
                  </p>
                )}
              </motion.div>

              {/* Эффективность и температурная шкала */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="glass rounded-xl p-6 neon-border"
              >
                <p className="text-sm text-muted-foreground mb-4">Температура → Фотосинтез</p>
                <div className="space-y-2 text-xs">
                  {[
                    { range: "< 0°C",    label: "Мұз — жүйе бұзылды ❌", color: "bg-red-600",    eff: 0 },
                    { range: "0–10°C",   label: "Өте баяу — қауіп",      color: "bg-red-400",    eff: 2 },
                    { range: "10–15°C",  label: "Ұйқы режимі",           color: "bg-orange-500", eff: 15 },
                    { range: "15–20°C",  label: "Баяу",                  color: "bg-yellow-500", eff: 45 },
                    { range: "20–30°C",  label: "Оптималды ✅",          color: "bg-primary",    eff: 100 },
                    { range: "30–40°C",  label: "Стресс зонасы",         color: "bg-orange-400", eff: 30 },
                    { range: "> 40°C",   label: "Балдыр өледі ❌",       color: "bg-red-600",    eff: 0 },
                  ].map(row => (
                    <div key={row.range} className={`flex items-center gap-2 rounded px-2 py-1 ${temp != null && (
                      (row.range === "< 0°C"   && temp < 0)   ||
                      (row.range === "0–10°C"  && temp >= 0   && temp < 10)  ||
                      (row.range === "10–15°C" && temp >= 10  && temp < 15)  ||
                      (row.range === "15–20°C" && temp >= 15  && temp < 20)  ||
                      (row.range === "20–30°C" && temp >= 20  && temp <= 30) ||
                      (row.range === "30–40°C" && temp > 30   && temp <= 40) ||
                      (row.range === "> 40°C"  && temp > 40)
                    ) ? "ring-1 ring-white/30 bg-white/5" : ""}`}>
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${row.color}`} />
                      <span className="text-muted-foreground w-16 flex-shrink-0">{row.range}</span>
                      <span className="text-foreground/80 flex-1">{row.label}</span>
                      <span className="text-primary font-mono">{row.eff}%</span>
                    </div>
                  ))}
                </div>
                {temp != null && (
                  <p className="text-xs text-primary mt-3 font-mono">
                    Қазір: {temp.toFixed(1)}°C → {eff}% фотосинтез
                  </p>
                )}
              </motion.div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default DashboardSection;
