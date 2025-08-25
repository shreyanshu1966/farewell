import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
    credentials: true
  }
});

app.use(express.json());

// Game state
let gameState = {
  currentGame: null,
  isActive: false,
  round: 0,
  totalRounds: 3,
  participants: new Map(),
  scores: new Map(),
  teams: new Map(), // team id -> {id, name, members: [], totalScore: 0}
  teamScores: new Map(), // team id -> score
  teamsFormed: false,
  currentQuestion: null,
  answers: new Map(),
  timeLeft: 0,
  gameTimer: null,
  gameSequence: [], // Will store the sequence of games for 3 rounds
  completedRounds: 0
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
    socket.emit('game-state', {
      ...gameState,
      participants: Array.from(gameState.participants.values()),
      teams: Array.from(gameState.teams.values()),
      teamScores: Object.fromEntries(gameState.teamScores)
    });
    console.log('Admin joined');
  });

  // Form teams
  socket.on('form-teams', () => {
    if (gameState.participants.size < 3) {
      socket.emit('error', { message: 'Need at least 3 participants to form teams' });
      return;
    }
    
    formTeams();
    
    // Send team information to everyone
    io.emit('teams-formed', {
      teams: Array.from(gameState.teams.values()),
      teamsFormed: true
    });
    
    console.log('Teams formed');
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
      currentQuestion: gameState.currentQuestion,
      teamsFormed: gameState.teamsFormed,
      teams: Array.from(gameState.teams.values())
    });
    
    // Update admin with new participant
    io.to('admin').emit('participant-update', {
      participants: Array.from(gameState.participants.values()),
      scores: Object.fromEntries(gameState.scores),
      teams: Array.from(gameState.teams.values()),
      teamScores: Object.fromEntries(gameState.teamScores)
    });
    
    console.log(`Participant ${name} joined with ID: ${participantId}`);
  });

  // Start game
  socket.on('start-game', () => {
    if (!gameState.teamsFormed) {
      socket.emit('error', { message: 'Please form teams first before starting the game' });
      return;
    }
    
    if (gameState.teams.size === 0) {
      socket.emit('error', { message: 'No teams available' });
      return;
    }
    
    // Generate random game sequence for 3 rounds
    generateGameSequence();
    
    gameState.isActive = true;
    gameState.round = 0;
    gameState.completedRounds = 0;
    gameState.answers.clear();
    
    // Reset team scores
    gameState.teamScores.clear();
    gameState.teams.forEach((team) => {
      gameState.teamScores.set(team.id, 0);
    });
    
    // Start first round
    startNextRound();
    
    io.emit('game-started', {
      gameSequence: gameState.gameSequence,
      totalRounds: gameState.totalRounds,
      teams: Array.from(gameState.teams.values())
    });
    
    console.log('Game started with sequence:', gameState.gameSequence);
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

  // Start next question
  socket.on('start-next-question', () => {
    if (gameState.isActive && !gameState.currentQuestion) {
      startNextQuestion();
    }
  });

  // End game
  socket.on('end-game', () => {
    endGame();
  });

  // Set number of rounds
  socket.on('set-rounds', (data) => {
    const { rounds } = data;
    if (rounds && rounds >= 1 && rounds <= 10) {
      gameState.totalRounds = rounds;
      gameState.gameSequence = generateGameSequence(rounds);
      
      io.to('admin').emit('game-state', {
        ...gameState,
        participants: Array.from(gameState.participants.values()),
        teams: Array.from(gameState.teams.values()),
        teamScores: Object.fromEntries(gameState.teamScores)
      });
      
      io.emit('rounds-updated', { totalRounds: rounds });
      console.log(`Total rounds set to: ${rounds}`);
    }
  });

  // Reset game completely
  socket.on('reset-game', () => {
    resetGame();
    
    // Notify all connected clients about the reset
    io.emit('game-reset');
    
    io.to('admin').emit('game-state', {
      ...gameState,
      participants: Array.from(gameState.participants.values()),
      teams: Array.from(gameState.teams.values()),
      teamScores: Object.fromEntries(gameState.teamScores)
    });
    
    console.log('Game completely reset by admin');
  });

  // Disconnect
  socket.on('disconnect', () => {
    if (gameState.participants.has(socket.id)) {
      const participant = gameState.participants.get(socket.id);
      gameState.participants.delete(socket.id);
      gameState.answers.delete(socket.id);
      
      io.to('admin').emit('participant-update', {
        participants: Array.from(gameState.participants.values()),
        scores: Object.fromEntries(gameState.scores),
        teams: Array.from(gameState.teams.values()),
        teamScores: Object.fromEntries(gameState.teamScores)
      });
      
      console.log(`Participant ${participant?.name} disconnected`);
    }
    console.log('User disconnected:', socket.id);
  });
});

function formTeams() {
  const participants = Array.from(gameState.participants.values());
  const maxTeamSize = 3;
  const numFullTeams = Math.floor(participants.length / maxTeamSize);
  const remainingParticipants = participants.length % maxTeamSize;
  
  // Clear existing teams
  gameState.teams.clear();
  gameState.teamScores.clear();
  
  if (participants.length < 3) {
    console.log('Not enough participants to form teams');
    return;
  }
  
  // Shuffle participants randomly
  const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5);
  
  let participantIndex = 0;
  
  // Create full teams of 3 members each
  for (let i = 0; i < numFullTeams; i++) {
    const teamId = `team-${i + 1}`;
    const teamMembers = shuffledParticipants.slice(participantIndex, participantIndex + maxTeamSize);
    participantIndex += maxTeamSize;
    
    const team = {
      id: teamId,
      name: `Team ${i + 1}`,
      members: teamMembers,
      totalScore: 0
    };
    
    gameState.teams.set(teamId, team);
    gameState.teamScores.set(teamId, 0);
  }
  
  // Handle remaining participants (1 or 2 people)
  if (remainingParticipants > 0 && numFullTeams > 0) {
    // Distribute remaining participants to existing teams (ensuring no team exceeds 3)
    const leftoverParticipants = shuffledParticipants.slice(participantIndex);
    const teamKeys = Array.from(gameState.teams.keys());
    
    leftoverParticipants.forEach((participant, index) => {
      // Only add if the target team has less than 3 members
      const targetTeamId = teamKeys[index % teamKeys.length];
      const targetTeam = gameState.teams.get(targetTeamId);
      
      if (targetTeam.members.length < maxTeamSize) {
        targetTeam.members.push(participant);
      } else {
        // If all teams are full, create a new team with remaining participants
        const newTeamId = `team-${gameState.teams.size + 1}`;
        const newTeam = {
          id: newTeamId,
          name: `Team ${gameState.teams.size + 1}`,
          members: [participant],
          totalScore: 0
        };
        gameState.teams.set(newTeamId, newTeam);
        gameState.teamScores.set(newTeamId, 0);
      }
    });
  } else if (remainingParticipants > 0) {
    // If no full teams but have remaining participants, create a team with them
    const teamId = `team-1`;
    const team = {
      id: teamId,
      name: `Team 1`,
      members: shuffledParticipants.slice(participantIndex),
      totalScore: 0
    };
    gameState.teams.set(teamId, team);
    gameState.teamScores.set(teamId, 0);
  }
  
  gameState.teamsFormed = true;
  
  // Log team formation
  console.log('Teams formed:');
  gameState.teams.forEach((team) => {
    console.log(`${team.name}: ${team.members.map(m => m.name).join(', ')} (${team.members.length} members)`);
  });
}

function generateGameSequence() {
  const gameTypes = Object.keys(games);
  gameState.gameSequence = [];
  
  for (let i = 0; i < gameState.totalRounds; i++) {
    // Randomly select a game type for each round
    const randomGameType = gameTypes[Math.floor(Math.random() * gameTypes.length)];
    gameState.gameSequence.push(randomGameType);
  }
}

function startNextRound() {
  if (gameState.completedRounds >= gameState.totalRounds) {
    endGame();
    return;
  }
  
  const currentGameType = gameState.gameSequence[gameState.completedRounds];
  gameState.currentGame = currentGameType;
  gameState.round = 0;
  
  // Start first question of the round
  startNextQuestion();
  
  io.emit('round-started', {
    roundNumber: gameState.completedRounds + 1,
    gameType: currentGameType,
    gameName: games[currentGameType].name,
    totalRounds: gameState.totalRounds
  });
}

function getParticipantTeam(participantId) {
  for (const [teamId, team] of gameState.teams) {
    if (team.members.some(member => member.id === participantId)) {
      return teamId;
    }
  }
  return null;
}

function startNextQuestion() {
  if (!gameState.currentGame || !games[gameState.currentGame]) return;
  
  const game = games[gameState.currentGame];
  if (gameState.round >= game.questions.length) {
    // Round completed, move to next round
    gameState.completedRounds++;
    startNextRound();
    return;
  }
  
  gameState.currentQuestion = game.questions[gameState.round];
  gameState.answers.clear();
  gameState.timeLeft = parseInt(process.env.GAME_TIMER) || 30;
  
  // Send question to all participants
  io.to('participants').emit('new-question', {
    question: gameState.currentQuestion,
    round: gameState.round + 1,
    totalRounds: game.questions.length,
    timeLeft: gameState.timeLeft,
    currentRound: gameState.completedRounds + 1,
    totalGameRounds: gameState.totalRounds,
    gameType: gameState.currentGame
  });
  
  // Send question to admin
  io.to('admin').emit('question-started', {
    question: gameState.currentQuestion,
    round: gameState.round + 1,
    totalRounds: game.questions.length,
    timeLeft: gameState.timeLeft,
    currentRound: gameState.completedRounds + 1,
    totalGameRounds: gameState.totalRounds,
    gameType: gameState.currentGame
  });
  
  // Start countdown timer
  gameState.gameTimer = setInterval(() => {
    gameState.timeLeft--;
    
    io.emit('timer-update', { timeLeft: gameState.timeLeft });
    
    if (gameState.timeLeft <= 0) {
      endCurrentQuestion();
    }
  }, 1000);
  
  console.log(`Question ${gameState.round + 1} of round ${gameState.completedRounds + 1} started`);
}

function endCurrentQuestion() {
  if (gameState.gameTimer) {
    clearInterval(gameState.gameTimer);
    gameState.gameTimer = null;
  }
  
  if (!gameState.currentQuestion) return;
  
  // Calculate scores for teams
  const correctAnswer = gameState.currentQuestion.answer.toLowerCase();
  const results = [];
  const teamAnswers = new Map(); // team id -> {correct answers count, total members}
  
  // Initialize team answer tracking
  gameState.teams.forEach((team) => {
    teamAnswers.set(team.id, { correctCount: 0, totalMembers: team.members.length });
  });
  
  gameState.answers.forEach((answerData, participantId) => {
    const participant = gameState.participants.get(participantId);
    const isCorrect = answerData.answer === correctAnswer;
    const teamId = getParticipantTeam(participantId);
    
    if (isCorrect && teamId) {
      const teamData = teamAnswers.get(teamId);
      teamData.correctCount++;
    }
    
    results.push({
      participantId,
      participant: participant,
      answer: answerData.answer,
      isCorrect,
      teamId: teamId
    });
  });
  
  // Award points to teams based on correct answers percentage
  teamAnswers.forEach((teamData, teamId) => {
    const correctPercentage = teamData.correctCount / teamData.totalMembers;
    let teamPoints = 0;
    
    if (correctPercentage >= 1.0) {
      teamPoints = 100; // All members correct
    } else if (correctPercentage >= 0.67) {
      teamPoints = 75; // 2/3 or more correct
    } else if (correctPercentage >= 0.33) {
      teamPoints = 50; // 1/3 or more correct
    }
    
    const currentScore = gameState.teamScores.get(teamId) || 0;
    gameState.teamScores.set(teamId, currentScore + teamPoints);
  });
  
  // Create team leaderboard
  const teamLeaderboard = Array.from(gameState.teams.entries())
    .map(([teamId, team]) => ({
      team: team,
      score: gameState.teamScores.get(teamId) || 0
    }))
    .sort((a, b) => b.score - a.score);
  
  // Send results to everyone
  io.emit('question-ended', {
    correctAnswer: gameState.currentQuestion.answer,
    results,
    teamLeaderboard,
    round: gameState.round + 1,
    currentRound: gameState.completedRounds + 1,
    totalGameRounds: gameState.totalRounds
  });
  
  gameState.round++;
  gameState.currentQuestion = null;
  
  console.log(`Question ended. Team scores:`, Object.fromEntries(gameState.teamScores));
}

function endGame() {
  gameState.isActive = false;
  gameState.currentGame = null;
  gameState.currentQuestion = null;
  gameState.round = 0;
  gameState.completedRounds = 0;
  
  if (gameState.gameTimer) {
    clearInterval(gameState.gameTimer);
    gameState.gameTimer = null;
  }
  
  // Final team leaderboard
  const finalTeamLeaderboard = Array.from(gameState.teams.entries())
    .map(([teamId, team]) => ({
      team: team,
      score: gameState.teamScores.get(teamId) || 0
    }))
    .sort((a, b) => b.score - a.score);
  
  io.emit('game-ended', {
    finalTeamLeaderboard,
    losingTeam: finalTeamLeaderboard[finalTeamLeaderboard.length - 1] // Team with lowest score
  });
  
  console.log('Game ended. Final team standings:', finalTeamLeaderboard);
}

function resetGame() {
  // Stop any active timer
  if (gameState.gameTimer) {
    clearInterval(gameState.gameTimer);
    gameState.gameTimer = null;
  }
  
  // Reset all game state
  gameState.currentGame = null;
  gameState.isActive = false;
  gameState.round = 0;
  gameState.totalRounds = 3; // Reset to default
  gameState.participants.clear();
  gameState.scores.clear();
  gameState.teams.clear();
  gameState.teamScores.clear();
  gameState.teamsFormed = false;
  gameState.currentQuestion = null;
  gameState.answers.clear();
  gameState.timeLeft = 0;
  gameState.gameSequence = [];
  gameState.completedRounds = 0;
  
  console.log('Game completely reset - all participants need to rejoin');
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`Game Timer: ${process.env.GAME_TIMER}s`);
});
