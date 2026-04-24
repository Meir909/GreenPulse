import { useState } from "react";
import { motion } from "framer-motion";

interface LoginScreenProps {
  onLogin: (name: string) => void;
  onGuest: () => void;
}

const LoginScreen = ({ onLogin, onGuest }: LoginScreenProps) => {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    setError("");
    if (tab === "register" && !name.trim()) {
      setError("Атыңызды енгізіңіз");
      return;
    }
    if (!email.includes("@")) {
      setError("Email дұрыс емес");
      return;
    }
    if (password.length < 6) {
      setError("Құпия сөз кемінде 6 таңба");
      return;
    }

    // Save to localStorage (mock auth)
    const userName = tab === "register" ? name : email.split("@")[0];
    localStorage.setItem("gp_user", JSON.stringify({ name: userName, email }));
    onLogin(userName);
  };

  return (
    <div className="fixed inset-0 bg-[#060C06] flex flex-col items-center justify-center z-[9997] px-6">
      {/* Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 rounded-full bg-green-500/5 blur-3xl" />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col items-center gap-2 mb-8"
      >
        <div className="w-14 h-14 rounded-[60%_40%_40%_60%/60%_60%_40%_40%] bg-gradient-to-br from-cyan-400 to-green-400 shadow-[0_0_30px_rgba(0,255,136,0.5)]" />
        <h1 className="text-2xl font-bold text-white">
          Green<span className="text-green-400">Pulse</span>
        </h1>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="w-full max-w-sm bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md"
      >
        {/* Tabs */}
        <div className="flex bg-white/5 rounded-2xl p-1 mb-6">
          {(["login", "register"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(""); }}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab === t
                  ? "bg-gradient-to-r from-cyan-400 to-green-400 text-black"
                  : "text-gray-400"
              }`}
            >
              {t === "login" ? "Кіру" : "Тіркелу"}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {tab === "register" && (
            <input
              type="text"
              placeholder="Атыңыз"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm outline-none focus:border-green-400/50 transition-colors"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm outline-none focus:border-green-400/50 transition-colors"
          />
          <input
            type="password"
            placeholder="Құпия сөз"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm outline-none focus:border-green-400/50 transition-colors"
          />

          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-xl font-bold text-black bg-gradient-to-r from-cyan-400 to-green-400 shadow-[0_0_20px_rgba(0,255,136,0.3)] active:scale-95 transition-transform text-sm"
          >
            {tab === "login" ? "Кіру →" : "Тіркелу →"}
          </button>
        </div>
      </motion.div>

      {/* Guest */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={onGuest}
        className="mt-6 text-gray-500 text-sm underline underline-offset-4"
      >
        Қонақ ретінде жалғастыру
      </motion.button>
    </div>
  );
};

export default LoginScreen;
