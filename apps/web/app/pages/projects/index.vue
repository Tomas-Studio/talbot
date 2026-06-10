<script setup lang="ts">
import {AnimatePresence, Motion} from 'motion-v'

useSeoMeta({title: () => `• Projects`})

const route = useRoute()
const router = useRouter()

const {data: categories} = await useSanityQuery(categoryTitlesQuery)

const activeCategory = useState(
  'projects-active-category',
  () => (route.query.category as string) || categories.value?.[0]?.slug,
)

watch(activeCategory, (slug) => {
  router.replace({query: slug ? {...route.query, category: slug} : {}})
})

watch(
  () => route.query.category,
  (slug) => {
    if (typeof slug === 'string' && slug !== activeCategory.value)
      activeCategory.value = slug
  },
)

onMounted(() => {
  const queryCategory = route.query.category
  if (typeof queryCategory === 'string')
    activeCategory.value = queryCategory
  else if (activeCategory.value)
    router.replace({query: {...route.query, category: activeCategory.value}})
})

const {data: projects} = await useSanityQuery(
  projectsByCategoryQuery,
  reactive({category: activeCategory}),
)

// Heading text + its words, so the title can re-reveal on every category change.
const headingTitle = computed(() =>
  activeCategory.value
    ? categories.value?.find((c) => c.slug === activeCategory.value)?.title ?? 'Projects'
    : 'Projects',
)
const headingWords = computed(() => headingTitle.value.split(' '))

useSeoMeta({title: () => `${activeCategory ? categories.value?.find(c => c.slug === activeCategory.value)?.title : 'Projects'}`})
</script>

<template>
  <section>
    <div class="h-[70svh]">
      <div class="h-full px-4 sm:px-8 md:px-12 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <Motion
            :key="headingTitle"
            as="h1"
            class="text-5xl lg:text-7xl font-bold pt-[15%] leading-[0.95]"
            initial="hidden"
            animate="visible"
            exit="exit"
            :variants="{
              hidden: {},
              visible: {transition: {staggerChildren: 0.05, delayChildren: 0.05}},
              exit: {transition: {staggerChildren: 0.04, staggerDirection: -1}},
            }"
          >
            <Motion
              v-for="(word, w) in headingWords"
              :key="`${headingTitle}-${w}`"
              as="span"
              class="inline-block mr-[0.25em] will-change-[transform,opacity]"
              :variants="{
                hidden: {opacity: 0, y: 12},
                visible: {opacity: 1, y: 0},
                exit: {opacity: 0, y: 12},
              }"
              :transition="{type: 'spring', duration: 0.9, bounce: 0}"
            >
              {{ word }}
            </Motion>
          </Motion>
        </AnimatePresence>
        <div class="flex-auto" />
        <nav class="flex flex-wrap gap-4 pb-6">
          <button
            v-for="category in categories"
            :key="category.slug"
            type="button"
            class="relative cursor-pointer sm:text-lg lg:text-xl capitalize py-1.5 transition-opacity duration-300 ease-out"
            :class="activeCategory === category.slug ? 'opacity-100' : 'opacity-40 hover:opacity-70'"
            @click="activeCategory = category.slug"
          >
            {{ category.title }}
            <!-- Shared indicator: slides to the clicked category via layout animation. -->
            <Motion
              v-if="activeCategory === category.slug"
              layout-id="category-indicator"
              as="span"
              class="absolute bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-current"
              :transition="{type: 'spring', stiffness: 420, damping: 36}"
            />
          </button>
        </nav>
      </div>
    </div>

  </section>
</template>
