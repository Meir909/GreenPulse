import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const members = [
  {
    emoji: "👨‍💻",
    name: "Нурдаулет Мейірбек",
    role: "Project Lead & Software Engineer",
    skills: ["Python", "IoT", "Arduino", "Data Analysis"],
  },
  {
    emoji: "🔧",
    name: "Сапи Бекнұр",
    role: "Hardware Engineer",
    skills: ["Electronics", "Circuit Design", "Microcontrollers", "IoT"],
  },
];

const TeamSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="team" className="relative py-24 px-4" ref={ref}>
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest text-primary mb-3 font-mono-data">Команда</p>
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground">
            Біздің <span className="text-gradient">команда</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {members.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="glass rounded-xl p-8 neon-border hover:scale-[1.02] transition-transform duration-300 text-center"
            >
              <div className="text-5xl mb-4">{m.emoji}</div>
              <h3 className="font-headline text-xl font-bold text-foreground mb-1">{m.name}</h3>
              <p className="text-sm text-primary mb-4">{m.role}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {m.skills.map((s) => (
                  <span key={s} className="text-xs px-3 py-1 rounded-full border border-primary/30 text-primary bg-primary/5">
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center mt-8"
        >
          <span className="inline-block glass rounded-full px-6 py-2 text-sm text-muted-foreground border border-border">
            🏫 Ақтау НЗМ · 10-сынып · 2025
          </span>
        </motion.div>
      </div>
    </section>
  );
};

export default TeamSection;
