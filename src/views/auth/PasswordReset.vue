<template>
  <div class="min-h-screen flex relative">
    <!-- Toast Notification -->
    <Transition name="toast">
      <div
          v-if="toast.show"
          class="fixed top-4 right-4 z-50 max-w-md"
      >
        <div
            :class="[
            'rounded-xl shadow-2xl p-4 border-l-4',
            toast.type === 'success' ? 'bg-white border-green-500' : 'bg-white border-red-500'
          ]"
        >
          <div class="flex items-start gap-3">
            <div
                :class="[
                'w-10 h-10 rounded-lg flex items-center justify-center',
                toast.type === 'success' ? 'bg-green-50' : 'bg-red-50'
              ]"
            >
              <font-awesome-icon
                  :icon="['fas', toast.type === 'success' ? 'check-circle' : 'exclamation-circle']"
                  :class="[
                  'w-5 h-5',
                  toast.type === 'success' ? 'text-green-600' : 'text-red-600'
                ]"
              />
            </div>
            <div class="flex-1">
              <h3
                  :class="[
                  'font-bold text-sm',
                  toast.type === 'success' ? 'text-green-900' : 'text-red-900'
                ]"
              >
                {{ toast.title }}
              </h3>
              <div
                  v-for="(msg, idx) in toast.messages"
                  :key="idx"
                  :class="[
                  'text-xs mt-1',
                  toast.type === 'success' ? 'text-green-700' : 'text-red-700'
                ]"
              >
                {{ msg }}
              </div>
            </div>
            <button
                @click="toast.show = false"
                class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <font-awesome-icon :icon="['fas', 'times']" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Left Side: Form -->
    <div class="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-gradient-to-br from-gray-50 to-gray-100">
      <div class="mx-auto w-full max-w-sm lg:w-96">
        <!-- Logo and Header -->
        <div class="relative">
          <div class="flex flex-col items-center text-center">
            <div class="flex items-center justify-center">
              <img src="/src/assets/images/sentra.png" alt="Sentra AI Logo" class="h-auto w-48">
            </div>
            <div class="mt-8">
              <h2 class="text-2xl font-bold text-[#1F2937]">
                {{ view === 'request' ? 'Forgot Password?' : view === 'confirm' ? 'Reset Password' : 'Success!' }}
              </h2>
              <p class="mt-2 text-sm text-gray-600">
                {{
                  view === 'request'
                      ? 'Enter your email to receive a password reset link'
                      : view === 'confirm'
                          ? 'Enter your new password below'
                          : 'Your password has been reset'
                }}
              </p>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="mt-6">
          <!-- REQUEST VIEW -->
          <form v-if="view === 'request'" @submit.prevent="handleRequestReset" class="space-y-6">
            <div>
              <label for="email" class="block text-sm font-medium text-[#1F2937]">Email Address</label>
              <div class="mt-1 relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <font-awesome-icon icon="fa-solid fa-envelope" class="text-gray-400" />
                </div>
                <input
                    id="email"
                    v-model="requestForm.email"
                    type="email"
                    required
                    placeholder="Enter your email address"
                    class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00897B] focus:border-[#00897B] sm:text-sm"
                    :disabled="userStore.loading"
                />
              </div>
              <p class="text-xs text-gray-500 mt-2">
                We'll send you a password reset link to this email address
              </p>
            </div>

            <div>
              <button
                  type="submit"
                  :disabled="userStore.loading || !requestForm.email"
                  class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#00897B] hover:bg-[#00695C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00897B] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <font-awesome-icon
                    :icon="userStore.loading ? 'fa-solid fa-spinner' : 'fa-solid fa-paper-plane'"
                    :class="{ 'fa-spin': userStore.loading }"
                    class="mr-2 h-4 w-4"
                />
                <span>{{ userStore.loading ? 'Sending...' : 'Send Reset Link' }}</span>
              </button>
            </div>

            <div class="flex justify-center mt-4">
              <router-link
                  to="/login"
                  class="inline-flex items-center justify-center w-10 h-10 text-gray-500 hover:text-[#00897B] hover:bg-gray-100 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                  aria-label="Back to login"
              >
                <font-awesome-icon icon="fa-solid fa-arrow-left" class="text-lg" />
              </router-link>
            </div>
          </form>

          <!-- CONFIRM VIEW -->
          <form v-else-if="view === 'confirm'" @submit.prevent="handleConfirmReset" class="space-y-6">
            <div>
              <label for="new-password" class="block text-sm font-medium text-[#1F2937]">New Password</label>
              <div class="mt-1 relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <font-awesome-icon icon="fa-solid fa-lock" class="text-gray-400" />
                </div>
                <input
                    id="new-password"
                    v-model="confirmForm.newPassword"
                    :type="showPassword ? 'text' : 'password'"
                    required
                    minlength="8"
                    placeholder="Enter new password"
                    class="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00897B] focus:border-[#00897B] sm:text-sm"
                    :disabled="userStore.loading"
                />
                <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    tabindex="-1"
                >
                  <font-awesome-icon
                      :icon="['fas', showPassword ? 'eye-slash' : 'eye']"
                      class="w-5 h-5"
                  />
                </button>
              </div>
            </div>

            <div>
              <label for="confirm-password" class="block text-sm font-medium text-[#1F2937]">Confirm Password</label>
              <div class="mt-1 relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <font-awesome-icon icon="fa-solid fa-lock" class="text-gray-400" />
                </div>
                <input
                    id="confirm-password"
                    v-model="confirmForm.confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    required
                    minlength="8"
                    placeholder="Confirm new password"
                    class="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00897B] focus:border-[#00897B] sm:text-sm"
                    :class="{
                      'border-red-500 focus:ring-red-500 focus:border-red-500':
                        confirmForm.confirmPassword &&
                        confirmForm.newPassword !== confirmForm.confirmPassword
                    }"
                    :disabled="userStore.loading"
                />
                <button
                    type="button"
                    @click="showConfirmPassword = !showConfirmPassword"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    tabindex="-1"
                >
                  <font-awesome-icon
                      :icon="['fas', showConfirmPassword ? 'eye-slash' : 'eye']"
                      class="w-5 h-5"
                  />
                </button>
              </div>
              <p
                  v-if="confirmForm.confirmPassword && confirmForm.newPassword !== confirmForm.confirmPassword"
                  class="text-xs text-red-500 mt-2"
              >
                Passwords do not match
              </p>
            </div>

            <!-- Password Requirements -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-sm">
              <p class="text-xs font-semibold text-blue-900 mb-2">Password Requirements:</p>
              <ul class="text-xs text-blue-700 space-y-1">
                <li class="flex items-center gap-2">
                  <font-awesome-icon
                      :icon="['fas', confirmForm.newPassword.length >= 8 ? 'check-circle' : 'circle']"
                      :class="confirmForm.newPassword.length >= 8 ? 'text-green-500' : 'text-gray-400'"
                      class="w-3 h-3"
                  />
                  <span>At least 8 characters</span>
                </li>
              </ul>
            </div>

            <div>
              <button
                  type="submit"
                  :disabled="userStore.loading || !confirmForm.newPassword || confirmForm.newPassword !== confirmForm.confirmPassword"
                  class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#00897B] hover:bg-[#00695C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00897B] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <font-awesome-icon
                    :icon="userStore.loading ? 'fa-solid fa-spinner' : 'fa-solid fa-check'"
                    :class="{ 'fa-spin': userStore.loading }"
                    class="mr-2 h-4 w-4"
                />
                <span>{{ userStore.loading ? 'Resetting...' : 'Reset Password' }}</span>
              </button>
            </div>
          </form>

          <!-- SUCCESS VIEW -->
          <div v-else-if="view === 'success'" class="space-y-6">
            <div class="rounded-lg bg-green-50 p-6 text-center">
              <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <font-awesome-icon icon="fa-solid fa-check" class="h-6 w-6 text-green-600" />
              </div>
              <h3 class="mt-4 text-lg font-semibold text-gray-900">{{ successMessage.title }}</h3>
              <p class="mt-2 text-sm text-gray-600">{{ successMessage.description }}</p>
            </div>

            <div>
              <router-link
                  to="/login"
                  class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#00897B] hover:bg-[#00695C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00897B] transition-all duration-200"
              >
                <font-awesome-icon icon="fa-solid fa-arrow-left" class="mr-2 h-4 w-4" />
                <span>Back to Login</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side: Security Info -->
    <div class="hidden lg:flex lg:flex-1 relative bg-gradient-to-br from-[#00897B] to-[#004D40] items-center justify-center p-12">
      <div class="absolute inset-0 bg-[url('/src/assets/images/pattern.svg')] opacity-10"></div>
      <div class="relative max-w-md space-y-8">
        <div>
          <h2 class="text-3xl font-bold text-white mb-4">Secure Password Reset</h2>
          <p class="text-gray-200 text-sm leading-relaxed">
            Your security is our priority. We use industry-standard encryption and secure token validation to ensure your password reset is safe.
          </p>
        </div>

        <div class="space-y-6">
          <div class="flex items-start">
            <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-[#00897B]/20 flex items-center justify-center mr-4">
              <font-awesome-icon icon="fa-solid fa-shield-alt" class="text-[#80CBC4]" />
            </div>
            <div>
              <h3 class="font-semibold text-white">Encrypted Communication</h3>
              <p class="text-gray-300 text-sm mt-1">All data transmitted is encrypted end-to-end</p>
            </div>
          </div>

          <div class="flex items-start">
            <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-[#00897B]/20 flex items-center justify-center mr-4">
              <font-awesome-icon icon="fa-solid fa-clock" class="text-[#80CBC4]" />
            </div>
            <div>
              <h3 class="font-semibold text-white">Time-Limited Access</h3>
              <p class="text-gray-300 text-sm mt-1">Reset link expires in 24 hours</p>
            </div>
          </div>

          <div class="flex items-start">
            <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-[#00897B]/20 flex items-center justify-center mr-4">
              <font-awesome-icon icon="fa-solid fa-lock" class="text-[#80CBC4]" />
            </div>
            <div>
              <h3 class="font-semibold text-white">Encrypted & Secure</h3>
              <p class="text-gray-300 text-sm mt-1">Industry-standard encryption protocols</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePasswordReset } from '@/composables/usePasswordReset';

const {
  view,
  showPassword,
  showConfirmPassword,
  isSubmitting,
  requestForm,
  confirmForm,
  toast,
  successMessage,
  handleRequestReset,
  handleConfirmReset,
    userStore
} = usePasswordReset();
</script>





<style scoped>
/* Toast transition */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Animations */
.fa-spin {
  animation: spin 1s infinite linear;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Custom scrollbar */
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