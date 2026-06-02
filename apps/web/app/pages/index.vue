<script setup lang="ts">
import {AnimatePresence, Motion} from 'motion-v'

const appconfig = useAppConfig()
useSeoMeta({title: `${appconfig.title}`, titleTemplate: null})

// const {data: _site} = await useSanityLiveQuery(siteSettingsQuery)

/**
 * Carousel slides. Hardcoded for now to mirror the reference. Swap to a
 * Sanity-driven query (service-offerings doc type) when that schema lands.
 */
const slides = [
  {title: 'Websites', image: '/carousel/slide-img-1.jpg'},
  {title: 'Mobile Applications', image: '/carousel/slide-img-2.jpg'},
  {title: 'Branding', image: '/carousel/slide-img-3.jpg'},
  {title: 'Motion Design', image: '/carousel/slide-img-4.jpg'},
  {title: 'Logos', image: '/carousel/slide-img-5.jpg'},
  {title: 'Video Editing', image: '/carousel/slide-img-3.jpg'},
]

const currentIndex = ref(0)
const direction = ref<1 | -1>(1)
const isAnimating = ref(false)

/**
 * The #blur-matrix SVG filter gives the title its inky reveal, but it
 * thresholds alpha — leaving crunchy, aliased edges once the words settle.
 * We apply it only *during* the reveal, then drop it on completion so the
 * final text renders with the browser's normal anti-aliasing. Resets to
 * false on every slide change (watch below) and flips true when the title's
 * blur-in finishes (@animation-complete on the parent <h1>).
 */
const titleSettled = ref(false)
watch(currentIndex, () => {
  titleSettled.value = false
})

const currentSlide = computed(() => slides[currentIndex.value]!)
const titleWords = computed(() => currentSlide.value.title.split(' '))

/**
 * `offset` matches the GSAP reference: 500px desktop / 100px mobile. It
 * controls how far the outgoing image translates and how far the incoming
 * image starts from. Recomputed on resize, same as the original.
 */
const offset = ref(500)
function updateOffset() {
  offset.value = window.innerWidth < 1000 ? 100 : 500
}

/**
 * Autoplay: advance every `autoplayMs`. Manual clicks reset the timer so
 * a user interaction always gets a full window before the next auto-advance.
 * Doesn't pause on hover — the carousel keeps moving while the cursor sits
 * over it. The `isAnimating` guard prevents a tick from firing mid-transition.
 */
const autoplayMs = 7000
let autoplayTimer: ReturnType<typeof setInterval> | null = null

function startAutoplay() {
  stopAutoplay()
  autoplayTimer = setInterval(() => {
    if (!isAnimating.value) go(1)
  }, autoplayMs)
}
function stopAutoplay() {
  if (autoplayTimer) clearInterval(autoplayTimer)
  autoplayTimer = null
}

function go(dir: 1 | -1) {
  if (isAnimating.value) return
  isAnimating.value = true
  direction.value = dir
  currentIndex.value
    = (currentIndex.value + dir + slides.length) % slides.length
  // Reset autoplay clock on any nav so manual interaction wins.
  startAutoplay()
}

onMounted(() => {
  updateOffset()
  window.addEventListener('resize', updateOffset, {passive: true})
  startAutoplay()
})
onUnmounted(() => {
  window.removeEventListener('resize', updateOffset)
  stopAutoplay()
})

/**
 * GSAP's "hop" CustomEase is a multi-segment bezier that snaps to target
 * by ~50% progress and holds. The closest single cubic-bezier approximation
 * is the "expoOut" curve [0.16, 1, 0.3, 1] — snappy initial movement,
 * smooth deceleration, no overshoot. Same feel without the GSAP dep.
 */
const hop = [0.16, 1, 0.3, 1] as const
const imageDuration = 1.5

const imageVariants = {
  enter: (dir: 1 | -1) => ({
    x: dir === 1 ? offset.value : -offset.value,
    clipPath:
      dir === 1
        ? 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)'
        : 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
  }),
  center: {
    x: 0,
    clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  },
  exit: (dir: 1 | -1) => ({
    x: dir === 1 ? -offset.value : offset.value,
    // Exit keeps the full clip — only the outgoing image translates away.
    clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  }),
}
</script>

<template>
  <div class="bg-black text-white">
    <section class="relative w-full h-svh overflow-hidden">
      <!--
        mode="sync" so the outgoing and incoming images animate concurrently
        (the reference shows both moving at the same time). Custom prop
        threads `direction` through to the enter/exit variant fns.
      -->
      <AnimatePresence
        :custom="direction"
        mode="sync"
        @exit-complete="isAnimating = false"
      >
        <Motion
          :key="currentIndex"
          as="div"
          class="absolute inset-0 w-full h-full will-change-[clip-path,transform]"
          :custom="direction"
          :variants="imageVariants"
          initial="enter"
          animate="center"
          exit="exit"
          :transition="{duration: imageDuration, ease: hop}"
        >
          <img
            :src="currentSlide.image"
            alt=""
            draggable="false"
            class="relative w-full h-full object-cover select-none will-change-transform"
          >
        </Motion>
      </AnimatePresence>

      <!--
        Title in the bottom-left. Each <h1> is absolutely positioned so the
        outgoing and incoming titles stack in the same spot during the sync
        crossfade — no layout shift / left-to-right jump. The small
        delayChildren on `visible` gives the outgoing title a head start
        on its blur-out so the two reveals don't visually fight.
      -->
      <AnimatePresence mode="sync">
        <Motion
          :key="currentIndex"
          as="h1"
          class="font-acorn absolute top-7/10 left-8 md:left-12 lg:left-25 z-2 pointer-events-none uppercase text-left text-[2.25rem] md:text-[4rem] leading-[0.85] max-w-[80%] md:max-w-[40%]"
          :class="titleSettled ? 'title-smooth' : 'title-blur'"
          initial="hidden"
          animate="visible"
          exit="hidden"
          :variants="{
            hidden: {transition: {staggerChildren: 0.03, staggerDirection: -1}},
            visible: {transition: {staggerChildren: 0.05, delayChildren: 0.15}},
          }"
          @animation-complete="(def: unknown) => { if (def === 'visible') titleSettled = true }"
        >
          <Motion
            v-for="(word, i) in titleWords"
            :key="`${currentIndex}-${i}`"
            as="span"
            class="inline-block mr-[0.3em] will-change-[filter,opacity]"
            :variants="{
              hidden: {opacity: 0, filter: 'blur(75px)'},
              visible: {opacity: 1, filter: 'blur(0px)'},
            }"
            :transition="{
              duration: 1.5,
              ease: [0.215, 0.61, 0.355, 1],
            }"
          >
            {{ word }}
          </Motion>
        </Motion>
      </AnimatePresence>

      <!--
        Vertical slide progress bar on the left edge. One segment per slide:
        past = solid white, current = animates 0→1 over the autoplay window,
        future = faint track. Keyed on currentIndex so the active fill
        re-mounts and restarts on every slide change (including manual nav,
        which keeps the on-screen progress in sync with the autoplay timer).
      -->
      <div
        class="pointer-events-none absolute right-6 md:right-10 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2 h-[50vh] w-0.5"
        aria-hidden="true"
      >
        <div
          v-for="(_, i) in slides"
          :key="i"
          class="relative flex-1 w-full bg-white/20 overflow-hidden"
        >
          <div
            v-if="i < currentIndex"
            class="absolute inset-0 bg-white"
          />
          <Motion
            v-else-if="i === currentIndex"
            :key="`progress-${currentIndex}`"
            as="div"
            class="absolute inset-0 bg-white origin-top"
            :initial="{scaleY: 0}"
            :animate="{scaleY: 1}"
            :transition="{duration: autoplayMs / 1000, ease: 'linear'}"
          />
        </div>
      </div>

      <!--
        Controls. On desktop they span the full edges; on mobile the
        original collapses them into a centered pair below the title.
      -->
      <div
        class="absolute z-10 flex flex-col gap-8 right-20
               max-md:top-[65%]  max-md:-translate-y-1/2 max-md:w-1/2 max-sm:justify-center
               md:top-5/10 max-sm:w-full md:justify-between"
      >
        <button
          type="button"
          class="control-btn"
          aria-label="Previous slide"
          @click="go(-1)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="size-4 md:size-8" viewBox="0 0 24 24">
            <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"><path d="M4 6v12"/><path stroke-linejoin="round" d="M8 12h12m-8-4s-4 2.946-4 4s4 4 4 4"/>
            </g>
          </svg>
        </button>
        <button
          type="button"
          class="control-btn"
          aria-label="Next slide"
          @click="go(1)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="size-4 md:size-8" viewBox="0 0 24 24">
            <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5">
              <path d="M20 18V6"/><path stroke-linejoin="round" d="M16 12H4m8-4s4 2.946 4 4s-4 4-4 4"/>
            </g>
          </svg>
        </button>
      </div>
    </section>

    <!-- SVG matrix filter that stylises the blur (sharper "ink" look than
         a plain CSS blur). Identical to the reference. -->
    <svg
      viewBox="0 0 0 0"
      aria-hidden="true"
      class="absolute -z-10 opacity-0"
    >
      <defs>
        <filter id="blur-matrix">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 255 -140"
          />
        </filter>
      </defs>
    </svg>
  </div>
</template>

<style scoped>
/* During the reveal: the SVG matrix filter thresholds alpha to give the
   title an inky, gooey bleed as each word un-blurs. The downside is it
   leaves hard, aliased edges, so we only keep it on while animating. */
.title-blur {
  filter: url(#blur-matrix) blur(0.25px);
  -webkit-filter: url(#blur-matrix) blur(0.25px);
}

/* After the reveal: drop the SVG filter so the settled text falls back to
   the browser's normal anti-aliasing — smooth edges. The short opacity
   transition hides the one-frame swap between filtered/unfiltered rendering
   so there's no visible "pop". */
.title-smooth {
  filter: none;
  -webkit-filter: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  transition: filter 200ms ease-out;
}
</style>
