import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light";
type Lang = "kz" | "ru" | "en";

interface AppContextType {
  theme: Theme;
  lang: Lang;
  toggleTheme: () => void;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const translations: Record<Lang, Record<string, string>> = {
  kz: {
    // Nav
    problem: "Мәселе",
    solution: "Шешім",
    monitoring: "Мониторинг",
    calculator: "Калькулятор",
    business: "Бизнес",
    team: "Команда",
    stations: "Станциялар",
    // Chatbot
    chatbot_title: "GreenPulse AI",
    chatbot_subtitle: "ЖИ көмекшіңіз",
    chatbot_placeholder: "Хабарлама жазыңыз...",
    chatbot_welcome: "👋 Сәлем! Мен GreenPulse AI. Жүйе, ауа сапасы және экология туралы сұрақтарыңызға жауап беремін.",
    chatbot_typing: "Жазып жатыр...",
    chatbot_clear: "Тазарту",
    // Calculator
    calc_title: "CO₂ калькуляторы",
    calc_subtitle: "Калькулятор",
    calc_benches: "Орындықтар саны",
    calc_city: "Қала",
    calc_co2: "CO₂ жылына",
    calc_trees: "Ағаш баламасы",
    calc_people: "Адамдар",
    calc_savings: "Үнемдеу",
    // Quick messages
    q1: "Температура қандай болу керек?",
    q2: "CO₂ деңгейі қалай?",
    q3: "pH оңтайлы мән?",
    q4: "Балдырлар қаншалықты тиімді?",
  },
  ru: {
    problem: "Проблема",
    solution: "Решение",
    monitoring: "Мониторинг",
    calculator: "Калькулятор",
    business: "Бизнес",
    team: "Команда",
    stations: "Станции",
    chatbot_title: "GreenPulse AI",
    chatbot_subtitle: "Ваш ИИ помощник",
    chatbot_placeholder: "Напишите сообщение...",
    chatbot_welcome: "👋 Привет! Я ИИ помощник GreenPulse. Отвечу на вопросы о системе, качестве воздуха и экологии.",
    chatbot_typing: "Печатает...",
    chatbot_clear: "Очистить",
    calc_title: "CO₂ калькулятор",
    calc_subtitle: "Калькулятор",
    calc_benches: "Количество скамеек",
    calc_city: "Город",
    calc_co2: "CO₂ в год",
    calc_trees: "Эквивалент деревьев",
    calc_people: "Человек",
    calc_savings: "Экономия",
    q1: "Какая оптимальная температура?",
    q2: "Какой уровень CO₂?",
    q3: "Оптимальный pH?",
    q4: "Насколько эффективны водоросли?",
  },
  en: {
    problem: "Problem",
    solution: "Solution",
    monitoring: "Monitoring",
    calculator: "Calculator",
    business: "Business",
    team: "Team",
    stations: "Stations",
    chatbot_title: "GreenPulse AI",
    chatbot_subtitle: "Your AI assistant",
    chatbot_placeholder: "Write a message...",
    chatbot_welcome: "👋 Hello! I'm GreenPulse AI. I can answer questions about the system, air quality and ecology.",
    chatbot_typing: "Typing...",
    chatbot_clear: "Clear",
    calc_title: "CO₂ Calculator",
    calc_subtitle: "Calculator",
    calc_benches: "Number of benches",
    calc_city: "City",
    calc_co2: "CO₂ per year",
    calc_trees: "Tree equivalent",
    calc_people: "People served",
    calc_savings: "Savings",
    q1: "What is the optimal temperature?",
    q2: "What is the CO₂ level?",
    q3: "Optimal pH value?",
    q4: "How effective are the algae?",
  },
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() =>
    (localStorage.getItem("gp-theme") as Theme) || "dark"
  );
  const [lang, setLangState] = useState<Lang>(() =>
    (localStorage.getItem("gp-lang") as Lang) || "ru"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("light-mode", theme === "light");
    localStorage.setItem("gp-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("gp-lang", l);
  };

  const t = (key: string) =>
    translations[lang][key] ?? translations["ru"][key] ?? key;

  return (
    <AppContext.Provider value={{ theme, lang, toggleTheme, setLang, t }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
