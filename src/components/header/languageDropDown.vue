<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { storeToRefs } from 'pinia';
import { useTranslationStore } from '@/stores/translationStore';
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

const authStore = useAuthStore();
const translationStore = useTranslationStore();
const {
  languages,
  userLanguage,
  userLanguageName
} = storeToRefs(authStore);
const isLoadingTranslation = ref(false);

const isLangOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

// Toggle function
const toggleDropdown = () => {
  isLangOpen.value = !isLangOpen.value;
};

// Robust Click Outside Logic
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isLangOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});

const changeLanguage = async (code: string) => {
  isLoadingTranslation.value = true;

  const success = await authStore.updateUserLanguage(code);
  if (success) {
    await translationStore.setLanguage(code);
    isLangOpen.value = false;
    isLoadingTranslation.value = false;

  }
};
</script>

<template>
  <div class="relative flex items-center h-full" ref="dropdownRef">
    <button
        @click="toggleDropdown"
        class="flex items-center space-x-2 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200"
        :class="{ 'bg-gray-100': isLangOpen }"
    >
      <div class="flex items-center justify-center w-7 h-7 bg-teal-50 rounded-full">
        <font-awesome-icon icon="fa-solid fa-globe" class="text-[#00C49F] text-xs" />
      </div>

      <span class="text-sm font-semibold text-slate-700 hidden sm:block">
        {{ userLanguageName || "EN" }}
      </span>

      <font-awesome-icon
          icon="fa-solid fa-chevron-down"
          class="text-[9px] text-gray-400 transition-transform duration-300"
          :class="{ 'rotate-180': isLangOpen }"
      />
    </button>

    <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform scale-95 opacity-0 translate-y-1"
        enter-to-class="transform scale-100 opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform scale-100 opacity-100 translate-y-0"
        leave-to-class="transform scale-95 opacity-0 translate-y-1"
    >
      <div
          v-if="isLangOpen"
          class="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-xl z-[1000] overflow-hidden"
      >
        <div class="p-1.5">
          <div v-if="!languages?.length" class="px-4 py-3 text-xs text-gray-400 italic">
            No languages available
          </div>

          <button
              v-for="lang in languages"
              :key="lang.code"
              @click="changeLanguage(lang.code)"
              class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 group"
              :class="userLanguage === lang.code ? 'bg-teal-50 text-[#00C49F]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
          >
            <span class="font-medium">
              {{ lang.name }}
            </span>

            <font-awesome-icon
                v-if="userLanguage === lang.code"
                icon="fa-solid fa-check"
                class="text-[10px]"
            />
          </button>
        </div>
      </div>
    </Transition>
    <Teleport to="body">
      <div v-if="isLoadingTranslation" class="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 backdrop-blur-md">
        <div class="flex flex-col items-center gap-4">
          <font-awesome-icon :icon="['fas', 'spinner']" class="w-12 h-12 text-teal-600 animate-spin" />
          <p class="text-teal-900 font-bold animate-pulse text-lg">Loading Translations...</p>
        </div>
      </div>
    </Teleport>
  </div>

</template>

<style scoped>
/* Optional: Ensures the text doesn't wrap in the navbar */
span {
  white-space: nowrap;
}
</style>