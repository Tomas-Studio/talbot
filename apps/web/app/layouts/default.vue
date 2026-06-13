<script setup lang="ts">
import { motion } from 'motion-v'

const logoHovered = ref(false)
</script>

<template>
  <main class="relative grid grid-rows-[1fr] min-h-dvh selection:bg-neutral-300 selection:text-neutral-900">
    <header class="h-14 sm:h-22 fixed top-0 left-0 z-50 w-full px-4 sm:px-8 md:px-12">
      <nav class="flex h-full justify-between items-center">
        <NuxtLink
          :to="{ name: HOME }"
          class="flex flex-col select-none text-[15px] leading-none font-bold mix-blend-difference"
          :class="isDarkBg() ? 'text-white' : 'text-black'"
          @mouseenter="logoHovered = true"
          @mouseleave="logoHovered = false"
        >
          <span class="">Talbot</span>
          <span class="flex">
            <motion.span
              class="inline-block"
              :animate="logoHovered ? { x: [0, 6, 0] } : { x: 0 }"
              :transition="{ duration: 0.6, ease: 'easeInOut' }"
            >—</motion.span>
            <span>&nbsp;Studio</span>
          </span>
        </NuxtLink>
        <div class="flex gap-0.5 font-bold mix-blend-difference" :class="isDarkBg() ? 'text-white' : 'text-black'">
          <NuxtLink v-if="useRoute().name != ABOUT" :to="{ name: ABOUT }">
            <SharedAnimatedText2 word="About" class="text-sm" />
          </NuxtLink>
          <NuxtLink v-else :to="{ name: HOME }">
            <SharedAnimatedText2 word="Home" class="text-sm" />
          </NuxtLink>
        </div>
      </nav>
    </header>
    <slot/>

    <div
      class="fixed bottom-4 left-2 font-mono uppercase text-[8px] mix-blend-difference tracking-wider [writing-mode:vertical-rl]"
      :class="isDarkBg() ? 'text-white' : 'text-black'"
    >
      Made with love&nbsp;♥
    </div>
    <div
      class="fixed bottom-1/3 right-2 font-mono uppercase text-[8px] mix-blend-difference tracking-wider [writing-mode:vertical-rl]"
      :class="isDarkBg() ? 'text-white' : 'text-black'"
    >
      By Tomas Studio
    </div>
  </main>
</template>

