import { useState, useEffect } from 'react'
import './App.css'
import { client } from './rpc'
import type { Entry } from '@shared/contract'

function App() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [currentEntry, setCurrentEntry] = useState('')
  const [currentTitle, setCurrentTitle] = useState('')

  // Load entries from backend on component mount
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const data = await client.getEntries()
        // oRPC returns the data directly
        setEntries(data)
      } catch (err) {
        console.error("Error fetching entries:", err)
      }
    }
    fetchEntries()
  }, [])

  const addEntry = async () => {
    if (currentEntry.trim() && currentTitle.trim()) {
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
    try {
      const result = await client.deleteEntry({ id })
      if (result.success) {
        setEntries(prev => prev.filter(entry => entry.id !== id))
      }
    } catch (err) {
      console.error("Error deleting entry:", err)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>📖 My Journal</h1>
        <p>Capture your thoughts and memories (oRPC Powered)</p>
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