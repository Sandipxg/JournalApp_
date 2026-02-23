import { useState, useEffect } from 'react'
import './App.css'

interface Entry {
  id: number;
  title: string;
  content: string;
}

function App() {
  // ensured compiler that entries is not empty 
  const [entries, setEntries] = useState<Entry[]>([])
  const [currentEntry, setCurrentEntry] = useState('')
  const [currentTitle, setCurrentTitle] = useState('')

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  // Load entries from backend on component for exactly once at starting
  // useEffect runs code block after a particular given interval
  useEffect(() => {
    fetch(`${API_URL}/api/entries`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEntries(data);
        }
      })
      .catch(err => console.error("Error fetching entries:", err));
  }, [])

  const addEntry = () => {
    if (currentEntry.trim() && currentTitle.trim()) {
      const newEntryData = {
        title: currentTitle,
        content: currentEntry,
      }

      fetch(`${API_URL}/api/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntryData)
      })
        .then(res => res.json())
        .then(savedEntry => {
          if (savedEntry.id) {
            setEntries([savedEntry, ...entries])
            setCurrentEntry('')
            setCurrentTitle('')
          }
        })
        .catch(err => console.error("Error saving entry:", err));
    }
  }

  // since we defined id as number in interface . 
  const deleteEntry = (id: number) => {
    fetch(`${API_URL}/api/entries/${id}`, {
      method: "DELETE"
    })
      .then(res => res.json())
      .then(() => {
        setEntries(entries.filter(entry => entry.id !== id))
      })
      .catch(err => console.error("Error deleting entry:", err));
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
            rows={6} // must be number cant accept "6"
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
            entries.map(entry => ( //iterate through whole array and throw html chunk for every item in it 
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