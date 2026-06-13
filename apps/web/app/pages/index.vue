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

// Signed easing speed, in slide-units of remaining distance. Drives the
// velocity zoom so the stage breathes while the carousel is in motion.
const velocity = ref(0)

let raf = 0
let lastT = 0
function tick(now: number) {
  // Frame-rate independent exponential ease (≈ the old 0.12/frame at 60fps).
  const dt = lastT ? Math.min((now - lastT) / 1000, 0.05) : 1 / 60
  lastT = now
  const diff = target - progress.value
  if (Math.abs(diff) < 0.0004) {
    progress.value = target
    velocity.value = 0
    raf = 0
    return
  }
  progress.value += diff * (1 - Math.exp(-7.5 * dt))
  velocity.value = diff
  raf = requestAnimationFrame(tick)
}
function ensureTick() {
  if (!raf) {
    lastT = 0
    raf = requestAnimationFrame(tick)
  }
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

// Media counter-drifts against its slide's push and scales for depth, so the
// wipe reveals the image "in place" instead of dragging it. The 10% shift is
// exactly covered by the 22% overscan at |local| = 1, so edges never show.
function mediaStyle(i: number) {
  const local = clamp(ringDistance(i), -1, 1)
  return {
    transform: `translate3d(${(local * 10).toFixed(2)}%, 0, 0) scale(${(1 + Math.abs(local) * 0.22).toFixed(3)})`,
  }
}

// Off-center slides fall into shadow; the centered one is fully lit.
function dimStyle(i: number) {
  const local = clamp(ringDistance(i), -1, 1)
  return {opacity: (Math.abs(local) * 0.5).toFixed(3)}
}

// Stage breathes out slightly while the carousel is moving fast.
const stageStyle = computed(() => ({
  transform: `scale(${(1 + Math.min(Math.abs(velocity.value), 0.6) * 0.05).toFixed(4)})`,
}))

// Title rides the gesture: it drifts and fades continuously with scroll, while
// AnimatePresence swaps the chars at the midpoint where opacity bottoms out.
const titleStyle = computed(() => {
  const frac = progress.value - Math.round(progress.value)
  return {
    transform: `translate3d(0, ${(-frac * 70).toFixed(1)}px, 0)`,
    opacity: (1 - Math.min(Math.abs(frac) * 2.4, 1)).toFixed(3),
  }
})

const pad2 = (n: number) => String(n).padStart(2, '0')
const indexLabel = computed(() => pad2(currentIndex.value + 1))
const totalLabel = computed(() => pad2(count.value))

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

// Arrow keys step the carousel one slide at a time.
function onKeydown(e: KeyboardEvent) {
  if (count.value < 2) return
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
    target = Math.round(target) + 1
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
    target = Math.round(target) - 1
  } else {
    return
  }
  e.preventDefault()
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
  window.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  window.removeEventListener('resize', refresh)
  window.removeEventListener('keydown', onKeydown)
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
      <!-- Intro: stage opens from an inset crop while the preloader curtain lifts. -->
      <Motion
        as="div"
        class="absolute inset-0 will-change-[clip-path,transform]"
        :initial="{clipPath: 'inset(12% 6% 12% 6%)', scale: 1.08}"
        :animate="{clipPath: 'inset(0% 0% 0% 0%)', scale: 1}"
        :transition="{duration: 1.4, ease: [0.76, 0, 0.24, 1], delay: 1.05}"
      >
        <!-- Velocity zoom: the whole stage breathes while slides are in motion. -->
        <div class="absolute inset-0 will-change-transform" :style="stageStyle">
          <div
            v-for="(slide, i) in slideList"
            :key="slide._id"
            class="absolute inset-0 w-full h-full will-change-[clip-path,transform]"
            :style="slideStyle(i)"
          >
            <!-- Counter-parallax layer: media is revealed in place by the wipe. -->
            <div class="absolute inset-0 will-change-transform" :style="mediaStyle(i)">
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
            <!-- Depth dim: off-center slides fall into shadow. -->
            <div
              class="pointer-events-none absolute inset-0 bg-black"
              :style="dimStyle(i)"
            />
          </div>
        </div>
      </Motion>

      <!-- Title rides the gesture: continuous drift + fade driven by progress. -->
      <div
        class="absolute bottom-24 left-8 md:bottom-40 md:left-12 z-999 max-w-[85%] md:max-w-[60%] will-change-transform"
        :style="titleStyle"
      >
        <Motion
          as="div"
          :initial="{opacity: 0, y: 40}"
          :animate="{opacity: 1, y: 0}"
          :transition="{duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 1.35}"
        >
          <AnimatePresence mode="wait">
            <Motion
              :key="currentIndex"
              as="h1"
              class="font-medium lowercase text-left text-[3rem] md:text-[6rem] lg:text-[6.5rem] leading-[0.95] tracking-[-0.015em]"
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
            <!-- Accent: the last word drops to the regular weight for a soft contrast. -->
            <span
              v-for="(word, w) in titleWords"
              :key="`${currentIndex}-${w}`"
              class="inline-block mr-[0.25em] whitespace-nowrap"
              :class="w === titleWords.length - 1 && titleWords.length > 1 ? 'font-normal' : ''"
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
        </Motion>
      </div>

      <div
        ref="trackRef"
        class="absolute bottom-8 right-8 md:right-12 z-999 hidden md:block"
      >
        <Motion
          as="div"
          class="relative flex flex-row gap-2"
          :initial="{opacity: 0, y: 24}"
          :animate="{opacity: 1, y: 0}"
          :transition="{duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 1.5}"
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
          <div class="absolute inset-0 overflow-hidden rounded-lg">
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
            class="pointer-events-none absolute top-0 left-0 w-20 aspect-16/11 rounded-lg ring-1 ring-inset ring-white will-change-transform"
            :style="ringStyle"
          />
        </Motion>
      </div>

      <!-- Subtle scroll cue + rolling slide counter. -->
      <Motion
        as="div"
        class="pointer-events-none absolute bottom-10 left-8 md:left-12 z-999 flex flex-row items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-white/55 mix-blend-difference"
        :initial="{opacity: 0, y: 14}"
        :animate="{opacity: 1, y: 0}"
        :transition="{duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 1.6}"
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
        <span class="flex items-baseline gap-1 tabular-nums select-none">
          <SharedRollingValue :value="indexLabel" />
          <span class="opacity-50">— {{ totalLabel }}</span>
        </span>
      </Motion>
    </section>
  </div>
</template>
