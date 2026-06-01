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
    liveContent: {
      // Browser token is shipped to the client — give it Viewer scope only.
      browserToken: process.env.NUXT_SANITY_LIVE_BROWSER_TOKEN,
      // Server token stays on the Nitro server — Editor scope is fine.
      serverToken: process.env.NUXT_SANITY_LIVE_SERVER_TOKEN,
    },
    typegen: {
      enabled: true,
      schemaTypesPath: '../studio/schemaTypes',
      schemaTypesExport: 'schemaTypes',
      overloadClientMethods: true,
    },
    // useCdn: false,
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },

  fonts: {
    families: [
      {
        name: 'DM Sans',
        provider: 'google',
        weights: [300, 400, 500, 600, 700, 800],
      },
      {
        name: 'Youth',
        src: ['/fonts/Youth-Bold.otf', '/fonts/Youth-Black.otf'],
        weight: [700, 900],
        style: 'normal',
      },
    ]
  }
})