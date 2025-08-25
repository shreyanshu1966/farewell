# Quick Deploy Instructions for Farewell App

## 🚀 Ready to Deploy!

Your app is now ready for deployment. All dependencies are installed and the build is successful.

### Quick Start Options:

## Option 1: One-Click Deployments (Easiest)

### Deploy Backend to Railway:
1. Go to https://railway.app
2. Login with GitHub
3. Click "Deploy from GitHub repo"
4. Select your repository and choose `/server` as root directory
5. Add these environment variables:
   - `GAME_TIMER`: 30
   - `ADMIN_PASSWORD`: admin123
   - `FRONTEND_URL`: (leave empty for now)

### Deploy Frontend to Vercel:
1. Go to https://vercel.com
2. Login with GitHub
3. Import your repository
4. Framework: Vite
5. Add environment variables:
   - `VITE_ADMIN_PASSWORD`: admin123
   - `VITE_BACKEND_URL`: (your Railway backend URL)

## Option 2: Manual Deploy Commands

### Backend (Railway CLI):
```bash
npm install -g @railway/cli
railway login
railway init
railway add
railway deploy
```

### Frontend (Vercel CLI):
```bash
npm install -g vercel
vercel
```

## Option 3: Alternative Platforms

### Backend alternatives:
- **Render**: https://render.com (free tier available)
- **Heroku**: https://heroku.com (requires credit card)
- **DigitalOcean App Platform**: https://digitalocean.com

### Frontend alternatives:
- **Netlify**: https://netlify.com (drag and drop the `dist` folder)
- **GitHub Pages**: Enable in repository settings
- **Surge.sh**: `npm install -g surge && surge dist`

## 🔧 Configuration

After deployment, update these URLs:

1. **Backend FRONTEND_URL**: Update with your deployed frontend URL
2. **Frontend VITE_BACKEND_URL**: Update with your deployed backend URL

## 🧪 Test Your Deployment

1. Visit your frontend URL
2. Click "Admin Login" and use password: `admin123`
3. Start a game
4. Open incognito window to test as participant
5. Verify real-time features work

## 📁 File Structure Created:
- ✅ `vercel.json` - Vercel configuration
- ✅ `server/Procfile` - Railway/Heroku configuration  
- ✅ `.env.production` - Production environment variables
- ✅ `server/.env.production` - Backend production variables
- ✅ `deploy.bat` / `deploy.sh` - Deployment scripts
- ✅ `DEPLOYMENT.md` - Detailed deployment guide

## 🆘 Need Help?
Check the detailed `DEPLOYMENT.md` file for troubleshooting and advanced options.

---
**Your app is ready to go live! 🎉**
