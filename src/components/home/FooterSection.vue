<template>
  <footer class="bg-gray-900 text-white">
    <div class="container mx-auto px-6 py-10">

      <!-- Footer Top Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

        <!-- Logo & Description -->
        <div class="flex flex-col space-y-4">
          <div class="flex items-center">
            <img :src="logoSrc" :alt="logoAlt" class="h-10 object-contain mr-3">
            <span class="font-bold text-lg">{{ brandName }}</span>
          </div>
          <p class="text-gray-400 text-sm">
            {{ description }}
          </p>
          <div class="flex space-x-4 mt-2">
            <a v-for="icon in socialIcons" :key="icon.name" :href="icon.url" target="_blank"
               class="text-gray-400 hover:text-white transition duration-300">
              <font-awesome-icon :icon="icon.icon" class="text-lg"/>
            </a>
          </div>
        </div>

        <!-- Dynamic Footer Links -->
        <div v-for="section in sections" :key="section.title">
          <h3 class="text-white font-bold mb-6">{{ section.title }}</h3>
          <ul class="space-y-3">
            <li v-for="link in section.links" :key="link.name">
              <router-link
                  :to="link.to"
                  class="text-gray-400 hover:text-white transition duration-300"
              >
                {{ link.name }}
              </router-link>
            </li>
          </ul>
        </div>

      </div>

      <!-- Footer Bottom / Copyright -->
      <div class="mt-10 border-t border-gray-700 pt-4 text-center text-gray-400 text-sm">
        &copy; {{ currentYear }} {{ brandName }}. All rights reserved.
      </div>

    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue';
import logo from '../../assets/images/sentra.png'; // <-- Vite-friendly import
import '../../assets/css/home.css';

// Props for dynamic footer
defineProps({
  brandName: { type: String, default: 'Sentra AI' },
  logoSrc: { type: String, default: logo }, // use imported image
  logoAlt: { type: String, default: 'Sentra AI Logo' },
  description: { type: String, default: 'AI-powered customer communication platform by Rasant Solutions.' },
  sections: {
    type: Array,
    default: () => [
      {
        title: 'Product',
        links: [
          { name: 'Features', to: { path: '/', hash: '#features' } },
          { name: 'Pricing', to: { path: '/', hash: '#pricing' } },
          { name: 'Use Cases', to: { path: '/', hash: '#use-cases' } },
          { name: 'Integrations', to: { path: '/', hash: '#integrations' } },
          { name: 'API Documentation', to: { path: '/', hash: '#api-docs' } },
        ]
      },
      {
        title: 'Resources',
        links: [
          { name: 'Documentation', to: { path: '/', hash: '#documentation' } },
          { name: 'Help Center', to: { path: '/', hash: '#help' } },
          { name: 'Blog', to: { path: '/', hash: '#blog' } },
          { name: 'Community', to: { path: '/', hash: '#community' } },
          { name: 'Webinars', to: { path: '/', hash: '#webinars' } },
        ]
      },
      {
        title: 'Company',
        links: [
          { name: 'About Us', to: { path: '/', hash: '#about' } },
          { name: 'Careers', to: { path: '/', hash: '#careers' } },
          { name: 'Contact', to: { path: '/', hash: '#contact' } },
          { name: 'Partners', to: { path: '/', hash: '#partners' } },
          { name: 'Press Kit', to: { path: '/', hash: '#press-kit' } },
        ]
      }
    ]
  },
  socialIcons: {
    type: Array,
    default: () => [
      { name: 'Twitter', icon: ['fab', 'twitter'], url: '#' },
      { name: 'Facebook', icon: ['fab', 'facebook'], url: '#' },
      { name: 'LinkedIn', icon: ['fab', 'linkedin'], url: '#' },
      { name: 'GitHub', icon: ['fab', 'github'], url: '#' },
    ]
  }
});

// Current year for copyright
const currentYear = new Date().getFullYear();
</script>

<style scoped>
/* Footer hover animations */
a:hover {
  color: white !important;
  transition: color 0.3s ease;
}
</style>
