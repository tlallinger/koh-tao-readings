
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  plugins: [
    { src: '~/plugins/highcharts.client.js', mode: 'client' }
  ],
  runtimeConfig: {
    public: {
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      supabaseUrl: process.env.SUPABASE_URL,
    },
  },

})
