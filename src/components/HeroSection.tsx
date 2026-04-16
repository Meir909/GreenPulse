import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const HeroSection = () => {
  const [temperature, setTemperature] = useState<number | null>(null);
  const [ph, setPh] = useState<number | null>(null);
  const [co2, setCo2] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [offline, setOffline] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/sensor-data");
      const json = await res.json();
      if (json.status === "offline" || !json.data) {
        setOffline(true);
        return;
      }
      const d = json.data;
      setTemperature(d.temperature);
      setPh(d.ph);
      setCo2(d.co2_ppm);
      setHumidity(d.humidity);
      setOffline(false);
    } catch {
      setOffline(true);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const allCards = [
    { label: "Температура", value: temperature != null ? `${temperature.toFixed(1)}°C` : null, live: true },
    { label: "pH деңгейі",  value: ph != null ? ph.toFixed(1) : null },
    { label: "CO₂ (ppm)",   value: co2 != null ? String(co2) : null },
    { label: "Ылғалдылық",  value: humidity != null ? `${humidity.toFixed(0)}%` : null },
  ];

  // Показываем только карточки с реальными данными
  const cards = allCards.filter(c => c.value !== null);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      <div className="mesh-gradient absolute inset-0 z-0" />
      <div className="relative z-10 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="font-headline text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-gradient mb-6 tracking-tight">
            GreenPulse
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto mb-4 leading-relaxed">
            Биореакторлық орындық — қалалық ауаны тазартудың болашағы
          </p>
          <p className="text-sm text-muted-foreground mb-12">
            Chlorella vulgaris · Spirulina · Microalgae Bioreactor Technology
          </p>
        </motion.div>

        {/* Live Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className={`grid gap-4 max-w-4xl mx-auto ${cards.length === 1 ? "grid-cols-1 max-w-xs" : cards.length === 2 ? "grid-cols-2 max-w-lg" : "grid-cols-2 md:grid-cols-4"}`}
        >
          {cards.map((card, i) => (
            <div
              key={card.label}
              className="glass rounded-xl p-4 sm:p-5 neon-border relative group hover:scale-105 transition-transform duration-300"
            >
              {i === 0 && (
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${offline ? "bg-gray-500" : "bg-primary animate-pulse-glow"}`} />
                  <span className={`text-[10px] font-mono uppercase tracking-wider ${offline ? "text-gray-500" : "text-primary"}`}>
                    {offline ? "Offline" : "Live"}
                  </span>
                </div>
              )}
              <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
              <p className="font-mono-data text-2xl sm:text-3xl font-bold text-primary transition-all duration-700">
                {card.value}
              </p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="mt-16"
        >
          <a href="#problem" className="text-muted-foreground hover:text-primary transition-colors">
            <svg className="w-6 h-6 mx-auto animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
