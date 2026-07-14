import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase, RECORDINGS_BUCKET } from '../lib/supabase'
import { formatDuration, formatBytes } from '../lib/format'

export default function VideoPreview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [recording, setRecording] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const deletingRef = useRef(false)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      const { data, error } = await supabase.from('recordings').select('*').eq('id', id).single()
      if (error) {
        if (active) { setError(error.message); setLoading(false) }
        return
      }
      const { data: signed, error: signError } = await supabase.storage
        .from(RECORDINGS_BUCKET)
        .createSignedUrl(data.storage_path, 3600)
      if (active) {
        setRecording(data)
        if (!signError) setVideoUrl(signed.signedUrl)
        setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [id])

  async function handleDelete() {
    if (!recording || deletingRef.current) return
    if (!window.confirm(`Delete "${recording.video_name}"? This cannot be undone.`)) return
    deletingRef.current = true
    setDeleting(true)
    await supabase.storage.from(RECORDINGS_BUCKET).remove([recording.storage_path])
    const { error } = await supabase.from('recordings').delete().eq('id', recording.id)
    deletingRef.current = false
    setDeleting(false)
    if (!error) navigate('/recordings')
  }

  function handleDownload() {
    if (!videoUrl || !recording) return
    const a = document.createElement('a')
    a.href = videoUrl
    a.download = `${recording.video_name}.webm`
    a.click()
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto px-5 py-10" style={{ color: 'var(--color-text-muted)' }}>Loading…</div>
  }

  if (error || !recording) {
    return (
      <div className="max-w-4xl mx-auto px-5 py-10 space-y-3">
        <p style={{ color: 'var(--color-danger)' }}>{error || 'Recording not found.'}</p>
        <Link to="/recordings" className="btn-primary inline-block px-4 py-2">Back to Recordings</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-10 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl" style={{ color: 'var(--color-accent)' }}>{recording.video_name}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {new Date(recording.created_at).toLocaleString()} · {formatDuration(recording.duration_seconds)} · {formatBytes(recording.file_size_bytes)} · {recording.capture_type}
          </p>
        </div>
        <Link to="/recordings" className="btn-primary px-4 py-2 text-sm">Back</Link>
      </div>

      {videoUrl ? (
        <video src={videoUrl} controls className="w-full rounded-theme border" style={{ borderColor: 'var(--color-border)' }} />
      ) : (
        <p style={{ color: 'var(--color-danger)' }}>Could not load video preview.</p>
      )}

      <div className="flex gap-3">
        <button onClick={handleDownload} disabled={!videoUrl} className="btn-accent px-5 py-2.5 font-medium">Download</button>
        <button onClick={handleDelete} disabled={deleting} className="btn-danger px-5 py-2.5 font-medium">
          {deleting ? 'Deleting…' : 'Delete Recording'}
        </button>
      </div>
    </div>
  )
}
