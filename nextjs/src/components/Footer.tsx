"use client";
import Link from "next/link";
import { Code2, Globe } from "lucide-react";

const navLinks = [
  { href: "#dashboard",  label: "Мониторинг" },
  { href: "#history",    label: "История"    },
  { href: "#calculator", label: "Калькулятор"},
  { href: "/stations",   label: "Станциялар" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/6 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <span className="pulse-ring relative inline-flex h-2 w-2 rounded-full bg-[#00ff88]" />
            <span
              className="font-display text-sm font-bold gradient-full"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              GreenPulse
            </span>
            <span className="text-white/18 text-sm" style={{ fontFamily: "var(--font-inter)" }}>
              — биореактор орындық
            </span>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-1" aria-label="Footer navigation">
            {navLinks.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs text-white/30 hover:text-white/65 px-3 py-1.5 rounded-lg hover:bg-white/4 transition-all duration-200 cursor-pointer"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Social */}
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/greenpulse-kz/greenpulse"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-white/25 hover:text-white/55 border border-white/6 hover:border-white/15 transition-all cursor-pointer"
              aria-label="GitHub"
            >
              <Code2 size={14} />
            </a>
            <a
              href="https://greenpulse.kz"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-white/25 hover:text-white/55 border border-white/6 hover:border-white/15 transition-all cursor-pointer"
              aria-label="Website"
            >
              <Globe size={14} />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-white/18" style={{ fontFamily: "var(--font-inter)" }}>
            © 2024–2025 GreenPulse. Барлық құқықтар қорғалған.
          </p>
          <p className="text-xs text-white/15" style={{ fontFamily: "var(--font-inter)" }}>
            Нурдаулет Мейірбек &amp; Сапи Бекнұр · Infomatrix
          </p>
        </div>
      </div>
    </footer>
  );
}
