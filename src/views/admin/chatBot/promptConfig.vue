
<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 font-sans">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <FontAwesomeIcon icon="fa-solid fa-file-alt" class="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 class="text-2xl md:text-3xl font-bold text-gray-800">
                {{ transStore.t('prompt.title') }}
              </h1>
              <p v-if="!isChildModule" class="text-gray-600 mt-1">
                {{ transStore.t('prompt.description') }}
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
        </div>

        <button
            @click="openAddModal()"
            class="group bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-0.5"
        >
          <FontAwesomeIcon icon="fa-solid fa-plus" class="w-4 h-4 transform group-hover:rotate-90 transition-transform duration-300" />
          {{ transStore.t('prompt.button.create') }}
        </button>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6 border border-gray-100">
      <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div class="w-full md:w-96">
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" class="h-4 w-4 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
            </div>
            <input
                v-model="searchQuery"
                type="text"
                :placeholder="transStore.t('prompt.table.search.filter.placeholder')"
                class="w-full pl-10 pr-4 py-3 border outline-none border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 bg-gray-50 focus:bg-white"
            />
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
            <span class="text-sm text-gray-600">
  {{ transStore.t('prompt.stats.show.label') }}
</span>
            <select
                v-model="itemsPerPage"
                @change="currentPage = 1"
                class="bg-white border focus:outline-none border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>

          <div class="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">

            <span v-if="isPromptTableLoading" class="text-sm text-gray-700 font-medium whitespace-nowrap">
              <FontAwesomeIcon icon="fa-solid fa-file-alt" class="w-3 h-3 mr-1 text-teal-500" />
              {{ transStore.t('prompt.stats.total.prefix') }} <span ><font-awesome-icon
                :icon="['fas', 'spinner']"
                class="w-4 h-4 text-teal-600 animate-spin"
            /></span> {{ transStore.t('prompt.stats.prompts')}}
                </span>
            <span v-else class="text-sm text-gray-700 font-medium whitespace-nowrap">
                  {{ transStore.t('prompt.stats.total.prefix')}}: <span class="font-bold text-gray-900">{{ filteredPromptConfigs.length  }}</span> {{transStore.t('prompt.stats.prompts') }}
                </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Table - Only 4 Columns: Prompt Code, Type, Client, Actions -->
    <div class="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-gray-100">
      <div class="w-full overflow-x-auto">
        <table class="min-w-full table-auto border-collapse">
          <thead class="bg-gradient-to-b from-gray-200 to-gray-100">
          <tr>
            <!-- Column 1: Prompt Code -->
            <th
                @click="handleSort('prompt_text_code')"
                class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group"
            >
              <div class="flex items-center gap-2">
                <span>
  {{ transStore.t('prompt.table.header.code') }}
</span>
                <div class="flex flex-col">
                  <FontAwesomeIcon
                      v-if="sortBy === 'prompt_text_code' && sortDirection === 'asc'"
                      icon="fa-solid fa-sort-up"
                      class="w-3 h-3 text-teal-600"
                  />
                  <FontAwesomeIcon
                      v-else-if="sortBy === 'prompt_text_code' && sortDirection === 'desc'"
                      icon="fa-solid fa-sort-down"
                      class="w-3 h-3 text-teal-600"
                  />
                  <FontAwesomeIcon
                      v-else
                      icon="fa-solid fa-sort"
                      class="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
            </th>

            <!-- Column 2: Type -->
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              {{ transStore.t('prompt.table.header.type') }}
            </th>

            <!-- Column 3: Language -->
            <th
                @click="handleSort('language_name')"
                class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group"
            >
              <div class="flex items-center gap-2">
<span>
  {{ transStore.t('prompt.table.header.language') }}
</span>                <div class="flex flex-col">
                  <FontAwesomeIcon
                      v-if="sortBy === 'language_name' && sortDirection === 'asc'"
                      icon="fa-solid fa-sort-up"
                      class="w-3 h-3 text-teal-600"
                  />
                  <FontAwesomeIcon
                      v-else-if="sortBy === 'language_name' && sortDirection === 'desc'"
                      icon="fa-solid fa-sort-down"
                      class="w-3 h-3 text-teal-600"
                  />
                  <FontAwesomeIcon
                      v-else
                      icon="fa-solid fa-sort"
                      class="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
            </th>

            <!-- Column 4: Client -->
            <th
                @click="handleSort('client_name')"
                class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group"
            >
              <div class="flex items-center gap-2">
<span>
  {{ transStore.t('prompt.table.header.client') }}
</span>                <div class="flex flex-col">
                  <FontAwesomeIcon
                      v-if="sortBy === 'client_name' && sortDirection === 'asc'"
                      icon="fa-solid fa-sort-up"
                      class="w-3 h-3 text-teal-600"
                  />
                  <FontAwesomeIcon
                      v-else-if="sortBy === 'client_name' && sortDirection === 'desc'"
                      icon="fa-solid fa-sort-down"
                      class="w-3 h-3 text-teal-600"
                  />
                  <FontAwesomeIcon
                      v-else
                      icon="fa-solid fa-sort"
                      class="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
            </th>

            <!-- Column 5: Actions -->
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
             <span>
  {{ transStore.t('prompt.table.header.actions') }}
</span>
            </th>
          </tr>
          </thead>
          <tbody   class="divide-y divide-gray-200 bg-white">
          <tr v-if="isPromptTableLoading">
            <td  colspan="5" class="py-16 text-center">
              <div class="flex flex-col items-center justify-center space-y-4">
                <font-awesome-icon
                    icon="fa-solid fa-spinner"
                    class="w-10 h-10 text-teal-500 animate-spin"
                />
                <div>
                  <p class="text-gray-500 font-medium animate-pulse">Fetching Prompt Records...</p>
                  <p class="text-xs text-gray-400 animate-pulse">Updating table data</p>
                </div>
              </div>
            </td>
          </tr>
          <tr v-else-if="paginatedPromptConfigs.length > 0"
              v-for="(prompt, index) in paginatedPromptConfigs"
              :key="prompt.id"
              @click="openViewModal(prompt)"
              class="hover:bg-gray-50 cursor-pointer transition-all duration-200 animate-fade-in"
              :style="{ animationDelay: `${index * 0.05}s` }"

          >
            <!-- Prompt Code -->
            <td class="px-6 py-4">
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center shadow-sm flex-shrink-0">
                    <span class="font-bold text-teal-700 text-sm">
                      {{ prompt.prompt_text_code?.charAt(0).toUpperCase() }}
                    </span>
                </div>
                <div class="ml-3">
                  <div class="text-sm font-semibold text-gray-900 font-mono break-words whitespace-normal">{{ prompt.prompt_text_code }}</div>
                </div>
              </div>
            </td>

            <!-- Type badges -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span
                    v-if="prompt.is_chatbot"
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-50 to-teal-50 text-teal-700 border border-teal-200"
                >
                  <FontAwesomeIcon icon="fa-solid fa-robot" class="w-3 h-3 mr-1" />
{{ transStore.t('prompt.table.header.chatbot') }}                </span>
                <span
                    v-if="prompt.is_aiagent"
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-50 to-indigo-50 text-indigo-700 border border-indigo-200"
                >
                  <FontAwesomeIcon icon="fa-solid fa-microchip" class="w-3 h-3 mr-1" />
{{ transStore.t('prompt.table.header.ai.agent') }}                </span>
                <span
                    v-if="!prompt.is_chatbot && !prompt.is_aiagent"
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200"
                >
                  <FontAwesomeIcon icon="fa-solid fa-ban" class="w-3 h-3 mr-1" />
                  {{ transStore.t('prompt.table.none') }}
                </span>
              </div>
            </td>

            <!-- Language Column -->
            <td class="px-6 py-4">
              <span
                  class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap"
                  :style="{
                    backgroundColor: '#e8f5e9',
                    color: '#2e7d32',
                    border: '1px solid rgba(46,125,50,0.1)'
                  }"
              >
                {{ getLanguageName(prompt.language_code) }}
              </span>
            </td>

            <!-- Client - Shows client name using client_id from prompt.client -->
            <td class="px-6 py-4">
              <div v-if="prompt.client" class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center flex-shrink-0">
                  <span class="text-[10px] font-bold text-teal-700">{{ getClientInitials(getClientName(prompt.client)) }}</span>
                </div>
                <span class="text-sm font-medium text-gray-700 truncate max-w-[150px]" :title="getClientName(prompt.client)">
                  {{ getClientName(prompt.client) }}
                </span>
              </div>
              <span v-else class="inline-flex items-center text-xs text-gray-400 italic">
                <FontAwesomeIcon icon="fa-solid fa-globe" class="w-3 h-3 mr-1" />
                Global
              </span>
            </td>

            <!-- Actions -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-1.5" @click.stop>
                <button
                    @click="openEditModal(prompt)"
                    class="p-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-600 border border-blue-200 transition-all duration-200 group"
                    title="Edit Prompt"
                >
                  <FontAwesomeIcon icon="fa-solid fa-pen-to-square" class="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
                <button
                    @click="openDeleteModal(prompt)"
                    class="p-2 rounded-lg bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 text-red-600 border border-red-200 transition-all duration-200 group"
                    title="Delete Prompt"
                >
                  <FontAwesomeIcon icon="fa-solid fa-trash-can" class="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
                <button
                    @click="openViewModal(prompt)"
                    class="p-2 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-600 border border-gray-200 transition-all duration-200 group"
                    title="View details"
                >
                  <FontAwesomeIcon icon="fa-solid fa-eye" class="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-else >
            <td colspan="5" class="px-6 py-16 text-center">
              <div class="text-gray-400 animate-fade-in">
                <FontAwesomeIcon icon="fa-solid fa-file-alt" class="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p class="text-lg font-medium text-gray-500">
                  {{ transStore.t('prompt.message.empty.state') }}
                </p>
                <p class="text-sm text-gray-400 mt-1">
                  {{ transStore.t('prompt.message.empty.subtitle') }}
                </p>
              </div>
            </td>
          </tr>

          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700 flex items-center gap-1">
            <FontAwesomeIcon icon="fa-solid fa-list-ul" class="w-3 h-3 text-teal-500" />
            Showing <span class="font-semibold">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> to
            <span class="font-semibold">{{ Math.min(currentPage * itemsPerPage, filteredPromptConfigs.length) }}</span> of
            <span class="font-semibold">{{ filteredPromptConfigs.length }}</span> results
          </div>
          <div class="flex items-center gap-1">
            <button
                @click="prevPage"
                :disabled="currentPage === 1"
                class="p-2 rounded-lg transition-all duration-200 border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
            >
              <FontAwesomeIcon icon="fa-solid fa-chevron-left" class="w-5 h-5" />
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
                  class="min-w-[40px] h-10 flex items-center justify-center rounded-lg transition-all duration-200 font-medium border border-gray-300"
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
              <FontAwesomeIcon icon="fa-solid fa-chevron-right" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Banner -->
    <div v-if="promptStore.error" class="mt-6 p-4 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 flex items-center justify-between shadow-md">
      <div class="flex items-center text-red-700 text-sm font-medium">
        <FontAwesomeIcon icon="fa-solid fa-circle-exclamation" class="w-5 h-5 mr-3" />
        <span><strong>{{ transStore.t('prompt.error.server.error') }}</strong> {{ promptStore.error }}</span>
      </div>
      <button @click="promptStore.fetchPromptConfigs()" class="bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
        <FontAwesomeIcon icon="fa-solid fa-sync-alt" class="w-3 h-3" />
        {{ transStore.t('prompt.error.retry') }}
      </button>
    </div>
  </div>

  <!-- Create / Edit Modal -->
  <BaseModal
      :is-open="isModalOpen"
      :loading="isSubmitting"
      :title="isEditing ? transStore.t('prompt.modal.title.edit') : transStore.t('prompt.button.create')"
      :submitText="isEditing ? transStore.t('prompt.modal.button.update') : transStore.t('prompt.modal.button.save')"
      :disabled="isFormInvalid || isSubmitting"
      mode="form"
      @close="closeCreateModal"
      @save="handleFormSubmit"
  >
    <div class="space-y-6">
      <div class="grid grid-cols-1 gap-6">
        <!-- Prompt Code -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            <FontAwesomeIcon icon="fa-solid fa-code" class="w-3 h-3 mr-1 text-teal-500" />
            {{ transStore.t('prompt.table.header.code') }} <span class="text-red-500">*</span>
          </label>
          <input
              v-model="form.prompt_text_code"
              @input="validateCode"
              :class="errors.prompt_text_code ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-teal-500 focus:ring-teal-500'"
              class="w-full px-4 py-2.5 border focus:outline-none rounded-lg focus:ring-2 focus:ring-opacity-20 transition-all duration-300 font-mono"
              :placeholder="transStore.t('prompt.modal.placeholder.code.example')"
          />
          <p v-if="errors.prompt_text_code" class="mt-1 text-xs text-red-600 flex items-center gap-1">
            <FontAwesomeIcon icon="fa-solid fa-circle-exclamation" class="w-3 h-3" />
            {{ errors.prompt_text_code }}
          </p>
        </div>

        <!-- Language -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            <FontAwesomeIcon icon="fa-solid fa-language" class="w-3 h-3 mr-1 text-teal-500" />
            {{ transStore.t('prompt.table.header.language') }} <span class="text-red-500">*</span>
          </label>
          <select
              v-model="form.language_code"
              @change="validateLanguage"
              :class="errors.language_code ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-teal-500 focus:ring-teal-500'"
              class="w-full px-4 py-2.5 border focus:outline-none rounded-lg focus:ring-2 focus:ring-opacity-20 transition-all duration-300 bg-white"
          >
            <option value="" disabled>{{ transStore.t('prompt.modal.placeholder.language') }}</option>
            <option v-for="lang in availableLanguages" :key="lang.code" :value="lang.code">
              {{ lang.name }} ({{ lang.code }})
            </option>
          </select>
          <p v-if="errors.language_code" class="mt-1 text-xs text-red-600 flex items-center gap-1">
            <FontAwesomeIcon icon="fa-solid fa-circle-exclamation" class="w-3 h-3" />
            {{ errors.language_code }}
          </p>
        </div>

        <!-- Prompt Text -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            <FontAwesomeIcon icon="fa-solid fa-align-left" class="w-3 h-3 mr-1 text-teal-500" />
            {{ transStore.t('prompt.modal.label.text') }} <span class="text-red-500">*</span>
          </label>
          <textarea
              v-model="form.prompt_text"
              @input="validateText"
              rows="6"
              :class="errors.prompt_text ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-teal-500 focus:ring-teal-500'"
              class="w-full px-4 py-2.5 border focus:outline-none rounded-lg focus:ring-2 focus:ring-opacity-20 transition-all duration-300 resize-y text-sm"
              :placeholder="transStore.t('prompt.modal.placeholder.prompt.instructions')"
          ></textarea>
          <p v-if="errors.prompt_text" class="mt-1 text-xs text-red-600 flex items-center gap-1">
            <FontAwesomeIcon icon="fa-solid fa-circle-exclamation" class="w-3 h-3" />
            {{ errors.prompt_text }}
          </p>
        </div>

        <!-- Client Dropdown - Shows client info but stores auth_user_id for API -->
        <div id="client-dropdown">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            <FontAwesomeIcon icon="fa-solid fa-building" class="w-3 h-3 mr-1 text-teal-500" />
            {{ transStore.t('prompt.table.header.client') }}
          </label>
          <div class="relative">
            <!-- Selected client pill - Show client info but store auth_user_id -->
            <div
                v-if="selectedClientLabel"
                class="flex items-center gap-3 px-3 py-2.5 border border-teal-400 rounded-lg bg-teal-50 cursor-pointer group"
                @click="isClientDropdownOpen = !isClientDropdownOpen"
            >
              <div class="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center">
                <span v-if="!selectedClientLabel.avatar" class="text-xs font-bold text-teal-700">
                  {{ getClientInitials(selectedClientLabel.full_name || selectedClientLabel.username) }}
                </span>
                <img
                    v-else
                    :src="selectedClientLabel.avatar"
                    :alt="selectedClientLabel.full_name"
                    class="w-full h-full object-cover"
                />
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-gray-900 truncate">
                  {{ selectedClientLabel.full_name || selectedClientLabel.username }}
                </div>
                <div class="text-xs text-gray-500 truncate flex items-center gap-1">
                  <FontAwesomeIcon icon="fa-solid fa-envelope" class="w-2 h-2" />
                  {{ selectedClientLabel.email }}
                </div>
              </div>
              <button
                  type="button"
                  @click.stop="clearClient"
                  class="ml-auto p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Clear selection"
              >
                <FontAwesomeIcon icon="fa-solid fa-xmark" class="w-4 h-4" />
              </button>
            </div>

            <!-- Trigger when nothing selected -->
            <button
                v-else
                type="button"
                @click="isClientDropdownOpen = !isClientDropdownOpen"
                class="w-full flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg bg-white hover:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-left"
            >
              <FontAwesomeIcon icon="fa-solid fa-users" class="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span class="text-gray-400 text-sm">
  {{ transStore.t('prompt.modal.hint.client.optional') }}
</span>
              <FontAwesomeIcon icon="fa-solid fa-chevron-down" class="w-4 h-4 text-gray-400 ml-auto" />
            </button>

            <!-- Dropdown panel -->
            <div
                v-if="isClientDropdownOpen"
                class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
            >
              <div class="p-2 border-b border-gray-100">
                <div class="relative">
                  <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                      v-model="clientSearchQuery"
                      type="text"
                      :placeholder="transStore.t('prompt.table.search.placeholder')"
                      class="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      @click.stop
                  />
                </div>
              </div>

              <ul class="max-h-64 overflow-y-auto divide-y divide-gray-50">
                <li
                    v-for="client in filteredClientOptions"
                    :key="client.auth_user"
                    @click="selectClient(client)"
                    class="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-teal-50 transition-colors"
                    :class="form.auth_user_id === client.auth_user ? 'bg-teal-50' : ''"
                >
                  <div class="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center shadow-sm">
                    <span v-if="!client.avatar" class="text-xs font-bold text-teal-700">
                      {{ getClientInitials(client.full_name || client.username) }}
                    </span>
                    <img
                        v-else
                        :src="client.avatar"
                        :alt="client.full_name"
                        class="w-full h-full object-cover"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-semibold text-gray-900 truncate flex items-center gap-2">
                      {{ client.full_name || client.username }}

                    </div>
                    <div class="text-xs text-gray-500 truncate flex items-center gap-2">
                      <span class="flex items-center gap-1">
                        <FontAwesomeIcon icon="fa-solid fa-building" class="w-2 h-2" />
                        {{ client.company_name || 'No company' }}
                      </span>
                    </div>
                  </div>
                  <FontAwesomeIcon
                      v-if="form.auth_user_id === client.auth_user"
                      icon="fa-solid fa-check"
                      class="w-4 h-4 text-teal-500 flex-shrink-0"
                  />
                </li>
                <li v-if="filteredClientOptions.length === 0" class="px-4 py-8 text-center text-sm text-gray-400">
                  <FontAwesomeIcon icon="fa-solid fa-users-slash" class="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>
                    {{ transStore.t('prompt.modal.no.clients') }}
                  </p>
                </li>
              </ul>

              <div class="border-t border-gray-100 p-2">
                <button
                    type="button"
                    @click="clearClient(); isClientDropdownOpen = false"
                    class="w-full text-xs text-gray-500 hover:text-red-500 py-1.5 rounded-lg hover:bg-red-50 transition-colors text-center flex items-center justify-center gap-1"
                >
                  <FontAwesomeIcon icon="fa-solid fa-globe" class="w-3 h-3" />
                  {{ transStore.t('prompt.modal.clear.selection.global') }}
                </button>
              </div>
            </div>
          </div>
          <p class="mt-1 text-xs text-gray-400 flex items-center gap-1">
            <FontAwesomeIcon icon="fa-solid fa-info-circle" class="w-3 h-3" />
            {{ transStore.t('prompt.modal.hint.global.empty') }}
          </p>
        </div>

        <!-- Toggle: Is Chatbot -->
        <div class="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <div class="flex items-center gap-2">
            <FontAwesomeIcon icon="fa-solid fa-robot" class="w-4 h-4 text-teal-500" />
            <div>
              <label class="block text-sm font-semibold text-gray-700">
                {{ transStore.t('prompt.modal.label.is.chatbot') }}
              </label>
              <p class="text-xs text-gray-500">
                {{ transStore.t('prompt.modal.hint.chatbot.use') }}
              </p>
            </div>
          </div>
          <div class="flex items-center">
            <button
                type="button"
                @click="form.is_chatbot = !form.is_chatbot"
                :class="form.is_chatbot ? 'bg-gradient-to-r from-teal-500 to-emerald-500' : 'bg-gray-300'"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none shadow-inner"
            >
              <span
                  :class="form.is_chatbot ? 'translate-x-6' : 'translate-x-1'"
                  class="inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out"
              ></span>
            </button>
            <span class="ml-3 text-sm font-bold" :class="form.is_chatbot ? 'text-teal-600' : 'text-gray-500'">
              {{ form.is_chatbot ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>

        <!-- Toggle: Is AI Agent -->
        <div class="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <div class="flex items-center gap-2">
            <FontAwesomeIcon icon="fa-solid fa-microchip" class="w-4 h-4 text-indigo-500" />
            <div>
              <label class="block text-sm font-semibold text-gray-700">
                {{ transStore.t('prompt.modal.label.is.ai.agent') }}
              </label>
              <p class="text-xs text-gray-500">
                {{ transStore.t('prompt.modal.hint.ai.agent.use') }}
              </p>
            </div>
          </div>
          <div class="flex items-center">
            <button
                type="button"
                @click="form.is_aiagent = !form.is_aiagent"
                :class="form.is_aiagent ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-gray-300'"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none shadow-inner"
            >
              <span
                  :class="form.is_aiagent ? 'translate-x-6' : 'translate-x-1'"
                  class="inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out"
              ></span>
            </button>
            <span class="ml-3 text-sm font-bold" :class="form.is_aiagent ? 'text-indigo-600' : 'text-gray-500'">
              {{ form.is_aiagent ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>

  <!-- Delete Confirmation Modal -->
  <BaseModal
      :is-open="isDeleteModalOpen"
      :loading="isSubmitting"
      :title="transStore.t('prompt.modal.title.delete')"
      :submitText="transStore.t('prompt.modal.button.confirm.delete')"
      mode="delete"
      @close="isDeleteModalOpen = false"
      @save="handleConfirmDelete"
  >
    <div class="text-center">
      <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <FontAwesomeIcon icon="fa-solid fa-trash-can" class="w-8 h-8 text-red-600" />
      </div>
      <p class="text-gray-600 mb-4">
        {{ transStore.t('prompt.modal.confirm.delete') }}
        <span class="font-semibold text-gray-900">"{{ selectedPrompt?.prompt_text_code }}"</span>?
      </p>
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-left">
        <div class="flex items-start">
          <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" class="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
          <p class="text-sm text-yellow-700">
            {{ transStore.t('prompt.modal.delete.warning') }}          </p>
        </div>
      </div>
    </div>
  </BaseModal>

  <!-- View Detail Modal -->
  <BaseDetailModal
      :is-open="isViewModalOpen"
      :title="transStore.t('prompt.modal.title.details')"
      :item-id="selectedPrompt?.id"
      @close="isViewModalOpen = false"
  >
    <div class="space-y-4" v-if="selectedPrompt">
      <!-- Header Section: Code + Type badges in a compact grid -->
      <div class="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border border-gray-200">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              {{ transStore.t('prompt.table.header.code') }}
            </label>
            <p class="text-lg font-bold text-gray-900 font-mono">{{ selectedPrompt.prompt_text_code }}</p>
          </div>
          <div class="flex items-center gap-1.5 flex-wrap justify-end">
            <span
                v-if="selectedPrompt.is_chatbot"
                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-50 to-teal-50 text-teal-700 border border-teal-200"
            >
              <FontAwesomeIcon icon="fa-solid fa-robot" class="w-3 h-3 mr-1" />
              {{ transStore.t('prompt.table.header.chatbot') }}
            </span>
            <span
                v-if="selectedPrompt.is_aiagent"
                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-50 to-indigo-50 text-indigo-700 border border-indigo-200"
            >
              <FontAwesomeIcon icon="fa-solid fa-microchip" class="w-3 h-3 mr-1" />
             {{ transStore.t('prompt.table.header.ai.agent') }}
            </span>
          </div>
        </div>
      </div>

      <!-- Info Grid: Language + Client in 2 columns -->
      <div class="grid grid-cols-2 gap-3">
        <!-- Language -->
        <div class="bg-white p-3 rounded-lg border border-gray-200">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            {{ transStore.t('prompt.table.header.language') }}
          </label>
          <span
              class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium"
              :style="{
                backgroundColor: '#e8f5e9',
                color: '#2e7d32',
                border: '1px solid rgba(46,125,50,0.1)'
              }"
          >
            {{ selectedPrompt.language_name || selectedPrompt.language_code }}
          </span>
        </div>

        <!-- Client -->
        <div class="bg-white p-3 rounded-lg border border-gray-200">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            {{ transStore.t('prompt.table.header.client') }}
          </label>
          <div v-if="selectedPrompt.client" class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center">
              <span class="text-xs font-bold text-teal-700">{{ getClientInitials(selectedPrompt.client_name) }}</span>
            </div>
            <div class="text-sm font-semibold text-gray-900 truncate">{{ selectedPrompt.client_name }}</div>
          </div>
          <span v-else class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
            <FontAwesomeIcon icon="fa-solid fa-globe" class="w-3 h-3 mr-1" />
            {{ transStore.t('prompt.table.label.global') }}
          </span>
        </div>
      </div>

      <!-- Prompt Text -->
      <div class="bg-white p-4 rounded-lg border border-gray-200">
        <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
          {{ transStore.t('prompt.modal.label.text') }}
        </label>
        <div class="p-3 bg-gray-50 rounded-lg border border-gray-100 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
          {{ selectedPrompt.prompt_text || 'No prompt text provided' }}
        </div>
      </div>

      <!-- Dates in compact 2-column grid -->
      <div class="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
        <div class="bg-white p-3 rounded-lg border border-gray-200">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            {{ transStore.t('prompt.modal.label.created.at') }}
          </label>
          <p class="text-xs font-medium text-gray-600">{{ formatDate(selectedPrompt.created_at) }}</p>
        </div>
        <div class="bg-white p-3 rounded-lg border border-gray-200">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            {{ transStore.t('prompt.modal.label.updated.at') }}
          </label>
          <p class="text-xs font-medium text-gray-600">{{ formatDate(selectedPrompt.updated_at) }}</p>
        </div>
      </div>
    </div>
  </BaseDetailModal>

  <!-- Toast Notification -->
  <Transition name="toast">
    <div v-if="toastMessage.title" class="fixed top-4 right-4 z-50 max-w-md">
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
            <FontAwesomeIcon
                v-if="toastMessage.type === 'success'"
                icon="fa-solid fa-check-circle"
                class="w-6 h-6"
            />
            <FontAwesomeIcon
                v-else-if="toastMessage.type === 'error'"
                icon="fa-solid fa-circle-exclamation"
                class="w-6 h-6"
            />
            <FontAwesomeIcon
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
            <ul
                class="mt-1 text-sm"
                :class="{
                  'text-green-700': toastMessage.type === 'success',
                  'text-red-700': toastMessage.type === 'error',
                  'text-blue-700': toastMessage.type === 'info'
                }"
            >
              <li v-for="(msg, idx) in toastMessage.messages" :key="idx">{{ msg }}</li>
            </ul>
          </div>
          <button @click="toastMessage.title = ''" class="text-gray-400 hover:text-gray-600">
            <FontAwesomeIcon icon="fa-solid fa-xmark" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { usePromptConfig } from '@/composables/usePromptConfig';
import BaseModal from '@/components/baseModal.vue';
import BaseDetailModal from '@/components/baseDetailModal.vue';
import { FontAwesomeIcon } from '@/plugins/fontawesome';
const {
  promptStore, transStore,  availableLanguages,prevPage,pageNumbers,goToPage,nextPage,isFormInvalid,
  searchQuery, clientSearchQuery, isClientDropdownOpen, isSubmitting,openDeleteModal,selectedClientLabel,
  currentPage, itemsPerPage, sortBy, sortDirection,openViewModal,getClientInitials,clearClient,filteredClientOptions,selectClient,formatDate,
  selectedPrompt, isModalOpen, isDeleteModalOpen, isViewModalOpen, isEditing,handleSort,
  form, errors, toastMessage, paginatedPromptConfigs, totalPages,filteredPromptConfigs,
  handleFormSubmit, handleConfirmDelete, openEditModal,closeCreateModal,validateCode,validateLanguage,validateText,
  getLanguageName, getClientName,openAddModal,isChildModule,breadcrumbItems,isPromptTableLoading,
} = usePromptConfig();

</script>
<style scoped>
.tracking-wider { letter-spacing: 0.05em; }
.transition-all { transition: all 0.2s ease; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

/* Table container with horizontal scroll only when needed */
.overflow-x-auto {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}

/* Table layout */
table {
  table-layout: auto;
  width: 100%;
  border-collapse: collapse;
}

/* Column width distribution */
th:first-child, td:first-child { width: 30%; }
th:nth-child(2), td:nth-child(2) { width: 20%; }
th:nth-child(3), td:nth-child(3) { width: 30%; }
th:last-child, td:last-child { width: 20%; }

/* Cell padding */
td, th {
  padding: 1rem 1.5rem;
  vertical-align: middle;
}

/* Truncate long text */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  td, th {
    padding: 0.75rem 1rem;
  }

  th:first-child, td:first-child { width: 35%; }
  th:nth-child(2), td:nth-child(2) { width: 20%; }
  th:nth-child(3), td:nth-child(3) { width: 30%; }
  th:last-child, td:last-child { width: 15%; }
}

/* Toast transition */
.toast-enter-active,
.toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateX(100%); }
.toast-leave-to { opacity: 0; transform: translateX(100%); }

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>