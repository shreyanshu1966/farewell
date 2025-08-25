import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import './AdminDashboard.css'

function AdminDashboard() {
  const [socket, setSocket] = useState(null)
  const [gameState, setGameState] = useState({
    currentGame: null,
    isActive: false,
    round: 0
  })
  const [participants, setParticipants] = useState([])
  const [scores, setScores] = useState({})
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [answerCount, setAnswerCount] = useState(0)
  const [results, setResults] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [showResults, setShowResults] = useState(false)

  const games = {
    emojiMovie: "🎬 Emoji Movie Guess",
    wordScramble: "🔤 Word Scramble"
  }

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
    const newSocket = io(backendUrl)
    setSocket(newSocket)

    newSocket.emit('join-admin')

    newSocket.on('game-state', (state) => {
      setGameState(state)
    })

    newSocket.on('participant-update', (data) => {
      setParticipants(data.participants)
      setScores(data.scores)
    })

    newSocket.on('question-started', (data) => {
      setCurrentQuestion(data.question)
      setTimeLeft(data.timeLeft)
      setAnswerCount(0)
      setShowResults(false)
    })

    newSocket.on('timer-update', (data) => {
      setTimeLeft(data.timeLeft)
    })

    newSocket.on('answer-received', (data) => {
      setAnswerCount(data.answerCount)
    })

    newSocket.on('question-ended', (data) => {
      setResults(data.results)
      setLeaderboard(data.leaderboard)
      setShowResults(true)
      setCurrentQuestion(null)
    })

    newSocket.on('game-ended', (data) => {
      setLeaderboard(data.finalLeaderboard)
      setGameState(prev => ({ ...prev, isActive: false, currentGame: null }))
      setCurrentQuestion(null)
      setShowResults(true)
    })

    return () => {
      newSocket.close()
    }
  }, [])

  const startGame = (gameType) => {
    if (socket) {
      socket.emit('start-game', { gameType })
      setGameState(prev => ({ ...prev, currentGame: gameType, isActive: true }))
    }
  }

  const endQuestion = () => {
    if (socket) {
      socket.emit('end-question')
    }
  }

  const endGame = () => {
    if (socket) {
      socket.emit('end-game')
    }
  }

  const startNextQuestion = () => {
    setShowResults(false)
    // The server will automatically start the next question
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>🖥️ Admin Dashboard</h1>
        <div className="status">
          {gameState.isActive ? (
            <span className="status-active">🟢 Game Active</span>
          ) : (
            <span className="status-inactive">🔴 Game Inactive</span>
          )}
        </div>
      </header>

      <div className="dashboard-content">
        <div className="left-panel">
          {/* Game Controls */}
          <div className="card game-controls">
            <h2>🎮 Game Controls</h2>
            {!gameState.isActive ? (
              <div className="game-buttons">
                {Object.entries(games).map(([key, name]) => (
                  <button
                    key={key}
                    onClick={() => startGame(key)}
                    className="game-btn"
                    disabled={participants.length === 0}
                  >
                    Start {name}
                  </button>
                ))}
                {participants.length === 0 && (
                  <p className="warning">⚠️ No participants connected</p>
                )}
              </div>
            ) : (
              <div className="active-controls">
                <p>Current Game: <strong>{games[gameState.currentGame]}</strong></p>
                <div className="control-buttons">
                  {currentQuestion && (
                    <button onClick={endQuestion} className="end-question-btn">
                      End Current Question
                    </button>
                  )}
                  <button onClick={endGame} className="end-game-btn">
                    End Game
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Current Question */}
          {currentQuestion && (
            <div className="card current-question">
              <h2>📝 Current Question</h2>
              <div className="question-content">
                {gameState.currentGame === 'emojiMovie' ? (
                  <div className="emoji-question">
                    <div className="emojis">{currentQuestion.emojis}</div>
                    <div className="hint">💡 {currentQuestion.hint}</div>
                    <div className="correct-answer">
                      <strong>Answer: {currentQuestion.answer}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="scramble-question">
                    <div className="scrambled">{currentQuestion.scrambled}</div>
                    <div className="hint">Hint: {currentQuestion.hint}</div>
                    <div className="correct-answer">
                      <strong>Answer: {currentQuestion.answer}</strong>
                    </div>
                  </div>
                )}
                <div className="question-stats">
                  <div className="timer">⏱️ {timeLeft}s</div>
                  <div className="answers">
                    📝 {answerCount}/{participants.length} answered
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {showResults && results.length > 0 && (
            <div className="card results">
              <h2>📊 Question Results</h2>
              <div className="results-list">
                {results.map((result, index) => (
                  <div
                    key={result.participantId}
                    className={`result-item ${result.isCorrect ? 'correct' : 'incorrect'}`}
                  >
                    <span className="rank">#{index + 1}</span>
                    <span className="name">{result.participant?.name}</span>
                    <span className="answer">{result.answer}</span>
                    <span className="points">+{result.points}</span>
                  </div>
                ))}
              </div>
              {gameState.isActive && (
                <button onClick={startNextQuestion} className="next-question-btn">
                  Next Question ➡️
                </button>
              )}
            </div>
          )}
        </div>

        <div className="right-panel">
          {/* Participants */}
          <div className="card participants">
            <h2>👥 Participants ({participants.length})</h2>
            <div className="participants-list">
              {participants.length === 0 ? (
                <p className="no-participants">No participants connected</p>
              ) : (
                participants.map((participant) => (
                  <div key={participant.id} className="participant-item">
                    <span className="participant-name">{participant.name}</span>
                    <span className="participant-status">🟢</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Leaderboard */}
          {leaderboard.length > 0 && (
            <div className="card leaderboard">
              <h2>🏆 Leaderboard</h2>
              <div className="leaderboard-list">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.participant?.id}
                    className={`leaderboard-item rank-${index + 1}`}
                  >
                    <span className="rank">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </span>
                    <span className="name">{entry.participant?.name}</span>
                    <span className="score">{entry.score}</span>
                  </div>
                ))}
              </div>
              {!gameState.isActive && leaderboard.length > 0 && (
                <div className="last-place">
                  <p>🎭 Last place gets a dare/task:</p>
                  <p className="dare-participant">
                    <strong>{leaderboard[leaderboard.length - 1]?.participant?.name}</strong>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
