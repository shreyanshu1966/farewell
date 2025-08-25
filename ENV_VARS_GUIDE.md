# Environment Variables Setup Guide

## 🔧 Setting Environment Variables Correctly

### For Vercel Frontend:

1. **During Initial Setup**:
   - When importing your repo, look for "Environment Variables" section
   - Click "Add" for each variable:
     - `VITE_BACKEND_URL` = `https://your-railway-app.railway.app`
     - `VITE_ADMIN_PASSWORD` = `admin123`

2. **After Deployment**:
   - Go to Vercel Dashboard → Your Project
   - Click "Settings" tab
   - Click "Environment Variables" in sidebar
   - Add variables and redeploy

### For Railway Backend:

1. **In Railway Dashboard**:
   - Go to your service
   - Click "Variables" tab
   - Add each variable:
     - `GAME_TIMER` = `30`
     - `ADMIN_PASSWORD` = `admin123`
     - `FRONTEND_URL` = `https://your-vercel-app.vercel.app`

## ⚠️ Important Notes:

- **Don't use secrets notation** (`@secret_name`) in vercel.json
- **Environment variables are set in the platform dashboard**, not in config files
- **Vite requires `VITE_` prefix** for frontend environment variables
- **Redeploy after changing environment variables**

## 🔄 Typical Deployment Flow:

1. Deploy backend to Railway first
2. Copy the Railway URL
3. Deploy frontend to Vercel with backend URL
4. Copy the Vercel URL
5. Update Railway backend with frontend URL
6. Test the live application

---

**The vercel.json file has been fixed and no longer references non-existent secrets!** ✅
