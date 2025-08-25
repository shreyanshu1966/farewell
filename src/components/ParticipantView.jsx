import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { io } from 'socket.io-client'
import './ParticipantView.css'

function ParticipantView() {
  const location = useLocation()
  const [socket, setSocket] = useState(null)
  const [name] = useState(location.state?.name || 'Anonymous')
  const [connected, setConnected] = useState(false)
  const [currentGame, setCurrentGame] = useState(null)
  const [isActive, setIsActive] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [gameEnded, setGameEnded] = useState(false)

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
    const newSocket = io(backendUrl)
    setSocket(newSocket)

    newSocket.emit('join-participant', { name })

    newSocket.on('participant-joined', (data) => {
      setConnected(true)
      setCurrentGame(data.currentGame)
      setIsActive(data.isActive)
      setCurrentQuestion(data.currentQuestion)
    })

    newSocket.on('game-started', (data) => {
      setCurrentGame(data.gameType)
      setIsActive(true)
      setGameEnded(false)
      setResults(null)
    })

    newSocket.on('new-question', (data) => {
      setCurrentQuestion(data.question)
      setTimeLeft(data.timeLeft)
      setAnswer('')
      setSubmitted(false)
      setResults(null)
    })

    newSocket.on('timer-update', (data) => {
      setTimeLeft(data.timeLeft)
    })

    newSocket.on('question-ended', (data) => {
      setResults(data)
      setLeaderboard(data.leaderboard)
      setCurrentQuestion(null)
      setSubmitted(false)
    })

    newSocket.on('game-ended', (data) => {
      setIsActive(false)
      setCurrentGame(null)
      setCurrentQuestion(null)
      setLeaderboard(data.finalLeaderboard)
      setGameEnded(true)
      setResults(null)
    })

    newSocket.on('connect', () => {
      console.log('Connected to server')
    })

    newSocket.on('disconnect', () => {
      setConnected(false)
      console.log('Disconnected from server')
    })

    return () => {
      newSocket.close()
    }
  }, [name])

  const submitAnswer = (e) => {
    e.preventDefault()
    if (socket && answer.trim() && !submitted) {
      socket.emit('submit-answer', { answer: answer.trim() })
      setSubmitted(true)
    }
  }

  if (!connected) {
    return (
      <div className="participant-view">
        <div className="container">
          <div className="connecting">
            <div className="spinner"></div>
            <h2>Connecting...</h2>
            <p>Please wait while we connect you to the game.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="participant-view">
      <div className="container">
        <header className="participant-header">
          <h1>👋 Welcome, {name}!</h1>
          <div className="status">
            {isActive ? (
              <span className="status-active">🎮 Game Active</span>
            ) : gameEnded ? (
              <span className="status-ended">🏁 Game Ended</span>
            ) : (
              <span className="status-waiting">⏳ Waiting for game...</span>
            )}
          </div>
        </header>

        <div className="main-content">
          {/* Waiting for Game */}
          {!isActive && !gameEnded && !currentQuestion && (
            <div className="waiting-screen">
              <div className="waiting-content">
                <div className="waiting-icon">🎮</div>
                <h2>Waiting for Admin to Start Game</h2>
                <p>Get ready for some fun mini games!</p>
                <div className="pulse-dot"></div>
              </div>
            </div>
          )}

          {/* Current Question */}
          {currentQuestion && isActive && (
            <div className="question-screen">
              <div className="question-header">
                <div className="timer">⏱️ {timeLeft}s</div>
                <div className="game-type">
                  {currentGame === 'emojiMovie' ? '🎬 Movie Guess' : '🔤 Word Scramble'}
                </div>
              </div>

              <div className="question-content">
                {currentGame === 'emojiMovie' ? (
                  <div className="emoji-question">
                    <h2>Guess the Movie!</h2>
                    <div className="emojis">{currentQuestion.emojis}</div>
                    <div className="hint">💡 {currentQuestion.hint}</div>
                    <form onSubmit={submitAnswer} className="answer-form">
                      <input
                        type="text"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Enter movie name..."
                        className="answer-input"
                        disabled={submitted}
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="submit-btn"
                        disabled={submitted || !answer.trim()}
                      >
                        {submitted ? '✅ Submitted' : '📤 Submit'}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="scramble-question">
                    <h2>Unscramble the Word!</h2>
                    <div className="scrambled">{currentQuestion.scrambled}</div>
                    <div className="hint">💡 {currentQuestion.hint}</div>
                    <form onSubmit={submitAnswer} className="answer-form">
                      <input
                        type="text"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Your answer..."
                        className="answer-input"
                        disabled={submitted}
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="submit-btn"
                        disabled={submitted || !answer.trim()}
                      >
                        {submitted ? '✅ Submitted' : '📤 Submit'}
                      </button>
                    </form>
                  </div>
                )}

                {submitted && (
                  <div className="submitted-message">
                    <div className="success-icon">✅</div>
                    <p>Answer submitted! Waiting for results...</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="results-screen">
              <h2>📊 Round Results</h2>
              <div className="correct-answer">
                <span>Correct Answer: </span>
                <strong>{results.correctAnswer}</strong>
              </div>
              
              <div className="personal-result">
                {results.results.find(r => r.participant?.name === name) ? (
                  <div className="result-card">
                    {results.results.find(r => r.participant?.name === name)?.isCorrect ? (
                      <div className="correct">
                        <span className="icon">🎉</span>
                        <span>Correct! +{results.results.find(r => r.participant?.name === name)?.points} points</span>
                      </div>
                    ) : (
                      <div className="incorrect">
                        <span className="icon">❌</span>
                        <span>Incorrect this time</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="no-answer">
                    <span className="icon">⏰</span>
                    <span>Time's up! No answer submitted</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Game Ended */}
          {gameEnded && (
            <div className="game-end-screen">
              <h2>🏁 Game Over!</h2>
              <div className="final-message">
                <p>Thanks for playing! Here's how everyone did:</p>
              </div>
            </div>
          )}

          {/* Leaderboard */}
          {leaderboard.length > 0 && (
            <div className="leaderboard-section">
              <h3>🏆 Leaderboard</h3>
              <div className="leaderboard">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.participant?.id}
                    className={`leaderboard-item ${entry.participant?.name === name ? 'current-user' : ''} rank-${index + 1}`}
                  >
                    <span className="rank">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </span>
                    <span className="name">{entry.participant?.name}</span>
                    <span className="score">{entry.score}</span>
                  </div>
                ))}
              </div>
              
              {gameEnded && leaderboard.length > 0 && (
                <div className="dare-section">
                  {leaderboard[leaderboard.length - 1]?.participant?.name === name ? (
                    <div className="dare-message">
                      <span className="icon">🎭</span>
                      <p>You're in last place! Get ready for a dare or task! 😄</p>
                    </div>
                  ) : (
                    <div className="dare-info">
                      <p>🎭 <strong>{leaderboard[leaderboard.length - 1]?.participant?.name}</strong> gets a dare/task!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ParticipantView
