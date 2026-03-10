import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const CityRankingSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const cities = [
    { name: "Нур-Султан", score: 78, trend: "↑", category: "Жақсы" },
    { name: "Қарағанды", score: 65, trend: "→", category: "Орташа" },
    { name: "Ақтау", score: 72, trend: "↑", category: "Жақсы" },
    { name: "Алматы", score: 58, trend: "↓", category: "Нашар" },
    { name: "Темиртау", score: 52, trend: "↓", category: "Нашар" },
    { name: "Өскемен", score: 61, trend: "→", category: "Орташа" },
  ];

  const metrics = [
    { label: "Жасыл аймақ", emoji: "🌳", desc: "Ағас қабындысы %" },
    { label: "Ластану", emoji: "💨", desc: "PM2.5 деңгейі" },
    { label: "Климат", emoji: "🌡️", desc: "Температура сайлана" },
    { label: "Төрт білік", emoji: "🌍", desc: "Ішіндегі орташа" },
  ];

  return (
    <section id="city-ranking" className="relative py-24 px-4" ref={ref}>
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest text-secondary mb-3 font-mono-data">
            Қалалар рейтингі
          </p>
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground mb-6">
            GreenPulse <span className="text-gradient">Қалалар Индексі</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            GreenPulse қалалардың экологиялық сапасын рейтингтеңі. 0-100 ішіндегі балл төмендегі өлшемдерге негізделген:
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass rounded-xl p-6 neon-border text-center"
            >
              <div className="text-3xl mb-2">{metric.emoji}</div>
              <h3 className="font-headline font-bold text-foreground mb-1">{metric.label}</h3>
              <p className="text-xs text-muted-foreground">{metric.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="glass rounded-xl neon-border overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary/20">
                  <th className="px-6 py-4 text-left text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    Қала
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    Балл
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    Тенденция
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    Статус
                  </th>
                </tr>
              </thead>
              <tbody>
                {cities.map((city, i) => (
                  <motion.tr
                    key={city.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    className="border-b border-muted/20 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 font-headline font-bold text-foreground">{city.name}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-mono-data text-xl font-bold text-primary">
                        {city.score}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">/100</span>
                    </td>
                    <td className="px-6 py-4 text-center text-lg">
                      <span className={city.trend === "↑" ? "text-secondary" : city.trend === "↓" ? "text-destructive" : "text-muted-foreground"}>
                        {city.trend}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-xs font-bold ${city.category === "Жақсы" ? "text-secondary" : city.category === "Нашар" ? "text-destructive" : "text-yellow-500"}`}>
                        {city.category}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 glass rounded-xl p-6 neon-border text-center"
        >
          <p className="text-sm text-muted-foreground mb-2">
            Индекс әрбір апта жаңартылады
          </p>
          <p className="text-xs text-muted-foreground">
            Барлық деректер спутниктік бақылау, қалам сенсорлары және AI анализінен алынады
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CityRankingSection;