import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const APIIntegrationSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const capabilities = [
    {
      emoji: "📊",
      title: "Экологиялық Деректер",
      desc: "Нақты уақыт экологиялық деректерінің API",
    },
    {
      emoji: "📈",
      title: "Тұрақтылық Индикаторлары",
      desc: "ESG және карбон өндік өлшемдері",
    },
    {
      emoji: "🌡️",
      title: "Климат Деректері",
      desc: "Температура, ластану, өндіс деректері",
    },
    {
      emoji: "⚠️",
      title: "Қауіп Ескертулері",
      desc: "Экологиялық төмен сәйкес ескерту",
    },
  ];

  const users = [
    { emoji: "🏢", name: "Компаниялар", desc: "ESG бақылау және есептеу" },
    { emoji: "🔬", name: "Ғылыми лабораториялар", desc: "Климат зерттеу деректері" },
    { emoji: "👨‍💻", name: "Бағдарламашылар", desc: "GreenTech қосымшалары құру" },
    { emoji: "🌱", name: "Экологиялық стартапты", desc: "Экологиялық шешімдер" },
  ];

  return (
    <section id="api-integration" className="relative py-24 px-4" ref={ref}>
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest text-primary mb-3 font-mono-data">
            API Интеграция
          </p>
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground mb-6">
            GreenPulse <span className="text-gradient">API</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Әрқайсысының ұйымы экологиялық деректерді өз жүйелеріне интеграция жүргіздіре алады.
            RESTful API арқылы экологиялық деректер, тұрақтылық көрсеткіштері және климат анализінің
            толық қолдануын білгіле.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {capabilities.map((capability, i) => (
            <motion.div
              key={capability.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass rounded-xl p-6 neon-border hover:scale-105 transition-transform duration-300"
            >
              <div className="text-4xl mb-3">{capability.emoji}</div>
              <h3 className="font-headline font-bold text-foreground mb-2">{capability.title}</h3>
              <p className="text-sm text-muted-foreground">{capability.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass rounded-xl p-8 neon-border mb-12"
        >
          <h3 className="font-headline text-xl font-bold text-foreground mb-6">API Ресурстары</h3>
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-4 pb-4 border-b border-muted/20">
              <span className="font-mono-data text-primary font-bold min-w-24">GET</span>
              <div>
                <p className="font-mono-data text-foreground">/api/sensor-data</p>
                <p className="text-xs text-muted-foreground mt-1">Экологиялық деректерді рет берік алу</p>
              </div>
            </div>
            <div className="flex items-start gap-4 pb-4 border-b border-muted/20">
              <span className="font-mono-data text-primary font-bold min-w-24">GET</span>
              <div>
                <p className="font-mono-data text-foreground">/api/city-ranking</p>
                <p className="text-xs text-muted-foreground mt-1">Қалалар ESG рейтингі алу</p>
              </div>
            </div>
            <div className="flex items-start gap-4 pb-4 border-b border-muted/20">
              <span className="font-mono-data text-primary font-bold min-w-24">POST</span>
              <div>
                <p className="font-mono-data text-foreground">/api/analyze-impact</p>
                <p className="text-xs text-muted-foreground mt-1">Экологиялық әсерін анализ жүргіз</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="font-mono-data text-primary font-bold min-w-24">GET</span>
              <div>
                <p className="font-mono-data text-foreground">/api/alerts</p>
                <p className="text-xs text-muted-foreground mt-1">Қауіп ескертулері және уведомленияләр</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h3 className="font-headline text-2xl font-bold text-foreground text-center mb-8">
            API Пайдаланушылары
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {users.map((user, i) => (
              <motion.div
                key={user.name}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.7 + i * 0.1, duration: 0.5 }}
                className="glass rounded-xl p-6 neon-border text-center"
              >
                <div className="text-4xl mb-3">{user.emoji}</div>
                <h4 className="font-headline font-bold text-foreground mb-2">{user.name}</h4>
                <p className="text-sm text-muted-foreground">{user.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default APIIntegrationSection;
