<template>
  <div
      class="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center justify-center w-5 h-80 cursor-pointer group"
      @click="handleTrackClick"
      ref="trackRef"
  >
    <div class="relative h-full w-1.5 rounded-full transition-all duration-300 ease-out group-hover:w-2.5 group-hover:bg-gray-200/60">

      <div class="absolute inset-0 bg-gray-200/30 dark:bg-gray-700/30 backdrop-blur-sm rounded-full"></div>

      <div
          class="absolute top-0 left-0 w-full rounded-full bg-gradient-to-b from-teal-300 via-teal-400 to-emerald-500 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(45,212,191,0.5)]"
          :style="{ height: `${scrollPercentage}%` }"
      >
        <div class="absolute inset-0 bg-white/30 animate-pulse-slow rounded-full"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const scrollPercentage = ref(0);
const trackRef = ref(null);

// 1. Efficient Scroll Handler
const handleScroll = () => {
  const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrolled = window.scrollY;

  if (totalHeight <= 0) {
    scrollPercentage.value = 0;
    return;
  }

  // Calculate percentage (0 to 100)
  const rawProgress = (scrolled / totalHeight) * 100;
  scrollPercentage.value = Math.min(Math.max(rawProgress, 0), 100);
};

// 2. Click-to-Jump Logic
const handleTrackClick = (event) => {
  if (!trackRef.value) return;

  // Get click position relative to the track
  const rect = trackRef.value.getBoundingClientRect();
  const clickY = event.clientY - rect.top;
  const trackHeight = rect.height;

  // Calculate percentage where user clicked
  const clickPercentage = clickY / trackHeight;

  // Convert percentage to pixel position on page
  const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
  const targetScroll = totalHeight * clickPercentage;

  // Smooth scroll to that position
  window.scrollTo({
    top: targetScroll,
    behavior: 'smooth'
  });
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial check
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
/* Scoped: Animation for the inner glow of the bar */
@keyframes pulse-slow {
  0%, 100% { opacity: 0; }
  50% { opacity: 0.4; }
}

.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}
</style>

<style>
/* GLOBAL STYLES:
  This section hides the default browser scrollbar
  so only your custom one is visible.
*/

/* For Webkit browsers (Chrome, Safari, Edge, Opera) */
html::-webkit-scrollbar {
  display: none;
}

/* For Firefox, IE, and others */
html {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>