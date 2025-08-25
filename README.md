# 🎉 Farewell Mini Games

A fun interactive mini games application for farewell parti## 🎯 Game Types

### Emoji Movie Guess 🎬
- Guess **Indian movies** from emoji clues
- Text input format (no multiple choice)
- Hints provided for each movie
- Features popular Bollywood films like:
  - Bahubali, DDLJ, 3 Idiots
  - Dangal, Sholay, MS Dhoni
  - And many more!

### Word Scramble 🔤
- Unscramble mixed-up words
- Helpful hints provided
- Type your answer
- Farewell and friendship themed words

## ⚙️ Configuration

### Environment Variables

**Backend** (`server/.env`):
```env
PORT=3001
FRONTEND_URL=http://localhost:5173
GAME_TIMER=30
ADMIN_PASSWORD=admin123
```

**Frontend** (`.env`):
```env
VITE_BACKEND_URL=http://localhost:3001
VITE_ADMIN_PASSWORD=admin123
```

### Customizing Game Content

Edit `server/server.js` to modify questions:

```javascript
const games = {
  emojiMovie: {
    name: "Emoji Movie Guess",
    questions: [
      { 
        id: 1, 
        emojis: "👑🗡️⚔️", 
        answer: "bahubali", 
        hint: "Epic war drama with Prabhas" 
      },
      // Add more Indian movies...
    ]
  }
}
```s real-time multiplayer games with an admin dashboard and participant mobile interface.

## 🎮 Features

- **Admin Dashboard**: Control games, view live progress, and see leaderboards
- **Participant Interface**: Join games from mobile phones
- **Real-time Communication**: Live updates using Socket.IO
- **Environment Variables**: Easy deployment configuration
- **Multiple Games**:
  - 🎬 **Emoji Movie Guess**: Guess **Indian movies** from emoji clues (text input)
  - 🔤 **Word Scramble**: Unscramble words with hints
- **Live Leaderboard**: See rankings after each round
- **Dare System**: Last place gets a dare/task!

## 🚀 Getting Started

### Prerequisites
- Node.js (v20 or higher)
- npm

### Installation

1. **Clone/Download the project**
2. **Install dependencies**:
   ```bash
   npm install
   cd server
   npm install
   cd ..
   ```

3. **Start the application**:
   ```bash
   npm start
   ```

This will start both the backend server (port 3001) and frontend (port 5173).

### Alternative (Manual Start)

If you prefer to start services separately:

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## 🎯 How to Use

### 1. Setup
- Open the application at `http://localhost:5173`
- Admin should access admin dashboard (password: `admin123`)
- Participants join using their phones at the same URL

### 2. Admin Controls
- **Start Game**: Choose between Emoji Movie Guess or Word Scramble
- **Monitor Progress**: See live answer submissions and timer
- **End Questions**: Manually end questions or let timer expire
- **View Leaderboard**: See real-time rankings
- **End Game**: Finish the game and see final results

### 3. Participant Experience
- Enter name to join
- Wait for admin to start games
- Answer questions within time limit
- View results and leaderboard after each round
- See final rankings when game ends

### 4. Game Flow
1. Participants join and wait
2. Admin starts a game type
3. Questions appear for 30 seconds each
4. Participants submit answers
5. Results shown with points (speed bonus for correct answers)
6. Leaderboard updated after each round
7. Final results show who gets the dare/task!

## 🎮 Game Types

### Emoji Movie Guess 🎬
- Guess movies from emoji clues
- Multiple choice format
- Quick selection interface

### Word Scramble 🔤
- Unscramble mixed-up words
- Helpful hints provided
- Type your answer

## 🏆 Scoring System

- **Correct Answer**: 100 base points
- **Speed Bonus**: +2 points per second remaining
- **Leaderboard**: Sorted by total score
- **Dare/Task**: Last place gets a fun challenge!

## 🔧 Technical Details

### Frontend
- **React 19** with modern hooks
- **Socket.IO Client** for real-time communication
- **React Router** for navigation
- **Responsive Design** for mobile and desktop

### Backend
- **Node.js** with Express
- **Socket.IO** for real-time communication
- **Game State Management** in memory
- **RESTful API** structure

### Key Files
```
├── src/
│   ├── components/
│   │   ├── AdminDashboard.jsx     # Admin control panel
│   │   ├── ParticipantView.jsx    # Mobile participant interface
│   │   └── LandingPage.jsx        # Entry point
│   └── App.jsx                    # Main app with routing
├── server/
│   └── server.js                  # Backend with Socket.IO
└── package.json                   # Dependencies and scripts
```

## 🎨 Customization

### Adding New Games
1. Add game data to `games` object in `server/server.js`
2. Update frontend components to handle new game type
3. Add UI components for the new game format

### Modifying Questions
Edit the `games` object in `server/server.js`:
```javascript
const games = {
  emojiMovie: {
    name: "Emoji Movie Guess",
    questions: [
      { id: 1, emojis: "🦁👑", answer: "the lion king", options: [...] },
      // Add more questions...
    ]
  }
}
```

### Styling
- CSS files are in `src/components/`
- Responsive design included
- Easy to customize colors and layouts

## 🌐 Network Setup

For use on multiple devices:
1. Find your computer's IP address
2. Update Socket.IO connection in components to use your IP instead of `localhost`
3. Ensure all devices are on the same network
4. Access via `http://[YOUR-IP]:5173`

## 🎉 Perfect For

- Office farewell parties
- School/college goodbye events
- Family gatherings
- Team building activities
- Any group celebration!

## 🤝 Contributing

Feel free to fork, modify, and improve! Add new games, enhance the UI, or improve the scoring system.

## 🚀 Deployment

### For Production Deployment:

1. **Update Environment Variables:**

**Backend** (`server/.env`):
```env
PORT=3001
FRONTEND_URL=https://your-frontend-domain.com
GAME_TIMER=30
ADMIN_PASSWORD=your-secure-password
```

**Frontend** (`.env`):
```env
VITE_BACKEND_URL=https://your-backend-domain.com
VITE_ADMIN_PASSWORD=your-secure-password
```

2. **Build the Frontend:**
```bash
npm run build
```

3. **Deploy Backend:**
   - Upload `server/` folder to your backend hosting
   - Install dependencies: `npm install`
   - Start with: `npm start`

4. **Deploy Frontend:**
   - Upload `dist/` folder (created after build) to your frontend hosting
   - Or use the built files with any static hosting service

### Popular Hosting Options:
- **Backend**: Railway, Render, Heroku, DigitalOcean
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Full Stack**: Railway, Render (both frontend & backend)

---

**Have fun with your farewell party! 🎊**+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
