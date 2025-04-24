// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  css:['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      appRoot: process.env.APP_ROOT
    }
  },
  modules: ['@nuxt/ui']
})