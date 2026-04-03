<script setup lang="ts">
import { useDashboard } from '@/composables/useAdminDashboardStats.ts';

const {
  authStore,
  transStore,
  stats,
  recentCalls,
  agentStatus,
  startDashboardTour,
  getStatusDotColor,
  getStatusTextColor
} = useDashboard();
</script>

<template>
  <div class="p-8">
    <div class="mb-8 flex items-start justify-between gap-4" data-tour-id="dashboard-header">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">
        <span
            v-if="authStore.user?.roles?.length"
            class="text-xs font-bold bg-[#E6F9F6] text-[#00C49F] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm border border-[#00C49F]/20"
        >
          {{ authStore.user.roles[0] }}
        </span>
          {{ transStore.t('dashboard.page.title') }}</h1>
        <p class="text-gray-500 text-sm mt-1">
          {{ transStore.t('dashboard.welcome.back') }} , <span class="font-semibold text-gray-700">{{ authStore.user?.username || 'Guest' }}</span>! {{ transStore.t('dashboard.overview.description') }}
        </p>
      </div>

      <!-- Start tour button -->
      <button
        type="button"
        class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-100 hover:bg-teal-100 hover:border-teal-200"
        @click="startDashboardTour"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
        {{ transStore.t('dashboard.button.start.tour') }}
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-tour-id="dashboard-stats">
      <div v-for="stat in stats" :key="stat.title" class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">{{ stat.title }}</p>
          <p class="text-3xl font-bold text-gray-800 mt-1">{{ stat.value }}</p>
        </div>
        <div :class="stat.bg" class="w-12 h-12 rounded-2xl flex items-center justify-center">
          <font-awesome-icon :icon="stat.icon" :class="stat.text" class="text-xl" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
        <h3 class="text-lg font-bold text-gray-800 mb-6">{{ transStore.t('dashboard.recent.calls') }}</h3>
        <div class="flex-1 space-y-6">
          <div v-for="call in recentCalls" :key="call.number" class="flex items-center justify-between text-sm">
            <div class="flex items-center space-x-4">
              <span :class="getStatusDotColor(call.status)" class="w-2 h-2 rounded-full"></span>
              <span class="font-bold text-gray-700">{{ call.number }}</span>
              <span :class="getStatusTextColor(call.status)" class="text-xs font-medium">{{ call.status }}</span>
            </div>
            <div class="text-gray-400 font-medium">{{ call.time }}</div>
          </div>
        </div>
        <button class="w-full mt-8 pt-4 border-t border-gray-50 text-[#00C49F] font-bold hover:underline text-sm text-center">
          {{ transStore.t('dashboard.view.all.calls') }}
        </button>
      </div>

      <div class="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-6">{{ transStore.t('dashboard.widget.agent.status') }}</h3>
        <div class="space-y-6">
          <div v-for="agent in agentStatus" :key="agent.name" class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-full bg-[#00C49F] flex items-center justify-center text-white font-bold text-sm">
                {{ agent.initial }}
              </div>
              <div>
                <div class="text-sm font-bold text-gray-800">{{ agent.name }}</div>
                <div class="text-[11px] font-semibold uppercase tracking-wide"
                     :class="agent.status === 'Available' ? 'text-green-500' : 'text-orange-500'">
                  {{ agent.status }}
                </div>
              </div>
            </div>
            <div class="text-xs text-gray-400 font-semibold">{{ agent.calls }}{{ transStore.t('dashboard.label.calls') }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>