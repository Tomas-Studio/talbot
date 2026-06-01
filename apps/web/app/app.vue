<script setup lang="ts">
const appconfig = useAppConfig()

useHead({
  htmlAttrs: { lang: 'en', class: 'font-gellix scroll-smooth' },
  bodyAttrs: { class: 'antialiased font-gellix scroll-smooth' },
  link: [{ rel: 'icon', type: 'image/png', href: '/th-favicon-32.png' }],
})

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
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
