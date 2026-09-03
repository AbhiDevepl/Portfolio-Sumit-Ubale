/**
 * Single place where GSAP is registered and configured.
 * Ported from legacy/scripts/gsap-init.js — same plugins, same defaults.
 */
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(useGSAP, ScrollTrigger)

gsap.config({ nullTargetWarn: false })
gsap.defaults({ ease: 'power3.out', duration: 0.8 })

if (typeof window !== 'undefined') {
  ScrollTrigger.defaults({ toggleActions: 'play none none none' })
  // Mobile browsers fire resize when the address bar collapses. Without this,
  // every such nudge re-measures triggers and makes scrubbed motion stutter.
  ScrollTrigger.config({ ignoreMobileResize: true })
}

export { gsap, ScrollTrigger, useGSAP }
