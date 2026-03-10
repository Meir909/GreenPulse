import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const OpenDataSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const benefits = [
    {
      emoji: "📚",
      title: "Ашық Өндік",
      desc: "Барлығына қолжетімді экологиялық деректер",
    },
    {
      emoji: "🔬",
      title: "Ғылыми Зерттеу",
      desc: "Климат және экология ғылыми деректері",
    },
    {
      emoji: "🌍",
      title: "Климат Сәйкестігі",
      desc: "Орындарының белгіленген материалдар",
    },
    {
      emoji: "💡",
      title: "Экологиялық Сәйкес",
      desc: "Жамыршылықты барлығындағы білгісі",
    },
  ];

  const features = [
    "Ашық экологиялық деректер",
    "Спутниктік бейнелер",
    "Климат моделі",
    "Ластану индикаторлары",
    "Төрт беттегі өндік",
    "API қолдау",
  ];

  return (
    <section id="open-data" className="relative py-24 px-4" ref={ref}>
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest text-secondary mb-3 font-mono-data">
            Ашық Өндік
          </p>
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground mb-6">
            Экологиялық <span className="text-gradient">Ашық Өндік</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            GreenPulse ашық ғылыми деректер болмасы бәлімдегі әділі құрмет білім. Барлығы
            экологиялық деректерге қолдау алу, климаттық ғылым орындалуы және орындықтағы
            өндіктік білік берсін.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass rounded-xl p-6 neon-border hover:scale-105 transition-transform duration-300"
            >
              <div className="text-4xl mb-3">{benefit.emoji}</div>
              <h3 className="font-headline font-bold text-foreground mb-2">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">{benefit.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass rounded-xl p-8 neon-border mb-12"
        >
          <h3 className="font-headline text-xl font-bold text-foreground mb-6">Ашық Өндік Мүмкіндіктері</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="glass rounded-xl p-8 neon-border"
        >
          <h3 className="font-headline text-xl font-bold text-foreground mb-4">Ашық Деректер Форматы</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-headline font-bold text-foreground mb-3">CSV & JSON</h4>
              <p className="text-sm text-muted-foreground">
                Экологиялық деректер CSV, JSON форматында қолжетімді болған. Ғалымдар
                өндіктің өндіс анализінде пайдалану үшін ағдарында болған.
              </p>
            </div>
            <div>
              <h4 className="font-headline font-bold text-foreground mb-3">GeoJSON Карталар</h4>
              <p className="text-sm text-muted-foreground">
                Спутниктік аялыстарының GeoJSON форматында облағарында ақ деректер.
                Картаулы сайттарына интеграция жүргіздіңіз.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-muted/20">
            <h4 className="font-headline font-bold text-foreground mb-4">Лицензия</h4>
            <p className="text-sm text-muted-foreground">
              Барлығындағы өндіктер CC BY 4.0 лицензиясында жүргізіледі.
              Біз білік өндіктігін шарттарында өндіс сәйкес дәңгейде пайдалану рұқсат берем.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default OpenDataSection;
