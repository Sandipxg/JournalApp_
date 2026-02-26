import { useState, useEffect } from 'react'
import './App.css'
import { client } from './rpc'
import type { Entry } from '@shared/contract'

function App() {
  const [userId, setUserId] = useState<number | null>(() => {
    const saved = localStorage.getItem('userId')
    return saved ? parseInt(saved) : null
  })
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState('')

  const [entries, setEntries] = useState<Entry[]>([])
  const [currentEntry, setCurrentEntry] = useState('')
  const [currentTitle, setCurrentTitle] = useState('')

  // Load entries from backend on component mount or when userId changes
  useEffect(() => {
    if (!userId) {
      setEntries([])
      return
    }

    const fetchEntries = async () => {
      try {
        const data = await client.getEntries({ userId })
        setEntries(data)
      } catch (err) {
        console.error("Error fetching entries:", err)
      }
    }
    fetchEntries()
  }, [userId])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const result = isRegistering
        ? await client.register({ username, password })
        : await client.login({ username, password })

      setUserId(result.id)
      localStorage.setItem('userId', result.id.toString())
      setUsername('')
      setPassword('')
    } catch (err: any) {
      setError(err.message || 'Auth failed')
    }
  }

  const logout = () => {
    setUserId(null)
    localStorage.removeItem('userId')
  }

  const addEntry = async () => {
    if (currentEntry.trim() && currentTitle.trim() && userId) {
      try {
        const savedEntry = await client.addEntry({
          title: currentTitle,
          content: currentEntry,
          userId,
        })

        if (savedEntry && savedEntry.id) {
          setEntries(prev => [savedEntry, ...prev])
          setCurrentEntry('')
          setCurrentTitle('')
        }
      } catch (err) {
        console.error("Error saving entry:", err)
      }
    }
  }

  const deleteEntry = async (id: number) => {
    if (!userId) return
    try {
      const result = await client.deleteEntry({ id, userId })
      if (result.success) {
        setEntries(prev => prev.filter(entry => entry.id !== id))
      }
    } catch (err) {
      console.error("Error deleting entry:", err)
    }
  }

  if (!userId) {
    return (
      <div className="app">
        <header className="header">
          <h1>📖 My Journal</h1>
          <p>Login to capture your thoughts</p>
        </header>

        <div className="container auth-container">
          <form className="entry-form auth-form" onSubmit={handleAuth}>
            <h2>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
            {error && <p className="error-message">{error}</p>}
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="title-input"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="title-input"
              required
            />
            <button type="submit" className="add-button">
              {isRegistering ? 'Sign Up' : 'Log In'}
            </button>
            <p className="auth-toggle">
              {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="link-button"
              >
                {isRegistering ? 'Log In' : 'Sign Up'}
              </button>
            </p>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="user-info">
          <button onClick={logout} className="logout-button">Logout</button>
        </div>
        <h1>📖 My Journal</h1>
        <p>Capture your thoughts and memories</p>
      </header>

      <div className="container">
        <div className="entry-form">
          <input
            type="text"
            placeholder="Entry title..."
            value={currentTitle}
            onChange={(e) => setCurrentTitle(e.target.value)}
            className="title-input"
          />
          <textarea
            placeholder="What's on your mind today?"
            value={currentEntry}
            onChange={(e) => setCurrentEntry(e.target.value)}
            className="entry-textarea"
            rows={6}
          />
          <button onClick={addEntry} className="add-button">
            Add Entry
          </button>
        </div>

        <div className="entries-list">
          <h2>Your Entries ({entries.length})</h2>
          {entries.length === 0 ? (
            <div className="empty-state">
              <p>No entries yet. Start writing your first journal entry!</p>
            </div>
          ) : (
            entries.map(entry => (
              <div key={entry.id} className="entry-card">
                <div className="entry-header">
                  <h3>{entry.title}</h3>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="delete-button"
                  >
                    ×
                  </button>
                </div>
                <div className="entry-content">
                  {entry.content}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default App