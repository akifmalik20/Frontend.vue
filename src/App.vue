<template>
  <div id="app">
    <router-view />

    <!-- AI Assistant - Available on all pages -->
    <AiChatAssistant v-if="authStore.isAuthenticated && !authStore.isAdmin" />
    <FloatingSwitchUser v-if="authStore.isAuthenticated" />
    <div v-if="isTranslation" class="fixed inset-0 z-[999] flex items-center justify-center bg-white/50 backdrop-blur-sm">
      <div class="flex flex-col items-center gap-4">
        <font-awesome-icon :icon="['fas', 'spinner']" class="w-12 h-12 text-teal-600 animate-spin" />
        <p class="text-teal-900 font-bold animate-pulse">Loading Translation..</p>
      </div>
    </div>
    <!-- Onboarding / product tours -->
    <OnboardingTour />

  </div>
</template>

<script>
import { onMounted, watch ,ref} from 'vue'
// @ts-ignore
import { useAuthStore } from './stores/authStore'
import { useTranslationStore } from './stores/translationStore.js'
import AiChatAssistant from './components/AiChatAssistant.vue'
import FloatingSwitchUser from "@/components/impersonation/FloatingSwitchUser.vue";
import OnboardingTour from "@/components/onboarding/OnboardingTour.vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

export default {
  name: 'App',
  components: {
    FontAwesomeIcon,
    FloatingSwitchUser,
    AiChatAssistant,
    OnboardingTour
  },
  setup() {
    const authStore = useAuthStore()
    const transStore = useTranslationStore()
    const isTranslation = ref(false);

    // ===========================================
    // IMPERSONATION CHECK - CRITICAL FOR SWITCH USER
    // ===========================================
    const checkImpersonationStatus = async () => {
      if (authStore.accessToken) {
        try {
          await authStore.checkImpersonation();
        } catch (error) {
          console.error('❌ Impersonation check failed:', error);
        }
      }
    };

    // ===========================================
    // WATCH FOR TOKEN CHANGES
    // ===========================================
    watch(() => authStore.accessToken, async (newToken, oldToken) => {
      if (newToken && newToken !== oldToken) {
        await authStore.checkImpersonation();
      }
    });

    // ===========================================
    // WATCH FOR IMPERSONATION STATE CHANGES
    // ===========================================
    watch(() => authStore.impersonating, (newVal) => {
      if (newVal) {
        console.log('Now impersonating:', authStore.userProfile?.full_name);
      } else {
        console.log('Returned to admin mode');
      }
    });


    // ===========================================
    // MOUNTED - INITIALIZATION
    // ===========================================
    onMounted(async () => {


      isTranslation.value = true;

      await transStore.loadTranslations();


      isTranslation.value = false;
      // 2. CHECK IMPERSONATION STATUS FIRST - CRITICAL!
      await checkImpersonationStatus();

      // 3. Log authentication status
      if (authStore.isAuthenticated) {


        // Log impersonation status clearly
        if (authStore.isImpersonating) {

          console.log('   Return to admin button should appear');
        } else {
          console.log('Normal admin mode - Switch User button should appear');
        }
      } else {
        console.log('No active session found. Redirecting to login may be handled by router guards.');
      }
    });

    return {
      authStore,
      transStore,
      isTranslation
    }
  }
}
</script>

<style>
/* Global styles */
body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Ensure chat assistant is always on top */
#app {
  position: relative;
}
</style>