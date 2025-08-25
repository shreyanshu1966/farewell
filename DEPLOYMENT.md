# Farewell App Deployment Guide

This guide will help you deploy both the frontend (React + Vite) and backend (Node.js + Express + Socket.IO) of your Farewell mini-games application.

## Prerequisites

1. Git repository (GitHub, GitLab, etc.)
2. Accounts on deployment platforms:
   - **Frontend**: Vercel, Netlify, or GitHub Pages
   - **Backend**: Railway, Render, Heroku, or DigitalOcean

## Quick Deployment Steps

### Step 1: Prepare for Deployment

Run the deployment preparation script:
```bash
# On Windows
deploy.bat

# On macOS/Linux
chmod +x deploy.sh
./deploy.sh
```

### Step 2: Deploy Backend First

#### Option A: Railway (Recommended)
1. Go to [Railway](https://railway.app)
2. Sign up/Login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Choose the `server` folder as root directory
6. Set environment variables:
   - `PORT`: (leave empty, Railway will set automatically)
   - `FRONTEND_URL`: (will update after frontend deployment)
   - `GAME_TIMER`: 30
   - `ADMIN_PASSWORD`: admin123
7. Deploy and copy the provided URL

#### Option B: Render
1. Go to [Render](https://render.com)
2. Sign up/Login with GitHub
3. Click "New Web Service"
4. Connect your repository
5. Set:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Add environment variables (same as Railway)
7. Deploy and copy the provided URL

#### Option C: Heroku
1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set buildpack: `heroku buildpacks:set heroku/nodejs`
5. Set config vars:
   ```bash
   heroku config:set FRONTEND_URL=https://your-frontend-url.vercel.app
   heroku config:set GAME_TIMER=30
   heroku config:set ADMIN_PASSWORD=admin123
   ```
6. Deploy: 
   ```bash
   git subtree push --prefix server heroku main
   ```

### Step 3: Deploy Frontend

#### Option A: Vercel (Recommended)
1. Go to [Vercel](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project" → Import your repository
4. Set Framework Preset: "Vite"
5. Set environment variables:
   - `VITE_BACKEND_URL`: [Your backend URL from Step 2]
   - `VITE_ADMIN_PASSWORD`: admin123
6. Deploy

#### Option B: Netlify
1. Go to [Netlify](https://netlify.com)
2. Sign up/Login with GitHub
3. Click "New site from Git"
4. Choose your repository
5. Set:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add environment variables in Site Settings
7. Deploy

#### Option C: GitHub Pages
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to package.json scripts:
   ```json
   "homepage": "https://yourusername.github.io/farewell",
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```
3. Run: `npm run deploy`

### Step 4: Update Environment Variables

After both deployments:

1. **Update Backend FRONTEND_URL**:
   - Go to your backend deployment platform
   - Update `FRONTEND_URL` environment variable with your frontend URL
   - Restart the backend service

2. **Update Frontend BACKEND_URL** (if needed):
   - Go to your frontend deployment platform
   - Ensure `VITE_BACKEND_URL` points to your backend URL

## Environment Variables Summary

### Frontend (.env.production)
```
VITE_BACKEND_URL=https://your-backend-url
VITE_ADMIN_PASSWORD=admin123
```

### Backend (server/.env.production)
```
PORT=(auto-set by platform)
FRONTEND_URL=https://your-frontend-url
GAME_TIMER=30
ADMIN_PASSWORD=admin123
```

## Testing Your Deployment

1. Visit your frontend URL
2. Try accessing the admin panel with password: `admin123`
3. Open another browser/incognito window to test participant view
4. Start a game and verify real-time functionality works

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure FRONTEND_URL in backend matches your frontend domain exactly
2. **Socket.IO Connection Failed**: Ensure your backend URL is correctly set in frontend
3. **Environment Variables**: Check that all required env vars are set on both platforms
4. **Build Failures**: Make sure all dependencies are in package.json, not just devDependencies

### Logs:
- **Railway**: Check logs in Railway dashboard
- **Render**: Check logs in Render dashboard  
- **Vercel**: Check function logs in Vercel dashboard
- **Netlify**: Check deploy logs in Netlify dashboard

## Optional: Custom Domain

1. **Frontend**: Add custom domain in your hosting platform settings
2. **Backend**: Add custom domain (may require paid plan)
3. Update environment variables with new domains

## Security Notes

- Change `ADMIN_PASSWORD` in production
- Consider adding rate limiting for production use
- Use HTTPS for both frontend and backend in production

## Support

If you encounter issues:
1. Check the deployment platform's documentation
2. Verify environment variables are set correctly
3. Check browser console and network tabs for errors
4. Review server logs for backend issues
