import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const Footer = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <footer className="relative py-20 px-4 border-t border-border/30" ref={ref}>
      <div className="container mx-auto max-w-4xl text-center">
        <motion.a
          href="https://wa.me/77716927216?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%20%D1%8F%20%D0%B1%D1%83%D0%B4%D1%83%20%D0%B8%D0%BD%D0%B2%D0%B5%D1%81%D1%82%D0%BE%D1%80%D0%BE%D0%BC"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="inline-block px-8 py-3 mb-6 rounded-full bg-gradient-to-r from-cyan-600 to-green-600 hover:from-cyan-500 hover:to-green-500 text-white font-semibold text-lg shadow-lg shadow-cyan-500/30 border border-cyan-400/50 transition-all duration-300 cursor-pointer"
        >
          💼 Инвестор боламын
        </motion.a>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-headline text-2xl md:text-3xl font-bold text-gradient mb-8"
        >
          «Бір скамейка — бір таза демалыс»
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8"
        >
          <a
            href="mailto:nurmiko22@gmail.com"
            className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2"
          >
            ✉️ nurmiko22@gmail.com
          </a>
          <a
            href="https://wa.me/77716927216"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2"
          >
            💬 +7 771 692 72 16
          </a>
        </motion.div>

        <p className="text-xs text-muted-foreground">
          © 2025 GreenPulse · Нурдаулет Мейірбек & Сапи Бекнұр · Ақтау НЗМ
        </p>
      </div>
    </footer>
  );
};

export default Footer;
