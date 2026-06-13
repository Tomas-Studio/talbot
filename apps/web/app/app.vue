<script setup lang="ts">
const appconfig = useAppConfig()
const { curtainEl, coverPathEl, revealPathEl, labelEl, label, transition: pageTransition } = usePageTransition()

useHead({
  htmlAttrs: { lang: 'en', class: 'font-sans scroll-smooth text-neutral-900' },
  bodyAttrs: { class: 'antialiased font-sans scroll-smooth text-neutral-900' },
  link: [{ rel: 'icon', type: 'image/png', href: '/th-favicon-32.png' }],
})

const { data } = await useSanityLiveQuery(siteSettingsQuery)

const newAppConfig = { title: data.value?.siteTitle || appconfig.title, description: data.value?.aboutText || appconfig.description }

updateAppConfig(newAppConfig)

useSeoMeta({
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  title: appconfig.title,
  titleTemplate: `%s • ${appconfig.title}`,
  description: `${appconfig.description}`,
  // ogImage: 'https://cclcorp.sirv.com/cbt/eti-og.webp',
  // twitterImage: 'https://cclcorp.sirv.com/cbt/eti-og.webp',
  // twitterCard: 'summary_large_image',
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <SharedPreloader />
  <!-- Curved transition curtain. Parked below the viewport; usePageTransition
       drives its transform and the SVG edge curves imperatively. -->
  <div
    ref="curtainEl"
    aria-hidden="true"
    class="pointer-events-none fixed inset-0 z-60 will-change-transform"
    style="transform: translateY(100%)"
  >
    <div class="absolute inset-0 bg-neutral-950" />
    <!-- Leading edge (above the panel) — bulges while covering. -->
    <svg
      class="absolute inset-x-0 top-[calc(-25vh+1px)] h-[25vh] w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <path ref="coverPathEl" fill="#0a0a0a" d="M 0 100 Q 50 100 100 100 Z" />
    </svg>
    <!-- Trailing edge (below the panel) — bows while revealing. -->
    <svg
      class="absolute inset-x-0 bottom-[calc(-25vh+1px)] h-[25vh] w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <path ref="revealPathEl" fill="#0a0a0a" d="M 0 0 Q 50 0 100 0 Z" />
    </svg>
    <!-- Destination name, shown while the pages swap under cover. -->
    <p
      ref="labelEl"
      class="absolute inset-0 flex items-center justify-center gap-4 font-hatton text-4xl capitalize text-white opacity-0 sm:text-5xl"
    >
      <span class="inline-block size-2.5 rounded-full bg-white" />
      {{ label }}
    </p>
  </div>
  <NuxtLayout>
    <NuxtPage :transition="pageTransition" />
  </NuxtLayout>
</template>
