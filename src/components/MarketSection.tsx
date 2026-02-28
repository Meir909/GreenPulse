import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const MarketSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const circles = [
    { label: "TAM", value: "$4.2B", desc: "Жаһандық ауа тазарту нарығы", position: "left" },
    { label: "SAM", value: "$280M", desc: "ТМД + Орталық Азия", position: "center" },
    { label: "SOM", value: "$18M", desc: "ҚР мектептер + қалалар", position: "right" },
  ];

  return (
    <section className="relative py-24 px-4" ref={ref}>
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest text-primary mb-3 font-mono-data">Нарық</p>
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground">
            Нарық <span className="text-gradient">талдауы</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 grid-cols-1 gap-8 md:gap-4">
          {circles.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, scale: 0 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2 + i * 0.2, duration: 0.6, type: "spring" }}
              className="flex flex-col items-center justify-center text-center rounded-full border p-6 md:p-4"
              style={{
                aspectRatio: "1 / 1",
                borderColor: i === 0 ? "hsl(153 100% 50% / 0.95)" : i === 1 ? "hsl(153 100% 50% / 0.75)" : "hsl(153 100% 50% / 0.45)",
                background: i === 0
                  ? "hsl(153 100% 50% / 0.25)"
                  : i === 1
                  ? "hsl(153 100% 50% / 0.14)"
                  : "hsl(153 100% 50% / 0.08)",
                boxShadow: i === 0
                  ? "0 0 60px hsl(153 100% 50% / 0.6), 0 0 120px hsl(153 100% 50% / 0.3), inset 0 0 40px hsl(153 100% 50% / 0.2)"
                  : i === 1
                  ? "0 0 40px hsl(153 100% 50% / 0.4), 0 0 80px hsl(153 100% 50% / 0.2), inset 0 0 30px hsl(153 100% 50% / 0.15)"
                  : "0 0 30px hsl(153 100% 50% / 0.25), inset 0 0 20px hsl(153 100% 50% / 0.1)",
              }}
            >
              <span className="font-mono-data text-sm md:text-base text-primary font-bold drop-shadow-[0_0_8px_rgba(0,212,255,0.8)]">{c.label}</span>
              <span className="font-headline text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-green-300 drop-shadow-[0_0_12px_rgba(0,212,255,0.8)]">{c.value}</span>
              <span className="text-[11px] md:text-xs text-cyan-200/90 max-w-[85%] drop-shadow-[0_0_6px_rgba(0,212,255,0.5)]">{c.desc}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MarketSection;
