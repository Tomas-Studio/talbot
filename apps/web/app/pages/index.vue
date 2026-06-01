<script setup lang="ts">
const appconfig = useAppConfig()
useSeoMeta({title: `${appconfig.title}`, titleTemplate: null})

const { data } = await useSanityLiveQuery(categoriesQuery)
</script>

<template>
  <section class="mt-10 text-6xl">
    Talbot Portfolio
  </section>
  <pre>{{ data }}</pre>
</template>
