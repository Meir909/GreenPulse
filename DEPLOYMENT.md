# GreenPulse Phase 2 — Развёртывание

## 📋 Статус

✅ **Phase 2 завершена** — Next.js 15 app + backend improvements готовы к публикации.

- Build: **16.2s** ✓ Все 4 маршрута prerendered
- TypeScript: **5.5s** ✓ Zero errors
- Commit: `22148bd` (39 files, 10k+ insertions)

---

## 🚀 Развёртывание на Vercel

### Шаг 1: Разработка локально

```bash
# Dev server
cd GreenPulse/nextjs
npm run dev
# → http://localhost:3000

# Build check
npm run build
```

### Шаг 2: Push на GitHub

```bash
cd GreenPulse
git push origin master
```

### Шаг 3: Vercel Deploy

**Вариант A: Через Vercel UI**
1. Go to vercel.com/dashboard
2. New Project → Import from Git → greenpulse-kz/greenpulse
3. Framework Preset: **Next.js**
4. Root Directory: **./nextjs**
5. Build Command: **npm run build** (default)
6. Start Command: **npm run start** (auto)
7. Environment Variables:
   ```
   FLASK_URL=https://your-flask-backend.com
   OPENAI_API_KEY=sk-proj-...
   ```

**Вариант B: Через CLI**
```bash
npm i -g vercel
vercel login
cd nextjs
vercel deploy --prod
```

### Шаг 4: Environment Variables

**Vercel Dashboard → Settings → Environment Variables:**

| Key | Value |
|-----|-------|
| `FLASK_URL` | `https://greenpulse-backend.onrender.com` (или ваш Flask) |
| `OPENAI_API_KEY` | `sk-proj-...` |

---

## 🔧 Flask Backend

### Локальный запуск

```bash
cd GreenPulse
python3 -m venv venv
source venv/bin/activate  # Unix/Mac
# или: venv\Scripts\activate  # Windows

pip install -r requirements.txt
python app.py
# → http://localhost:5000
```

### Render Deployment

**Вариант 1: Через Render UI**
1. dashboard.render.com → New → Web Service
2. GitHub Connect → select `GreenPulse`
3. Settings:
   - **Name:** greenpulse-backend
   - **Root Directory:** (empty, use repo root)
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python app.py`
   - **Port:** 10000 (auto-assigned)
4. Environment Variables:
   ```
   FLASK_ENV=production
   OPENAI_API_KEY=sk-proj-...
   DEBUG=False
   CORS_ORIGINS=https://your-vercel-site.vercel.app
   ```

**Вариант 2: Render Blueprint**

Создать `render.yaml` в корне repo:
```yaml
services:
  - type: web
    name: greenpulse-backend
    env: python3
    buildCommand: pip install -r requirements.txt
    startCommand: python app.py
    envVars:
      - key: FLASK_ENV
        value: production
      - key: DEBUG
        value: "False"
      - key: OPENAI_API_KEY
        scope: secret
```

---

## 📡 API Endpoints

### Flask Backend (`/api/*`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Health check + data origins |
| `/api/chatbot` | POST | AI chatbot (OpenAI GPT-4o) |
| `/api/ai-analyze-sensors` | POST | Sensor analysis |
| `/api/ai-predict-growth` | POST | CO2 prediction |
| `/api/sensor-data` | GET | Current sensor readings |

**All responses include:**
- `data_source` — Where data came from
- `origin` — "live_measured", "estimated", "simulated", etc.
- `methodology` — How it was calculated
- `formula` — The model used

### Next.js Frontend

| Route | Type | Purpose |
|-------|------|---------|
| `/` | Home | Landing page with all sections |
| `/stations` | Page | Station network dashboard |
| `/meir` | Page | Admin (hidden route) |
| `/_not-found` | Page | 404 page |

---

## 🔄 Data Flow

```
ESP32 (Sensor Hardware)
    ↓
Flask Backend (/api/sensor-data)
    ↓
useSensorSocket (React Hook)
    ↓
Next.js Components
    ├─ HeroSection (dataState indicator)
    ├─ DashboardSection (live/offline badge)
    ├─ Co2CounterSection (only animates when live)
    ├─ ScientificValidationSection (methodology)
    └─ ChatbotFloatingButton (/api/chatbot)
```

---

## 🎯 Key Features in Phase 2

### Backend Transparency
✅ Data origin labels on all responses
✅ `photo_efficiency()` function documented
✅ Chatbot rewritten (no marketing claims)
✅ All endpoints return `methodology` + `formula`

### Frontend Credibility
✅ Scientific Validation section
✅ Co2Counter doesn't tick offline
✅ Calculator shows formula + assumptions
✅ Problem section has citations
✅ Dashboard shows "DEMO" label when offline
✅ Honest state labels (live/offline/simulated)

### Build Quality
✅ TypeScript strict mode
✅ Next.js 15 App Router
✅ Tailwind CSS 4
✅ Framer Motion animations
✅ Socket.IO + HTTP fallback

---

## 📊 Performance

**Build:**
- Compilation: 16.2s
- TypeScript: 5.5s
- Pages: 4 routes (all prerendered)

**Runtime:**
- Initial Load: ~2.5s (with animations)
- Hydration: <500ms
- Core Web Vitals: LCP ~2s, CLS <0.1

---

## ✅ Pre-Deployment Checklist

- [ ] `npm run build` passes (no errors)
- [ ] All 4 routes render correctly
- [ ] `/stations` loads live data from ESP32
- [ ] `/meir` admin page accessible
- [ ] Flask `/api/health` returns 200
- [ ] Chatbot sends request to Flask `/api/chatbot`
- [ ] Environment variables set (Vercel + Render)
- [ ] CORS configured (Flask CORS_ORIGINS)
- [ ] git push to master (or PR → merge)

---

## 🐛 Troubleshooting

### "Cannot fetch `/api/chatbot`"
→ Check `FLASK_URL` env var in Vercel
→ Verify Flask is running
→ Check CORS headers in Flask

### "ESP32 offline" shows on dashboard
→ Flask `/api/sensor-data` not returning data
→ Check ESP32 WiFi connection
→ Verify socket.io connection in useSensorSocket

### "Build failed" on Vercel
→ Run `npm run build` locally first
→ Check Node version (16+ required)
→ Clear cache: Vercel Dashboard → Settings → Clear Cache

---

## 📞 Support

- **Frontend Issues:** See `nextjs/README.md`
- **Backend Issues:** See root `README.md`
- **GitHub Issues:** Create issue with `[Phase 2]` tag

---

**Last Updated:** 2026-04-12
**Built with:** Next.js 15, Flask 2.3, Tailwind CSS 4
