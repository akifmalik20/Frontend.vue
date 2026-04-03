<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">{{transStore.t('dashboard.sentra')}}</h1>
          </div>
          <div class="flex items-center">
            <span class="text-gray-700 mr-4">{{transStore.t('dashboard.welcome')}}, {{ authStore.user?.email }}</span>
            <button
                @click="handleLogout"
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
            >
              {{transStore.t('dashboard.logout')}}
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="border-4 border-dashed border-gray-200 rounded-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">{{transStore.t('dashboard.welcome.to.sentra')}}</h2>
          <p class="text-gray-600 mb-6">{{transStore.t('dashboard.logged.in')}}</p>

          <div class="bg-white shadow rounded-lg p-6 mb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">{{transStore.t('dashboard.user.information')}}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500">{{transStore.t('dashboard.email')}}</p>
                <p class="font-medium">{{ authStore.user?.email }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Role</p>
                <p class="font-medium">{{ authStore.user?.roles?.[0] || 'User' }}</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div class="flex items-center">
                <div class="p-3 bg-blue-100 rounded-lg mr-4">
                  <font-awesome-icon icon="fa-solid fa-phone" class="text-blue-600" />
                </div>
                <div>
                  <h4 class="font-medium text-gray-900">{{transStore.t('dashboard.call.center')}}</h4>
                  <p class="text-sm text-gray-500">{{transStore.t('dashboard.manage.calls')}}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
// @ts-ignore
import { useAuthStore } from '@/stores/authStore.js'
import {useTranslationStore} from "@/stores/translationStore.js";

const authStore = useAuthStore()
const router = useRouter()
const transStore=useTranslationStore()
onMounted(() => {
  // Check if session exists
  if (!authStore.isAuthenticated) {
    router.push('/login')
  }
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>