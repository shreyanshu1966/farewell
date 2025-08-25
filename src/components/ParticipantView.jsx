import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { io } from 'socket.io-client'

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
  const [teamLeaderboard, setTeamLeaderboard] = useState([])
  const [gameEnded, setGameEnded] = useState(false)
  const [teamsFormed, setTeamsFormed] = useState(false)
  const [myTeam, setMyTeam] = useState(null)
  const [currentRound, setCurrentRound] = useState(0)
  const [totalRounds, setTotalRounds] = useState(3)
  const [gameSequence, setGameSequence] = useState([])
  const [gameReset, setGameReset] = useState(false)

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
      setTeamsFormed(data.teamsFormed)
      if (data.teams) {
        // Find my team
        const userTeam = data.teams.find(team => 
          team.members.some(member => member.name === name)
        )
        setMyTeam(userTeam)
      }
    })

    newSocket.on('teams-formed', (data) => {
      setTeamsFormed(true)
      // Find my team
      const userTeam = data.teams.find(team => 
        team.members.some(member => member.name === name)
      )
      setMyTeam(userTeam)
    })

    newSocket.on('game-started', (data) => {
      setIsActive(true)
      setGameEnded(false)
      setResults(null)
      setGameSequence(data.gameSequence || [])
      setTotalRounds(data.totalRounds || 3)
    })

    newSocket.on('round-started', (data) => {
      setCurrentGame(data.gameType)
      setCurrentRound(data.roundNumber)
    })

    newSocket.on('new-question', (data) => {
      setCurrentQuestion(data.question)
      setTimeLeft(data.timeLeft)
      setAnswer('')
      setSubmitted(false)
      setResults(null)
      if (data.currentRound) {
        setCurrentRound(data.currentRound)
      }
    })

    newSocket.on('timer-update', (data) => {
      setTimeLeft(data.timeLeft)
    })

    newSocket.on('question-ended', (data) => {
      setResults(data)
      setTeamLeaderboard(data.teamLeaderboard)
      setCurrentQuestion(null)
      setSubmitted(false)
      if (data.currentRound) {
        setCurrentRound(data.currentRound)
      }
    })

    newSocket.on('game-ended', (data) => {
      setIsActive(false)
      setCurrentGame(null)
      setCurrentQuestion(null)
      setTeamLeaderboard(data.finalTeamLeaderboard)
      setGameEnded(true)
      setResults(null)
    })

    newSocket.on('game-reset', () => {
      // Show reset message and redirect to landing page
      setGameReset(true)
      setConnected(false)
      setTimeout(() => {
        window.location.href = '/'
      }, 3000)
    })

    newSocket.on('rounds-updated', (data) => {
      setTotalRounds(data.totalRounds)
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

  if (!connected || gameReset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 p-3">
        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl min-h-[calc(100vh-1.5rem)] overflow-hidden">
          <div className="text-center py-20 px-5">
            {gameReset ? (
              <>
                <div className="text-6xl mb-5">🔄</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Game Reset</h2>
                <p className="text-gray-600 mb-4">The admin has reset the game.</p>
                <p className="text-gray-600">Redirecting to home page...</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 border-4 border-gray-300 border-t-4 border-t-indigo-500 rounded-full animate-spin mx-auto mb-5"></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Connecting...</h2>
                <p className="text-gray-600">Please wait while we connect you to the game.</p>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 p-3">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl min-h-[calc(100vh-1.5rem)] overflow-hidden">
        <header className="bg-gradient-to-r from-pink-500 to-yellow-500 py-6 px-5 text-center text-white">
          <h1 className="text-2xl font-bold mb-3">👋 Welcome, {name}!</h1>
          {myTeam && (
            <div className="bg-white bg-opacity-20 rounded-lg p-2 mb-3">
              <p className="text-sm font-medium">{myTeam.name}</p>
              <p className="text-xs opacity-90">{myTeam.members.map(m => m.name).join(', ')}</p>
            </div>
          )}
          <div className="font-bold">
            {isActive ? (
              <span className="text-green-200">🎮 Round {currentRound} of {totalRounds}</span>
            ) : gameEnded ? (
              <span className="text-blue-200">🏁 Tournament Ended</span>
            ) : teamsFormed ? (
              <span className="text-yellow-200">⏳ Waiting for tournament start...</span>
            ) : (
              <span className="text-yellow-200">⏳ Waiting for teams...</span>
            )}
          </div>
        </header>

        <div className="p-8">
          {/* Waiting for Game */}
          {!isActive && !gameEnded && !currentQuestion && (
            <div className="text-center py-12">
              <div className="animate-pulse">
                <div className="text-6xl mb-5">🎮</div>
                {!teamsFormed ? (
                  <>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Waiting for Team Formation</h2>
                    <p className="text-gray-600 mb-8">Admin will form teams of 3 players each!</p>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Waiting for Tournament Start</h2>
                    <p className="text-gray-600 mb-8">Get ready for 3 rounds of fun mini games!</p>
                    {myTeam && (
                      <div className="bg-blue-50 p-4 rounded-xl mb-4">
                        <h3 className="font-bold text-blue-800">Your Team: {myTeam.name}</h3>
                        <p className="text-blue-600 text-sm">{myTeam.members.map(m => m.name).join(', ')}</p>
                      </div>
                    )}
                  </>
                )}
                <div className="w-3 h-3 bg-indigo-500 rounded-full mx-auto animate-ping"></div>
              </div>
            </div>
          )}

          {/* Current Question */}
          {currentQuestion && isActive && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                <div className="text-lg font-bold text-red-600">⏱️ {timeLeft}s</div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {currentGame === 'emojiMovie' ? '🎬 Movie Guess' : '🔤 Word Scramble'}
                  </div>
                  <div className="text-xs text-gray-500">Round {currentRound} of {totalRounds}</div>
                </div>
              </div>

              <div className="space-y-6">
                {currentGame === 'emojiMovie' ? (
                  <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold text-gray-800">Guess the Movie!</h2>
                    <div className="text-5xl py-4">{currentQuestion.emojis}</div>
                    <div className="text-lg text-blue-600">💡 {currentQuestion.hint}</div>
                    <form onSubmit={submitAnswer} className="space-y-4">
                      <input
                        type="text"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Enter movie name..."
                        className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none disabled:bg-gray-100"
                        disabled={submitted}
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl text-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={submitted || !answer.trim()}
                      >
                        {submitted ? '✅ Submitted' : '📤 Submit'}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold text-gray-800">Unscramble the Word!</h2>
                    <div className="text-4xl font-bold text-purple-600 py-4">{currentQuestion.scrambled}</div>
                    <div className="text-lg text-blue-600">💡 {currentQuestion.hint}</div>
                    <form onSubmit={submitAnswer} className="space-y-4">
                      <input
                        type="text"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Your answer..."
                        className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none disabled:bg-gray-100"
                        disabled={submitted}
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl text-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={submitted || !answer.trim()}
                      >
                        {submitted ? '✅ Submitted' : '📤 Submit'}
                      </button>
                    </form>
                  </div>
                )}

                {submitted && (
                  <div className="text-center bg-green-50 p-6 rounded-xl border-l-4 border-green-500">
                    <div className="text-3xl mb-2">✅</div>
                    <p className="text-green-800 font-medium">Answer submitted! Waiting for results...</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 text-center">📊 Round Results</h2>
              <div className="bg-blue-50 p-4 rounded-xl text-center">
                <span className="text-gray-700">Correct Answer: </span>
                <strong className="text-blue-600 text-lg">{results.correctAnswer}</strong>
              </div>
              
              <div>
                {results.results.find(r => r.participant?.name === name) ? (
                  <div className="text-center">
                    {results.results.find(r => r.participant?.name === name)?.isCorrect ? (
                      <div className="bg-green-100 p-6 rounded-xl border-l-4 border-green-500">
                        <span className="text-3xl">🎉</span>
                        <p className="text-green-800 font-bold text-lg">
                          Correct! +{results.results.find(r => r.participant?.name === name)?.points} points
                        </p>
                      </div>
                    ) : (
                      <div className="bg-red-100 p-6 rounded-xl border-l-4 border-red-500">
                        <span className="text-3xl">❌</span>
                        <p className="text-red-800 font-bold text-lg">Incorrect this time</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-yellow-100 p-6 rounded-xl border-l-4 border-yellow-500 text-center">
                    <span className="text-3xl">⏰</span>
                    <p className="text-yellow-800 font-bold text-lg">Time's up! No answer submitted</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Game Ended */}
          {gameEnded && (
            <div className="text-center py-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">🏁 Tournament Over!</h2>
              <div className="bg-purple-50 p-6 rounded-xl">
                <p className="text-purple-800 text-lg">Thanks for playing! Here's how the teams did:</p>
              </div>
            </div>
          )}

          {/* Team Leaderboard */}
          {teamLeaderboard.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 text-center">🏆 Team Leaderboard</h3>
              <div className="space-y-2">
                {teamLeaderboard.map((entry, index) => (
                  <div
                    key={entry.team?.id}
                    className={`p-4 rounded-lg ${
                      entry.team?.id === myTeam?.id
                        ? 'bg-blue-100 border-2 border-blue-500' 
                        : index === 0 ? 'bg-yellow-100 border-l-4 border-yellow-500' : 
                          index === 1 ? 'bg-gray-100 border-l-4 border-gray-400' :
                          index === 2 ? 'bg-orange-100 border-l-4 border-orange-500' :
                          'bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </span>
                        <div>
                          <div className={`font-bold ${entry.team?.id === myTeam?.id ? 'text-blue-800' : 'text-gray-800'}`}>
                            {entry.team?.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {entry.team?.members.map(m => m.name).join(', ')}
                          </div>
                        </div>
                      </div>
                      <span className="font-bold text-blue-600 text-lg">{entry.score}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {gameEnded && teamLeaderboard.length > 0 && (
                <div className="mt-6">
                  {teamLeaderboard[teamLeaderboard.length - 1]?.team?.id === myTeam?.id ? (
                    <div className="bg-purple-100 p-4 rounded-xl border-l-4 border-purple-500 text-center">
                      <span className="text-2xl">🎭</span>
                      <p className="text-purple-800 font-bold">Your team is in last place! Get ready for a dare or task! 😄</p>
                    </div>
                  ) : (
                    <div className="bg-gray-100 p-4 rounded-xl text-center">
                      <p className="text-gray-700">
                        🎭 <strong className="text-purple-600">{teamLeaderboard[teamLeaderboard.length - 1]?.team?.name}</strong> gets a dare/task!
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {teamLeaderboard[teamLeaderboard.length - 1]?.team?.members.map(m => m.name).join(', ')}
                      </p>
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
