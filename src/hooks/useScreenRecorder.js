import { useCallback, useRef, useState } from 'react'

// Hard cap per requirements: recordings auto-finalize at 15 minutes,
// with a warning fired at 13 minutes so the UI can notify the user.
const MAX_DURATION_SECONDS = 15 * 60
const WARNING_AT_SECONDS = 13 * 60

const MIME_CANDIDATES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
]

function pickSupportedMimeType() {
  for (const type of MIME_CANDIDATES) {
    if (window.MediaRecorder && MediaRecorder.isTypeSupported(type)) return type
  }
  return 'video/webm'
}

export const CAPTURE_TYPES = {
  screen: { label: 'Entire Screen', displayMediaOptions: { video: { displaySurface: 'monitor' }, audio: true } },
  window: { label: 'Application Window', displayMediaOptions: { video: { displaySurface: 'window' }, audio: true } },
  tab: { label: 'Browser Tab', displayMediaOptions: { video: { displaySurface: 'browser' }, audio: true } },
}

export function useScreenRecorder() {
  const [status, setStatus] = useState('idle') // idle | recording | paused | stopped
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [error, setError] = useState(null)
  const [warning, setWarning] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [resultBlob, setResultBlob] = useState(null)

  const streamRef = useRef(null)
  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)
  const pausedAccumRef = useRef(0)
  const pauseStartRef = useRef(null)

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const tick = useCallback(() => {
    const now = Date.now()
    const totalPaused = pausedAccumRef.current
    const secs = Math.floor((now - startTimeRef.current - totalPaused) / 1000)
    setElapsedSeconds(secs)

    if (secs === WARNING_AT_SECONDS) {
      setWarning('2 minutes remaining before this recording auto-stops (15 min cap).')
    }
    if (secs >= MAX_DURATION_SECONDS) {
      stop()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const cleanupStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  const start = useCallback(async (captureType = 'screen') => {
    setError(null)
    setWarning(null)
    setResultBlob(null)
    setPreviewUrl(null)
    chunksRef.current = []
    pausedAccumRef.current = 0

    try {
      const options = CAPTURE_TYPES[captureType]?.displayMediaOptions || CAPTURE_TYPES.screen.displayMediaOptions
      const stream = await navigator.mediaDevices.getDisplayMedia(options)
      streamRef.current = stream

      const mimeType = pickSupportedMimeType()
      const recorder = new MediaRecorder(stream, { mimeType })
      recorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        setResultBlob(blob)
        setPreviewUrl(URL.createObjectURL(blob))
        cleanupStream()
        clearTimer()
      }

      // If the user stops sharing via the browser's native "Stop sharing"
      // control, treat it the same as pressing Stop.
      stream.getVideoTracks()[0]?.addEventListener('ended', () => {
        if (recorderRef.current && recorderRef.current.state !== 'inactive') {
          stop()
        }
      })

      recorder.start(1000) // gather data every second -> steady blob chunks
      startTimeRef.current = Date.now()
      setStatus('recording')
      timerRef.current = window.setInterval(tick, 1000)
    } catch (err) {
      setError(err?.message || 'Screen capture was cancelled or is not permitted.')
      setStatus('idle')
    }
  }, [tick])

  const pause = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.pause()
      pauseStartRef.current = Date.now()
      setStatus('paused')
      clearTimer()
    }
  }, [])

  const resume = useCallback(() => {
    if (recorderRef.current?.state === 'paused') {
      recorderRef.current.resume()
      pausedAccumRef.current += Date.now() - pauseStartRef.current
      setStatus('recording')
      timerRef.current = window.setInterval(tick, 1000)
    }
  }, [tick])

  const stop = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
    setStatus('stopped')
    clearTimer()
  }, [])

  const reset = useCallback(() => {
    cleanupStream()
    clearTimer()
    recorderRef.current = null
    chunksRef.current = []
    setStatus('idle')
    setElapsedSeconds(0)
    setError(null)
    setWarning(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setResultBlob(null)
  }, [previewUrl])

  return {
    status,
    elapsedSeconds,
    error,
    warning,
    previewUrl,
    resultBlob,
    start,
    pause,
    resume,
    stop,
    reset,
    maxDurationSeconds: MAX_DURATION_SECONDS,
  }
}
