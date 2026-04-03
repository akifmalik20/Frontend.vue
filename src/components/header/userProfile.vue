<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import BaseModal from '@/components/baseModal.vue';
import {useTranslationStore} from "@/stores/translationStore";

const authStore = useAuthStore();
const router = useRouter();

const isMenuOpen = ref(false);
const isLogoutModalOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);
const transStore = useTranslationStore()

// Toggle function
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// Robust Click Outside Logic
const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    isMenuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});

const handleLogout = () => {
  authStore.logout();

  isLogoutModalOpen.value = false;
  //await transStore.loadTranslations();

  window.location.href = '/';

 // window.location.reload();
}
const handleTranslation = async () => {
  isMenuOpen.value = false;


  // window.location.reload();
};
</script>

<template>
  <div class="relative flex items-center" ref="menuRef">
    <button
        @click="toggleMenu"
        class="flex items-center p-1 rounded-full hover:bg-gray-100 transition-all duration-200 active:scale-95"
    >
      <div
          class="w-8 h-8 bg-[#00C49F] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
      >
        {{ authStore.user?.username?.substring(0, 2).toUpperCase() || 'U' }}
      </div>
      <font-awesome-icon
          icon="fa-solid fa-chevron-down"
          class="text-[9px] text-gray-400 ml-1.5 mr-1 transition-transform duration-300"
          :class="{ 'rotate-180': isMenuOpen }"
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
          v-if="isMenuOpen"
          class="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-xl z-[1000] overflow-hidden p-1"
      >
        <router-link
            to="/profile"
            @click= "handleTranslation"
            class="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-[#00C49F] transition-colors"
        >
          <font-awesome-icon icon="fa-solid fa-user-gear" class="mr-2.5 w-4 text-gray-400" />
          <span>{{transStore.t('profile.my.account')}}</span>
        </router-link>

        <button
            @click="isLogoutModalOpen = true; isMenuOpen = false"
            class="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors mt-0.5"
        >
          <font-awesome-icon icon="fa-solid fa-sign-out-alt" class="mr-2.5 w-4 text-gray-400 group-hover:text-red-500" />
          <span>{{transStore.t('profile.logout.button')}}</span>
        </button>
      </div>
    </Transition>

    <Teleport to="body">
      <BaseModal
          :is-open="isLogoutModalOpen"
          title="Confirm Logout"
          submitText="Logout"
          variant="danger"
          @close="isLogoutModalOpen = false"
          @save="handleLogout"
      >
        <div class="py-2">
          <p class="text-sm text-gray-500"> {{transStore.t('profile.logout')}} </p>
        </div>
      </BaseModal>
    </Teleport>
  </div>
</template>