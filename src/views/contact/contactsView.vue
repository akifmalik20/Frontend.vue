<script setup lang="ts">
import VueMultiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

// Components
import AccessDenied from '@/components/accessDenied.vue';
import BaseModal from '@/components/baseModal.vue';
import BaseDetailModal from '@/components/baseDetailModal.vue';

// Logic Composable
import { useRoleGroup } from '@/composables/useRoleGroup';
import {useContact} from "@/composables/useContact.ts";

const {
  isAdmin, searchQuery, isSubmitting, currentPage, itemsPerPage, sortBy, sortDirection,
  selectedContact, statusMessage, isModalOpen, isDeleteModalOpen, isViewModalOpen, isEditing,
   form, toastMessage, errors, formatDate, validateName, isFormInvalid,
  paginatedContact, totalPages, pageNumbers, handleSort, goToPage,
  nextPage, prevPage,transStore, openViewModal, openAddModal, openEditModal, handleFormSubmit,
  openDeleteModal,  handleConfirmDelete,isUploadModalOpen,selectedFile,
     breadcrumbItems, isChildModule,
  filteredContacts,
  contactStore,
  resetForm,    formatFileSize,
  isContactTableLoading,isFetchingContactView,validateCity,validateCountry,validatePhone,validateZipCode,validateState,openAddBulkModal,handleFileSelect,handleUploadSubmit
} = useContact();
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 font-sans">

      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg">
                <font-awesome-icon icon="fas fa-people-group" class="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 class="text-2xl md:text-3xl font-bold text-gray-800"> {{transStore.t('contacts.title')}}</h1>
                <p v-if="!isChildModule" class="text-gray-600 mt-1">{{transStore.t('contacts.title.desc')}}</p>
                <p v-else class="text-gray-600 mt-1 text-sm">
                  <template v-for="(item, i) in breadcrumbItems" :key="i">
                    <router-link v-if="item.url" :to="item.url" class="text-teal-600 hover:text-teal-700 hover:underline font-medium">{{ item.label }}</router-link>
                    <span v-else class="text-gray-600">{{ item.label }}</span>
                    <span v-if="i < breadcrumbItems.length - 1" class="text-gray-400 mx-1">></span>
                  </template>
                </p>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-3 mb-2" >
          <button
              @click="openAddModal()"
              class="group bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            <font-awesome-icon icon="fas fa-plus" class="w-4 h-4 transform group-hover:rotate-90 transition-transform duration-300" />
             {{transStore.t('contact.add.contact')}}
          </button>
          <button
              @click="openAddBulkModal()"
              class="group bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            <font-awesome-icon icon="fas fa-plus" class="w-4 h-4 transform group-hover:rotate-90 transition-transform duration-300" />
             {{transStore.t('contact.add.bulk')}}
          </button>
          </div>
        </div>
      </div>

      <div v-if="isFetchingContactView" class="fixed inset-0 z-[999] flex items-center justify-center bg-white/50 backdrop-blur-sm">
        <div class="flex flex-col items-center gap-4">
          <font-awesome-icon :icon="['fas', 'spinner']" class="w-12 h-12 text-teal-600 animate-spin" />
          <p class="text-teal-900 font-bold animate-pulse">{{transStore.t('contact.fetch.contact')}}</p>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6 border border-gray-100">
        <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div class="w-full md:w-96">
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <font-awesome-icon
                    icon="fas fa-magnifying-glass"
                    class="h-4 w-4 text-gray-400 group-focus-within:text-teal-500 transition-colors"
                />
              </div>
              <input
                  v-model="searchQuery"
                  @input="currentPage = 1"
                  type="text"
                  :placeholder="transStore.t( 'contact.search.contact')"
                  :class="errors.name ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-gray-100 focus:border-[#00C49F] bg-white'"
                  class="w-full pl-10 border-2 py-2 px-3 rounded-lg transition-all outline-none focus:ring-0"            />
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
              <span class="text-sm text-gray-600"> {{transStore.t('contact.show')}}</span>
              <select
                  v-model="itemsPerPage"
                  @change="currentPage = 1"
                  class="bg-white border focus:outline-none border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </select>
            </div>

            <div class="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
              <!--       <span class="text-sm text-gray-700">-->
              <!--          {{ transStore.t( 'total') }}: <span class="font-bold text-gray-900">{{ filteredContacts.length }}</span> Contacts-->
              <!--       </span>-->
              <span v-if="isContactTableLoading" class="text-sm text-gray-700 font-medium whitespace-nowrap">
                  {{transStore.t('contact.total')}}: <span ><font-awesome-icon
                  :icon="['fas', 'spinner']"
                  class="w-4 h-4 text-teal-600 animate-spin"
              /></span> Contacts
                </span>
              <span v-else class="text-sm text-gray-700 font-medium whitespace-nowrap">
                  {{transStore.t('contact.total')}}: <span class="font-bold text-gray-900">{{ filteredContacts.length }}</span> {{transStore.t('contact.contacts')}}
                </span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-gray-100">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gradient-to-b from-gray-200 to-gray-100">
            <tr>
              <th
                  @click="handleSort('name')"
                  class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group"
              >
                <div class="flex items-center gap-2">
                  <span> {{transStore.t('contact.name')}}</span>
                  <font-awesome-icon
                      icon="fas fa-chevron-up"
                      class="transition-opacity"
                      :class="{
                   'opacity-0': sortBy !== 'name',
                   'opacity-100': sortBy === 'name',
                   'rotate-180': sortDirection === 'asc '&& sortBy === 'name'
                 }"
                  />
                </div>
              </th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                 {{transStore.t('contact.phone')}}
              </th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                 {{transStore.t('contact.city')}}
              </th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
               {{transStore.t('contact.country')}}
              </th>
              <th class=" pr-12 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                 {{transStore.t('contact.actions')}}
              </th>
            </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
            <tr v-if="isContactTableLoading">
              <td  colspan="6" class="py-16 text-center">
                <div class="flex flex-col items-center justify-center space-y-4">
                  <font-awesome-icon
                      icon="fa-solid fa-spinner"
                      class="w-10 h-10 text-teal-500 animate-spin"
                  />
                  <div>
                    <p class="text-gray-500 font-medium"> {{transStore.t('contact.fetch.records')}}</p>
                    <p class="text-xs text-gray-400">{{transStore.t('contact.load.data')}}</p>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-else-if="paginatedContact.length >0"
                v-for="(contact, index) in paginatedContact"
                :key="contact.id"
                @click="openViewModal(contact)"
                class="hover:bg-gray-50 cursor-pointer transition-all duration-200 animate-fade-in"
                :style="{ animationDelay: `${index * 0.05}s` }"
            >
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center shadow-sm">
             <span class="font-bold text-teal-700 text-sm">
               {{ contact.name?.charAt(0).toUpperCase() }}
             </span>
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-semibold text-gray-900">{{ contact.name }}</div>
<!--                    <div class="text-xs text-gray-500 uppercase tracking-wider"> {{transStore.t('contact.id')}} #{{ contact.id }}</div>-->
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-600 truncate max-w-[250px]" :title="contact.phone">
                  {{ contact.phone_number }}
                </div>
              </td>
              <td class="px-6 py-4">
         <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200">
           {{ contact.city }}
         </span>
              </td>
              <td class="px-6 py-4">
         <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200">
           {{ contact.country }}
         </span>
              </td>


              <td class="px-6 py-4">
                <div class="flex items-center gap-1.5" @click.stop>
                  <button
                      @click="openEditModal(contact)"
                      class="p-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-600 border border-blue-200 transition-all duration-200 group"
                      title="Edit Group"
                  >
                    <font-awesome-icon
                        icon="fas fa-pen-to-square"
                        class="w-4 h-4 group-hover:scale-110 transition-transform"
                    />
                  </button>
                  <button
                      @click="openDeleteModal(contact)"
                      class="p-2 rounded-lg bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 text-red-600 border border-red-200 transition-all duration-200 group"
                      title="Delete Group"
                  >
                    <font-awesome-icon
                        icon="fas fa-trash-can"
                        class="w-4 h-4 group-hover:scale-110 transition-transform"
                    />
                  </button>
                  <button
                      @click="openViewModal(contact)"
                      class="p-2 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-600 border border-gray-200 transition-all duration-200 group"
                      title="View details"
                  >
                    <font-awesome-icon
                        icon="fas fa-eye"
                        class="w-4 h-4 group-hover:scale-110 transition-transform"
                    />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-else >
              <td colspan="5" class="px-6 py-12 text-center">
                <div class="text-gray-400 animate-fade-in">
                  <font-awesome-icon
                      icon="fas fa-circle-exclamation"
                      class="w-16 h-16 mx-auto mb-4 opacity-50"
                  />
                  <p class="text-lg font-medium text-gray-500"> {{transStore.t('contact.not.found')}}</p>
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <div v-if="totalPages > 1" class="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
               {{transStore.t('contact.showing')}} <span class="font-semibold">{{ (currentPage - 1) * itemsPerPage + 1 }}</span>   {{transStore.t('contact.to')}}
              <span class="font-semibold">{{ Math.min(currentPage * itemsPerPage, filteredContacts.length) }}</span>   {{transStore.t('contact.of')}}
              <span class="font-semibold">{{ filteredContacts.length }}</span>   {{transStore.t('contact.results')}}
            </div>

            <div class="flex items-center gap-1">
              <button
                  @click="prevPage"
                  :disabled="currentPage === 1"
                  class="p-2 rounded-lg transition-all duration-200 border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
              >
                <font-awesome-icon icon="fas fa-chevron-left" class="w-5 h-5" />
              </button>

              <div class="flex items-center gap-1">
                <button
                    v-for="page in pageNumbers"
                    :key="page"
                    @click="typeof page === 'number' && goToPage(page)"
                    :class="page === currentPage
           ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md'
           : typeof page === 'number'
             ? 'bg-white hover:bg-gray-50 text-gray-700'
             : 'text-gray-400 cursor-default'"
                    class="w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 font-medium border border-gray-300"
                    :disabled="typeof page !== 'number'"
                >
                  {{ page }}
                </button>
              </div>

              <button
                  @click="nextPage"
                  :disabled="currentPage === totalPages"
                  class="p-2 rounded-lg transition-all duration-200 border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
              >
                <font-awesome-icon icon="fas fa-chevron-right" class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>



    <BaseModal
        :is-open="isUploadModalOpen"
        :loading="isSubmitting"
        :title="transStore.t('contact.bulk.create')"
        :submitText="transStore.t('contact.upload.create')"
        :disabled="!selectedFile || isSubmitting"
        @close="isUploadModalOpen = false; resetForm()"
        @save="handleUploadSubmit"
    >
      <div class="space-y-4">
        <div v-if="statusMessage.text"
             :class="statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'"
             class="p-3 rounded-lg border text-sm font-bold shadow-sm flex items-center gap-2">
          <font-awesome-icon :icon="statusMessage.type === 'success' ? 'fas fa-circle-check' : 'fas fa-circle-exclamation'" />
          {{ statusMessage.text }}
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
             {{transStore.t('contact.select.csv')}} <span class="text-red-500">*</span>
          </label>

          <div v-if="selectedFile" class="p-4 border-2 border-dashed border-teal-300 rounded-lg bg-teal-50/50">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <font-awesome-icon icon="fas fa-file-csv" class="text-teal-600 text-xl mr-3" />
                <div>
                  <div class="font-medium text-gray-900 truncate max-w-xs">{{ selectedFile.name }}</div>
                  <div class="text-sm text-gray-500">  {{ formatFileSize(selectedFile?.size) }} </div>
                </div>
              </div>
              <button @click="selectedFile = null" class="text-red-500 hover:text-red-700 p-2">
                <font-awesome-icon icon="fas fa-times" />
              </button>
            </div>
          </div>


          <div v-else @click="($refs.fileInput as any).click()"
               class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-500 cursor-pointer bg-gray-50/50">
            <font-awesome-icon icon="fas fa-cloud-upload-alt" class="text-3xl text-gray-400 mb-2" />
            <p class="text-sm font-medium text-gray-700">{{transStore.t('contact.upload.csv')}}</p>
            <p class="text-xs text-gray-500 mt-1"> {{transStore.t('contact.only.csv')}}</p>
          </div>

          <input
              ref="fileInput"
              type="file"
              @change="handleFileSelect"
              class="hidden"
              accept=".csv, text/csv"
          />

          <p v-if="errors.file" class="text-red-500 text-xs mt-2 font-semibold">
            <font-awesome-icon icon="fas fa-exclamation-triangle" class="mr-1" />
            {{ errors.file }}
          </p>
        </div>

        <div class="text-xs text-gray-600 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div class="flex items-start">
            <font-awesome-icon icon="fas fa-info-circle" class="mr-2 mt-0.5 text-blue-500" />
            <div>
              <p class="font-medium text-gray-800"> {{transStore.t('contact.requirements.csv')}}</p>
              <p>{{transStore.t('contact.headers.csv')}} <b> {{transStore.t('contact.name')}}</b> &  <b> {{transStore.t('contact.phone.number')}}</b>  {{transStore.t('contact.required')}} </p>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>

    <BaseModal
        :is-open="isModalOpen"
        :loading="isSubmitting"
        :title="isEditing  ? transStore.t('contact.edit.contact')  : transStore.t('contact.create.contact')"
        :submitText="isEditing ? transStore.t('contact.update.contact')  : transStore.t('contact.save.contact')"
        :disabled="isFormInvalid || isSubmitting"
        mode="form"
        @close="isModalOpen = false; resetForm()"
        @save="handleFormSubmit"
    >
      <div class="space-y-6">

        <div class="grid grid-cols-1 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{transStore.t('contact.name')}} <span class="text-red-500">*</span>
            </label>
            <input
                v-model="form.name"
                @input="validateName"
                :class="errors.name ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-gray-100 focus:border-[#00C49F] bg-white'"
                class="w-full border-2 py-2 px-3 rounded-lg transition-all outline-none focus:ring-0"
                :placeholder="transStore.t( 'contact.insert.name')"
            />
            <p v-if="errors.name" class="mt-1 text-xs text-red-600">
              {{ errors.name }}
            </p>
          </div>


          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"> {{transStore.t('contact.phone')}}*</label>
            <input
                v-model="form.phone_number"
                @input="validatePhone"
                :class="errors.phone_number ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-gray-100 focus:border-[#00C49F] bg-white'"
                class="w-full border-2 py-2 px-3 rounded-lg transition-all outline-none focus:ring-0"
                :placeholder="transStore.t( 'contact.insert.phone')"
            />
            <p v-if="errors.phone_number" class="mt-1 text-xs text-red-600">
              {{ errors.phone_number}}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
             {{transStore.t('contact.city')}}<span class="text-red-500">*</span>
            </label>
            <input
                v-model="form.city"
                @input="validateCity"
                :class="errors.city ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-gray-100 focus:border-[#00C49F] bg-white'"
                class="w-full border-2 py-2 px-3 rounded-lg transition-all outline-none focus:ring-0"

                :placeholder="transStore.t( 'contact.insert.city')"
            />
            <p v-if="errors.city" class="mt-1 text-xs text-red-600">
              {{ errors.city }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{transStore.t('contact.country')}}<span class="text-red-500">*</span>
            </label>
            <input
                v-model="form.country"
                @input="validateCountry"
                :class="errors.country ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-gray-100 focus:border-[#00C49F] bg-white'"
                class="w-full border-2 py-2 px-3 rounded-lg transition-all outline-none focus:ring-0"

                :placeholder="transStore.t( 'contact.insert.country')"/>
            <p v-if="errors.country" class="mt-1 text-xs text-red-600">
              {{ errors.country }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
               {{transStore.t('contact.state')}} <span class="text-red-500">*</span>
            </label>
            <input
                v-model="form.state"
                @input="validateState"
                :class="errors.state ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-gray-100 focus:border-[#00C49F] bg-white'"
                class="w-full border-2 py-2 px-3 rounded-lg transition-all outline-none focus:ring-0"

                :placeholder="transStore.t( 'contact.insert.state')"
            />
            <p v-if="errors.state" class="mt-1 text-xs text-red-600">
              {{ errors.state }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{transStore.t('contact.zip')}} <span class="text-red-500">*</span>
            </label>
            <input
                v-model="form.zip_code"
                @input="validateZipCode"
                :class="errors.zip_code ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-gray-100 focus:border-[#00C49F] bg-white'"
                class="w-full border-2 py-2 px-3 rounded-lg transition-all outline-none focus:ring-0"
                :placeholder="transStore.t( 'contact.insert.zip')"
            />
            <p v-if="errors.zip_code" class="mt-1 text-xs text-red-600">
              {{ errors.zip_code }}
            </p>
          </div>
        </div>
      </div>
    </BaseModal>

    <BaseModal
        :is-open="isDeleteModalOpen"
        :loading="isSubmitting"
        :title="transStore.t('contact.delete.contacts')"
        :submitText="transStore.t('contact.confirm.delete')"
        mode="delete"
        @close="isDeleteModalOpen = false"
        @save="handleConfirmDelete"
    >

      <div class="text-center">


        <p class="text-gray-600 mb-4">
          {{transStore.t('contact.delete.title')}}
          <span class="font-semibold text-gray-900">"{{ selectedContact?.name }}"</span>?
        </p>

        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-left">
          <div class="flex items-start">
            <font-awesome-icon
                icon="fa-solid fa-triangle-exclamation"
                class="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0"
            />
            <p class="text-sm text-yellow-700">
             {{transStore.t('contact.delete.desc')}}
            </p>
          </div>
        </div>
      </div>
    </BaseModal>

    <BaseDetailModal
        :is-open="isViewModalOpen"
        :title="transStore.t('contact.contact.detail')"
        :item-id="selectedContact?.id"
        @close="isViewModalOpen = false"
    >


      <div class="p-0" v-if="selectedContact">
        <div v-if="statusMessage.text"
             :class="statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'"
             class="flex items-center gap-2 py-2 px-3 mb-6 rounded-lg shadow-sm border text-[0.85rem] font-semibold">
          <font-awesome-icon :icon="statusMessage.type === 'success' ? 'fas fa-circle-check' : 'fas fa-circle-exclamation'" />
          {{ statusMessage.text }}
        </div>

        <div class="flex justify-between items-start mb-6">
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{{transStore.t('contact.name')}}</label>
            <p class="text-2xl font-bold text-gray-900 leading-tight">{{ selectedContact.name }}</p>
          </div>
          <span

                class="bg-teal-50 text-teal-600 border-teal-200 inline-flex items-center px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider">

            {{selectedContact.country }}
      </span>
        </div>

        <div class="mb-6">
          <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2"> {{transStore.t('contact.phone')}}</label>
          <div class="p-3 bg-gray-50 rounded-xl border border-gray-100 italic text-gray-600 text-[0.9rem] leading-relaxed">
            {{ selectedContact.phone_number }}
          </div>
        </div>

        <div class="grid grid-cols-2 gap-6 border-t border-gray-100 pt-6">
          <div class="col-span-2 md:col-span-1">
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2"> {{transStore.t('contact.city')}}</label>
            <div class="flex flex-wrap gap-2">
          <span
                class="inline-flex items-center px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 border border-teal-100 text-[11px] font-bold">
            <span class="w-1.5 h-1.5 rounded-full bg-teal-400 mr-2"></span>
            {{ selectedContact.city }}
          </span>
            </div>
          </div>

          <div class="col-span-2 md:col-span-1">
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1"> {{transStore.t('contact.state')}}</label>
            <div class="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <font-awesome-icon icon="fas fa-user-check" class="text-gray-300 text-[0.8rem]" />
              {{ selectedContact.state || 'N/A' }}
            </div>
          </div>

          <div class="col-span-1">
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{{transStore.t('contact.zip')}}</label>
            <p class="text-[0.85rem] font-medium text-gray-600">
              {{ selectedContact.zip_code }}
            </p>
          </div>

          <div class="col-span-1">
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{{transStore.t('contact.uploaded.at')}}</label>
            <p class="text-[0.85rem] font-medium text-gray-600">
              {{ formatDate(selectedContact.uploaded_at) }}
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

</template>

<style scoped>
.tracking-wider { letter-spacing: 0.05em; }
.x-small { font-size: 0.75rem; }
.avatar-circle {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  color: #2e7d32;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}
.transition-all { transition: all 0.2s ease; }
.hover-row:hover { background-color: #f8faf9 !important; transform: translateY(-1px); }
.btn-white { background: #fff; border: 1px solid #edf2f7; }
.btn-white:hover { background: #f8f9fa; }
.pagination .page-link {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
}
.pagination .page-item.active .page-link {
  background-color: #198754 !important;
  color: white;
}
/* Style for the tick in the dropdown */
/* 1. Hide the default "Selected" / "Remove" text labels */
:deep(.multiselect__option--selected::after),
:deep(.multiselect__option--highlight::after) {
  display: none !important;
}
:deep(.multiselect--active .multiselect__tags-wrap) {
  display: none !important;
}
/* 2. Layout for your custom option content */
.option__content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

/* 3. Style the green tick */
.option__check {
  color: #43d3b0; /* Your brand green */
  font-weight: bold;
  font-size: 18px;
  margin-left: auto; /* Pushes it to the far right */
}

/* 4. Tag styling (from previous step) */
.custom__tag {
  background-color: #43d3b0;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  margin: 5px;
  display: inline-flex;
  align-items: center;
}

:deep(.multiselect__tags){
  padding:8px 0px 0px 8px
}

/* This forces the 'dot' to be white even when the switch is off */

/* Optional: Removes the default Bootstrap gray filter */
.custom-toggle.form-check-input {
  filter: none !important;
}
.role-container {
  display: flex;
  gap: 8px; /* Space between the tags */
  flex-wrap: wrap;
}

.role-badge {

  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  display: inline-block;
}

/* Target the dropdown container */
:deep(.multiselect__content-wrapper) {
  max-height: 150px !important; /* Adjust height to your liking */
  overflow-y: auto !important;  /* Enables the vertical scroll */
}

/* Optional: Style the scrollbar for a cleaner look */
:deep(.multiselect__content-wrapper::-webkit-scrollbar) {
  width: 8px;
}

:deep(.multiselect__content-wrapper::-webkit-scrollbar-thumb) {
  background: #ccc;
  border-radius: 4px;
}
.addrole:hover{
  background-color: #00a889 !important;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
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
  color: #059669;
  border-radius: 9999px;
  //padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  padding-right: 20px;
  width:fit-content;
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
/* Target the container and the pseudo-element specifically */
:deep(.multiselect__tag-icon::after) {
  content: "×"; /* Using a proper multiplication sign instead of 'x' */
  color: #af5b5b !important;
  font-size: 18px;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  transition: color 0.2s ease;

}


:deep(.multiselect__tag-icon) {
  background: transparent; /* Makes it look cleaner */
  border-radius: 50%;
  padding-right: 1.6rem;
  height: 20px;
  line-height: 18px;
  transition: all 0.2s ease;

}
:deep(.multiselect__tag-icon:hover::after) {
  color: #d60f0f !important; /* Changes to white (or any color) on hover */
}
:deep(.multiselect__tag-icon:hover) {
  color: #0a36ca !important;
}
/* Gradient text */
.gradient-text {
  background: linear-gradient(135deg, #0d9488, #059669);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Hover effects */
.hover-lift {
  transition: transform 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
}

/* Focus styles */
.focus-ring:focus {
  outline: none;
  ring-width: 2px;
  ring-color: rgba(20, 184, 166, 0.3);
}


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

</style>

