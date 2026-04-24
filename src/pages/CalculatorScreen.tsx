import { useState } from "react";
import { motion } from "framer-motion";

const CalculatorScreen = () => {
  const [people, setPeople] = useState(50);
  const [area, setArea] = useState(100);

  // 1 bench covers ~0.8 km radius → ~38 kg CO2/year
  const benchesNeeded = Math.ceil((people / 20) + (area / 200));
  const co2PerDay = (benchesNeeded * 38000 / 365).toFixed(0);
  const co2PerYear = (benchesNeeded * 38).toFixed(1);
  const treesEquiv = Math.round(benchesNeeded * 15);
  const costPerMonth = benchesNeeded * 12000;

  const results = [
    { icon: "🪑", label: "Биореактор скамейкасы", value: `${benchesNeeded} дана`, color: "#00ff88" },
    { icon: "🌿", label: "Күнде CO₂ сіңіру", value: `${co2PerDay} г`, color: "#00d4ff" },
    { icon: "🌍", label: "Жылда CO₂ сіңіру", value: `${co2PerYear} кг`, color: "#b5ff3d" },
    { icon: "🌳", label: "Ағаш баламасы", value: `${treesEquiv} ағаш`, color: "#00ff88" },
    { icon: "💰", label: " Айлық шығын", value: `${costPerMonth.toLocaleString()} ₸`, color: "#ffe03d" },
  ];

  return (
    <div className="min-h-screen bg-[#060C06] pb-24 pt-6 px-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">CO₂ Калькулятор</h1>
        <p className="text-gray-500 text-xs mt-0.5">Қанша скамейка қажет?</p>
      </div>

      {/* Inputs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4"
      >
        <div className="mb-5">
          <div className="flex justify-between mb-2">
            <label className="text-gray-400 text-sm">👥 Адам саны</label>
            <span className="text-green-400 font-bold font-mono">{people}</span>
          </div>
          <input
            type="range" min={5} max={500} value={people}
            onChange={(e) => setPeople(Number(e.target.value))}
            className="w-full accent-green-400"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>5</span><span>500</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-gray-400 text-sm">📐 Аумақ (м²)</label>
            <span className="text-cyan-400 font-bold font-mono">{area} м²</span>
          </div>
          <input
            type="range" min={10} max={2000} step={10} value={area}
            onChange={(e) => setArea(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>10</span><span>2000</span>
          </div>
        </div>
      </motion.div>

      {/* Results */}
      <div className="grid grid-cols-1 gap-3">
        {results.map((r, i) => (
          <motion.div
            key={r.label}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{r.icon}</span>
              <span className="text-gray-400 text-sm">{r.label}</span>
            </div>
            <span
              className="font-bold font-mono text-base"
              style={{ color: r.color, textShadow: `0 0 10px ${r.color}50` }}
            >
              {r.value}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Share */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={() => {
          const text = `GreenPulse есептеу:\n👥 ${people} адам, 📐 ${area} м²\n🪑 ${benchesNeeded} скамейка\n🌍 Жылда ${co2PerYear} кг CO₂\n🌳 ${treesEquiv} ағашқа балама`;
          navigator.share?.({ text }) || navigator.clipboard.writeText(text);
        }}
        className="mt-4 w-full py-3 rounded-xl font-semibold text-sm text-black bg-gradient-to-r from-cyan-400 to-green-400 active:scale-95 transition-transform"
      >
        📤 Бөлісу
      </motion.button>
    </div>
  );
};

export default CalculatorScreen;
