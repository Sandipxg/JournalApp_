import './App.css'

function App() {
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
            className="title-input"
          />
          <textarea
            placeholder="What's on your mind today?"
            className="entry-textarea"
            rows="6"
          />
          <button className="add-button">
            Add Entry
          </button>
        </div>


      </div>
    </div>
  )
}

export default App