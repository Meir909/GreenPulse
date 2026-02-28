import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const MarketSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const circles = [
    { label: "TAM", value: "$4.2B", desc: "Жаһандық ауа тазарту нарығы", size: 280 },
    { label: "SAM", value: "$280M", desc: "ТМД + Орталық Азия", size: 200 },
    { label: "SOM", value: "$18M", desc: "ҚР мектептер + қалалар", size: 120 },
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

        <div className="relative flex items-center justify-center" style={{ height: 320 }}>
          {circles.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, scale: 0 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2 + i * 0.2, duration: 0.6, type: "spring" }}
              className="absolute rounded-full border flex flex-col items-center justify-center text-center"
              style={{
                width: c.size,
                height: c.size,
                borderColor: i === 2 ? "hsl(153 100% 50% / 0.9)" : i === 1 ? "hsl(153 100% 50% / 0.6)" : "hsl(153 100% 50% / 0.35)",
                background: i === 2
                  ? "hsl(153 100% 50% / 0.15)"
                  : i === 1
                  ? "hsl(153 100% 50% / 0.08)"
                  : "hsl(153 100% 50% / 0.04)",
                boxShadow: i === 2
                  ? "0 0 40px hsl(153 100% 50% / 0.4), 0 0 80px hsl(153 100% 50% / 0.2)"
                  : i === 1
                  ? "0 0 30px hsl(153 100% 50% / 0.2)"
                  : "0 0 20px hsl(153 100% 50% / 0.1)",
              }}
            >
              <span className="font-mono-data text-xs text-primary font-bold">{c.label}</span>
              <span className="font-headline text-lg md:text-xl font-bold text-foreground">{c.value}</span>
              <span className="text-[10px] text-muted-foreground max-w-[80%]">{c.desc}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MarketSection;
