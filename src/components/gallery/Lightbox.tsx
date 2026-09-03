import { useLenis } from 'lenis/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { LightboxController } from '../../hooks/useLightbox'
import { LightboxVideo } from './LightboxVideo'

const SWIPE_THRESHOLD = 48

/**
 * Fullscreen preview. Ported from the Lightbox engine in
 * legacy/scripts/core.js: overlay/close/prev/next, keyboard navigation (in
 * useLightbox), touch swipe, and the custom video controls.
 */
export function Lightbox({ controller }: { controller: LightboxController }) {
  const { items, index, isOpen, close, next, prev } = controller
  const item = items[index]

  const [active, setActive] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const touchStartX = useRef(0)
  const touchCurrentX = useRef(0)
  const touching = useRef(false)
  const videoToggle = useRef<(() => void) | null>(null)
  const lenis = useLenis()

  // The CSS transitions off `.active`, so the class is added a frame after
  // the element mounts — same trick as the original requestAnimationFrame.
  useEffect(() => {
    if (!isOpen) {
      setActive(false)
      return
    }
    const frame = requestAnimationFrame(() => setActive(true))
    return () => cancelAnimationFrame(frame)
  }, [isOpen])

  // Smooth scrolling must not keep running behind the overlay.
  useEffect(() => {
    if (!isOpen || !lenis) return
    lenis.stop()
    return () => lenis.start()
  }, [isOpen, lenis])

  useEffect(() => setImageLoaded(false), [item?.src])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault()
        videoToggle.current?.()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  const bindSpaceToggle = useCallback((toggle: () => void) => {
    videoToggle.current = toggle
  }, [])

  if (!isOpen || !item) return null

  const isVideo = item.type === 'video'

  return (
    <div
      id="lightbox"
      className={`lightbox${active ? ' active' : ''}`}
      style={{ display: 'flex' }}
      role="dialog"
      aria-modal="true"
      aria-label="Fullscreen gallery preview"
    >
      <div className="lightbox-overlay" onClick={close} />
      <div className="lightbox-content">
        <button className="lightbox-close" type="button" aria-label="Close preview" onClick={close}>&times;</button>
        <button className="lightbox-prev" type="button" aria-label="Previous item" onClick={prev}>&#8249;</button>
        <button className="lightbox-next" type="button" aria-label="Next item" onClick={next}>&#8250;</button>

        <div
          className="lightbox-media-container"
          onTouchStart={(e) => {
            if (e.touches.length !== 1) return
            touching.current = true
            touchStartX.current = e.touches[0]!.clientX
            touchCurrentX.current = e.touches[0]!.clientX
          }}
          onTouchMove={(e) => {
            if (!touching.current || e.touches.length !== 1) return
            touchCurrentX.current = e.touches[0]!.clientX
          }}
          onTouchEnd={() => {
            if (!touching.current) return
            touching.current = false
            const deltaX = touchCurrentX.current - touchStartX.current
            if (Math.abs(deltaX) < SWIPE_THRESHOLD) return
            if (deltaX < 0) next()
            else prev()
          }}
        >
          {isVideo
            ? <LightboxVideo item={item} onSpaceToggle={bindSpaceToggle} />
            : (
                <img
                  className="lightbox-image"
                  src={item.src}
                  alt={item.alt || item.title || 'Gallery preview'}
                  style={{ display: 'block', opacity: imageLoaded ? 1 : 0 }}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageLoaded(true)}
                />
              )}
        </div>

        <div className="lightbox-caption">
          <div className="lightbox-caption-copy">
            <h3>{item.title || (isVideo ? 'Video preview' : 'Image preview')}</h3>
            <p>{item.category || ''}</p>
          </div>
          <div className="lightbox-counter" aria-live="polite">
            {index + 1} / {items.length}
          </div>
        </div>
      </div>
    </div>
  )
}
