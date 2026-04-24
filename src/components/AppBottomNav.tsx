import { motion } from "framer-motion";

export type AppTab = "home" | "dashboard" | "map" | "chat" | "calculator" | "profile";

interface AppBottomNavProps {
  active: AppTab;
  onChange: (tab: AppTab) => void;
}

const tabs: { id: AppTab; icon: string; label: string }[] = [
  { id: "home",       icon: "🏠", label: "Басты" },
  { id: "dashboard",  icon: "📊", label: "Дашборд" },
  { id: "map",        icon: "🗺️", label: "Карта" },
  { id: "chat",       icon: "🤖", label: "AI Чат" },
  { id: "profile",    icon: "👤", label: "Профиль" },
];

const AppBottomNav = ({ active, onChange }: AppBottomNavProps) => (
  <div className="fixed bottom-0 left-0 right-0 z-[9990] bg-[#060C06]/95 backdrop-blur-lg border-t border-white/10 pb-safe">
    <div className="flex items-end justify-around px-2 pt-2 pb-3 max-w-lg mx-auto">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="flex flex-col items-center gap-1 flex-1 relative"
          >
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-gradient-to-r from-cyan-400 to-green-400"
              />
            )}
            <span
              className={`text-xl transition-all duration-200 ${
                isActive ? "scale-110" : "scale-100 opacity-50"
              }`}
            >
              {tab.icon}
            </span>
            <span
              className={`text-[10px] font-semibold transition-all duration-200 ${
                isActive ? "text-green-400" : "text-gray-500"
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

export default AppBottomNav;
