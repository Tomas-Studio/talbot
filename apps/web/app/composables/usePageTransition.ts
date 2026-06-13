import { animate } from 'motion-v'
import type { TransitionProps } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

// Curved-curtain navigation: a dark panel sweeps up from the bottom of the
// screen with a bulging leading edge, names the destination while the pages
// swap underneath it, then continues upward — its trailing edge bowing — to
// reveal the new page. Panel position and curve are driven from one progress
// value so they never drift apart.
const curtainEl = ref<HTMLElement | null>(null)
const coverPathEl = ref<SVGPathElement | null>(null)
const revealPathEl = ref<SVGPathElement | null>(null)
const labelEl = ref<HTMLElement | null>(null)
const label = ref('')

const EASE = [0.76, 0, 0.24, 1] as const
const COVER_DURATION = 0.8
const REVEAL_DURATION = 0.9
const HOLD = 160 // ms at full cover, so the label registers

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function routeLabel(route: RouteLocationNormalizedLoaded) {
  const slug = route.params.slug
  if (typeof slug === 'string' && slug) return slug.replace(/-/g, ' ')
  const name = String(route.name ?? '')
  if (name === HOME) return 'Home'
  return name.replace(/-/g, ' ') || 'Home'
}

export function usePageTransition() {
  const router = useRouter()

  const transition: TransitionProps = {
    mode: 'out-in',
    css: false,
    onLeave(_el, done) {
      const curtain = curtainEl.value
      const path = coverPathEl.value
      const text = labelEl.value
      if (!curtain || !path || !text || prefersReducedMotion()) return done()
      // The route has already committed by now, so this is the destination.
      label.value = routeLabel(router.currentRoute.value)
      animate(
        text,
        { opacity: [0, 1], transform: ['translateY(40px)', 'translateY(0px)'] },
        { duration: 0.5, delay: 0.3, ease: 'easeOut' },
      )
      // Cover: panel rises, leading edge bulges mid-flight and lands flat.
      animate(0, 1, {
        duration: COVER_DURATION,
        ease: EASE,
        onUpdate(p) {
          const bulge = Math.sin(Math.PI * p) * 100
          curtain.style.transform = `translateY(${(1 - p) * 100}%)`
          path.setAttribute('d', `M 0 100 Q 50 ${100 - bulge} 100 100 Z`)
        },
      }).then(() => setTimeout(done, HOLD))
    },
    onEnter(_el, done) {
      const curtain = curtainEl.value
      const path = revealPathEl.value
      const text = labelEl.value
      if (!curtain || !path || !text || prefersReducedMotion()) return done()
      // New page is mounted under full cover — reset scroll while hidden.
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      animate(
        text,
        { opacity: 0, transform: 'translateY(-40px)' },
        { duration: 0.35, ease: 'easeIn' },
      )
      // Reveal: panel exits upward, trailing edge bowing behind it.
      animate(0, 1, {
        duration: REVEAL_DURATION,
        ease: EASE,
        onUpdate(p) {
          const bulge = Math.sin(Math.PI * p) * 100
          curtain.style.transform = `translateY(${-p * 100}%)`
          path.setAttribute('d', `M 0 0 Q 50 ${bulge} 100 0 Z`)
        },
      }).then(() => {
        // Park offscreen below, ready for the next cover.
        curtain.style.transform = 'translateY(100%)'
        path.setAttribute('d', 'M 0 0 Q 50 0 100 0 Z')
        done()
      })
    },
  }

  return { curtainEl, coverPathEl, revealPathEl, labelEl, label, transition }
}
