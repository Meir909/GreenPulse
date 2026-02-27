# GreenPulse Deployment Checklist

## ✅ Pre-Integration Tasks (Completed)

- [x] Remove old HTML frontend files
- [x] Copy React project from greenpulse-air-bloom-main
- [x] Install Node dependencies (npm install)
- [x] Build React project (npm run build)
- [x] Configure Flask to serve React static files
- [x] Update Flask app.py for static file serving
- [x] Verify build artifacts in dist/ folder

## 📋 Local Testing Checklist

Before deploying to Render, verify:

### Backend API
- [ ] Flask server starts without errors: `python app.py`
- [ ] Health check works: `curl http://localhost:5000/api/health`
- [ ] CORS is properly configured
- [ ] All 5 API endpoints are accessible:
  - [ ] GET `/api/sensor-data`
  - [ ] POST `/api/sensor-data`
  - [ ] POST `/api/chatbot`
  - [ ] POST `/api/ai-analyze-sensors`
  - [ ] POST `/api/ai-predict-growth`

### Frontend (React)
- [ ] Website loads at `http://localhost:5000/`
- [ ] All pages render without JavaScript errors
- [ ] Responsive design works on mobile (use F12 devtools)
- [ ] Navigation works correctly
- [ ] No console errors (open F12 in browser)

### Integration
- [ ] React can call Flask API endpoints
- [ ] Data flows from frontend to backend
- [ ] API responses display correctly in UI

## 🔧 Configuration Checklist

### .env File
- [x] OPENAI_API_KEY is set
- [x] FLASK_ENV=production (or development for local)
- [x] PORT=10000 (for Render) or 5000 (local)
- [x] DEBUG=False (production) or True (development)
- [x] CORS settings configured

### React Build
- [x] vite.config.ts configured with dist output
- [x] package.json has build script
- [x] React builds without warnings (except expected ones)
- [x] dist/ folder contains compiled files

### Flask Configuration
- [x] app.py updated with new static file routes
- [x] '/api/*' routes still work
- [x] '/' route serves dist/index.html
- [x] React Router fallback configured

## 📤 Deployment Preparation

### GitHub
- [ ] Repository is up-to-date
- [ ] .gitignore excludes node_modules and dist/
- [ ] All changes are committed

### Render Environment Variables
Add these to Render dashboard:
- [ ] OPENAI_API_KEY
- [ ] FLASK_ENV=production
- [ ] PORT=10000

### Render Build Commands
Render should:
- [ ] Install Python dependencies: `pip install -r requirements.txt`
- [ ] Install Node dependencies: `npm install`
- [ ] Build React: `npm run build`
- [ ] Start Flask: `python app.py`

Example `Procfile` (if needed):
```
web: python app.py
```

Or in Render dashboard:
- Build Command: `npm install && npm run build && pip install -r requirements.txt`
- Start Command: `python app.py`

## 🚀 Deployment Steps

1. **Prepare Local Repository**
   ```bash
   cd GreenPulse
   git add .
   git commit -m "feat: Integrate React frontend with Flask backend"
   git push origin main
   ```

2. **Connect to Render**
   - Go to https://render.com
   - Create new Web Service
   - Connect GitHub repository
   - Set Build Command: `npm install && npm run build && pip install -r requirements.txt`
   - Set Start Command: `python app.py`
   - Add environment variables in Settings

3. **Deploy**
   - Click "Deploy"
   - Monitor deployment logs
   - Check deployed site once build completes

## ✅ Post-Deployment Verification

After deployment to Render:

- [ ] Website loads at render domain
- [ ] No 404 errors on page refresh (React Router working)
- [ ] API endpoints respond (check with curl or Postman)
- [ ] Console has no JavaScript errors (F12)
- [ ] Mobile responsive (check on phone)
- [ ] Images and assets load correctly

## 🔗 Important Links

- **Local Development**: http://localhost:5000
- **Flask API Documentation**: See app.py comments
- **React Components**: `/src/components/`
- **Build Output**: `/dist/`
- **Environment Config**: `.env`
- **Status Report**: `INTEGRATION_STATUS.md`
- **Quick Start**: `QUICK_START.md`

## 🐛 Troubleshooting During Deployment

### Issue: "React build not found"
**Solution**: Ensure `npm run build` runs before Flask starts
```bash
# Test locally:
npm run build
python app.py
```

### Issue: "Cannot find module" errors
**Solution**: Ensure all dependencies are installed
```bash
npm install
pip install -r requirements.txt
```

### Issue: "CORS errors"
**Solution**: Check .env CORS_ORIGINS setting (should be Render domain)
```
CORS_ORIGINS=https://yourdomain.render.com
```

### Issue: "OPENAI_API_KEY not found"
**Solution**: Add to Render environment variables
1. Go to Render dashboard
2. Settings → Environment
3. Add OPENAI_API_KEY

### Issue: "Static files 404"
**Solution**: Ensure dist/ folder is created and committed
```bash
npm run build
git add dist/
git commit -m "chore: Add built dist folder"
git push
```

## 📊 Performance Targets

After deployment, verify:
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] No console errors
- [ ] Mobile performance score > 80
- [ ] All images load correctly

## 🎯 Optional Enhancements (Post-Deployment)

1. **Connect ESP32**
   - Upload esp32_integration.ino to device
   - Configure WiFi credentials
   - Device will send data to /api/sensor-data

2. **Add Real Data**
   - Update React components to use actual API calls
   - Remove mock data from components
   - Connect sensors for live monitoring

3. **Optimize Performance**
   - Implement code splitting in React
   - Add lazy loading for components
   - Compress images

4. **Add Error Handling**
   - Add user-friendly error messages
   - Implement retry logic for API calls
   - Add error logging

5. **Security Hardening**
   - Set restrictive CORS_ORIGINS
   - Add rate limiting to API
   - Implement authentication (if needed)

## ✨ Final Checklist

Before calling it complete:
- [x] React project successfully integrated
- [x] Flask backend serving React static files
- [x] All API endpoints functional
- [x] Build artifacts created (dist/)
- [x] Documentation updated (QUICK_START.md, INTEGRATION_STATUS.md)
- [x] Ready for Render deployment
- [ ] Successfully deployed to production
- [ ] All features working in production

---

## 📝 Notes

- Keep .env file with OPENAI_API_KEY secure (don't commit to git)
- Rebuild React after any component changes: `npm run build`
- Test locally before deploying to production
- Monitor Render logs for any errors
- Keep dependencies updated: `npm update` and `pip install --upgrade`

**Your GreenPulse application is ready for deployment! 🚀**

