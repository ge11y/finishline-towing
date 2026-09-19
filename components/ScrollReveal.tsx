'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

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
 *
 * Re-arms on pathname change, popstate, and pageshow (including
 * persisted / bfcache). The observer used to mount once on the layout shell;
 * after /site → service → Back the new nodes sat under `flt-reveal-on`
 * without `is-revealed`, so the mid-page dark strip painted empty.
 */
const TARGETS = '.hs-why, .hs-row, .hs-review'

function restartCssAnimations(root: Element) {
  const nodes = root.querySelectorAll<HTMLElement>('[data-restart-animation]')
  nodes.forEach((node) => {
    const previous = node.style.animation
    node.style.animation = 'none'
    void node.offsetWidth
    node.style.animation = previous
  })
}

function armReveal() {
  const shell = document.querySelector('.factory-public-shell')
  if (!shell) return () => {}
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    shell.classList.remove('flt-reveal-on')
    restartCssAnimations(shell)
    return () => {}
  }
  if (typeof IntersectionObserver === 'undefined') {
    restartCssAnimations(shell)
    return () => {}
  }

  const nodes = Array.from(shell.querySelectorAll<HTMLElement>(TARGETS))
  if (!nodes.length) {
    shell.classList.remove('flt-reveal-on')
    restartCssAnimations(shell)
    return () => {}
  }

  shell.classList.add('flt-reveal-on')

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-revealed')
        io.unobserve(entry.target)
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
  )

  nodes.forEach((node) => {
    const box = node.getBoundingClientRect()
    if (box.top < window.innerHeight * 0.9 && box.bottom > 0) {
      node.classList.add('is-revealed')
    } else {
      io.observe(node)
    }
  })

  restartCssAnimations(shell)

  return () => {
    io.disconnect()
    shell.classList.remove('flt-reveal-on')
    nodes.forEach((node) => node.classList.remove('is-revealed'))
  }
}

export function ScrollReveal() {
  const pathname = usePathname()

  useEffect(() => {
    let cleanup = armReveal()

    const rearm = () => {
      cleanup()
      cleanup = armReveal()
    }

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        requestAnimationFrame(rearm)
      }
    }
    const onPopState = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(rearm)
      })
    }

    window.addEventListener('pageshow', onPageShow)
    window.addEventListener('popstate', onPopState)

    return () => {
      cleanup()
      window.removeEventListener('pageshow', onPageShow)
      window.removeEventListener('popstate', onPopState)
    }
  }, [pathname])

  return null
}
