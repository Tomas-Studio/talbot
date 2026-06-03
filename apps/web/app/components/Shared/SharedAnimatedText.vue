<script setup lang="ts">
import { Motion, motion } from 'motion-v'

defineOptions({ inheritAttrs: false })

defineProps<{ word: string }>()

const isHovered = ref<1 | 0>(0)
</script>

<template>
  <Motion 
    as="p" 
    class="overflow-hidden relative flex flex-col items-start justify-center"
    v-bind="$attrs"
    :style="{
      justifyContent: isHovered === 1 ? 'flex-end' : 'flex-start',
    }"
    @hoverStart="isHovered = 1"
    @hoverEnd="isHovered = 0"
  >
    <motion.span layout v-bind="$attrs">{{ word }}</motion.span>
    <motion.span layout v-bind="$attrs" aria-hidden="true">{{ word }}</motion.span>
  </Motion>
</template>
