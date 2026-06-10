<script setup lang="ts">
import { Motion, motion } from 'motion-v'

defineOptions({ inheritAttrs: false })

defineProps<{ word: string }>()

const isHovered = ref(false)
</script>

<template>
  <Motion
    as="span"
    class="relative inline-block"
    v-bind="$attrs"
    @hoverStart="isHovered = true"
    @hoverEnd="isHovered = false"
  >
    {{ word }}
    <motion.span
      class="absolute bottom-px left-0 right-0 h-[1.5px] bg-current"
      :style="{ originX: isHovered ? 0 : 1 }"
      :animate="{ scaleX: isHovered ? 1 : 0 }"
      :transition="{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }"
      aria-hidden="true"
    />
  </Motion>
</template>
