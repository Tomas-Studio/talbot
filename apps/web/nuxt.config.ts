// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/fonts',
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/icon',
    '@vueuse/nuxt',
    'motion-v/nuxt',
    '@nuxtjs/sanity',
  ],
  css: ["./app/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },

  devServer: {
    port: 4010
  },

  sanity: {
    projectId: 'fxdkby6x',
    dataset: 'production',
    apiVersion: '2026-05-21',
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },

  fonts: {
    families: [
      {
        name: 'Hanken Grotesk',
        provider: 'google',
        weights: [300, 400, 500, 600, 700, 800],
      },
    ]
  }
})