import { useCallback, useEffect, useRef, useState } from 'react'
import type { LightboxItem } from '../../types/portfolio'

function formatTime(seconds: number): string {
  if (Number.isNaN(seconds) || !Number.isFinite(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const SPEEDS = ['0.5', '0.75', '1', '1.25', '1.5', '2']

const PlayIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
)

const PauseIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white" aria-hidden="true">
    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
  </svg>
)

/**
 * The lightbox's custom video player: centre play/pause, progress bar, time,
 * mute, volume, playback speed and fullscreen. Ported from the video controls
 * in legacy/scripts/core.js; the markup keeps the class names that
 * styles/lightbox-video.css targets.
 */
export function LightboxVideo({ item, onSpaceToggle }: {
  item: LightboxItem
  onSpaceToggle: (toggle: () => void) => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const hideTimer = useRef<number | undefined>(undefined)

  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [time, setTime] = useState({ current: 0, duration: 0 })
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(100)
  const [controlsVisible, setControlsVisible] = useState(true)

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) void video.play().catch(() => {})
    else video.pause()
  }, [])

  // Let the parent bind the space bar without reaching into this component.
  useEffect(() => {
    onSpaceToggle(togglePlayPause)
  }, [onSpaceToggle, togglePlayPause])

  // A new source means a fresh load: reset the transient UI.
  useEffect(() => {
    setLoading(true)
    setProgress(0)
    setTime({ current: 0, duration: 0 })
  }, [item.src])

  const showControls = useCallback(() => {
    setControlsVisible(true)
    window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setControlsVisible(false)
    }, 3000)
  }, [])

  useEffect(() => () => window.clearTimeout(hideTimer.current), [])

  const onCanPlay = () => {
    setLoading(false)
    void videoRef.current?.play().catch(() => {})
  }

  return (
    <>
      {loading && (
        <div className="lightbox-loading" style={{ display: 'flex' }}>
          <div className="spinner" />
          <p>Loading...</p>
        </div>
      )}

      <div
        className="lightbox-video-wrapper"
        ref={wrapperRef}
        style={{ opacity: loading ? 0 : 1 }}
        onMouseMove={showControls}
        onTouchStart={showControls}
      >
        <video
          className="lightbox-video"
          ref={videoRef}
          src={item.src}
          poster={item.poster}
          playsInline
          controls
          onClick={togglePlayPause}
          onCanPlay={onCanPlay}
          onError={() => setLoading(false)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => {
            const video = e.currentTarget
            const percent = video.duration ? (video.currentTime / video.duration) * 100 : 0
            setProgress(percent)
            setTime({ current: video.currentTime, duration: video.duration })
          }}
        />

        <div className="video-overlay-controls" style={{ opacity: playing ? 0 : 1 }}>
          <button className="video-play-pause" type="button" aria-label="Play or pause video" onClick={togglePlayPause}>
            {playing ? <PauseIcon size={80} /> : <PlayIcon size={80} />}
          </button>
        </div>

        <div className="video-controls-bar" style={{ opacity: controlsVisible ? 1 : 0 }}>
          <button
            className="video-control-btn play-pause-small"
            type="button"
            aria-label="Play or pause video"
            onClick={togglePlayPause}
          >
            {playing ? <PauseIcon size={24} /> : <PlayIcon size={24} />}
          </button>

          <div className="video-progress-container">
            <input
              type="range"
              className="video-progress"
              min="0"
              max="100"
              step="0.1"
              value={progress}
              aria-label="Seek"
              onChange={(e) => {
                const video = videoRef.current
                if (!video || !video.duration) return
                video.currentTime = (Number(e.target.value) / 100) * video.duration
              }}
            />
            <div className="video-progress-filled" style={{ width: `${progress}%` }} />
          </div>

          <span className="video-time">
            {formatTime(time.current)} / {formatTime(time.duration)}
          </span>

          <button
            className="video-control-btn mute-btn"
            type="button"
            aria-label="Mute or unmute video"
            onClick={() => {
              const video = videoRef.current
              if (!video) return
              video.muted = !video.muted
              setMuted(video.muted)
            }}
          >
            {muted
              ? (
                  <svg className="mute-icon" width="24" height="24" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                )
              : (
                  <svg className="volume-icon" width="24" height="24" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                  </svg>
                )}
          </button>

          <input
            type="range"
            className="volume-slider"
            min="0"
            max="100"
            step="1"
            value={volume}
            aria-label="Volume"
            onChange={(e) => {
              const video = videoRef.current
              const next = Number(e.target.value)
              setVolume(next)
              if (!video) return
              video.volume = next / 100
              video.muted = next === 0
              setMuted(video.muted)
            }}
          />

          <select
            className="playback-speed"
            aria-label="Playback speed"
            defaultValue="1"
            onChange={(e) => {
              if (videoRef.current) videoRef.current.playbackRate = Number(e.target.value)
            }}
          >
            {SPEEDS.map(speed => <option key={speed} value={speed}>{speed}x</option>)}
          </select>

          <button
            className="video-control-btn fullscreen-btn"
            type="button"
            aria-label="Open video fullscreen"
            onClick={() => void wrapperRef.current?.requestFullscreen?.().catch(() => {})}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}
