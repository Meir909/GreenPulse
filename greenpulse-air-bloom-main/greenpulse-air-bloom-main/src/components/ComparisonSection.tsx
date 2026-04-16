import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const criteria = [
  { name: "Бағасы", gp: "107k ₸", ct: "$25,000", biq: "$500k+", tree: "бар" },
  { name: "CO₂ тиімділігі", gp: "38 кг/жыл", ct: "240 кг/жыл", biq: "—", tree: "22 кг/жыл" },
  { name: "Қыста жұмыс", gp: true, ct: true, biq: true, tree: false },
  { name: "Жергілікті өндіріс", gp: true, ct: false, biq: false, tree: true },
  { name: "Оңай масштабтау", gp: true, ct: false, biq: false, tree: false },
];

const ComparisonSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-24 px-4" ref={ref}>
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-sm uppercase tracking-widest text-primary mb-3 font-mono-data">Салыстыру</p>
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground">
            Бәсекелестермен <span className="text-gradient">салыстыру</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="overflow-x-auto"
        >
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-4 text-muted-foreground font-normal">Критерий</th>
                <th className="p-4 text-center glass neon-border rounded-t-xl">
                  <span className="text-gradient font-headline font-bold text-lg">GreenPulse</span>
                </th>
                <th className="p-4 text-center text-muted-foreground">CityTree</th>
                <th className="p-4 text-center text-muted-foreground">BIQ House</th>
                <th className="p-4 text-center text-muted-foreground">Ағаш отырғызу</th>
              </tr>
            </thead>
            <tbody>
              {criteria.map((row, i) => (
                <motion.tr
                  key={row.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                  className="border-t border-border/30"
                >
                  <td className="p-4 text-foreground font-medium">{row.name}</td>
                  <td className="p-4 text-center glass neon-border border-t-0 font-mono-data text-primary font-bold">
                    {typeof row.gp === "boolean" ? (row.gp ? "✅" : "❌") : row.gp}
                  </td>
                  <td className="p-4 text-center text-muted-foreground">
                    {typeof row.ct === "boolean" ? (row.ct ? "✅" : "❌") : row.ct}
                  </td>
                  <td className="p-4 text-center text-muted-foreground">
                    {typeof row.biq === "boolean" ? (row.biq ? "✅" : "❌") : row.biq}
                  </td>
                  <td className="p-4 text-center text-muted-foreground">
                    {typeof row.tree === "boolean" ? (row.tree ? "✅" : "❌") : row.tree}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonSection;
