

<script setup lang="ts">
import VueMultiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// Components
import BaseModal from '@/components/baseModal.vue';
import BaseDetailModal from '@/components/baseDetailModal.vue';
import AccessDenied from '@/components/accessDenied.vue';

// Logic Composable
import { useLocalization } from '@/composables/useLocalization';

const {
  locStore, isAdmin, isChildModule, breadcrumbItems, availableLanguages,
  searchQuery, currentPage, itemsPerPage, sortBy, sortDirection,
  isViewModalOpen, isModalOpen, isDeleteModalOpen, isSubmitting, isEditing,
  selectedItem, statusMessage, form, errors, toastMessage,
  isFormInvalid, paginatedData, totalItems, totalPages,
  formatDate, handleSort, goToPage, nextPage, prevPage, pageNumbers,
  openAddLocalizationModal, handleEdit, validateCode, validateText,
  validateLanguage, validateModule, handleFormSubmit, openViewLocalizationModal,
  openDeleteModal,isFetchingLocalization ,handleConfirmDelete, activeModules, transStore,resetForm,startIndex,endIndex,isLoacalizationTableLoading
} = useLocalization();

// Helper for UI checkmarks if needed in template
const isModuleSelected = (option: any) => {
  return form.module_id.some((mod: any) => mod.id === option.id);
};
</script>



<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6">
    <div v-if="isAdmin">
      <div class="max-w-7xl mx-auto mb-8">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <font-awesome-icon icon="fa-solid fa-language" class="text-white text-xl" />
            </div>
            <div>
              <h1 class="text-2xl md:text-3xl font-bold text-gray-800">
                {{ transStore.t('localization.title') }}
              </h1>
              <p v-if="!isChildModule" class="text-gray-600 mt-1">
                {{ transStore.t('localization.description') }}
              </p>
              <p v-else class="text-gray-600 mt-1 text-sm">
                <template v-for="(item, i) in breadcrumbItems" :key="i">
                  <router-link v-if="item.url" :to="item.url" class="text-teal-600 hover:text-teal-700 hover:underline font-medium">{{ item.label }}</router-link>
                  <span v-else class="text-gray-600">{{ item.label }}</span>
                  <span v-if="i < breadcrumbItems.length - 1" class="text-gray-400 mx-1">></span>
                </template>
              </p>
            </div>
          </div>

          <button
              @click="openAddLocalizationModal"
              class="group bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            <font-awesome-icon
                icon="fa-solid fa-plus"
                class="transform group-hover:rotate-90 transition-transform duration-300"
            />
            {{ transStore.t('localization.button.add.new') }}
          </button>
        </div>
      </div>
      <div v-if="isFetchingLocalization" class="fixed inset-0 z-[999] flex items-center justify-center bg-white/50 backdrop-blur-sm">
        <div class="flex flex-col items-center gap-4">
          <font-awesome-icon :icon="['fas', 'spinner']" class="w-12 h-12 text-teal-600 animate-spin" />
          <p class="text-teal-900 font-bold animate-pulse">Fetching Localization Details...</p>
        </div>
      </div>
      <div class="max-w-7xl mx-auto mb-6">
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
                    :placeholder="transStore.t('localization.search.placeholder')"
                    class="w-full pl-10 border-2 py-2 px-3 rounded-lg transition-all outline-none focus:ring-0 border-gray-100 focus:border-[#00C49F] bg-white"  />

              </div>
            </div>

            <div class="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 w-full md:w-auto">
              <div class="flex items-center justify-between md:justify-start gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                <span class="text-sm text-gray-600 font-medium whitespace-nowrap">{{ transStore.t('localization.table.show') }}</span>
                <select
                    v-model="itemsPerPage"
                    class="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors outline-none cursor-pointer"
                >
                  <option :value="5">5</option>
                  <option :value="10">10</option>
                  <option :value="20">20</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
                <span class="text-sm text-gray-600 font-medium whitespace-nowrap">{{ transStore.t('localization.table.entries') }}</span>
              </div>

              <div class="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 text-center md:text-left shadow-sm">
                <span v-if="isLoacalizationTableLoading" class="text-sm text-gray-700 font-medium whitespace-nowrap">
                  {{ transStore.t('localization.table.total') }}: <span ><font-awesome-icon
                    :icon="['fas', 'spinner']"
                    class="w-4 h-4 text-teal-600 animate-spin"
                /></span> {{ transStore.t('localization.table.localizations.count') }}
                </span>
                <span v-else class="text-sm text-gray-700 font-medium whitespace-nowrap">
                  {{ transStore.t('localization.table.total') }}: <span class="font-bold text-gray-900">{{ totalItems }}</span> {{ transStore.t('localization.table.localizations.count') }}
                </span>


              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-6">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gradient-to-b from-gray-200 to-gray-100">
            <tr>
              <th
                  @click="handleSort('code')"
                  class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group"
              >
                <div class="flex items-center gap-2">
                  <span>{{ transStore.t('localization.table.header.code') }}</span>
                  <font-awesome-icon
                      v-if="sortBy === 'code'"
                      :icon="sortDirection === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down'"
                      class="text-teal-600"
                  />
                  <font-awesome-icon v-else icon="fa-solid fa-sort" class="text-gray-400 opacity-50" />
                </div>
              </th>
              <th
                  @click="handleSort('language_name')"
                  class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group"
              >
                <div class="flex items-center gap-2">
                  <span>{{ transStore.t('localization.table.header.language') }}</span>
                  <font-awesome-icon
                      v-if="sortBy === 'language_name'"
                      :icon="sortDirection === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down'"
                      class="text-teal-600"
                  />
                  <font-awesome-icon v-else icon="fa-solid fa-sort" class="text-gray-400 opacity-50" />
                </div>
              </th>
              <th
                  @click="handleSort('updated_at')"
                  class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group"
              >
                <div class="flex items-center gap-2">
                  <span>{{ transStore.t('localization.table.header.last.updated') }}</span>
                  <font-awesome-icon
                      v-if="sortBy === 'updated_at'"
                      :icon="sortDirection === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down'"
                      class="text-teal-600"
                  />
                  <font-awesome-icon v-else icon="fa-solid fa-sort" class="text-gray-400 opacity-50" />
                </div>
              </th>
              <th class="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                {{ transStore.t('localization.table.header.actions') }}
              </th>
            </tr>
            </thead>

            <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-if="isLoacalizationTableLoading">
              <td  colspan="6" class="py-16 text-center">
                <div class="flex flex-col items-center justify-center space-y-4">
                  <font-awesome-icon
                      icon="fa-solid fa-spinner"
                      class="w-10 h-10 text-teal-500 animate-spin"
                  />
                  <div>
                    <p class="text-gray-500 font-medium">Fetching records...</p>
                    <p class="text-xs text-gray-400">Updating table data</p>
                  </div>
                </div>
              </td>
            </tr>

            <tr v-else-if="paginatedData.length > 0"
                v-for="loc in paginatedData"
                :key="loc.id"
                @click="openViewLocalizationModal(loc)"
                class="hover:bg-gray-50 cursor-pointer transition-all duration-200"
            >
              <td class="px-6 py-4 text-left">
                <div class="flex items-center">
                  <div class="relative">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center shadow-sm">
                        <span class="font-bold text-teal-700 text-sm">
                          {{ loc.language_code?.charAt(0).toUpperCase() || '?' }}
                        </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-semibold text-gray-900">{{ loc.text }}</div>
                    <div class="text-xs text-gray-500">{{ loc.code }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-left">
                  <span
                      class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium"
                      :style="{
                      backgroundColor: '#e8f5e9',
                      color: '#2e7d32',
                      border: '1px solid rgba(46,125,50,0.1)'
                    }"
                  >
                    {{ loc.language_name || loc.language_code }}
                  </span>
              </td>
              <td class="px-6 py-4 text-left">
                <div class="text-sm text-gray-600">
                  {{ formatDate(loc.updated_at || loc.created_at) }}
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2" @click.stop>
                  <button
                      @click="handleEdit(loc)"
                      class="p-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-600 border border-blue-200 hover:border-blue-300 transition-all duration-200 group"
                      title="Edit"
                  >
                    <font-awesome-icon
                        icon="fa-solid fa-pen-to-square"
                        class="w-4 h-4 group-hover:scale-110 transition-transform"
                    />
                  </button>
                  <button
                      @click="openDeleteModal(loc)"
                      class="p-2 rounded-lg bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 text-red-600 border border-red-200 hover:border-red-300 transition-all duration-200 group"
                      title="Delete"
                  >
                    <font-awesome-icon
                        icon="fa-solid fa-trash-can"
                        class="w-4 h-4 group-hover:scale-110 transition-transform"
                    />
                  </button>
                  <button
                      @click="openViewLocalizationModal(loc)"
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
            <tr v-else >
              <td colspan="4" class="px-6 py-12 text-center">
                <div class="flex flex-col items-center justify-center">
                  <font-awesome-icon
                      icon="fa-solid fa-language"
                      class="text-gray-300 text-5xl mb-4"
                  />
                  <p class="text-gray-500 text-lg font-medium">{{ transStore.t('localization.table.no.data') }}</p>
                  <p class="text-gray-400 text-sm mt-1">
                    {{ searchQuery ? 'Try adjusting your search' : 'Click "Add New Localization" to create one' }}
                  </p>
                </div>
              </td>
            </tr>
            
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
            v-if="totalPages > 0"
            class="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200"
        >
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="text-sm text-gray-700">
  <span v-if="totalItems === 0">
    {{ transStore.t('localization.table.showing.zero') }}
  </span>
              <span v-else>
    {{ transStore.t('localization.table.showing') }}
    <span class="font-semibold">{{ startIndex }}</span>
    {{ transStore.t('localization.table.to') }}
    <span class="font-semibold">{{ endIndex }}</span>
    {{ transStore.t('localization.table.of') }}
    <span class="font-semibold">{{ totalItems }}</span>
    {{ transStore.t('localization.table.results') }}
  </span>
            </div>

            <div class="flex items-center gap-1">
              <button
                  @click="prevPage"
                  :disabled="currentPage === 1"
                  :class="[
                  'p-2 rounded-lg transition-all duration-200 border border-gray-300 bg-white',
                  currentPage === 1
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-50 hover:shadow-sm text-gray-700'
                ]"
              >
                <font-awesome-icon icon="fa-solid fa-chevron-left" class="w-4 h-4" />
              </button>

              <div class="flex items-center gap-1">
                <button
                    v-for="(page, index) in pageNumbers"
                    :key="index"
                    @click="typeof page === 'number' && goToPage(page)"
                    :class="[
                    'min-w-[2.5rem] h-10 flex items-center justify-center rounded-lg transition-all duration-200 font-medium text-sm border',
                    page === currentPage
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-transparent shadow-md'
                      : typeof page === 'number'
                        ? 'bg-white border-gray-300 hover:bg-gray-50 hover:shadow-sm text-gray-700'
                        : 'bg-white border-gray-300 text-gray-400 cursor-default'
                  ]"
                    :disabled="typeof page !== 'number'"
                >
                  {{ page }}
                </button>
              </div>

              <button
                  @click="nextPage"
                  :disabled="currentPage === totalPages"
                  :class="[
                  'p-2 rounded-lg transition-all duration-200 border border-gray-300 bg-white',
                  currentPage === totalPages
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-50 hover:shadow-sm text-gray-700'
                ]"
              >
                <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <BaseModal
          :is-open="isModalOpen"
          :loading="isSubmitting"
          :disabled="isFormInvalid"
          :title="isEditing ? transStore.t('localization.modal.title.edit') : transStore.t('localization.modal.title.create')"
          :submitText="isEditing ? transStore.t('localization.modal.button.update') : transStore.t('localization.modal.button.save')"
          @close="isModalOpen = false; resetForm()"
          @save="handleFormSubmit"
      >
        <div class="p-0">
          <div
              v-if="statusMessage.text"
              :class="[
              statusMessage.type === 'success'
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-red-50 text-red-700 border-red-200',
              'flex items-center gap-2 py-2 px-3 mb-6 rounded-lg shadow-sm border text-sm font-semibold'
            ]"
          >
            <font-awesomeIcon
                :icon="statusMessage.type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation'"
            />
            {{ statusMessage.text }}
          </div>

          <div class="space-y-4">


            <div>
              <label class="block font-bold text-gray-600 text-xs uppercase tracking-wide mb-1.5">
                {{ transStore.t('localization.modal.label.module') }} <span class="text-red-500">*</span>
              </label>

              <VueMultiselect
                  v-model="form.module_id"
                  :options="activeModules"
                  :multiple="true"
                  :close-on-select="false"
                  :searchable="true"
                  :placeholder="transStore.t('localization.modal.placeholder.module')"
                  label="description"
                  track-by="id"
                  :class="{ 'border-red-500': errors.module_id }"
              >
                <template #option="{ option }">
                  <div class="flex items-center justify-between">
                    <span>{{ option.description }} ({{ option.id }})</span>
                    <font-awesome-icon
                        v-if="isModuleSelected(option)"
                        icon="fa-solid fa-check"
                        class="w-4 h-4 text-teal-500"
                    />
                  </div>
                </template>
              </VueMultiselect>

              <p v-if="errors.module_id" class="text-red-500 text-xs mt-1.5 font-medium">
                {{ errors.module_id }}
              </p>
            </div>

            <div>
              <label class="block font-bold text-gray-600 text-xs uppercase tracking-wide mb-1.5">
                {{ transStore.t('localization.modal.label.language') }} <span class="text-red-500">*</span>
              </label>
              <select
                  v-model="form.language_code"
                  @change="validateLanguage"
                  class="w-full border-2 py-2.5 px-3 rounded-lg transition-all outline-none focus:ring-0 bg-white"
                  :class="errors.language_code
                  ? 'border-red-500 bg-red-50 focus:border-red-500'
                  : 'border-gray-200 focus:border-teal-500'"
              >
                <option value="" disabled selected>{{ transStore.t('localization.modal.placeholder.language') }}</option>
                <option v-for="lang in availableLanguages" :key="lang.code" :value="lang.code">
                  {{ lang.name }} ({{ lang.code }})
                </option>
              </select>
              <p v-if="errors.language_code" class="text-red-500 text-xs mt-1.5 font-medium">
                {{ errors.language_code }}
              </p>
            </div>

            <div>
              <label class="block font-bold text-gray-600 text-xs uppercase tracking-wide mb-1.5">
                {{ transStore.t('localization.modal.label.code') }} <span class="text-red-500">*</span>
              </label>
              <input
                  v-model="form.code"
                  @input="validateCode"
                  :placeholder="transStore.t('localization.modal.placeholder.code.example')"
                  class="w-full border-2 py-2.5 px-3 rounded-lg transition-all outline-none focus:ring-0"
                  :class="errors.code
                  ? 'border-red-500 bg-red-50 focus:border-red-500'
                  : 'border-gray-200 focus:border-teal-500'"
              />
              <p v-if="errors.code" class="text-red-500 text-xs mt-1.5 font-medium">
                {{ errors.code }}
              </p>
            </div>

            <div>
              <label class="block font-bold text-gray-600 text-xs uppercase tracking-wide mb-1.5">
                {{ transStore.t('localization.modal.label.display.text') }} <span class="text-red-500">*</span>
              </label>
              <textarea
                  v-model="form.text"
                  @input="validateText"
                  rows="4"
                  class="w-full border-2 py-2.5 px-3 rounded-lg transition-all outline-none focus:ring-0 resize-none"
                  :class="errors.text
                  ? 'border-red-500 bg-red-50 focus:border-red-500'
                  : 'border-gray-200 focus:border-teal-500'"
                  :placeholder="transStore.t('localization.modal.placeholder.display.text')"
              ></textarea>
              <p v-if="errors.text" class="text-red-500 text-xs mt-1.5 font-medium">
                {{ errors.text }}
              </p>
            </div>

          </div>
        </div>
      </BaseModal>

      <!-- Delete Modal -->
      <BaseModal
          mode="delete"
          :is-open="isDeleteModalOpen"
          :loading="isSubmitting"
          :title="transStore.t('localization.modal.title.delete')"
          :submitText="transStore.t('localization.modal.button.confirm.delete')"
          @close="isDeleteModalOpen = false"
          @save="handleConfirmDelete"
      >
        <div class="text-center">

          <p class="text-gray-600 mb-4">
            {{ transStore.t('localization.modal.confirm.delete.text') }}
            <span class="font-semibold text-gray-900">"{{ selectedItem?.text }}"</span>?
          </p>



          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-left">
            <div class="flex items-start">
              <font-awesomeIcon
                  icon="fa-solid fa-triangle-exclamation"
                  class="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0"
              />
              <p class="text-sm text-yellow-700">
                {{ transStore.t('localization.modal.delete.warning.text') }}</p>
            </div>
          </div>
        </div>
      </BaseModal>

      <!-- View Modal -->
      <BaseDetailModal
          :is-open="isViewModalOpen"
          :title="transStore.t('localization.modal.title.details')"
          :show-submit="false"
          submit-text=""
          @close="isViewModalOpen = false"
      >
        <div class="p-0" v-if="selectedItem">
          <div class="grid grid-cols-2 gap-y-6 gap-x-4">
            <div class="col-span-2">
              <label class="block text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
                {{ transStore.t('localization.modal.label.code') }}
              </label>
              <p class="text-xl font-bold text-gray-900 break-all">{{ selectedItem.code }}</p>
            </div>

            <div>
              <label class="block text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
                {{ transStore.t('localization.modal.label.display.text') }}
              </label>
              <p class="text-base font-medium text-gray-800">{{ selectedItem.text }}</p>
            </div>

            <div>
              <label class="block text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
                {{ transStore.t('localization.modal.label.language') }}
              </label>
              <span
                  class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium"
                  :style="{
                  backgroundColor: '#e8f5e9',
                  color: '#2e7d32',
                  border: '1px solid rgba(46,125,50,0.1)'
                }"
              >
                {{ selectedItem.language_name || selectedItem.language_code }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-y-6 gap-x-4 border-t border-gray-100 pt-6 mt-4">
            <div>
              <label class="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                {{ transStore.t('localization.modal.label.id') }}
              </label>
              <p class="text-sm font-medium text-gray-800">#{{ selectedItem.id }}</p>
            </div>

            <div>
              <label class="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                {{ transStore.t('localization.modal.label.language.code') }}
              </label>
              <p class="text-sm font-medium text-gray-800 uppercase">
                {{ selectedItem.language_code }}
              </p>
            </div>

            <div>
              <label class="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                {{ transStore.t('localization.modal.label.created.at') }}
              </label>
              <p class="text-sm font-medium text-gray-800">
                {{ formatDate(selectedItem.created_at) }}
              </p>
            </div>

            <div>
              <label class="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                {{ transStore.t('localization.modal.label.updated.at') }}
              </label>
              <p class="text-sm font-medium text-gray-800">
                {{ formatDate(selectedItem.updated_at) }}
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
                <font-awesome-icon
                    v-if="toastMessage.type === 'success'"
                    icon="fa-solid fa-circle-check"
                    class="w-6 h-6"
                />
                <font-awesome-icon
                    v-else-if="toastMessage.type === 'error'"
                    icon="fa-solid fa-circle-xmark"
                    class="w-6 h-6"
                />
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
                    class="w-4 h-4"
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
.cursor-pointer {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.cursor-pointer:hover {
  background-color: rgba(0, 0, 0, 0.02) !important;
}

/* Animation for row hover */
tbody tr {
  transition: all 0.2s ease;
}

/* Custom scrollbar for better UX */
.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Placeholder styling */
:deep(.multiselect__content-wrapper) {
  max-height: 167px !important; /* Adjust height to your liking */
  overflow-y: auto !important;  /* Enables the vertical scroll */
}
:deep(.multiselect__tags) {
  border:2px solid #e8e8e8;
  border-radius:0.5rem/* Enables the vertical scroll */
}
</style>