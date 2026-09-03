import { useId, useState } from 'react'

export interface FaqEntry {
  question: string
  answer: string
}

/**
 * Accordion for the landing pages' FAQ blocks. One open at a time, matching
 * the inline script the static pages each carried a copy of. The answers stay
 * in the DOM so they are indexable whether or not the panel is open.
 */
export function LandingFaq({ items }: { items: FaqEntry[] }) {
  const [open, setOpen] = useState<number | null>(null)
  const id = useId()

  return (
    <div className="lp-faq" role="list">
      {items.map((item, index) => {
        const isOpen = open === index
        const answerId = `${id}-answer-${index}`
        return (
          <div className={`lp-faq-item${isOpen ? ' is-open' : ''}`} role="listitem" key={item.question}>
            <button
              className="lp-faq-question"
              type="button"
              aria-expanded={isOpen}
              aria-controls={answerId}
              onClick={() => setOpen(current => (current === index ? null : index))}
            >
              {item.question}
            </button>
            <div className="lp-faq-answer" id={answerId}>{item.answer}</div>
          </div>
        )
      })}
    </div>
  )
}
