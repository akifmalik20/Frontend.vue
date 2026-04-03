<script setup lang="ts">
import { useLogin } from '@/composables/useLogin';

const {
  form,
  errors,
  errorMessage,
  successMessage,
  authStore,
  handleLogin,
  isTranslationLogin
} = useLogin();
</script>


<template>
  <div class="min-h-screen flex relative">
    <!-- Left Side: Login Form -->
    <div v-if="isTranslationLogin" class="fixed inset-0 z-[999] flex items-center justify-center bg-white/50 backdrop-blur-sm">
      <div class="flex flex-col items-center gap-4">
        <font-awesome-icon :icon="['fas', 'spinner']" class="w-12 h-12 text-teal-600 animate-spin" />
        <p class="text-teal-900 font-bold animate-pulse">Loading Translation..</p>
      </div>
    </div>
    <div class="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-gradient-to-br from-gray-50 to-gray-100">
      <div class="mx-auto w-full max-w-sm lg:w-96">
        <div class="relative">
          <div class="flex flex-col items-center text-center">
            <div class="flex items-center justify-center">
              <img src="/src/assets/images/sentra.png" alt="Sentra AI Logo" class="h-auto w-48">
            </div>
            <div class="mt-8">
              <h2 class="text-2xl font-bold text-[#1F2937]">Sign in to your account</h2>
              <p class="mt-2 text-sm text-gray-600">
                AI-powered customer communication platform
              </p>
            </div>
          </div>
        </div>

        <div v-if="errorMessage || successMessage" class="mt-4 animate-fade-in">
          <div v-if="errorMessage" class="mb-2">
            <div class="bg-red-50 border border-red-200 rounded-lg p-3 shadow-sm">
              <div class="flex items-center">
                <font-awesome-icon icon="fa-solid fa-exclamation-circle" class="text-red-500 mr-2 flex-shrink-0" />
                <span class="text-red-700 text-sm">{{ errorMessage }}</span>
              </div>
            </div>
          </div>

          <div v-if="successMessage" class="mb-2">
            <div class="bg-green-50 border border-green-200 rounded-lg p-3 shadow-sm">
              <div class="flex items-center">
                <font-awesome-icon icon="fa-solid fa-check-circle" class="text-green-500 mr-2 flex-shrink-0" />
                <span class="text-green-700 text-sm">{{ successMessage }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6">
          <form @submit.prevent="handleLogin" class="space-y-6">
            <div>
              <label for="email" class="block text-sm font-medium text-[#1F2937]">Email</label>
              <div class="mt-1 relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <font-awesome-icon icon="fa-solid fa-user" class="text-gray-400" />
                </div>
                <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    required
                    class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00897B] focus:border-[#00897B] sm:text-sm"
                    placeholder="Enter your email"
                    :class="{ 'border-red-500': errors.email }"
                >
                <span v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</span>
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between">
                <label for="password" class="block text-sm font-medium text-[#1F2937]">Password</label>
                <!-- ✅ UPDATED: Changed from # to router-link -->
                <router-link
                    to="/password-reset"
                    class="text-sm font-medium text-[#00897B] hover:text-[#00695C] transition-colors duration-200"
                >
                  Forgot password?
                </router-link>
              </div>
              <div class="mt-1 relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <font-awesome-icon icon="fa-solid fa-lock" class="text-gray-400" />
                </div>
                <input
                    id="password"
                    v-model="form.password"
                    type="password"
                    required
                    class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00897B] focus:border-[#00897B] sm:text-sm"
                    placeholder="Enter your password"
                    :class="{ 'border-red-500': errors.password }"
                >
                <span v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</span>
              </div>
            </div>

            <div class="flex items-center">
              <input id="remember-me" v-model="form.remember" type="checkbox" class="h-4 w-4 text-[#00897B] border-gray-300 rounded">
              <label for="remember-me" class="ml-2 block text-sm text-[#1F2937]">Remember me</label>
            </div>

            <div>
              <button
                  type="submit"
                  :disabled="authStore.loading"
                  class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#00897B] hover:bg-[#00695C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00897B] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <font-awesome-icon
                    :icon="authStore.loading ? 'fa-solid fa-spinner' : 'fa-solid fa-sign-in-alt'"
                    :class="{ 'fa-spin': authStore.loading }"
                    class="mr-2 h-4 w-4"
                />
                <span>{{ authStore.loading ? 'Signing in...' : 'Sign in' }}</span>
              </button>
            </div>

            <!-- Simple Back Arrow Below -->
            <div class="flex justify-center mt-4">
              <router-link to="/"
                           class="inline-flex items-center justify-center w-10 h-10 text-gray-500 hover:text-[#00897B] hover:bg-gray-100 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                           aria-label="Go back">
                <font-awesome-icon icon="fa-solid fa-arrow-left" class="text-lg" />
              </router-link>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Right Side: Info Panel -->
    <div class="hidden lg:flex relative flex-1 bg-gradient-to-br from-[#008d73] to-[#00725a]">
      <!-- Abstract Background Pattern -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute top-20 right-20 w-64 h-64 rounded-full bg-gradient-to-br from-[#00897B] to-transparent"></div>
        <div class="absolute bottom-20 left-20 w-48 h-48 rounded-full bg-gradient-to-tr from-[#00695C] to-transparent"></div>
      </div>

      <div class="relative flex flex-col justify-center px-12 py-12 text-white">
        <div class="max-w-lg">
          <!-- Icon -->
          <div class="mb-8">
            <div class="w-16 h-16 rounded-xl bg-[#00897B] flex items-center justify-center shadow-lg">
              <font-awesome-icon icon="fa-solid fa-headset" class="text-2xl" />
            </div>
          </div>

          <!-- Heading -->
          <h1 class="text-4xl text-white font-bold mb-4 leading-tight">Intelligent Customer Experience</h1>

          <!-- Description -->
          <p class="text-lg mb-8 text-gray-200">
            AI-powered voice agents for call centers, customer service, HR, and chat support with complete analytics and management platform.
          </p>

          <!-- Features List -->
          <div class="space-y-6 mb-8">
            <div class="flex items-start">
              <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-[#00897B]/20 flex items-center justify-center mr-4">
                <font-awesome-icon icon="fa-solid fa-phone-volume" class="text-[#80CBC4]" />
              </div>
              <div>
                <h3 class="font-semibold text-white">Inbound & Outbound Call Support</h3>
                <p class="text-gray-300 text-sm mt-1">Multi-channel Communication</p>
              </div>
            </div>

            <div class="flex items-start">
              <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-[#00897B]/20 flex items-center justify-center mr-4">
                <font-awesome-icon icon="fa-solid fa-chart-bar" class="text-[#80CBC4]" />
              </div>
              <div>
                <h3 class="font-semibold text-white">Advanced Analytics & Reporting</h3>
                <p class="text-gray-300 text-sm mt-1">Real-time insights and performance metrics</p>
              </div>
            </div>

            <div class="flex items-start">
              <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-[#00897B]/20 flex items-center justify-center mr-4">
                <font-awesome-icon icon="fa-solid fa-record-vinyl" class="text-[#80CBC4]" />
              </div>
              <div>
                <h3 class="font-semibold text-white">Call Recording & Transcription</h3>
                <p class="text-gray-300 text-sm mt-1">Automatic voice-to-text conversion</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<!--<script setup lang="ts">-->
<!--import { ref, reactive, onMounted, onUnmounted } from 'vue'-->
<!--import { useRouter } from 'vue-router'-->
<!--import { useAuthStore } from '../../stores/authStore'-->
<!--import {useTranslationStore} from "@/stores/translationStore";-->

<!--const router = useRouter()-->
<!--const authStore = useAuthStore()-->

<!--const form = reactive({-->
<!--  email: '',-->
<!--  password: '',-->
<!--  remember: false-->
<!--})-->

<!--const errorMessage = ref('')-->
<!--const successMessage = ref('')-->
<!--const errors = reactive({ email: '', password: '' })-->
<!--let messageTimeout: any = null-->

<!--const clearMessages = () => {-->
<!--  if (messageTimeout) clearTimeout(messageTimeout)-->
<!--  errorMessage.value = ''-->
<!--  successMessage.value = ''-->
<!--}-->

<!--onUnmounted(() => {-->
<!--  authStore.loading = false;-->
<!--});-->

<!--const showMessage = (type: 'error' | 'success', message: string) => {-->
<!--  clearMessages()-->
<!--  if (type === 'error') errorMessage.value = message-->
<!--  else successMessage.value = message-->
<!--  messageTimeout = setTimeout(() => clearMessages(), 5000)-->
<!--}-->
<!--const transStore = useTranslationStore()-->
<!--const handleLogin = async () => {-->
<!--  errors.email = ''-->
<!--  errors.password = ''-->
<!--  clearMessages()-->

<!--  if (!form.email) errors.email = 'Email is required'-->
<!--  if (!form.password) errors.password = 'Password is required'-->
<!--  if (errors.email || errors.password) return-->

<!--  try {-->
<!--    await authStore.login({ email: form.email, password: form.password })-->

<!--    if (form.remember) localStorage.setItem('rememberedEmail', form.email)-->
<!--    else localStorage.removeItem('rememberedEmail')-->

<!--    showMessage('success', 'Login successful! Redirecting...')-->
<!--    setTimeout(() => router.push('/admin'), 1500)-->
<!--    await transStore.loadTranslations();-->
<!--  } catch (err: any) {-->
<!--    showMessage('error', err.response?.data?.detail || 'Login failed. Please check credentials.')-->
<!--  }-->
<!--}-->

<!--onMounted(() => {-->
<!--  const rememberedEmail = localStorage.getItem('rememberedEmail')-->
<!--  if (rememberedEmail) {-->
<!--    form.email = rememberedEmail-->
<!--    form.remember = true-->
<!--  }-->
<!--})-->

<!--onUnmounted(() => clearMessages())-->
<!--</script>-->

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fade-in 0.3s ease-out; }
.fa-spin { animation: spin 1s infinite linear; }
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Custom scrollbar for the page */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #00897B;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #00695C;
}
</style>