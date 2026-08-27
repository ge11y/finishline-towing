'use client'

import { useEffect } from 'react'

/**
 * Scroll-driven reveals for the public shell.
 *
 * Progressive enhancement, in this order:
 *   1. Server HTML ships with everything visible and in final position.
 *   2. This component marks the shell `flt-reveal-on` — only then does the CSS
 *      apply a pre-reveal state. So with JS off, or before hydration, the page
 *      is simply static and readable; nothing can be stranded off-screen.
 *   3. An IntersectionObserver adds `is-revealed` as each element enters.
 *
 * Chosen over CSS scroll timelines deliberately: Lightning CSS strips
 * `animation-timeline` at Turbopack's default targets, and Safari support is
 * still thin — and phones are the primary surface for a roadside trade.
 *
 * Honours prefers-reduced-motion by never arming at all.
 */
// Observe STABLE containers, never the transformed children. A pre-reveal
// transform moves an element out of the viewport, so observing it directly
// means the observer never sees it enter and it stays hidden forever.
const TARGETS = '.hs-why, .hs-row, .hs-review'

export function ScrollReveal() {
  useEffect(() => {
    const shell = document.querySelector('.factory-public-shell')
    if (!shell) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (typeof IntersectionObserver === 'undefined') return

    const nodes = Array.from(shell.querySelectorAll<HTMLElement>(TARGETS))
    if (!nodes.length) return

    shell.classList.add('flt-reveal-on')

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-revealed')
          io.unobserve(entry.target) // one-shot: never re-hide on scroll back up
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
    )

    nodes.forEach((node) => {
      // Anything already on screen at mount reveals immediately, so the first
      // viewport is never animated in after the fact.
      const box = node.getBoundingClientRect()
      if (box.top < window.innerHeight * 0.9) node.classList.add('is-revealed')
      else io.observe(node)
    })

    return () => {
      io.disconnect()
      shell.classList.remove('flt-reveal-on')
    }
  }, [])

  return null
}
