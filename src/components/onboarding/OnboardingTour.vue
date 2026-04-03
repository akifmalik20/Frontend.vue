<template>
  <div v-if="tourStore.isRunning && currentStep" class="fixed inset-0 z-[9998]">
    <!-- Dimmed background -->
    <div class="fixed inset-0 bg-black bg-opacity-50"></div>

    <!-- Highlight box around target -->
    <div
      v-if="highlightRect"
      class="fixed border-2 border-teal-400 rounded-xl shadow-lg pointer-events-none bg-white bg-opacity-5"
      :style="highlightStyle"
    ></div>

    <!-- Tooltip / instruction card -->
    <div
      class="fixed z-[10000] max-w-xs bg-white rounded-xl shadow-2xl border border-gray-100 p-4 text-sm"
      :style="tooltipStyle"
    >
      <p class="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1">
        Step {{ stepIndexDisplay }} of {{ totalSteps }}
      </p>

      <h3 class="text-base font-bold text-gray-900 mb-1">
        {{ currentStep.title }}
      </h3>

      <p class="text-xs text-gray-600 mb-3">
        {{ currentStep.description }}
      </p>

      <div class="flex items-center justify-between">
        <button
          type="button"
          class="text-xs text-gray-400 hover:text-gray-600"
          @click="handleSkip"
        >
          Skip tour
        </button>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="px-2 py-1 text-xs rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            :disabled="!tourStore.hasPrev"
            @click="tourStore.prevStep"
          >
            Back
          </button>
          <button
            type="button"
            class="px-3 py-1.5 text-xs rounded-md bg-teal-500 text-white hover:bg-teal-600 shadow-sm"
            @click="handleNext"
          >
            {{ tourStore.hasNext ? 'Next' : 'Finish' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick, onBeforeUnmount } from 'vue';
import { useTourStore } from '@/stores/tourStore';

const tourStore = useTourStore();

const highlightRect = ref(null);

const currentStep = computed(() => tourStore.currentStep);
const totalSteps = computed(() => tourStore.steps.length);
const stepIndexDisplay = computed(() => tourStore.currentStepIndex + 1);

function updateHighlight() {
  const step = currentStep.value;
  if (!step || !step.selector) {
    highlightRect.value = null;
    return;
  }

  const el = document.querySelector(step.selector);
  if (!el) {
    highlightRect.value = null;
    return;
  }

  const rect = el.getBoundingClientRect();
  el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

  highlightRect.value = {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height,
    placement: step.placement || 'right',
  };
}

const highlightStyle = computed(() => {
  if (!highlightRect.value) return {};
  const padding = 8;
  return {
    top: `${highlightRect.value.top - padding}px`,
    left: `${highlightRect.value.left - padding}px`,
    width: `${highlightRect.value.width + padding * 2}px`,
    height: `${highlightRect.value.height + padding * 2}px`,
  };
});

const tooltipStyle = computed(() => {
  const defaultStyle = {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  };

  if (!highlightRect.value) return defaultStyle;

  const { top, left, width, height, placement } = highlightRect.value;
  const margin = 12;

  if (placement === 'bottom') {
    return {
      top: `${top + height + margin}px`,
      left: `${left + width / 2}px`,
      transform: 'translateX(-50%)',
    };
  }

  if (placement === 'left') {
    return {
      top: `${top + height / 2}px`,
      left: `${left - margin}px`,
      transform: 'translate(-100%, -50%)',
    };
  }

  if (placement === 'top') {
    return {
      top: `${top - margin}px`,
      left: `${left + width / 2}px`,
      transform: 'translate(-50%, -100%)',
    };
  }

  // default: right
  return {
    top: `${top + height / 2}px`,
    left: `${left + width + margin}px`,
    transform: 'translateY(-50%)',
  };
});

function handleNext() {
  tourStore.nextStep();
}

function handleSkip() {
  tourStore.skipTour();
}

// Recalculate highlight whenever the current step changes
watch(
  () => currentStep.value,
  () => {
    nextTick(() => updateHighlight());
  },
  { immediate: true }
);

// Adjust when window resizes
function handleResize() {
  if (tourStore.isRunning) {
    updateHighlight();
  }
}

window.addEventListener('resize', handleResize);
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
/* Prevent body from scrolling while tour is active if needed */
</style>

