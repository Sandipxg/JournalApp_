import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [entries, setEntries] = useState([])
  const [currentEntry, setCurrentEntry] = useState('')
  const [currentTitle, setCurrentTitle] = useState('')

  // Load entries from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('journalEntries')
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries))
    }
  }, [])

  // Save entries to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem('journalEntries', JSON.stringify(entries))
  }, [entries])

  const addEntry = () => {
    if (currentEntry.trim() && currentTitle.trim()) {
      const newEntry = {
        id: Date.now(),
        title: currentTitle,
        content: currentEntry,

      }
      setEntries([newEntry, ...entries])
      setCurrentEntry('')
      setCurrentTitle('')
    }
  }

  const deleteEntry = (id) => {
    setEntries(entries.filter(entry => entry.id !== id))
  }

  return (
    <div className="app">
      <header className="header">
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
            rows="6"
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