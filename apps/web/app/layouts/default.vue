<script setup lang="ts">

</script>

<template>
  <main class="relative grid grid-rows-[1fr_auto] min-h-dvh">
    <header class="h-12 sm:h-18 fixed top-0 left-0 z-10 w-full px-4 sm:px-8 md:px-16">
      <nav class="flex h-full justify-between items-center">
        <NuxtLink to="/" class="flex flex-col select-none uppercase tracking-tight text-sm leading-none font-medium text-white">
          <span class="">Talbot</span>
          <span>Studio</span>
        </NuxtLink>
        <div class="flex gap-4 text-sm font-medium tracking-tight uppercase">
          <NuxtLink to="/" class="text-white">Projects</NuxtLink>
          <NuxtLink to="/" class="text-white">About</NuxtLink>
        </div>
      </nav>
    </header>
    <section>
      <slot/>
    </section>
    <footer/>
  </main>
</template>

