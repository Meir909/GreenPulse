# GreenPulse — Phase 2 ✅ COMPLETE

> Экологиялық ауа тазартатын биореактор орындық
> Ecological air-cleaning bioreactor bench powered by Chlorella vulgaris

![Status](https://img.shields.io/badge/Phase_2-✅_COMPLETE-brightgreen)
![Build](https://img.shields.io/badge/Build-Passing-brightgreen)
![Commit](https://img.shields.io/badge/Commit-22148bd-blue)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 🎯 What's New in Phase 2

### **Backend Improvements**
- ✅ Transparent data origin labels on all API responses
- ✅ `photo_efficiency()` function extracted and documented (Converti et al. 2009)
- ✅ ChatGPT system prompt rewritten (removed marketing claims, focused on science)
- ✅ All endpoints now return `data_source`, `origin`, `methodology`, `formula`

### **Frontend Credibility**
- ✅ **Scientific Validation Section** — Organism info, parameter cards (MEASURED vs ESTIMATED), validation stages
- ✅ **Honest Metrics** — No hardcoded "92% КПД", "$1900/yr" claims
- ✅ **Co2Counter** — Only animates when ESP32 is live (no fake ticking)
- ✅ **Calculator** — Shows formula, assumptions, accuracy (±30–50%)
- ✅ **Problem Section** — Data citations (IQAir 2023, WHO)
- ✅ **Dashboard** — "DEMO" badge when offline, offline warning banner
- ✅ **Data State Labels** — Every metric labeled (live_measured/estimated/simulated)

### **Tech Stack**
- ✅ Next.js 15 (App Router, TypeScript)
- ✅ Tailwind CSS 4 + Dark OLED theme
- ✅ Framer Motion animations
- ✅ Recharts for data visualization
- ✅ Socket.IO + HTTP fallback for real-time data

---

## 📊 Build Status

```
✓ Next.js: 16.2s compilation
✓ TypeScript: 5.5s (zero errors)
✓ Routes: 4 prerendered pages
  - / (home, 10 sections)
  - /stations (station network)
  - /meir (admin, hidden)
  - /_not-found (404)
```

---

## 🚀 Quick Start

### **Development**

```bash
# Install dependencies
cd nextjs
npm install

# Run dev server
npm run dev
# → http://localhost:3000

# Build production
npm run build

# Start production server
npm run start
```

### **Flask Backend**

```bash
# Install dependencies
cd ..
pip install -r requirements.txt

# Run backend
python app.py
# → http://localhost:5000

# Check health
curl http://localhost:5000/api/health
```

---

## 📁 Project Structure

```
GreenPulse/
├── nextjs/                          # Next.js 15 frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx            # Home (all 10 sections)
│   │   │   ├── stations/page.tsx   # Station network
│   │   │   ├── meir/page.tsx       # Admin (hidden)
│   │   │   ├── not-found.tsx       # 404
│   │   │   ├── layout.tsx          # Global layout
│   │   │   └── globals.css         # Tailwind + custom CSS
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── ChatbotFloatingButton.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── sections/           # 10+ section components
│   │   ├── hooks/
│   │   │   └── useSensorSocket.ts  # Real-time data hook
│   │   └── lib/
│   │       ├── dataTypes.ts        # 🔑 Shared data schema
│   │       └── aqi.ts              # Air Quality Index calc
│   ├── package.json
│   └── next.config.ts              # API rewrites to Flask
│
├── app.py                           # Flask backend
├── requirements.txt
├── DEPLOYMENT.md                    # Deploy to Vercel + Render
├── PHASE_2_SUMMARY.md              # Phase 2 results
└── README_PHASE_2.md               # This file
```

---

## 🔑 Key Data Schema

**dataTypes.ts** defines all data contracts:

```typescript
type DataOrigin =
  | "live_measured"      // Direct ESP32 sensor
  | "estimated"          // From model (±30–50%)
  | "simulated"          // Demo/offline fallback
  | "default_assumed"    // Hardcoded default
  | "literature_value"   // Research baseline
  | "ai_generated"       // AI analysis
  | "none"               // No data

const CO2_MODEL = {
  maxKgPerYear: 38,      // Chlorella vulgaris literature
  treeEquivalent: 15,    // ~2.5 kg per tree/year
  source: "Converti et al. (2009)",
  accuracy: "±30–50%"
}

type DataState = "live" | "stale" | "simulated" | "offline" | "loading"
```

Every number in the UI includes:
- **Label** (MEASURED, ESTIMATED, LITERATURE)
- **Source** (ESP32 DHT22, Model, Research paper)
- **Methodology** (How it was calculated)
- **Formula** (Exact equation)

---

## 🌐 API Endpoints

### Flask Backend

| Endpoint | Method | Returns |
|----------|--------|---------|
| `/api/health` | GET | Health check + data origins |
| `/api/chatbot` | POST | AI chatbot (OpenAI GPT-4o) |
| `/api/ai-analyze-sensors` | POST | Analysis + recommendations |
| `/api/ai-predict-growth` | POST | CO₂ absorption prediction |
| `/api/sensor-data` | GET | Current sensor readings |

**All responses include:**
```json
{
  "value": 25.3,
  "data_source": "ESP32 DHT22 temperature sensor",
  "origin": "live_measured",
  "methodology": "Direct sensor reading",
  "formula": "T = raw / 100 (DHT22 format)",
  "timestamp": "2026-04-12T10:30:00Z"
}
```

---

## 🎨 Design System

**Dark OLED Theme:**
- Background: `#020a05` (almost black)
- Primary: `#00ff88` (neon green)
- Secondary: `#00d4ff` (cyan)
- Accent: `#7c3aed` (violet)

**Effects:**
- Glass-morphism (backdrop-blur)
- Aurora gradient animations
- Smooth scroll behavior
- Responsive (mobile-first)

---

## 📱 Pages

### **Home (`/`)**
1. **Hero** — Landing section with dataState indicator
2. **What is GreenPulse** — Product explanation
3. **Problem** — Air pollution data (with citations)
4. **Solution** — How it works
5. **🆕 Scientific Validation** — Organism info, validation stages
6. **Dashboard** — Real-time monitoring (live/offline badge)
7. **History** — 7-day CO₂ trend
8. **CO2 Counter** — Impact metrics (honest state)
9. **Calculator** — Impact calculator (with formula)
10. **QR Code** — Link to stations page

### **Stations (`/stations`)**
- Network of 3 demo stations
- Live data for active units
- GPS coordinates (when available)
- Connection status badge

### **Admin (`/meir`)**
- Hidden route (not in navbar)
- Raw sensor JSON dump
- Debug connection status

---

## 🔐 Environment Variables

**Vercel (Frontend):**
```
FLASK_URL=https://your-flask-backend.com
OPENAI_API_KEY=sk-proj-...
```

**Render (Backend):**
```
FLASK_ENV=production
OPENAI_API_KEY=sk-proj-...
DEBUG=False
CORS_ORIGINS=https://your-vercel-site.vercel.app
```

---

## 📈 Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for:
- Vercel setup (Next.js frontend)
- Render setup (Flask backend)
- Environment variables
- Troubleshooting guide

**TL;DR:**
```bash
# 1. Push to GitHub
git push origin master

# 2. Connect to Vercel
# → Select nextjs/ as root directory

# 3. Set env vars in Vercel dashboard
FLASK_URL=...
OPENAI_API_KEY=...

# 4. Deploy Flask to Render
# → Select root directory
# → Set same env vars
```

---

## ✅ Philosophy Change

### **Before (Phase 1):**
- "92% КПД" (hardcoded, untruth)
- "$1900 savings/year" (marketing)
- CO2 counter always ticking (fake)
- No data sources
- Chatbot making promises

### **After (Phase 2):**
- Honest metrics (only when real data available)
- Literature values with ±30–50% accuracy
- Counter shows actual state (live/offline/demo)
- All data labeled: MEASURED / ESTIMATED / LITERATURE
- Chatbot focused on science, not sales
- **Goal:** Scientific credibility > Marketing hype

---

## 🧪 Testing

### **Local Development**
```bash
npm run dev
# Test at http://localhost:3000
# Check console for any errors
```

### **Build Check**
```bash
npm run build
# Verify all routes prerender without errors
```

### **Production Build**
```bash
npm run start
# Test production bundle locally
```

---

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** — Deploy to Vercel + Render
- **[PHASE_2_SUMMARY.md](./PHASE_2_SUMMARY.md)** — Complete results
- **[nextjs/README.md](./nextjs/README.md)** — Frontend-specific
- **[nextjs/CLAUDE.md](./nextjs/CLAUDE.md)** — Claude Code setup

---

## 🤝 Contributing

All code follows these principles:
1. **Data Honesty** — Label every number with its origin
2. **Transparency** — Show formulas, not just results
3. **Graceful Degradation** — Fail gracefully (show "—" not fake data)
4. **Scientific Rigor** — Cite sources for all claims
5. **User Trust** — Prioritize credibility over hype

---

## 📄 License

MIT — Free to use and modify

---

## 👥 Authors

- **Нурдаулет Мейірбек** — Architecture & Backend
- **Сапи Бекнұр** — Design & Frontend
- **Claude (Anthropic)** — Phase 2 Implementation

---

## 📞 Support

- 🐛 **Bug Reports:** GitHub Issues (`[Phase 2]` tag)
- 💬 **Questions:** See documentation files
- 🚀 **Deployment Help:** See DEPLOYMENT.md

---

## 🎯 Next Phase (Phase 3)

- [ ] Vercel deployment (frontend)
- [ ] Render deployment (backend)
- [ ] Real ESP32 data integration
- [ ] WebSocket instead of HTTP polling
- [ ] Dynamic station list (no hardcoding)
- [ ] Production monitoring (Sentry)
- [ ] Public launch: greenpulse.kz

---

**Status:** ✅ Phase 2 COMPLETE
**Build:** ✅ PASSING
**Ready:** ✅ YES (pending env setup)
**Last Updated:** 2026-04-12

```
🟢 All systems go for deployment
```
