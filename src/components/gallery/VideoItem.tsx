import type { RefObject } from 'react'
import { useRef } from 'react'
import { useHoverPlay, useLazyVideo } from '../../hooks/useVideoPlayback'

/**
 * A gallery video tile's media element: lazy-loaded, auto-paused when it
 * leaves the viewport, and played on hover on pointer devices.
 */
export function VideoItem({ src, poster, containerRef, onLoaded }: {
  src: string
  poster?: string
  containerRef: RefObject<HTMLElement | null>
  onLoaded: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useLazyVideo(videoRef)
  useHoverPlay(videoRef, containerRef)

  return (
    <video
      ref={videoRef}
      className="gallery-media"
      data-src={src}
      poster={poster}
      preload="none"
      muted
      loop
      playsInline
      onLoadedMetadata={onLoaded}
      onClick={(e) => {
        // Tapping the video itself toggles playback; the overlay opens the
        // lightbox (see GalleryItem).
        const video = e.currentTarget
        if (video.paused) {
          if (!video.src && video.dataset.src) video.src = video.dataset.src
          void video.play().catch(() => {})
        }
        else {
          video.pause()
          video.currentTime = 0
        }
      }}
    />
  )
}
