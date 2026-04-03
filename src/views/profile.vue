
<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useProfile } from '@/composables/useProfile';

const {
  fileInput, activeTab, formData, loading, updating,
  errorMessage, successMessage, userTypeDisplay,
  userTypeBadgeColor, hasChanges, avatarUrl, userInitials,
  triggerFileInput, handleAvatarUpload, removeAvatar,
  updateProfile, resetForm,authStore,transStore
} = useProfile();
</script>





<template>
  <div class="min-h-screen  from-emerald-50 via-green-50 to-teal-50 p-4 md:p-6">
    <!-- Settings Layout - Sidebar Style -->
    <div class="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden">
      <div class="flex flex-col lg:flex-row">
        <!-- Sidebar Navigation -->
        <div class="lg:w-64 bg-gradient-to-b from-green-50 to-emerald-50 border-r border-green-100">
          <div class="p-6 bg-gradient-to-r from-teal-600 to-emerald-600">
            <h2 class="font-semibold text-white text-lg flex items-center gap-2">
              <font-awesome-icon :icon="['fas', 'sliders']" class="w-4 h-4" />
              {{transStore.t('profile.setting')}}
            </h2>
            <p class="text-teal-100 text-sm mt-1"> {{transStore.t('profile.manage')}}</p>
          </div>

          <!-- User Profile Summary -->
          <div class="p-6 border-b border-green-100">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
                {{ userInitials }}
              </div>
              <div class="flex-1">
                <h3 class="font-bold text-gray-900 text-sm">{{ authStore.userProfile.full_name }}</h3>
                <p class="text-xs text-gray-500 truncate">{{ authStore.userProfile.email }}</p>
                <span :class="`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white ${userTypeBadgeColor}`">
                  {{ userTypeDisplay }}
                </span>
              </div>
            </div>
          </div>

          <!-- Navigation Tabs -->
          <nav class="p-4 space-y-1">
            <button
                @click="activeTab = 'profile'"
                :class="[
                'w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3',
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-green-50 hover:text-teal-700'
              ]"
            >
              <font-awesome-icon
                  :icon="['fas', 'user']"
                  class="w-4 h-4"
                  :class="activeTab === 'profile' ? 'text-white' : 'text-teal-500'"
              />
              <span class="font-medium">{{transStore.t('profile.profile')}}</span>
              <font-awesome-icon
                  v-if="activeTab === 'profile'"
                  :icon="['fas', 'chevron-right']"
                  class="w-3 h-3 ml-auto"
              />
            </button>

            <button
                @click="activeTab = 'security'"
                :class="[
                'w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3',
                activeTab === 'security'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-green-50 hover:text-teal-700'
              ]"
            >
              <font-awesome-icon
                  :icon="['fas', 'shield-halved']"
                  class="w-4 h-4"
                  :class="activeTab === 'security' ? 'text-white' : 'text-teal-500'"
              />
              <span class="font-medium">{{transStore.t('profile.security')}}</span>
              <font-awesome-icon
                  v-if="activeTab === 'security'"
                  :icon="['fas', 'chevron-right']"
                  class="w-3 h-3 ml-auto"
              />
            </button>

            <button
                @click="activeTab = 'preferences'"
                :class="[
                'w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3',
                activeTab === 'preferences'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-green-50 hover:text-teal-700'
              ]"
            >
              <font-awesome-icon
                  :icon="['fas', 'sliders']"
                  class="w-4 h-4"
                  :class="activeTab === 'preferences' ? 'text-white' : 'text-teal-500'"
              />
              <span class="font-medium">{{transStore.t('profile.preferences')}}</span>
              <font-awesome-icon
                  v-if="activeTab === 'preferences'"
                  :icon="['fas', 'chevron-right']"
                  class="w-3 h-3 ml-auto"
              />
            </button>
          </nav>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1">
          <!-- Profile Tab -->
          <div v-if="activeTab === 'profile'" class="p-6 md:p-8 animate-fade-in">
            <!-- Header -->
            <div class="mb-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <font-awesome-icon :icon="['fas', 'user']" class="w-7 h-7 text-teal-600" />
                {{transStore.t('profile.profile.info')}}
              </h2>
              <p class="text-gray-600">{{transStore.t('profile.update.personal')}}</p>
            </div>

            <!-- Messages -->
            <div v-if="errorMessage || successMessage" class="mb-6">
              <div v-if="errorMessage" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-shake">
                <div class="flex items-center">
                  <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="w-5 h-5 text-red-500 mr-3" />
                  <span class="text-red-700 font-medium">{{ errorMessage }}</span>
                </div>
              </div>

              <div v-if="successMessage" class="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg animate-bounce-in">
                <div class="flex items-center">
                  <font-awesome-icon :icon="['fas', 'check']" class="w-5 h-5 text-green-500 mr-3" />
                  <span class="text-green-700 font-medium">{{ successMessage }}</span>
                </div>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="p-12 text-center">
              <font-awesome-icon :icon="['fas', 'spinner']" class="animate-spin h-12 w-12 text-teal-600 mb-4" />
              <p class="text-gray-600 font-medium">{{transStore.t('profile.loading.profile')}}</p>
            </div>

            <!-- Profile Form -->
            <form v-if="!loading" @submit.prevent="updateProfile" class="space-y-8">
              <!-- Avatar Section -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <font-awesome-icon :icon="['fas', 'camera']" class="w-4 h-4 text-teal-500" />
                  {{transStore.t('profile.picture')}}
                </label>
                <div class="flex flex-col md:flex-row items-center gap-8">
                  <!-- Avatar Preview -->
                  <div class="relative group">
                    <div class="absolute -inset-1 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
                    <div class="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 ring-4 ring-white shadow-xl">
                      <img
                          v-if="avatarUrl"
                          :src="avatarUrl"
                          :alt="formData.full_name || 'Profile'"
                          class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                      />
                      <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-400 to-emerald-600">
                        <span class="text-white text-3xl font-bold">{{ userInitials }}</span>
                      </div>
                    </div>
                    <button
                        type="button"
                        @click="triggerFileInput"
                        class="absolute bottom-2 right-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
                    >
                      <font-awesome-icon :icon="['fas', 'camera']" class="w-4 h-4" />
                    </button>
                    <input
                        ref="fileInput"
                        type="file"
                        accept="image/*"
                        @change="handleAvatarUpload"
                        class="hidden"
                    />
                  </div>

                  <!-- Avatar Controls -->
                  <div class="flex-1">
                    <p class="text-gray-600 mb-4">
                      {{transStore.t('profile.upload.photo')}}
                      <br>
                      <span class="text-sm text-gray-500"> {{transStore.t('profile.file.size')}}</span>
                    </p>
                    <div class="flex flex-wrap gap-3">
                      <button
                          type="button"
                          @click="triggerFileInput"
                          class="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg hover:from-teal-600 hover:to-emerald-700 font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                      >
                        <font-awesome-icon :icon="['fas', 'upload']" class="w-4 h-4" />
                        {{transStore.t('profile.change.photo')}}
                      </button>
                      <button
                          v-if="formData.avatar"
                          type="button"
                          @click="removeAvatar"
                          class="px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                      >
                        <font-awesome-icon :icon="['fas', 'trash']" class="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Account Info -->
              <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 p-6">
                <h3 class="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <font-awesome-icon :icon="['fas', 'info-circle']" class="w-4 h-4 text-teal-500" />
                  {{transStore.t('profile.account.info')}}
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="bg-white p-4 rounded-lg shadow-sm">
                    <label class="block text-xs text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-1">
                      <font-awesome-icon :icon="['fas', 'id-card']" class="w-3 h-3" />
                      {{transStore.t('profile.username')}}
                    </label>
                    <p class="text-gray-800 font-semibold">{{ authStore.userProfile.username }}</p>
                  </div>
                  <div class="bg-white p-4 rounded-lg shadow-sm">
                    <label class="block text-xs text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-1">
                      <font-awesome-icon :icon="['fas', 'envelope']" class="w-3 h-3" />
                      {{transStore.t('profile.email.address')}}
                    </label>
                    <p class="text-gray-800 font-semibold">{{ authStore.userProfile.email }}</p>
                  </div>
                </div>
              </div>

              <!-- Editable Fields -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- First Name -->
                <div>
                  <label for="first_name" class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                    {{transStore.t('profile.first.name')}} <span class="text-red-500">*</span>
                  </label>
                  <input
                      type="text"
                      id="first_name"
                      v-model="formData.first_name"
                      required
                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 bg-white hover:border-teal-300"
                      placeholder="Enter your first name"
                  />
                </div>

                <!-- Last Name -->
                <div>
                  <label for="last_name" class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                    {{transStore.t('profile.last.name')}} <span class="text-red-500">*</span>
                  </label>
                  <input
                      type="text"
                      id="last_name"
                      v-model="formData.last_name"
                      required
                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 bg-white hover:border-teal-300"
                      placeholder="Enter your last name"
                  />
                </div>

                <!-- Phone -->
                <div>
                  <label for="phone" class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider flex items-center gap-1">
                    <font-awesome-icon :icon="['fas', 'phone']" class="w-3 h-3" />
                    {{transStore.t('profile.phone.number')}}
                  </label>
                  <input
                      type="tel"
                      id="phone"
                      v-model="formData.phone"
                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 bg-white hover:border-teal-300"
                      placeholder="Enter your phone number"
                  />
                </div>

                <!-- Company Name (only for clients) -->
                <div v-if="authStore.isClient">
                  <label for="company_name" class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider flex items-center gap-1">
                    <font-awesome-icon :icon="['fas', 'building']" class="w-3 h-3" />
                    {{transStore.t('profile.company.name')}}
                  </label>
                  <input
                      type="text"
                      id="company_name"
                      v-model="formData.company_name"
                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 bg-white hover:border-teal-300"
                      placeholder="Enter your company name"
                  />
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                    type="button"
                    @click="resetForm"
                    :disabled="!hasChanges || updating"
                    class="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <font-awesome-icon :icon="['fas', 'times']" class="w-4 h-4" />
                  {{transStore.t('profile.cancel.changes')}}
                </button>
                <button
                    type="submit"
                    :disabled="!hasChanges || updating"
                    class="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold rounded-lg hover:from-teal-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <font-awesome-icon
                      v-if="updating"
                      :icon="['fas', 'spinner']"
                      class="animate-spin h-5 w-5"
                  />
                  <font-awesome-icon v-else :icon="['fas', 'save']" class="w-4 h-4" />
                  <span>{{ updating ? 'Saving...' : 'Save Changes' }}</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Security Tab -->
          <div v-if="activeTab === 'security'" class="p-6 md:p-8 animate-fade-in">
            <div class="mb-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <font-awesome-icon :icon="['fas', 'shield-halved']" class="w-7 h-7 text-teal-600" />
                {{transStore.t('profile.security.settings')}}
              </h2>
              <p class="text-gray-600">{{transStore.t('profile.manage.security')}}</p>
            </div>

            <div class="text-center py-12">
              <font-awesome-icon :icon="['fas', 'shield-halved']" class="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <p class="text-gray-500 text-lg"> {{transStore.t('profile.security.soon')}}</p>
            </div>
          </div>

          <!-- Preferences Tab -->
          <div v-if="activeTab === 'preferences'" class="p-6 md:p-8 animate-fade-in">
            <div class="mb-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <font-awesome-icon :icon="['fas', 'sliders']" class="w-7 h-7 text-teal-600" />
                Preferences
              </h2>
              <p class="text-gray-600"> {{transStore.t('profile.customize.experience')}}</p>
            </div>

            <div class="text-center py-12">
              <font-awesome-icon :icon="['fas', 'sliders']" class="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <p class="text-gray-500 text-lg"> {{transStore.t('profile.preferences.soon')}}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}
@keyframes bounceIn {
  0% { opacity: 0; transform: scale(0.3); }
  50% { opacity: 1; transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); }
}
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
.animate-shake { animation: shake 0.5s ease-out; }
.animate-bounce-in { animation: bounceIn 0.6s ease-out; }

/* Custom scrollbar */
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #14b8a6, #0d9488);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #0d9488, #0f766e);
}

/* Focus styles */
input:focus {
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
  outline: none;
}

/* Button hover effects */
button:not(:disabled):hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

/* Smooth transitions */
* {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>