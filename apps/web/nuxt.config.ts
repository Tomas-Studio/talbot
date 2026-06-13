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
    optimizeDeps: {
      include: [
        '@sanity/client',
        'groq',
      ]
    }
  },

  image: {
    sanity: {
      projectId: 'fxdkby6x',
      dataset: 'production',
    },
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

  routeRules: {
    // '/projects': { redirect: '/projects?category=web-design' },
  },

  fonts: {
    families: [
      {
        name: 'DM Sans',
        provider: 'google',
        weights: [300, 400, 500, 600, 700, 800],
      },
      {
        name: 'Plus Jakarta Sans',
        provider: 'google',
        weights: [300, 400, 500, 600, 700, 800],
      },
      {
        name: 'Figtree',
        provider: 'google',
        weights: [300, 400, 500, 600, 700, 800],
      },
      {
        name: 'Apercu Pro',
        src: ['/fonts/ApercuPro-Regular.woff2', '/fonts/ApercuPro-Medium.woff2'],
        weight: [400, 500],
        style: 'normal',
      },
      {
        name: 'Graebenbach Mono',
        src: ['/fonts/GraebenbachMono.woff2'],
        weight: 400,
        style: 'normal',
      },
      {
        name: 'PP Hatton',
        src: ['/fonts/PPHatton.woff'],
        weight: 300,
        style: 'normal',
      },
      {
        name: 'PP Hatton Italic',
        src: ['/fonts/PPHattonItalic.woff'],
        weight: 300,
        style: 'italic',
      },
    ]
  }
})