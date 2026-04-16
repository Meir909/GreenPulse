import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const cities = [
  { name: "Алматы", pm25: 28.2, whoMultiplier: 5.6, danger: true },
  { name: "Темиртау", pm25: 35.7, whoMultiplier: 7.1, danger: true },
  { name: "Ақтау", pm25: 18.1, whoMultiplier: 3.6, danger: false },
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
          <p className="text-sm uppercase tracking-widest text-destructive mb-3 font-mono-data">Мәселе</p>
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground mb-4">
            Ауа ластануы — <span className="text-destructive">тыныш дағдарыс</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {cities.map((city, i) => (
            <motion.div
              key={city.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className={`glass rounded-xl p-6 ${city.danger ? "glow-danger border-destructive/30" : "neon-border"}`}
            >
              <h3 className="font-headline text-xl font-bold text-foreground mb-1">{city.name}</h3>
              <p className="font-mono-data text-3xl font-bold text-foreground mb-1">
                {city.pm25} <span className="text-sm text-muted-foreground">мкг/м³</span>
              </p>
              <p className={`text-sm font-bold ${city.danger ? "text-destructive" : "text-secondary"}`}>
                {city.whoMultiplier}x WHO лимиті
              </p>
              {/* Progress bar */}
              <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${Math.min((city.whoMultiplier / 8) * 100, 100)}%` } : {}}
                  transition={{ duration: 1.2, delay: i * 0.2 + 0.3 }}
                  className={`h-full rounded-full ${city.danger ? "bg-destructive" : "bg-secondary"}`}
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
          <p className="font-mono-data text-5xl md:text-7xl font-bold text-destructive mb-2" style={{ textShadow: "0 0 40px rgba(255,68,68,0.3)" }}>
            7M+
          </p>
          <p className="text-lg text-muted-foreground">
            адам жыл сайын ауа ластануынан қайтыс болады
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSection;
