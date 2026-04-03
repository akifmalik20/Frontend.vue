<script setup lang="ts">
import {useTranslationStore} from "@/stores/translationStore";

defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Details' },
  itemId: [String, Number]
});

defineEmits(['close']);
const transStore=useTranslationStore();
</script>

<template>
  <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center
           bg-black/50 backdrop-blur-sm"
  >
    <div
        class="bg-white rounded-2xl shadow-2xl
             w-full max-w-3xl max-h-[90vh]
             flex flex-col border border-gray-100
             mx-4 my-6"
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-100 bg-indigo-50/50
                  flex justify-between items-center shrink-0 rounded-t-2xl">
        <div>
          <h3 class="text-xl font-bold text-[#008d73]">{{ title }}</h3>
          <p v-if="itemId" class="text-xs text-[#008d73] font-medium">
            ID: #{{ itemId }}
          </p>
        </div>
        <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 text-2xl"
        >
          &times;
        </button>
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto px-6 py-6">
        <slot />
      </div>

      <!-- Footer -->
      <div
          class="px-6 py-4 bg-gray-50 flex justify-end gap-3
               shrink-0 rounded-b-2xl"
      >
        <slot name="footer">
          <button
              @click="$emit('close')"
              class="px-5 py-2 bg-white border border-gray-200
                   text-gray-700 rounded-lg text-sm font-bold
                   hover:bg-gray-50 transition shadow-sm"
          >
            {{transStore.t('close')}}
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>


<style scoped>

</style>