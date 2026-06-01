<script setup lang="ts">
const appconfig = useAppConfig()

useHead({
  htmlAttrs: { lang: 'en', class: 'font-sans scroll-smooth' },
  bodyAttrs: { class: 'antialiased font-sans scroll-smooth' },
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
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
