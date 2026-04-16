import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const stages = [
  { year: "2025", title: "Прототип", status: "done" },
  { year: "2025-26", title: "Пилот — 1 орындық, Ақтау мектебі", status: "current" },
  { year: "2026-27", title: "Кеңею — 10 орындық, 3 қала", status: "future" },
  { year: "2027-30", title: "Масштаб — 100+ орындық, ҚР", status: "future" },
  { year: "2030+", title: "Экспорт — ТМД нарықтары", status: "future" },
];

const RoadmapSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-24 px-4" ref={ref}>
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest text-primary mb-3 font-mono-data">Жол картасы</p>
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground">
            Даму <span className="text-gradient">жоспары</span>
          </h2>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Line */}
          <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5 bg-border" />
          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.5, delay: 0.3 }}
            className="hidden md:block absolute top-8 left-0 h-0.5 bg-primary origin-left"
            style={{ width: "20%" }}
          />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {stages.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.15, duration: 0.5 }}
                className="text-center"
              >
                <div className={`w-4 h-4 rounded-full mx-auto mb-4 ${
                  s.status === "done"
                    ? "bg-primary glow-primary"
                    : s.status === "current"
                    ? "bg-accent glow-accent animate-pulse-glow"
                    : "bg-muted"
                }`} />
                <p className="font-mono-data text-xs text-primary font-bold mb-1">{s.year}</p>
                <p className="text-sm text-foreground font-medium">{s.title}</p>
                {s.status === "done" && (
                  <span className="inline-block mt-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/30">
                    ✅ Done
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoadmapSection;
