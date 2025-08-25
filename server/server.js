import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());

// Game state
let gameState = {
  currentGame: null,
  isActive: false,
  round: 0,
  participants: new Map(),
  scores: new Map(),
  currentQuestion: null,
  answers: new Map(),
  timeLeft: 0,
  gameTimer: null
};

// Game data
const games = {
  emojiMovie: {
    name: "Emoji Movie Guess",
    questions: [
      { id: 1, emojis: "👑🗡️⚔️", answer: "bahubali", hint: "Epic war drama with Prabhas" },
      { id: 2, emojis: "🚂🎬❤️", answer: "ddlj", hint: "Raj and Simran's love story" },
      { id: 3, emojis: "�🤪�", answer: "munna bhai mbbs", hint: "Sanjay Dutt as a funny doctor" },
      { id: 4, emojis: "🏃‍♂️💨⭐", answer: "3 idiots", hint: "Aamir Khan engineering comedy" },
      { id: 5, emojis: "👨‍👦💔�", answer: "taare zameen par", hint: "Special child and caring teacher" },
      { id: 6, emojis: "🎭🎪🎨", answer: "dangal", hint: "Wrestling sisters and their father" },
      { id: 7, emojis: "🌟�✨", answer: "zindagi na milegi dobara", hint: "Three friends Spain adventure" },
      { id: 8, emojis: "🔥💥⚡", answer: "sholay", hint: "Gabbar Singh classic revenge" },
      { id: 9, emojis: "❤️�🎵", answer: "aashiqui 2", hint: "Aditya Roy Kapun music romance" },
      { id: 10, emojis: "🏏🇮🇳🏆", answer: "ms dhoni", hint: "Captain Cool's biopic" }
    ]
  },
  wordScramble: {
    name: "Word Scramble",
    questions: [
      { id: 1, scrambled: "WOLLERAFRE", answer: "farewell", hint: "Goodbye event" },
      { id: 2, scrambled: "DRENSIF", answer: "friends", hint: "People you care about" },
      { id: 3, scrambled: "YROMEME", answer: "memory", hint: "Something you remember" },
      { id: 4, scrambled: "TEGREHOT", answer: "together", hint: "In unity" },
      { id: 5, scrambled: "PHYPA", answer: "happy", hint: "Feeling joyful" },
      { id: 6, scrambled: "CEILARBETON", answer: "celebration", hint: "Party time" },
      { id: 7, scrambled: "MASTE", answer: "teams", hint: "Working groups" },
      { id: 8, scrambled: "CCUSSESS", answer: "success", hint: "Achievement" },
      { id: 9, scrambled: "RUUTEF", answer: "future", hint: "What's coming next" },
      { id: 10, scrambled: "SIHW", answer: "wish", hint: "Hope for something" }
    ]
  }
};

// Socket connections
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Admin joins
  socket.on('join-admin', () => {
    socket.join('admin');
    socket.emit('game-state', gameState);
    console.log('Admin joined');
  });

  // Participant joins
  socket.on('join-participant', (data) => {
    const { name } = data;
    const participantId = socket.id;
    
    gameState.participants.set(participantId, {
      id: participantId,
      name: name,
      socketId: socket.id
    });
    
    if (!gameState.scores.has(participantId)) {
      gameState.scores.set(participantId, 0);
    }
    
    socket.join('participants');
    
    // Send current game state to participant
    socket.emit('participant-joined', {
      participantId,
      currentGame: gameState.currentGame,
      isActive: gameState.isActive,
      currentQuestion: gameState.currentQuestion
    });
    
    // Update admin with new participant
    io.to('admin').emit('participant-update', {
      participants: Array.from(gameState.participants.values()),
      scores: Object.fromEntries(gameState.scores)
    });
    
    console.log(`Participant ${name} joined with ID: ${participantId}`);
  });

  // Start game
  socket.on('start-game', (data) => {
    const { gameType } = data;
    
    if (games[gameType]) {
      gameState.currentGame = gameType;
      gameState.isActive = true;
      gameState.round = 0;
      gameState.answers.clear();
      
      // Start first question
      startNextQuestion();
      
      io.emit('game-started', {
        gameType,
        gameName: games[gameType].name
      });
      
      console.log(`Game started: ${games[gameType].name}`);
    }
  });

  // Submit answer
  socket.on('submit-answer', (data) => {
    const { answer } = data;
    const participantId = socket.id;
    
    if (gameState.isActive && gameState.currentQuestion) {
      const currentTime = Date.now();
      gameState.answers.set(participantId, {
        answer: answer.toLowerCase().trim(),
        timestamp: currentTime,
        participant: gameState.participants.get(participantId)
      });
      
      console.log(`Answer submitted by ${gameState.participants.get(participantId)?.name}: ${answer}`);
      
      // Update admin with answer count
      io.to('admin').emit('answer-received', {
        participantId,
        answerCount: gameState.answers.size,
        totalParticipants: gameState.participants.size
      });
    }
  });

  // End current question
  socket.on('end-question', () => {
    endCurrentQuestion();
  });

  // End game
  socket.on('end-game', () => {
    endGame();
  });

  // Disconnect
  socket.on('disconnect', () => {
    if (gameState.participants.has(socket.id)) {
      const participant = gameState.participants.get(socket.id);
      gameState.participants.delete(socket.id);
      gameState.answers.delete(socket.id);
      
      io.to('admin').emit('participant-update', {
        participants: Array.from(gameState.participants.values()),
        scores: Object.fromEntries(gameState.scores)
      });
      
      console.log(`Participant ${participant?.name} disconnected`);
    }
    console.log('User disconnected:', socket.id);
  });
});

function startNextQuestion() {
  if (!gameState.currentGame || !games[gameState.currentGame]) return;
  
  const game = games[gameState.currentGame];
  if (gameState.round >= game.questions.length) {
    endGame();
    return;
  }
  
  gameState.currentQuestion = game.questions[gameState.round];
  gameState.answers.clear();
  gameState.timeLeft = parseInt(process.env.GAME_TIMER) || 30; // Timer from env or default 30 seconds
  
  // Send question to all participants
  io.to('participants').emit('new-question', {
    question: gameState.currentQuestion,
    round: gameState.round + 1,
    totalRounds: game.questions.length,
    timeLeft: gameState.timeLeft
  });
  
  // Send question to admin
  io.to('admin').emit('question-started', {
    question: gameState.currentQuestion,
    round: gameState.round + 1,
    totalRounds: game.questions.length,
    timeLeft: gameState.timeLeft
  });
  
  // Start countdown timer
  gameState.gameTimer = setInterval(() => {
    gameState.timeLeft--;
    
    io.emit('timer-update', { timeLeft: gameState.timeLeft });
    
    if (gameState.timeLeft <= 0) {
      endCurrentQuestion();
    }
  }, 1000);
  
  console.log(`Question ${gameState.round + 1} started`);
}

function endCurrentQuestion() {
  if (gameState.gameTimer) {
    clearInterval(gameState.gameTimer);
    gameState.gameTimer = null;
  }
  
  if (!gameState.currentQuestion) return;
  
  // Calculate scores
  const correctAnswer = gameState.currentQuestion.answer.toLowerCase();
  const results = [];
  
  gameState.answers.forEach((answerData, participantId) => {
    const participant = gameState.participants.get(participantId);
    const isCorrect = answerData.answer === correctAnswer;
    
    if (isCorrect) {
      // Award points based on speed (faster = more points)
      const timeBonus = Math.max(0, gameState.timeLeft);
      const points = 100 + timeBonus * 2;
      gameState.scores.set(participantId, (gameState.scores.get(participantId) || 0) + points);
    }
    
    results.push({
      participantId,
      participant: participant,
      answer: answerData.answer,
      isCorrect,
      points: isCorrect ? 100 + Math.max(0, gameState.timeLeft) * 2 : 0
    });
  });
  
  // Sort results by score for this round
  results.sort((a, b) => b.points - a.points);
  
  // Create leaderboard
  const leaderboard = Array.from(gameState.scores.entries())
    .map(([participantId, score]) => ({
      participant: gameState.participants.get(participantId),
      score
    }))
    .sort((a, b) => b.score - a.score);
  
  // Send results to everyone
  io.emit('question-ended', {
    correctAnswer: gameState.currentQuestion.answer,
    results,
    leaderboard,
    round: gameState.round + 1
  });
  
  gameState.round++;
  gameState.currentQuestion = null;
  
  console.log(`Question ended. Results:`, results);
}

function endGame() {
  gameState.isActive = false;
  gameState.currentGame = null;
  gameState.currentQuestion = null;
  gameState.round = 0;
  
  if (gameState.gameTimer) {
    clearInterval(gameState.gameTimer);
    gameState.gameTimer = null;
  }
  
  // Final leaderboard
  const finalLeaderboard = Array.from(gameState.scores.entries())
    .map(([participantId, score]) => ({
      participant: gameState.participants.get(participantId),
      score
    }))
    .sort((a, b) => b.score - a.score);
  
  io.emit('game-ended', {
    finalLeaderboard
  });
  
  console.log('Game ended');
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`Game Timer: ${process.env.GAME_TIMER}s`);
});
