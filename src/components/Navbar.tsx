import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Sun, Moon, Map } from "lucide-react";

const navLinks = [
  { href: "#dashboard", label: "Мониторинг" },
  { href: "#calculator", label: "Калькулятор" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();

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
            ? "bg-black/80 backdrop-blur-xl border border-[rgba(0,255,136,0.18)] shadow-[0_0_30px_rgba(0,255,136,0.08)]"
            : "bg-black/40 backdrop-blur-md border border-white/10"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-3">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00ff88]" />
            </span>
            <span className="font-display text-base font-bold bg-gradient-to-r from-[#00ff88] via-[#00d4ff] to-[#7c3aed] bg-clip-text text-transparent">
              GreenPulse
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-white/60 hover:text-[#00ff88] px-3 py-1.5 rounded-lg hover:bg-[rgba(0,255,136,0.08)] transition-all duration-200"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right: theme + stations */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-white/50 hover:text-[#00ff88] hover:bg-[rgba(0,255,136,0.08)] transition-all duration-200"
              aria-label="Toggle theme"
            >
              {theme === "dark"
                ? <Sun size={15} />
                : <Moon size={15} />
              }
            </button>

            <a
              href="/stations"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[#00ff88]/20 to-[#00d4ff]/20 border border-[rgba(0,255,136,0.3)] hover:border-[rgba(0,255,136,0.6)] hover:from-[#00ff88]/30 hover:to-[#00d4ff]/30 transition-all duration-200"
            >
              <Map size={13} />
              Станции
            </a>

            {/* Mobile burger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex flex-col gap-1 p-2"
              aria-label="Toggle menu"
            >
              <span className={`block h-0.5 w-5 bg-white/70 transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-1.5" : ""}`} />
              <span className={`block h-0.5 w-5 bg-white/70 transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-5 bg-white/70 transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 px-5 py-3 flex flex-col gap-1"
          >
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-white/60 hover:text-[#00ff88] px-3 py-2 rounded-lg hover:bg-[rgba(0,255,136,0.08)] transition-all"
              >
                {item.label}
              </a>
            ))}
            <a
              href="/stations"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-gradient-to-r from-[#00ff88]/20 to-[#00d4ff]/20 border border-[rgba(0,255,136,0.3)] text-white"
            >
              <Map size={13} /> Станции
            </a>
            <button
              onClick={() => { setTheme(theme === "dark" ? "light" : "dark"); setMobileOpen(false); }}
              className="flex items-center gap-2 text-sm text-white/50 px-3 py-2 rounded-lg hover:text-[#00ff88] hover:bg-[rgba(0,255,136,0.08)] transition-all"
            >
              {theme === "dark" ? <><Sun size={13} /> Светлая тема</> : <><Moon size={13} /> Тёмная тема</>}
            </button>
          </motion.div>
        )}
      </motion.nav>
    </div>
  );
};

export default Navbar;
