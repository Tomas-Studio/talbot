<template>
  <footer 
    class="w-full py-6 px-4 sm:px-8 md:px-12 flex text-sm"
  >
    <div class="inline-flex items-center gap-1">
      <svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 256 256">
        <path fill="currentColor" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88m-32-88a32 32 0 0 0 57.6 19.2a8 8 0 0 1 12.8 9.61a48 48 0 1 1 0-57.62a8 8 0 0 1-12.8 9.61A32 32 0 0 0 96 128"/>
      </svg>
      <span>
        {{ new Date().getFullYear() }} Talbot Studio. All Rights Reserved.
      </span>
    </div>
    <div class="inline-flex items-center gap-1 ml-auto">
      <NuxtLink :to="{ name: PRIVACY_POLICY }">
        <SharedAnimatedText word="Privacy Policy" class="text-sm h-5 leading-5 px-1.5" />
      </NuxtLink>
      <NuxtLink :to="{ name: COOKIES }">
        <SharedAnimatedText word="Cookies" class="text-sm h-5 leading-5 px-1.5" />
      </NuxtLink>
    </div>
  </footer>
</template>
