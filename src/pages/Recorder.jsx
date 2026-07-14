import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScreenRecorder, CAPTURE_TYPES } from '../hooks/useScreenRecorder'
import { useAuth } from '../context/AuthContext'
import { supabase, RECORDINGS_BUCKET } from '../lib/supabase'
import { formatDuration, formatBytes } from '../lib/format'

// Maps the server-side trigger's exception codes (see supabase/schema.sql)
// to plain-language messages for the UI.
function friendlyLimitMessage(rawMessage = '') {
  if (rawMessage.includes('RECORDING_LIMIT_REACHED')) {
    return "You've hit your saved-recordings limit (50). Delete an older recording to save this one."
  }
  if (rawMessage.includes('HOURLY_LIMIT_REACHED')) {
    return "You've saved the max recordings allowed this hour (10). Try again in a bit."
  }
  if (rawMessage.includes('STORAGE_QUOTA_EXCEEDED')) {
    return 'Saving this would go over your 2 GB storage quota. Delete some recordings to free up space.'
  }
  return null
}

export default function Recorder() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const {
    status, elapsedSeconds, error, warning, previewUrl, resultBlob,
    start, pause, resume, stop, reset,
  } = useScreenRecorder()

  const [captureType, setCaptureType] = useState('screen')
  const [videoName, setVideoName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const savingRef = useRef(false) // synchronous guard, closes the double-click race that state alone can't

  const isIdle = status === 'idle'
  const isRecording = status === 'recording'
  const isPaused = status === 'paused'
  const isStopped = status === 'stopped'

  const handleSave = async () => {
    if (!resultBlob || savingRef.current) return
    savingRef.current = true
    setSaving(true)
    setSaveError(null)

    let uploadedPath = null
    try {
      const name = videoName.trim() || `Recording ${new Date().toLocaleString()}`
      const ext = resultBlob.type.includes('webm') ? 'webm' : 'mp4'
      const path = `${user.id}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(RECORDINGS_BUCKET)
        .upload(path, resultBlob, { contentType: resultBlob.type, upsert: false })
      if (uploadError) throw uploadError
      uploadedPath = path

      const { error: insertError } = await supabase.from('recordings').insert({
        user_id: user.id,
        video_name: name,
        duration_seconds: elapsedSeconds,
        file_size_bytes: resultBlob.size,
        storage_path: path,
        mime_type: resultBlob.type,
        capture_type: captureType,
      })
      if (insertError) throw insertError

      reset()
      navigate('/recordings')
    } catch (err) {
      // If the DB insert was rejected (e.g. by the rate-limit trigger) after
      // the file already uploaded, remove the orphaned file so it doesn't
      // silently eat into the user's storage quota.
      if (uploadedPath) {
        await supabase.storage.from(RECORDINGS_BUCKET).remove([uploadedPath]).catch(() => {})
      }
      setSaveError(friendlyLimitMessage(err.message) || err.message || 'Could not save recording.')
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  const handleDownload = () => {
    if (!previewUrl) return
    const a = document.createElement('a')
    a.href = previewUrl
    a.download = `${videoName.trim() || 'recording'}.webm`
    a.click()
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-10 space-y-8">
      <div>
        <h1 className="font-display text-3xl" style={{ color: 'var(--color-accent)' }}>Recorder</h1>
        <p className="mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Capture your screen, a window, or a browser tab. Max 15 minutes per recording.
        </p>
      </div>

      {isIdle && (
        <div className="card-surface p-6 space-y-5">
          <p className="font-medium" style={{ color: 'var(--color-text)' }}>What do you want to record?</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {Object.entries(CAPTURE_TYPES).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setCaptureType(key)}
                className="p-4 rounded-theme border text-left transition-colors"
                style={{
                  borderColor: captureType === key ? 'var(--color-accent)' : 'var(--color-border)',
                  background: captureType === key ? 'var(--color-bg-alt)' : 'transparent',
                }}
              >
                <p className="font-medium" style={{ color: 'var(--color-text)' }}>{cfg.label}</p>
              </button>
            ))}
          </div>
          <button onClick={() => start(captureType)} className="btn-accent px-6 py-2.5 font-medium">
            Start Recording
          </button>
          {error && <p style={{ color: 'var(--color-danger)' }} className="text-sm">{error}</p>}
        </div>
      )}

      {(isRecording || isPaused) && (
        <div className="card-surface p-6 space-y-5 text-center">
          <div className="flex items-center justify-center gap-3">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: isRecording ? 'var(--color-danger)' : 'var(--color-text-muted)', animation: isRecording ? 'temple-glow 1.4s ease-in-out infinite' : 'none' }}
            />
            <span className="uppercase text-sm tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
              {isRecording ? 'Recording' : 'Paused'}
            </span>
          </div>
          <p className="font-display text-5xl" style={{ color: 'var(--color-accent)' }}>
            {formatDuration(elapsedSeconds)}
          </p>
          {warning && (
            <p className="text-sm px-3 py-2 rounded-theme inline-block" style={{ background: 'var(--color-bg-alt)', color: 'var(--color-danger)' }}>
              {warning}
            </p>
          )}
          <div className="flex items-center justify-center gap-3">
            {isRecording ? (
              <button onClick={pause} className="btn-primary px-5 py-2.5 font-medium">Pause</button>
            ) : (
              <button onClick={resume} className="btn-primary px-5 py-2.5 font-medium">Resume</button>
            )}
            <button onClick={stop} className="btn-danger px-5 py-2.5 font-medium">Stop</button>
          </div>
        </div>
      )}

      {isStopped && previewUrl && (
        <div className="card-surface p-6 space-y-5">
          <p className="font-medium" style={{ color: 'var(--color-text)' }}>Preview</p>
          <video src={previewUrl} controls className="w-full rounded-theme border" style={{ borderColor: 'var(--color-border)' }} />
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Duration {formatDuration(elapsedSeconds)} · Size {formatBytes(resultBlob?.size || 0)}
          </p>

          <label className="block">
            <span className="text-sm mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Name this recording</span>
            <input
              className="input"
              value={videoName}
              onChange={(e) => setVideoName(e.target.value)}
              placeholder={`Recording ${new Date().toLocaleDateString()}`}
            />
          </label>

          {saveError && <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{saveError}</p>}

          <div className="flex flex-wrap gap-3">
            <button onClick={handleSave} disabled={saving} className="btn-accent px-5 py-2.5 font-medium">
              {saving ? 'Saving…' : 'Save to History'}
            </button>
            <button onClick={handleDownload} className="btn-primary px-5 py-2.5 font-medium">Download</button>
            <button onClick={reset} className="btn-danger px-5 py-2.5 font-medium">Discard</button>
          </div>
        </div>
      )}
    </div>
  )
}
