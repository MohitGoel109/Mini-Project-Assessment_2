import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) setError(error.message)
    else navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="card-surface w-full max-w-sm p-8 space-y-5">
        <div>
          <h1 className="font-display text-2xl" style={{ color: 'var(--color-accent)' }}>Enter the Dojo</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Sign in to your account.</p>
        </div>

        {error && (
          <p className="text-sm px-3 py-2 rounded-theme" style={{ background: 'var(--color-bg-alt)', color: 'var(--color-danger)' }}>
            {error}
          </p>
        )}

        <Field label="Email">
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="input" placeholder="you@example.com"
          />
        </Field>
        <Field label="Password">
          <input
            type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="input" placeholder="••••••••"
          />
        </Field>

        <button type="submit" disabled={loading} className="btn-accent w-full py-2.5 font-medium">
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        <p className="text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>
          No account yet? <Link to="/signup" className="underline" style={{ color: 'var(--color-accent)' }}>Create one</Link>
        </p>
      </form>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm mb-1 block" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      {children}
    </label>
  )
}
