import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Mail, Phone, Leaf } from "lucide-react";

const Footer = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <footer className="relative py-16 px-4 border-t border-[rgba(0,255,136,0.08)]" ref={ref}>
      <div className="container mx-auto max-w-4xl text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          <Leaf size={18} className="text-[#00ff88]" />
          <span className="font-display font-bold text-lg bg-gradient-to-r from-[#00ff88] to-[#00d4ff] bg-clip-text text-transparent">
            GreenPulse
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-xl md:text-2xl font-bold text-white mb-8"
        >
          «Бір скамейка — бір таза демалыс»
        </motion.p>

        {/* Nav links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center justify-center gap-6 mb-8 flex-wrap"
        >
          <a href="#dashboard" className="text-white/40 hover:text-[#00ff88] transition-colors text-sm font-mono-data">
            Мониторинг
          </a>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <a href="#calculator" className="text-white/40 hover:text-[#00ff88] transition-colors text-sm font-mono-data">
            Калькулятор
          </a>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <a href="/stations" className="text-white/40 hover:text-[#00ff88] transition-colors text-sm font-mono-data">
            Станции
          </a>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-8"
        >
          <a
            href="mailto:nurmiko22@gmail.com"
            className="flex items-center gap-2 text-white/40 hover:text-[#00ff88] transition-colors text-sm"
          >
            <Mail size={14} />
            nurmiko22@gmail.com
          </a>
          <a
            href="https://wa.me/77716927216"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white/40 hover:text-[#00ff88] transition-colors text-sm"
          >
            <Phone size={14} />
            +7 771 692 72 16
          </a>
        </motion.div>

        <p className="text-xs text-white/20 font-mono-data">
          © 2025 GreenPulse · Нурдаулет Мейірбек & Сапи Бекнұр · Ақтау НЗМ
        </p>
      </div>
    </footer>
  );
};

export default Footer;
