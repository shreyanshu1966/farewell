@echo off
echo Deploying Farewell App...

echo.
echo Step 1: Install dependencies for frontend
npm install

echo.
echo Step 2: Install dependencies for backend
cd server
npm install
cd ..

echo.
echo Step 3: Build frontend for production
npm run build

echo.
echo Deployment preparation complete!
echo.
echo Next steps:
echo 1. Deploy backend to Railway/Render/Heroku
echo 2. Update VITE_BACKEND_URL in .env.production with your backend URL
echo 3. Deploy frontend to Vercel/Netlify
echo 4. Update FRONTEND_URL in server/.env.production with your frontend URL

pause
