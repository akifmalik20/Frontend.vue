<template>
  <section id="features" class="py-28 bg-gray-50">
    <div class="container mx-auto px-6">

      <!-- Header -->
      <div class="text-center mb-16 reveal-card">
        <h2 class="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
          Powerful Features for
          <span class="text-gradient">Modern Businesses</span>
        </h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Sentra AI combines cutting-edge artificial intelligence with enterprise-grade reliability to deliver exceptional customer experiences.
        </p>
      </div>

      <!-- Features Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
            v-for="(feature, index) in features"
            :key="index"
            class="reveal-card bg-white rounded-2xl p-8 shadow-lg border border-gray-100 transition-all duration-500 group hover:-translate-y-2 hover:shadow-2xl"
            :style="{ transitionDelay: `${index * 100}ms` }"
        >
          <div class="service-icon w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6"
               :class="feature.bgGradient">
            <font-awesome-icon :icon="feature.icon" class="text-2xl" />
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-4">{{ feature.title }}</h3>
          <p class="text-gray-600 mb-6">
            {{ feature.description }}
          </p>
          <ul class="space-y-3">
            <li v-for="(item, idx) in feature.checkmarks" :key="idx" class="flex items-center text-gray-600">
              <font-awesome-icon icon="fas fa-check" class="text-[#00C49F] mr-3" />
              {{ item }}
            </li>
          </ul>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import '../../assets/css/home.css';

// Dynamic features array — can be modified externally
const features = [
  {
    title: 'AI Voice Agents',
    description: 'Intelligent voice agents that handle customer inquiries naturally.',
    icon: 'robot',
    bgGradient: 'bg-gradient-to-r from-[#00C49F] via-[#FFB039] to-[#9333EA]',
    checkmarks: ['Natural conversation', 'Multi-language', 'Emotional AI']
  },
  {
    title: 'Advanced Analytics',
    description: 'Comprehensive insights into call performance and satisfaction.',
    icon: 'chart-bar',
    bgGradient: 'bg-gradient-to-r from-[#FFB039] via-[#9333EA] to-[#00C49F]',
    checkmarks: ['Real-time data', 'Sentiment analysis', 'Metrics']
  },
  {
    title: 'Multi-Channel Support',
    description: 'Integrate voice, chat, and email into one platform.',
    icon: 'comments',
    bgGradient: 'bg-gradient-to-r from-[#9333EA] via-[#00C49F] to-[#FFB039]',
    checkmarks: ['Omnichannel', 'Unified view', 'Consistent']
  },
  {
    title: 'Call Recording',
    description: 'Automatically record and transcribe every interaction.',
    icon: 'database',
    bgGradient: 'bg-gradient-to-r from-[#00C49F] via-[#9333EA] to-[#FFB039]',
    checkmarks: ['Auto-transcription', 'Quality monitoring', 'Compliance']
  },
  {
    title: 'CRM Integration',
    description: 'Connect with existing systems for personalized experiences.',
    icon: 'sync-alt',
    bgGradient: 'bg-gradient-to-r from-[#FFB039] via-[#00C49F] to-[#9333EA]',
    checkmarks: ['Seamless sync', 'Customer context', 'Personalized']
  },
  {
    title: 'Enterprise Security',
    description: 'Bank-level security with end-to-end encryption.',
    icon: 'shield-alt',
    bgGradient: 'bg-gradient-to-r from-[#9333EA] via-[#FFB039] to-[#00C49F]',
    checkmarks: ['Encrypted', 'GDPR compliant', 'SOC 2']
  }
];
</script>

<style scoped>
/* Text gradient */
.text-gradient {
  background: linear-gradient(135deg, #00C49F 0%, #FFB039 50%, #9333EA 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Reveal animation */
.reveal-card {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease;
}

.reveal-card.visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
