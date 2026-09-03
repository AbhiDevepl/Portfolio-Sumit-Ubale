import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useParallax, useReveal } from '../../hooks/useReveal'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { gsap, useGSAP } from '../../lib/gsap'

const MINI_SERVICES = [
  { to: '/wedding-photographer-shrigonda', label: 'Candid Wedding Photography', copy: ' – Real emotions, unscripted moments.' },
  { to: '/cinematic-wedding-films-maharashtra', label: 'Cinematic Wedding Films', copy: ' – High-production visual storytelling.' },
  { to: '/pre-wedding-shoot-ahilyanagar', label: 'Pre-Wedding Shoots', copy: ' – Creative sessions at scenic locations.' },
  { to: '/candid-photographer-maharashtra', label: 'Drone Videography & Candid Coverage', copy: ' – Maharashtra-wide coverage.' },
]

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  // Image and copy arrive together but not identically — same values as
  // legacy/scripts/sections.js.
  useReveal(sectionRef, '.about-heading', { y: 30, duration: 1, stagger: 0 })
  useReveal(sectionRef, '.about-image-wrapper', { y: 46, duration: 1.2 })
  useReveal(sectionRef, '.about-content', { y: 30, duration: 1 })

  // The wrapper clips, so the image can drift inside it on scroll.
  useGSAP(() => {
    if (reduced) return
    const image = sectionRef.current?.querySelector('.about-image')
    if (image) gsap.set(image, { scale: 1.12, force3D: true })
  }, { scope: sectionRef, dependencies: [reduced] })

  useParallax(sectionRef, '.about-image', { amount: 10, triggerSelector: '.about-image-wrapper' })

  return (
    <section className="about section" id="about" ref={sectionRef}>
      <div className="container">
        <div className="about-grid">
          <div className="about-image-wrapper">
            <img
              src="https://exdevx.sirv.com/3.jpg?profile=true"
              alt="Sumit Ubale - Photographer portrait"
              className="about-image"
              width="600"
              height="800"
            />
          </div>
          <div className="about-content">
            <h2 className="about-heading" id="about-photographer">About Photographer</h2>

            <p className="about-text">
              With over a decade of experience in editorial and portrait photography,
              I bring a refined artistic vision and technical expertise to every project,
              creating timeless and evocative imagery that tells meaningful stories.
            </p>

            <p className="about-text">
              My work has been featured in prominent publications, and I have had the
              privilege of collaborating with distinguished clients worldwide — from
              intimate weddings to high-fashion editorial campaigns.
            </p>

            <p className="about-text">
              Each assignment is approached with precision, creativity, and a commitment
              to authenticity, ensuring that every captured moment leaves a lasting impression.
            </p>

            <div className="mini-services">
              <h3 className="mini-services-title">Services</h3>
              <ul className="mini-services-list">
                {MINI_SERVICES.map(service => (
                  <li key={service.to}>
                    <Link to={service.to} style={{ color: 'inherit' }}>
                      <strong>{service.label}</strong>
                    </Link>
                    {service.copy}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
