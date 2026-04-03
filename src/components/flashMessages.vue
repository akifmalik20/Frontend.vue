<template>
  <!-- Flash Messages Container -->
  <Transition name="toast">
    <div
        v-if="props.message"
        class="fixed top-20 right-6 z-[60] max-w-md w-full"
    >
      <div
          class="relative overflow-hidden rounded-2xl shadow-2xl transform transition-all duration-300 ease-out"
          :class="{
          'bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500': props.message?.type === 'success',
          'bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500': props.message?.type === 'error',
          'bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500': props.message?.type === 'info',
          'bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-500': props.message?.type === 'warning'
        }"
      >
        <!-- Header -->
        <div class="px-5 py-4 flex items-start gap-3">
          <!-- Icon -->
          <div
              class="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
              :class="{
              'bg-green-100 text-green-600': props.message?.type === 'success',
              'bg-red-100 text-red-600': props.message?.type === 'error',
              'bg-blue-100 text-blue-600': props.message?.type === 'info',
              'bg-amber-100 text-amber-600': props.message?.type === 'warning'
            }"
          >
            <!-- Success Icon -->
            <font-awesome-icon
                v-if="props.message?.type === 'success'"
                icon="fa-solid fa-check-circle"
                class="w-5 h-5"
            />

            <!-- Error Icon -->
            <font-awesome-icon
                v-else-if="props.message?.type === 'error'"
                icon="fa-solid fa-xmark-circle"
                class="w-5 h-5"
            />

            <!-- Info Icon -->
            <font-awesome-icon
                v-else-if="props.message?.type === 'info'"
                icon="fa-solid fa-circle-info"
                class="w-5 h-5"
            />

            <!-- Warning Icon -->
            <font-awesome-icon
                v-else
                icon="fa-solid fa-triangle-exclamation"
                class="w-5 h-5"
            />
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <h3
                class="text-base font-bold leading-6 mb-1"
                :class="{
                'text-green-800': props.message?.type === 'success',
                'text-red-800': props.message?.type === 'error',
                'text-blue-800': props.message?.type === 'info',
                'text-amber-800': props.message?.type === 'warning'
              }"
            >
              {{ props.message?.title }}
            </h3>

            <div
                v-if="props.message?.messages && props.message.messages.length > 0"
                class="space-y-1"
            >
              <p
                  v-for="(msg, index) in props.message.messages"
                  :key="index"
                  class="text-sm leading-relaxed"
                  :class="{
                  'text-green-700': props.message?.type === 'success',
                  'text-red-700': props.message?.type === 'error',
                  'text-blue-700': props.message?.type === 'info',
                  'text-amber-700': props.message?.type === 'warning'
                }"
              >
                {{ msg }}
              </p>
            </div>
          </div>

          <!-- Close Button -->
          <button
              @click="$emit('close')"
              class="flex-shrink-0 rounded-lg p-1.5 hover:bg-white/50 transition-colors duration-150 focus:outline-none focus:ring-2"
              :class="{
              'focus:ring-green-300': props.message?.type === 'success',
              'focus:ring-red-300': props.message?.type === 'error',
              'focus:ring-blue-300': props.message?.type === 'info',
              'focus:ring-amber-300': props.message?.type === 'warning'
            }"
              aria-label="Close notification"
          >
            <font-awesome-icon
                icon="fa-solid fa-xmark"
                class="w-4 h-4"
                :class="{
                'text-green-600': props.message?.type === 'success',
                'text-red-600': props.message?.type === 'error',
                'text-blue-600': props.message?.type === 'info',
                'text-amber-600': props.message?.type === 'warning'
              }"
            />
          </button>
        </div>

        <!-- Progress Bar (Auto-dismiss indicator) -->
        <div
            v-if="props.autoDismiss"
            class="h-1 bg-white/30 overflow-hidden"
        >
          <div
              class="h-full transition-all ease-linear"
              :class="{
              'bg-green-500': props.message?.type === 'success',
              'bg-red-500': props.message?.type === 'error',
              'bg-blue-500': props.message?.type === 'info',
              'bg-amber-500': props.message?.type === 'warning'
            }"
              :style="{ width: progressWidth + '%' }"
          ></div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

interface FlashMessage {
  title: string;
  messages?: string[];
  type: 'success' | 'error' | 'info' | 'warning';
}

interface Props {
  message: FlashMessage | null;
  autoDismiss?: boolean;
  duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  autoDismiss: true,
  duration: 5000
});

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const progressWidth = ref(100);
let autoDismissTimer: ReturnType<typeof setTimeout> | null = null;
let progressInterval: ReturnType<typeof setInterval> | null = null;

const startAutoDismiss = () => {
  if (!props.autoDismiss || !props.message) return;

  // Reset progress
  progressWidth.value = 100;

  // Start progress bar animation
  const startTime = Date.now();
  progressInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, 100 - (elapsed / props.duration) * 100);
    progressWidth.value = remaining;
  }, 50);

  // Set auto-dismiss timer
  autoDismissTimer = setTimeout(() => {
    emit('close');
  }, props.duration);
};

const clearTimers = () => {
  if (autoDismissTimer) {
    clearTimeout(autoDismissTimer);
    autoDismissTimer = null;
  }
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
};

// Watch for message changes to restart timer
watch(() => props.message, (newMessage) => {
  clearTimers();
  if (newMessage) {
    startAutoDismiss();
  }
}, { immediate: true });

onUnmounted(() => {
  clearTimers();
});
</script>

<style scoped>
/* Toast transition animations */
.toast-enter-active {
  animation: slideInRight 0.3s ease-out;
}

.toast-leave-active {
  animation: slideOutRight 0.3s ease-in;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes slideOutRight {
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(100%) scale(0.9);
  }
}

/* Hover pause effect */
.toast-enter-active:hover,
.toast-leave-active:hover {
  animation-play-state: paused;
}
</style>