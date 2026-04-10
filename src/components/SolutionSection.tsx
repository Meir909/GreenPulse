import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Sprout, Wind, Leaf, Droplets, CheckCircle2 } from "lucide-react";

const steps = [
  { Icon: Sprout,       title: "Балдыр өсіру",        desc: "Growing algae culture", color: "#00ff88" },
  { Icon: Wind,         title: "Ластанған ауа кіреді", desc: "Polluted air enters",   color: "#f97316" },
  { Icon: Leaf,         title: "CO₂ сіңіреді",         desc: "Algae absorbs CO₂",     color: "#00d4ff" },
  { Icon: Droplets,     title: "Сорғы айналдырады",    desc: "Pump circulates",       color: "#7c3aed" },
  { Icon: CheckCircle2, title: "Таза ауа шығады",       desc: "Clean air exits",       color: "#00ff88" },
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
          <p className="text-xs uppercase tracking-widest text-[#00ff88] mb-3 font-mono-data">Шешім</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Қалай{" "}
            <span className="bg-gradient-to-r from-[#00ff88] to-[#00d4ff] bg-clip-text text-transparent">
              жұмыс істейді?
            </span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-16">
          {steps.map(({ Icon, title, desc, color }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card rounded-2xl p-5 text-center relative"
            >
              <div
                className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold font-mono-data text-black"
                style={{ background: color }}
              >
                {i + 1}
              </div>
              <div
                className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
                style={{ background: `${color}18`, border: `1px solid ${color}30` }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <p className="font-display font-bold text-xs text-white mb-1 leading-tight">{title}</p>
              <p className="text-[10px] text-white/30 font-body">{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Formula */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="glass-card rounded-2xl p-8 max-w-2xl mx-auto text-center"
        >
          <p className="text-xs text-white/25 mb-3 uppercase tracking-widest font-mono-data">
            Фотосинтез реакциясы
          </p>
          <p className="font-mono-data text-xl md:text-2xl text-[#00ff88] font-bold tracking-wide">
            6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂
          </p>
          <p className="text-xs text-white/35 mt-3 font-body">
            Микробалдырлар CO₂-ні сіңіріп, O₂ шығарады
          </p>
        </motion.div>

      </div>
    </section>
  );
};

export default SolutionSection;
