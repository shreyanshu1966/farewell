import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

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
    <div className="landing-page">
      <div className="container">
        <header className="header">
          <h1>🎉 Farewell Mini Games 🎉</h1>
          <p>Join the fun with emoji movie guessing and word scramble games!</p>
        </header>

        <div className="main-content">
          <div className="participant-section">
            <h2>📱 Join as Participant</h2>
            <form onSubmit={handleParticipantJoin} className="participant-form">
              <input
                type="text"
                placeholder="Enter your name"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                className="name-input"
                maxLength={20}
                required
              />
              <button type="submit" className="join-btn">
                Join Game 🎮
              </button>
            </form>
          </div>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="admin-section">
            <h2>🖥️ Admin Dashboard</h2>
            <p>Control games and view leaderboards</p>
            <button onClick={handleAdminAccess} className="admin-btn">
              Admin Access 🔐
            </button>
          </div>
        </div>

        <footer className="footer">
          <div className="game-info">
            <h3>🎯 Available Games:</h3>
            <div className="games-list">
              <div className="game-item">
                <span>🎬</span>
                <span>Emoji Movie Guess</span>
              </div>
              <div className="game-item">
                <span>🔤</span>
                <span>Word Scramble</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default LandingPage
