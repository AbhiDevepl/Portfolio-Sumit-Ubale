import { useRef } from 'react'
import { useReveal } from '../../hooks/useReveal'

const TESTIMONIALS = [
  {
    id: 'testimonial-1',
    text: '"Sumit is the best wedding photographer in Shrigonda. Every moment was captured with such grace and creativity. Beyond just photos, he captured the soul of our wedding."',
    author: '— Aniket & Priya',
  },
  {
    id: 'testimonial-2',
    text: '"The cinematic energy Sumit brings is unmatched. Our pre-wedding film felt like a dream. Professional, patient, and incredibly talented!"',
    author: '— Rahul & Sneha',
  },
  {
    id: 'testimonial-3',
    text: '"He has an eye for candid moments that most people miss. We are so grateful for the timeless memories he created for us in Mumbai."',
    author: '— Vikram & Aditi',
  },
]

export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null)

  useReveal(sectionRef, '.section-title', { y: 30, duration: 1, stagger: 0 })
  useReveal(sectionRef, '.testimonial-card', { y: 38, duration: 0.95, stagger: 0.1 })

  return (
    <section className="testimonials section" id="testimonials" ref={sectionRef}>
      <div className="container">
        <h2 className="section-title">Client Testimonials</h2>
        <div className="testimonials-grid">
          {TESTIMONIALS.map(item => (
            <div className="testimonial-card" id={item.id} key={item.id}>
              <div className="testimonial-stars" aria-hidden="true">★★★★★</div>
              <p className="sr-only">Rating: 5 out of 5 stars</p>
              <p className="testimonial-text">{item.text}</p>
              <p className="testimonial-author">{item.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
