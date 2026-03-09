<script lang="ts" setup>
import useThemeStore from '../stores/theme'
import {onMounted, watch} from 'vue'

const themeStore = useThemeStore()

onMounted(() => {

  document.documentElement.setAttribute('data-theme', themeStore.theme)
})


watch(() => themeStore.theme, (newTheme) => {
  document.documentElement.setAttribute('data-theme', newTheme)
})
</script>

<template>
  <div id="container">
    <div class="diffused-gradient"></div>
  </div>
</template>

<style scoped>
#container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  z-index: 0;
}

.diffused-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #fb7ebb;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.11'/%3E%3C/svg%3E"),
  radial-gradient(circle at 69.68% 47.52%, rgba(255, 0, 0, 0.45), transparent 50%),
  radial-gradient(circle at 17.24% 16.85%, #feb4e3, transparent 50%),
  radial-gradient(circle at 12.51% 92.27%, #fefb9f, transparent 50%),
  radial-gradient(circle at 98.6% 35.89%, #ffffff, transparent 50%),
  radial-gradient(circle at 81.5% 100%, #ffffff, transparent 50%),
  radial-gradient(circle at 37.41% 43.31%, #ee6bff, transparent 50%);
  background-blend-mode: overlay, normal;
  filter: blur(123px);
  transform: scale(1.1);
  transition: background-color 0.5s ease, background-image 0.5s ease;
}

html[data-theme="dark"] #container .diffused-gradient {
  background-color: #111827;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.12'/%3E%3C/svg%3E"),
  radial-gradient(circle at 80% 50%, #2563eb 0%, transparent 48%),
  radial-gradient(circle at 72% 62%, #312e81 0%, transparent 52%),
  radial-gradient(circle at 18% 82%, #0f766e 0%, transparent 40%);
}

html[data-theme="dark"] body {
  background-color: #111827;
}

body {
  background-color: #fb7ebb;
  transition: background-color 0.5s ease;
}
</style>
