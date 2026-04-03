<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useSidebar } from '@/composables/useSideBar';

const {
  // Store refs
  userProfile,

  // State
  isCollapsed,
  localModules,
  hasChanges,
  isSaving,
  saveSuccess,
  draggedIndex,
  draggedOverIndex,
  activeParentModule,
  isLoadingTranslation,

  // Computed
  activeParentChildren,

  // Helpers
  isParentItemActive,

  // Handlers
  handleChildClick,
  handleParentClick,
  goBackToParents,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDragEnd,
  handleSave,
  handleCancel,
} = useSidebar();
</script>
<template>
  <aside
      :class="[
      'bg-white border-r flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out shadow-sm h-screen sticky top-0 side',
      isCollapsed ? 'w-30' : 'w-64'
    ]"
      data-tour-id="sidebar-main"
  >
    <!-- Header Section -->
    <div
        :class="[
        'p-4 flex items-center border-b border-gray-100',
        isCollapsed ? 'justify-center' : 'justify-between'
      ]"
        style="min-height: 72px;"
    >
      <div v-if="!isCollapsed" class="flex items-center space-x-3 overflow-hidden">
        <!-- Full round version -->
        <div class="relative">
          <div
              v-if="userProfile?.avatar"
              class="rounded-full overflow-hidden flex items-center justify-center"
              style="width: 40px; height: 40px;"
          >
            <!-- Display avatar image -->
            <img
                :src="userProfile.avatar"
                :alt="userProfile?.first_name || userProfile?.username || 'User'"
                class="w-full h-full object-cover"
            />
          </div>
          <div
              v-else
              class="rounded-full flex items-center justify-center text-white font-bold"
              style="width: 40px; height: 40px; background: linear-gradient(135deg, #00C49F 0%, #00a889 100%);"
          >
            <!-- Display first letter of first name -->
            {{ userProfile?.first_name?.charAt(0) || userProfile?.username?.charAt(0) || 'U' }}
          </div>
        </div>

        <!-- User Info -->
        <div class="flex flex-col min-w-0">
          <!-- Full name if available, otherwise username -->
          <h2 class="text-sm font-semibold text-gray-800 truncate max-w-[160px]">
            {{ userProfile?.full_name || userProfile?.first_name || userProfile?.username || 'User' }}
          </h2>
        </div>
      </div>

      <!-- Collapse Toggle -->
      <button
          @click="isCollapsed = !isCollapsed"
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
          :title="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      >
        <font-awesome-icon
            v-if="isCollapsed"
            icon="fa-solid fa-bars"
            class="w-5 h-5 text-gray-600"
        />
        <font-awesome-icon
            v-else
            icon="fa-solid fa-xmark"
            class="w-5 h-5 text-gray-600"
        />
      </button>
    </div>

    <!-- Save Controls -->
    <transition
        enter-active-class="transform transition-all duration-300 ease-out"
        leave-active-class="transform transition-all duration-200 ease-in"
        enter-from-class="-translate-y-2 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="-translate-y-2 opacity-0"
    >
      <div
          v-if="hasChanges && !isCollapsed"
          class="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-emerald-50"
      >
        <div class="flex flex-col space-y-2">
          <div class="flex items-center justify-between">
            <!-- Status indicator with only icon -->
            <div class="flex items-center text-xs">
              <div class="flex items-center text-teal-600 bg-teal-50 px-2 py-1 rounded-lg">
                <font-awesome-icon icon="fa-solid fa-clock" class="w-3.5 h-3.5" />
              </div>
            </div>

            <!-- Compact action buttons -->
            <div class="flex gap-2">
              <button
                  @click="handleCancel"
                  :disabled="isSaving"
                  class="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all duration-150"
              >
                Cancel
              </button>

              <button
                  @click="handleSave"
                  :disabled="isSaving || saveSuccess"
                  :class="[
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-offset-0',
                  saveSuccess
                    ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                    : isSaving
                      ? 'bg-teal-500 text-white opacity-90 cursor-wait'
                      : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-xs hover:shadow-sm hover:from-teal-600 hover:to-emerald-600 active:scale-95'
                ]"
              >
                <div class="flex items-center justify-center min-w-[60px]">
                  <font-awesome-icon
                      v-if="isSaving"
                      icon="fa-solid fa-spinner"
                      spin
                      class="mr-1.5 h-3 w-3 text-white"
                  />
                  <font-awesome-icon
                      v-else-if="saveSuccess"
                      icon="fa-solid fa-check"
                      class="w-3.5 h-3.5 mr-1.5 text-green-600"
                  />
                  <font-awesome-icon
                      v-else
                      icon="fa-solid fa-save"
                      class="w-3.5 h-3.5 mr-1.5"
                  />
                  <span>
                    {{ isSaving ? 'Saving' : saveSuccess ? 'Saved' : 'Save' }}
                  </span>
                </div>
              </button>
            </div>
          </div>

          <!-- Optional: Progress indicator for save operation -->
          <div v-if="isSaving" class="h-0.5 w-full bg-gray-100 overflow-hidden">
            <div class="h-full bg-gradient-to-r from-teal-400 to-emerald-400 animate-pulse"></div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Navigation Items -->
    <nav class="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar">
      <!-- Child modules view -->
      <div v-if="activeParentModule" class="space-y-3">
        <!-- Back button + parent title -->
        <div class="flex items-center justify-between mb-2">
          <button
              @click="goBackToParents"
              class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200"
          >
            <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-3.5 h-3.5 mr-1.5" />
            <span>Back</span>
          </button>
          <div v-if="!isCollapsed" class="ml-2 flex-1 min-w-0 text-right">
            <p class="text-xs font-semibold text-gray-700 truncate">
              {{ activeParentModule.description }}
            </p>
          </div>
        </div>

        <!-- Child module list -->
        <div class="space-y-1">
          <router-link
              v-for="child in activeParentChildren"
              :key="child.id"
              :to="child.url || '#'"
              @click="handleChildClick(child)"
              :class="[
              'group flex items-center px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer hover:bg-teal-50',
              $route.path === child.url ? 'bg-gradient-to-r from-teal-50 to-emerald-50 border-l-4 border-teal-500' : ''
            ]"
              :title="isCollapsed ? child.description : ''"
          >
            <div
                :class="[
                'flex items-center justify-center rounded-lg transition-all duration-200',
                $route.path === child.url
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-600 group-hover:bg-teal-100 group-hover:text-teal-600'
              ]"
                style="width: 36px; height: 36px;"
            >
              <font-awesome-icon v-if="child.icon" :icon="child.icon" class="w-5 h-5" />
              <font-awesome-icon v-else icon="fa-solid fa-home" class="w-5 h-5" />
            </div>

            <transition
                enter-active-class="transition-all duration-300 ease-out"
                leave-active-class="transition-all duration-200 ease-in"
                enter-from-class="opacity-0 -translate-x-2"
                enter-to-class="opacity-100 translate-x-0"
                leave-from-class="opacity-100 translate-x-0"
                leave-to-class="opacity-0 -translate-x-2"
            >
              <div v-if="!isCollapsed" class="ml-3 flex-1 min-w-0">
                <span class="text-sm font-medium text-gray-700 group-hover:text-teal-700">
                  {{ child.description }}
                </span>
              </div>
            </transition>
          </router-link>
        </div>
      </div>

      <!-- Parent modules view -->
      <div v-else>
        <transition-group
            name="list"
            tag="div"
            class="space-y-1"
        >
          <div
              v-for="(item, index) in localModules"
              :key="item.id"
              draggable="true"
              @dragstart="handleDragStart(index)"
              @dragover="handleDragOver($event, index)"
              @drop="handleDrop($event, index)"
              @dragend="handleDragEnd"
              @click="handleParentClick(item)"
              :class="[
              'group relative flex items-center px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer',
              draggedIndex === index ? 'opacity-50 scale-95 bg-gray-50' : 'hover:bg-teal-50',
              isParentItemActive(item) ? 'bg-gradient-to-r from-teal-50 to-emerald-50 border-l-4 border-teal-500' : ''
            ]"
              :title="isCollapsed ? item.title : ''"
          >
            <!-- Module Icon -->
            <div
                :class="[
                'flex items-center justify-center rounded-lg transition-all duration-200',
                isParentItemActive(item)
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-600 group-hover:bg-teal-100 group-hover:text-teal-600'
              ]"
                style="width: 36px; height: 36px;"
            >
              <font-awesome-icon v-if="item.icon" :icon="item.icon" class="w-5 h-5" />
              <font-awesome-icon v-else icon="fa-solid fa-home" class="w-5 h-5" />
            </div>

            <!-- Module Title -->
            <transition
                enter-active-class="transition-all duration-300 ease-out"
                leave-active-class="transition-all duration-200 ease-in"
                enter-from-class="opacity-0 -translate-x-2"
                enter-to-class="opacity-100 translate-x-0"
                leave-from-class="opacity-100 translate-x-0"
                leave-to-class="opacity-0 -translate-x-2"
            >
              <div v-if="!isCollapsed" class="ml-3 flex-1 min-w-0 flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700 group-hover:text-teal-700 truncate">
                  {{ item.title }}
                </span>
                <span
                    v-if="item.children && item.children.length"
                    class="ml-2 text-teal-600"
                >
                  <font-awesome-icon icon="chevron-right" class="text-teal-600 ml-2" />
              </span>
              </div>
            </transition>

            <!-- Drop Indicator -->
            <div
                v-if="draggedOverIndex === index"
                class="absolute inset-0 border-2 border-dashed border-teal-400 rounded-xl pointer-events-none"
            ></div>
          </div>
        </transition-group>

        <!-- Empty State -->
        <div
            v-if="localModules.length === 0"
            class="text-center mt-8"
        >
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
            <font-awesome-icon icon="fa-solid fa-face-frown" class="w-6 h-6 text-gray-400" />
          </div>
          <p class="text-sm text-gray-500">No modules available</p>
          <p class="text-xs text-gray-400 mt-1">Add modules to get started</p>
        </div>
      </div>
    </nav>
  </aside>
  <div v-if="isLoadingTranslation" class="fixed inset-0 z-[999] flex items-center justify-center bg-white/50 backdrop-blur-sm">
    <div class="flex flex-col items-center gap-4">
      <font-awesome-icon :icon="['fas', 'spinner']" class="w-12 h-12 text-teal-600 animate-spin" />
      <p class="text-teal-900 font-bold animate-pulse">Loading Translations...</p>
    </div>
  </div>
</template>


<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

/* List transition animations */
.list-enter-active,
.list-leave-active,
.list-move {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.list-leave-active {
  position: absolute;
}

/* Active navigation item */
.active-nav-item {
  background: linear-gradient(135deg, rgba(0, 196, 159, 0.1) 0%, rgba(0, 168, 137, 0.1) 100%);
  border-left: 4px solid #00C49F;
}

.active-nav-item .drag-handle {
  color: #00C49F;
}

/* Drag handle styling */
.drag-handle {
  transition: all 0.2s ease;
}

.drag-handle:hover {
  transform: scale(1.1);
}

/* Smooth transitions */
* {
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
.side{
  padding-top: 5rem;
}
</style>