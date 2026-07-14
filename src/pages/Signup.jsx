import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)
    const { data, error } = await signUp(email, password)
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    if (data.session) {
      navigate('/')
    } else {
      setInfo('Account created. Check your email to confirm, then sign in.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="card-surface w-full max-w-sm p-8 space-y-5">
        <div>
          <h1 className="font-display text-2xl" style={{ color: 'var(--color-accent)' }}>Join the Dojo</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Create your account.</p>
        </div>

        {error && (
          <p className="text-sm px-3 py-2 rounded-theme" style={{ background: 'var(--color-bg-alt)', color: 'var(--color-danger)' }}>
            {error}
          </p>
        )}
        {info && (
          <p className="text-sm px-3 py-2 rounded-theme" style={{ background: 'var(--color-bg-alt)', color: 'var(--color-accent)' }}>
            {info}
          </p>
        )}

        <label className="block">
          <span className="text-sm mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Email</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" />
        </label>
        <label className="block">
          <span className="text-sm mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Password</span>
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="At least 6 characters" />
        </label>

        <button type="submit" disabled={loading} className="btn-accent w-full py-2.5 font-medium">
          {loading ? 'Creating account…' : 'Create Account'}
        </button>

        <p className="text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>
          Already have an account? <Link to="/login" className="underline" style={{ color: 'var(--color-accent)' }}>Sign in</Link>
        </p>
      </form>
    </div>
  )
}
