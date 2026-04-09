import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line } from "recharts";
import { useSensorSocket } from "@/hooks/useSensorSocket";
import { calculateAQI } from "@/lib/aqi";

// Вычисляет эффективность фотосинтеза (0–1) по температуре
function photoEfficiency(temp: number): number {
  if (temp >= 40) return 0;
  if (temp < 0)   return 0;
  if (temp < 10)  return 0.02;
  if (temp < 15)  return 0.15;
  if (temp < 20)  return 0.45;
  if (temp <= 30) return 1.0;
  if (temp <= 35) return 0.5;
  return 0.1;
}

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

function coStatus(co: number): { label: string; color: string; bg: string } {
  if (co < 10)   return { label: "Чистый",       color: "text-primary",   bg: "from-green-500/20" };
  if (co < 50)   return { label: "Норма",         color: "text-primary",   bg: "from-green-500/20" };
  if (co < 100)  return { label: "Повышен",       color: "text-yellow-400", bg: "from-yellow-500/20" };
  if (co < 200)  return { label: "Опасно",        color: "text-orange-400", bg: "from-orange-500/20" };
  return           { label: "Критично!",          color: "text-red-500",   bg: "from-red-500/20" };
}

const BASE_CO2 = 430;

// Метрика карточка с цветной полосой сверху
interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  sublabel?: string;
  topColor: string; // tailwind gradient class
  badge?: string;
  badgeColor?: string;
  pulse?: boolean;
  delay?: number;
  inView: boolean;
  children?: React.ReactNode;
}

function MetricCard({ label, value, unit, sublabel, topColor, badge, badgeColor, pulse, delay = 0, inView, children }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5 }}
      className="glass rounded-xl neon-border overflow-hidden cursor-default hover:scale-[1.01] transition-transform duration-200"
    >
      {/* Цветная полоса сверху */}
      <div className={`h-1 w-full bg-gradient-to-r ${topColor}`} />
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-muted-foreground">{label}</p>
          {badge && (
            <span className={`text-xs px-2 py-0.5 rounded-full border ${badgeColor || "border-primary/40 text-primary"}`}>
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-end gap-1">
          <p className={`font-mono-data text-4xl font-bold text-primary transition-all duration-700 ${pulse ? "animate-pulse" : ""}`}>
            {value}
          </p>
          {unit && <p className="text-muted-foreground text-sm mb-1">{unit}</p>}
        </div>
        {sublabel && <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>}
        {children}
      </div>
    </motion.div>
  );
}

const DashboardSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [fullscreen, setFullscreen] = useState(false);

  const { sensorData, connected, offline, loading } = useSensorSocket();

  // Симулированные CO2 и pH на основе температуры (только если нет реальных данных)
  const [simCo2, setSimCo2] = useState(BASE_CO2);
  const [simPh, setSimPh] = useState(7.0);
  const [co2History, setCo2History] = useState<{ time: string; value: number }[]>([]);

  // Escape key to exit fullscreen
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFullscreen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!sensorData?.temperature) return;
    const interval = setInterval(() => {
      const temp = sensorData.temperature!;
      const eff = photoEfficiency(temp);

      setSimCo2(prev => {
        const noise = (Math.random() - 0.5) * 2;
        const absorption = eff * 1.5;
        const next = prev - absorption + noise;
        const drifted = next + (BASE_CO2 - next) * 0.01;
        return parseFloat(Math.max(380, Math.min(450, drifted)).toFixed(1));
      });

      setSimPh(prev => {
        const noise = (Math.random() - 0.5) * 0.02;
        const delta = eff * 0.005;
        const next = prev + delta + noise;
        const drifted = next - (next - 7.0) * 0.005;
        return parseFloat(Math.max(6.5, Math.min(7.8, drifted)).toFixed(2));
      });

      setCo2History(prev => {
        const now = new Date();
        const label = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
        return [...prev, { time: label, value: parseFloat(simCo2.toFixed(1)) }].slice(-12);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [sensorData?.temperature, simCo2]);

  const ph = sensorData?.ph ?? simPh;
  const phAngle = ((ph - 6.5) / (7.8 - 6.5)) * 180;
  const temp = sensorData?.temperature ?? null;
  const humidity = sensorData?.humidity ?? null;
  const co2 = sensorData?.co2_ppm ?? simCo2;
  const coPpm = sensorData?.co_ppm ?? null;
  const status = temp != null ? algaeStatus(temp) : null;
  const eff = temp != null ? Math.round(photoEfficiency(temp) * 100) : 0;
  const coStat = coPpm != null ? coStatus(coPpm) : null;
  const aqi = calculateAQI(coPpm, co2, temp);

  const sectionClass = fullscreen
    ? "fixed inset-0 z-40 bg-background overflow-y-auto py-8 px-4"
    : "relative py-24 px-4";

  return (
    <section id="dashboard" className={sectionClass} ref={ref}>
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

          {/* Статус + AQI + fullscreen */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-3 mt-4 flex-wrap"
          >
            <span className={`w-2 h-2 rounded-full ${connected ? "bg-primary animate-pulse" : offline ? "bg-red-500" : "bg-yellow-500 animate-pulse"}`} />
            <span className="text-xs text-muted-foreground font-mono-data">
              {connected ? "WebSocket подключён" : offline ? "ESP32 офлайн" : "Подключение..."}
            </span>
            <span className={`text-xs px-3 py-1 rounded-full border font-mono-data font-semibold ${aqi.bgColor} ${aqi.color}`}>
              {aqi.emoji} AQI {aqi.score} — {aqi.label}
            </span>
            <button
              onClick={() => setFullscreen(f => !f)}
              className="text-xs px-3 py-1 rounded-full border border-white/20 text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"
              title={fullscreen ? "Выйти из полноэкранного режима (Esc)" : "Полноэкранный режим"}
            >
              {fullscreen ? "✕ Выйти" : "⛶ Полный экран"}
            </button>
          </motion.div>
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
            {/* Row 1: Температура | Влажность | CO (MQ-7) */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <MetricCard
                label="Температура"
                value={temp != null ? temp.toFixed(1) : "—"}
                unit="°C"
                sublabel="Оптимум: 20–30°C"
                topColor="from-orange-500 to-orange-300"
                badge="ESP32"
                badgeColor="border-orange-400/40 text-orange-300"
                delay={0.1}
                inView={inView}
              />

              <MetricCard
                label="Влажность"
                value={humidity != null ? humidity.toFixed(1) : "—"}
                unit="%"
                sublabel="Норма: 60–80%"
                topColor="from-blue-500 to-cyan-400"
                badge="ESP32"
                badgeColor="border-blue-400/40 text-blue-300"
                delay={0.2}
                inView={inView}
              >
                {humidity != null && (
                  <div className="mt-3 w-full bg-muted rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(100, humidity)}%`,
                        background: humidity >= 60 && humidity <= 80 ? "hsl(153,100%,50%)" : humidity < 60 ? "hsl(45,100%,50%)" : "hsl(0,75%,60%)"
                      }}
                    />
                  </div>
                )}
              </MetricCard>

              <MetricCard
                label="CO (угарный газ) MQ-7"
                value={coPpm != null ? coPpm.toFixed(0) : "—"}
                unit="ppm"
                sublabel="Норма: < 50 ppm"
                topColor={coStat ? `${coStat.bg} to-transparent` : "from-gray-500 to-gray-400"}
                badge={coStat?.label}
                badgeColor={coPpm != null && coPpm < 50 ? "border-primary/40 text-primary" : "border-red-400/40 text-red-300"}
                delay={0.3}
                inView={inView}
              >
                {coPpm != null && (
                  <div className="mt-3 w-full bg-muted rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(100, (coPpm / 200) * 100)}%`,
                        background: coPpm < 50 ? "hsl(153,100%,50%)" : coPpm < 100 ? "hsl(45,100%,50%)" : "hsl(0,75%,60%)"
                      }}
                    />
                  </div>
                )}
              </MetricCard>
            </div>

            {/* Row 2: pH gauge | CO2 chart | Статус балдыря */}
            <div className="grid md:grid-cols-3 gap-6">

              {/* pH Gauge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="glass rounded-xl neon-border overflow-hidden hover:scale-[1.01] transition-transform duration-200"
              >
                <div className="h-1 w-full bg-gradient-to-r from-green-500 to-emerald-400" />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">pH деңгейі</p>
                    <span className="text-xs px-2 py-0.5 rounded-full border border-green-400/40 text-green-300">
                      {sensorData?.ph ? "ESP32" : "Симуляция"}
                    </span>
                  </div>
                  <div className="relative w-44 h-22 mx-auto overflow-hidden">
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
                    {ph.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground text-center mt-1">Норма: 6.5–7.5</p>
                </div>
              </motion.div>

              {/* CO2 chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="glass rounded-xl neon-border overflow-hidden hover:scale-[1.01] transition-transform duration-200"
              >
                <div className="h-1 w-full bg-gradient-to-r from-primary to-cyan-400" />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-muted-foreground">CO₂ (ppm)</p>
                    <span className="text-xs px-2 py-0.5 rounded-full border border-primary/40 text-primary">
                      {sensorData?.co2_ppm ? "ESP32" : "Симуляция"}
                    </span>
                  </div>
                  <p className="font-mono-data text-3xl font-bold text-primary mb-3 transition-all duration-700">
                    {co.toFixed(1)}
                  </p>
                  {co2History.length > 1 ? (
                    <ResponsiveContainer width="100%" height={130}>
                      <LineChart data={co2History}>
                        <XAxis dataKey="time" tick={{ fill: "hsl(140 15% 55%)", fontSize: 9 }} axisLine={false} tickLine={false} hide />
                        <YAxis domain={[375, 455]} tick={{ fill: "hsl(140 15% 55%)", fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                        <Tooltip
                          contentStyle={{ background: "#000", border: "1px solid hsl(153,100%,50%)", borderRadius: 8, fontSize: 11 }}
                          labelStyle={{ color: "hsl(153,100%,50%)" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="hsl(153 100% 50%)"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4, fill: "hsl(153 100% 50%)" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-8">
                      График 2+ өлшем кейін...
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Норма: 400–450 ppm</p>
                </div>
              </motion.div>

              {/* Статус балдыря */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="glass rounded-xl neon-border overflow-hidden hover:scale-[1.01] transition-transform duration-200"
              >
                <div className={`h-1 w-full bg-gradient-to-r ${eff > 50 ? "from-primary to-green-400" : eff > 20 ? "from-yellow-500 to-orange-400" : "from-red-500 to-red-400"}`} />
                <div className="p-6">
                  <p className="text-sm text-muted-foreground mb-3">Балдыр күйі / Фотосинтез</p>
                  {status ? (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-3 h-3 rounded-full flex-shrink-0 ${eff > 50 ? "bg-primary animate-pulse-glow" : eff > 20 ? "bg-yellow-500" : "bg-red-500"}`} />
                        <span className={`font-bold text-sm ${status.color}`}>{status.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{status.hint}</p>

                      {/* Большая шкала эффективности */}
                      <div className="w-full bg-muted rounded-full h-3 mb-1">
                        <div
                          className="h-3 rounded-full transition-all duration-1000"
                          style={{
                            width: `${eff}%`,
                            background: eff > 50 ? "hsl(153,100%,50%)" : eff > 20 ? "hsl(45,100%,50%)" : "hsl(0,75%,60%)"
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-3">
                        <span>0%</span>
                        <span className="text-primary font-mono-data font-bold">{eff}%</span>
                        <span>100%</span>
                      </div>

                      {/* Мини таблица температур */}
                      <div className="space-y-1 text-xs">
                        {[
                          { range: "20–30°C", label: "Оптималды ✅", color: "bg-primary", eff: 100, active: temp != null && temp >= 20 && temp <= 30 },
                          { range: "15–20°C", label: "Баяу",          color: "bg-yellow-500", eff: 45, active: temp != null && temp >= 15 && temp < 20 },
                          { range: "30–40°C", label: "Стресс",         color: "bg-orange-400", eff: 30, active: temp != null && temp > 30 && temp <= 40 },
                          { range: "< 10°C",  label: "Қауіп",          color: "bg-red-400",    eff: 2,  active: temp != null && temp < 10 },
                        ].map(row => (
                          <div key={row.range} className={`flex items-center gap-2 rounded px-2 py-1 ${row.active ? "ring-1 ring-white/30 bg-white/5" : ""}`}>
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${row.color}`} />
                            <span className="text-muted-foreground w-16 flex-shrink-0">{row.range}</span>
                            <span className="text-foreground/80 flex-1 truncate">{row.label}</span>
                            <span className="text-primary font-mono">{row.eff}%</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">Деректер жоқ</p>
                  )}
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
