<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
    <div class="mb-8">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <font-awesome-icon icon="fa-solid fa-users" class="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 class="text-2xl md:text-3xl font-bold text-gray-800">{{ transStore.t('user.title') }}</h1>
              <p v-if="!isChildModule" class="text-gray-600 mt-1">{{transStore.t('user.title.description') }}</p>
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
            @click="openCreateModal"
            class="group bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-0.5"
        >
          <font-awesome-icon icon="fa-solid fa-plus" class="w-5 h-5 transform group-hover:rotate-90 transition-transform duration-300" />
          {{ transStore.t('user.button.add') }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">{{ transStore.t('user.stats.total') }}</p>
            <p class="text-2xl font-bold text-gray-800 mt-1">{{ filteredUsers.length }}</p>
          </div>
          <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <font-awesome-icon icon="fa-solid fa-users" class="w-5 h-5 text-blue-500" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">{{ transStore.t('user.stats.active') }}</p>
            <p class="text-2xl font-bold text-gray-800 mt-1">
              {{ filteredUsers.filter(u => u.is_active).length }}
            </p>
          </div>
          <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <font-awesome-icon icon="fa-solid fa-check-circle" class="w-5 h-5 text-green-500" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">{{ transStore.t('user.stats.inactive') }}</p>
            <p class="text-2xl font-bold text-gray-800 mt-1">
              {{ filteredUsers.filter(u => !u.is_active).length }}
            </p>
          </div>
          <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <font-awesome-icon icon="fa-solid fa-times-circle" class="w-5 h-5 text-red-500" />
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6 border border-gray-100">
      <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div class="w-full md:w-96">
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <font-awesome-icon icon="fa-solid fa-search" class="h-5 w-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
            </div>
            <input
                v-model="searchInput"
                @input="handleSearch(($event.target as HTMLInputElement).value)"
                type="text"
                :placeholder="transStore.t('user.search.placeholder')"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 bg-gray-50 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
            <span class="text-sm text-gray-600">{{ transStore.t('user.table.show') }}</span>
            <select
                v-model="itemsPerPage"
                @change="currentPage = 1"
                class="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span class="text-sm text-gray-600">{{ transStore.t('user.table.entries') }}</span>
          </div>

          <div class="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
          <span class="text-sm text-gray-700">
            {{ transStore.t('user.table.total.count') }}: <span class="font-bold text-gray-900">{{ filteredUsers.length }}</span> {{ transStore.t('user.table.user.label') }}
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
                @click="handleSort('full_name')"
                class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group"
            >
              <div class="flex items-center gap-2">
                <span>{{ transStore.t('user.column.user') }}</span>
                <font-awesome-icon
                    icon="fa-solid fa-sort"
                    class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    :class="{'opacity-100': sortKey === 'full_name', 'rotate-180': sortAsc && sortKey === 'full_name'}"
                />
              </div>
            </th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              {{ transStore.t('user.column.contact') }}
            </th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              {{ transStore.t('user.column.status') }}
            </th>
            <th class="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
              {{ transStore.t('user.column.actions') }}
            </th>
          </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
          <tr
              v-for="(user, index) in paginatedUsers"
              :key="user.id"
              @click="openViewModal(user)"
              class="hover:bg-gray-50 cursor-pointer transition-all duration-200 animate-fade-in"
              :style="{ animationDelay: `${index * 0.05}s` }"
          >
            <td class="px-6 py-4">
              <div class="flex items-center">
                <div class="relative">
                  <div
                      v-if="user.avatar"
                      class="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm"
                  >
                    <img
                        :src="user.avatar"
                        :alt="user.full_name || user.username"
                        class="w-full h-full object-cover"
                        @error="(e) => {
                      (e.target as HTMLImageElement).closest('.w-10')?.classList.add('hidden');
                      (e.target as HTMLImageElement).closest('.relative')?.querySelector('.initials-fallback')?.classList.remove('hidden')
                    }"
                    />
                  </div>

                  <div
                      :class="user.avatar ? 'hidden' : ''"
                      class="initials-fallback w-10 h-10 rounded-xl bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center shadow-sm"
                  >
                  <span class="font-bold text-teal-700 text-sm">
                    {{ getAvatarInitials(user.full_name || user.username) }}
                  </span>
                  </div>

                  <div
                      :class="user.is_active ? 'bg-green-500' : 'bg-red-500'"
                      class="absolute -bottom-1 -right-1 w-3 h-3 border-2 border-white rounded-full"
                  ></div>
                </div>

                <div class="ml-3">
                  <div class="text-sm font-semibold text-gray-900">
                    {{ user.full_name || user.username }}
                  </div>
                  <div class="text-xs text-gray-500">
                    @{{ user.username }}
                  </div>
                </div>
              </div>
            </td>

            <td class="px-6 py-4">
              <div class="text-sm text-gray-900">{{ user.email }}</div>
              <div class="text-xs text-gray-500 mt-0.5">{{ user.phone || transStore.t('user.table.no_phone') }}</div>
            </td>

            <td class="px-6 py-4">
              <button
                  @click.stop="openToggleConfirmModal(user)"
                  type="button"
                  :class="user.is_active
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500'
                : 'bg-gray-300'"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                  :title="user.is_active ? transStore.t('user.action.deactivate_tooltip') : transStore.t('user.action.activate_tooltip')"
              >
              <span
                  :class="user.is_active ? 'translate-x-6' : 'translate-x-1'"
                  class="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300"
              ></span>
              </button>
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-1.5" @click.stop>
                <button
                    @click="openEditModal(user)"
                    class="p-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-300 transition-all duration-200 group"
                    :title="transStore.t('user.action.edit_tooltip')"
                >
                  <font-awesome-icon icon="fa-solid fa-pen-to-square" class="w-4.5 h-4.5" />
                </button>
                <button
                    @click="confirmDeleteUser(user)"
                    class="p-2 rounded-lg bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 text-red-600 hover:text-red-800 border border-red-200 hover:border-red-300 transition-all duration-200 group"
                    :title="transStore.t('user.action.delete_tooltip')"
                >
                  <font-awesome-icon icon="fa-solid fa-trash-can" class="w-4.5 h-4.5" />
                </button>
                <button
                    @click="openViewModal(user)"
                    class="p-2 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-600 hover:text-gray-800 border border-gray-200 hover:border-gray-300 transition-all duration-200 group"
                    :title="transStore.t('user.action.view_tooltip')"
                >
                  <font-awesome-icon icon="fa-solid fa-eye" class="w-4.5 h-4.5" />
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="paginatedUsers.length === 0">
            <td colspan="5" class="px-6 py-12 text-center">
              <div class="text-gray-400 animate-fade-in">
                <font-awesome-icon icon="fa-solid fa-user-slash" class="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p class="text-lg font-medium text-gray-500">{{ transStore.t('user.empty.title') }}</p>
                <p class="text-sm mt-1 text-gray-400">{{ transStore.t('user.empty.description') }}</p>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <div
          v-if="totalPages > 1"
          class="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-100"
      >
        <div class="text-sm text-gray-700">
          {{ transStore.t('user.pagination.showing') }} <span class="font-semibold">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> {{ transStore.t('user.pagination.to') }}
          <span class="font-semibold">{{ Math.min(currentPage * itemsPerPage, filteredUsers.length) }}</span> {{ transStore.t('user.pagination.of') }}
          <span class="font-semibold">{{ filteredUsers.length }}</span> {{ transStore.t('user.pagination.results') }}
        </div>

        <div class="flex items-center space-x-1">
          <button
              @click="prevPage"
              :disabled="currentPage === 1"
              :class="currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white hover:shadow-sm text-gray-700'"
              class="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-600"
          >
            <font-awesome-icon icon="fa-solid fa-chevron-left" class="text-[10px]" />
          </button>

          <div class="flex items-center gap-1">
            <button
                v-for="page in pageNumbers"
                :key="page"
                @click="typeof page === 'number' && goToPage(page)"
                :class="page === currentPage
              ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md'
              : typeof page === 'number'
                ? 'hover:bg-white hover:shadow-sm text-gray-700'
                : 'text-gray-400 cursor-default'"
                class="w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all shadow-sm"
                :disabled="typeof page !== 'number'"
            >
              {{ page }}
            </button>
          </div>

          <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              :class="currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white hover:shadow-sm text-gray-700'"
              class="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-600"
          >
            <font-awesome-icon icon="fa-solid fa-chevron-right" class="text-[10px]" />
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- User Detail Modal -->
  <BaseDetailModal
      :is-open="isViewModalOpen"
      :title="selectedUser ? transStore.t('user.detail.title') : transStore.t('user.detail.loading_title')"
      :item-id="selectedUser?.id"
      mode="view"
      @close="closeViewModal"
  >
    <div v-if="selectedUser" class="space-y-6">

      <div class="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div class="flex items-start gap-4">
          <div class="relative">

            <div
                v-if="selectedUser.avatar"
                class="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center shadow-xl ring-4 ring-white"
            >
              <img
                  :src="selectedUser.avatar"
                  :alt="selectedUser.full_name || selectedUser.username"
                  class="w-full h-full object-cover"
                  @error="(e) => {
            (e.target as HTMLImageElement).closest('.w-20')?.classList.add('hidden');
            (e.target as HTMLImageElement).closest('.relative')?.querySelector('.modal-initials-fallback')?.classList.remove('hidden')
          }"
              />
            </div>

            <div
                :class="selectedUser.avatar ? 'hidden' : ''"
                class="modal-initials-fallback w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center shadow-xl ring-4 ring-white"
            >
            <span class="text-3xl font-bold text-teal-700">
              {{ getAvatarInitials(selectedUser.full_name || selectedUser.username) }}
            </span>
            </div>

            <div
                :class="selectedUser.is_active
          ? 'bg-green-500 ring-4 ring-green-100'
          : 'bg-red-500 ring-4 ring-red-100'"
                class="absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-2 border-white"
            ></div>
          </div>

          <div class="space-y-2">
            <div>
              <h4 class="text-2xl font-bold text-gray-900">
                {{ selectedUser.full_name || selectedUser.username }}
              </h4>

              <div class="flex items-center gap-3 mt-2">
        <span
            :class="selectedUser.is_active
              ? 'bg-green-100 text-green-800 border-green-200'
              : 'bg-red-100 text-red-800 border-red-200'"
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border"
        >
          <span
              :class="selectedUser.is_active ? 'bg-green-400' : 'bg-red-400'"
              class="w-2 h-2 rounded-full animate-pulse"
          ></span>
          {{ selectedUser.is_active ? transStore.t('user.detail.status_active') : transStore.t('user.detail.status_inactive') }}
        </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6">

        <div class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div class="space-y-4">

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  {{ transStore.t('user.detail.label.username') }}
                </label>
                <p class="text-sm font-semibold text-gray-900">
                  {{ selectedUser.username }}
                </p>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  {{ transStore.t('user.detail.label.first_name') }}
                </label>
                <p class="text-sm font-semibold text-gray-900">
                  {{ selectedUser.first_name || '—' }}
                </p>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  {{ transStore.t('user.detail.label.last_name') }}
                </label>
                <p class="text-sm font-semibold text-gray-900">
                  {{ selectedUser.last_name || '—' }}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  {{ transStore.t('user.detail.label.email') }}
                </label>
                <p class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <font-awesome-icon :icon="['fas', 'envelope']" class="w-4 h-4 text-gray-400" />
                  {{ selectedUser.email }}
                </p>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  {{ transStore.t('user.detail.label.phone') }}
                </label>
                <p class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <font-awesome-icon :icon="['fas', 'phone']" class="w-4 h-4 text-gray-400" />
                  {{ selectedUser.phone || '—' }}
                </p>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  {{ transStore.t('user.detail.label.language') }}
                </label>
                <p class="text-sm font-semibold text-gray-900">
                  {{ selectedUser.language_name || '—' }}
                </p>
              </div>

            </div>

            <div class="grid grid-cols-3 gap-4">

              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  {{ transStore.t('user.detail.label.created_by') }}
                </label>
                <p class="text-sm font-semibold text-gray-900">
                  {{ selectedUser.created_by_name || '—' }}
                </p>
              </div>

            </div>

          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div class="grid grid-cols-3 gap-4">

            <div>
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                {{ transStore.t('user.detail.label.last_login') }}
              </label>
              <p class="text-sm font-semibold text-gray-900">
                {{ selectedUser.last_login ? formatDate(selectedUser.last_login) : transStore.t('user.detail.never_logged') }}
              </p>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                {{ transStore.t('user.detail.label.created_at') }}
              </label>
              <p class="text-sm font-semibold text-gray-900">
                {{ formatDate(selectedUser.created_at) }}
              </p>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                {{ transStore.t('user.detail.label.updated_at') }}
              </label>
              <p class="text-sm font-semibold text-gray-900">
                {{ formatDate(selectedUser.updated_at) }}
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>

    <div v-else class="flex items-center justify-center h-64">
      <div class="text-center space-y-4">
        <font-awesome-icon
            :icon="['fas', 'spinner']"
            class="w-12 h-12 mx-auto text-gray-400 animate-spin"
        />
        <div>
          <p class="text-gray-500 font-medium">{{ transStore.t('user.detail.loading_msg') }}</p>
          <p class="text-sm text-gray-400 mt-1">{{ transStore.t('user.detail.wait_msg') }}</p>
        </div>
      </div>
    </div>
  </BaseDetailModal>


  <!-- Create/Edit Modal using BaseModal -->
  <BaseModal
      :is-open="isCreateModalOpen"
      :title="isEditMode ? transStore.t('user.form.edit_title') : transStore.t('user.form.create_title')"
      :item-id="editingUserId"
      :submit-text="isEditMode ? transStore.t('user.form.button_update') : transStore.t('user.form.button_create')"
      mode="form"
      :loading="isSubmitting"
      :disabled="!isFormValid || isSubmitting"
      @close="closeCreateModal"
      @save="submitCreateUser"
  >
    <div class="space-y-6">

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ transStore.t('user.form.label.username') }} <span class="text-red-500">*</span>
          </label>
          <input
              v-model="createForm.username"
              :class="createErrors.username ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-100 focus:border-teal-500 focus:ring-teal-500'"
              class="w-full py-2 px-3 rounded-lg transition-all outline-none focus:ring-0 border-2 border-gray-100 focus:border-[#00C49F] bg-white"
              :placeholder="transStore.t('user.form.placeholder.username')"
          />
          <p v-if="createErrors.username" class="mt-1 text-xs text-red-600">
            {{ createErrors.username[0] }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ transStore.t('user.form.label.email') }} <span class="text-red-500">*</span>
          </label>
          <input
              v-model="createForm.email"
              :class="createErrors.email || localErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-100 focus:border-teal-500 focus:ring-teal-500'"
              class="w-full py-2 px-3 rounded-lg transition-all outline-none focus:ring-0 border-2 border-gray-100 focus:border-[#00C49F] bg-white"
              :placeholder="transStore.t('user.form.placeholder.email')"
              type="email"
          />
          <p v-if="createErrors.email || localErrors.email" class="mt-1 text-xs text-red-600">
            {{ createErrors.email?.[0] || localErrors.email }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ transStore.t('user.form.label.first_name') }} <span class="text-red-500">*</span>
          </label>
          <input
              v-model="createForm.first_name"
              class="w-full py-2 px-3 rounded-lg transition-all outline-none focus:ring-0 border-2 border-gray-100 focus:border-[#00C49F] bg-white"
              :placeholder="transStore.t('user.form.placeholder.first_name')"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ transStore.t('user.form.label.last_name') }} <span class="text-red-500">*</span>
          </label>
          <input
              v-model="createForm.last_name"
              class="w-full py-2 px-3 rounded-lg transition-all outline-none focus:ring-0 border-2 border-gray-100 focus:border-[#00C49F] bg-white"
              :placeholder="transStore.t('user.form.placeholder.last_name')"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ transStore.t('user.form.label.password') }}
            <span v-if="!isEditMode" class="text-red-500">*</span>
            <span v-else class="text-xs text-gray-500">({{ transStore.t('user.form.label.password_optional') }})</span>
          </label>
          <input
              v-model="createForm.password"
              :class="createErrors.password || localErrors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-100 focus:border-teal-500 focus:ring-teal-500'"
              class="w-full py-2 px-3 rounded-lg transition-all outline-none focus:ring-0 border-2 border-gray-100 focus:border-[#00C49F] bg-white"
              placeholder="••••••••"
              type="password"
          />
          <div v-if="createForm.password" class="mt-2">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-medium text-gray-700">{{ transStore.t('user.form.password_strength_title') }}</span>
              <span :class="{
              'text-red-600': passwordStrength < 50,
              'text-yellow-600': passwordStrength >= 50 && passwordStrength < 75,
              'text-green-600': passwordStrength >= 75
            }" class="text-xs font-semibold">
              {{ passwordStrengthLabel }}
            </span>
            </div>
            <div class="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                  :class="{
              'bg-gradient-to-r from-red-500 to-red-400': passwordStrength < 50,
              'bg-gradient-to-r from-yellow-500 to-yellow-400': passwordStrength >= 50 && passwordStrength < 75,
              'bg-gradient-to-r from-green-500 to-emerald-400': passwordStrength >= 75
            }"
                  class="h-full transition-all duration-300"
                  :style="{ width: passwordStrength + '%' }"
              ></div>
            </div>
          </div>
          <p v-if="createErrors.password || localErrors.password" class="mt-1 text-xs text-red-600">
            {{ createErrors.password?.[0] || localErrors.password }}
          </p>
        </div>

        <div v-if="!isEditMode || createForm.password">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ transStore.t('user.form.label.confirm_password') }} <span class="text-red-500">*</span>
          </label>
          <input
              v-model="createForm.confirm_password"
              :class="localErrors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-100 focus:border-teal-500 focus:ring-teal-500'"
              class="w-full py-2 px-3 rounded-lg transition-all outline-none focus:ring-0 border-2 border-gray-100 focus:border-[#00C49F] bg-white"
              placeholder="••••••••"
              type="password"
          />
          <p v-if="localErrors.confirmPassword" class="mt-1 text-xs text-red-600">
            {{ localErrors.confirmPassword }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ transStore.t('user.form.label.phone') }} <span class="text-red-500">*</span>
          </label>
          <input
              v-model="createForm.phone"
              :class="localErrors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-100 focus:border-teal-500 focus:ring-teal-500'"
              class="w-full py-2 px-3 rounded-lg transition-all outline-none focus:ring-0 border-2 border-gray-100 focus:border-[#00C49F] bg-white"
              :placeholder="transStore.t('user.form.placeholder.phone')"
          />
          <p v-if="localErrors.phone" class="mt-1 text-xs text-red-600">
            {{ localErrors.phone }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ transStore.t('user.form.label.language') }} <span class="text-red-500">*</span>
          </label>
          <select
              v-model="createForm.language"
              class="w-full py-2 px-3 rounded-lg transition-all outline-none focus:ring-0 border-2 border-gray-100 focus:border-[#00C49F] bg-white"
          >
            <option :value="null">{{ transStore.t('user.form.placeholder.select_language') }}</option>
            <option
                v-for="l in authStore.availableLanguages"
                :key="l.id"
                :value="l.id"
            >
              {{ l.name }}
            </option>
          </select>
        </div>

      </div>
    </div>
  </BaseModal>

  <!-- Delete Confirmation Modal using BaseModal -->
  <BaseModal
      :is-open="showDeleteConfirm"
      :title="transStore.t('user.delete.title')"
      :item-id="userToDelete?.id"
      :submit-text="transStore.t('user.delete.button_confirm')"
      mode="delete"
      :loading="isDeleting"
      :disabled="isDeleting"
      @close="closeDeleteModal"
      @save="performDeleteUser"
  >
    <div
        v-if="statusMessage.type && statusMessage.messages.length"
        :class="statusMessage.type === 'success'
  ? 'bg-green-50 border border-green-200 text-green-800'
  : 'bg-red-50 border border-red-200 text-red-800'"
        class="mb-6 p-4 rounded-xl flex items-start gap-2 animate-fade-in"
    >
      <font-awesome-icon
          v-if="statusMessage.type === 'success'"
          icon="fa-solid fa-check-circle"
          class="w-5 h-5 mt-0.5 text-green-600"
      />
      <font-awesome-icon
          v-else
          icon="fa-solid fa-times-circle"
          class="w-5 h-5 mt-0.5 text-red-600"
      />

      <div>
        <p class="text-sm">{{ statusMessage.messages[0] }}</p>
      </div>
    </div>

    <div class="text-center">
      <p class="text-gray-600 mb-4">
        {{ transStore.t('user.delete.question') }}
        <span class="font-semibold">{{ userToDelete?.full_name || userToDelete?.username }}</span>?
      </p>
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
        <div class="flex items-start">
          <font-awesome-icon icon="fa-solid fa-exclamation-triangle" class="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
          <p class="text-sm text-yellow-700">
            {{ transStore.t('user.delete.warning') }}
          </p>
        </div>
      </div>
    </div>
  </BaseModal>

  <!-- Status Toggle Confirmation Modal -->
  <BaseModal
      :is-open="showToggleConfirm"
      :title="toggleConfirmData.newStatus ? transStore.t('user.status.activate_title') : transStore.t('user.status.deactivate_title')"
      :submit-text="transStore.t('user.status.button_confirm')"
      :loading="isTogglingStatus"
      :disabled="isTogglingStatus"
      @close="showToggleConfirm = false"
      @save="confirmToggleStatus"
  >
    <div class="text-center">
      <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4" :class="toggleConfirmData.newStatus ? 'bg-green-100' : 'bg-red-100'">
        <font-awesome-icon
            v-if="toggleConfirmData.newStatus"
            icon="fa-solid fa-check-circle"
            class="h-6 w-6 text-green-600"
        />
        <font-awesome-icon
            v-else
            icon="fa-solid fa-times-circle"
            class="h-6 w-6 text-red-600"
        />
      </div>
      <h4 class="text-lg font-semibold text-gray-900 mb-2">
        {{ toggleConfirmData.newStatus ? transStore.t('user.status.activate_header') : transStore.t('user.status.deactivate_header') }}: {{ toggleConfirmData.user?.username }}
      </h4>
      <p class="text-gray-600 mb-4">
        {{ toggleConfirmData.newStatus ? transStore.t('user.status.activate_question') : transStore.t('user.status.deactivate_question') }}
        <span class="font-semibold">{{ toggleConfirmData.user?.full_name || toggleConfirmData.user?.username }}</span>?
        <span>
        {{ toggleConfirmData.newStatus ? transStore.t('user.status.activate_impact') : transStore.t('user.status.deactivate_impact') }}
      </span>
      </p>
      <div :class="toggleConfirmData.newStatus ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'" class="rounded-lg p-3 mb-4 border">
        <div class="flex items-start">
          <font-awesome-icon
              :class="toggleConfirmData.newStatus ? 'text-green-600' : 'text-red-600'"
              icon="fa-solid fa-exclamation-triangle"
              class="h-5 w-5 mt-0.5 mr-2 flex-shrink-0"
          />
          <p :class="toggleConfirmData.newStatus ? 'text-green-700' : 'text-red-700'" class="text-sm">
            {{ toggleConfirmData.newStatus
              ? transStore.t('user.status.activate_warning')
              : transStore.t('user.status.deactivate_warning')
            }}
          </p>
        </div>
      </div>
    </div>
  </BaseModal>

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
          <div :class="{
            'text-green-600': toastMessage.type === 'success',
            'text-red-600': toastMessage.type === 'error',
            'text-blue-600': toastMessage.type === 'info'
          }">
            <font-awesome-icon
                v-if="toastMessage.type === 'success'"
                icon="fa-solid fa-check-circle"
                class="w-6 h-6"
            />
            <font-awesome-icon
                v-else-if="toastMessage.type === 'error'"
                icon="fa-solid fa-times-circle"
                class="w-6 h-6"
            />
            <font-awesome-icon
                v-else-if="toastMessage.type === 'info'"
                icon="fa-solid fa-info-circle"
                class="w-6 h-6"
            />
          </div>
          <div class="flex-1">
            <h4 :class="{
              'text-green-800': toastMessage.type === 'success',
              'text-red-800': toastMessage.type === 'error',
              'text-blue-800': toastMessage.type === 'info'
            }" class="font-semibold text-sm">{{ toastMessage.title }}</h4>
            <ul class="mt-1 text-sm" :class="{
              'text-green-700': toastMessage.type === 'success',
              'text-red-700': toastMessage.type === 'error',
              'text-blue-700': toastMessage.type === 'info'
            }">
              <li v-for="(msg, idx) in toastMessage.messages" :key="idx">{{ msg }}</li>
            </ul>
          </div>
          <button @click="toastMessage.title = ''" class="text-gray-400 hover:text-gray-600">
            <font-awesome-icon icon="fa-solid fa-times" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import VueMultiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.min.css';
import BaseModal from '@/components/baseModal.vue';
import BaseDetailModal from '@/components/baseDetailModal.vue';
import { useUsers } from '@/composables/useUsers';

// Register FontAwesome icons

// Use the composable
const {
  // State
  searchInput,
  isSubmitting,
  isDeleting,
  isCreateModalOpen,
  isEditMode,
  editingUserId,
  showDeleteConfirm,
  userToDelete,
  isViewModalOpen,
  selectedUser,
  showToggleConfirm,
  isTogglingStatus,
  toggleConfirmData,
  currentPage,
  itemsPerPage,
  sortKey,
  sortAsc,
  toastMessage,
  statusMessage,
  createForm,
  createErrors,
  localErrors,
  passwordStrength,
  passwordStrengthLabel,

  // Computed
  isFormValid,
  filteredUsers,
  paginatedUsers,
  totalPages,
  pageNumbers,

  // Stores
  userStore,
  authStore,
  transStore,
  isChildModule,
  breadcrumbItems,

  // Methods
  openCreateModal,
  closeCreateModal,
  openEditModal,
  submitCreateUser,
  closeDeleteModal,
  confirmDeleteUser,
  performDeleteUser,
  openToggleConfirmModal,
  confirmToggleStatus,
  openViewModal,
  closeViewModal,
  goToPage,
  prevPage,
  nextPage,
  handleSort,
  handleSearch,
  formatDate,
  getAvatarInitials,
} = useUsers();
</script>

<style scoped>
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

/* Animations */
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
</style>