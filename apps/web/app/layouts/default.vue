<script setup lang="ts">

</script>

<template>
  <main class="relative grid grid-rows-[1fr_auto] min-h-dvh">
    <header class="h-12 sm:h-18 fixed top-0 left-0 z-10 w-full px-4 sm:px-8 md:px-16">
      <nav class="flex h-full justify-between items-center">
        <NuxtLink to="/" class="flex flex-col select-none uppercase tracking-tight text-[15px] leading-none font-medium text-white">
          <span class="">Talbot</span>
          <span>Studio</span>
        </NuxtLink>
        <div class="flex gap-4 font-medium tracking-tight uppercase">
          <NuxtLink to="/" class="text-white">
            <SharedAnimatedText word="Home" class="text-sm h-4.5 leading-4.5 px-1.5" />
          </NuxtLink>
          <NuxtLink to="/" class="text-white">
            <SharedAnimatedText word="Projects" class="text-sm h-4.5 leading-4.5 px-1.5" />
          </NuxtLink>
          <NuxtLink to="/" class="text-white">
            <SharedAnimatedText word="About" class="text-sm h-4.5 leading-4.5 px-1.5" />
          </NuxtLink>
        </div>
      </nav>
    </header>
    <slot/>
    <footer/>
  </main>
</template>

