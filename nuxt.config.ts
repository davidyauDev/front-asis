// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  ssr: false,
  nitro: {
    preset: 'static'
  },

  modules: [
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@nuxtjs/leaflet',
    '@pinia/nuxt'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/api/**': {
      cors: true
    }
  },

  runtimeConfig: {
    // Private keys (only available on server-side)
    
    // Public keys (exposed to client-side)
    public: {
      apiBaseUrl: '',
      appName: 'Asisten',
      appVersion: '1.0.0'
    }
  },

  compatibilityDate: '2024-07-11'
})