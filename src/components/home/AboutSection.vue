<template>
  <section id="about" class="py-14 bg-gray-50">
    <div class="container mx-auto px-6">
      <div class="flex flex-col lg:flex-row items-center justify-between gap-12">

        <!-- About Info -->
        <div class="lg:w-1/2 reveal-card">
          <h2 class="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
            {{ title }} <span class="text-gradient">{{ highlight }}</span>
          </h2>
          <p class="text-lg text-gray-600 mb-6 leading-relaxed">
            {{ description }}
          </p>
          <p class="text-lg text-gray-600 mb-8 leading-relaxed">
            {{ subDescription }}
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div v-for="(item, index) in infoBlocks" :key="index" class="bg-white p-4 rounded-xl shadow hover:shadow-lg transition duration-300">
              <h4 class="font-bold text-gray-900 mb-2">{{ item.heading }}</h4>
              <p class="text-gray-600 text-sm">{{ item.content }}</p>
            </div>
          </div>
        </div>

        <!-- Feature Card -->
        <div class="lg:w-1/2 flex justify-center reveal-card">
          <div class="relative w-full max-w-md">
            <div class="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition duration-300">
              <div class="flex items-center mb-6">
                <div class="w-14 h-14 bg-[#00C49F] rounded-xl flex items-center justify-center text-white mr-4">
                  <font-awesome-icon :icon="cardIcon" class="text-3xl"/>
                </div>
                <h3 class="text-2xl font-bold text-gray-900">{{ cardTitle }}</h3>
              </div>

              <div class="space-y-4">
                <div
                    v-for="(feature, index) in features"
                    :key="index"
                    class="flex items-start animate-feature"
                    :style="{ '--feature-index': index }"
                >
                  <font-awesome-icon icon="fas fa-check" class="text-[#00C49F] mt-1 mr-3" />
                  <div>
                    <h4 class="font-medium text-gray-900">{{ feature.title }}</h4>
                    <p class="text-sm text-gray-600">{{ feature.description }}</p>
                  </div>
                </div>
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

defineProps({
  // Main Info Section
  title: { type: String, default: 'About' },
  highlight: { type: String, default: 'Sentra AI' },
  description: { type: String, default: 'Sentra AI is a product of Rasant Solutions, a technology company dedicated to revolutionizing customer communication through artificial intelligence.' },
  subDescription: { type: String, default: 'Our mission is to make advanced AI communication accessible to businesses of all sizes, enabling them to provide exceptional customer service while optimizing operational costs.' },
  infoBlocks: {
    type: Array,
    default: () => [
      { heading: 'Our Vision', content: 'To create a world where every customer interaction is intelligent, personalized, and efficient.' },
      { heading: 'Our Values', content: 'Innovation, reliability, and customer success drive everything we do.' }
    ]
  },

  // Feature Card Section
  cardTitle: { type: String, default: 'Why Choose Sentra AI?' },
  cardIcon: { type: [Array, String], default: () => ['fas', 'rocket'] },
  features: {
    type: Array,
    default: () => [
      { title: 'Proven Technology', description: 'Built on years of AI research and development' },
      { title: 'Enterprise Ready', description: 'Scalable solutions for businesses of all sizes' },
      { title: 'Continuous Innovation', description: 'Regular updates with latest AI advancements' },
      { title: 'Dedicated Support', description: 'Expert team to ensure your success' }
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

/* Feature checkmark animation */
.animate-feature {
  opacity: 0;
  transform: translateX(-20px);
  animation: slideIn 0.6s forwards;
  animation-delay: calc(var(--feature-index) * 0.1s);
}

@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
