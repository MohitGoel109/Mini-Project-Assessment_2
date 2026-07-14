import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { formatDuration, formatBytes } from '../lib/format'

export default function Dashboard() {
  const { user } = useAuth()
  const [recordings, setRecordings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      const { data, error } = await supabase
        .from('recordings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      if (active && !error) setRecordings(data || [])
      if (active) setLoading(false)
    }
    load()
    return () => { active = false }
  }, [])

  const totalCount = recordings.length
  const totalDuration = recordings.reduce((s, r) => s + (r.duration_seconds || 0), 0)
  const totalSize = recordings.reduce((s, r) => s + (r.file_size_bytes || 0), 0)

  return (
    <div className="max-w-6xl mx-auto px-5 py-10 space-y-10">
      <div>
        <h1 className="font-display text-3xl" style={{ color: 'var(--color-accent)' }}>
          Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
        </h1>
        <p className="mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Your capture history and quick actions, at a glance.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Recent Recordings" value={loading ? '—' : totalCount} />
        <StatCard label="Combined Duration" value={loading ? '—' : formatDuration(totalDuration)} />
        <StatCard label="Combined Size" value={loading ? '—' : formatBytes(totalSize)} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/recorder" className="btn-accent px-5 py-2.5 font-medium">Start a New Recording</Link>
        <Link to="/recordings" className="btn-primary px-5 py-2.5 font-medium">View All Recordings</Link>
      </div>

      <div>
        <h2 className="font-display text-xl mb-3" style={{ color: 'var(--color-text)' }}>Latest Captures</h2>
        {loading ? (
          <p style={{ color: 'var(--color-text-muted)' }}>Loading…</p>
        ) : recordings.length === 0 ? (
          <div className="card-surface p-6 text-center" style={{ color: 'var(--color-text-muted)' }}>
            No recordings yet. Head to the Recorder to capture your first one.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recordings.map((r) => (
              <Link key={r.id} to={`/recordings/${r.id}`} className="card-surface p-4 block hover:opacity-90">
                <p className="font-medium truncate" style={{ color: 'var(--color-text)' }}>{r.video_name}</p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  {formatDuration(r.duration_seconds)} · {formatBytes(r.file_size_bytes)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="card-surface p-5">
      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
      <p className="font-display text-3xl mt-1" style={{ color: 'var(--color-accent)' }}>{value}</p>
    </div>
  )
}
