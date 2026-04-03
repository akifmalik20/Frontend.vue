<template>
  <div class="min-h-screen bg-gray-50 py-6 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header Section -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 mb-2">
              {{ transStore.t('document.title') }}
            </h1>
            <p v-if="!isChildModule" class="text-gray-600">
              {{ transStore.t('document.description') }}
            </p>
            <p v-else class="text-gray-600 text-sm">
              <template v-for="(item, i) in breadcrumbItems" :key="i">
                <router-link v-if="item.url" :to="item.url" class="text-teal-600 hover:text-teal-700 hover:underline font-medium">{{ item.label }}</router-link>
                <span v-else class="text-gray-600">{{ item.label }}</span>
                <span v-if="i < breadcrumbItems.length - 1" class="text-gray-400 mx-1">></span>
              </template>
            </p>
          </div>
          <button
              @click="openUploadModal"
              class="px-5 py-2.5 text-white rounded-lg font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2"
              style="background: linear-gradient(135deg, #00C49F 0%, #00ab8b 100%);"
          >
            <font-awesome-icon icon="fa-solid fa-plus" />
            {{ transStore.t('document.button.upload') }}          </button>
        </div>
      </div>

      <!-- Documents Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 class="text-lg font-bold text-gray-900">{{ transStore.t('document.list.title') }}</h2>
          <p class="text-sm text-gray-600 mt-1">{{ processedDocuments.length }} {{ transStore.t('document.stats.count.label') }}</p>
        </div>

        <div v-if="processedDocuments.length === 0 && !chatbotStore.loading" class="p-12 text-center">
          <div class="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gray-100 mb-4">
            <font-awesome-icon icon="fa-solid fa-folder" class="text-gray-400 text-2xl" />

          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">{{ transStore.t('document.message.empty.state') }}</h3>
          <p class="text-gray-600 mb-6">{{ transStore.t('document.message.empty.subtitle') }}</p>
          <button
              @click="openUploadModal"
              class="px-5 py-2.5 text-white rounded-lg font-bold shadow-sm hover:shadow-md transition-all inline-flex items-center gap-2"
              style="background: linear-gradient(135deg, #00C49F 0%, #00ab8b 100%);"
          >
            <font-awesome-icon icon="fa-solid fa-plus" />
            {{ transStore.t('document.button.upload.first') }}          </button>
        </div>

        <table v-else class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
              {{ transStore.t('document.table.header.name') }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
              {{ transStore.t('document.table.header.size') }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
              {{ transStore.t('document.table.header.chunks') }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
              {{ transStore.t('document.table.header.status') }}
            </th>
            <th class="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
              {{ transStore.t('document.table.header.actions') }}
            </th>
          </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
          <tr v-for="document in processedDocuments" :key="document.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4">
              <div class="flex items-center">
                <div :class="getFileIconColor(document)" class="h-10 w-10 flex items-center justify-center rounded-lg bg-gray-50 mr-3">
                  <font-awesome-icon :icon="getFileIcon(document)" class="text-lg" />
                </div>
                <div>
                  <div class="text-sm font-bold text-gray-900 truncate max-w-xs">{{ document.title }}</div>
                  <div class="text-xs text-gray-400 font-medium">Type: {{ document.file_type }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600 font-medium">
              {{ document.file_bytes ? formatFileSize(document.file_size || 0) : 'N/A' }}
            </td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700">
                  {{ formatChunkCount(document.chunk_count) }}
                </span>
            </td>
            <td class="px-6 py-4">
                <span :class="document.is_active ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
                      class="px-2 py-1 text-xs font-bold rounded-full">
                  {{ document.is_active ? 'Processed' : 'Processing' }}
                </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex justify-end gap-2">
                <button
                    v-if="document.file_bytes"
                    @click="openViewModal(document)"
                    class="text-blue-600 hover:text-blue-800 font-medium px-3 hover:bg-blue-50 rounded-md py-1.5 transition-all text-sm flex items-center gap-1"
                    :disabled="!document.file_bytes"
                    :class="{ 'opacity-50 cursor-not-allowed': !document.file_bytes }"
                >
                  <font-awesome-icon icon="fa-solid fa-eye" class="text-sm" />
                  View
                </button>
                <button @click="openDeleteModal(document)"
                        class="text-red-600 hover:text-red-800 font-medium px-3 hover:bg-red-50 rounded-md py-1.5 transition-all text-sm flex items-center gap-1">
                  <font-awesome-icon icon="fa-solid fa-trash-can" class="text-sm" />
                  Delete
                </button>
              </div>
            </td>
          </tr>
          </tbody>
        </table>

        <!-- Loading State -->
        <div v-if="chatbotStore.loading" class="p-8 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#00C49F]"></div>
          <p class="text-gray-600 mt-2">{{ transStore.t('document.message.loading') }}</p>
        </div>
      </div>
    </div>

    <!-- Information Section -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-4">{{ transStore.t('document.steps.title') }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="flex items-start">
          <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 mr-3 flex-shrink-0">
            <font-awesome-icon icon="fa-solid fa-upload" />
          </div>
          <div>
            <h4 class="font-bold text-gray-900 mb-1">{{ transStore.t('document.steps.upload.title') }}</h4>
            <p class="text-sm text-gray-600">{{ transStore.t('document.steps.upload.desc') }}</p>
          </div>
        </div>
        <div class="flex items-start">
          <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-green-50 text-green-600 mr-3 flex-shrink-0">
            <font-awesome-icon icon="fa-solid fa-brain" />
          </div>
          <div>
            <h4 class="font-bold text-gray-900 mb-1">{{ transStore.t('document.steps.processing.title') }}</h4>
            <p class="text-sm text-gray-600">{{ transStore.t('document.steps.processing.desc') }}</p>
          </div>
        </div>
        <div class="flex items-start">
          <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-purple-50 text-purple-600 mr-3 flex-shrink-0">
            <font-awesome-icon icon="fa-solid fa-robot" />
          </div>
          <div>
            <h4 class="font-bold text-gray-900 mb-1">{{ transStore.t('document.steps.training.title') }}</h4>
            <p class="text-sm text-gray-600">{{ transStore.t('document.steps.training.desc') }}</p>
          </div>
        </div>
      </div>
    </div>
    <!-- Upload Modal -->
    <BaseModal
        :is-open="isUploadModalOpen"
        :loading="isSubmitting"
        title="Upload Document to Chatbot"
        submitText="Upload Document"
        :disabled="!form.file || isSubmitting"
        @close="isUploadModalOpen = false; resetForm()"
        @save="handleUploadSubmit"
    >
      <div class="space-y-4">
        <!-- Upload Progress -->
        <div v-if="chatbotStore.uploadProgress > 0">
          <div class="flex justify-between text-sm font-medium text-gray-700 mb-1">
            <span>
  {{ transStore.t('document.status.uploading') }}
</span>
            <span>{{ chatbotStore.uploadProgress }}%</span>
          </div>
          <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
                class="h-full bg-gradient-to-r from-[#00C49F] to-[#00ab8b] transition-all duration-300"
                :style="{ width: chatbotStore.uploadProgress + '%' }"
            ></div>
          </div>
        </div>

        <!-- Status Messages -->
        <div
            v-if="statusMessage.text"
            :class="statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'"
            class="p-3 rounded-lg border text-sm font-bold shadow-sm flex items-center gap-2"
        >
          <font-awesome-icon :icon="statusMessage.type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation'" />
          {{ statusMessage.text }}
        </div>

        <!-- File Upload Area -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            {{ transStore.t('document.button.select.file') }}            <span class="text-red-500">*</span>
          </label>

          <!-- Selected File Preview -->
          <div v-if="selectedFile" class="p-4 border-2 border-dashed border-green-300 rounded-lg bg-green-50/50">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <font-awesome-icon
                    :icon="getFileIcon({ title: selectedFile.name } as Document)"
                    class="text-green-600 text-xl mr-3"
                />
                <div>
                  <div class="font-medium text-gray-900 truncate max-w-xs">{{ selectedFile.name }}</div>
                  <div class="text-sm text-gray-500">{{ formatFileSize(selectedFile.size) }}</div>
                </div>
              </div>
              <button
                  @click="removeFile"
                  class="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors"
                  type="button"
              >
                <font-awesome-icon icon="fa-solid fa-times" />
              </button>
            </div>
          </div>

          <!-- File Upload Zone -->
          <div v-else>
            <div
                @click="triggerFileInput"
                class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#00C49F] transition-colors cursor-pointer bg-gray-50/50 hover:bg-gray-50"
            >
              <font-awesome-icon icon="fa-solid fa-cloud-upload-alt" class="text-3xl text-gray-400 mb-2" />
              <p class="text-sm font-medium text-gray-700">
                {{ transStore.t('document.upload.browse.or.drag') }}
              </p>
              <p class="text-xs text-gray-500 mt-1">
                {{ transStore.t('document.upload.file.constraints') }}
              </p>
            </div>
            <input
                ref="fileInput"
                id="fileInput"
                type="file"
                @change="handleFileSelect"
                class="hidden"
                accept=".pdf,.doc,.docx,.txt"
            />
          </div>

          <!-- Error Message -->
          <p v-if="errors.file" class="text-red-500 text-xs mt-2 font-medium">{{ errors.file }}</p>
        </div>

        <!-- Information Box -->
        <div class="text-xs text-gray-600 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div class="flex items-start">
            <font-awesome-icon icon="fa-solid fa-info-circle" class="mr-2 mt-0.5 text-blue-500" />
            <div>
              <p class="font-medium text-gray-800 mb-1">
                {{ transStore.t('document.upload.quick.info.title') }}
              </p>
              <p>
                {{ transStore.t('document.upload.quick.info.desc') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseModal
        :is-open="isDeleteModalOpen"
        :loading="isSubmitting"
        title="Delete Document"
        submitText="Yes, Delete"
        variant="danger"
        @close="isDeleteModalOpen = false; documentToDelete = null"
        @save="handleDeleteDocument"
    >
      <div class="text-center py-2">
        <div v-if="statusMessage.text" :class="statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'" class="p-3 mb-5 rounded-lg border text-sm font-bold flex items-center justify-center gap-2">
          <font-awesome-icon :icon="statusMessage.type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation'" />
          {{ statusMessage.text }}
        </div>

        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 mb-4 shadow-inner">
          <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="text-red-500 text-2xl" />
        </div>
        <h3 class="text-xl font-bold text-gray-900">
          {{ transStore.t('document.delete.title') }}
        </h3>
        <p class="text-sm text-gray-500 mt-2 px-6 leading-relaxed">
          {{ transStore.t('document.delete.confirmation.prefix') }}
          <span class="font-bold text-gray-900">"{{ documentToDelete?.title }}"</span>
          {{ transStore.t('document.delete.confirmation.suffix') }}
        </p>
        <p class="text-xs text-red-500 mt-3 font-medium">
          {{ transStore.t('document.delete.warning') }}
        </p>
      </div>
    </BaseModal>

    <!-- View Document Modal -->
    <BaseModal
        :is-open="isViewModalOpen"
        :loading="isDownloading"
        title="View Document"
        submitText="Open Document"
        :disabled="isDownloading || !documentToView?.file_bytes"
        @close="isViewModalOpen = false; documentToView = null"
        @save="handleViewDocument"
    >
      <div class="space-y-4">
        <!-- Status Messages -->
        <div
            v-if="statusMessage.text"
            :class="statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'"
            class="p-3 rounded-lg border text-sm font-bold shadow-sm flex items-center gap-2"
        >
          <font-awesome-icon :icon="statusMessage.type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation'" />
          {{ statusMessage.text }}
        </div>

        <div v-if="documentToView" class="text-center">


          <!-- Document Info -->
          <h3 class="text-lg font-bold text-gray-900 mb-2">{{ documentToView.title }}</h3>

          <!-- File Info Grid -->
          <div class="grid grid-cols-2 gap-4 mt-6 text-left bg-gray-50 p-4 rounded-lg">
            <div class="space-y-1">
              <div class="text-xs text-gray-500 font-medium">{{ transStore.t('document.details.file.type') }}</div>
              <div class="text-sm font-semibold text-gray-900">
                {{ documentToView.file_type }}
              </div>
            </div>
            <div class="space-y-1">
              <div class="text-xs text-gray-500 font-medium">{{ transStore.t('document.details.file.size') }}</div>
              <div class="text-sm font-semibold text-gray-900">
                {{ documentToView.file_bytes ? formatFileSize(documentToView.file_size || 0) : transStore.t('document.status.not.available') }}
              </div>
            </div>
            <div class="space-y-1">
              <div class="text-xs text-gray-500 font-medium">{{ transStore.t('document.details.text.chunks') }}</div>
              <div class="text-sm font-semibold text-gray-900">
                {{ documentToView.chunk_count || 0 }}
              </div>
            </div>
            <div class="space-y-1">
              <div class="text-xs text-gray-500 font-medium">{{ transStore.t('document.details.status') }}</div>
              <div class="text-sm font-semibold" :class="documentToView.is_active ? 'text-green-700' : 'text-yellow-700'">
                {{ documentToView.is_active ? transStore.t('document.status.processed') : transStore.t('document.status.processing') }}
              </div>
            </div>
          </div>

          <!-- Warning if no file content -->
          <div v-if="!documentToView.file_bytes" class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div class="flex items-start">
              <font-awesome-icon icon="fa-solid fa-exclamation-triangle" class="text-yellow-500 mr-2 mt-0.5" />
              <div class="text-left">
                <p class="text-sm font-medium text-yellow-800">
                  {{ transStore.t('document.message.content.unavailable') }}
                </p>
                <p class="text-xs text-yellow-700 mt-1">
                  {{ transStore.t('document.message.no.file.content.desc') }}
                </p>
              </div>
            </div>
          </div>

          <!-- View Instructions -->
          <div v-else class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-start">
              <font-awesome-icon icon="fa-solid fa-info-circle" class="text-blue-500 mr-2 mt-0.5" />
              <div class="text-left">
                <p class="text-sm font-medium text-blue-800">
                  {{ transStore.t('document.view.guide.title') }}
                </p>
                <p class="text-xs text-blue-700 mt-1">
    <span v-if="documentToView.title.toLowerCase().endsWith('.pdf')">
      {{ transStore.t('document.view.guide.pdf.hint') }}
    </span>
                  <span v-else>
      {{ transStore.t('document.view.guide.generic.hint') }}
    </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import BaseModal from '@/components/baseModal.vue';
import { useDocumentManagement } from '@/composables/useUpload.ts';
interface Document {
  title: string;
  chunk_count: number;
  file_bytes: string | null;
  // We'll generate these client-side
  id?: string;
  file_type?: string;
  file_size?: number;
  uploaded_at?: string;
  is_active?: boolean;
}
const {
  transStore, isChildModule, breadcrumbItems,
  isSubmitting, statusMessage, isUploadModalOpen, isDeleteModalOpen, isViewModalOpen,
  selectedFile, fileInput, documentToDelete, documentToView, isDownloading,
  form, errors, processedDocuments,openViewModal,openDeleteModal,
  formatFileSize, getFileIcon, getFileIconColor,removeFile,
  handleFileSelect, handleUploadSubmit, handleViewDocument, handleDeleteDocument,
  triggerFileInput, resetForm,openUploadModal,chatbotStore,formatChunkCount,
} = useDocumentManagement();
</script>

