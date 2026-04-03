<script setup lang="ts">
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {useTranslationStore} from "@/stores/translationStore";
const transStore=useTranslationStore();
</script>
<template>
  <div class="flex flex-col items-center justify-center min-h-[70vh] px-4">
    <div class="max-w-md w-full bg-grey rounded-xl  p-8">
      <div class="text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <font-awesome-icon icon="fa-solid fa-lock" class="text-2xl text-red-500" />
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">{{transStore.t('access.denied')}}</h2>
        <p class="text-gray-600 mb-6">
          {{transStore.t('access.description')}}
        </p>
        <router-link to="/admin/dashboard">
          <button class="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">
            {{transStore.t('access.go.back')}}
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>