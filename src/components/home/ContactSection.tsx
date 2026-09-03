import { useRef } from 'react'
import { useReveal } from '../../hooks/useReveal'
import { SITE } from '../../lib/site'
import { ContactForm } from '../contact/ContactForm'

export function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useReveal(sectionRef, '.contact-title', { y: 30, duration: 1, stagger: 0 })
  useReveal(sectionRef, '.contact-subtitle, .contact-form, .contact-social', { y: 26, stagger: 0.08 })

  return (
    <section className="contact section" id="contact" ref={sectionRef}>
      <div className="container">
        <div className="contact-container">
          <h2 className="contact-title">Let's Work Together</h2>
          <p className="contact-subtitle">
            Have a project in mind? I'd love to hear about it.
            Fill out the form below and I'll get back to you within 24 hours.
          </p>

          <ContactForm />

          <div className="contact-social">
            <a href={SITE.instagram} className="social-link" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href={`mailto:${SITE.email}`} className="social-link">Email</a>
            <a href={`tel:${SITE.phone}`} className="social-link">Phone</a>
          </div>
        </div>

        <div className="local-seo-footer">
          <p className="local-seo-text">
            Providing professional wedding photography and cinematic film services across
            {' '}
            <strong>Shrigonda, Ahilyanagar, Pune, Mumbai, Nashik</strong>
            , and throughout Maharashtra.
            Specializing in candid storytelling, luxury wedding shoots, and creative pre-wedding sessions.
          </p>
        </div>
      </div>
    </section>
  )
}
