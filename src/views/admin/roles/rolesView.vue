<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

// Components
import AccessDenied from '@/components/accessDenied.vue';
import BaseModal from '@/components/baseModal.vue';
import BaseDetailModal from '@/components/baseDetailModal.vue';

// Logic Composable
import { useRoles } from '@/composables/useRoles';

const {
  isAdmin, searchQuery, isSubmitting, currentPage, itemsPerPage, sortBy, sortDirection,
  selectedRole, statusMessage, toastMessage, isModalOpen, isDeleteModalOpen, isViewModalOpen,
  isEditing, isToggleModalOpen, form, errors, formatDate, validateName, validateType,
  isFormInvalid, filteredRoles, paginatedRoles, totalPages, pageNumbers, handleSort,
  goToPage, nextPage, prevPage, openViewModal, openAddModal, openEditModal,
  handleFormSubmit, openDeleteModal, handleConfirmDelete, openToggleModel, handleConfirmToggle,
  resetForm, transStore, breadcrumbItems, isChildModule, roleStore,startRolesTour,isRolesTableLoading,isFetchingRoles
} = useRoles();
</script>


<template>

  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 font-sans">
    <div v-if="isAdmin">
  <div class="max-w-7xl mx-auto mb-8" data-tour-id="module-header">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg">
            <font-awesome-icon icon="fa-solid fa-user-shield" class="text-white text-xl" />
          </div>

          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-gray-800">{{ transStore.t('role.title') }}</h1>
            <p v-if="!isChildModule" class="text-gray-600 mt-1">{{ transStore.t('role.title.description') }}</p>
            <p v-else class="text-gray-600 mt-1 text-sm">
              <template v-for="(item, i) in breadcrumbItems" :key="i">
                <router-link v-if="item.url" :to="item.url" class="text-teal-600 hover:text-teal-700 hover:underline font-medium">{{ item.label }}</router-link>
                <span v-else class="text-gray-600">{{ item.label }}</span>
                <span v-if="i < breadcrumbItems.length - 1" class="text-gray-400 mx-1">></span>
              </template>
            </p>

          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
              type="button"
              class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-100 hover:bg-teal-100 hover:border-teal-200"
              @click="startRolesTour"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
            Start tour
          </button>

          <button
              @click="openAddModal"
              class="group bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            <font-awesome-icon
                icon="fa-solid fa-plus"
                class="transform group-hover:rotate-90 transition-transform duration-300"
            />
            {{ transStore.t('role.create') }}
          </button>
        </div>
      </div>
    </div>

      <div v-if="isFetchingRoles" class="fixed inset-0 z-[999] flex items-center justify-center bg-white/50 backdrop-blur-sm">
        <div class="flex flex-col items-center gap-4">
          <font-awesome-icon :icon="['fas', 'spinner']" class="w-12 h-12 text-teal-600 animate-spin" />
          <p class="text-teal-900 font-bold animate-pulse">Fetching Role Details...</p>
        </div>
      </div>
    <div class="max-w-7xl mx-auto mb-6" data-tour-id="module-filters">
      <div class="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-100">
        <div class="flex flex-col md:flex-row gap-6 items-center justify-between">

          <div class="w-full md:w-96">

            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <font-awesome-icon
                    icon="fa-solid fa-search"
                    class="text-gray-400 group-focus-within:text-teal-500 transition-colors"
                />
              </div>
              <input
                  v-model="searchQuery"
                  type="text"
                  :placeholder="transStore.t('role.search')"
                  :class="errors.name ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-gray-100 focus:border-[#00C49F] bg-white'"
                  class="w-full pl-10 border-2 py-2 px-3 rounded-lg transition-all outline-none focus:ring-0"
                  @input="currentPage = 1"
              />
            </div>
          </div>

          <div class="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 w-full md:w-auto mt-4 md:mt-0">

            <div class="flex items-center justify-between md:justify-start gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 flex-1 md:flex-none">
              <span class="text-sm text-gray-600 font-medium whitespace-nowrap">{{ transStore.t('show') }}</span>
              <select
                  v-model="itemsPerPage"
                  @change="currentPage = 1"
                  class="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors outline-none cursor-pointer"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>

            <div class="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 text-center md:text-left shadow-sm">

              <span v-if="isRolesTableLoading" class="text-sm text-gray-700 font-medium whitespace-nowrap">
                  {{ transStore.t('total')  }}: <span ><font-awesome-icon
                  :icon="['fas', 'spinner']"
                  class="w-4 h-4 text-teal-600 animate-spin"
              /></span> {{ transStore.t('roles') }}
                </span>
              <span v-else class="text-sm text-gray-700 font-medium whitespace-nowrap">
                  {{ transStore.t('total') }}: <span class="font-bold text-gray-900">{{ filteredRoles.length }}</span> {{ transStore.t('roles') }}
                </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-6" data-tour-id="module-main">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gradient-to-b from-gray-200 to-gray-100">
          <tr>
            <th @click="handleSort('name')" class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group">
              <div class="flex items-center gap-2">
                <span>{{ transStore.t('role.table.name') }}</span>
                <font-awesome-icon
                    v-if="sortBy === 'name'"
                    :icon="sortDirection === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down'"
                    class="text-teal-600"
                />
                <font-awesome-icon v-else icon="fa-solid fa-sort" class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
              </div>
            </th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{{ transStore.t('description') }}</th>

            <th @click="handleSort('role_type_name')" class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group">
              <div class="flex items-center gap-2">
                <span>{{ transStore.t('role.table.type') }}</span>
                <font-awesome-icon v-if="sortBy === 'role_type_name'" :icon="sortDirection === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down'" class="text-teal-600" />
              </div>
            </th>
            <th class="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">{{ transStore.t('status') }}</th>
            <th class="pl-20 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">{{ transStore.t('actions') }}</th>
          </tr>
          </thead>

          <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-if="isRolesTableLoading">
            <td  colspan="6" class="py-16 text-center">
              <div class="flex flex-col items-center justify-center space-y-4">
                <font-awesome-icon
                    icon="fa-solid fa-spinner"
                    class="w-10 h-10 text-teal-500 animate-spin"
                />
                <div>
                  <p class="text-gray-500 font-medium animate-pulse">{{ transStore.t('role.fetch.records') }}</p>
                  <p class="text-xs text-gray-400 animate-pulse">{{ transStore.t('role.fetch.table') }}</p>
                </div>
              </div>
            </td>
          </tr>
          <tr v-else-if="paginatedRoles.length > 0"
              v-for="(role, index) in paginatedRoles"
              :key="role.id"
              @click="openViewModal(role)"
              class="hover:bg-gray-50 cursor-pointer transition-all duration-200 animate-fade-in"
              :style="{ animationDelay: `${index * 0.05}s` }"
          >
            <td class="px-6 py-4">
              <div class="flex items-center">
                <div class="relative">
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center shadow-sm">
                    <span class="font-bold text-teal-700 text-sm">{{ role.name?.charAt(0).toUpperCase() }}</span>
                  </div>
                  <div v-if="role.is_active" class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-semibold text-gray-900">{{ role.name }}</div>
<!--                  <div class="text-xs text-gray-400">{{ transStore.t('id') }} #{{ role.id }}</div>-->
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-600 truncate max-w-[250px]" >
                {{ role.description }}
              </div>
            </td>
            <td class="px-6 py-4">
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200">
              {{ role.role_type_name  }}
            </span>
            </td>

            <td class="px-6 py-4 text-center">
              <button
                  type="button"
                  @click.stop="openToggleModel(role)"
                  :class="role.is_active ? 'bg-emerald-500' : 'bg-gray-300'"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none shadow-inner"
                  role="switch"
                  :aria-checked="role.is_active"
              >
                <span class="sr-only">Toggle active state</span>

                <span
                    :class="role.is_active ? 'translate-x-6' : 'translate-x-1'"
                    class="inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out"
                ></span>
              </button>
            </td>

            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-2" @click.stop>
                <button
                    @click="openEditModal(role)"
                    class="p-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-600 border border-blue-200 hover:border-blue-300 transition-all duration-200 group"

                >
                  <font-awesome-icon
                      icon="fa-solid fa-pen-to-square"
                      class="w-4 h-4 group-hover:scale-110 transition-transform"
                  />
                </button>
                <button
                    @click="openDeleteModal(role)"
                    class="p-2 rounded-lg bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 text-red-600 border border-red-200 hover:border-red-300 transition-all duration-200 group"
                >
                  <font-awesome-icon
                      icon="fa-solid fa-trash-can"
                      class="w-4 h-4 group-hover:scale-110 transition-transform"
                  />
                </button>
                <button
                    @click="openViewModal(role)"
                    class="p-2 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-600 border border-gray-200 transition-all duration-200 group"
                    title="View details"
                >
                  <font-awesome-icon
                      icon="fa-solid fa-eye"
                      class="w-4 h-4 group-hover:scale-110 transition-transform"
                  />
                </button>
              </div>
            </td>
          </tr>
          <tr v-else>
            <td colspan="4" class="px-6 py-12 text-center">
              <div class="text-gray-400 animate-fade-in">
                <font-awesome-icon icon="fa-solid fa-frown" class="w-12 h-12 text-gray-500" />
                <p class="text-lg font-medium mt-4 text-gray-500 mb-2">{{ transStore.t('role.table.empty') }}</p>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
      <div v-if="totalPages > 1" class="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-100">
        <span class="text-xs font-medium text-gray-500">
         {{ transStore.t('page') }} {{ currentPage }} {{ transStore.t('of') }} {{ totalPages }}
        </span>

        <nav class="flex space-x-1">
          <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm disabled:opacity-50 text-gray-600"
          >
            <font-awesome-icon icon="fa-solid fa-chevron-left" class="text-[10px]" />
          </button>

          <button
              v-for="page in pageNumbers"
              :key="page"
              @click="goToPage(page)"
              class="w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all shadow-sm"
              :class="page === currentPage ? 'bg-[#00C49F] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'"
          >
            {{ page }}
          </button>

          <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm disabled:opacity-50 text-gray-600"
          >
            <font-awesome-icon icon="fa-solid fa-chevron-right" class="text-[10px]" />
          </button>
        </nav>
      </div>
    </div>

    <BaseModal
        :is-open="isModalOpen"
        :loading="isSubmitting"
        :disabled="isFormInvalid"
        :title="isEditing  ? transStore.t('role.edit')  : transStore.t('role.create')"
        :submitText="isEditing ? transStore.t('role.update')  : transStore.t('role.save')"

        @close="isModalOpen = false; resetForm()"
        @save="handleFormSubmit"
    >
      <div class="p-0">

        <div class="mb-4">
          <label class="block font-bold text-gray-500 text-[0.75rem] uppercase tracking-wide mb-1.5"> {{ transStore.t('role.create.name') }}</label>
          <input v-model="form.name"
                 @input="validateName"
                 :placeholder="transStore.t('create.name.placeholder')"

                 class="w-full border-2 py-2 px-3 rounded-lg transition-all outline-none focus:ring-0"
                 :class="errors.name
                ? 'border-red-500 bg-red-50 focus:border-red-500'
                : 'border-gray-100 focus:border-[#00C49F] bg-white'" />
          <p v-if="errors.name" class="text-red-500 text-xs mt-1.5 font-medium">{{ errors.name }}</p>
        </div>

        <div class="mb-4">
          <label class="block font-bold text-gray-500 text-[0.75rem] uppercase tracking-wide mb-1.5">{{ transStore.t('description') }}</label>
          <textarea v-model="form.description"
                    rows="3"
                    :placeholder="transStore.t('create.desc.placeholder')"
                    class="w-full border-2 py-2 px-3 rounded-lg border-gray-100 outline-none focus:border-[#00C49F] transition-all resize-none bg-white"></textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div class="md:col-span-7">
            <label class="block font-bold text-gray-500 text-[0.75rem] uppercase tracking-wide mb-1.5">{{ transStore.t('role.table.type') }}</label>
            <select v-model="form.role_type"
                    @change="validateType"
                    class="w-full border-2 py-2 px-3 rounded-lg border-gray-100 outline-none focus:border-[#00C49F] transition-all bg-white cursor-pointer">
              <option value="" disabled>{{ transStore.t('role.create.dropdown.placeholder') }}</option>
              <option v-for="type in (roleStore.roleTypes as any[])" :key="type.id" :value="type.id">
                {{ type.name }}
              </option>
            </select>
            <p v-if="errors.role_type" class="text-red-500 text-xs mt-1.5 font-medium">{{ errors.role_type }}</p>
          </div>

          <div class="md:col-span-5 flex items-end pb-2">
            <label class="flex items-center cursor-pointer group">
              <div class="relative">
                <input
                    v-model="form.is_active"
                    type="checkbox"
                    class="sr-only peer"
                >
                <div class="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-[#00C49F] transition-colors"></div>
                <div class="absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
              <span class="ml-3 font-bold text-gray-900 text-sm"> {{ transStore.t('active ') }}</span>
            </label>
          </div>
        </div>
      </div>
    </BaseModal>
    <BaseModal
        :is-open="isDeleteModalOpen"
        :loading="isSubmitting"
        :title="transStore.t('role.delete')"
        :submitText="transStore.t('delete.confirm')"
        mode="delete"
        @close="isDeleteModalOpen = false"
        @save="handleConfirmDelete"
    >
      <div class="text-center">

        <p class="text-gray-600 mb-4">
          {{ transStore.t('delete.title') }}
          <span class="font-semibold text-gray-900">"{{ selectedRole?.name }}"</span>?
        </p>

        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-left">
          <div class="flex items-start gap-3">
            <font-awesome-icon
                icon="fa-solid fa-exclamation-triangle"
                class="text-yellow-600 mt-0.5 flex-shrink-0 text-lg"
            />
            <p class="text-sm text-yellow-700">
              {{ transStore.t('delete.desc') }}
            </p>
          </div>
        </div>
      </div>
    </BaseModal>
    <BaseModal
        :is-open="isToggleModalOpen"
        :loading="isSubmitting"
        mode="toggle"
        :title="transStore.t('role.update')"
        :submitText="transStore.t('confirm')"
        @close="isToggleModalOpen = false"
        @save="handleConfirmToggle"
    >
      <div class="text-center p-0">
        <div v-if="statusMessage.text"
             :class="statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'"
             class="flex items-center gap-2 py-2 px-3 mb-6 rounded-lg shadow-sm border text-[0.9rem] font-semibold text-left">
          <font-awesome-icon :icon="statusMessage.type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation'" />
          {{ statusMessage.text }}
        </div>

        <h3 class="text-xl font-bold text-gray-900 mb-2"> {{ transStore.t('update.title') }}</h3>
        <p class="text-gray-500 px-6 mb-2 text-[0.95rem] leading-relaxed">
          {{ transStore.t('update.desc') }}
          <span class="font-bold text-gray-800">"{{ selectedRole?.name }}"</span>.
        </p>
      </div>
    </BaseModal>
    <BaseDetailModal
        :is-open="isViewModalOpen"
        :title="transStore.t('role.details')"
        :item-id="selectedRole?.id"
        :show-submit="false"
        @close="isViewModalOpen = false"
    >
      <div class="p-0" v-if="selectedRole">
        <div v-if="statusMessage.text"
             :class="[
           statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200',
           'flex items-center gap-2 py-2 px-3 mb-4 rounded-lg border shadow-sm font-bold text-[0.85rem]'
         ]">
          <font-awesome-icon :icon="statusMessage.type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation'" />
          {{ statusMessage.text }}
        </div>

        <div class="flex justify-between items-start mb-6">
          <div>
            <label class="block text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{{ transStore.t('role.create.name') }}</label>
            <p class="text-xl font-bold text-gray-900 leading-tight">{{ selectedRole.name }}</p>
          </div>
          <span :class="selectedRole.is_active
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'"
                class="inline-block rounded-full border py-1.5 px-3 text-[10px] uppercase tracking-widest font-bold">
                {{selectedRole.is_active ?  transStore.t('active') : transStore.t('inactive') }}

      </span>
        </div>

        <div class="mb-6">
          <label class="block text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">{{ transStore.t('description') }}</label>
          <div class="p-4 bg-gray-50 rounded-xl border border-gray-100 italic text-gray-500 text-[0.9rem] leading-relaxed">
            "{{ selectedRole.description || transStore.t('details.nodesc')}}"
          </div>
        </div>

        <div class="grid grid-cols-2 gap-y-6 gap-x-4 border-t border-gray-100 pt-6">
          <div>
            <label class="block text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">{{ transStore.t('role.table.type') }}</label>
            <div class="flex items-center gap-2 font-bold text-gray-800 text-[0.9rem]">
              <span class="rounded-full bg-blue-500 w-2 h-2"></span>
              {{ selectedRole.role_type_name }}
            </div>
          </div>

          <div>
            <label class="block text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">{{ transStore.t('details.created') }}</label>
            <div class="flex items-center gap-2 font-bold text-gray-800 text-[0.9rem]">
              <font-awesome-icon icon="fa-solid fa-user-check" class="text-gray-400 opacity-60 text-[0.8rem]" />
              {{ selectedRole.created_by_name  }}
            </div>
          </div>

          <div>
            <label class="block text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">{{ transStore.t('details.date') }}</label>
            <p class="font-semibold text-gray-600 text-[0.85rem]">
              {{ formatDate(selectedRole.created_at) }}
            </p>
          </div>

          <div>
            <label class="block text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">{{ transStore.t('details.update') }}</label>
            <p class="font-semibold text-gray-600 text-[0.85rem]">
              {{ formatDate(selectedRole.updated_at) }}
            </p>
          </div>
        </div>
      </div>
    </BaseDetailModal>

    <Transition name="toast">
      <div
          v-if="toastMessage.title"
          class="fixed top-4 right-4 z-50 max-w-md"
      >
        <div
            :class="{
          'bg-green-50 border-green-200': toastMessage.type === 'success',
          'bg-red-50 border-red-200': toastMessage.type === 'error',
          'bg-blue-50 border-blue-200': toastMessage.type === 'info'
        }"
            class="p-4 rounded-xl border shadow-lg"
        >
          <div class="flex items-start gap-3">
            <div
                :class="{
              'text-green-600': toastMessage.type === 'success',
              'text-red-600': toastMessage.type === 'error',
              'text-blue-600': toastMessage.type === 'info'
            }"
            >
              <!-- Success icon -->
              <font-awesome-icon
                  v-if="toastMessage.type === 'success'"
                  icon="fa-solid fa-circle-check"
                  class="w-6 h-6"
              />

              <!-- Error icon -->
              <font-awesome-icon
                  v-else-if="toastMessage.type === 'error'"
                  icon="fa-solid fa-circle-xmark"
                  class="w-6 h-6"
              />

              <!-- Info icon -->
              <font-awesome-icon
                  v-else
                  icon="fa-solid fa-circle-info"
                  class="w-6 h-6"
              />
            </div>
            <div class="flex-1">
              <h4
                  :class="{
                'text-green-800': toastMessage.type === 'success',
                'text-red-800': toastMessage.type === 'error',
                'text-blue-800': toastMessage.type === 'info'
              }"
                  class="font-semibold text-sm"
              >
                {{ toastMessage.title }}
              </h4>
              <ul class="mt-1 text-sm" :class="{
              'text-green-700': toastMessage.type === 'success',
              'text-red-700': toastMessage.type === 'error',
              'text-blue-700': toastMessage.type === 'info'
            }">
                <li v-for="(msg, idx) in toastMessage.messages" :key="idx">{{ msg }}</li>
              </ul>
            </div>
            <button
                @click="toastMessage.title = ''"
                class="text-gray-400 hover:text-gray-600"
            >
              <font-awesome-icon
                  icon="fa-solid fa-xmark"
                  class="w-3 h-3"
              />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
    <AccessDenied v-else />
  </div>
</template>
<style scoped>
.tracking-wider { letter-spacing: 0.05em; }
.transition-all { transition: all 0.2s ease; }
.pagination  {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
}
.pagination {
  background-color: #198754 !important;
  color: white;
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* Multiselect custom styles */
:deep(.multiselect) {
  min-height: 44px;
  border-radius: 0.5rem;
}

:deep(.multiselect__tags) {
  min-height: 44px;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.625rem 2.5rem 0 0.625rem;
  background: white;
}

:deep(.multiselect__tag) {
  background: #dbeafe;
  color: #1e40af;
  border-radius: 9999px;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
}

:deep(.multiselect__option--highlight) {
  background: #0d9488;
  color: white;
}

:deep(.multiselect__option--selected) {
  background: #e0f2f1;
  color: #0f766e;
  font-weight: 600;
}
</style>