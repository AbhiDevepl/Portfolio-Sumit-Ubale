import { useRef, useState } from 'react'
import { gsap } from '../../lib/gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { SITE } from '../../lib/site'

const FORMSUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${SITE.email}`

interface Fields {
  name: string
  email: string
  message: string
}

type Errors = Partial<Record<keyof Fields, string>>

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/** Same rules as legacy/scripts/contact.js, including the 10-character floor. */
function validate({ name, email, message }: Fields): Errors {
  const errors: Errors = {}

  if (!name.trim()) errors.name = 'Please enter your name'

  if (!email.trim()) errors.email = 'Please enter your email'
  else if (!validateEmail(email.trim())) errors.email = 'Please enter a valid email'

  if (!message.trim()) errors.message = 'Please enter a message'
  else if (message.trim().length < 10) errors.message = 'Message must be at least 10 characters'

  return errors
}

/** Ported from legacy/scripts/contact.js — same endpoint, payload and copy. */
export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const reduced = useReducedMotion()

  const [fields, setFields] = useState<Fields>({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<'success' | 'error' | null>(null)

  const update = (key: keyof Fields) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFields(current => ({ ...current, [key]: event.target.value }))
    setErrors(current => ({ ...current, [key]: undefined }))
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const found = validate(fields)
    if (Object.keys(found).length > 0) {
      setErrors(found)
      if (!reduced && formRef.current) {
        gsap.fromTo(formRef.current, { x: -10 }, { x: 0, duration: 0.1, repeat: 5, yoyo: true, ease: 'power1.inOut' })
      }
      return
    }

    setSending(true)
    setStatus(null)

    try {
      const response = await fetch(FORMSUBMIT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: fields.name.trim(),
          email: fields.email.trim(),
          message: fields.message.trim(),
          _subject: `New enquiry from ${fields.name.trim()}`,
          _template: 'table',
        }),
      })

      if (!response.ok) throw new Error('Form submission failed')

      setStatus('success')
      setFields({ name: '', email: '', message: '' })
    }
    catch (error) {
      console.error('Form submission error:', error)
      setStatus('error')
    }
    finally {
      setSending(false)
    }
  }

  return (
    <>
      {status && (
        <div
          className={`form-message form-message-${status}`}
          role={status === 'error' ? 'alert' : 'status'}
        >
          {status === 'success'
            ? 'Thank you! Your message has been sent successfully.'
            : 'Oops! Something went wrong. Please try again later.'}
        </div>
      )}

      <form ref={formRef} method="post" className="contact-form" id="contact-form" noValidate onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="name" className="form-label">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className={`form-input${errors.name ? ' error' : ''}`}
            autoComplete="name"
            value={fields.name}
            onChange={update('name')}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'name-error' : undefined}
            required
          />
          {errors.name && <span className="field-error" id="name-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className={`form-input${errors.email ? ' error' : ''}`}
            autoComplete="email"
            value={fields.email}
            onChange={update('email')}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            required
          />
          {errors.email && <span className="field-error" id="email-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="message" className="form-label">Message</label>
          <textarea
            id="message"
            name="message"
            className={`form-textarea${errors.message ? ' error' : ''}`}
            rows={6}
            value={fields.message}
            onChange={update('message')}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? 'message-error' : undefined}
            required
          />
          {errors.message && <span className="field-error" id="message-error">{errors.message}</span>}
        </div>

        <button type="submit" className="form-submit" disabled={sending}>
          {sending ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </>
  )
}
