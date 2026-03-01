import { useState, useEffect } from 'react'
import './App.css'
import { client } from './rpc'
import type { Entry } from '@shared/contract'
import { authClient } from './lib/auth-client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const authSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type AuthFormValues = z.infer<typeof authSchema>

const entrySchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
})

type EntryFormValues = z.infer<typeof entrySchema>

function App() {
  const { data: session, isPending } = authClient.useSession()

  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState('')

  const [entries, setEntries] = useState<Entry[]>([])

  const authForm = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { name: '', email: '', password: '' }
  })

  const entryForm = useForm<EntryFormValues>({
    resolver: zodResolver(entrySchema),
    defaultValues: { title: '', content: '' }
  })

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

  const onAuthSubmit = async (data: AuthFormValues) => {
    setError('')
    try {
      if (isRegistering) {
        if (!data.name?.trim()) {
          authForm.setError("name", { message: "Name is required for registration" })
          return
        }
        const { error } = await authClient.signUp.email({
          email: data.email,
          password: data.password,
          name: data.name,
        })
        if (error) throw error
      } else {
        const { error } = await authClient.signIn.email({
          email: data.email,
          password: data.password,
        })
        if (error) throw error
      }

      authForm.reset()
    } catch (err: any) {
      setError(err.message || 'Auth failed')
    }
  }

  const logout = async () => {
    await authClient.signOut()
  }

  const signInWithGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: import.meta.env.VITE_APP_URL || "http://localhost:5173",
    })
  }

  const onAddEntrySubmit = async (data: EntryFormValues) => {
    if (session?.user) {
      try {
        const savedEntry = await client.addEntry({
          title: data.title,
          content: data.content,
        })

        if (savedEntry && savedEntry.id) {
          setEntries(prev => [savedEntry, ...prev])
          entryForm.reset()
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
          <form className="entry-form auth-form" onSubmit={authForm.handleSubmit(onAuthSubmit)}>
            <h2>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
            {error && <p className="error-message">{error}</p>}
            {isRegistering && (
              <>
                <input
                  type="text"
                  placeholder="Name"
                  {...authForm.register("name")}
                  className="title-input"
                />
                {authForm.formState.errors.name && <p className="error-message">{authForm.formState.errors.name.message}</p>}
              </>
            )}
            <input
              type="email"
              placeholder="Email"
              {...authForm.register("email")}
              className="title-input"
            />
            {authForm.formState.errors.email && <p className="error-message">{authForm.formState.errors.email.message}</p>}
            <input
              type="password"
              placeholder="Password"
              {...authForm.register("password")}
              className="title-input"
            />
            {authForm.formState.errors.password && <p className="error-message">{authForm.formState.errors.password.message}</p>}
            <button type="submit" className="add-button" disabled={authForm.formState.isSubmitting}>
              {isRegistering ? 'Sign Up' : 'Log In'}
            </button>
            <div className="divider"><span>OR</span></div>
            <button type="button" onClick={signInWithGoogle} className="google-button">
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
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
        <form className="entry-form" onSubmit={entryForm.handleSubmit(onAddEntrySubmit)}>
          <input
            type="text"
            placeholder="Entry title..."
            {...entryForm.register("title")}
            className="title-input"
          />
          {entryForm.formState.errors.title && <p className="error-message">{entryForm.formState.errors.title.message}</p>}
          <textarea
            placeholder="What's on your mind today?"
            {...entryForm.register("content")}
            className="entry-textarea"
            rows={6}
          />
          {entryForm.formState.errors.content && <p className="error-message">{entryForm.formState.errors.content.message}</p>}
          <button type="submit" className="add-button" disabled={entryForm.formState.isSubmitting}>
            Add Entry
          </button>
        </form>

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