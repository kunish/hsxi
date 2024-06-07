export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    'shadcn-nuxt',
    '@nuxtjs/color-mode',
    '@nuxt/eslint',
    '@vueuse/nuxt',
    '@pinia/nuxt',
  ],
  colorMode: {
    classSuffix: '',
  },
  runtimeConfig: {
    headscaleApi: 'http://localhost:8080',
  },
})
