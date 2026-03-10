import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const ESGAnalyticsSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const segments = [
    {
      emoji: "🏢",
      title: "Компаниялар",
      desc: "ESG мақсаттарын орындау",
      features: ["Карбон сызығы", "Ластану мониторингі", "Ауадағы балл"],
    },
    {
      emoji: "🏛️",
      title: "Үкіметтер",
      desc: "Экологиялық саясат",
      features: ["Қала берпесінің ластану", "Климат рәсімі", "Өндіс беттегі мониторингі"],
    },
    {
      emoji: "🌱",
      title: "Ұйымдар",
      desc: "Тұрақтылық жоспарлары",
      features: ["Экологиялық іс-әрекеттер", "Зеленые проекты", "ESG отчетность"],
    },
  ];

  const analytics = [
    { icon: "📊", title: "Экологиялық әсері", desc: "Углерод өндегін есептеу" },
    { icon: "💚", title: "Карбон ізі", desc: "CO₂ эквивалент орындау" },
    { icon: "📈", title: "Тұрақтылық", desc: "ESG бәлімдерінің бәрі" },
    { icon: "⚠️", title: "Қауіп индикаторлары", desc: "Экологиялық төмендегі сәйкес" },
  ];

  return (
    <section id="esg-analytics" className="relative py-24 px-4" ref={ref}>
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest text-secondary mb-3 font-mono-data">
            ESG Аналитика
          </p>
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground mb-6">
            Тұрақтылық <span className="text-gradient">Анализі</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            GreenPulse компаниялар мен үкіметтерге ESG аналитика берік платформасы болып табылады.
            Экологиялық әсерін өлшеңіз, карбон сызығын азайтыңыз және тұрақтылықты лояльтылы білгіле.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {segments.map((segment, i) => (
            <motion.div
              key={segment.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass rounded-xl p-6 neon-border hover:scale-105 transition-transform duration-300"
            >
              <div className="text-5xl mb-4">{segment.emoji}</div>
              <h3 className="font-headline text-xl font-bold text-foreground mb-2">{segment.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{segment.desc}</p>
              <ul className="space-y-2">
                {segment.features.map((feature) => (
                  <li key={feature} className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mb-8"
          >
            <h3 className="font-headline text-2xl font-bold text-foreground">ESG Аналитика Мүмкіндіктері</h3>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {analytics.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                className="glass rounded-xl p-6 neon-border text-center"
              >
                <div className="text-4xl mb-3">{item.icon}</div>
                <h4 className="font-headline font-bold text-foreground mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="glass rounded-xl p-8 neon-border max-w-3xl mx-auto"
        >
          <h3 className="font-headline text-xl font-bold text-foreground mb-4">Яғни ESG?</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-muted-foreground">
            <div>
              <p className="font-bold text-foreground mb-2">E — Environment</p>
              <p>Экологиялық әсер, климаттық өзгерістер, ластану</p>
            </div>
            <div>
              <p className="font-bold text-foreground mb-2">S — Social</p>
              <p>Әлеуметтік әділіктік, құрмет, қоғам ынамы</p>
            </div>
            <div>
              <p className="font-bold text-foreground mb-2">G — Governance</p>
              <p>Бәлімді біліндіктерінің төркірі, ешбір құраушалар</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ESGAnalyticsSection;
