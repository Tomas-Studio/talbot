<script setup lang="ts">
import {AnimatePresence, Motion} from 'motion-v'

const appconfig = useAppConfig()
useSeoMeta({title: `${appconfig.title}`, titleTemplate: null})

const {data: slides} = await useSanityLiveQuery(categoriesQuery)

// console.log(slides.value)

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

// Null-safe view of the fetched categories for templates + index math.
const slideList = computed(() => slides.value ?? [])
const currentSlide = computed(() => slideList.value[currentIndex.value])
const titleWords = computed(() => currentSlide.value?.title.split(' ') ?? [])

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
const autoplayMs = 10000
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
  const count = slideList.value.length
  if (isAnimating.value || count === 0) return
  isAnimating.value = true
  direction.value = dir
  currentIndex.value = (currentIndex.value + dir + count) % count
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
  <div class="relative bg-black text-white overflow-hidden">
    <section class="relative w-full h-svh overflow-hidden">

      <AnimatePresence
        :custom="direction"
        mode="sync"
        @exit-complete="isAnimating = false"
      >
        <Motion
          v-if="currentSlide"
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
          <SanityFile
            v-if="currentSlide.showcaseMedia.type === 'video' && currentSlide.showcaseMedia.video?.ref"
            v-slot="{src}"
            :asset-id="currentSlide.showcaseMedia.video.ref"
          >
            <video
              :src="src"
              autoplay
              muted
              loop
              playsinline
              class="relative w-full h-full object-cover select-none will-change-transform"
            />
          </SanityFile>
          <SanityImage
            v-else-if="currentSlide.showcaseMedia.image?.ref"
            :asset-id="currentSlide.showcaseMedia.image.ref"
            :alt="currentSlide.showcaseMedia.image.alt ?? currentSlide.title"
            :placeholder="currentSlide.showcaseMedia.image.asset?.metadata?.lqip ?? undefined"
            auto="format"
            fit="crop"
            draggable="false"
            class="relative w-full h-full object-cover select-none will-change-transform"
          />
        </Motion>
      </AnimatePresence>

      <AnimatePresence mode="sync">
        <Motion
          :key="currentIndex"
          as="h1"
          class="font-sans font-bold absolute top-7/10 left-8 md:left-16 z-2 pointer-events-none uppercase text-left text-[2.25rem] md:text-[4rem] leading-[0.85] max-w-[80%] md:max-w-[40%]"
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

      <div
        class="pointer-events-none absolute right-6 md:right-16 top-1/5 z-10 flex flex-col gap-2 h-[40vh] w-0.5"
        aria-hidden="true"
      >
        <div
          v-for="(_, i) in slideList"
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

      <!-- <div
        class="absolute z-10 flex gap-8 right-16
               max-md:top-[65%]  max-md:-translate-y-1/2 max-md:w-1/2 max-sm:justify-center
               md:top-[68%] max-sm:w-full md:justify-between"
      >
        <button
          type="button"
          class="control-btn relative flex items-center justify-center cursor-pointer overflow-hidden size-12 md:size-17 text-white border border-white/75 rounded-full transition-colors duration-300 ease-out hover:text-black"
          aria-label="Previous slide"
          @click="go(-1)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="size-4 md:size-6 relative z-1" viewBox="0 0 24 24">
            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5.5 12.002H19m-8 6s-6-4.419-6-6s6-6 6-6"/>
          </svg>
        </button>
        <button
          type="button"
          class="control-btn relative flex items-center justify-center cursor-pointer overflow-hidden size-12 md:size-17 text-white border border-white/75 rounded-full transition-colors duration-300 ease-out hover:text-black"
          aria-label="Next slide"
          @click="go(1)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="size-4 md:size-6 relative z-1" viewBox="0 0 24 24">
            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18.5 12H5m8 6s6-4.419 6-6s-6-6-6-6"/>
          </svg>
        </button>
      </div> -->
    </section>

    <svg
      viewBox="0 0 0 0"
      aria-hidden="true"
      class="absolute top-0 left-0 h-0 w-0 overflow-hidden -z-10 opacity-0"
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
.control-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: #fff;
  z-index: 0;
  clip-path: polygon(0 0, 0 0, 0 0);
  transition: clip-path 450ms cubic-bezier(0.16, 1, 0.3, 1);
}

.control-btn:hover::before {
  clip-path: polygon(0 0, 200% 0, 0 200%);
}

.title-blur {
  filter: url(#blur-matrix) blur(0.25px);
  -webkit-filter: url(#blur-matrix) blur(0.25px);
}

.title-smooth {
  filter: none;
  -webkit-filter: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  transition: filter 200ms ease-out;
}
</style>
