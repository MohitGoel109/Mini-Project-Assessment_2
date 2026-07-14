import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, RECORDINGS_BUCKET } from '../lib/supabase'
import { formatDuration, formatBytes } from '../lib/format'

export default function Recordings() {
  const [recordings, setRecordings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const deletingRef = useRef(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('recordings')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setRecordings(data || [])
    setLoading(false)
  }

  async function handleDelete(rec) {
    if (deletingRef.current) return
    if (!window.confirm(`Delete "${rec.video_name}"? This cannot be undone.`)) return
    deletingRef.current = true
    setDeletingId(rec.id)
    await supabase.storage.from(RECORDINGS_BUCKET).remove([rec.storage_path])
    const { error } = await supabase.from('recordings').delete().eq('id', rec.id)
    if (!error) setRecordings((prev) => prev.filter((r) => r.id !== rec.id))
    deletingRef.current = false
    setDeletingId(null)
  }

  return (
    <div className="max-w-6xl mx-auto px-5 py-10 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl" style={{ color: 'var(--color-accent)' }}>Recordings</h1>
          <p className="mt-1" style={{ color: 'var(--color-text-muted)' }}>Your full capture history.</p>
        </div>
        <Link to="/recorder" className="btn-accent px-5 py-2.5 font-medium">New Recording</Link>
      </div>

      {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Loading…</p>
      ) : recordings.length === 0 ? (
        <div className="card-surface p-10 text-center" style={{ color: 'var(--color-text-muted)' }}>
          No recordings yet. Your saved captures will appear here.
        </div>
      ) : (
        <div className="card-surface divide-y" style={{ borderColor: 'var(--color-border)' }}>
          {recordings.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-4 p-4 flex-wrap" style={{ borderColor: 'var(--color-border)' }}>
              <Link to={`/recordings/${r.id}`} className="flex-1 min-w-[200px]">
                <p className="font-medium" style={{ color: 'var(--color-text)' }}>{r.video_name}</p>
                <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {new Date(r.created_at).toLocaleString()} · {formatDuration(r.duration_seconds)} · {formatBytes(r.file_size_bytes)} · {r.capture_type}
                </p>
              </Link>
              <div className="flex gap-2">
                <Link to={`/recordings/${r.id}`} className="btn-primary px-4 py-1.5 text-sm">View</Link>
                <button
                  onClick={() => handleDelete(r)}
                  disabled={deletingId === r.id}
                  className="btn-danger px-4 py-1.5 text-sm"
                >
                  {deletingId === r.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
