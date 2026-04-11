"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Map, ExternalLink, Menu, X } from "lucide-react";

const links = [
  { href: "#dashboard",  label: "Мониторинг" },
  { href: "#history",    label: "История" },
  { href: "#calculator", label: "Калькулятор" },
];

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4">
      <motion.nav
        initial={{ y: -72, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full max-w-3xl rounded-2xl transition-all duration-300 ${
          scrolled
            ? "bg-[#010a03]/90 backdrop-blur-2xl border border-[rgba(0,255,136,0.18)] shadow-[0_0_40px_rgba(0,255,136,0.05)]"
            : "bg-[#010a03]/50 backdrop-blur-md border border-white/6"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="GreenPulse home">
            <span className="pulse-ring relative inline-flex h-2.5 w-2.5 rounded-full bg-[#00ff88]" />
            <span
              className="font-display text-[15px] font-bold gradient-full"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              GreenPulse
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-white/50 hover:text-[#00ff88] px-3.5 py-1.5 rounded-xl hover:bg-[rgba(0,255,136,0.06)] transition-all duration-200 cursor-pointer"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Right CTA */}
          <div className="flex items-center gap-2">
            <Link
              href="/stations"
              className="hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[13px] font-medium text-white bg-gradient-to-r from-[#00ff88]/12 to-[#00d4ff]/12 border border-[rgba(0,255,136,0.22)] hover:border-[rgba(0,255,136,0.5)] hover:from-[#00ff88]/20 hover:to-[#00d4ff]/20 transition-all duration-200 cursor-pointer"
            >
              <Map size={12} />
              Станции
              <ExternalLink size={9} className="text-white/30" />
            </Link>

            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden p-2 text-white/50 hover:text-white rounded-lg hover:bg-white/6 transition-all"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="md:hidden overflow-hidden border-t border-white/6 px-5 pb-4 pt-3 flex flex-col gap-1"
            >
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm text-white/55 hover:text-[#00ff88] px-3 py-2.5 rounded-xl hover:bg-[rgba(0,255,136,0.06)] transition-all cursor-pointer"
                >
                  {l.label}
                </a>
              ))}
              <Link
                href="/stations"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-sm px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#00ff88]/12 to-[#00d4ff]/12 border border-[rgba(0,255,136,0.22)] text-white mt-1"
              >
                <Map size={13} /> Станции
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}
