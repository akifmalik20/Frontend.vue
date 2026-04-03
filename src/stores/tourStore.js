import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';

/**
 * Simple onboarding / product tour store.
 * - Holds current tour + step.
 * - Persists completed tours per user in localStorage.
 */
export const useTourStore = defineStore('tour', () => {
  const isRunning = ref(false);
  const currentTourId = ref(null);
  const steps = ref([]);
  const currentStepIndex = ref(0);

  const currentStep = computed(() => {
    if (!isRunning.value || !steps.value.length) return null;
    return steps.value[currentStepIndex.value] || null;
  });

  const hasNext = computed(
    () => isRunning.value && currentStepIndex.value < steps.value.length - 1
  );
  const hasPrev = computed(() => isRunning.value && currentStepIndex.value > 0);

  function getUserScopedKey(tourId) {
    try {
      const authStore = useAuthStore();
      const userId = authStore.userProfile?.id || authStore.user?.user_id || 'guest';
      return `sentra_tour_seen_${tourId}_${userId}`;
    } catch (e) {
      // Fallback if auth store is not ready
      return `sentra_tour_seen_${tourId}_global`;
    }
  }

  function hasCompleted(tourId) {
    const key = getUserScopedKey(tourId);
    return localStorage.getItem(key) === '1';
  }

  function markCompleted(tourId) {
    const key = getUserScopedKey(tourId);
    localStorage.setItem(key, '1');
  }

  /**
   * Start a tour with the given id and steps.
   * steps: [{ id, selector, title, description, placement }]
   */
  function startTour(tourId, tourSteps) {
    if (!tourSteps || !tourSteps.length) return;
    currentTourId.value = tourId;
    steps.value = tourSteps;
    currentStepIndex.value = 0;
    isRunning.value = true;
  }

  /**
   * Only start a tour automatically if the user hasn't completed it yet.
   */
  function maybeStartOnce(tourId, tourSteps) {
    if (hasCompleted(tourId)) return;
    startTour(tourId, tourSteps);
  }

  function nextStep() {
    if (!isRunning.value) return;
    if (currentStepIndex.value < steps.value.length - 1) {
      currentStepIndex.value += 1;
    } else {
      // Last step -> complete
      completeTour();
    }
  }

  function prevStep() {
    if (!isRunning.value) return;
    if (currentStepIndex.value > 0) {
      currentStepIndex.value -= 1;
    }
  }

  function stopTour() {
    isRunning.value = false;
    steps.value = [];
    currentStepIndex.value = 0;
    currentTourId.value = null;
  }

  function skipTour() {
    stopTour();
  }

  function completeTour() {
    if (currentTourId.value) {
      markCompleted(currentTourId.value);
    }
    stopTour();
  }

  return {
    // state
    isRunning,
    currentTourId,
    steps,
    currentStepIndex,

    // derived
    currentStep,
    hasNext,
    hasPrev,

    // actions
    startTour,

    nextStep,
    prevStep,
    skipTour,


    // helpers

  };
});

