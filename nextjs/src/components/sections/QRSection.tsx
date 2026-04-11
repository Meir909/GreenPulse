"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { QrCode, ExternalLink, Globe, Code2 } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

const links = [
  { Icon: Globe,        label: "Сайт",      href: "https://greenpulse.kz",                        color: "#00ff88" },
  { Icon: Code2,        label: "GitHub",    href: "https://github.com/greenpulse-kz/greenpulse",   color: "#00d4ff" },
  { Icon: ExternalLink, label: "API Docs",  href: "/api/docs",                                     color: "#7c3aed" },
];

export default function QRSection() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="qr" className="relative py-28 px-4" ref={ref}>
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
          className="glass-card rounded-2xl p-10 flex flex-col md:flex-row items-center gap-10"
        >
          {/* QR */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="shrink-0 p-4 rounded-2xl"
            style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.18)" }}
          >
            <QRCodeCanvas
              value="https://greenpulse.kz"
              size={140}
              bgColor="transparent"
              fgColor="#00ff88"
              level="M"
            />
          </motion.div>

          {/* Content */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 mb-3 justify-center md:justify-start">
              <QrCode size={16} className="text-[#00ff88]" />
              <p className="text-xs uppercase tracking-widest text-white/28" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                Бізбен байланыс
              </p>
            </div>
            <h2
              className="font-display text-3xl font-bold text-white mb-3"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              QR арқылы{" "}
              <span className="gradient-green">сканерлеңіз</span>
            </h2>
            <p className="text-white/38 text-sm mb-6 leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>
              Телефонмен QR кодты сканерлеп, нақты уақытта сенсор деректерін және мониторинг панелін көріңіз.
            </p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {links.map(({ Icon, label, href, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer border hover:opacity-80"
                  style={{ color, borderColor: color + "30", background: color + "0c", fontFamily: "var(--font-inter)" }}
                >
                  <Icon size={12} /> {label}
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
