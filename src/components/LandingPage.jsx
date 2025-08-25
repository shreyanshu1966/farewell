import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function LandingPage() {
  const [participantName, setParticipantName] = useState('')
  const navigate = useNavigate()

  const handleParticipantJoin = (e) => {
    e.preventDefault()
    if (participantName.trim()) {
      navigate('/participant', { state: { name: participantName.trim() } })
    }
  }

  const handleAdminAccess = () => {
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'
    const password = prompt('Enter admin password:')
    if (password === adminPassword) {
      navigate('/admin')
    } else {
      alert('Invalid password!')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 flex items-center justify-center p-5">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <header className="bg-gradient-to-r from-pink-500 to-yellow-500 py-10 px-8 text-center text-white">
          <h1 className="text-4xl font-bold mb-3">🎉 Farewell Mini Games 🎉</h1>
          <p className="text-lg opacity-90">Join the fun with emoji movie guessing and word scramble games!</p>
        </header>

        <div className="p-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">📱 Join as Participant</h2>
            <form onSubmit={handleParticipantJoin} className="space-y-4">
              <input
                type="text"
                placeholder="Enter your name"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                maxLength={20}
                required
              />
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl text-lg font-semibold hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Join Game 🎮
              </button>
            </form>
          </div>

          <div className="flex items-center justify-center my-8">
            <div className="border-t border-gray-300 flex-grow"></div>
            <span className="px-4 text-gray-500 font-medium">OR</span>
            <div className="border-t border-gray-300 flex-grow"></div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">🖥️ Admin Dashboard</h2>
            <p className="text-gray-600 mb-6">Control games and view leaderboards</p>
            <button 
              onClick={handleAdminAccess} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Admin Access 🔐
            </button>
          </div>
        </div>

        <footer className="bg-gray-50 p-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">🎯 Available Games:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-center space-x-3 bg-white p-4 rounded-xl shadow-sm">
                <span className="text-2xl">🎬</span>
                <span className="text-gray-700 font-medium">Emoji Movie Guess</span>
              </div>
              <div className="flex items-center justify-center space-x-3 bg-white p-4 rounded-xl shadow-sm">
                <span className="text-2xl">🔤</span>
                <span className="text-gray-700 font-medium">Word Scramble</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default LandingPage
