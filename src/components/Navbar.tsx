import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, ExternalLink } from "lucide-react";

const navLinks = [
  { href: "#dashboard", label: "Мониторинг" },
  { href: "#history",   label: "История" },
  { href: "#calculator",label: "Калькулятор" },
];

const Navbar = () => {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4">
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`w-full max-w-3xl rounded-2xl transition-all duration-300 ${
          scrolled
            ? "bg-[#050a0e]/90 backdrop-blur-xl border border-[rgba(0,255,136,0.20)] shadow-[0_0_40px_rgba(0,255,136,0.06)]"
            : "bg-black/40 backdrop-blur-md border border-white/8"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-3">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 group">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00ff88]" />
            </span>
            <span className="font-display text-base font-bold bg-gradient-to-r from-[#00ff88] via-[#00d4ff] to-[#7c3aed] bg-clip-text text-transparent">
              GreenPulse
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-white/55 hover:text-[#00ff88] px-3.5 py-1.5 rounded-xl hover:bg-[rgba(0,255,136,0.07)] transition-all duration-200 font-body"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <a
              href="/stations"
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[#00ff88]/15 to-[#00d4ff]/15 border border-[rgba(0,255,136,0.25)] hover:border-[rgba(0,255,136,0.55)] hover:from-[#00ff88]/25 hover:to-[#00d4ff]/25 transition-all duration-200"
            >
              <Map size={13} />
              Станции
              <ExternalLink size={10} className="text-white/30" />
            </a>

            {/* Mobile burger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex flex-col gap-[5px] p-2"
              aria-label="Toggle menu"
            >
              <span className={`block h-0.5 w-5 bg-white/70 rounded-full transition-all duration-300 origin-center ${mobileOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
              <span className={`block h-0.5 w-5 bg-white/70 rounded-full transition-all duration-300 ${mobileOpen ? "opacity-0 scale-x-0" : ""}`} />
              <span className={`block h-0.5 w-5 bg-white/70 rounded-full transition-all duration-300 origin-center ${mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-white/8 px-5 py-3 flex flex-col gap-1 overflow-hidden"
            >
              {navLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-white/60 hover:text-[#00ff88] px-3 py-2.5 rounded-xl hover:bg-[rgba(0,255,136,0.07)] transition-all font-body"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="/stations"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-sm px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#00ff88]/15 to-[#00d4ff]/15 border border-[rgba(0,255,136,0.25)] text-white mt-1"
              >
                <Map size={13} /> Станции
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
};

export default Navbar;
