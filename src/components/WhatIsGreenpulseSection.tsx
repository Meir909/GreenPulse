import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const WhatIsGreenpulseSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    { emoji: "🧬", title: "Биотехнология", desc: "Микробалдыр культурасы" },
    { emoji: "📊", title: "AI Анализ", desc: "Экологиялық деректер" },
    { emoji: "🌍", title: "Мониторинг", desc: "Нақты уақыт деректері" },
    { emoji: "📡", title: "Интеграция", desc: "API & Веб платформасы" },
  ];

  return (
    <section id="what-is-greenpulse" className="relative py-24 px-4" ref={ref}>
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest text-primary mb-3 font-mono-data">
            Платформа туралы
          </p>
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground mb-6">
            GreenPulse қалай <span className="text-gradient">жұмыс істейді</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            GreenPulse — қалалық ауаны тазартудың болашағы. Биомикробалдыр өндіктерін пайдалана отырып,
            ласталған ауаны таза қалпына келтіреміз және экологиялық деректерді нақты уақытта мониторингілейміз.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass rounded-xl p-6 neon-border hover:scale-105 transition-transform duration-300 text-center"
            >
              <div className="text-4xl mb-3">{feature.emoji}</div>
              <h3 className="font-headline font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="glass rounded-xl p-8 neon-border max-w-3xl mx-auto"
        >
          <h3 className="font-headline text-xl font-bold text-foreground mb-4">Технологиялық ядро</h3>
          <p className="text-muted-foreground mb-4">
            Chlorella vulgaris және Spirulina микробалдырлары максималды CO₂ сіңіретін
            биологиялық реакторлар болып шиеленеді. AI бүтіндеген анализ көмегімен,
            барлық экологиялық көрсеткіштер мониторингі және болжалау жүргізіледі.
          </p>
          <p className="font-mono-data text-sm text-primary">
            6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default WhatIsGreenpulseSection;
