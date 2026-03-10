import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const DataDashboardSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const metrics = [
    { emoji: "🌿", title: "NDVI Индекс", desc: "Растительность покрытие" },
    { emoji: "💨", title: "Загрязнение", desc: "PM2.5, PM10, NO₂, SO₂" },
    { emoji: "🌡️", title: "Климат", desc: "Температура и влажность" },
    { emoji: "📡", title: "Спутник", desc: "Земельное сканирование" },
  ];

  return (
    <section id="data-dashboard" className="relative py-24 px-4" ref={ref}>
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest text-secondary mb-3 font-mono-data">
            Аналитика
          </p>
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground mb-6">
            Экологиялық <span className="text-gradient">Дата Панель</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            GreenPulse визуалды аналитика панелі арқылы экологиялық деректерді мониторингі және
            анализ жүргіземіз. Спутниктік деректер, қалам сенсорлары және AI модельдерін біріктіре отырып.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass rounded-xl p-6 neon-border hover:scale-105 transition-transform duration-300"
            >
              <div className="text-4xl mb-3">{metric.emoji}</div>
              <h3 className="font-headline font-bold text-foreground mb-2">{metric.title}</h3>
              <p className="text-sm text-muted-foreground">{metric.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="glass rounded-xl p-8 neon-border"
        >
          <h3 className="font-headline text-xl font-bold text-foreground mb-6">Панельдің мүмкіндіктері</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-headline font-bold text-foreground mb-3">Өлшемдер</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ NDVI растительности индексі</li>
                <li>✓ Атмосфералық ластану деңгейі</li>
                <li>✓ Климаттық параметрлер</li>
                <li>✓ CO₂ және озон концентрациясы</li>
              </ul>
            </div>
            <div>
              <h4 className="font-headline font-bold text-foreground mb-3">Функциялар</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Нақты уақыт мониторингі</li>
                <li>✓ Тарихи деректер анализі</li>
                <li>✓ Болжалау және тенденциялар</li>
                <li>✓ Интерактивті карталар</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DataDashboardSection;