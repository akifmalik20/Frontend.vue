<template>
  <section class="py-28 brand-gradient text-white">
    <div class="container mx-auto px-6 text-center">
      <h2 class="text-3xl lg:text-5xl font-bold mb-6 reveal-card text-black">
        {{ title }}
      </h2>

      <p class="text-xl mb-8 max-w-2xl mx-auto opacity-90 reveal-card">
        {{ description }}
      </p>

      <div class="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 reveal-card">

        <router-link to="/login"
                     class="px-8 py-4 bg-white text-[#00C49F] rounded-lg font-bold text-lg hover:bg-gray-100 transition duration-300 shadow-lg">
          Start Free Trial
        </router-link>

        <router-link :to=" { path: '/', hash: '#pricing' }"
                     class="px-8 py-4 border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white hover:text-[#00C49F] transition duration-300">
          Schedule Demo
        </router-link>
      </div>

      <p class="mt-6 text-sm opacity-80 reveal-card">
        No credit card required • 14-day free trial • Setup in minutes
      </p>
    </div>
  </section>
</template>

<script setup>
import '../../assets/css/home.css';
defineProps({
  title: {
    type: String,
    default: 'Ready to Transform Your Customer Experience?'
  },
  description: {
    type: String,
    default: 'Join thousands of businesses using Sentra AI to automate customer service and drive growth.'
  }
});

// Emits for parent communication

</script>

