import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

const QRSection = () => {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.origin);
  }, []);

  const copy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section className="relative py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          <div className="h-0.5 bg-gradient-to-r from-[#00d4ff] to-[#00ff88]" />
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* QR code */}
              <div className="flex-shrink-0">
                <div className="bg-white p-4 rounded-xl shadow-lg shadow-primary/20">
                  {url && (
                    <QRCodeSVG
                      value={url}
                      size={160}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="M"
                      includeMargin={false}
                    />
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <p className="text-xs uppercase tracking-widest text-[#00ff88] mb-2 font-mono-data">
                  Quick Access
                </p>
                <h3 className="font-display text-2xl font-bold text-white mb-3">
                  QR-код для быстрого доступа
                </h3>
                <p className="text-white/45 text-sm mb-4 font-body leading-relaxed">
                  Отсканируйте QR-код, чтобы открыть мониторинг GreenPulse на смартфоне.
                  Идеально для демонстрации на стенде или показа инвесторам.
                </p>
                <div className="flex items-center gap-2 glass-card rounded-xl p-3 mb-4">
                  <p className="font-mono-data text-xs text-[#00ff88] flex-1 truncate">{url}</p>
                  <button
                    onClick={copy}
                    className="px-3 py-1 rounded-lg text-xs border border-[rgba(0,255,136,0.3)] text-[#00ff88] hover:bg-[rgba(0,255,136,0.1)] transition-all font-mono-data"
                  >
                    {copied ? "✓ Скопировано" : "Копировать"}
                  </button>
                </div>
                <div className="flex gap-3 flex-wrap justify-center md:justify-start">
                  <a
                    href="/stations"
                    className="btn-shimmer px-4 py-2 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black text-sm font-medium hover:opacity-90 transition-all"
                  >
                    Открыть карту
                  </a>
                  <a
                    href="#dashboard"
                    className="px-4 py-2 rounded-xl glass-card border border-[rgba(0,255,136,0.25)] text-[#00ff88] text-sm hover:bg-[rgba(0,255,136,0.08)] transition-all"
                  >
                    Мониторинг
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default QRSection;
