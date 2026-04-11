import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="aurora-bg" aria-hidden="true" />
      <div className="relative z-10">
        <p
          className="font-mono text-8xl font-bold mb-4"
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            background: "linear-gradient(135deg,#00ff88,#00d4ff)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          404
        </p>
        <h1
          className="font-display text-2xl font-bold text-white mb-3"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Бет табылмады
        </h1>
        <p className="text-white/35 text-sm mb-8" style={{ fontFamily: "var(--font-inter)" }}>
          Сіз іздеген бет жоқ немесе жылжытылды.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-black cursor-pointer"
          style={{ background: "linear-gradient(135deg,#00ff88,#00d4ff)", fontFamily: "var(--font-inter)" }}
        >
          <Home size={14} /> Басты бетке
        </Link>
      </div>
    </main>
  );
}
