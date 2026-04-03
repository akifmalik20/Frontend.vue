<template>
  <section id = "heroSection"
      class=" overflow-hidden
           bg-gradient-to-br from-[#00C49F]/20 via-[#FFB039]/20 to-[#9333EA]/10"
  >
    <!-- Background Glows -->
    <div class="absolute inset-0 -z-10">
      <div class="absolute top-1/3 left-1/4 w-96 h-96 bg-[#00C49F]/30 rounded-full blur-3xl animate-pulse-slow"></div>
      <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#FFB039]/30 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
      <div class="absolute top-0 right-1/3 w-72 h-72 bg-[#9333EA]/20 rounded-full blur-2xl"></div>
    </div>

    <div class="max-w-7xl mx-auto px-6 py-28">
      <div class="flex flex-col lg:flex-row items-center gap-16">

        <!-- LEFT CONTENT -->
        <div class="lg:w-1/2 fade-in visible">
          <h1 class="text-4xl lg:text-6xl font-bold leading-tight mb-6 text-gray-900">
            {{ title }}
            <span class="text-gradient">{{ highlightedText }}</span>
            {{ subtitle }}
          </h1>

          <p class="text-xl lg:text-2xl text-gray-700 mb-10 max-w-xl">
            {{ description }}
          </p>

          <!-- CTA BUTTONS -->
          <div class="flex flex-col sm:flex-row gap-4">
            <router-link
                :to="primaryCta.link"
                class="px-8 py-4 bg-[#00C49F] text-white rounded-xl font-bold text-lg
                     hover:bg-[#00B386] transition shadow-xl text-center"
            >
              {{ primaryCta.label }}
            </router-link>

            <router-link
                :to="secondaryCta.link"
                class="px-8 py-4 border-2 border-[#FFB039] text-[#FFB039]
                     rounded-xl font-bold text-lg
                     hover:bg-[#FFB039] hover:text-white transition text-center"
            >
              {{ secondaryCta.label }}
            </router-link>
          </div>

          <!-- BENEFITS -->
          <div class="mt-10 flex flex-wrap gap-6 text-sm text-gray-800">
            <div
                v-for="benefit in benefits"
                :key="benefit"
                class="flex items-center"
            >
              <font-awesome-icon
                  icon="fa-solid fa-check-circle"
                  class="text-[#00C49F] mr-2"
              />
              <span>{{ benefit }}</span>
            </div>
          </div>
        </div>

        <!-- RIGHT DASHBOARD -->
        <div class="lg:w-1/2 flex justify-center fade-in visible">
          <div class="relative">

            <div
                class="bg-white/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl animate-float"
            >
              <div class="bg-white rounded-2xl shadow-xl p-6 w-[320px] sm:w-[380px]">

                <!-- WINDOW HEADER -->
                <div class="flex items-center justify-between mb-6">
                  <div class="flex items-center gap-2">
                    <span class="w-3 h-3 bg-red-400 rounded-full"></span>
                    <span class="w-3 h-3 bg-yellow-400 rounded-full"></span>
                    <span class="w-3 h-3 bg-green-400 rounded-full"></span>
                  </div>
                  <span class="text-gray-500 text-sm">
                    {{ dashboardTitle }}
                  </span>
                </div>

                <!-- STATS -->
                <div class="space-y-4">
                  <div
                      v-for="stat in stats"
                      :key="stat.label"
                      class="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div class="flex items-center">
                      <div
                          :class="[
                          stat.bgColor,
                          'w-10 h-10 rounded-lg flex items-center justify-center text-white mr-3'
                        ]"
                      >
                        <font-awesome-icon :icon="stat.icon" />
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">{{ stat.label }}</p>
                        <p class="text-sm text-gray-500">{{ stat.subtext }}</p>
                      </div>
                    </div>
                    <span :class="stat.textColor || 'text-[#00C49F] font-bold'">
                      {{ stat.value }}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            <!-- Decorative Dots -->
            <div class="absolute -top-6 -right-6 w-24 h-24 bg-[#00C49F] rounded-full opacity-20"></div>
            <div class="absolute -bottom-6 -left-6 w-20 h-20 bg-[#FFB039] rounded-full opacity-20"></div>

          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
const stats = [
  { label: 'Active Calls', subtext: '24 calls in progress', value: '+12%', icon: 'headset', bgColor: 'bg-[#00C49F]' },
  { label: 'AI Agents', subtext: '18 agents active', value: '94%', icon: 'robot', bgColor: 'bg-[#FFB039]' },
  { label: 'Satisfaction', subtext: '4.8/5 rating', value: '+8%', icon: 'chart-line', bgColor: 'bg-purple-500' }
];

defineProps({
  title: { type: String, default: 'Revolutionize Customer Experience with' },
  highlightedText: { type: String, default: 'AI-Powered' },
  subtitle: { type: String, default: 'Communication' },
  description: { type: String, default: 'Automate voice, chat, and analytics on one secure platform.' },
  dashboardTitle: { type: String, default: 'Live Dashboard' },
  primaryCta: { type: Object, default: () => ({ label: 'Start Free Trial', link: { path: '/', hash: '#pricing' } }) },
  secondaryCta: { type: Object, default: () => ({ label: 'View Demo', link: { path: '/', hash: '#features' } }) },
  benefits: { type: Array, default: () => ['No credit card required', '14-day free trial', 'Setup in 5 minutes'] }
});
</script>

<style scoped>
.text-gradient {
  background: linear-gradient(135deg, #00C49F 0%, #FFB039 50%, #9333EA 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}
@keyframes float {
  0%,100%{ transform: translateY(0); }
  50%{ transform: translateY(-16px); }
}

.fade-in {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease;
}
.fade-in.visible {
  opacity: 1;
  transform: translateY(0);
}

.animate-pulse-slow {
  animation: pulse 8s ease-in-out infinite;
}
@keyframes pulse {
  0%,100% { transform: scale(1); opacity:0.2; }
  50% { transform: scale(1.1); opacity:0.35; }
}
</style>
