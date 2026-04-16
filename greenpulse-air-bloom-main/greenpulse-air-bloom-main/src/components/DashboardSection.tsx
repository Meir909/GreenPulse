import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, Tooltip } from "recharts";

const co2Data = [
  { time: "0h", value: 0 },
  { time: "1h", value: -5 },
  { time: "2h", value: -10 },
  { time: "3h", value: -15 },
  { time: "4h", value: -18 },
];

const biomassData = [
  { t: 0, od: 0.2 },
  { t: 1, od: 0.28 },
  { t: 2, od: 0.35 },
  { t: 3, od: 0.42 },
  { t: 4, od: 0.55 },
  { t: 5, od: 0.61 },
  { t: 6, od: 0.68 },
];

const DashboardSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [ph, setPh] = useState(6.0);
  const [temp, setTemp] = useState(23.8);

  useEffect(() => {
    if (!inView) return;
    const interval = setInterval(() => {
      setPh((p) => Math.min(7.6, p + 0.02 + Math.random() * 0.03));
      setTemp((t) => 24 + Math.sin(Date.now() / 3000) * 0.8);
    }, 500);
    return () => clearInterval(interval);
  }, [inView]);

  // pH gauge
  const phAngle = ((ph - 0) / 14) * 180;

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
              {/* Semicircle bg */}
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
            <p className="font-mono-data text-4xl font-bold text-center text-primary">{ph.toFixed(1)}</p>
          </motion.div>

          {/* Temperature */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="glass rounded-xl p-6 neon-border"
          >
            <p className="text-sm text-muted-foreground mb-2">Температура</p>
            <p className="font-mono-data text-4xl font-bold text-primary">{temp.toFixed(1)}°C</p>
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
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-primary animate-pulse-glow" />
              <span className="font-headline font-bold text-primary">Белсенді</span>
            </div>
            <p className="text-xs text-muted-foreground">Барлық датчиктер қалыпты</p>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* CO2 Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="glass rounded-xl p-6 neon-border"
          >
            <p className="text-sm text-muted-foreground mb-4">CO₂ азаюы (%)</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={co2Data}>
                <XAxis dataKey="time" tick={{ fill: "hsl(140 15% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(140 15% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Bar dataKey="value" fill="hsl(153 100% 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Biomass Line Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="glass rounded-xl p-6 neon-border"
          >
            <p className="text-sm text-muted-foreground mb-4">Биомасса өсуі (OD)</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={biomassData}>
                <XAxis dataKey="t" tick={{ fill: "hsl(140 15% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(140 15% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(144 30% 8%)", border: "1px solid hsl(153 100% 50% / 0.3)", borderRadius: 8, color: "#e8f5e9" }} />
                <Line type="monotone" dataKey="od" stroke="hsl(168 100% 50%)" strokeWidth={2} dot={{ fill: "hsl(153 100% 50%)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DashboardSection;
