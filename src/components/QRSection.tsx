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
          className="glass rounded-2xl neon-border overflow-hidden"
        >
          <div className="h-1 bg-gradient-to-r from-cyan-500 to-primary" />
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
                <p className="text-sm uppercase tracking-widest text-primary mb-2 font-mono-data">
                  Quick Access
                </p>
                <h3 className="font-headline text-2xl font-bold text-foreground mb-3">
                  📱 QR-код для быстрого доступа
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Отсканируйте QR-код, чтобы открыть мониторинг GreenPulse на смартфоне.
                  Идеально для демонстрации на стенде или показа инвесторам.
                </p>
                <div className="flex items-center gap-2 glass rounded-lg p-3 mb-4">
                  <p className="font-mono text-xs text-primary flex-1 truncate">{url}</p>
                  <button
                    onClick={copy}
                    className="px-3 py-1 rounded text-xs border border-primary/40 text-primary hover:bg-primary/10 transition-all"
                  >
                    {copied ? "✓ Скопировано" : "Копировать"}
                  </button>
                </div>
                <div className="flex gap-3 flex-wrap justify-center md:justify-start">
                  <a
                    href="/stations"
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-green-600 text-white text-sm font-medium hover:opacity-90 transition-all"
                  >
                    🗺️ Открыть карту
                  </a>
                  <a
                    href="#dashboard"
                    className="px-4 py-2 rounded-lg glass border border-primary/40 text-primary text-sm hover:bg-primary/10 transition-all"
                  >
                    📊 Мониторинг
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
