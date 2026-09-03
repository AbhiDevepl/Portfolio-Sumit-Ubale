import { useState } from 'react'
import { login } from '../../lib/b2'

export function AdminLogin({ onSignedIn }: { onSignedIn: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await login(password)
      setPassword('')
      onSignedIn()
    }
    catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Sign in failed')
    }
    finally {
      setBusy(false)
    }
  }

  return (
    <form className="admin-login" onSubmit={onSubmit}>
      <h1 className="admin-title">Admin</h1>

      {error && <p className="admin-error" role="alert">{error}</p>}

      <label className="form-label" htmlFor="admin-password">Password</label>
      <input
        id="admin-password"
        className="form-input"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={event => setPassword(event.target.value)}
        required
      />

      <button className="admin-button" type="submit" disabled={busy || password === ''}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
