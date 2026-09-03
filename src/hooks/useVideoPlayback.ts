import type { RefObject } from 'react'
import { useEffect } from 'react'

/**
 * Lazy-loads a video's source when it scrolls into view and pauses it when it
 * scrolls out. Ported from Core.VideoObserver in legacy/scripts/core.js —
 * same rootMargin and threshold.
 *
 * The element must carry the real URL on `data-src`; nothing is downloaded
 * until the tile is near the viewport.
 */
export function useLazyVideo(ref: RefObject<HTMLVideoElement | null>) {
  useEffect(() => {
    const video = ref.current
    if (!video) return

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const src = video.dataset.src
          if (src && !video.src) {
            video.src = src
            video.load()
          }
        }
        else if (!video.paused) {
          video.pause()
        }
      }
    }, { rootMargin: '50px 0px', threshold: 0.1 })

    observer.observe(video)
    return () => observer.disconnect()
  }, [ref])
}

const isTouchDevice = () =>
  typeof window !== 'undefined'
  && ('ontouchstart' in window || navigator.maxTouchPoints > 0)

/**
 * Play on hover, stop and rewind on leave — desktop only, since a touch device
 * has no hover and would be left with a video it cannot stop.
 * Ported from Core.VideoHover in legacy/scripts/core.js.
 */
export function useHoverPlay(
  videoRef: RefObject<HTMLVideoElement | null>,
  containerRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const video = videoRef.current
    const container = containerRef.current
    if (!video || !container || isTouchDevice()) return

    const play = () => {
      // One video at a time: a grid of simultaneously playing clips is both
      // unreadable and expensive.
      document.querySelectorAll('video').forEach((other) => {
        if (other !== video && !other.paused && !other.closest('#lightbox')) other.pause()
      })
      const src = video.dataset.src
      if (src && !video.src) video.src = src
      void video.play().catch(() => {})
    }

    const stop = () => {
      video.pause()
      video.currentTime = 0
    }

    container.addEventListener('mouseenter', play)
    container.addEventListener('mouseleave', stop)
    return () => {
      container.removeEventListener('mouseenter', play)
      container.removeEventListener('mouseleave', stop)
    }
  }, [videoRef, containerRef])
}
