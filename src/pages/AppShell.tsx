import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AppBottomNav, { AppTab } from "@/components/AppBottomNav";
import SplashScreen from "./SplashScreen";
import OnboardingScreen from "./OnboardingScreen";
import LoginScreen from "./LoginScreen";
import DashboardScreen from "./DashboardScreen";
import CalculatorScreen from "./CalculatorScreen";
import ProfileScreen from "./ProfileScreen";
import Index from "./Index";
import StationsPage from "./StationsPage";
import ChatbotModal from "@/components/ChatbotModal";

type AppState = "splash" | "onboarding" | "login" | "app";

const AppShell = () => {
  // Determine initial state from localStorage
  const getInitialState = (): AppState => {
    const user = localStorage.getItem("gp_user");
    const seen = localStorage.getItem("gp_onboarding_done");
    if (user) return "splash";
    if (seen) return "splash";
    return "splash"; // always show splash first
  };

  const [appState, setAppState] = useState<AppState>(getInitialState());
  const [tab, setTab] = useState<AppTab>("home");
  const [userName, setUserName] = useState(() => {
    try {
      const u = localStorage.getItem("gp_user");
      return u ? JSON.parse(u).name : "";
    } catch { return ""; }
  });
  const [chatOpen, setChatOpen] = useState(false);

  const handleSplashDone = useCallback(() => {
    const user = localStorage.getItem("gp_user");
    const seen = localStorage.getItem("gp_onboarding_done");
    if (user) {
      setAppState("app");
    } else if (!seen) {
      setAppState("onboarding");
    } else {
      setAppState("login");
    }
  }, []);

  const handleOnboardingDone = useCallback(() => {
    localStorage.setItem("gp_onboarding_done", "1");
    setAppState("login");
  }, []);

  const handleLogin = useCallback((name: string) => {
    setUserName(name);
    setAppState("app");
  }, []);

  const handleGuest = useCallback(() => {
    setUserName("Қонақ");
    setAppState("app");
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("gp_user");
    setUserName("");
    setTab("home");
    setAppState("login");
  }, []);

  const handleTabChange = (t: AppTab) => {
    if (t === "chat") {
      setChatOpen(true);
    } else {
      setTab(t);
    }
  };

  if (appState === "splash") return <SplashScreen onDone={handleSplashDone} />;
  if (appState === "onboarding") return <OnboardingScreen onDone={handleOnboardingDone} />;
  if (appState === "login") return <LoginScreen onLogin={handleLogin} onGuest={handleGuest} />;

  const renderTab = () => {
    switch (tab) {
      case "home":       return <Index />;
      case "dashboard":  return <DashboardScreen />;
      case "map":        return <StationsPage />;
      case "calculator": return <CalculatorScreen />;
      case "profile":    return <ProfileScreen userName={userName} onLogout={handleLogout} />;
      default:           return <Index />;
    }
  };

  return (
    <div className="relative min-h-screen bg-[#060C06]">
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {renderTab()}
        </motion.div>
      </AnimatePresence>

      <AppBottomNav active={tab} onChange={handleTabChange} />

      <ChatbotModal isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default AppShell;
