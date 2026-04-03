<template>
  <section id="roadmap" class="py-28 bg-gray-50">
    <div class="container mx-auto px-6">

      <!-- Header -->
      <div class="text-center mb-20 reveal-card">
        <h2 class="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
          {{ title }} <span class="text-gradient">{{ gradientTitle }}</span>
        </h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          {{ description }}
        </p>
      </div>

      <!-- Timeline -->
      <div class="max-w-5xl mx-auto relative">
        <!-- Vertical line for timeline -->
        <div class="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-[#00C49F] opacity-20"></div>

        <div v-for="(item, index) in roadmapData" :key="index" class="relative mb-16 reveal-card">
          <div class="flex flex-col md:flex-row items-center"
               :class="index % 2 !== 0 ? 'md:flex-row-reverse' : ''">

            <!-- Quarter & description -->
            <div class="md:w-1/2 px-4 md:px-6 mb-6 md:mb-0 text-center md:text-left">
              <div :class="[item.badgeColor, 'text-white px-5 py-2 rounded-lg inline-block font-bold']">
                {{ item.quarter }}
              </div>
              <h3 class="text-2xl font-bold text-gray-900 mt-4">{{ item.title }}</h3>
              <p class="text-gray-600 mt-2">{{ item.description }}</p>
            </div>

            <!-- Feature Card -->
            <div class="md:w-1/2 px-4 md:px-6">
              <div class="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition duration-300">
                <ul class="space-y-3 text-gray-600">
                  <li v-for="(feature, fIndex) in item.features" :key="fIndex" class="flex items-start">
                    <font-awesome-icon icon="fas fa-check-circle" class="text-[#00C49F] mt-1 mr-3" />
                    <span>{{ feature }}</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { onMounted, nextTick } from 'vue';
import '../../assets/css/home.css';

defineProps({
  title: { type: String, default: 'Future' },
  gradientTitle: { type: String, default: 'Roadmap' },
  description: { type: String, default: "We're constantly innovating and expanding our capabilities. Here's what's coming next for Sentra AI." },
  roadmapData: {
    type: Array,
    default: () => [
      {
        quarter: 'Q1 2024',
        title: 'Multimodal AI Integration',
        description: 'Combining voice, text, and visual AI for richer customer interactions and support.',
        badgeColor: 'bg-[#00C49F]',
        features: ['Visual support through screen sharing', 'Document analysis and processing', 'Enhanced emotion detection']
      },
      {
        quarter: 'Q2 2024',
        title: 'Predictive Analytics Engine',
        description: 'Advanced AI that anticipates customer needs and resolves issues before they occur.',
        badgeColor: 'bg-[#FFB039]',
        features: ['Predictive customer behavior analysis', 'Proactive issue resolution', 'Automated workflow optimization']
      },
      {
        quarter: 'Q3 2024',
        title: 'Industry-Specific Solutions',
        description: 'Tailored AI solutions for healthcare, finance, and e-commerce.',
        badgeColor: 'bg-purple-500',
        features: ['Healthcare patient support AI', 'Financial services compliance', 'E-commerce personal shopping']
      },
      {
        quarter: 'Q4 2024',
        title: 'Global Expansion',
        description: 'Expanding to new markets with localized AI models and multilingual support.',
        badgeColor: 'bg-red-500',
        features: ['Real-time language translation', 'Cultural context adaptation', 'Global deployment infrastructure']
      }
    ]
  }
});

// Reveal animation
onMounted(async () => {
  await nextTick();
  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal-card').forEach((el) => observer.observe(el));
});
</script>

<style scoped>
/* Reveal animation */
.reveal-card {
  opacity: 0;
  transform: translateY(40px);
  transition: all 0.8s ease;
}
.reveal-card.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Gradient text */
.text-gradient {
  background: linear-gradient(135deg, #00C49F 0%, #FFB039 50%, #9333EA 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Card hover effect */
.hover\:shadow-2xl:hover {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  transform: translateY(-5px);
}

/* Responsive fixes */
@media (max-width: 768px) {
  .md\\:flex-row {
    flex-direction: column !important;
  }
}
</style>
