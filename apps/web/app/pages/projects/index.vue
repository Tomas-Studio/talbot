<script setup lang="ts">
import {AnimatePresence, Motion, useScroll, useTransform} from 'motion-v'

const route = useRoute()
const router = useRouter()

const {data: categories} = await useSanityQuery(categoriesWithProjectsQuery)

const chapters = computed(() => (categories.value ?? []).filter((c) => c.projects?.length))
const totalProjects = computed(() =>
  chapters.value.reduce((n, c) => n + (c.projects?.length ?? 0), 0),
)

const pad = (n: number) => String(n).padStart(2, '0')

const activeChapter = ref(-1)
const ghostLabel = computed(() => pad(Math.max(activeChapter.value, 0) + 1))

const heroEl = ref<HTMLElement | null>(null)
const chapterEls = ref<HTMLElement[]>([])

let observer: IntersectionObserver | undefined
onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting)
          activeChapter.value = Number((entry.target as HTMLElement).dataset.chapter)
      }
    },
    {rootMargin: '-45% 0px -50% 0px'},
  )
  if (heroEl.value) observer.observe(heroEl.value)
  chapterEls.value.forEach((el) => el && observer!.observe(el))

  const slug = route.query.category
  if (typeof slug === 'string')
    nextTick(() => document.getElementById(slug)?.scrollIntoView({behavior: 'smooth'}))
})
onUnmounted(() => observer?.disconnect())

watch(activeChapter, (ci) => {
  const query = {...route.query}
  if (ci >= 0 && chapters.value[ci]) query.category = chapters.value[ci].slug
  else delete query.category
  router.replace({query})
})

const scrollToChapter = (slug: string) =>
  document.getElementById(slug)?.scrollIntoView({behavior: 'smooth'})

const {scrollYProgress} = useScroll({
  target: heroEl,
  offset: ['start start', 'end start'],
})
const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '45%'])
const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0])

const heroWords = ['selected', 'works']

const splitWords = (title: string) => title.split(' ')

useSeoMeta({title: 'Projects'})
</script>

<template>
  <section>
    <div
      aria-hidden="true"
      class="pointer-events-none fixed inset-0 z-0 flex items-center justify-center select-none"
    >
      <AnimatePresence mode="popLayout">
        <Motion
          v-if="activeChapter >= 0"
          :key="ghostLabel"
          as="span"
          class="block font-hatton leading-none text-neutral-900/5 text-[clamp(16rem,46vw,42rem)] will-change-transform"
          :initial="{opacity: 0, y: 120}"
          :animate="{opacity: 1, y: 0}"
          :exit="{opacity: 0, y: -120}"
          :transition="{type: 'spring', duration: 1, bounce: 0}"
        >
          {{ ghostLabel }}
        </Motion>
      </AnimatePresence>
    </div>

    <div
      ref="heroEl"
      data-chapter="-1"
      class="relative z-10 flex h-svh flex-col px-4 sm:px-8 md:px-12 pt-20 sm:pt-28 pb-6"
    >
      <Motion
        as="div"
        class="flex items-baseline justify-between font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-neutral-900/60"
        :initial="{opacity: 0, y: 14}"
        :animate="{opacity: 1, y: 0}"
        :transition="{duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.4}"
      >
        <span class="select-none font-hatton-italic normal-case tracking-[0.04em] text-sm sm:text-base text-neutral-900/70">Selected Work</span>
        <span class="flex items-baseline gap-1.5 tabular-nums">
          ( {{ pad(totalProjects) }} )
          <span>Projects</span>
        </span>
      </Motion>

      <div class="flex-auto" />

      <Motion
        as="div"
        class="flex flex-col items-center text-center will-change-transform"
        :style="{y: heroY, opacity: heroOpacity}"
      >
        <h1 class="font-medium lowercase leading-[0.98] tracking-[-0.015em] text-[clamp(3rem,10vw,9.5rem)]">
          <!-- pt/pb + negative margins give caps and descenders headroom inside the overflow mask. -->
          <span
            v-for="(word, w) in heroWords"
            :key="word"
            class="inline-block overflow-hidden align-bottom whitespace-nowrap mr-[0.18em] pt-[0.12em] mt-[-0.12em] pb-[0.12em] mb-[-0.12em]"
            :class="w === heroWords.length - 1 ? 'font-hatton-italic normal-case font-normal' : ''"
          >
            <Motion
              v-for="(char, c) in word.split('')"
              :key="`${w}-${c}`"
              as="span"
              class="inline-block origin-bottom-left will-change-transform"
              :initial="{y: '110%', rotate: 4}"
              :animate="{y: '0%', rotate: 0}"
              :transition="{type: 'spring', duration: 0.8, bounce: 0.18, delay: 0.15 + (w * 8 + c) * 0.03}"
            >
              {{ char }}
            </Motion>
          </span>
        </h1>
        <Motion
          as="span"
          class="mt-5 sm:mt-7 font-hatton-italic text-base sm:text-xl text-neutral-900/60 tabular-nums"
          :initial="{opacity: 0, y: 12}"
          :animate="{opacity: 1, y: 0}"
          :transition="{duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.7}"
        >
          ( {{ pad(totalProjects) }} ) projects
        </Motion>
        <Motion
          as="span"
          class="mt-8 font-mono text-[9px] uppercase tracking-[0.3em] text-neutral-900/40"
          :initial="{opacity: 0}"
          :animate="{opacity: 1, y: [0, 6, 0]}"
          :transition="{
            opacity: {duration: 0.8, delay: 1.1},
            y: {duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 1.1},
          }"
        >
          ( scroll )
        </Motion>
      </Motion>

      <div class="flex-auto" />

      <div>
        <Motion
          as="span"
          class="block h-px origin-center bg-neutral-900/15"
          :initial="{scaleX: 0}"
          :animate="{scaleX: 1}"
          :transition="{duration: 1, ease: [0.76, 0, 0.24, 1], delay: 0.5}"
        />
        <div class="flex justify-center pt-4 pb-2">
          <Motion
            as="nav"
            class="flex flex-wrap justify-center gap-x-6 sm:gap-x-8 gap-y-1"
            initial="hidden"
            animate="visible"
            :variants="{
              hidden: {},
              visible: {transition: {staggerChildren: 0.06, delayChildren: 0.55}},
            }"
          >
            <Motion
              v-for="(chapter, ci) in chapters"
              :key="chapter.slug"
              as="button"
              type="button"
              class="group relative cursor-pointer py-1.5 sm:text-lg lg:text-xl capitalize transition-opacity duration-300 ease-out"
              :class="activeChapter === ci ? 'opacity-100' : 'opacity-40 hover:opacity-70'"
              :variants="{hidden: {opacity: 0, y: 16}, visible: {opacity: 1, y: 0}}"
              :transition="{duration: 0.6, ease: [0.16, 1, 0.3, 1]}"
              @click="scrollToChapter(chapter.slug!)"
            >
              <sup class="mr-1 font-mono text-[9px] tracking-widest opacity-60">{{ pad(ci + 1) }}</sup>
              {{ chapter.title }}
            </Motion>
          </Motion>
        </div>
      </div>
    </div>

    <section
      v-for="(chapter, ci) in chapters"
      :id="chapter.slug!"
      :key="chapter._id"
      ref="chapterEls"
      :data-chapter="ci"
      class="relative z-10 border-t border-neutral-900/10 px-4 sm:px-8 md:px-12 py-16 sm:py-28"
    >
      <div class="grid grid-cols-12 gap-x-4 sm:gap-x-8">
        <header class="col-span-12 mb-12 sm:col-span-4 sm:mb-0">
          <div class="flex flex-col items-start gap-3 sm:sticky sm:top-28 sm:gap-4">
            <Motion
              as="span"
              class="flex items-baseline gap-1.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-neutral-900/50 tabular-nums"
              :initial="{opacity: 0, y: 12}"
              :while-in-view="{opacity: 1, y: 0}"
              :in-view-options="{once: true}"
              :transition="{duration: 0.7, ease: [0.16, 1, 0.3, 1]}"
            >
              {{ pad(ci + 1) }} <span class="opacity-50">/ {{ pad(chapters.length) }}</span>
            </Motion>
            <h2 class="font-medium lowercase leading-[0.98] tracking-[-0.015em] text-[clamp(2.75rem,5.5vw,5rem)]">
              <span
                v-for="(word, w) in splitWords(chapter.title ?? '')"
                :key="`${chapter.slug}-${w}`"
                class="inline-block overflow-hidden align-bottom whitespace-nowrap mr-[0.18em] pt-[0.12em] mt-[-0.12em] pb-[0.12em] mb-[-0.12em]"
                :class="w === splitWords(chapter.title ?? '').length - 1 ? 'font-hatton-italic normal-case font-normal' : 'capitalize'"
              >
                <Motion
                  as="span"
                  class="inline-block will-change-transform"
                  :initial="{y: '110%'}"
                  :while-in-view="{y: '0%'}"
                  :in-view-options="{once: true, margin: '0px 0px -10% 0px'}"
                  :transition="{type: 'spring', duration: 0.8, bounce: 0.18, delay: w * 0.07}"
                >
                  {{ word }}
                </Motion>
              </span>
            </h2>
            <Motion
              as="span"
              class="font-hatton-italic text-base sm:text-lg text-neutral-900/60 tabular-nums"
              :initial="{opacity: 0, y: 12}"
              :while-in-view="{opacity: 1, y: 0}"
              :in-view-options="{once: true}"
              :transition="{duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15}"
            >
              ( {{ pad(chapter.projects?.length ?? 0) }} ) projects
            </Motion>
          </div>
        </header>

        <div class="col-span-12 flex flex-col gap-16 sm:col-span-7 sm:col-start-6 sm:gap-24">
          <Motion
            v-for="(project, i) in chapter.projects"
            :key="project._id"
            as="article"
            initial="hidden"
            while-in-view="visible"
            :in-view-options="{once: true, margin: '0px 0px -12% 0px'}"
            :variants="{hidden: {opacity: 0, y: 48}, visible: {opacity: 1, y: 0}}"
            :transition="{duration: 0.9, ease: [0.16, 1, 0.3, 1]}"
          >
            <NuxtLink :to="`/projects/${project.slug}`" class="group block">
              <div class="relative aspect-4/3 overflow-hidden rounded-2xl bg-neutral-100 sm:rounded-3xl">
                <SanityFile
                  v-if="project.cover?.type === 'video' && project.cover.video?.ref"
                  v-slot="{src}"
                  :asset-id="project.cover.video.ref"
                >
                  <video
                    :src="src"
                    autoplay
                    muted
                    loop
                    playsinline
                    class="h-full w-full object-cover transition-transform duration-1400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                  />
                </SanityFile>
                <SanityImage
                  v-else-if="project.cover?.image?.ref"
                  :asset-id="project.cover.image.ref"
                  :alt="project.cover.image.alt ?? project.title"
                  :placeholder="project.cover.image.asset?.metadata?.lqip ?? undefined"
                  auto="format"
                  fit="crop"
                  draggable="false"
                  class="h-full w-full object-cover transition-transform duration-1400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                />
                <span
                  class="pointer-events-none absolute bottom-3 right-3 flex translate-y-1 items-center gap-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white opacity-0 mix-blend-difference transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100"
                >
                  View
                  <span class="inline-block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
                </span>
              </div>
              <div class="mt-4 flex items-baseline justify-between gap-4 sm:mt-5">
                <h3 class="text-lg font-medium tracking-[-0.01em] sm:text-2xl">
                  <span class="mr-2 font-hatton-italic text-[0.65em] text-neutral-900/45">{{ pad(i + 1) }}</span>{{ project.title }}
                </h3>
                <span class="shrink-0 font-mono text-xs tabular-nums text-neutral-900/50">{{ project.year }}</span>
              </div>
              <p v-if="project.services?.length" class="mt-1 text-sm text-neutral-900/55">
                {{ project.services.map(formatService).join(', ') }}
              </p>
            </NuxtLink>
          </Motion>
        </div>
      </div>
    </section>

    <p
      v-if="!chapters.length"
      class="relative z-10 py-24 text-center font-mono text-sm uppercase tracking-[0.25em] text-neutral-900/40"
    >
      No projects yet
    </p>

    <div class="h-16 sm:h-24" />
  </section>
</template>
