<script setup lang="ts">
import {AnimatePresence, Motion} from 'motion-v'

// Odometer-style value: old value rolls up and out, new one rolls in from below.
defineProps<{value: string}>()
</script>

<template>
  <span class="relative inline-flex overflow-hidden align-bottom">
    <AnimatePresence mode="popLayout">
      <Motion
        :key="value"
        as="span"
        class="inline-block will-change-transform"
        :initial="{y: '100%'}"
        :animate="{y: '0%'}"
        :exit="{y: '-100%'}"
        :transition="{type: 'spring', duration: 0.6, bounce: 0}"
      >
        {{ value }}
      </Motion>
    </AnimatePresence>
  </span>
</template>
