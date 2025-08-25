import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'

function AdminDashboard() {
  const [socket, setSocket] = useState(null)
  const [gameState, setGameState] = useState({
    currentGame: null,
    isActive: false,
    round: 0,
    totalRounds: 3,
    completedRounds: 0,
    teamsFormed: false
  })
  const [participants, setParticipants] = useState([])
  const [teams, setTeams] = useState([])
  const [teamScores, setTeamScores] = useState({})
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [answerCount, setAnswerCount] = useState(0)
  const [results, setResults] = useState([])
  const [teamLeaderboard, setTeamLeaderboard] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [gameSequence, setGameSequence] = useState([])
  const [roundsInput, setRoundsInput] = useState(3)
  const [showSettings, setShowSettings] = useState(false)

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
      if (state.participants) {
        setParticipants(state.participants)
      }
      if (state.teams) {
        setTeams(state.teams)
      }
      if (state.teamScores) {
        setTeamScores(state.teamScores)
      }
    })

    newSocket.on('participant-update', (data) => {
      setParticipants(data.participants)
      if (data.teams) {
        setTeams(data.teams)
      }
      if (data.teamScores) {
        setTeamScores(data.teamScores)
      }
    })

    newSocket.on('teams-formed', (data) => {
      setTeams(data.teams)
      setGameState(prev => ({ ...prev, teamsFormed: data.teamsFormed }))
    })

    newSocket.on('game-started', (data) => {
      setGameSequence(data.gameSequence || [])
      setGameState(prev => ({ ...prev, isActive: true }))
    })

    newSocket.on('round-started', (data) => {
      setGameState(prev => ({ 
        ...prev, 
        currentGame: data.gameType,
        completedRounds: data.roundNumber - 1
      }))
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
      setTeamLeaderboard(data.teamLeaderboard)
      setShowResults(true)
      setCurrentQuestion(null)
    })

    newSocket.on('game-ended', (data) => {
      setTeamLeaderboard(data.finalTeamLeaderboard)
      setGameState(prev => ({ ...prev, isActive: false, currentGame: null }))
      setCurrentQuestion(null)
      setShowResults(true)
    })

    newSocket.on('rounds-updated', (data) => {
      setGameState(prev => ({ ...prev, totalRounds: data.totalRounds }))
      setRoundsInput(data.totalRounds)
    })

    newSocket.on('game-reset', () => {
      // Reset all state when game is reset
      setGameState({
        currentGame: null,
        isActive: false,
        round: 0,
        totalRounds: 3,
        completedRounds: 0,
        teamsFormed: false
      })
      setParticipants([])
      setTeams([])
      setTeamScores({})
      setCurrentQuestion(null)
      setTimeLeft(0)
      setAnswerCount(0)
      setResults([])
      setTeamLeaderboard([])
      setShowResults(false)
      setGameSequence([])
      setRoundsInput(3)
    })

    return () => {
      newSocket.close()
    }
  }, [])

  const formTeams = () => {
    if (socket) {
      socket.emit('form-teams')
    }
  }

  const startGame = () => {
    if (socket) {
      socket.emit('start-game')
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
    if (socket) {
      socket.emit('start-next-question')
    }
    setShowResults(false)
  }

  const setRounds = () => {
    if (socket && roundsInput >= 1 && roundsInput <= 10) {
      socket.emit('set-rounds', { rounds: roundsInput })
    }
  }

  const resetGame = () => {
    if (socket && confirm('Are you sure you want to completely reset the game? All participants will need to rejoin.')) {
      socket.emit('reset-game')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-900 to-purple-900 p-5">
      <header className="flex justify-between items-center bg-white p-6 rounded-2xl mb-5 shadow-xl">
        <h1 className="text-3xl font-bold text-gray-800">🖥️ Admin Dashboard</h1>
        <div className="font-bold text-lg">
          {gameState.isActive ? (
            <span className="text-green-600">🟢 Game Active</span>
          ) : (
            <span className="text-red-600">🔴 Game Inactive</span>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-7xl mx-auto">
        <div className="space-y-5">
          {/* Game Settings */}
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">⚙️ Game Settings</h2>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {showSettings ? '▲ Hide' : '▼ Show'}
              </button>
            </div>
            
            {showSettings && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="text-gray-700 font-medium">Number of Rounds:</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={roundsInput}
                    onChange={(e) => setRoundsInput(parseInt(e.target.value))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    disabled={gameState.isActive}
                  />
                  <button
                    onClick={setRounds}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={gameState.isActive || roundsInput < 1 || roundsInput > 10}
                  >
                    Set Rounds
                  </button>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Current: <span className="font-bold text-blue-600">{gameState.totalRounds} rounds</span>
                  </p>
                </div>
                
                <div className="border-t pt-4">
                  <button
                    onClick={resetGame}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md"
                    disabled={gameState.isActive}
                  >
                    🔄 Complete Game Reset
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    This will clear all data and require participants to rejoin
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Game Controls */}
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🎮 Game Controls</h2>
            {!gameState.isActive ? (
              <div className="space-y-4">
                {!gameState.teamsFormed ? (
                  <>
                    <button
                      onClick={formTeams}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={participants.length < 3}
                    >
                      Form Teams (3 players each)
                    </button>
                    {participants.length < 3 && (
                      <p className="text-amber-600 font-medium text-center">⚠️ Need at least 3 participants to form teams</p>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={startGame}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md"
                    >
                      Start 3-Round Tournament
                    </button>
                    <p className="text-green-600 font-medium text-center text-sm">✅ Teams formed! Ready to start</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    <strong className="text-blue-600">Round {gameState.completedRounds + 1} of {gameState.totalRounds}</strong>
                  </p>
                  <p className="text-gray-700">Current Game: <strong className="text-blue-600">{games[gameState.currentGame]}</strong></p>
                  {gameSequence.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Game Sequence:</p>
                      <div className="flex space-x-2 mt-1">
                        {gameSequence.map((game, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              index === gameState.completedRounds
                                ? 'bg-blue-500 text-white'
                                : index < gameState.completedRounds
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {games[game]?.split(' ')[0]} R{index + 1}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {currentQuestion && (
                    <button 
                      onClick={endQuestion} 
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-md"
                    >
                      End Current Question
                    </button>
                  )}
                  <button 
                    onClick={endGame} 
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md"
                  >
                    End Tournament
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Current Question */}
          {currentQuestion && (
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📝 Current Question</h2>
              <div className="space-y-4">
                {gameState.currentGame === 'emojiMovie' ? (
                  <div className="text-center space-y-3">
                    <div className="text-4xl">{currentQuestion.emojis}</div>
                    <div className="text-lg text-blue-600">💡 {currentQuestion.hint}</div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <strong className="text-green-800">Answer: {currentQuestion.answer}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="text-3xl font-bold text-purple-600">{currentQuestion.scrambled}</div>
                    <div className="text-lg text-blue-600">Hint: {currentQuestion.hint}</div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <strong className="text-green-800">Answer: {currentQuestion.answer}</strong>
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                  <div className="text-lg font-semibold text-red-600">⏱️ {timeLeft}s</div>
                  <div className="text-lg font-semibold text-blue-600">
                    📝 {answerCount}/{participants.length} answered
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {showResults && results.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Question Results</h2>
              <div className="space-y-2 mb-4">
                {results.map((result, index) => (
                  <div
                    key={result.participantId}
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      result.isCorrect ? 'bg-green-100 border-l-4 border-green-500' : 'bg-red-100 border-l-4 border-red-500'
                    }`}
                  >
                    <span className="font-bold text-gray-700">#{index + 1}</span>
                    <span className="font-medium text-gray-800">{result.participant?.name}</span>
                    <span className="text-gray-600">{result.answer}</span>
                    <span className="text-xs text-gray-500">{result.teamId}</span>
                    <span className={`font-bold ${result.isCorrect ? 'text-green-600' : 'text-gray-400'}`}>
                      {result.isCorrect ? '✅' : '❌'}
                    </span>
                  </div>
                ))}
              </div>
              {gameState.isActive && (
                <button 
                  onClick={startNextQuestion} 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md"
                >
                  Next Question ➡️
                </button>
              )}
            </div>
          )}
        </div>

        <div className="space-y-5">
          {/* Teams */}
          {teams.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">👥 Teams ({teams.length})</h2>
              <div className="space-y-4">
                {teams.map((team, index) => (
                  <div key={team.id} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">{team.name}</h3>
                    <div className="space-y-1">
                      {team.members.map((member) => (
                        <div key={member.id} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">{member.name}</span>
                          <span className="text-green-500">🟢</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Participants (if no teams formed) */}
          {teams.length === 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">👥 Participants ({participants.length})</h2>
              <div className="space-y-2">
                {participants.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No participants connected</p>
                ) : (
                  participants.map((participant) => (
                    <div key={participant.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-800">{participant.name}</span>
                      <span className="text-green-500">🟢</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Team Leaderboard */}
          {teamLeaderboard.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🏆 Team Leaderboard</h2>
              <div className="space-y-2">
                {teamLeaderboard.map((entry, index) => (
                  <div
                    key={entry.team?.id}
                    className={`flex justify-between items-center p-4 rounded-lg ${
                      index === 0 ? 'bg-yellow-100 border-l-4 border-yellow-500' : 
                      index === 1 ? 'bg-gray-100 border-l-4 border-gray-400' :
                      index === 2 ? 'bg-orange-100 border-l-4 border-orange-500' :
                      'bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </span>
                      <div>
                        <div className="font-bold text-gray-800">{entry.team?.name}</div>
                        <div className="text-xs text-gray-600">
                          {entry.team?.members.map(m => m.name).join(', ')}
                        </div>
                      </div>
                    </div>
                    <span className="font-bold text-blue-600 text-lg">{entry.score}</span>
                  </div>
                ))}
              </div>
              {!gameState.isActive && teamLeaderboard.length > 0 && (
                <div className="mt-6 p-4 bg-purple-100 rounded-lg border-l-4 border-purple-500">
                  <p className="text-purple-800 font-semibold">🎭 Losing team gets a dare/task:</p>
                  <p className="text-purple-900 text-lg font-bold">
                    {teamLeaderboard[teamLeaderboard.length - 1]?.team?.name}
                  </p>
                  <p className="text-sm text-purple-700">
                    Members: {teamLeaderboard[teamLeaderboard.length - 1]?.team?.members.map(m => m.name).join(', ')}
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
