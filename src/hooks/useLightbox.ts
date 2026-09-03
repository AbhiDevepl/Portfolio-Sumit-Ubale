import { useCallback, useEffect, useState } from 'react'
import type { LightboxItem } from '../types/portfolio'

export interface LightboxController {
  items: LightboxItem[]
  index: number
  isOpen: boolean
  open: (index: number, items?: LightboxItem[]) => void
  close: () => void
  next: () => void
  prev: () => void
}

/**
 * Lightbox state, keyboard navigation and scroll locking.
 * Ported from the Lightbox engine in legacy/scripts/core.js.
 */
export function useLightbox(defaultItems: LightboxItem[] = []): LightboxController {
  const [items, setItems] = useState<LightboxItem[]>(defaultItems)
  const [index, setIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback((at: number, list?: LightboxItem[]) => {
    if (list) setItems(list)
    setIndex(at)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => setIsOpen(false), [])

  const step = useCallback((direction: number) => {
    setIndex((current) => {
      const list = items.length
      if (!list) return 0
      return (current + direction + list) % list
    })
  }, [items.length])

  const next = useCallback(() => step(1), [step])
  const prev = useCallback(() => step(-1), [step])

  // Keep the visible list in sync when the caller re-filters the gallery.
  useEffect(() => {
    if (!isOpen) setItems(defaultItems)
  }, [defaultItems, isOpen])

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.classList.add('no-scroll')

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.classList.remove('no-scroll')
    }
  }, [isOpen, close, next, prev])

  return { items, index, isOpen, open, close, next, prev }
}
