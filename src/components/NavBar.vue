<template>
  <header
      class=" transition-all fixed top-0 duration-300  z-40 head"
      :class="isScrolled ? 'bg-white shadow-sm border-b border-gray-100' : 'bg-white/80 backdrop-blur-xl border-b border-transparent'"
  >
    <nav class="mx-auto px-6">
      <div class="flex h-16 items-center justify-between">
<div class="flex-1 basis-0 items-center gap-2">
        <router-link to="/" >
          <img
              src="../assets/images/sentra.png"
              alt="Sentra AI"
              class="h-9 w-auto"
          />
        </router-link>
</div>
        <div class="hidden shrink-0 lg:flex items-center gap-8">
          <router-link
              v-for="item in displayMenu"
              :key="item.label"
              :to="item.to"
              class="text-sm font-medium text-gray-600 hover:text-[#00C49F] transition relative group"
          >
            {{ item.label }}
            <span
                class="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00C49F] transition-all group-hover:w-full"
            ></span>
          </router-link>
        </div>

        <div class="hidden flex-1  justify-end basis-0 lg:flex items-center  gap-4">
          <template v-if="isAuthenticated">
            <language-drop-down/>
            <UserProfile />
          </template>

          <template v-else>
            <router-link
                to="/login"
                class="text-sm font-medium text-gray-600 hover:text-gray-900 transition"
            >
              Sign in
            </router-link>

            <router-link
                :to="{ path: '/', hash: '#pricing' }"
                class="px-5 py-2 text-sm font-semibold text-white bg-[#00C49F]
                     rounded-lg hover:bg-teal-600 transition shadow-md"
            >
              Get Started
            </router-link>
          </template>
        </div>

        <button
            class="lg:hidden text-gray-700"
            @click="toggleMobileMenu"
        >
          <font-awesome-icon
              :icon="mobileMenuOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'"
              class="text-xl"
          />
        </button>
      </div>
    </nav>

    <transition name="mobile">
      <div
          v-if="mobileMenuOpen"
          class="lg:hidden bg-white border-t shadow-lg"
      >
        <div class="px-6 py-6 space-y-5">
          <router-link
              v-for="item in displayMenu"
              :key="item.label"
              :to="item.to"
              class="block text-gray-700 font-medium hover:text-[#00C49F]"
              @click="closeMobileMenu"
          >
            {{ item.label }}
          </router-link>

          <div class="pt-4 border-t space-y-3">
            <template v-if="isAuthenticated">
              <div class="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <span class="text-sm font-medium text-gray-600">Account</span>
                <UserProfile />
              </div>
            </template>

            <template v-else>
              <router-link
                  to="/login"
                  class="block text-center text-gray-700 font-medium hover:text-[#00C49F]"
                  @click="closeMobileMenu"
              >
                Sign in
              </router-link>

              <router-link
                  :to="{ path: '/', hash: '#pricing' }"
                  class="block text-center py-2 bg-[#00C49F] text-white rounded-lg font-semibold hover:bg-teal-600"
                  @click="closeMobileMenu"
              >
                Get Started
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import UserProfile from '@/components/header/userProfile.vue';
import LanguageDropDown from "@/components/header/languageDropDown.vue";
import {useTranslationStore} from "@/stores/translationStore.js";

const authStore = useAuthStore();
const route = useRoute();

const mobileMenuOpen = ref(false);
const isScrolled = ref(false);
const isHomePage = ref(true);

// ✅ use store getter directly
const isAuthenticated = computed(() => authStore.isAuthenticated);

watch(() => route.path, (newPath) => {
  isHomePage.value = newPath === '/';
}, { immediate: true });

const displayMenu = computed(() => {
  const links = [
    { label: transStore.t('nav.home'), to: { path: "/", hash: "#heroSection" } },
    { label: transStore.t('nav.feature'), to: { path: "/", hash: "#features" } },
    { label: transStore.t('nav.solutions'), to: { path: "/", hash: "#services" } },
    { label: transStore.t('nav.pricing'), to: { path: "/", hash: "#pricing" } },
    { label: transStore.t('nav.about'), to: { path: "/", hash: "#about" } },

  ];

  if (isAuthenticated.value) {
    links.push({ label: transStore.t('nav.dashboard'), to: "/admin/dashboard" });
  }

  return links;
});

const transStore = useTranslationStore();
onMounted(async () => {

});
onMounted(() => {
  window.addEventListener("scroll", handleScroll);

});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 30;
};
</script>


<style scoped>
.mobile-enter-active,
.mobile-leave-active {
  transition: all 0.25s ease;
}
.mobile-enter-from,
.mobile-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.head{
  width: -webkit-fill-available;
}
</style>