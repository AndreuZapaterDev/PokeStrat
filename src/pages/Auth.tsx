import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'
import './Auth.css'
import { signInWithEmail, signOut, signUpWithEmail, getCurrentUser, onAuthStateChange } from '../services/supabase'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<{ email?: string | null; user_metadata?: { username?: string } } | null>(null)

  useEffect(() => {
    async function fetchUser() {
      try {
        const current = await getCurrentUser()
        setUser(current)
      } catch {
        setUser(null)
      }
    }

    fetchUser()
    const cleanup = onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === 'SIGNED_OUT') {
        setMessage('Sesión cerrada correctamente')
      }
    })

    return cleanup
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      if (mode === 'login') {
        await signInWithEmail(email, password)
        setMessage('Inicio de sesión correcto')
      } else {
        await signUpWithEmail(email, password, username)
        setMessage('Registro enviado. Revisa tu email para confirmar')
      }
      setEmail('')
      setPassword('')
      setUsername('')
    } catch (err) {
      setError((err as Error)?.message ?? 'Error en autenticación')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      await signOut()
      setMessage('Sesión cerrada con éxito')
      setUser(null)
    } catch (err) {
      setError((err as Error)?.message ?? 'No se pudo cerrar la sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page">
      <header className="pageHeader">
        <h1>Login / Registro</h1>
        <Link className="button secondary" to="/">
          Volver al inicio
        </Link>
      </header>

      {user ? (
        <section className="status">
          <p>
            Sesión iniciada como <strong>{user.user_metadata?.username ?? user.email ?? 'usuario'}</strong>
          </p>
          <button type="button" className="button secondary" onClick={handleSignOut} disabled={loading}>
            Cerrar sesión
          </button>
          {message && <p className="status success">{message}</p>}
          {error && <p className="status error">{error}</p>}
        </section>
      ) : (
        <section className="authForm">
          <div className="tabs">
            <button
              type="button"
              className={`button secondary ${mode === 'login' ? 'active' : ''}`}
              onClick={() => setMode('login')}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              className={`button secondary ${mode === 'register' ? 'active' : ''}`}
              onClick={() => setMode('register')}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />

            {mode === 'register' && (
              <>
                <label htmlFor="username">Nombre de usuario</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                  minLength={3}
                  autoComplete="username"
                />
              </>
            )}

            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={6}
            />

            <button type="submit" className="button" disabled={loading}>
              {mode === 'login' ? 'Entrar' : 'Crear cuenta'}
            </button>

            {loading && <LoadingSpinner label="Procesando" />}
            {message && <p className="status success">{message}</p>}
            {error && <p className="status error">{error}</p>}
          </form>
        </section>
      )}
    </main>
  )
}
