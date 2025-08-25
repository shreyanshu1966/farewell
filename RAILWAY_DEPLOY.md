# Railway Deployment Guide for Farewell App

## 🚂 Step-by-Step Railway Deployment

### Option 1: Deploy Backend via Railway Dashboard (Recommended)

1. **Go to Railway**: https://railway.app
2. **Sign up/Login** with your GitHub account
3. **Create New Project**: Click "New Project"
4. **Deploy from GitHub**: Select "Deploy from GitHub repo"
5. **Select Repository**: Choose your `farewell` repository
6. **Auto-Detection**: Railway will detect both services:
   - Node.js service (backend in `/server` folder)
   - Vite/React service (frontend in root)
7. **Deploy Backend First**: Click "Deploy" on the Node.js service
8. **Configure Backend**:
   - Go to your backend service dashboard
   - Click on "Settings" tab
   - Under "Source Repo", set **Root Directory** to `server`
   - Click "Variables" tab and add:
     ```
     GAME_TIMER=30
     ADMIN_PASSWORD=admin123
     FRONTEND_URL=(will update after frontend deployment)
     ```
9. **Get Backend URL**: Copy the generated URL from the "Deployments" tab

### Option 2: Deploy via Railway CLI

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Deploy Backend**:
   ```bash
   cd server
   railway init
   railway up
   ```

4. **Set Environment Variables**:
   ```bash
   railway variables set GAME_TIMER=30
   railway variables set ADMIN_PASSWORD=admin123
   railway variables set FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

## 🎯 Deploy Frontend to Vercel

1. **Go to Vercel**: https://vercel.com
2. **Import Repository**: Click "New Project" → Import your repository
3. **Configure Build**:
   - Framework Preset: **Vite**
   - Root Directory: **Leave as is (root)**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Environment Variables** (Add these in Vercel dashboard):
   - Click "Environment Variables" section during setup
   - Add each variable:
     - Name: `VITE_BACKEND_URL`, Value: `https://your-railway-backend-url.railway.app`
     - Name: `VITE_ADMIN_PASSWORD`, Value: `admin123`
5. **Deploy**: Click "Deploy"

### Alternative: Set Environment Variables After Deployment
If you skip env vars during setup:
1. Go to your Vercel project dashboard
2. Click "Settings" tab
3. Click "Environment Variables" 
4. Add the variables listed above
5. Redeploy from "Deployments" tab

## 🔄 Final Configuration

After both deployments:

1. **Update Backend FRONTEND_URL**:
   - Go to Railway dashboard → Your backend service
   - Variables tab → Edit `FRONTEND_URL`
   - Set to your Vercel frontend URL
   - Service will auto-redeploy

2. **Update Frontend BACKEND_URL** (if needed):
   - Go to Vercel dashboard → Your project
   - Settings → Environment Variables
   - Update `VITE_BACKEND_URL` if needed

## 🎮 Test Your Live App

1. Visit your Vercel frontend URL
2. Test admin login with password: `admin123`
3. Open incognito/another browser for participant view
4. Start a game and verify real-time functionality

## 📋 Environment Variables Summary

### Railway Backend Variables:
```
GAME_TIMER=30
ADMIN_PASSWORD=admin123
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Vercel Frontend Variables:
```
VITE_BACKEND_URL=https://your-railway-app.railway.app
VITE_ADMIN_PASSWORD=admin123
```

## 🆘 Troubleshooting

### Common Railway Issues:

1. **Build Fails**: Check that `package.json` is in the server directory
2. **Service Won't Start**: Verify `npm start` script exists in server/package.json
3. **Environment Variables**: Make sure all variables are set in Railway dashboard
4. **CORS Errors**: Ensure FRONTEND_URL matches your exact Vercel domain

### Railway Dashboard Navigation:
- **Deployments**: View deployment logs and status
- **Variables**: Set environment variables
- **Settings**: Configure root directory and other settings
- **Metrics**: Monitor usage and performance

## 💡 Pro Tips

1. **Custom Domain**: Add custom domain in Railway project settings (paid feature)
2. **Logs**: Check Railway deployment logs for debugging
3. **Auto-Deploy**: Railway auto-deploys on git push to main branch
4. **Scaling**: Railway automatically scales based on usage

---

**Your app should now be live! 🎉**

Railway Backend URL: `https://your-service-name.railway.app`
Vercel Frontend URL: `https://your-project.vercel.app`
