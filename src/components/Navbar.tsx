import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

const navItems = [
  { href: "#problem", label: "Мәселе" },
  { href: "#solution", label: "Шешім" },
  { href: "#dashboard", label: "Мониторинг" },
  { href: "#calculator", label: "Калькулятор" },
  { href: "#business", label: "Бизнес" },
  { href: "#team", label: "Команда" },
  { href: "/stations", label: "Станции", isRoute: true },
  { href: "/admin", label: "Админ", isRoute: true },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass py-3" : "py-5"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <a href="/" className="font-headline text-xl font-bold text-gradient">
          GreenPulse
        </a>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.filter(item => !item.isRoute).map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg glass border border-white/10 hover:border-primary/50 text-muted-foreground hover:text-primary transition-all duration-300"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5" strokeWidth="2" />
                <path strokeLinecap="round" strokeWidth="2" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          <a
            href="/admin"
            className="hidden md:inline-flex px-3 py-2 rounded-lg glass border border-white/10 hover:border-yellow-400/50 text-muted-foreground hover:text-yellow-400 text-sm transition-all duration-300"
          >
            ⚙️ Админ
          </a>

          <a
            href="/stations"
            className="hidden md:inline-flex px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-green-600 hover:from-cyan-700 hover:to-green-700 text-white text-sm font-medium transition-all duration-300 border border-cyan-400/50 hover:border-cyan-300"
          >
            🗺️ Станции
          </a>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-foreground"
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass mt-2 mx-4 rounded-lg p-4 flex flex-col gap-3"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`text-sm transition-colors ${
                item.isRoute
                  ? "px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-green-600 text-white font-medium"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              {item.label}
            </a>
          ))}
          <button
            onClick={() => { setTheme(theme === "dark" ? "light" : "dark"); setMobileOpen(false); }}
            className="text-sm text-muted-foreground hover:text-primary text-left"
          >
            {theme === "dark" ? "☀️ Светлая тема" : "🌙 Тёмная тема"}
          </button>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
