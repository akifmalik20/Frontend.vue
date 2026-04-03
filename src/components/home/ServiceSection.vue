<template>
  <section id="services" class="py-28 bg-gray-50">
    <div class="container mx-auto px-6">

      <!-- Section Header -->
      <div class="text-center mb-16 reveal-card">
        <h2 class="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
          {{ titleBefore }}
          <span class="text-gradient">{{ titleGradient }}</span>
        </h2>
        <p v-if="description" class="text-xl text-gray-600 max-w-3xl mx-auto">
          {{ description }}
        </p>
      </div>

      <!-- Services Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div
            v-for="(service, index) in services"
            :key="index"
            class="reveal-card bg-white rounded-2xl p-8 shadow-lg border border-gray-100 transition-all duration-500 group hover:-translate-y-2 hover:shadow-2xl"
            :style="{ transitionDelay: `${index * 100}ms` }"
        >
          <!-- Icon + Title -->
          <div class="flex items-start mb-6">
            <div
                class="service-icon w-14 h-14 rounded-xl flex items-center justify-center text-white mr-6 brand-gradient"
            >
              <font-awesome-icon :icon="service.icon" class="text-2xl" />
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-900 mb-3">{{ service.title }}</h3>
              <p class="text-gray-600">{{ service.description }}</p>
            </div>
          </div>

          <!-- Features List -->
          <div class="ml-20">
            <ul class="space-y-3">
              <li
                  v-for="(feature, fIndex) in service.features"
                  :key="fIndex"
                  class="flex items-center text-gray-600"
              >
                <font-awesome-icon icon="fas fa-check-circle" class="text-[#00C49F] mr-3" />
                {{ feature }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, nextTick } from 'vue';
import '@/assets/css/home.css';

// Props for header
const titleBefore = 'Comprehensive';
const titleGradient = 'AI Services';
const description =
    'From customer support to sales automation, Sentra AI provides specialized solutions for every business need.';

// Dynamic services data
const services = [
  {
    title: 'Customer Support AI',
    description:
        'Automate routine customer inquiries with intelligent voice agents that provide instant, accurate responses 24/7.',
    icon: 'fa-solid fa-headset',
    features: ['24/7 automated support', 'Intelligent ticket routing', 'Escalation to human agents'],
  },
  {
    title: 'Sales & Outreach',
    description:
        'Boost conversion rates with AI-powered outbound calling, lead qualification, and personalized follow-ups.',
    icon: 'fa-solid fa-bullhorn',
    features: ['Automated lead qualification', 'Personalized outreach', 'Appointment scheduling'],
  },
  {
    title: 'HR & Recruitment',
    description:
        'Streamline recruitment with AI-powered screening interviews, candidate communication, and onboarding.',
    icon: 'fa-solid fa-user-tie',
    features: ['Automated candidate screening', 'Interview scheduling', 'Employee onboarding'],
  },
  {
    title: 'Quality Assurance',
    description:
        'Monitor and improve service quality with automated call scoring, sentiment analysis, and performance insights.',
    icon: 'fa-solid fa-clipboard-check',
    features: ['Automated quality scoring', 'Sentiment tracking', 'Agent performance analytics'],
  },
];

// IntersectionObserver for reveal animation
onMounted(async () => {
  await nextTick();

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

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
/* Floating reveal animation */
.reveal-card {
  opacity: 0;
  transform: translateY(30px);
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

/* Brand gradient for icons */
.brand-gradient {
  background: linear-gradient(135deg, #00c49f 0%, #0f766e 100%);
}

/* Hover card effect */
.group:hover .service-icon {
  transform: scale(1.1);
  transition: transform 0.3s ease;
}
</style>
