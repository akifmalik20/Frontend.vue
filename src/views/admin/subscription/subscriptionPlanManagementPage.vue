<script setup lang="ts">
import { useSubscriptionModule } from '@/composables/useSubscriptionModule';

// UI Components
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import BaseModal from '@/components/baseModal.vue';
import BaseDetailModal from '@/components/baseDetailModal.vue';
import AccessDenied from '@/components/accessDenied.vue';

const {
  isAdmin,
  handleTabClick,
  isTableLoading,
  isChildModule,
  breadcrumbItems,
  activeTab,
  tabs,

  currentPage,
  statusMessage,
  toastMessage,
  scrollContainer,

  // Modal Controls
  isModalOpen,
  isEditing,
  isSubmitting,
  isDeleteModalOpen,
  isAssignModalOpen,
  isEndAssignModalOpen,
  isViewModalOpen,
  isSubscriptionModalOpen,
  isPaymentModalOpen,
  isFetchingSubscription,

  // Data & Selection
  selectedItem,
  selectedClient,
  selectedSubscription,
  selectedItemForPayment,
  newStatus,
  billingCycle,

  // Forms
  form,
  assignForm,
  endAssignForm,
  errors,

  // Computed

  sortedSubscriptions,
  subscriptionTypes,
  paymentOptions,
  isFormInvalid,

  // Methods
  openAddModal,
  openEditModal,
  openDeleteModal,
  openViewModal,
  openAssignModal,
  openEndAssignmentModal,
  openSubscriptionViewModal,
  openPaymentModal,
  handleFormSubmit,
  handleConfirmDelete,
  handleAssignSubmit,
  handleEndSubmit,
  handlePaymentStatusUpdate,
  resetForm,
  validateName,

  scrollLeft,
  scrollRight,

  showScrollButtons,

  displayPrice,

  openToggleModal,
  isToggleModalOpen,
  handleConfirmToggle,
  activePlans,
  calculatedMonthlyTotal,
  calculatedYearlyTotal,
  isLoading,
  isFetchingPlan,
  transStore,
  searchQueryClient,
  currentPageClient,
  itemsPerPage,
  filteredClients,
  paginatedClients,
  totalPages,

} = useSubscriptionModule();




</script>
<template>
  <div class="py-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
    <div v-if="isAdmin">
      <div class="px-4 sm:px-6 lg:px-8 mb-8">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shrink-0">
              <font-awesome-icon icon="fa-solid fa-user-tie" class="text-white text-xl" />
            </div>

            <div>
              <h1 class="text-2xl md:text-3xl font-bold text-gray-800">
                {{ transStore.t('subscription.title') }}
              </h1>

              <div class="text-gray-600 mt-1 text-sm">
                <div class="flex items-center flex-wrap">
                  <template v-if="isChildModule || (breadcrumbItems && breadcrumbItems.length > 0)">
                    <template v-for="(item, i) in breadcrumbItems" :key="i">
                      <router-link
                          v-if="item.url"
                          :to="item.url"
                          class="text-teal-600 hover:text-teal-700 hover:underline font-medium"
                      >
                        {{ item.label }}
                      </router-link>
                      <span v-else class="text-gray-600">{{ item.label }}</span>
                      <span v-if="i < breadcrumbItems.length - 1" class="text-gray-400 mx-1">></span>
                    </template>
                  </template>
                  <template v-else>
                    {{ transStore.t('subscription.description') }}
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr class="border-gray-100 mb-8" />
<!--        @click="activeTab = tab.id"-->
        <div class="flex justify-center mb-6">
          <div class="bg-white p-1.5 rounded-2xl flex border border-gray-100 shadow-sm backdrop-blur-sm">
            <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="handleTabClick(tab.id)"
                :class="[
                 'relative flex items-center gap-2 rounded-xl px-10 py-2.5 text-sm font-bold transition-all duration-300',
                  activeTab === tab.id
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md transform scale-105 z-10'
                  : 'text-gray-500 hover:text-teal-600 hover:bg-gray-50'
                   ]"
            >
              <font-awesome-icon :icon="tab.icon" class="text-xs" />
              {{ tab.label }}
            </button>
          </div>
        </div>
      </div>
      <div v-if="activeTab == 'plans'" class="animate-in  duration-500">

    <!--    //Monthly and Yearly Toggle Button-->
        <div class="flex justify-end mb-4 pr-6">
          <button
              @click="openAddModal"
              class="group bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-0.5 whitespace-nowrap"
          >
            <font-awesome-icon icon="fa-solid fa-plus" class="transform group-hover:rotate-90 transition-transform duration-300" />
            {{ transStore.t('subscription.add.new.plan') }}
          </button>
        </div>
        <div v-if="isFetchingPlan" class="fixed inset-0 z-[999] flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <div class="flex flex-col items-center gap-4">
            <font-awesome-icon :icon="['fas', 'spinner']" class="w-12 h-12 text-teal-600 animate-spin" />
            <p class="text-teal-900 font-bold animate-pulse">{{ transStore.t('subscription.fetching.plan.details') }}</p>
          </div>
        </div>

      <div class="flex justify-center w-full p-4">
        <div v-if="subscriptionTypes.length > 0" class="flex items-center gap-4 bg-gray-50 border border-gray-200 px-4 py-2 rounded-2xl shadow-sm">

          <template v-for="(type, index) in subscriptionTypes" :key="type.id">

      <span
          class="text-xs font-bold transition-colors duration-200 uppercase tracking-tight cursor-pointer"
          :class="billingCycle === type.name ? 'text-gray-900' : 'text-gray-400'"
          @click="billingCycle = type.name; currentPage = 1"
      >
        {{ type.name }}
      </span>

            <button
                v-if="index === 0 && subscriptionTypes[1]"
                @click="billingCycle = (billingCycle === type.name ? subscriptionTypes[1].name : type.name); currentPage = 1"
                type="button"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none"
                :class="billingCycle === subscriptionTypes[1].name ? 'bg-emerald-500' : 'bg-gray-300'"
            >
           <span
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ease-in-out shadow-sm"
            :class="billingCycle === subscriptionTypes[1].name ? 'translate-x-6' : 'translate-x-1'"></span>
            </button>

          </template>
        </div>

        <div v-else class="text-xs text-red-500 font-mono p-2">
          {{ transStore.t('subscription.debug.no.types.loaded') }}
        </div>
      </div>


      <div class="relative group mt-2 mb-20 w-full max-w-[1140px] mx-auto px-6">

        <div v-if="showScrollButtons" class="absolute -right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
          <button
              @click="scrollLeft"
              class="w-10 h-10 bg-white shadow-lg rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:text-[#00C49F] transition-all"
          >
            <font-awesome-icon icon="fa-solid fa-chevron-left" />
          </button>
          <button
              @click="scrollRight"
              class="w-10 h-10 bg-white shadow-lg rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:text-[#00C49F] transition-all"
          >
            <font-awesome-icon icon="fa-solid fa-chevron-right" />
          </button>
        </div>

        <div v-if="isLoading" class="flex items-center justify-center h-80 w-full">
          <div class="text-center space-y-4">
            <font-awesome-icon icon="fa-solid fa-spinner" class="w-12 h-12 mx-auto text-teal-500 animate-spin" />
            <div>
              <p class="text-gray-500 font-medium animate-pulse"> {{ transStore.t('subscription.fetch.plans') }}</p>
              <p class="text-sm text-gray-400 mt-1 animate-pulse">{{ transStore.t('subscription.fetch.description') }}</p>
            </div>
          </div>
        </div>

        <div
            v-else-if="sortedSubscriptions.length > 0"
            ref="scrollContainer"
            class="flex overflow-x-auto gap-6 px-4 py-7 no-scrollbar scroll-smooth w-full"
        >
          <div
              v-for="sub in sortedSubscriptions"
              :key="sub.id"
              class="flex-none w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
          >
            <!-- Inlined PlanCard -->
            <div class="h-full w-full">
              <div
                  :class="[
            'h-full bg-white border-0 shadow-md transition-all duration-300 pricing-card rounded-[2rem] relative flex flex-col',
            sub.is_popular ? 'border-2 border-[#198754]' : ''
          ]"
              >
                <!-- Non-popular badge -->
                <span
                    v-if="!sub.is_popular"
                    class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 uppercase px-3 sm:px-4 py-1 rounded-full border border-gray-300 bg-[#e5e7eb] text-[#374151] font-semibold text-[10px] sm:text-[0.75rem] whitespace-nowrap z-10"
                >
          {{ sub.tier }}
        </span>

                <!-- Popular badge -->
                <div
                    v-if="sub.is_popular"
                    class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                >
          <span
              class="text-white px-3 sm:px-4 py-1 rounded-full whitespace-nowrap bg-[#00C49F] text-[10px] sm:text-[0.85rem] font-bold uppercase tracking-[0.05rem] shadow-lg shadow-green-500/30"
          >
            {{ transStore.t('subscription.plan.cards.most.popular') }}
          </span>
                </div>

                <div class="p-4 sm:p-6 flex flex-col h-full">

                  <!-- Header: name & price -->
                  <div class="text-center mb-4 sm:mb-6">
                    <h3 class="font-bold text-xs sm:text-base mt-1 sm:mt-2 mb-1 sm:mb-2 text-gray-900 break-words leading-tight px-2">
                      {{ sub.name }}
                    </h3>

                    <div class="flex items-baseline justify-center gap-2 sm:gap-3 mb-2">
                      <!-- Strikethrough original price -->
                      <div
                          v-if="Number(billingCycle === 'Yearly' ? sub.price * 12 : sub.price) > 0 && Number(billingCycle === 'Yearly' ? sub.price * 12 : sub.price) > Number(billingCycle === 'Yearly' ? sub.yearly_total_price : sub.monthly_total_price)"
                          class="text-sm sm:text-lg font-medium text-gray-400 line-through decoration-rose-400/50"
                      >
                        ${{ Math.round(Number(billingCycle === 'Yearly' ? sub.price * 12 : sub.price)) }}
                      </div>

                      <!-- Final price -->
                      <div class="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                        ${{ Math.round(Number(billingCycle === 'Yearly' ? sub.yearly_total_price : sub.monthly_total_price)) }}
                      </div>
                    </div>

                    <!-- Savings badge -->
                    <div
                        v-if="Number(billingCycle === 'Yearly' ? sub.price * 12 : sub.price) > 0 && Number(billingCycle === 'Yearly' ? sub.price * 12 : sub.price) > Number(billingCycle === 'Yearly' ? sub.yearly_total_price : sub.monthly_total_price)"
                        class="inline-block bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider"
                    >
                      Save ${{ Math.round(Number(billingCycle === 'Yearly' ? sub.price * 12 : sub.price) - Number(billingCycle === 'Yearly' ? sub.yearly_total_price : sub.monthly_total_price)) }}
                    </div>
                  </div>

                  <!-- Feature list -->
                  <ul class="space-y-3 sm:space-y-4 mb-6 grow">
                    <li class="flex items-start text-xs sm:text-sm">
                      <font-awesome-icon icon="fa-solid fa-check" class="text-green-500 mt-0.5 mr-2 sm:mr-3 shrink-0" />
                      <span class="text-gray-700">
                {{ transStore.t('subscription.plan.cards.up.to') }}
                <strong class="text-gray-900">{{ sub.user_limit }}</strong>
                {{ transStore.t('subscription.users') }}
              </span>
                    </li>
                    <li class="flex items-start text-xs sm:text-sm">
                      <font-awesome-icon icon="fa-solid fa-check" class="text-green-500 mt-0.5 mr-2 sm:mr-3 shrink-0" />
                      <span class="text-gray-700">
                <strong class="text-gray-900">{{ sub.ai_agents_count }}</strong>
                {{ transStore.t('subscription.ai.agen') }}
              </span>
                    </li>
                    <li class="flex items-start text-xs sm:text-sm">
                      <font-awesome-icon icon="fa-solid fa-check" class="text-green-500 mt-0.5 mr-2 sm:mr-3 shrink-0" />
                      <span class="text-gray-700">
                <strong class="text-gray-900">{{ sub.ai_tokens_per_month?.toLocaleString() }}</strong>
                {{ transStore.t('subscription.plan.cards.ai.tokens') }}
              </span>
                    </li>
                  </ul>

                  <!-- Active status toggle -->
                  <div class="flex items-center mb-4 border-t border-gray-100 pt-4 justify-between">
                    <div class="flex items-center">
                      <div :class="['w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full mr-2', sub.is_active ? 'bg-green-500 pulse' : 'bg-red-500']"></div>
                      <span :class="sub.is_active ? 'text-green-600' : 'text-red-600'" class="font-bold text-[10px] sm:text-xs">
                {{ sub.is_active ? transStore.t('subscription.plan.cards.plan.active') : transStore.t('subscription.plan.cards.plan.inactive') }}
              </span>
                    </div>
                    <button
                        @click="openToggleModal(sub)"
                        class="p-2.5 rounded-xl transition-colors flex justify-center items-center hover:bg-gray-50"
                        :title="sub.is_active ? transStore.t('subscription.plan.cards.deactivate') : transStore.t('subscription.plan.cards.activate')"
                    >
                      <div
                          :class="sub.is_active ? 'bg-emerald-500' : 'bg-gray-300'"
                          class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 shadow-inner"
                      >
                <span
                    :class="sub.is_active ? 'translate-x-5' : 'translate-x-1'"
                    class="inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-300 shadow-md"
                ></span>
                      </div>
                    </button>
                  </div>

                  <!-- Action buttons -->
                  <div class="border-t border-gray-100 pt-4 mt-auto">
                    <div class="flex items-center justify-evenly gap-2">
                      <button @click="openEditModal(sub)" class="p-2.5 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors flex justify-center items-center">
                        <font-awesome-icon icon="fa-solid fa-pen-to-square" />
                      </button>
                      <button @click="openDeleteModal(sub)" class="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors flex justify-center items-center">
                        <font-awesome-icon icon="fa-solid fa-trash-can" />
                      </button>
                      <button @click="openViewModal(sub)" class="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors flex justify-center items-center">
                        <font-awesome-icon icon="fa-solid fa-eye" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
            <!-- End inlined PlanCard -->

          </div>
        </div>

        <div
            v-else
            class="flex flex-col items-center justify-center py-16 px-4 w-full bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <div class="text-gray-400 text-center max-w-md mx-auto">
            <font-awesome-icon icon="fa-solid fa-face-frown" class="w-12 h-12 mb-4" />
            <h3 class="text-lg font-medium text-gray-500 mb-2">{{ transStore.t('subscription.no.plans') }}</h3>
            <p class="text-sm text-gray-500">{{ transStore.t('subscription.no.plan.description') }}</p>
          </div>
        </div>
      </div>
      </div>

      <div v-if="activeTab == 'assignments'" class="animate-in duration-500">
        <div class="px-4 sm:px-6 lg:px-8 pb-10">
          <div v-if="isFetchingSubscription" class="fixed inset-0 z-[999] flex items-center justify-center bg-white/50 backdrop-blur-sm">
                      <div class="flex flex-col items-center gap-4">
                        <font-awesome-icon :icon="['fas', 'spinner']" class="w-12 h-12 text-teal-600 animate-spin" />
                        <p class="text-teal-900 font-bold animate-pulse">{{ transStore.t('subscription.fetch.client') }}</p>
                      </div>
                    </div>
          <!-- Search & Controls Bar -->
          <div class="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
            <div class="flex flex-col md:flex-row items-center justify-between gap-4">
              <div class="relative w-full md:w-80 lg:w-96 group">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <font-awesome-icon icon="fas fa-magnifying-glass" class="h-4 w-4 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                </div>
                <input
                    v-model="searchQueryClient"
                    @input="currentPageClient = 1"
                    type="text"
                    :placeholder="transStore.t( 'subscription.search')"
                    class="w-full pl-10 border-2 py-2 px-3 rounded-lg transition-all outline-none focus:ring-0 border-gray-100 focus:border-[#00C49F] bg-white"
                />
              </div>

              <div class="flex items-center gap-4">
                <div class="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                  <span class="text-sm text-gray-600">{{ transStore.t('subscription.show') }}</span>
                  <select
                      v-model="itemsPerPage"
                      @change="currentPageClient = 1"
                      class="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                  <span class="text-sm text-gray-600">{{ transStore.t('subscription.entries') }}</span>
                </div>

                <div class="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
            <span v-if="isTableLoading" class="text-sm text-gray-700 font-medium whitespace-nowrap flex items-center gap-1">
              {{ transStore.t('subscription.total') }}:
              <font-awesome-icon icon="fas fa-spinner" class="w-4 h-4 text-teal-600 animate-spin" />
              {{ transStore.t('subscription.users') }}
            </span>
                  <span v-else class="text-sm text-gray-700 font-medium whitespace-nowrap">
              {{ transStore.t('subscription.total') }}
              <span class="font-bold text-gray-900 mx-1">{{ filteredClients.length }}</span>
              {{ transStore.t('subscription.users') }}
            </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Table -->
          <div class="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-gray-100">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gradient-to-b from-gray-200 to-gray-100">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {{ transStore.t('subscription.name') }}
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {{ transStore.t('subscription.plan') }}
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {{ transStore.t('subscription.created') }}
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {{ transStore.t('subscription.next_billing') }}
                  </th>

                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {{ transStore.t('subscription.payment') }}
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {{ transStore.t('subscription.status') }}
                  </th>
                  <th class="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {{ transStore.t('actions') }}
                  </th>
                </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">

                <!-- Loading State -->
                <tr v-if="isTableLoading">
                  <td colspan="7" class="py-16 text-center">
                    <div class="flex flex-col items-center justify-center space-y-4">
                      <font-awesome-icon icon="fa-solid fa-spinner" class="w-10 h-10 text-teal-500 animate-spin" />
                      <div>
                        <p class="text-gray-500 font-medium animate-pulse">{{ transStore.t('subscription.fetching.clients') }}</p>
                        <p class="text-xs text-gray-400 animate-pulse">{{ transStore.t('subscription.fetching.clients.desc') }}</p>
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Data Rows -->
                <tr
                    v-else-if="paginatedClients.length > 0"
                    v-for="(item, index) in paginatedClients"
                    :key="item.id"
                    @click="openSubscriptionViewModal(item.id)"
                    class="hover:bg-gray-50 cursor-pointer transition-all duration-200 animate-fade-in"
                    :style="{ animationDelay: `${index * 0.05}s` }"
                >
                  <!-- Full Name -->
                  <td class="px-6 py-4">
                    <div class="flex items-center">
                      <div class="relative">
                        <div class="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-teal-100 to-emerald-100 text-teal-700 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm border border-teal-200">
                          {{ item.full_name?.charAt(0) || '?' }}
                        </div>
                        <div
                            v-if="item.subscription_status?.toLowerCase() === 'active'"
                            class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#22C55E] border-2 border-white rounded-full shadow-sm"
                        ></div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-semibold text-gray-900">{{ item.full_name }}</div>
                      </div>
                    </div>
                  </td>

                  <!-- Plan -->
                  <td class="px-6 py-4">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100 shadow-sm">
                  {{ item.subscription_plan_name }}
                </span>
                  </td>





                  <!-- Created At -->
                  <td class="px-6 py-4">
                <span class="text-gray-600 text-sm font-medium">
                  {{ item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB') : 'N/A' }}
                </span>
                  </td>

                  <!-- Next Billing -->
                  <td class="px-6 py-4">
                <span class="text-gray-600 text-sm font-medium">
                  {{ item.next_billing_date ? new Date(item.next_billing_date).toLocaleDateString('en-GB') : 'N/A' }}
                </span>
                  </td>
                  <!-- Payment Status -->
                  <td class="px-6 py-4" @click.stop>
                    <button
                        @click="openPaymentModal(item)"
                        :disabled="item.subscription_status === 'no_subscription' || item.subscription_plan_name === 'No Plan' || !item.current_subscription"
                        class="px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all"
                        :class="[
                    item.subscription_status === 'no_subscription' || item.subscription_plan_name === 'No Plan' || !item.current_subscription
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                      : 'bg-gray-100 hover:bg-teal-50 text-gray-700 hover:text-teal-700 border-gray-200 hover:border-teal-200'
                  ]"
                    >
                      <span>{{ item.payment_status || 'Update Status' }}</span>
                      <font-awesome-icon icon="fa-solid fa-edit" class="text-[10px]" />
                    </button>
                  </td>

                  <!-- Status Toggle -->
                  <td class="px-6 py-4">
                    <button
                        @click.stop="item.subscription_status === 'active' ? openEndAssignmentModal(item) : openAssignModal(item)"
                        :class="item.subscription_status === 'active' ? 'bg-emerald-500' : 'bg-gray-300'"
                        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none shadow-inner"
                    >
                  <span
                      :class="item.subscription_status === 'active' ? 'translate-x-6' : 'translate-x-1'"
                      class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-md"
                  ></span>
                    </button>
                  </td>

                  <!-- Actions -->
                  <td class="px-6 py-4">
                    <div class="flex items-center justify-center gap-1.5" @click.stop>
                      <button
                          @click="openSubscriptionViewModal(item.id)"
                          class="p-2 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-600 border border-gray-200 transition-all duration-200 group"
                          title="View details"
                      >
                        <font-awesome-icon icon="fas fa-eye" class="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Empty State -->
                <tr v-else>
                  <td colspan="7" class="px-6 py-12 text-center">
                    <div class="text-gray-400 animate-fade-in">
                      <font-awesome-icon icon="fas fa-circle-exclamation" class="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p class="text-lg font-medium text-gray-500">{{ transStore.t('subscription.no.record') }}</p>
                      <p class="text-sm mt-1 text-gray-400">{{ transStore.t('subscription.nor.record.desc') }}</p>
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
                  {{ transStore.t('subscription.showing') }}
                  <span class="font-semibold">{{ (currentPageClient - 1) * itemsPerPage + 1 }}</span>
                  {{ transStore.t('subscription.to') }}
                  <span class="font-semibold">{{ Math.min(currentPageClient * itemsPerPage, filteredClients.length) }}</span>
                  {{ transStore.t('subscription.of') }}
                  <span class="font-semibold">{{ filteredClients.length }}</span>
                  {{ transStore.t('subscription.results') }}
                </div>

                <div class="flex items-center gap-1">
                  <button
                      @click="currentPageClient--"
                      :disabled="currentPageClient === 1"
                      class="p-2 rounded-lg transition-all duration-200 border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
                  >
                    <font-awesome-icon icon="fas fa-chevron-left" class="w-5 h-5" />
                  </button>

                  <button
                      v-for="page in totalPages"
                      :key="page"
                      @click="currentPageClient = page"
                      :class="page === currentPageClient
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md border-teal-500 scale-105'
                : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'"
                      class="w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold border transition-all duration-200"
                  >
                    {{ page }}
                  </button>

                  <button
                      @click="currentPageClient++"
                      :disabled="currentPageClient === totalPages"
                      class="p-2 rounded-lg transition-all duration-200 border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
                  >
                    <font-awesome-icon icon="fas fa-chevron-right" class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>


    <!--    // Edit / Create Modal-->
      <BaseModal
          :is-open="isModalOpen"
          :disabled="isFormInvalid"
          :title="isEditing ? transStore.t('subscription.edit.title')  :  transStore.t('subscription.create.title') "
          :submit-text="isEditing ? transStore.t('subscription.edit.button'): transStore.t('subscription.create.button')"
          :loading="isSubmitting"
          is-large
          @close="isModalOpen = false; resetForm()"
          @save="handleFormSubmit"
      >
        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">

            <div class="md:col-span-8 flex flex-col">
              <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                {{ transStore.t('subscription.plan.name') }} <span class="text-red-500">*</span>
              </label>
              <input
                  v-model="form.name"
                  @input="validateName"
                  :class="errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#00C49F] '"
                  class="h-11 w-full border-2 px-4 rounded-xl text-sm transition-all outline-none"
                  :placeholder="transStore.t('subscription.professional.placeholder') "
              >
              <p v-if="errors.name" class="text-red-500 text-[10px] mt-1.5 font-bold ml-1 uppercase tracking-tight">
                {{ errors.name }}
              </p>
            </div>

            <div class="md:col-span-4 flex flex-col">
              <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                Tier <span class="text-red-500">*</span>
              </label>
              <select
                  v-model="form.tier"
                  :class="errors.tier ? 'border-red-400' : 'border-gray-200 focus:border-emerald-50'"
                  class="h-11 w-full border-2 px-3 rounded-xl text-sm bg-gray-50 outline-none transition-all cursor-pointer">
                <option value="" disabled selected> {{transStore.t('subscription.select.tier')}}</option>
                <option value="Basic"> {{transStore.t('subscription.basic')}}</option>
                <option value="Pro"> {{transStore.t('subscription.pro')}}</option>
              </select>
              <p v-if="errors.tier" class="text-red-500 text-[10px] mt-1.5 font-bold ml-1 uppercase tracking-tight">
                {{ errors.tier }}
              </p>
            </div>

            <div class="md:col-span-6 flex flex-col">
              <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">{{ transStore.t('subscription.description.label') }}</label>
              <input
                  v-model="form.description"
                  class="h-11 w-full border-2 border-gray-200 px-4 rounded-xl text-sm outline-none focus:border-[#00C49F] transition-all"
                  :placeholder="transStore.t('subscription.briefly.describe')"
              >
            </div>

            <div class="md:col-span-3 flex flex-col">
              <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">{{ transStore.t('subscription.discount') }}</label>
              <input
                  v-model="form.discount_percentage"
                  type="number"
                  class="h-11 w-full border-2 border-gray-200 px-4 rounded-xl text-sm outline-none focus:border-[#00C49F] transition-all"
                  placeholder="0">
            </div>

            <div class="md:col-span-3 flex flex-col">
              <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">{{ transStore.t('subscription.tax') }}</label>
              <input
                  v-model="form.tax_rate"
                  type="number"
                  step="0.01"
                  class="h-11 w-full border-2 border-gray-200 px-4 rounded-xl text-sm outline-none focus:border-[#00C49F] transition-all"
                  placeholder="0.00">
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-1.5">
                {{ transStore.t('subscription.original.price') }}  ({{ billingCycle }})
              </label>

              <div class="flex items-center bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-2.5">
                <span class="text-gray-400 font-bold mr-2">$</span>

                <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    class="no-spinner w-full border-0 bg-transparent p-0 text-gray-900 text-sm font-semibold focus:ring-0 outline-none"
                    v-model.number="displayPrice"
                >
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-1.5">
                {{ transStore.t('subscription.final.price') }}
              </label>
              <div class="flex items-center bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-2.5">
                <span class="text-[#00C49F] font-bold mr-2">$</span>
                <input
                    :value="Math.round(billingCycle === 'Yearly' ? calculatedYearlyTotal : calculatedMonthlyTotal)"
                    type="text"
                    disabled
                    class="w-full border-0 bg-transparent p-0 text-gray-500 text-sm font-bold outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-1.5">{{ transStore.t('subscription.visibility') }}</label>
              <label class="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <span class="text-xs font-bold text-gray-500 uppercase">{{ transStore.t('subscription.popular') }}</span>
                <input type="checkbox" v-model="form.is_popular" class="w-5 h-5 rounded border-gray-300 text-[#00C49F] focus:ring-0 accent-[#00C49F]">
              </label>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-4">{{ transStore.t('subscription.Resource') }}</label>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div v-for="field in ([
            { l: 'Users', m: 'user_limit' },
            { l: 'Tokens', m: 'ai_tokens_per_month' },
            { l: 'Mins', m: 'minutes_per_month' },
            { l: 'Agents', m: 'ai_agents_count' }
          ] as const)" :key="field.m">
                <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">{{ field.l }}</label>
                <input
                    v-model.number="form[field.m as keyof typeof form]"
                    type="number"
                    class="no-spinner w-full border-2 border-gray-100 p-2.5 rounded-xl text-sm font-medium outline-none focus:border-[#00C49F]"
                    placeholder="0"
                >
              </div>
            </div>
          </div>
        </div>
      </BaseModal>

    <!--    // Plans Detail Modal-->


      <BaseDetailModal
          :is-open="isViewModalOpen"
          :title="selectedItem ? transStore.t('subscription.plan.details')  : transStore.t('subscription.loading')"
          :item-id="selectedItem?.id"
          :show-submit="false"
          mode="view"
          @close="isViewModalOpen = false"
      >
        <div v-if="selectedItem && selectedItem.id" class="space-y-6">
          <div class="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div class="flex items-start gap-4">
              <div class="relative">
                <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center shadow-xl ring-4 ring-white">
                  <font-awesome-icon icon="fa-solid fa-layer-group" class="text-3xl text-teal-700" />
                </div>
                <div
                    :class="selectedItem.is_active ? 'bg-green-500 ring-4 ring-green-100' : 'bg-red-500 ring-4 ring-red-100'"
                    class="absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-2 border-white"
                ></div>
              </div>

              <div class="space-y-2">
                <div>
                  <div class="flex items-center gap-3">
                    <h4 class="text-2xl font-bold text-gray-900">{{ selectedItem.name }}</h4>
                    <span v-if="selectedItem.is_popular" class="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full uppercase border border-orange-200">
                {{ transStore.t('subscription.popular') }}
              </span>
                  </div>
                  <div class="flex items-center gap-3 mt-2">
              <span
                  :class="selectedItem.is_active ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'"
                  class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border"
              >
                <span :class="selectedItem.is_active ? 'bg-green-400' : 'bg-red-400'" class="w-2 h-2 rounded-full animate-pulse"></span>
                {{ selectedItem.is_active ? transStore.t('subscription.active') : transStore.t('subscription.inactive') }}
              </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{{ transStore.t('subscription.tier') }}</label>
                  <p class="text-sm font-semibold text-gray-900">{{ selectedItem.tier || '—' }}</p>
                </div>
                <div class="md:col-span-2">
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{{ transStore.t('subscription.description') }}</label>
                  <p class="text-sm font-medium text-gray-600">{{ selectedItem.description || 'No description provided.' }}</p>
                </div>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{{ transStore.t('subscription.base.price') }}</label>
                  <p class="text-lg font-bold text-gray-900">${{ selectedItem.price }}</p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{{ transStore.t('subscription.discount') }}</label>
                  <p class="text-lg font-bold text-emerald-600">{{ selectedItem.discount_percentage }}</p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{{ transStore.t('subscription.tax') }}</label>
                  <p class="text-lg font-bold text-gray-900">{{ selectedItem.tax_rate?.toLocaleString() }}</p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{{ transStore.t('subscription.monthly.total') }}</label>
                  <p class="text-lg font-bold text-blue-600">${{ selectedItem.total_price }}</p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{{ transStore.t('subscription.yearly.total') }}</label>
                  <p class="text-lg font-bold text-blue-600">${{ selectedItem.yearly_total_price }}</p>
                </div>
              </div>
            </div>
          </div>


          <div class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                <font-awesome-icon icon="fa-solid fa-gauge-high" class="w-5 h-5 text-orange-500" />
              </div>
              <h4 class="text-lg font-bold text-gray-900">{{ transStore.t('subscription.usage') }}</h4>
            </div>

            <div v-if="selectedItem.usage_limits && Object.keys(selectedItem.usage_limits).length" class="grid  grid-cols-2 lg:grid-cols-5 gap-4">
              <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 hover:shadow-sm transition-shadow flex flex-col justify-between">
                <label class="block text-xs font-medium text-blue-700 uppercase tracking-wider mb-1.5">{{ transStore.t('subscription.user.limit') }}</label>
                <p class="text-xl font-bold text-blue-700">{{ selectedItem.usage_limits.user_limit || 0 }}</p>
              </div>

              <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200 hover:shadow-sm transition-shadow">
                <label class="block text-xs font-medium text-green-700 uppercase tracking-wider mb-1.5">{{ transStore.t('subscription.api.calls') }}</label>
                <p class="text-xl font-bold text-green-700">{{ selectedItem.usage_limits.api_calls_per_month || 0 }}</p>
              </div>

              <div class="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-4 border border-cyan-200 hover:shadow-sm transition-shadow">
                <label class="block text-xs font-medium text-cyan-700 uppercase tracking-wider mb-1.5">{{ transStore.t('subscription.minutes') }}</label>
                <p class="text-xl font-bold text-cyan-700">{{ selectedItem.usage_limits.minutes_per_month || 0 }}</p>
              </div>

              <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200 hover:shadow-sm transition-shadow">
                <label class="block text-xs font-medium text-orange-700 uppercase tracking-wider mb-1.5">{{ transStore.t('subscription.ai.tokens') }}</label>
                <p class="text-xl font-bold text-orange-700">{{ selectedItem.usage_limits.ai_tokens_per_month || 0 }}</p>
              </div>

              <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200 hover:shadow-sm transition-shadow  flex flex-col justify-between">
                <label class="block text-xs font-medium text-purple-700 uppercase tracking-wider mb-1.5">{{ transStore.t('subscription.ai.agents') }}</label>
                <p class="text-xl font-bold text-purple-700  ">{{ selectedItem.usage_limits.ai_agents_count|| 0 }}</p>
              </div>
            </div>

            <div v-else
                 class="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p class="text-sm text-gray-400 italic">{{ transStore.t('subscription.no.limits') }}</p>
            </div>
          </div>

        </div>


      </BaseDetailModal>
    <!--    // Assignment Modal-->
      <BaseModal
          :is-open="isAssignModalOpen"
          :title="`Assign Plan to: ${selectedClient?.full_name || 'Client'}`"
          :submit-text="transStore.t('subscription.confirm.assignment')"
          :loading="isSubmitting"
          is-large
          @close="isAssignModalOpen = false"
          @save="handleAssignSubmit"
      >
        <div class="space-y-6">
          <div v-if="statusMessage.text"
               :class="statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'"
               class="flex items-center gap-2 py-2.5 px-4 rounded-xl border shadow-sm font-semibold text-sm transition-all">
            <font-awesome-icon :icon="statusMessage.type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation'" />
            {{ statusMessage.text }}
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">

            <div class="space-y-2">
              <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                {{ transStore.t('subscription.billing.cycle') }}
              </label>
              <select
                  v-model="assignForm.billing_cycle"
                  class="h-11 w-full border-2 border-gray-100 px-3 rounded-xl text-sm bg-gray-50 outline-none focus:border-teal-500 transition-all cursor-pointer"
              >
                <option v-for="type in subscriptionTypes" :key="type.id" :value="type.name">
                  {{ type.name }}
                </option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                {{ transStore.t('subscription.start.date') }}
              </label>
              <input
                  type="date"
                  v-model="assignForm.start_date"
                  class="h-11 w-full border-2 border-gray-100 px-3 rounded-xl text-sm bg-gray-50 outline-none focus:border-teal-500 transition-all"
              />
            </div>

            <div class="md:col-span-2 space-y-2">
              <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                {{ transStore.t('subscription.subscription') }}
              </label>
              <select
                  v-model="assignForm.plan_id"
                  class="h-11 w-full border-2 border-gray-100 px-3 rounded-xl text-sm bg-gray-50 outline-none focus:border-teal-500 transition-all cursor-pointer"
              >
                <option :value="null" disabled>-- Select Plan --</option>
                <option v-for="plan in activePlans" :key="plan.id" :value="plan.id">
                  {{ plan.name }}
                </option>
              </select>
            </div>

            <div class="md:col-span-2 pt-2 ml-1 flex items-center gap-3">
              <label class="flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    v-model="assignForm.auto_renew"
                    class="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500 transition-all"
                >
              </label>

              <span class="text-xs font-bold text-gray-600 uppercase tracking-tighter">
   {{ transStore.t('subscription.auto.renew') }}
  </span>
            </div>

          </div>
        </div>
      </BaseModal>

    <!--    // Delete Modal-->
      <BaseModal
        :is-open="isDeleteModalOpen"
        :loading="isSubmitting"
        :title="transStore.t('subscription.delete.modal.title')"
        :submitText="transStore.t('subscription.confirm.delete')"
        mode="delete"
        @close="isDeleteModalOpen = false"
        @save="handleConfirmDelete"
    >
      <div class="text-center p-0">
        <div v-if="statusMessage.text"
             :class="statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'"
             class="flex items-center gap-2 py-2 px-3 mb-6 rounded-lg shadow-sm border text-[0.9rem] font-semibold text-left">
          <font-awesome-icon :icon="statusMessage.type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation'" />
          {{ statusMessage.text }}
        </div>
        <p class="text-gray-600 mb-4">
          {{ transStore.t('subscription.delete.title') }}
          <span class="font-semibold text-gray-900">"{{ selectedItem?.name }}"</span>
        </p>

        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-left">
          <div class="flex items-start gap-3">
            <font-awesome-icon
                icon="fa-solid fa-triangle-exclamation"
                class="text-yellow-600 mt-0.5 flex-shrink-0"
            />
            <p class="text-sm text-yellow-700">
              {{ transStore.t('subscription.delete.description') }}
            </p>
          </div>
        </div>
      </div>
    </BaseModal>

    <!--   // End Assign Modal-->
      <BaseModal
        :is-open="isEndAssignModalOpen"
        :title="`End Subscription for: ${selectedClient?.full_name || 'Client'}`"
        :submit-text="transStore.t('subscription.confirm.end.assignment')"
        :loading="isSubmitting"
        @close="isEndAssignModalOpen = false"
        @save="handleEndSubmit"
    >
      <div class="space-y-4">
        <div v-if="statusMessage.text"
             :class="statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'"
             class="flex items-center gap-2 py-2 px-3 rounded-lg border shadow-sm font-semibold text-sm mb-4">
          <font-awesome-icon :icon="statusMessage.type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation'" />
          {{ statusMessage.text }}
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase mb-2">{{ transStore.t('subscription.reason') }}</label>

          <textarea
              v-model="endAssignForm.reason"
              @input="statusMessage.text = ''"
              :placeholder="transStore.t('subscription.placeholder.endassign')"
              :class="[
        'w-full border-2 p-2.5 rounded-lg text-sm outline-none min-h-[100px] transition-colors duration-200',
        statusMessage.text && statusMessage.type === 'error'
          ? 'border-red-400 focus:border-red-500'
          : 'border-gray-100 focus:border-emerald-500'
      ]"
          ></textarea>
        </div>

          <div class="grid grid-cols-1 gap-4 mt-4">
            <div class="p-3 bg-red-50 rounded-xl border border-red-100">
              <label class="flex items-center gap-3 cursor-pointer group">
        <span class="relative flex items-center">
         <input
            type="checkbox"
            v-model="endAssignForm.immediate"
            class="w-5 h-5 rounded border-red-300 text-red-600 focus:ring-red-500 accent-red-600">
        </span>
                <span class="block">
        <span class="block text-xs font-bold text-red-700 uppercase tracking-tight">{{ transStore.t('subscription.end') }}</span>
        <span class="block text-[10px] text-red-500 leading-tight">{{ transStore.t('subscription.end.description') }}</span>
        </span>
              </label>
            </div>
          </div>


        <div class="bg-amber-50 p-3 rounded-lg border border-amber-200 flex items-start gap-3">
          <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="text-amber-500 mt-0.5" />
          <p class="text-[11px] text-amber-800 leading-normal">
            <b>{{ transStore.t('subscription.warning') }}</b> {{ transStore.t('subscription.warning.description') }}
          </p>
        </div>

      </div>
    </BaseModal>

      <!--Assign View Modal-->

      <BaseModal
          :is-open="isSubscriptionModalOpen"
          :title="selectedSubscription ? transStore.t('subscription.assign.view.title')   :transStore.t('subscription.loading')  "
          :item-id="selectedSubscription?.id"
          :show-submit="false"
          mode="view"
          @close="isSubscriptionModalOpen = false"
      >
        <div v-if="selectedSubscription " class="space-y-6">

          <div class="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div class="flex items-start gap-4">
              <div class="relative">
                <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center shadow-xl ring-4 ring-white">
                  <font-awesome-icon icon="fa-solid fa-building" class=" w-12 h-12 text-3xl text-teal-700" />
                </div>
                <div
                    :class="selectedSubscription.status ? 'bg-green-500 ring-4 ring-green-100' : 'bg-rose-500 ring-4 ring-rose-100'"
                    class="absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-2 border-white"
                ></div>
              </div>

              <div class="space-y-2">
                <div>
                  <div class="flex items-center gap-3">
                    <h4 class="text-2xl font-bold text-gray-900">{{ selectedSubscription.client_details?.company_name }}</h4>
                    <span v-if="selectedSubscription.is_trial" class="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase border border-amber-200">
                Trial Mode
              </span>
                  </div>
                  <p class="text-sm text-gray-500 mt-1">{{ selectedSubscription.client_details?.email }}</p>
                  <div class="flex items-center gap-3 mt-2">
              <span
                  :class="selectedSubscription.status ? 'bg-green-100 text-green-800 border-green-200' : 'bg-rose-100 text-rose-800 border-rose-200'"
                  class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border"
              >
                <span :class="selectedSubscription.status ? 'bg-green-400' : 'bg-rose-400'" class="w-2 h-2 rounded-full animate-pulse"></span>
                {{ selectedSubscription.status ? 'Active Subscription' : 'Inactive' }}
              </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200 hover:shadow-sm transition-shadow">
              <label class="block text-xs font-medium text-orange-700 uppercase tracking-wider mb-1.5"> {{transStore.t('subscription.days.left')}}</label>
              <p class="text-xl font-bold text-orange-700">{{ selectedSubscription.days_remaining }}</p>
            </div>

            <div class="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-4 border border-cyan-200 hover:shadow-sm transition-shadow">
              <label class="block text-xs font-medium text-cyan-700 uppercase tracking-wider mb-1.5">{{transStore.t('subscription.plan')}}</label>
              <p class="text-xl font-bold text-cyan-700 ">{{ selectedSubscription.plan_details?.name }}</p>
            </div>
            <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200 hover:shadow-sm transition-shadow">
              <label class="block text-xs font-medium text-green-700 uppercase tracking-wider mb-1.5">{{ selectedSubscription.billing_cycle || '—' }} {{transStore.t('subscription.rate')}}</label>
              <p class="text-xl font-bold text-green-700">{{ selectedSubscription.currency }} {{ selectedSubscription.amount }}</p>
            </div>

            <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200 hover:shadow-sm transition-shadow">
              <label class="block text-xs font-medium text-purple-700 uppercase tracking-wider mb-1.5">{{transStore.t('subscription.ai.agen')}}</label>
              <p class="text-xl font-bold text-purple-700">{{ selectedSubscription.plan_details?.ai_agents_count }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-6">

            <div class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  <font-awesome-icon icon="fa-solid fa-calendar-alt" class="w-7 h-7 text-blue-500" />
                </div>
                <h4 class="text-lg font-bold text-gray-900">{{transStore.t('subscription.period.billing')}}</h4>
              </div>

              <div class="grid grid-cols-3 gap-6">
                <div>
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{{transStore.t('subscription.start.date')}}</label>
                  <p class="text-sm font-semibold text-gray-900">{{ selectedSubscription.start_date }}</p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5"> {{transStore.t('subscription.renewal.date')}}</label>
                  <p class="text-sm font-semibold text-gray-900">{{ selectedSubscription.end_date }}</p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{{transStore.t('subscription.billing.cycle')}}</label>
                  <p class="text-sm font-semibold text-gray-900 uppercase">{{ selectedSubscription.billing_cycle || '—' }}</p>
                </div>
              </div>
            </div>

            <div v-if="selectedSubscription.latest_invoice" class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center">
                  <font-awesome-icon icon="fa-solid fa-file-invoice-dollar" class="w-7 h-7 text-teal-500" />
                </div>
                <h4 class="text-lg font-bold text-gray-900"> {{transStore.t('subscription.latest.invoice')}}</h4>
              </div>

              <div class="grid grid-cols-3 gap-6">
                <div>
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{{transStore.t('subscription.Invoice.number ')}}</label>
                  <p class="text-sm font-semibold text-gray-900">{{ selectedSubscription.latest_invoice.invoice_number }}</p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5"> {{transStore.t('subscription.total.amo')}}</label>
                  <p class="text-sm font-semibold text-emerald-600">{{ selectedSubscription.currency }} {{ selectedSubscription.amount }}</p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{{transStore.t('subscription.payment.stat')}}</label>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
              {{ selectedSubscription.latest_invoice.status }}
            </span>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <font-awesome-icon icon="fa-solid fa-receipt" class="w-8 h-8 text-gray-300 mb-2" />
              <p class="text-sm text-gray-400 italic"> {{transStore.t('subscription.no.invoice')}}</p>
            </div>

          </div>
        </div>

        <div v-else class="flex items-center justify-center h-80">
          <div class="text-center space-y-4">
            <font-awesome-icon icon="fa-solid fa-alert" class="w-12 h-12 mx-auto text-gray-300 animate-spin" />
            <div>
              <p class="text-gray-500 font-medium">{{ transStore.t('subscription.synchronizing') }}</p>
              <p class="text-sm text-gray-400 mt-1">{{ transStore.t('subscription.sync.description') }}</p>
            </div>
          </div>
        </div>
      </BaseModal>
      <!--Payment @save="handleConfirmToggle" Modal-->
      <BaseModal
          :is-open="isPaymentModalOpen"
          :title="transStore.t('subscription.update.payment.title')"
          :submit-text="transStore.t('subscription.button.update')"
          :loading="isSubmitting"
          @close="isPaymentModalOpen = false"
          @save="handlePaymentStatusUpdate"
      >
        <div class="space-y-5 py-2">
          <div class="p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
            <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{{ transStore.t('subscription.target.client') }}</div>
            <div class="text-sm font-bold text-gray-900">{{ selectedItemForPayment?.full_name }}</div>
<!--            <div class="text-[10px] text-teal-600 font-medium italic">-->
<!--              {{ selectedItemForPayment?.subscription_plan_id ? `Plan ID: #${selectedItemForPayment.subscription_plan_id}` : 'No plan currently assigned' }}-->
<!--            </div>-->
          </div>

          <div class="flex flex-col">
            <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
              {{ transStore.t('subscription.payment.status') }}
            </label>
            <div class="relative">
              <select
                  v-model="newStatus"
                  class="w-full h-12 pl-4 pr-10 border-2 border-gray-200 rounded-xl text-sm focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none appearance-none bg-white font-semibold"
              >
                <option v-for="status in paymentOptions" :key="status" :value="status">
                  {{ status }}
                </option>
              </select>

              <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400">
                <font-awesome-icon icon="fa-solid fa-chevron-down" class="text-[10px]" />
              </div>
            </div>
          </div>
        </div>
      </BaseModal>


      <BaseModal
          :is-open="isToggleModalOpen"
          :loading="isSubmitting"
          :title="transStore.t('subscription.subscription.plan.update')"
          :submitText="transStore.t('subscription.confirm')"
          @close="isToggleModalOpen = false"
          @save="handleConfirmToggle"
          mode="toggle"
      >
        <div class="text-center p-0">

          <h3 class="text-xl font-bold text-gray-900 mb-2"> {{ transStore.t('subscription.update.status') }}</h3>
          <p class="text-gray-500 px-6 mb-2 text-[0.95rem] leading-relaxed">
            {{ transStore.t('subscription.update.description') }}
            <span class="font-bold text-gray-800">"{{ selectedItem?.name }}"</span>.
          </p>
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
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.pricing-card {
  box-shadow: 0 8px 24px rgba(149, 157, 165, 0.15);
}

.pricing-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175);
}

.pulse {
  animation: shadow-pulse 1.5s infinite;
}

@keyframes shadow-pulse {
  0% { box-shadow: 0 0 0 0px rgba(34, 197, 94, 0.4); }
  100% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
}

</style>

