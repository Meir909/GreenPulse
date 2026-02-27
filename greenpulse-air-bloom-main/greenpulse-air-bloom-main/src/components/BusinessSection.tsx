import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const streams = [
  { emoji: "🏫", title: "B2G", desc: "Мектептер мен муниципалитеттер", price: "$500-2000/bench" },
  { emoji: "🏢", title: "B2B", desc: "Компаниялар ESG мақсаттары", price: "$800-3000/bench" },
  { emoji: "🔬", title: "Гранттар", desc: "Қазақстан экология гранттары", price: "Мемлекеттік қолдау" },
  { emoji: "🌿", title: "Биомасса", desc: "Хлорелла сатылымы", price: "Қосымша табыс" },
];

const BusinessSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="business" className="relative py-24 px-4" ref={ref}>
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest text-primary mb-3 font-mono-data">Бизнес-модель</p>
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground">
            Табыс <span className="text-gradient">ағындары</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {streams.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass rounded-xl p-6 neon-border hover:scale-105 transition-transform duration-300 text-center"
            >
              <div className="text-4xl mb-4">{s.emoji}</div>
              <h3 className="font-headline font-bold text-lg text-foreground mb-1">{s.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{s.desc}</p>
              <p className="font-mono-data text-primary font-bold text-sm">{s.price}</p>
            </motion.div>
          ))}
        </div>

        {/* Unit Economics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="glass rounded-xl p-8 neon-border max-w-2xl mx-auto text-center"
        >
          <p className="text-sm text-muted-foreground mb-4 uppercase tracking-wider">Unit Economics</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div>
              <p className="text-xs text-muted-foreground">Құны</p>
              <p className="font-mono-data text-2xl font-bold text-foreground">107k ₸</p>
            </div>
            <span className="text-2xl text-muted-foreground">→</span>
            <div>
              <p className="text-xs text-muted-foreground">Сату</p>
              <p className="font-mono-data text-2xl font-bold text-primary">300-500k ₸</p>
            </div>
            <span className="text-2xl text-muted-foreground">→</span>
            <div>
              <p className="text-xs text-muted-foreground">Маржа</p>
              <p className="font-mono-data text-2xl font-bold text-gradient">65-75%</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BusinessSection;
