<template>
  <section id="pricing" class="py-28 bg-gray-50">
    <div class="container mx-auto px-6">

      <div class="text-center mb-20 reveal-card">
        <h2 class="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
          <slot name="title">Simple, Transparent <span class="text-gradient">Pricing</span></slot>
        </h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          <slot name="subtitle">Choose the plan that fits your business needs.</slot>
        </p>
      </div>


      <div class="relative group max-w-7xl mx-auto px-12">
        <div class="absolute -left-4 top-1/2 -translate-y-1/2 z-20 transition-opacity duration-300">
          <button
              @click="scroll('left')"
              class="w-11 h-11 bg-white shadow-xl rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:text-[#00C49F] transition-all"
          >
            <font-awesome-icon icon="fa-solid fa-chevron-left" />
          </button>
        </div>

        <div class="absolute -right-4 top-1/2 -translate-y-1/2 z-20 transition-opacity duration-300">
          <button
              @click="scroll('right')"
              class="w-11 h-11 bg-white shadow-xl rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:text-[#00C49F] transition-all"
          >
            <font-awesome-icon icon="fa-solid fa-chevron-right" />
          </button>
        </div>

        <div
            ref="scrollContainer"
            class="flex overflow-x-auto gap-10 pb-10 pt-5 no-scrollbar scroll-smooth"
        >
          <template v-if="isLoading">
            <div v-for="i in 3" :key="'skeleton-' + i"
                 class="flex-none w-[350px] pricing-card-skeleton rounded-3xl p-8 bg-white shadow-lg border border-gray-100 flex flex-col h-[550px]">
              <div class="skeleton-shimmer h-8 w-3/4 mx-auto mb-4 rounded"></div>
              <div class="skeleton-shimmer h-12 w-1/2 mx-auto mb-6 rounded"></div>
              <div class="space-y-4 flex-grow">
                <div v-for="j in 5" :key="j" class="skeleton-shimmer h-4 w-full rounded"></div>
              </div>
              <div class="skeleton-shimmer h-12 w-full mt-auto rounded-lg"></div>
            </div>
          </template>

          <template v-else-if="sortedPlans.length > 0">
            <div
                v-for="(plan, index) in sortedPlans"
                :key="plan.id"
                class="reveal-card flex-none w-[350px] flex flex-col"
                :style="{ transitionDelay: `${index * 100}ms` }"
            >
              <div
                  :class="[
            'pricing-card rounded-3xl p-8 transition-all duration-300 flex flex-col flex-grow bg-white relative h-full',
            plan.isPopular ? 'shadow-2xl border-2 border-[#00C49F]' : 'shadow-lg border border-gray-200'
          ]"
              >
                <div v-if="plan.isPopular" class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <span class="bg-[#00C49F] text-white px-4 py-1 rounded-full text-sm font-medium uppercase tracking-wide">Most Popular</span>
                </div>

                <div class="text-center mb-8">
                  <h3 class="text-2xl font-bold text-gray-900 mb-3">{{ plan.title }}</h3>
                  <div class="text-4xl font-bold text-gray-900 mb-2">
                    ${{ plan.price }}<span class="text-lg text-gray-500">/month</span>
                  </div>
                  <p class="text-gray-600 text-sm h-12">{{ plan.description }}</p>
                </div>

                <ul class="space-y-4 mb-8 flex-grow">
                  <li v-for="(feature, fIndex) in plan.features" :key="fIndex"
                      class="flex items-start text-sm"
                      :class="feature.included ? '' : 'text-gray-400'">
                    <font-awesome-icon
                        :icon="feature.included ? ['fas', 'check'] : ['fas', 'xmark']"
                        :class="[feature.included ? 'text-green-500' : 'text-red-400', 'mt-1 mr-3 shrink-0']"
                    />
                    <span>{{ feature.text }}</span>
                  </li>
                </ul>

                <router-link to="/login"
                             :class="[
                         'mt-auto w-full block text-center py-3 rounded-lg font-medium transition duration-300',
                         plan.isPopular
                           ? 'bg-[#00C49F] text-white hover:bg-teal-600'
                           : 'bg-gray-100 text-black hover:bg-gray-200 hover:text-gray-900'
                       ]">
                  {{ plan.buttonText }}
                </router-link>
              </div>
            </div>
          </template>

          <div v-else class="w-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <h3 class="text-xl font-semibold text-gray-900">Unable to load plans</h3>
            <button @click="fetchData" class="mt-4 text-[#00C49F] font-bold">Retry Fetch</button>
          </div>
        </div>
      </div>
      <div class="text-center mt-16 reveal-card">
        <p class="text-gray-600 mb-4">Need a custom solution for your enterprise?</p>
        <a href="#" class="inline-flex items-center text-[#00C49F] font-medium hover:text-teal-700 transition">
          Contact our sales team for a custom quote
          <i class="fas fa-arrow-right ml-2"></i>
        </a>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
import { useSubscriptionStore } from '@/stores/subscriptionStore.js';

interface Plan {
  id: number;
  name: string;
  price: number;
  description: string;
  is_popular: boolean;
  sort_order?: number;
  user_limit: number;
  ai_agents_count: number;
  api_calls_per_month: number;
  ai_tokens_per_month:number;
  subscription_type_id?: number;
  tier?: string;
  is_active:boolean;
}
// const scrollContainer = ref(null);


// Create a computed property to ensure the popular plan is index 0
const sortedPlans = computed(() => {
  return [...pricingPlans.value]
      .filter(plan => plan.is_active) // Adjust property name to match your data structure
      .sort((a, b) => {
        if (a.isPopular === b.isPopular) return 0;
        return a.isPopular ? -1 : 1;
      });
});
const scrollContainer = ref<HTMLElement | null>(null);
const scroll = (direction:any) => {
  if (scrollContainer.value) {
    // Card width (350) + Gap (40)
    const scrollAmount = 390;
    scrollContainer.value.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }
};
const subStore = useSubscriptionStore();
const isLoading = ref(true);

const pricingPlans = computed(() => {
  // Use 'as any' to avoid the never[] TS error
  const rawData = subStore.subscriptions as any;

  // Logic: Is it the full response object or just the array?
  // Your log says keys are ["0", "1", "2"], so rawData IS the array.
  const rawPlans: Plan[] = Array.isArray(rawData)
      ? rawData
      : (rawData?.data?.plans || []);

  if (rawPlans.length === 0) return [];

  return rawPlans
      .map((plan: Plan) => ({
        id: plan.id,
        title: plan.name,
        is_active:plan.is_active,
        price: plan.price,
        description: plan.description,
        isPopular: plan.is_popular,
        buttonText: plan.price === 0 ? 'Start Free' : 'Get Started',
        sortOrder: plan.sort_order || 0,
        features: [
          { text: `Up to ${plan.user_limit} Users`, included: true },
          { text: `${plan.ai_agents_count} AI Agents`, included: plan.ai_agents_count > 0 },
          { text: `${plan.api_calls_per_month?.toLocaleString() || 0} API Calls`, included: true },
          { text: `${plan.ai_tokens_per_month?.toLocaleString() || 0} AI Tokens`, included: true },

        ]
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder);
});

const fetchData = async () => {
  isLoading.value = true;
  try {
    await subStore.fetchSubscriptionList();
    // Verify in console
    console.log("Processed Plans:", pricingPlans.value);
  } catch (error) {
    console.error("Fetch error:", error);
  } finally {
    setTimeout(() => {
      isLoading.value = false;
      initAnimations();
    }, 500);
  }
};

const initAnimations = async () => {
  await nextTick();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal-card').forEach((el) => observer.observe(el));
};

onMounted(fetchData);
</script>

<style scoped>
/* Hide scrollbar for Chrome, Safari and Opera */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.no-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
.text-gradient {
  background: linear-gradient(135deg, #00C49F 0%, #FFB039 50%, #9333EA 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.reveal-card {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.7s ease-out;
}
.reveal-card.visible {
  opacity: 1;
  transform: translateY(0);
}

.pricing-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

/* Skeleton Effect - Fixed with background shorthand */
.skeleton-shimmer {
  background: #f6f7f8 linear-gradient(90deg, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%) no-repeat;
  background-size: 800px 100%;
  animation: shimmer 1.5s infinite linear;
}

@keyframes shimmer {
  0% { background-position: -468px 0; }
  100% { background-position: 468px 0; }
}
</style>