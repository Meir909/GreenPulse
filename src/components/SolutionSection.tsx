import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const steps = [
  { emoji: "🌱", title: "Балдыр өсіру", desc: "Growing algae culture" },
  { emoji: "🫧", title: "Ластанған ауа кіреді", desc: "Polluted air enters" },
  { emoji: "🦠", title: "CO₂ сіңіреді", desc: "Algae absorbs CO₂" },
  { emoji: "💧", title: "Сорғы айналдырады", desc: "Pump circulates" },
  { emoji: "✅", title: "Таза ауа шығады", desc: "Clean air exits" },
];

const SolutionSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="solution" className="relative py-24 px-4" ref={ref}>
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest text-primary mb-3 font-mono-data">Шешім</p>
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground mb-4">
            Қалай <span className="text-gradient">жұмыс істейді?</span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 mb-16">
          {/* Connection line (desktop) */}
          <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-px bg-gradient-to-r from-primary/50 via-primary to-primary/50" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative z-10 glass rounded-xl p-5 text-center w-full md:w-44 neon-border hover:scale-105 transition-transform duration-300"
            >
              <div className="text-4xl mb-3">{step.emoji}</div>
              <p className="font-headline font-bold text-sm text-foreground mb-1">{step.title}</p>
              <p className="text-xs text-muted-foreground">{step.desc}</p>
              <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold font-mono-data">
                {i + 1}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Chemical formula */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center glass rounded-xl p-8 max-w-2xl mx-auto neon-border"
        >
          <p className="text-sm text-muted-foreground mb-3 uppercase tracking-wider">Фотосинтез реакциясы</p>
          <p className="font-mono-data text-xl md:text-2xl text-primary font-bold">
            6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            Микробалдырлар CO₂-ні сіңіріп, O₂ шығарады
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default SolutionSection;
