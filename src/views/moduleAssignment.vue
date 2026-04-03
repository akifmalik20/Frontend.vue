<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">

    <!-- ══════════════════════════ HEADER ══════════════════════════ -->
    <div class="mb-8 flex items-center gap-3">
      <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg">
        <font-awesome-icon :icon="['fas', 'puzzle-piece']" class="w-6 h-6 text-white" />
      </div>
      <div>
        <h1 class="text-2xl md:text-3xl font-bold text-gray-800">{{ transStore.t('module.title') }}</h1>
        <p class="text-gray-500 text-sm mt-0.5">{{ transStore.t('module.description') }}</p>
      </div>
    </div>

    <!-- ══════════════════════════ TARGET SELECTOR ══════════════════════════ -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
      <div class="flex flex-col md:flex-row gap-4 items-end flex-wrap">

        <div class="w-full md:w-80">
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            {{ transStore.t('module.label.select.target.type') }}
          </label>
          <select v-model="selectedTargetId" @change="onTargetChange"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50 focus:bg-white text-sm transition-all">
            <option :value="null">— {{ transStore.t('module.placeholder.select.target') }} —</option>
            <option v-for="t in targets" :key="t.id" :value="t.auth_user">{{ t.label }}</option>
          </select>
        </div>

        <!-- Stats badges -->
        <div v-if="selectedTargetId !== null && !moduleStore.loading" class="flex items-center gap-2 flex-wrap">
          <div class="flex items-center gap-1.5 px-3 py-2 bg-teal-50 border border-teal-100 rounded-xl">
            <font-awesome-icon :icon="['fas', 'check-circle']" class="w-4 h-4 text-teal-500" />
            <span class="text-sm font-bold text-teal-700">{{ moduleStore.currentAssigned.length }}</span>
            <span class="text-xs text-teal-500">assigned</span>
          </div>
          <div class="flex items-center gap-1.5 px-3 py-2 bg-orange-50 border border-orange-100 rounded-xl">
            <font-awesome-icon :icon="['fas', 'circle-minus']" class="w-4 h-4 text-orange-400" />
            <span class="text-sm font-bold text-orange-600">
              {{ Math.max(0, moduleStore.allModules.length - moduleStore.currentAssigned.length) }}
            </span>
            <span class="text-xs text-orange-400"> {{transStore.t('module.table.unassigned')}}</span>
          </div>
        </div>

        <!-- Assign / Edit Assignments button -->
        <button @click="openAssignModal" :disabled="selectedTargetId === null"
                class="md:ml-auto flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5">
          <font-awesome-icon :icon="['fas', moduleStore.currentAssigned.length > 0 ? 'pen-to-square' : 'plus']" class="w-4 h-4" />
          {{ moduleStore.currentAssigned.length > 0 ? (transStore.t('module.button.edit.assignments') || 'Edit Assignments') : transStore.t('module.button.assign') }}
        </button>
      </div>
    </div>

    <!-- ══════════════════════════ LOADING ══════════════════════════ -->


    <div v-if="isModuleLoading"
         class="flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 p-16 gap-3">
      <div class="w-16 h-16 rounded-2xl  flex items-center justify-center">
        <font-awesome-icon
            icon="fa-solid fa-spinner"
            class="w-10 h-10 text-teal-500 animate-spin"
        />
      </div>
      <p class="text-gray-500 font-medium">{{transStore.t('module.fetch.client')}}</p>
      <p class="text-xs text-gray-400">{{transStore.t('module.wait')}}</p>
    </div>

    <template v-else>
      <!-- Loading State -->



      <!-- No target selected -->
      <div v-if="selectedTargetId === null"
           class="flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 p-16 gap-3">
        <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
          <font-awesome-icon :icon="['fas', 'hand-point-up']" class="w-7 h-7 text-gray-300" />
        </div>
        <p class="text-base font-medium text-gray-500">{{ transStore.t('module.no.target.selected') }}</p>
        <p class="text-sm text-gray-400">{{ transStore.t('module.no.target.description') }}</p>
      </div>



      <!-- Nothing assigned yet -->
      <div v-else-if="assignedTree.length === 0"
           class="flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 p-16 gap-3">
        <div class="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center">
          <font-awesome-icon :icon="['fas', 'inbox']" class="w-7 h-7 text-teal-300" />
        </div>
        <p class="text-base font-medium text-gray-600">{{ transStore.t('module.no.modules.assigned') }}</p>
        <p class="text-sm text-gray-400">{{ transStore.t('module.assign.instruction') }}</p>
      </div>

      <!-- ══════════════════════════ ASSIGNED TABLE ══════════════════════════ -->
      <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        <!-- Toolbar -->
        <div class="flex flex-col md:flex-row items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div class="relative w-full md:w-64">
            <font-awesome-icon :icon="['fas', 'search']" class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input v-model="searchInput" @input="handleSearch" type="text"
                   :placeholder="transStore.t('module.search')"
                   class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50 focus:bg-white text-sm transition-all" />
          </div>
          <div class="flex items-center gap-2 md:ml-auto text-sm text-gray-500">
            <span>Show</span>
            <select v-model="itemsPerPage" @change="currentPage = 1"
                    class="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white focus:ring-2 focus:ring-teal-500">
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="25">25</option>
            </select>
            <span>entries</span>
            <span class="ml-2 px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg font-medium text-gray-700">
              {{ moduleStore.currentAssigned.length }}  {{transStore.t('module.table.assigned')}}
            </span>
          </div>
        </div>

        <!-- ── Table ─────────────────────────────────────────────────── -->
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <!-- Collapse toggle column — narrow -->
              <th class="w-8 pl-4 py-3.5"></th>

              <th @click="handleSort('module_name')"
                  class="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-teal-600 transition-colors select-none">
                <div class="flex items-center gap-1.5">
                  Name
                  <font-awesome-icon :icon="['fas', sortKey === 'module_name' ? (sortAsc ? 'sort-up' : 'sort-down') : 'sort']"
                                     class="w-3 h-3" :class="sortKey === 'module_name' ? 'text-teal-500' : 'text-gray-300'" />
                </div>
              </th>

              <th @click="handleSort('module_code')"
                  class="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-teal-600 transition-colors select-none">
                <div class="flex items-center gap-1.5">
                  Topic
                  <font-awesome-icon :icon="['fas', sortKey === 'module_code' ? (sortAsc ? 'sort-up' : 'sort-down') : 'sort']"
                                     class="w-3 h-3" :class="sortKey === 'module_code' ? 'text-teal-500' : 'text-gray-300'" />
                </div>
              </th>

              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                 {{transStore.t('module.description')}}
              </th>

              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                 {{transStore.t('module.table.header.active')}}
              </th>

              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                 {{transStore.t('module.table.header.actions')}}
              </th>
            </tr>
            </thead>

            <tbody>
            <template v-for="row in paginatedAssigned" :key="row.id">

              <tr class="border-b border-gray-50 transition-colors"
                  :class="[
                    isChild(row) ? 'bg-slate-50/60 hover:bg-slate-100/60' : 'hover:bg-gray-50/60',
                  ]">

                <!-- ── Col 1: Collapse toggle (parents only) ── -->
                <td class="w-8 pl-4 py-3 align-middle">
                  <button v-if="isParent(row)"
                          @click="toggleCollapse(row.module_id)"
                          class="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-teal-600 transition-colors focus:outline-none"
                          :title="isCollapsed(row.module_id) ? 'Expand' : 'Collapse'">
                    <font-awesome-icon
                        :icon="['fas', isCollapsed(row.module_id) ? 'chevron-right' : 'chevron-down']"
                        class="w-3 h-3" />
                  </button>
                  <!-- child indent marker — subtle visual cue -->
                  <span v-else-if="isChild(row)" class="block w-5 h-5"></span>
                </td>

                <!-- ── Col 2: Module name (indented for children) ── -->
                <td class="px-4 py-3 align-middle">
                  <div class="flex items-center gap-2"
                       :class="isChild(row) ? 'pl-5' : ''">

                    <!-- Tree connector line for child rows -->
                    <span v-if="isChild(row)"
                          class="inline-block w-3 h-3 border-l-2 border-b-2 border-gray-300 rounded-bl mr-1 flex-shrink-0 -ml-5"
                          style="margin-top:-8px"></span>

                    <span class="text-sm font-semibold text-gray-800 truncate">{{ row.module_name }}</span>

                    <!-- Child-count badge shown on parent rows -->
                    <span v-if="isParent(row)"
                          class="inline-flex items-center gap-1 text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                      <font-awesome-icon :icon="['fas', 'layer-group']" class="w-2.5 h-2.5" />
                      {{ childCount(row) }}
                    </span>
                  </div>
                </td>

                <!-- ── Col 3: Topic (module_code) ── -->
                <td class="px-4 py-3 align-middle">
                  <span class="text-sm text-gray-600 font-mono">{{ row.module_code }}</span>
                </td>

                <!-- ── Col 4: Description ── -->
                <td class="px-4 py-3 align-middle max-w-xs">
                  <span class="text-sm text-gray-500 line-clamp-2">{{ row.module_name }}</span>
                </td>

                <!-- ── Col 5: Active toggle ── -->
                <td class="px-4 py-3 align-middle">
                  <button @click="toggleActive(row)" type="button" :disabled="moduleStore.assigning"
                          :class="row.is_active ? 'bg-teal-500' : 'bg-gray-200'"
                          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 cursor-pointer flex-shrink-0">
                    <span :class="row.is_active ? 'translate-x-6' : 'translate-x-1'"
                          class="h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 block"></span>
                  </button>
                </td>

                <!-- ── Col 6: Delete ── -->
                <td class="px-4 py-3 align-middle">
                  <button @click="openUnassignConfirm(row)" :disabled="moduleStore.assigning"
                          class="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all disabled:opacity-40">
                    <font-awesome-icon :icon="['fas', 'trash-can']" class="w-4 h-4" />
                  </button>
                </td>

              </tr>
            </template>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <p class="text-sm text-gray-500">
            Showing
            <span class="font-semibold text-gray-700">{{ (currentPage - 1) * itemsPerPage + 1 }}</span>
            –
            <span class="font-semibold text-gray-700">{{ Math.min(currentPage * itemsPerPage, flatAssigned.length) }}</span>
            of <span class="font-semibold text-gray-700">{{ flatAssigned.length }}</span>
          </p>
          <div class="flex items-center gap-1">
            <button @click="prevPage" :disabled="currentPage === 1"
                    class="p-2 rounded-lg border border-gray-200 bg-white hover:border-teal-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <font-awesome-icon :icon="['fas', 'chevron-left']" class="w-3.5 h-3.5 text-gray-500" />
            </button>
            <button v-for="p in pageNumbers" :key="p"
                    @click="typeof p === 'number' && goToPage(p)"
                    :disabled="typeof p !== 'number'"
                    :class="[p === currentPage
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-transparent shadow-sm'
                      : typeof p === 'number' ? 'bg-white text-gray-700 hover:border-teal-300' : 'text-gray-400 cursor-default bg-white']"
                    class="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium border border-gray-200 transition-all">
              {{ p }}
            </button>
            <button @click="nextPage" :disabled="currentPage === totalPages"
                    class="p-2 rounded-lg border border-gray-200 bg-white hover:border-teal-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <font-awesome-icon :icon="['fas', 'chevron-right']" class="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

    </template
    >
  </div>


  <!-- ══════════════════════════════════════════════════════════════
       ASSIGN / EDIT MODAL
  ══════════════════════════════════════════════════════════════ -->
  <BaseModal
      :is-open="isAssignModalOpen"
      :title="transStore.t('module.button.assign')"
      :submit-text="moduleStore.assigning ? 'Saving…' : changeCount > 0 ? `Apply ${changeCount} Change${changeCount !== 1 ? 's' : ''}` : 'No changes yet'"
      mode="form"
      :loading="moduleStore.assigning"
      :disabled="moduleStore.assigning || changeCount === 0"
      @close="closeAssignModal"
      @save="submitAssign"
  >
    <div class="space-y-4">

      <!-- Error banner -->
      <div v-if="assignError" class="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
        <font-awesome-icon :icon="['fas', 'circle-exclamation']" class="w-4 h-4 text-red-400 flex-shrink-0" />
        <p class="text-sm text-red-600">{{ assignError }}</p>
      </div>

      <!-- Search + bulk actions -->
      <div class="flex items-center gap-2">
        <div class="relative flex-1">
          <font-awesome-icon :icon="['fas', 'search']" class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input v-model="modalSearch" type="text" placeholder="Search modules…"
                 class="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all" />
        </div>
        <button @click="selectAllVisible"
                class="px-3 py-2 text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 rounded-xl hover:bg-teal-100 transition-colors whitespace-nowrap">
           {{transStore.t('module.select.all')}}
        </button>
        <button @click="clearAll"
                class="px-3 py-2 text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors whitespace-nowrap">
            {{transStore.t('module.clear')}}
        </button>
      </div>

      <!-- Pending-changes summary strip -->
      <div v-if="changeCount > 0"
           class="flex items-center gap-2 flex-wrap text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200">
        <span class="font-semibold text-gray-600"> {{transStore.t('module.pending.changes')}}</span>
        <span v-if="modalRows.filter(r => r.checked && !r.wasAssigned).length > 0"
              class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
          +{{ modalRows.filter(r => r.checked && !r.wasAssigned).length }}  {{transStore.t('module.assign')}}
        </span>
        <span v-if="modalRows.filter(r => !r.checked && r.wasAssigned).length > 0"
              class="px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
          −{{ modalRows.filter(r => !r.checked && r.wasAssigned).length }} {{transStore.t('module.modal.button.remove')}}
        </span>
        <span v-if="modalRows.filter(r => r.checked && r.wasAssigned && r.parent_id !== r.originalParentId).length > 0"
              class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
          {{ modalRows.filter(r => r.checked && r.wasAssigned && r.parent_id !== r.originalParentId).length }}
           {{transStore.t('module.parent.update')}}{{ modalRows.filter(r => r.checked && r.wasAssigned && r.parent_id !== r.originalParentId).length !== 1 ? 's' : '' }}
        </span>
      </div>

      <!-- ── Module list ── -->
      <div class="border border-gray-200 rounded-xl overflow-hidden" style="max-height: 420px; overflow-y: auto;">

        <!-- Loading state while catalogue is being fetched -->
        <div v-if="modalLoading"
             class="px-5 py-10 flex flex-col items-center justify-center gap-3 text-sm text-gray-400">
          <font-awesome-icon :icon="['fas', 'spinner']" class="w-6 h-6 text-teal-500 animate-spin" />
          <span> {{transStore.t('module.table.loading')}}</span>
        </div>

        <div v-else-if="visibleModalRows.length === 0"
             class="px-5 py-10 text-center text-sm text-gray-400">
          {{transStore.t('module.modal.no.available')}}
        </div>

        <div v-if="!modalLoading" v-for="row in visibleModalRows" :key="row.module_id"
             class="border-b border-gray-100 last:border-b-0 transition-colors"
             :class="{
               'bg-teal-50/40':       row.checked && !row.wasAssigned,
               'bg-red-50/40':        !row.checked && row.wasAssigned,
               'bg-gray-50/70':       row.checked && row.wasAssigned,
               'hover:bg-gray-50/50': !row.wasAssigned && !row.checked,
             }">

          <!-- Main row -->
          <div class="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
               @click="toggleRow(row.module_id)">

            <!-- Checkbox -->
            <div class="flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150"
                 :class="row.checked
                     ? 'bg-teal-500 border-teal-500'
                     : row.wasAssigned ? 'bg-red-400 border-red-400'
                     : 'border-gray-300 bg-white'">
              <font-awesome-icon
                  :icon="['fas', row.checked ? 'check' : row.wasAssigned ? 'minus' : 'check']"
                  class="w-3 h-3 text-white"
                  :class="(!row.checked && !row.wasAssigned) ? 'opacity-0' : 'opacity-100'" />
            </div>

            <!-- Module icon -->
            <div class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                 :class="row.checked
                     ? 'bg-gradient-to-br from-teal-500 to-emerald-500 shadow-sm'
                     : row.wasAssigned ? 'bg-red-100 border border-red-200'
                     : 'bg-gray-100 border border-gray-200'">
              <font-awesome-icon :icon="['fas', 'puzzle-piece']" class="w-3.5 h-3.5"
                                 :class="row.checked ? 'text-white' : row.wasAssigned ? 'text-red-400' : 'text-gray-400'" />
            </div>

            <!-- Name + code -->
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold truncate"
                   :class="!row.checked && row.wasAssigned ? 'text-red-500 line-through' : 'text-gray-800'">
                {{ row.label }}
              </div>
              <div class="text-xs font-mono"
                   :class="!row.checked && row.wasAssigned ? 'text-red-300' : 'text-gray-400'">
                {{ row.code }}
              </div>
            </div>

            <!-- Status badge -->
            <span v-if="!row.checked && row.wasAssigned"
                  class="flex-shrink-0 text-xs font-medium text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full whitespace-nowrap">
               {{transStore.t('module.will.remove')}}
            </span>
            <span v-else-if="row.checked && row.wasAssigned && row.parent_id !== row.originalParentId"
                  class="flex-shrink-0 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full whitespace-nowrap">
               {{transStore.t('module.modified')}}
            </span>
            <span v-else-if="row.checked && row.wasAssigned"
                  class="flex-shrink-0 text-xs font-medium text-teal-600 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full whitespace-nowrap">
               {{transStore.t('module.table.assigned')}}
            </span>
            <span v-else-if="row.checked && !row.wasAssigned"
                  class="flex-shrink-0 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full whitespace-nowrap">
              +  {{transStore.t('module.new')}}
            </span>
          </div>

          <!-- ── "Under:" parent picker — always visible when row is checked ── -->
          <div v-if="row.checked"
               class="flex items-center gap-3 px-4 pb-3 pt-0"
               @click.stop>

            <!-- Spacers to align with checkbox / icon above -->
            <div class="w-5 flex-shrink-0"></div>
            <div class="w-8 flex-shrink-0"></div>

            <div class="flex items-center gap-2 flex-1 flex-wrap">

              <!-- Role pill -->
              <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border whitespace-nowrap"
                   :class="row.parent_id === null
                       ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                       : 'bg-emerald-50 border-emerald-200 text-emerald-700'">
                <font-awesome-icon :icon="['fas', row.parent_id === null ? 'layer-group' : 'sitemap']" class="w-3 h-3" />
                {{ row.parent_id === null ? 'Parent module' : 'Child module' }}
              </div>

              <span class="text-xs text-gray-400 font-medium whitespace-nowrap">Under:</span>


              <select
                  :value="row.parent_id ?? ''"
                  @change="setRowParent(row.module_id, ($event.target as HTMLSelectElement).value ? +($event.target as HTMLSelectElement).value : null)"
                  @click.stop
                  class="flex-1 min-w-0 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-700 transition-all cursor-pointer">
                <option value="">— Top-level (no parent) —</option>
                <option v-for="opt in parentOptions(row.module_id)" :key="opt.id" :value="opt.id">
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>

        </div>
      </div>

      <!-- Active toggle -->
      <button @click="assignIsActive = !assignIsActive" type="button"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 text-left"
              :class="assignIsActive ? 'bg-teal-50 border-teal-200' : 'bg-gray-50 border-gray-200'">
        <div class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0"
             :class="assignIsActive ? 'bg-teal-500' : 'bg-gray-300'">
          <span :class="assignIsActive ? 'translate-x-4' : 'translate-x-1'"
                class="h-3.5 w-3.5 rounded-full bg-white shadow block transition-transform"></span>
        </div>
        <div>
          <p class="text-xs font-semibold" :class="assignIsActive ? 'text-teal-700' : 'text-gray-500'">Active</p>
          <p class="text-xs text-gray-400"> {{transStore.t('module.enable.immediate')}}</p>
        </div>
      </button>

    </div>
  </BaseModal>


  <!-- ══════════════════════════════════════════════════════════════
       UNASSIGN CONFIRM MODAL
  ══════════════════════════════════════════════════════════════ -->
  <BaseModal
      :is-open="showUnassignConfirm"
      :title="transStore.t('module.modal.title.unassign')"
      :submit-text="transStore.t('module.modal.button.unassign')"
      mode="delete"
      :loading="moduleStore.assigning"
      :disabled="moduleStore.assigning"
      @close="showUnassignConfirm = false"
      @save="confirmUnassign">
    <div class="text-center">
      <div class="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <font-awesome-icon :icon="['fas', 'trash-can']" class="w-5 h-5 text-red-500" />
      </div>
      <p class="text-gray-600 mb-4">
         {{transStore.t('module.modal.button.remove')}}<span class="font-semibold text-gray-800">{{ unassignTarget?.module_name }}</span>  {{transStore.t('module.from.this.user')}}
      </p>
      <!-- Extra warning when removing a parent that has children -->
      <div v-if="unassignTarget && isParent(unassignTarget)"
           class="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-left mb-3">
        <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
        <p class="text-xs text-orange-700">
          {{transStore.t('module.this.parent.module')}} {{ unassignTarget && childCount(unassignTarget) }}  {{transStore.t('module.child.modules')}}
           {{transStore.t('module.remove.warning')}}
        </p>
      </div>
      <div class="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-left">
        <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
        <p class="text-xs text-amber-700">{{ transStore.t('module.modal.unassign.confirmation.text') }}</p>
      </div>
    </div>
  </BaseModal>


  <!-- ══════════════════════════════════════════════════════════════
       TOAST
  ══════════════════════════════════════════════════════════════ -->
  <Transition name="toast">
    <div v-if="toast.type" class="fixed top-5 right-5 z-50 w-80">
      <div class="rounded-2xl border shadow-xl p-4"
           :class="{
             'bg-green-50 border-green-200': toast.type === 'success',
             'bg-red-50   border-red-200':   toast.type === 'error',
             'bg-blue-50  border-blue-200':  toast.type === 'info',
           }">
        <div class="flex items-start gap-3">
          <font-awesome-icon
              :icon="['fas', toast.type === 'success' ? 'circle-check' : toast.type === 'error' ? 'circle-xmark' : 'circle-info']"
              class="w-5 h-5 flex-shrink-0 mt-0.5"
              :class="{
                'text-green-500': toast.type === 'success',
                'text-red-500':   toast.type === 'error',
                'text-blue-500':  toast.type === 'info',
              }" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold"
               :class="{ 'text-green-800': toast.type === 'success', 'text-red-800': toast.type === 'error', 'text-blue-800': toast.type === 'info' }">
              {{ toast.title }}
            </p>
            <p v-if="toast.message" class="text-xs mt-0.5"
               :class="{ 'text-green-700': toast.type === 'success', 'text-red-700': toast.type === 'error', 'text-blue-700': toast.type === 'info' }">
              {{ toast.message }}
            </p>
          </div>
          <button @click="toast.type = ''" class="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <font-awesome-icon :icon="['fas', 'xmark']" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>


<script setup lang="ts">
import { useModuleAssignment } from '@/composables/useModuleAssignment'
import { FontAwesomeIcon }     from '@fortawesome/vue-fontawesome'
import BaseModal               from '@/components/baseModal.vue'

const {
  moduleStore, transStore,

  // targets
  selectedTargetId, targets, onTargetChange,

  // assigned table
  searchInput, sortKey, sortAsc, currentPage, itemsPerPage,
  assignedTree, flatAssigned, paginatedAssigned, totalPages, pageNumbers,
  handleSearch, handleSort, goToPage, prevPage, nextPage,
  toggleCollapse, isCollapsed,
  isChild, isParent, childCount, parentName,

  // assign modal
  isAssignModalOpen, assignError, modalSearch, modalLoading,
  assignIsActive,
  modalRows, visibleModalRows, selectedCount, changeCount,
  isAlreadyAssigned, parentOptions,
  toggleRow, setRowParent,
  selectAllVisible, clearAll,
  openAssignModal, closeAssignModal, submitAssign,

  // unassign
  showUnassignConfirm, unassignTarget, openUnassignConfirm, confirmUnassign,
  toggleActive,
  isModuleLoading,
  // toast
  toast,
} = useModuleAssignment()
</script>


<style scoped>
.toast-enter-active, .toast-leave-active { transition: all .25s ease; }
.toast-enter-from, .toast-leave-to       { opacity: 0; transform: translateX(1.5rem); }

/* Thin scrollbar for the modal list */
::-webkit-scrollbar       { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: #f8fafc; border-radius: 4px; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>