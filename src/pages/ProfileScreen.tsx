import { useState } from "react";
import { motion } from "framer-motion";

interface ProfileScreenProps {
  userName: string;
  onLogout: () => void;
}

const ProfileScreen = ({ userName, onLogout }: ProfileScreenProps) => {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [lang, setLang] = useState<"KZ" | "RU" | "EN">("KZ");

  const initial = userName?.[0]?.toUpperCase() || "G";

  const greenScore = 85;

  return (
    <div className="min-h-screen bg-[#060C06] pb-24 pt-6 px-4">
      {/* Header */}
      <h1 className="text-xl font-bold text-white mb-6">Профиль</h1>

      {/* Avatar + info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4 flex items-center gap-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-green-400 flex items-center justify-center text-2xl font-bold text-black shadow-[0_0_20px_rgba(0,255,136,0.4)]">
          {initial}
        </div>
        <div className="flex-1">
          <p className="text-white font-bold text-lg">{userName || "Қонақ"}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-green-400 rounded-full"
                style={{ width: `${greenScore}%` }}
              />
            </div>
            <span className="text-green-400 text-xs font-mono">{greenScore}</span>
          </div>
          <p className="text-gray-500 text-xs mt-0.5">Green Score</p>
        </div>
      </motion.div>

      {/* Language */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-3"
      >
        <p className="text-gray-400 text-xs mb-3 font-semibold uppercase tracking-wider">🌐 Тіл</p>
        <div className="flex gap-2">
          {(["KZ", "RU", "EN"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                lang === l
                  ? "bg-gradient-to-r from-cyan-400 to-green-400 text-black"
                  : "bg-white/5 text-gray-400"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Settings toggles */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-3 space-y-4"
      >
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">⚙️ Параметрлер</p>

        {[
          { label: "🌙 Қараңғы режим", val: darkMode, set: setDarkMode },
          { label: "🔔 Хабарландырулар", val: notifications, set: setNotifications },
          { label: "📶 Офлайн режим", val: offlineMode, set: setOfflineMode },
        ].map(({ label, val, set }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">{label}</span>
            <button
              onClick={() => set(!val)}
              className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                val ? "bg-green-400" : "bg-white/10"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${
                  val ? "left-6" : "left-0.5"
                }`}
              />
            </button>
          </div>
        ))}
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <a
          href="https://wa.me/77716927216?text=Здравствуйте%20я%20буду%20инвестором"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3"
        >
          <span className="text-xl">💼</span>
          <span className="text-gray-300 text-sm">Инвестор боламын</span>
          <span className="ml-auto text-gray-500">→</span>
        </a>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3"
        >
          <span className="text-xl">🚪</span>
          <span className="text-red-400 text-sm font-semibold">Шығу</span>
        </button>
      </motion.div>

      {/* Version */}
      <p className="text-center text-gray-600 text-xs mt-6">GreenPulse v1.0.0 · 2025</p>
    </div>
  );
};

export default ProfileScreen;
