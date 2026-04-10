import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { AlertTriangle } from "lucide-react";

const cities = [
  { name: "Алматы",   pm25: 28.2, who: 5.6, danger: true  },
  { name: "Темиртау", pm25: 35.7, who: 7.1, danger: true  },
  { name: "Ақтау",    pm25: 18.1, who: 3.6, danger: false },
];

const ProblemSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="problem" className="relative py-24 px-4" ref={ref}>
      <div className="container mx-auto max-w-6xl">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-widest text-[#ef4444] mb-3 font-mono-data">Мәселе</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Ауа ластануы —{" "}
            <span className="bg-gradient-to-r from-[#ef4444] to-[#f97316] bg-clip-text text-transparent">
              тыныш дағдарыс
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {cities.map((city, i) => (
            <motion.div
              key={city.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl font-bold text-white">{city.name}</h3>
                {city.danger && (
                  <AlertTriangle size={16} className="text-[#ef4444]" />
                )}
              </div>
              <p className="font-mono-data text-4xl font-bold text-white mb-1">
                {city.pm25}
                <span className="text-sm text-white/30 ml-1">мкг/м³</span>
              </p>
              <p className={`text-sm font-bold mb-4 ${city.danger ? "text-[#ef4444]" : "text-[#00ff88]"}`}>
                {city.who}× WHO нормасы
              </p>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${Math.min((city.who / 8) * 100, 100)}%` } : {}}
                  transition={{ duration: 1.2, delay: i * 0.2 + 0.3 }}
                  className="h-full rounded-full"
                  style={{ background: city.danger ? "#ef4444" : "#00ff88" }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <p
            className="font-mono-data text-6xl md:text-8xl font-bold mb-3 bg-gradient-to-r from-[#ef4444] to-[#f97316] bg-clip-text text-transparent"
            style={{ filter: "drop-shadow(0 0 40px rgba(239,68,68,0.25))" }}
          >
            7M+
          </p>
          <p className="text-lg text-white/50 font-body">
            адам жыл сайын ауа ластануынан қайтыс болады
          </p>
        </motion.div>

      </div>
    </section>
  );
};

export default ProblemSection;
