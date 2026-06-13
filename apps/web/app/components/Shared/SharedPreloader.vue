<script setup lang="ts">
import { animate } from 'motion-v'

// Greeting words cycle while the site actually loads (fonts + window `load`),
// then the panel lifts away with the same curved edge as the page curtain.
const WORDS = ['Hello', 'Bonjour', 'Ciao', 'Olá', 'やあ', 'Hallå', 'Guten Tag', 'Hallo'] as const
const FIRST_HOLD = 750 // ms on the first word, so the open reads
const WORD_HOLD = 190 // ms per subsequent word
const RECHECK = 150 // ms between readiness checks once words run out
const MAX_CAP = 4500 // ms — never longer, in case an asset stalls

const EASE = [0.76, 0, 0.24, 1] as const

const isLoading = ref(true)
const wordIndex = ref(0)
const reducedMotion = ref(false)

const rootEl = ref<HTMLElement | null>(null)
const pathEl = ref<SVGPathElement | null>(null)
const contentEl = ref<HTMLElement | null>(null)

let wordTimer: ReturnType<typeof setTimeout> | null = null
let capTimer: ReturnType<typeof setTimeout> | null = null

function exit() {
  const root = rootEl.value
  const path = pathEl.value
  if (!root || !path || reducedMotion.value) {
    isLoading.value = false
    return
  }
  if (contentEl.value) {
    animate(
      contentEl.value,
      { opacity: 0, transform: 'translateY(-60px)' },
      { duration: 0.5, ease: EASE },
    )
  }
  // Lift: panel exits upward, trailing edge bowing behind it.
  animate(0, 1, {
    duration: 0.9,
    ease: EASE,
    delay: 0.15,
    onUpdate(p) {
      const bulge = Math.sin(Math.PI * p) * 100
      root.style.transform = `translateY(${-p * 100}%)`
      path.setAttribute('d', `M 0 0 Q 50 ${bulge} 100 0 Z`)
    },
  }).then(() => {
    isLoading.value = false
  })
}

onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Real readiness: fonts loaded + all initial subresources (window `load`).
  const loaded =
    document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise<void>((r) => window.addEventListener('load', () => r(), { once: true }))
  const ready = Promise.all([document.fonts?.ready ?? Promise.resolve(), loaded])

  let isReady = false
  ready.then(() => {
    isReady = true
  })
  capTimer = setTimeout(() => {
    isReady = true
  }, MAX_CAP)

  if (reducedMotion.value) {
    ready.finally(() => {
      wordTimer = setTimeout(exit, 250)
    })
    return
  }

  if (contentEl.value) {
    animate(
      contentEl.value,
      { opacity: [0, 1], transform: ['translateY(24px)', 'translateY(0px)'] },
      { duration: 0.6, ease: 'easeOut' },
    )
  }

  // The word cadence is the minimum on-screen time; readiness gates the exit.
  const next = () => {
    if (wordIndex.value < WORDS.length - 1) {
      wordIndex.value++
      wordTimer = setTimeout(next, WORD_HOLD)
    }
    else if (isReady) {
      exit()
    }
    else {
      // Hold the last word until the site is actually ready.
      wordTimer = setTimeout(next, RECHECK)
    }
  }
  wordTimer = setTimeout(next, FIRST_HOLD)
})

onUnmounted(() => {
  if (wordTimer) clearTimeout(wordTimer)
  if (capTimer) clearTimeout(capTimer)
})
</script>

<template>
  <div
    v-if="isLoading"
    ref="rootEl"
    class="fixed inset-0 z-70 will-change-transform"
  >
    <div class="absolute inset-0 bg-neutral-950" />
    <!-- Trailing curve below the panel, bows as it lifts away. -->
    <svg
      class="absolute inset-x-0 bottom-[calc(-25vh+1px)] h-[25vh] w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <path ref="pathEl" fill="#0a0a0a" d="M 0 0 Q 50 0 100 0 Z" />
    </svg>
    <div
      ref="contentEl"
      class="absolute inset-0 flex items-center justify-center opacity-0"
    >
      <p class="flex select-none items-center gap-4 font-hatton text-4xl text-white sm:text-5xl">
        <span class="inline-block size-2.5 rounded-full bg-white" />
        {{ WORDS[wordIndex] }}
      </p>
    </div>
  </div>
</template>
