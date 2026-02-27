import { useState, useEffect } from 'react'
import './App.css'
import { client } from './rpc'
import type { Entry } from '@shared/contract'
import { authClient } from './lib/auth-client'

function App() {
  const { data: session, isPending } = authClient.useSession()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState('')

  const [entries, setEntries] = useState<Entry[]>([])
  const [currentEntry, setCurrentEntry] = useState('')
  const [currentTitle, setCurrentTitle] = useState('')

  // Load entries from backend when session is available
  useEffect(() => {
    if (!session?.user) {
      setEntries([])
      return
    }

    const fetchEntries = async () => {
      try {
        const data = await client.getEntries({})
        setEntries(data)
      } catch (err) {
        console.error("Error fetching entries:", err)
      }
    }
    fetchEntries()
  }, [session?.user])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (isRegistering) {
        const { error } = await authClient.signUp.email({
          email,
          password,
          name,
        })
        if (error) throw error
      } else {
        const { error } = await authClient.signIn.email({
          email,
          password,
        })
        if (error) throw error
      }

      setEmail('')
      setPassword('')
      setName('')
    } catch (err: any) {
      setError(err.message || 'Auth failed')
    }
  }

  const logout = async () => {
    await authClient.signOut()
  }

  const addEntry = async () => {
    if (currentEntry.trim() && currentTitle.trim() && session?.user) {
      try {
        const savedEntry = await client.addEntry({
          title: currentTitle,
          content: currentEntry,
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
    if (!session?.user) return
    try {
      const result = await client.deleteEntry({ id })
      if (result.success) {
        setEntries(prev => prev.filter(entry => entry.id !== id))
      }
    } catch (err) {
      console.error("Error deleting entry:", err)
    }
  }

  if (isPending) {
    return <div className="app loading">Loading session...</div>
  }

  if (!session?.user) {
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
            {isRegistering && (
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="title-input"
                required
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <span>Welcome, {session.user.name}</span>
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