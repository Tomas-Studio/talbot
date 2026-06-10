<script setup lang="ts">
import {AnimatePresence, Motion} from 'motion-v'

const appconfig = useAppConfig()
useSeoMeta({title: `${appconfig.title}`, titleTemplate: null})

const {data: slides} = await useSanityLiveQuery(categoriesQuery)

// Null-safe view of the fetched categories for templates + index math.
const slideList = computed(() => slides.value ?? [])
const count = computed(() => slideList.value.length)

const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max)

// Continuous position in "slide units". It just keeps accumulating from scroll
// input and is never reset — slides are drawn by their circular distance to it,
// so the carousel loops forever in both directions with no jump.
const progress = ref(0)
let target = 0

const currentIndex = computed(() => {
  const c = count.value
  if (c === 0) return 0
  return ((Math.round(progress.value) % c) + c) % c
})
const currentSlide = computed(() => slideList.value[currentIndex.value])
const titleWords = computed(() => currentSlide.value?.title.split(' ') ?? [])

// --- Scroll input -> target, eased into `progress`, snapped to a slide on idle.
const WHEEL_SENS = 0.003 // slide-units per unit of wheel delta
const TOUCH_SENS = 0.004 // slide-units per px dragged
const SNAP_DELAY = 140 // ms of stillness before settling on a slide

let raf = 0
function tick() {
  const diff = target - progress.value
  if (Math.abs(diff) < 0.0004) {
    progress.value = target
    raf = 0
    return
  }
  progress.value += diff * 0.12
  raf = requestAnimationFrame(tick)
}
function ensureTick() {
  if (!raf) raf = requestAnimationFrame(tick)
}

let snapTimer: ReturnType<typeof setTimeout> | null = null
function scheduleSnap() {
  if (snapTimer) clearTimeout(snapTimer)
  snapTimer = setTimeout(() => {
    target = Math.round(target)
    ensureTick()
  }, SNAP_DELAY)
}

function onWheel(e: WheelEvent) {
  if (count.value < 2) return
  target += e.deltaY * WHEEL_SENS
  ensureTick()
  scheduleSnap()
}

let touchY = 0
function onTouchStart(e: TouchEvent) {
  touchY = e.touches[0]!.clientY
  if (snapTimer) clearTimeout(snapTimer)
}
function onTouchMove(e: TouchEvent) {
  if (count.value < 2) return
  const y = e.touches[0]!.clientY
  target += (touchY - y) * TOUCH_SENS
  touchY = y
  ensureTick()
}
function onTouchEnd() {
  scheduleSnap()
}

// Horizontal travel distance of the push, in px.
const offset = ref(500)
function updateOffset() {
  if (typeof window === 'undefined') return
  offset.value = window.innerWidth < 1000 ? 100 : 500
}

// Shortest signed distance from this slide to the centered one, in [-c/2, c/2].
//  d < 0 : upcoming slide, wiping in from the right edge
//  d = 0 : centered / fully revealed
//  d > 0 : outgoing slide, translating off to the left
function ringDistance(i: number) {
  const c = count.value || 1
  let d = progress.value - i
  d -= c * Math.round(d / c)
  return d
}

// Each slide pushes horizontally while a clip-path wipes it in/out.
function slideStyle(i: number) {
  const c = count.value || 1
  const d = ringDistance(i)
  const local = clamp(d, -1, 1)
  const x = -local * offset.value
  const left = local < 0 ? -local * 100 : 0
  // Nearest slides sit on top; the incoming one (d<0) wins over the outgoing.
  const z = Math.round((c - Math.abs(d)) * 10) + (d < 0 ? 1 : 0)
  return {
    transform: `translate3d(${x}px, 0, 0)`,
    clipPath: `polygon(${left}% 0%, 100% 0%, 100% 100%, ${left}% 100%)`,
    zIndex: z,
  }
}

// Pagination ring glides along the thumbnail row as you scroll.
const trackRef = ref<HTMLElement | null>(null)
const step = ref(0)
function updateStep() {
  const btns = trackRef.value?.querySelectorAll<HTMLElement>('[data-thumb]')
  if (btns && btns.length > 1) step.value = btns[1]!.offsetLeft - btns[0]!.offsetLeft
}
const ringStyle = computed(() => {
  const c = count.value || 1
  const pos = ((progress.value % c) + c) % c
  return {
    transform: `translate3d(${clamp(pos, 0, Math.max(c - 1, 0)) * step.value}px, 0, 0)`,
  }
})

// Click a thumbnail -> ease to the nearest copy of that slide.
function goTo(i: number) {
  const c = count.value
  if (c < 1) return
  let delta = i - target
  delta -= c * Math.round(delta / c)
  target += delta
  ensureTick()
}

function refresh() {
  updateOffset()
  updateStep()
}

// Re-measure once the thumbnails are actually laid out, and again whenever the
// (live-queried) slide set changes — otherwise `step` stays 0 and the ring
// never moves.
watch(count, () => nextTick(refresh))

onMounted(async () => {
  await nextTick()
  refresh()
  window.addEventListener('resize', refresh, {passive: true})
})
onUnmounted(() => {
  window.removeEventListener('resize', refresh)
  if (raf) cancelAnimationFrame(raf)
  if (snapTimer) clearTimeout(snapTimer)
})
</script>

<template>
  <div
    class="relative isolate h-svh w-full overflow-hidden bg-black text-white touch-none"
    @wheel.prevent="onWheel"
    @touchstart.passive="onTouchStart"
    @touchmove.prevent="onTouchMove"
    @touchend.passive="onTouchEnd"
  >
    <section class="relative h-svh w-full overflow-hidden">
      <div
        v-for="(slide, i) in slideList"
        :key="slide._id"
        class="absolute inset-0 w-full h-full will-change-[clip-path,transform]"
        :style="slideStyle(i)"
      >
        <SanityFile
          v-if="slide.showcaseMedia.type === 'video' && slide.showcaseMedia.video?.ref"
          v-slot="{src}"
          :asset-id="slide.showcaseMedia.video.ref"
        >
          <video
            :src="src"
            autoplay
            muted
            loop
            playsinline
            class="w-full h-full object-cover select-none"
          />
        </SanityFile>
        <SanityImage
          v-else-if="slide.showcaseMedia.image?.ref"
          :asset-id="slide.showcaseMedia.image.ref"
          :alt="slide.showcaseMedia.image.alt ?? slide.title"
          :placeholder="slide.showcaseMedia.image.asset?.metadata?.lqip ?? undefined"
          auto="format"
          fit="crop"
          draggable="false"
          class="w-full h-full object-cover select-none"
        />
      </div>

      <AnimatePresence mode="wait">
        <Motion
          :key="currentIndex"
          as="h1"
          class="font-bold absolute bottom-24 left-8 md:bottom-40 md:left-12 z-999 text-left text-[3rem] md:text-[6rem] lg:text-[6.5rem] leading-[0.85] tracking-[-0.02em] max-w-[85%] md:max-w-[60%]"
          initial="hidden"
          animate="visible"
          exit="hidden"
          :variants="{
            hidden: {transition: {staggerChildren: 0.03, staggerDirection: -1}},
            visible: {transition: {staggerChildren: 0.06, delayChildren: 0.05}},
          }"
        >
          <NuxtLink
            :to="{ name: 'projects', query: { category: currentSlide?.slug } }"
            class="group relative inline-block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:translate-x-3"
          >
            <span
              v-for="(word, w) in titleWords"
              :key="`${currentIndex}-${w}`"
              class="inline-block mr-[0.25em] whitespace-nowrap"
            >
              <Motion
                v-for="(char, c) in word.split('')"
                :key="`${currentIndex}-${w}-${c}`"
                as="span"
                class="inline-block origin-bottom-left will-change-transform"
                :variants="{
                  hidden: {x: '0.5em', opacity: 0},
                  visible: {x: 0, rotate: 0, opacity: 1},
                }"
                :transition="{type: 'spring', stiffness: 90, damping: 16, mass: 1}"
              >
                {{ char }}
              </Motion>
            </span>
            <!-- Hover affordance: a mono "View ↗" cue slides in above the title. -->
            <span
              aria-hidden="true"
              class="pointer-events-none absolute -top-6 left-0 flex -translate-y-1 items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.25em] opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-70"
            >
              View
              <span class="inline-block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:-translate-y-0.5">↗</span>
            </span>
          </NuxtLink>
        </Motion>
      </AnimatePresence>

      <div
        ref="trackRef"
        class="absolute bottom-8 right-8 md:right-12 z-999 hidden md:flex flex-row gap-2"
      >
        <button
          v-for="(slide, i) in slideList"
          :key="slide._id"
          data-thumb
          type="button"
          class="group relative w-20 aspect-16/11 cursor-pointer transition-opacity duration-500 ease-out"
          :class="i === currentIndex ? 'opacity-100' : 'opacity-40 hover:opacity-70'"
          :aria-label="`Go to ${slide.title}`"
          :aria-current="i === currentIndex"
          @click="goTo(i)"
        >
          <div class="absolute inset-0 overflow-hidden rounded-xl">
            <SanityFile
              v-if="slide.showcaseMedia.type === 'video' && slide.showcaseMedia.video?.ref"
              v-slot="{src}"
              :asset-id="slide.showcaseMedia.video.ref"
            >
              <video
                :src="src"
                autoplay
                muted
                loop
                playsinline
                class="w-full h-full object-cover select-none"
              />
            </SanityFile>
            <SanityImage
              v-else-if="slide.showcaseMedia.image?.ref"
              :asset-id="slide.showcaseMedia.image.ref"
              :alt="slide.showcaseMedia.image.alt ?? slide.title"
              :placeholder="slide.showcaseMedia.image.asset?.metadata?.lqip ?? undefined"
              auto="format"
              fit="crop"
              draggable="false"
              class="w-full h-full object-cover select-none"
            />
          </div>
        </button>
        <span
          class="pointer-events-none absolute top-0 left-0 w-20 aspect-16/11 rounded-xl ring-2 ring-inset ring-white will-change-transform"
          :style="ringStyle"
        />
      </div>

      <!-- Subtle scroll cue. -->
      <div
        class="pointer-events-none absolute bottom-10 left-8 md:left-12 z-999 flex flex-row items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-white/55 mix-blend-difference"
      >
        <span class="select-none">Scroll</span>
        <span class="relative block h-px w-12 overflow-hidden bg-white/20">
          <Motion
            as="span"
            class="absolute left-0 top-0 block h-px w-3 bg-white"
            :animate="{x: [-12, 48]}"
            :transition="{duration: 1.6, repeat: Infinity, ease: 'easeInOut'}"
          />
        </span>
      </div>
    </section>
  </div>
</template>
