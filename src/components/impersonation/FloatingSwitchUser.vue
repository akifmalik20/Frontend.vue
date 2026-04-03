<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useFloatingSwitchUser } from '@/composables/useFloating.ts';

const {
  // Stores
  authStore,
  transStore,

  // State
  isExpanded,
  isImpersonationExpanded,
  searchQuery,
  searchResults,
  selectedUser,
  isSearching,
  error,

  // Computed
  getUserType,
  getUserTypeClass,

  // Helpers
  getAvatarColor,

  // Panel
  expandPanel,
  collapsePanel,

  // Search
  clearSearch,
  selectUser,
  debouncedSearch,

  // Actions
  switchUser,
  returnToAdmin,
} = useFloatingSwitchUser();
</script>
<template>
  <div class="floating-switch-container">
    <!-- RETURN TO ADMIN BUTTON - Only visible when impersonating -->
    <transition name="slide-up">
      <div v-if="authStore.isImpersonating">
        <!-- Collapsed impersonation state - small arrow button -->
        <button
            v-if="!isImpersonationExpanded"
            class="switch-toggle-button"
            type="button"
            @click="isImpersonationExpanded = true"
            title="View impersonation details"
        >
          <font-awesome-icon icon="fa-solid fa-chevron-up" class="w-3 h-3 chevron-icon" />
        </button>

        <!-- Expanded impersonation card -->
        <div
            v-else
            class="return-to-admin-card"
        >
          <button
              class="collapse-return-button"
              type="button"
              title="Collapse"
              @click="isImpersonationExpanded = false"
          >
            <font-awesome-icon icon="fa-solid fa-chevron-down" class="w-3 h-3" />
          </button>
          <div class="return-card-content">
            <div class="impersonation-info">
              <div class="info-icon">
                <font-awesome-icon icon="fa-solid fa-mask" class="w-4 h-4 text-amber-600" />
              </div>
              <div class="info-text">
                <p class="impersonating-label">{{transStore.t('impersonation.title')}}</p>
                <p class="impersonating-user">
                  {{ authStore.userProfile?.full_name || authStore.userProfile?.username }}
                  <span class="user-type-badge" :class="getUserTypeClass">
                  {{ getUserType }}
                </span>
                </p>
                <p class="original-admin">
                  <font-awesome-icon icon="fa-solid fa-user-shield" class="w-3 h-3 mr-1" />
                  {{ authStore.originalAdmin?.full_name || authStore.originalAdmin?.username }}
                </p>
              </div>
            </div>
            <button
                @click="returnToAdmin"
                :disabled="authStore.loading"
                class="return-button"
            >
              <font-awesome-icon
                  v-if="authStore.loading"
                  icon="fa-solid fa-spinner"
                  spin
                  class="w-4 h-4 mr-2"
              />
              <font-awesome-icon v-else icon="fa-solid fa-arrow-left" class="w-4 h-4 mr-2" />
              {{transStore.t('impersonation.return.admin')}}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- SWITCH USER BUTTON - Only visible to admins not impersonating -->
    <transition name="slide-up">
      <div
          v-if="authStore.isAdmin && !authStore.isImpersonating"
          class="switch-user-container"
      >
        <!-- Collapsed State - small arrow button ONLY -->
        <button
            v-if="!isExpanded"
            class="switch-toggle-button"
            type="button"
            @click="expandPanel"
            title="Switch User"
        >
          <font-awesome-icon icon="fa-solid fa-chevron-up" class="w-4 h-4 chevron-icon" />
        </button>

        <!-- Expanded State - Full card -->
        <div v-else class="switch-user-expanded">
          <div class="expanded-header">
            <div class="header-title">
              <font-awesome-icon icon="fa-solid fa-user" class="w-4 h-4 mr-2 text-teal-600" />
              <h4>{{transStore.t('impersonation.switch.another.user')}}</h4>
            </div>
            <button @click="collapsePanel" class="close-button" type="button" title="Collapse">
              <font-awesome-icon icon="fa-solid fa-chevron-down" class="w-4 h-4" />
            </button>
          </div>

          <div class="expanded-body">
            <!-- Search Input -->
            <div class="search-container">
              <div class="search-input-wrapper">
                <font-awesome-icon icon="fa-solid fa-search" class="search-icon" />
                <input
                    v-model="searchQuery"
                    type="text"
                    :placeholder="transStore.t('impersonation.enter.username')"
                    class="search-input"
                    @input="debouncedSearch"
                    @keyup.enter="switchUser"
                    ref="searchInput"
                />
                <button
                    v-if="searchQuery"
                    @click="clearSearch"
                    class="clear-search"
                >
                  <font-awesome-icon icon="fa-solid fa-times-circle" class="w-4 h-4" />
                </button>
              </div>
              <p v-if="error" class="error-message">
                <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="w-3 h-3 mr-1" />
                {{ error }}
              </p>
            </div>

            <!-- Loading State -->
            <div v-if="isSearching" class="loading-state">
              <font-awesome-icon icon="fa-solid fa-spinner" spin class="w-6 h-6 text-teal-500" />
              <p>{{transStore.t('impersonation.searching.users')}}</p>
            </div>

            <!-- Search Results -->
            <div v-else-if="searchResults.length > 0" class="search-results">
              <div class="results-header">
                <span class="results-count">{{ searchResults.length }}{{transStore.t('impersonation.users.found')}} </span>
              </div>
              <div class="users-list">
                <div
                    v-for="user in searchResults"
                    :key="user.id"
                    @click="selectUser(user)"
                    class="user-item"
                    :class="{ 'selected': selectedUser?.id === user.id }"
                >
                  <div class="user-avatar">
                    <div v-if="user.avatar" class="avatar-image">
                      <img :src="user.avatar" :alt="user.username" />
                    </div>
                    <div v-else class="avatar-placeholder" :class="getAvatarColor(user.user_type)">
                      {{ user.full_name?.charAt(0) || user.username.charAt(0) }}
                    </div>
                    <div class="status-dot" :class="user.is_active ? 'active' : 'inactive'"></div>
                  </div>
                  <div class="user-info">
                    <div class="user-name-row">
                      <span class="user-name">{{ user.full_name || user.username }}</span>
                      <span class="user-type" :class="user.user_type">
                    {{ user.user_type }}
                  </span>
                    </div>
                    <div class="user-details">
                      <span class="user-username">@{{ user.username }}</span>
                      <span class="user-email">{{ user.email }}</span>
                    </div>
                    <div v-if="user.client_company" class="user-company">
                      <font-awesome-icon icon="fa-solid fa-building" class="w-3 h-3 mr-1" />
                      {{ user.client_company }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Results -->
            <div v-else-if="searchQuery && searchQuery.length >= 2 && !isSearching" class="no-results">
              <div class="no-results-icon">
                <font-awesome-icon icon="fa-solid fa-user-slash" class="w-8 h-8" />
              </div>
              <p class="no-results-title"> {{transStore.t('impersonation.no.users.found')}}</p>
              <p class="no-results-subtitle"> {{transStore.t('impersonation.try.different.search')}}</p>
            </div>


          </div>

          <div class="expanded-footer">
            <button @click="collapsePanel" class="cancel-button">
              {{transStore.t('cancel')}}
            </button>
            <button
                @click="switchUser"
                :disabled="!selectedUser || authStore.loading"
                class="switch-button"
            >
              <font-awesome-icon
                  v-if="authStore.loading"
                  icon="fa-solid fa-spinner"
                  spin
                  class="w-4 h-4 mr-2"
              />
              <font-awesome-icon v-else icon="fa-solid fa-user" class="w-4 h-4 mr-2" />
              {{transStore.t('impersonation.switch.to')}} {{ selectedUser?.username || transStore.t('impersonation.user') }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<!--<script setup>-->
<!--import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue';-->
<!--import { useAuthStore } from '@/stores/authStore';-->
<!--import { useRouter } from 'vue-router';-->
<!--import {useTranslationStore} from "@/stores/translationStore.js";-->

<!--// Custom debounce function to avoid lodash dependency-->
<!--function debounce(fn, delay) {-->
<!--  let timer = null;-->
<!--  return function (...args) {-->
<!--    if (timer) clearTimeout(timer);-->
<!--    timer = setTimeout(() => fn.apply(this, args), delay);-->
<!--  };-->
<!--}-->
<!--const transStore=useTranslationStore();-->
<!--const authStore = useAuthStore();-->
<!--const router = useRouter();-->

<!--// State-->
<!--const isExpanded = ref(false);-->
<!--const isImpersonationExpanded = ref(true);-->
<!--const searchQuery = ref('');-->
<!--const searchResults = ref([]);-->
<!--const selectedUser = ref(null);-->
<!--const isSearching = ref(false);-->
<!--const error = ref('');-->
<!--const recentUsers = ref([]);-->

<!--// Load recent users from localStorage-->
<!--onMounted(() => {-->
<!--  const stored = localStorage.getItem('recent_impersonations');-->
<!--  if (stored) {-->
<!--    try {-->
<!--      recentUsers.value = JSON.parse(stored).slice(0, 5);-->
<!--    } catch (e) {-->
<!--      console.error('Failed to parse recent impersonations:', e);-->
<!--    }-->
<!--  }-->

<!--  // Add keyboard shortcut listener-->
<!--  window.addEventListener('keydown', handleKeyboardShortcut);-->
<!--});-->

<!--onUnmounted(() => {-->
<!--  window.removeEventListener('keydown', handleKeyboardShortcut);-->
<!--});-->

<!--// Keyboard shortcut handler-->
<!--const handleKeyboardShortcut = (e) => {-->
<!--  if ((e.ctrlKey || e.metaKey) && e.key === 'u') {-->
<!--    e.preventDefault();-->
<!--    if (authStore.isAdmin && !authStore.isImpersonating) {-->
<!--      isExpanded.value = true;-->
<!--      nextTick(() => {-->
<!--        document.querySelector('.search-input')?.focus();-->
<!--      });-->
<!--    }-->
<!--  }-->
<!--};-->

<!--// Get user type-->
<!--const getUserType = computed(() => {-->
<!--  if (!authStore.userProfile) return '';-->
<!--  if (authStore.isClient) return 'Client';-->
<!--  if (authStore.isCustomUser) return 'User';-->
<!--  if (authStore.isAdmin) return 'Admin';-->
<!--  return 'User';-->
<!--});-->

<!--const getUserTypeClass = computed(() => {-->
<!--  if (!authStore.userProfile) return '';-->
<!--  if (authStore.isClient) return 'badge-client';-->
<!--  if (authStore.isCustomUser) return 'badge-user';-->
<!--  if (authStore.isAdmin) return 'badge-admin';-->
<!--  return 'badge-user';-->
<!--});-->

<!--// Get avatar color based on user type-->
<!--const getAvatarColor = (userType) => {-->
<!--  const colors = {-->
<!--    'admin': 'bg-purple-100 text-purple-700',-->
<!--    'client': 'bg-blue-100 text-blue-700',-->
<!--    'user': 'bg-green-100 text-green-700',-->
<!--    'default': 'bg-gray-100 text-gray-700'-->
<!--  };-->
<!--  return colors[userType] || colors.default;-->
<!--};-->

<!--// Debounced search - using custom debounce-->
<!--const debouncedSearch = debounce(async () => {-->
<!--  if (searchQuery.value.length < 2) {-->
<!--    searchResults.value = [];-->
<!--    return;-->
<!--  }-->

<!--  isSearching.value = true;-->
<!--  error.value = '';-->

<!--  try {-->
<!--    const results = await authStore.searchUsers(searchQuery.value);-->
<!--    searchResults.value = results;-->
<!--  } catch (err) {-->
<!--    console.error('Search error:', err);-->
<!--    error.value =  transStore.t('impersonation.fail.search');-->
<!--  } finally {-->
<!--    isSearching.value = false;-->
<!--  }-->
<!--}, 300);-->

<!--// Panel expand / collapse helpers-->
<!--const expandPanel = () => {-->
<!--  isExpanded.value = true;-->
<!--};-->

<!--const collapsePanel = () => {-->
<!--  isExpanded.value = false;-->
<!--};-->

<!--// Select user-->
<!--const selectUser = (user) => {-->
<!--  selectedUser.value = user;-->
<!--  searchQuery.value = user.username;-->
<!--  // Show only the selected user in search results-->
<!--  searchResults.value = [user];-->
<!--  error.value = '';-->
<!--};-->

<!--// Clear search-->
<!--const clearSearch = () => {-->
<!--  searchQuery.value = '';-->
<!--  selectedUser.value = null;-->
<!--  searchResults.value = [];-->
<!--  error.value = '';-->
<!--};-->

<!--// Switch user-->
<!--const switchUser = async () => {-->
<!--  if (!selectedUser.value) {-->
<!--    error.value =  transStore.t('impersonation.select.user');-->
<!--    return;-->
<!--  }-->

<!--  try {-->
<!--    const result = await authStore.switchUser(selectedUser.value.username);-->

<!--    if (result.success) {-->
<!--      // Add to recent users-->
<!--      addToRecentUsers(selectedUser.value);-->

<!--      // Close the panel-->
<!--      isExpanded.value = false;-->

<!--      // Reset state-->
<!--      clearSearch();-->

<!--      // Show success notification-->
<!--      showNotification({-->
<!--        type: 'success',-->
<!--        title: 'Switched User',-->
<!--        message: `Now viewing as ${selectedUser.value.full_name || selectedUser.value.username}`-->
<!--      });-->
<!--      // Navigation is handled inside authStore.switchUser()-->
<!--      // via navigateToDefaultRoute()/router, so we don't redirect here.-->
<!--    } else {-->
<!--      error.value = result.error ||  transStore.t('impersonation.switch.fail');-->
<!--    }-->
<!--  } catch (err) {-->
<!--    console.error('Switch user error:', err);-->
<!--    error.value = err.response?.data?.error ||  transStore.t('impersonation.error.switch');-->
<!--  }-->
<!--};-->

<!--// Quick switch from recent-->
<!--const quickSwitch = (user) => {-->
<!--  selectUser(user);-->
<!--  switchUser();-->
<!--};-->

<!--// Return to admin-->
<!--const returnToAdmin = async () => {-->
<!--  try {-->
<!--    const result = await authStore.returnToAdmin();-->
<!--    if (result.success) {-->
<!--      showNotification({-->
<!--        type: 'success',-->
<!--        title:  transStore.t('impersonation.return.admin'),-->
<!--        message: transStore.t('impersonation.welcome.admin')-->
<!--      });-->
<!--      // Navigation + full reload (to default module) are handled-->
<!--      // inside authStore.returnToAdmin(), so we don't redirect here.-->
<!--    } else {-->
<!--      showNotification({-->
<!--        type: 'error',-->
<!--        title: transStore.t('impersonation.error'),-->
<!--        message: result.error ||  transStore.t('impersonation.fail.return.admin')-->
<!--      });-->
<!--    }-->
<!--  } catch (err) {-->
<!--    console.error('Failed to return to admin:', err);-->
<!--    showNotification({-->
<!--      type: 'error',-->
<!--      title: transStore.t('impersonation.error'),-->
<!--      message:  transStore.t('impersonation.fail.return.admin')-->
<!--    });-->
<!--  }-->
<!--};-->

<!--// Add to recent users-->
<!--const addToRecentUsers = (user) => {-->
<!--  const recent = recentUsers.value.filter(u => u.id !== user.id);-->
<!--  recent.unshift({-->
<!--    id: user.id,-->
<!--    username: user.username,-->
<!--    full_name: user.full_name,-->
<!--    user_type: user.user_type-->
<!--  });-->

<!--  // Keep only last 5-->
<!--  recentUsers.value = recent.slice(0, 5);-->
<!--  localStorage.setItem('recent_impersonations', JSON.stringify(recentUsers.value));-->
<!--};-->

<!--// Show notification-->
<!--const showNotification = ({ type, title, message }) => {-->
<!--  // You can use your existing toast/notification system-->
<!--  // Dispatch custom event for your notification component-->
<!--  window.dispatchEvent(new CustomEvent('show-notification', {-->
<!--    detail: { type, title, message }-->
<!--  }));-->

<!--  // Also log to console for debugging-->
<!--  console.log(`[${type}] ${title}: ${message}`);-->
<!--};-->

<!--// Focus input when expanded-->
<!--watch(isExpanded, async (val) => {-->
<!--  if (val) {-->
<!--    await nextTick();-->
<!--    document.querySelector('.search-input')?.focus();-->
<!--  }-->
<!--});-->
<!--watch(-->
<!--    () => authStore.impersonating,-->
<!--    (newVal) => {-->
<!--      console.log('🎭 FloatingSwitchUser detected impersonation change:', newVal);-->
<!--      if (newVal) {-->
<!--        // When impersonation starts, show the card (can be collapsed by user)-->
<!--        isImpersonationExpanded.value = true;-->
<!--      } else {-->
<!--        // If impersonation ended, collapse the switch panel and hide impersonation card-->
<!--        isExpanded.value = false;-->
<!--        isImpersonationExpanded.value = false;-->
<!--      }-->
<!--    },-->
<!--    { immediate: true }-->
<!--);-->
<!--</script>-->

<style scoped>
/* Keep your existing styles exactly as they are */
.floating-switch-container {
  position: fixed;
  bottom: 24px;
  left: 24px;
  z-index: 9999;
  max-width: 400px;
  width: 100%;
  /* Allow clicks to pass through outside the actual buttons/cards */
  pointer-events: none;
}

/* Make the switch user container shrink to content so
   the white background appears only around the icon when collapsed */
.switch-user-container {
  display: inline-block;
  pointer-events: auto;
}

/* Ensure the small toggle button and cards remain clickable
   while the rest of the floating area doesn't block sidebar clicks */
.switch-toggle-button,
.return-to-admin-card,
.switch-user-expanded {
  pointer-events: auto;
}

/* Return to Admin Card */
.return-to-admin-card {
  background: white;
  border-radius: 16px;
  position: relative;
  box-shadow:
      0 10px 25px -5px rgba(0, 0, 0, 0.1),
      0 8px 10px -6px rgba(0, 0, 0, 0.02),
      0 0 0 1px rgba(245, 158, 11, 0.2);
  border-left: 6px solid #f59e0b;
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

.collapse-return-button {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: none;
  background: #fef3c7;
  color: #92400e;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px -2px rgba(146, 64, 14, 0.35);
  transition: background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
}

.collapse-return-button:hover {
  background: #fde68a;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px -3px rgba(146, 64, 14, 0.4);
}

.collapse-return-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px -2px rgba(146, 64, 14, 0.35);
}

.return-card-content {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.impersonation-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.info-icon {
  width: 40px;
  height: 40px;
  background: #fffbeb;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-text {
  flex: 1;
}

.impersonating-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6b7280;
  margin-bottom: 2px;
}

.impersonating-user {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.user-type-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 12px;
  text-transform: uppercase;
}

.badge-admin {
  background: #f3e8ff;
  color: #6b21a8;
}

.badge-client {
  background: #dbeafe;
  color: #1e40af;
}

.badge-user {
  background: #dcfce7;
  color: #166534;
}

.original-admin {
  font-size: 12px;
  color: #6b7280;
  display: flex;
  align-items: center;
}

.return-button {
  padding: 8px 16px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.2);
}

.return-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 10px -1px rgba(245, 158, 11, 0.3);
}

.return-button:active:not(:disabled) {
  transform: translateY(0);
}

.return-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Tiny floating toggle button (collapsed state) - icon with small white background */
.switch-toggle-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 6px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #374151;
  cursor: pointer;
  box-shadow: 0 4px 10px -4px rgba(148, 163, 184, 0.5);
  transition: color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease, border-color 0.15s ease;
}

.switch-toggle-button:hover {
  transform: translateY(-1px);
  color: #111827;
  background: #f9fafb;
  border-color: #d1d5db;
  box-shadow: 0 8px 18px -6px rgba(148, 163, 184, 0.8);
}

.switch-toggle-button:active {
  transform: translateY(0);
  box-shadow: 0 4px 10px -4px rgba(148, 163, 184, 0.5);
}

.switch-toggle-button .chevron-icon {
  margin-left: 0;
}

/* Collapsed State */
.switch-user-collapsed {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.switch-user-collapsed:hover {
  background: linear-gradient(to right, #f0fdfa, #f9fafb);
}

.collapsed-content {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.icon-wrapper {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(20, 184, 166, 0.3);
}

.collapsed-text {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  flex: 1;
}

.keyboard-hint {
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 6px;
  font-family: monospace;
}

/* Expanded State */
.switch-user-expanded {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 16px;
  box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 8px 10px -6px rgba(0, 0, 0, 0.02),
      0 0 0 1px rgba(20, 184, 166, 0.2);
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

.expanded-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(to right, #f0fdfa, #f9fafb);
}

.header-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #1f2937;
}

.close-button {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.expanded-body {
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}

/* Search */
.search-container {
  margin-bottom: 16px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  width: 16px;
  height: 16px;
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 40px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: #f9fafb;
}

.search-input:focus {
  outline: none;
  border-color: #14b8a6;
  background: white;
  box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.1);
}

.clear-search {
  position: absolute;
  right: 12px;
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.clear-search:hover {
  color: #6b7280;
  background: #f3f4f6;
}

.error-message {
  margin-top: 8px;
  font-size: 12px;
  color: #dc2626;
  display: flex;
  align-items: center;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  color: #6b7280;
}

.loading-state p {
  margin-top: 12px;
  font-size: 13px;
}

/* Search Results */
.search-results {
  margin-top: 8px;
}

.results-header {
  margin-bottom: 12px;
}

.results-count {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-item:hover {
  background: #f9fafb;
  border-color: #14b8a6;
  transform: translateX(4px);
}

.user-item.selected {
  background: #f0fdfa;
  border-color: #14b8a6;
  border-width: 2px;
}

.user-avatar {
  position: relative;
  flex-shrink: 0;
}

.avatar-image {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  overflow: hidden;
}

.avatar-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
}

.status-dot {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
}

.status-dot.active {
  background: #10b981;
}

.status-dot.inactive {
  background: #9ca3af;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-type {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 12px;
  text-transform: uppercase;
  margin-left: 8px;
}

.user-type.admin {
  background: #f3e8ff;
  color: #6b21a8;
}

.user-type.client {
  background: #dbeafe;
  color: #1e40af;
}

.user-type.user {
  background: #dcfce7;
  color: #166534;
}

.user-details {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 12px;
  color: #6b7280;
}

.user-username {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-company {
  font-size: 11px;
  color: #6b7280;
  display: flex;
  align-items: center;
}

/* No Results */
.no-results {
  text-align: center;
  padding: 32px 0;
}

.no-results-icon {
  width: 64px;
  height: 64px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #9ca3af;
}

.no-results-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

.no-results-subtitle {
  font-size: 12px;
  color: #6b7280;
}

/* Recent Users */
.recent-users {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.recent-header {
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.recent-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  font-size: 12px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}

.recent-item:hover {
  background: #e5e7eb;
  border-color: #14b8a6;
}

.recent-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
}

.recent-username {
  max-width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Footer */
.expanded-footer {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-button {
  padding: 8px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-button:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.switch-button {
  padding: 8px 16px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px -1px rgba(20, 184, 166, 0.2);
}

.switch-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 10px -1px rgba(20, 184, 166, 0.3);
}

.switch-button:active:not(:disabled) {
  transform: translateY(0);
}

.switch-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.slide-up-enter-active {
  animation: slideIn 0.3s ease-out;
}

.slide-up-leave-active {
  animation: slideIn 0.2s reverse;
}

/* Responsive */
@media (max-width: 640px) {
  .floating-switch-container {
    left: 16px;
    right: 16px;
    bottom: 16px;
    max-width: none;
  }

  .return-card-content {
    flex-direction: column;
    align-items: stretch;
  }

  .impersonation-info {
    flex-direction: column;
    text-align: center;
  }

  .return-button {
    width: 100%;
    justify-content: center;
  }

  .user-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }
}
</style>