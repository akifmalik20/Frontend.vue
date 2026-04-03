<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <font-awesome-icon :icon="['fas', 'users']" class="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 class="text-2xl md:text-3xl font-bold text-gray-800">{{ transStore.t('client.title') }}</h1>
              <p class="text-gray-600 mt-1">{{ transStore.t('client.title.description') }}</p>
            </div>
          </div>
        </div>

        <button
            @click="openCreateModal"
            class="group bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-0.5"
        >
          <font-awesome-icon
              :icon="['fas', 'plus']"
              class="w-5 h-5 transform group-hover:rotate-90 transition-transform duration-300"
          />
          {{ transStore.t('client.add') }}
        </button>
      </div>
    </div>

    <div v-if="isFetchingClient" class="fixed inset-0 z-[999] flex items-center justify-center bg-white/50 backdrop-blur-sm">
      <div class="flex flex-col items-center gap-4">
        <font-awesome-icon :icon="['fas', 'spinner']" class="w-12 h-12 text-teal-600 animate-spin" />
        <p class="text-teal-900 font-bold animate-pulse">Fetching Client Details...</p>
      </div>
    </div>
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">{{ transStore.t('client.total') }}</p>

            <div v-if="isClientTableLoading" class="mt-1">
              <font-awesome-icon
                  :icon="['fas', 'spinner']"
                  class="w-5 h-5 text-teal-600 animate-spin"
              />
            </div>

            <p v-else class="text-2xl font-bold text-gray-800 mt-1">
              {{ filteredClients.length }}
            </p>
          </div>
          <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'users']" class="w-5 h-5 text-blue-500" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
        <div class="flex items-center justify-between">

          <div>
            <p class="text-sm text-gray-500">{{transStore.t('client.stats.active') }}</p>

            <div v-if="isClientTableLoading" class="mt-1">
              <font-awesome-icon
                  :icon="['fas', 'spinner']"
                  class="w-5 h-5 text-teal-600 animate-spin"
              />
            </div>

            <p v-else class="text-2xl font-bold text-gray-800 mt-1">
              {{ filteredClients.filter(c => c.is_active).length }}
            </p>
            </div>
          <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'check-circle']" class="w-5 h-5 text-green-500" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
        <div class="flex items-center justify-between">

          <div>
            <p class="text-sm text-gray-500">{{transStore.t('client.stats.inactive') }}</p>

            <div v-if="isClientTableLoading" class="mt-1">
              <font-awesome-icon
                  :icon="['fas', 'spinner']"
                  class="w-5 h-5 text-teal-600 animate-spin"
              />
            </div>

            <p v-else class="text-2xl font-bold text-gray-800 mt-1">
              {{ filteredClients.filter(c => !c.is_active).length }}
            </p>
          </div>
          <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'times-circle']" class="w-5 h-5 text-red-500" />
          </div>
        </div>
      </div>
    </div>


    <!-- Search and Controls -->
    <div class="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6 border border-gray-100">
      <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div class="w-full md:w-96">
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <font-awesome-icon
                  :icon="['fas', 'search']"
                  class="h-5 w-5 text-gray-400 group-focus-within:text-teal-500 transition-colors"
              />
            </div>
            <input
                v-model="searchInput"
                @input="handleSearch"
                type="text"
                :placeholder="transStore.t('client.search.placeholder')"
                class="w-full pl-10 border-2 py-2 px-3 rounded-lg transition-all outline-none focus:ring-0 border-gray-100 focus:border-[#00C49F] bg-white"  />
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
            <span class="text-sm text-gray-600">{{ transStore.t('client.show') }}</span>
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
            <span class="text-sm text-gray-600">{{ transStore.t('client.entries') }}</span>
          </div>

          <div class="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">

            <span v-if="isClientTableLoading" class="text-sm text-gray-700 font-medium whitespace-nowrap">
                  {{ transStore.t('client.total.count') }}: <span ><font-awesome-icon
                :icon="['fas', 'spinner']"
                class="w-4 h-4 text-teal-600 animate-spin"
            /></span> {{transStore.t('client.label.plural') }}
                </span>
            <span v-else class="text-sm text-gray-700 font-medium whitespace-nowrap">
                  {{ transStore.t('client.total.count') }}: <span class="font-bold text-gray-900">{{ filteredClients.length }}</span> {{ transStore.t('client.label.plural') }}
                </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Clients Table -->
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
                <span>{{ transStore.t('client.column.client') }}</span>
                <font-awesome-icon
                    :icon="['fas', 'sort']"
                    class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    :class="{'opacity-100': sortKey === 'full_name', 'rotate-180': sortAsc && sortKey === 'full_name'}"
                />
              </div>
            </th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              {{ transStore.t('client.column.company') }}
            </th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              {{ transStore.t('client.column.contact') }}
            </th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              {{ transStore.t('client.column.role.groups') }}
            </th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              {{ transStore.t('client.column.status') }}
            </th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              {{ transStore.t('client.column.actions') }}
            </th>
          </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
          <tr v-if="isClientTableLoading">
            <td  colspan="6" class="py-16 text-center">
              <div class="flex flex-col items-center justify-center space-y-4">
                <font-awesome-icon
                    icon="fa-solid fa-spinner"
                    class="w-10 h-10 text-teal-500 animate-spin"
                />
                <div>
                  <p class="text-gray-500 font-medium animate-pulse">{{ transStore.t('client.fetch.client.records') }}</p>
                  <p class="text-xs text-gray-400 animate-pulse">{{ transStore.t('client.fetch.loading.table.data') }}</p>
                </div>
              </div>
            </td>
          </tr>
          <tr v-else-if="paginatedClients.length > 0"
              v-for="(client, index) in paginatedClients"
              :key="client.id"
              @click="openViewModal(client)"
              class="hover:bg-gray-50 cursor-pointer transition-all duration-200 animate-fade-in"
              :style="{ animationDelay: `${index * 0.05}s` }"

          >
            <td class="px-6 py-4">
              <div class="flex items-center">
                <div class="relative">
                  <!-- Avatar image -->
                  <div
                      v-if="client.avatar"
                      class="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm"
                  >
                    <img
                        :src="client.avatar"
                        :alt="client.full_name || client.username"
                        class="w-full h-full object-cover"
                        @error="(e) => { (e.target as HTMLImageElement).closest('.w-10')?.classList.add('hidden'); (e.target as HTMLImageElement).closest('.relative')?.querySelector('.initials-fallback')?.classList.remove('hidden') }"
                    />
                  </div>
                  <!-- Fallback initials if no avatar -->
                  <div
                      :class="client.avatar ? 'hidden' : ''"
                      class="initials-fallback w-10 h-10 rounded-xl bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center shadow-sm"
                  >
                    <span class="font-bold text-teal-700 text-sm">
                      {{ getAvatarInitials(client.full_name || client.username) }}
                    </span>
                  </div>

                  <!-- Status dot -->
                  <div
                      v-if="client.is_active"
                      class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"
                  ></div>
                  <div
                      v-else
                      class="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full"
                  ></div>
                </div>
                <div class="ml-3">
                  <div class="text-sm font-semibold text-gray-900">
                    {{ client.full_name || client.username }}
                  </div>
                  <div class="text-xs text-gray-500">
                    @{{ client.username }}
                  </div>
                </div>
              </div>
            </td>

            <td class="px-6 py-4">
              <div class="text-sm text-gray-900">{{ client.company_name || '—' }}</div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900">{{ client.email }}</div>
              <div class="text-xs text-gray-500 mt-0.5">{{ client.phone || transStore.t('client.no.phone') }}</div>
            </td>
            <td class="px-6 py-4">
              <div class="flex flex-wrap gap-1.5">
                <span
                    v-for="group in client.role_groups_list?.slice(0, 2)"
                    :key="group.id"
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200"
                >
                  {{ group.name }}
                </span>
                <span
                    v-if="(client.role_groups_list?.length || 0) > 2"
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                >
                  +{{ (client.role_groups_list?.length || 0) - 2 }}
                </span>
                <span v-if="!client.role_groups_list?.length" class="text-xs text-gray-400">—</span>
              </div>
            </td>
            <td class="px-6 py-4">
              <button
                  @click.stop="openToggleConfirmModal(client)"
                  type="button"
                  :class="client.is_active
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-500'
                    : 'bg-gray-300'"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                  :title="client.is_active ? transStore.t('client.action.deactivate') : transStore.t('client.action.activate')"
              >
                <span
                    :class="client.is_active ? 'translate-x-6' : 'translate-x-1'"
                    class="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300"
                ></span>
              </button>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-1.5" @click.stop>
                <button
                    @click="openEditModal(client)"
                    class="p-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-300 transition-all duration-200 group"
                    :title="transStore.t('client.edit')"
                >
                  <font-awesome-icon icon="fa-solid fa-pen-to-square" class="w-4.5 h-4.5" />
                </button>
                <button
                    @click="openViewModal(client)"
                    class="p-2 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-600 hover:text-gray-800 border border-gray-200 hover:border-gray-300 transition-all duration-200 group"
                    :title="transStore.t('client.view')"
                >
                  <font-awesome-icon icon="fa-solid fa-eye" class="w-4.5 h-4.5" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-else>
            <td colspan="6" class="px-6 py-12 text-center">
              <div class="text-gray-400 animate-fade-in">
                <font-awesome-icon :icon="['fas', 'frown']" class="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p class="text-lg font-medium text-gray-500">{{ transStore.t('client.empty.title') }}</p>
                <p class="text-sm mt-1 text-gray-400">{{ transStore.t('client.empty.description') }}</p>
              </div>
            </td>
          </tr>


          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700">
            {{ transStore.t('client.pagination.showing') }} <span class="font-semibold">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> {{ transStore.t('client.pagination.to') }}
            <span class="font-semibold">{{ Math.min(currentPage * itemsPerPage, filteredClients.length) }}</span> {{ transStore.t('client.pagination.of') }}
            <span class="font-semibold">{{ filteredClients.length }}</span> {{ transStore.t('client.pagination.results') }}
          </div>

          <div class="flex items-center gap-1">
            <button
                @click="prevPage"
                :disabled="currentPage === 1"
                :class="currentPage === 1
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-white hover:shadow-sm text-gray-700'"
                class="p-2 rounded-lg transition-all duration-200 border border-gray-300"
            >
              <font-awesome-icon :icon="['fas', 'chevron-left']" class="w-5 h-5" />
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
                  class="w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 font-medium border border-gray-300"
                  :disabled="typeof page !== 'number'"
              >
                {{ page }}
              </button>
            </div>

            <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                :class="currentPage === totalPages
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-white hover:shadow-sm text-gray-700'"
                class="p-2 rounded-lg transition-all duration-200 border border-gray-300"
            >
              <font-awesome-icon :icon="['fas', 'chevron-right']" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Client Detail Modal -->
  <BaseDetailModal
      :is-open="isViewModalOpen"
      :title="selectedClient ? transStore.t('client.detail.title') : transStore.t('client.loading')"
      :item-id="selectedClient?.id"
      mode="view"
      @close="closeViewModal"
  >
    <div v-if="selectedClient" class="space-y-6">
      <!-- Client Header with Status -->
      <div class="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div class="flex items-start gap-4">
          <div class="relative">
            <!-- Avatar image -->
            <div
                v-if="selectedClient.avatar"
                class="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center shadow-xl ring-4 ring-white"
            >
              <img
                  :src="selectedClient.avatar"
                  :alt="selectedClient.full_name || selectedClient.username"
                  class="w-full h-full object-cover"
                  @error="(e) => { (e.target as HTMLImageElement).closest('.w-20')?.classList.add('hidden'); (e.target as HTMLImageElement).closest('.relative')?.querySelector('.modal-initials-fallback')?.classList.remove('hidden') }"
              />
            </div>
            <!-- Fallback initials if no avatar -->
            <div
                :class="selectedClient.avatar ? 'hidden' : ''"
                class="modal-initials-fallback w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center shadow-xl ring-4 ring-white"
            >
              <span class="text-3xl font-bold text-teal-700">
                {{ getAvatarInitials(selectedClient.full_name || selectedClient.username) }}
              </span>
            </div>
            <div
                :class="selectedClient.is_active
          ? 'bg-green-500 ring-4 ring-green-100'
          : 'bg-red-500 ring-4 ring-red-100'"
                class="absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-2 border-white"
            ></div>
          </div>
          <div class="space-y-2">
            <div>
              <h4 class="text-2xl font-bold text-gray-900">{{ selectedClient.full_name || selectedClient.username }}</h4>
              <div class="flex items-center gap-3 mt-2">
              <span
                  :class="selectedClient.is_active
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : 'bg-red-100 text-red-800 border-red-200'"
                  class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border"
              >
                <span
                    :class="selectedClient.is_active ? 'bg-green-400' : 'bg-red-400'"
                    class="w-2 h-2 rounded-full animate-pulse"
                ></span>
               {{ selectedClient.is_active ? transStore.t('client.status.active') : transStore.t('client.status.inactive') }}
              </span>

              </div>
            </div>
          </div>
        </div>


      </div>

      <!-- Main Content - No Scroll -->
      <div class="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <!-- Personal Information -->
        <div class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">


          <div class="space-y-4">
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{{ transStore.t('client.label.first.name') }}</label>
                <p class="text-sm font-semibold text-gray-900">{{ selectedClient.first_name || '—' }}</p>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{{ transStore.t('client.label.last.name') }}</label>
                <p class="text-sm font-semibold text-gray-900">{{ selectedClient.last_name || '—' }}</p>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{{ transStore.t('client.label.username') }}</label>
                <p class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <font-awesome-icon :icon="['fas', 'user-tag']" class="w-4 h-4 text-gray-400" />
                  {{ selectedClient.username }}
                </p>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{{ transStore.t('client.label.email') }}</label>
                <p class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <font-awesome-icon :icon="['fas', 'envelope']" class="w-4 h-4 text-gray-400" />
                  {{ selectedClient.email }}
                </p>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{{ transStore.t('client.label.phone') }}</label>
                <p class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <font-awesome-icon :icon="['fas', 'phone']" class="w-4 h-4 text-gray-400" />
                  {{ selectedClient.phone || transStore.t('client.not.provided') }}
                </p>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{{ transStore.t('client.label.company.name') }}</label>
                <p class="text-sm font-semibold text-gray-900">{{ selectedClient.company_name || '—' }}</p>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{{ transStore.t('client.label.language') }}</label>
                <p class="text-sm font-semibold text-gray-900">{{ selectedClient.language_name || '—' }}</p>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{{ transStore.t('client.label.role.groups') }}</label>
                <div class="flex flex-wrap gap-2 mt-2">
              <span
                  v-for="group in selectedClient.role_groups_list"
                  :key="group.id"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 hover:border-blue-300 transition-colors"
              >
                <font-awesome-icon :icon="['fas', 'user-shield']" class="w-3 h-3" />
                {{ group.name }}
              </span>
                  <span v-if="!selectedClient.role_groups_list?.length" class="text-sm text-gray-400 italic">{{ transStore.t('client.detail.no.roles') }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="space-y-4">





          </div>
        </div>
      </div>

      <!-- Additional Information Sections -->
      <div class="grid grid-cols-1 md:grid-cols-1 gap-6">


        <!-- Usage Statistics (if available) -->
        <div v-if="selectedClient.total_users !== undefined" class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'chart-bar']" class="w-5 h-5 text-orange-500" />
            </div>
            <h4 class="text-lg font-bold text-gray-900">{{ transStore.t('client.detail.stats.title') }}</h4>
          </div>

          <div class="grid grid-cols-4 gap-4">
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 hover:shadow-sm transition-shadow">
              <label class="block text-xs font-medium text-blue-700 uppercase tracking-wider mb-1.5">{{ transStore.t('client.detail.stats.total.users') }}</label>
              <p class="text-xl font-bold text-blue-700">{{ selectedClient.total_users || 0 }}</p>
            </div>
            <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200 hover:shadow-sm transition-shadow">
              <label class="block text-xs font-medium text-green-700 uppercase tracking-wider mb-1.5">{{ transStore.t('client.detail.stats.active.users') }}</label>
              <p class="text-xl font-bold text-green-700">{{ selectedClient.total_active_users || 0 }}</p>
            </div>
            <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200 hover:shadow-sm transition-shadow">
              <label class="block text-xs font-medium text-purple-700 uppercase tracking-wider mb-1.5">{{ transStore.t('client.detail.stats.api.calls') }}</label>
              <p class="text-xl font-bold text-purple-700">{{ selectedClient.current_api_calls || 0 }}</p>
            </div>
            <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200 hover:shadow-sm transition-shadow">
              <label class="block text-xs font-medium text-orange-700 uppercase tracking-wider mb-1.5">{{ transStore.t('client.detail.stats.ai.agents') }}</label>
              <p class="text-xl font-bold text-orange-700">{{ selectedClient.current_ai_agents || 0 }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex items-center justify-center h-64">
      <div class="text-center space-y-4">
        <font-awesome-icon :icon="['fas', 'spinner']" class="w-12 h-12 mx-auto text-gray-400 animate-spin" />
        <div>
          <p class="text-gray-500 font-medium">{{ transStore.t('client.detail.loading.msg') }}</p>
          <p class="text-sm text-gray-400 mt-1">{{ transStore.t('client.wait.moment') }}</p>
        </div>
      </div>
    </div>
  </BaseDetailModal>

  <!-- Create/Edit Modal -->
  <BaseModal
      :is-open="isCreateModalOpen"
      :title="isEditMode ? transStore.t('client.modal.edit.title') : transStore.t('client.modal.create.title')"
      :item-id="editingClientId"
      :submit-text="isEditMode ? transStore.t('client.modal.update.button') : transStore.t('client.modal.create.button')"
      mode="form"
      :loading="isSubmitting"
      :disabled="!isFormValid || isSubmitting"
      @close="closeCreateModal"
      @save="submitCreateClient"
  >
    <div class="space-y-4">
      <!-- Individual Field Errors only - cleaner approach -->
      <div v-if="hasCreateErrors" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="h-5 w-5 text-red-600" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              {{ transStore.t('client.error.fix.errors') }}
            </h3>
            <div class="mt-2 text-sm text-red-700">
              <ul class="list-disc pl-5 space-y-1">
                <li v-for="(errors, field) in createErrors" :key="field">
                  <span class="font-medium">{{ formatFieldName(field) }}:</span> {{ errors.join(', ') }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Username -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ transStore.t('client.label.username') }} *</label>
          <input
              v-model="createForm.username"
              type="text"
              class="w-full py-2 px-3 rounded-lg transition-all outline-none focus:ring-0 border-2 border-gray-100 focus:border-[#00C49F] bg-white"
              :class="createErrors.username ? 'border-red-300' : ''"
              :placeholder="transStore.t('client.placeholder.username')"
          />
          <p v-if="createErrors.username" class="mt-1 text-sm text-red-600">{{ createErrors.username.join(', ') }}</p>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ transStore.t('client.label.email') }} *</label>
          <input
              v-model="createForm.email"
              type="email"
              class="w-full py-2 px-3 rounded-lg transition-all outline-none focus:ring-0 border-2 border-gray-100 focus:border-[#00C49F] bg-white"
              :class="localErrors.email || createErrors.email ? 'border-red-300' : ''"
              :placeholder="transStore.t('client.placeholder.email')"
          />
          <p v-if="localErrors.email" class="mt-1 text-sm text-red-600">{{ localErrors.email }}</p>
          <p v-if="createErrors.email" class="mt-1 text-sm text-red-600">{{ createErrors.email.join(', ') }}</p>
        </div>

        <!-- First Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ transStore.t('client.label.first.name') }} *</label>
          <input
              v-model="createForm.first_name"
              type="text"
              class="w-full py-2 px-3 rounded-lg transition-all outline-none focus:ring-0 border-2 border-gray-100 focus:border-[#00C49F] bg-white"
              :class="createErrors.first_name ? 'border-red-300' : ''"
              :placeholder="transStore.t('client.placeholder.first.name')"
          />
          <p v-if="createErrors.first_name" class="mt-1 text-sm text-red-600">{{ createErrors.first_name.join(', ') }}</p>
        </div>

        <!-- Last Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ transStore.t('client.label.last.name') }} *</label>
          <input
              v-model="createForm.last_name"
              type="text"
              class="w-full py-2 px-3 rounded-lg transition-all outline-none focus:ring-0 border-2 border-gray-100 focus:border-[#00C49F] bg-white"
              :class="createErrors.last_name ? 'border-red-300' : ''"
              :placeholder="transStore.t('client.placeholder.last.name')"
          />
          <p v-if="createErrors.last_name" class="mt-1 text-sm text-red-600">{{ createErrors.last_name.join(', ') }}</p>
        </div>

        <!-- Password (only for create) -->
        <div v-if="!isEditMode">
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ transStore.t('client.label.password') }} *</label>
          <input
              v-model="createForm.password"
              type="password"
              class="w-full py-2 px-3 rounded-lg transition-all outline-none focus:ring-0 border-2 border-gray-100 focus:border-[#00C49F] bg-white"
              :class="localErrors.password || createErrors.password ? 'border-red-300' : ''"
              :placeholder="transStore.t('client.placeholder.password')"
          />
          <div v-if="createForm.password" class="mt-2">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-medium">{{ transStore.t('client.password.strength.title') }}:</span>
              <span class="text-xs font-semibold" :class="{
                'text-red-600': passwordStrength < 50,
                'text-yellow-600': passwordStrength >= 50 && passwordStrength < 75,
                'text-green-600': passwordStrength >= 75
              }">{{ passwordStrengthLabel }}</span>
            </div>
            <div class="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                  class="h-full transition-all duration-300"
                  :class="{
                  'bg-red-500': passwordStrength < 50,
                  'bg-yellow-500': passwordStrength >= 50 && passwordStrength < 75,
                  'bg-green-500': passwordStrength >= 75
                }"
                  :style="{ width: passwordStrength + '%' }"
              ></div>
            </div>
          </div>
          <p v-if="localErrors.password" class="mt-1 text-sm text-red-600">{{ localErrors.password }}</p>
          <p v-if="createErrors.password" class="mt-1 text-sm text-red-600">{{ createErrors.password.join(', ') }}</p>
        </div>

        <!-- Password (edit mode - optional) -->
        <div v-if="isEditMode">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ transStore.t('client.label.password') }} <span class="text-xs text-gray-500">({{ transStore.t('client.label.password.optional') }})</span>
          </label>
          <input
              v-model="createForm.password"
              type="password"
              class="w-full py-2 px-3 rounded-lg transition-all outline-none focus:ring-0 border-2 border-gray-100 focus:border-[#00C49F] bg-white"
              :class="localErrors.password || createErrors.password ? 'border-red-300' : ''"
              :placeholder="transStore.t('client.placeholder.password')"
          />
          <div v-if="createForm.password" class="mt-2">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-medium">{{ transStore.t('client.password.strength.title') }}:</span>
              <span class="text-xs font-semibold" :class="{
                'text-red-600': passwordStrength < 50,
                'text-yellow-600': passwordStrength >= 50 && passwordStrength < 75,
                'text-green-600': passwordStrength >= 75
              }">{{ passwordStrengthLabel }}</span>
            </div>
            <div class="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                  class="h-full transition-all duration-300"
                  :class="{
                  'bg-red-500': passwordStrength < 50,
                  'bg-yellow-500': passwordStrength >= 50 && passwordStrength < 75,
                  'bg-green-500': passwordStrength >= 75
                }"
                  :style="{ width: passwordStrength + '%' }"
              ></div>
            </div>
          </div>
          <p v-if="localErrors.password" class="mt-1 text-sm text-red-600">{{ localErrors.password }}</p>
          <p v-if="createErrors.password" class="mt-1 text-sm text-red-600">{{ createErrors.password.join(', ') }}</p>
        </div>

        <!-- Confirm Password (only for create) -->
        <div v-if="!isEditMode">
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ transStore.t('client.label.confirm.password') }}*</label>
          <input
              v-model="createForm.confirm_password"
              type="password"
              class="w-full py-2 px-3 rounded-lg transition-all outline-none focus:ring-0 border-2 border-gray-100 focus:border-[#00C49F] bg-white"
              :class="localErrors.confirmPassword ? 'border-red-300' : ''"
              :placeholder="transStore.t('client.placeholder.confirm.password')"
          />
          <p v-if="localErrors.confirmPassword" class="mt-1 text-sm text-red-600">{{ localErrors.confirmPassword }}</p>
        </div>

        <!-- Confirm Password (edit mode - only if password entered) -->
        <div v-if="isEditMode && createForm.password">
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ transStore.t('client.label.confirm.password') }} *</label>
          <input
              v-model="createForm.confirm_password"
              type="password"
              class="w-full py-2 px-3 rounded-lg transition-all outline-none focus:ring-0 border-2 border-gray-100 focus:border-[#00C49F] bg-white"
              :class="localErrors.confirmPassword ? 'border-red-300' : ''"
              :placeholder="transStore.t('client.placeholder.confirm.password')"

          />
          <p v-if="localErrors.confirmPassword" class="mt-1 text-sm text-red-600">{{ localErrors.confirmPassword }}</p>
        </div>

        <!-- Phone -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ transStore.t('client.label.phone') }} *</label>
          <input
              v-model="createForm.phone"
              type="tel"
              class="w-full py-2 px-3 rounded-lg transition-all outline-none focus:ring-0 border-2 border-gray-100 focus:border-[#00C49F] bg-white"
              :class="localErrors.phone || createErrors.phone ? 'border-red-300' : ''"
              :placeholder="transStore.t('client.placeholder.phone')"

          />
          <p v-if="localErrors.phone" class="mt-1 text-sm text-red-600">{{ localErrors.phone }}</p>
          <p v-if="createErrors.phone" class="mt-1 text-sm text-red-600">{{ createErrors.phone.join(', ') }}</p>
        </div>

        <!-- Company Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ transStore.t('client.label.company.name') }}  *</label>
          <input
              v-model="createForm.company_name"
              type="text"
              class="w-full py-2 px-3 rounded-lg transition-all outline-none focus:ring-0 border-2 border-gray-100 focus:border-[#00C49F] bg-white"
              :class="createErrors.company_name ? 'border-red-300' : ''"
              :placeholder="transStore.t('client.placeholder.company.name')"
          />
          <p v-if="createErrors.company_name" class="mt-1 text-sm text-red-600">{{ createErrors.company_name.join(', ') }}</p>
        </div>

        <!-- Role Groups -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ transStore.t('client.label.role.groups') }}</label>
          <VueMultiselect
              v-model="roleGroupsComputed"
              :options="clientStore.roleGroups"
              :multiple="true"
              :close-on-select="false"
              :placeholder="transStore.t('client.placeholder.role.groups')"
              label="name"
              track-by="id"
          />
          <p v-if="createErrors.role_group_ids" class="mt-1 text-sm text-red-600">{{ createErrors.role_group_ids.join(', ') }}</p>
        </div>

        <!-- Language -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Language <span class="text-red-500">*</span>
          </label>
          <select
              v-model="createForm.language"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:ring-opacity-20 transition-all duration-300"
          >
            <option :value="null">Select language</option>
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

  <!-- Status Toggle Confirmation Modal -->
  <BaseModal
      :is-open="showToggleConfirm"
      :title="toggleConfirmData.newStatus ? transStore.t('client.confirm.activate.title') : transStore.t('client.confirm.deactivate.title')"
      :submit-text="transStore.t('client.confirm')"
      :loading="isTogglingStatus"
      :disabled="isTogglingStatus"
      @close="showToggleConfirm = false"
      @save="confirmToggleStatus"
  >
    <div class="text-center">
      <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4" :class="toggleConfirmData.newStatus ? 'bg-green-100' : 'bg-red-100'">
        <font-awesome-icon
            v-if="toggleConfirmData.newStatus"
            :icon="['fas', 'check-circle']"
            class="h-6 w-6 text-green-600"
        />
        <font-awesome-icon
            v-else
            :icon="['fas', 'times-circle']"
            class="h-6 w-6 text-red-600"
        />
      </div>
      <h4 class="text-lg font-semibold text-gray-900 mb-2">
        {{ toggleConfirmData.newStatus ? transStore.t('client.confirm.activate.header') : transStore.t('client.confirm.deactivate.header') }}: {{ toggleConfirmData.client?.username }}
      </h4>
      <p class="text-gray-600 mb-4">
        {{ toggleConfirmData.newStatus ? transStore.t('client.confirm.activate.question') : transStore.t('client.confirm.deactivate.question') }}
        <span class="font-semibold">{{ toggleConfirmData.client?.full_name || toggleConfirmData.client?.username }}</span>?
        {{ toggleConfirmData.newStatus
          ? transStore.t('client.confirm.activate.impact')
          : transStore.t('client.confirm.deactivate.impact')
        }}
      </p>
      <div :class="toggleConfirmData.newStatus ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'" class="rounded-lg p-3 mb-4 border">
        <div class="flex items-start">
          <font-awesome-icon
              :icon="['fas', 'exclamation-triangle']"
              :class="toggleConfirmData.newStatus ? 'text-green-600' : 'text-red-600'"
              class="h-5 w-5 mt-0.5 mr-2 flex-shrink-0"
          />
          <p :class="toggleConfirmData.newStatus ? 'text-green-700' : 'text-red-700'" class="text-sm">
            {{ toggleConfirmData.newStatus
              ? transStore.t('client.confirm.activate.warning')
              : transStore.t('client.confirm.deactivate.warning')
            }}
          </p>
        </div>
      </div>
    </div>
  </BaseModal>

  <!-- Success/Error Toast -->
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
                :icon="['fas', 'check-circle']"
                class="w-6 h-6"
            />
            <font-awesome-icon
                v-else-if="toastMessage.type === 'error'"
                :icon="['fas', 'times-circle']"
                class="w-6 h-6"
            />
            <font-awesome-icon
                v-else
                :icon="['fas', 'info-circle']"
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
            <font-awesome-icon :icon="['fas', 'times']" class="w-4 h-4" />
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
import { useClient } from '@/composables/useClient';



// Use the composable
const {
  // State
  searchInput,
  isClientTableLoading,
  isSubmitting,
  isCreateModalOpen,
  isEditMode,
  editingClientId,
  isViewModalOpen,
  selectedClient,
  showToggleConfirm,
  isTogglingStatus,
  toggleConfirmData,
  currentPage,
  itemsPerPage,
  sortKey,
  sortAsc,
  toastMessage,
  createForm,
  createErrors,
  localErrors,
  passwordStrength,
  passwordStrengthLabel,

  // Computed
  hasCreateErrors,
  isFormValid,
  filteredClients,
  paginatedClients,
  totalPages,
  pageNumbers,
  roleGroupsComputed,

  // Stores
  clientStore,
  authStore,
  transStore,

  // Methods
  openCreateModal,
  closeCreateModal,
  openEditModal,
  submitCreateClient,
  openToggleConfirmModal,
  confirmToggleStatus,
  openViewModal,
  closeViewModal,
  goToPage,
  prevPage,
  nextPage,
  handleSort,
  handleSearch,
  formatFieldName,
  getAvatarInitials,
  isFetchingClient
} = useClient();
</script>

<style scoped>
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

/* Detail modal styles */
.detail-section {
  @apply border border-gray-200 rounded-xl p-4;
}

.detail-heading {
  @apply text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3;
}

.detail-label {
  @apply block text-xs text-gray-500 mb-1;
}

.detail-value {
  @apply text-sm font-medium text-gray-900;
}

.detail-chip {
  @apply inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200;
}

.detail-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-3;
}
</style>