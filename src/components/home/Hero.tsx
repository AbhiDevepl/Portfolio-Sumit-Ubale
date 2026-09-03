import { useRef } from 'react'
import { usePageLoaded } from '../../hooks/usePageLoaded'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useLazyVideo } from '../../hooks/useVideoPlayback'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'

const HERO_POSTER = 'https://res.cloudinary.com/portfolio-sumit-ubale/image/upload/v1771091727/IMG_Hero_peub99.webp'
const HERO_VIDEO = 'https://exdevx.sirv.com/Haldi/Haldi.spin?profile=true'

/**
 * Cinematic entrance plus scrubbed media parallax.
 * Every duration, offset and ease is ported verbatim from
 * legacy/scripts/hero.js — only the DOM-query style changed.
 */
export function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const reduced = useReducedMotion()
  const loaded = usePageLoaded()

  useLazyVideo(videoRef)

  useGSAP(() => {
    // Markup is visible by default, so reduced motion simply animates nothing.
    if (reduced || !loaded) return

    const hero = heroRef.current
    if (!hero) return

    const title = hero.querySelector('.hero-title')
    const subtitle = hero.querySelector('.hero-subtitle')
    const scrollCue = hero.querySelector('.hero-scroll-cue')
    const media = hero.querySelector('.hero-video') ?? hero.querySelector('.hero-media-wrapper')

    // The media sits inside an overflow:hidden wrapper and is held slightly
    // oversized, so it can settle and later drift without exposing an edge.
    if (media) gsap.set(media, { scale: 1.14, force3D: true })

    const entrance = gsap.timeline({ defaults: { ease: 'power4.out' } })

    if (media) {
      entrance.to(media, { scale: 1.06, duration: 2.4, ease: 'power2.out' }, 0)
    }

    if (title) {
      entrance.fromTo(title,
        { opacity: 0, y: 44, clipPath: 'inset(0 0 100% 0)' },
        { opacity: 1, y: 0, clipPath: 'inset(0 0 -2% 0)', duration: 1.25 },
        0.15,
      )
    }

    if (subtitle) {
      entrance.fromTo(subtitle, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 1 }, '-=0.85')
    }

    if (scrollCue) {
      entrance.fromTo(scrollCue, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
      // Gentle idle cue, started only once the entrance has landed.
      entrance.call(() => {
        gsap.to(scrollCue, { y: 8, duration: 1.6, ease: 'sine.inOut', repeat: -1, yoyo: true })
      })
    }

    // Scrubbed parallax: the media drifts a little slower than the page.
    if (media) {
      gsap.to(media, {
        yPercent: 12,
        ease: 'none',
        force3D: true,
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
    }

    ScrollTrigger.refresh()
  }, { scope: heroRef, dependencies: [reduced, loaded], revertOnUpdate: true })

  return (
    <section className="hero" id="home" ref={heroRef}>
      <div className="hero-media-wrapper">
        <video
          ref={videoRef}
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster={HERO_POSTER}
          data-src={HERO_VIDEO}
        />
        <div className="hero-overlay" />
      </div>
      <div className="hero-content">
        <h1 className="hero-title">
          Sumit Ubale
          {' '}
          <span className="hero-title-sub">Photography</span>
        </h1>
        <p className="hero-subtitle">
          Photographer in Shrigonda
          <br />
          Candid Wedding Photography & Cinematic Films
        </p>
      </div>
      <div className="hero-scroll-cue scroll-indicator" aria-hidden="true">Scroll</div>
    </section>
  )
}
