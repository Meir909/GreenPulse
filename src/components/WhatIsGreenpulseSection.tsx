import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FlaskConical, BarChart2, Radio, Globe } from "lucide-react";

const features = [
  { Icon: FlaskConical, title: "Биотехнология", desc: "Микробалдыр культурасы", color: "#00ff88" },
  { Icon: BarChart2,   title: "AI Анализ",      desc: "Экологиялық деректер",  color: "#00d4ff" },
  { Icon: Globe,       title: "Мониторинг",     desc: "Нақты уақыт деректері", color: "#7c3aed" },
  { Icon: Radio,       title: "Интеграция",     desc: "API & Веб платформасы", color: "#f97316" },
];

const WhatIsGreenpulseSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="what-is-greenpulse" className="relative py-24 px-4" ref={ref}>
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-widest text-[#00ff88] mb-3 font-mono-data">
            Платформа туралы
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
            GreenPulse қалай{" "}
            <span className="bg-gradient-to-r from-[#00ff88] to-[#00d4ff] bg-clip-text text-transparent">
              жұмыс істейді
            </span>
          </h2>
          <p className="text-lg text-white/50 max-w-3xl mx-auto font-body leading-relaxed">
            GreenPulse — қалалық ауаны тазартудың болашағы. Биомикробалдыр өндіктерін пайдалана отырып,
            ласталған ауаны таза қалпына келтіреміз және экологиялық деректерді нақты уақытта мониторингілейміз.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map(({ Icon, title, desc, color }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass-card rounded-xl p-6 text-center cursor-default"
            >
              <div
                className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: `${color}18`, border: `1px solid ${color}30` }}
              >
                <Icon size={22} style={{ color }} />
              </div>
              <h3 className="font-display font-bold text-white mb-2">{title}</h3>
              <p className="text-sm text-white/45 font-body">{desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="glass-card rounded-xl p-8 max-w-3xl mx-auto text-center"
        >
          <h3 className="font-display text-xl font-bold text-white mb-4">Технологиялық ядро</h3>
          <p className="text-white/50 mb-4 font-body leading-relaxed">
            Chlorella vulgaris және Spirulina микробалдырлары максималды CO₂ сіңіретін
            биологиялық реакторлар болып шиеленеді. AI бүтіндеген анализ көмегімен,
            барлық экологиялық көрсеткіштер мониторингі және болжалау жүргізіледі.
          </p>
          <p className="font-mono-data text-sm text-[#00ff88] tracking-wider">
            6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default WhatIsGreenpulseSection;
