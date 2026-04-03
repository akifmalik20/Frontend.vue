import { ref, computed, reactive, watch, onMounted } from 'vue';
import { useSubscriptionStore } from '@/stores/subscriptionStore.js';
import { useAuthStore } from '@/stores/authStore';
import { useModuleBreadcrumb } from '@/composables/useModuleBreadcrumb';
import { useTranslationStore } from '@/stores/translationStore';

// Types and Interfaces
interface PlanForm {
    name: string;
    tier: string;
    description: string;
    price: number;
    subscription_type_id: number | null;
    user_limit: number;
    api_calls_per_month: number;
    ai_tokens_per_month: number;
    ai_agents_count: number;
    minutes_per_month: number;
    is_active: boolean;
    is_popular: boolean;
    sort_order: number;
    discount_percentage: number;
    display_price: number,
    yearly_discounted_price: number;
    total_price: number;
    discounted_price: number;
    monthly_total_price: number,
    yearly_total_price: number,
    tax_rate: number;
}

interface Plan {
    id: number;
    name: string;
    tier: string;
    description: string;
    price: number;
    display_price?: string;
    subscription_type_id: number;
    user_limit: number;
    api_calls_per_month: number;
    ai_tokens_per_month: number;
    ai_agents_count: number;
    minutes_per_month: number;
    is_active: boolean;
    is_popular: boolean;
    sort_order: number;
    discount_percentage: number;
    period?: string;
    tax_rate: number;
    total_price: number;
    tax_amount: number;
    [key: string]: any;
}

interface SubscriptionResponse {
    data?: {
        plans?: Plan[];
        [key: string]: any;
    };
    [key: string]: any;
}

interface SubscriptionType {
    id: number;
    name: string;
    description?: string;
    [key: string]: any;
}

interface ClientItem {
    id: number | string;
    subscription_plan_id?: number | string | null;
    payment_status: string;
    full_name: string;
    subscription_plan_name?: string;
}

export function useSubscriptionModule() {
    const authStore = useAuthStore();
    const subStore = useSubscriptionStore();
    const { isChildModule, breadcrumbItems } = useModuleBreadcrumb();
    const transStore = useTranslationStore();

    const isAdmin = computed(() => authStore.isAdmin);

    // --- State Management ---
    const selectedItemForPayment = ref<ClientItem | null>(null);
    const isPaymentModalOpen = ref(false);
    const newStatus = ref('');
    const billingCycle = ref('Monthly');
    const selectedClient = ref<any>(null);
    const isFetchingSubscription = ref(false);
    const isFetchingPlan = ref(false);
    const activeTab = ref('plans');
    const selectedSubscription = ref<any>(null);
    const isSubscriptionModalOpen = ref(false);
    const scrollContainer = ref<HTMLDivElement | null>(null);
    const statusMessage = ref({ text: '', type: '' });
    const isModalOpen = ref(false);
    const isEditing = ref(false);
    const isSubmitting = ref(false);
    const selectedItem = ref<any>(null);
    const isDeleteModalOpen = ref(false);
    const searchQuery = ref('');
    const currentPage = ref(1);
    const isAssignModalOpen = ref(false);
    const isEndAssignModalOpen = ref(false);
    const isViewModalOpen = ref(false);
    const isToggleModalOpen=ref(false);
    const isLoading = ref(true); // Start as true
    // Client-specific pagination (separate from plans searchQuery/currentPage)
    const searchQueryClient = ref('');
    const currentPageClient = ref(1);
    const itemsPerPage = ref(10);
    const tabs = [
        { id: 'plans', label: 'Subscription Plans', icon: 'fa-solid fa-layer-group' },
        { id: 'assignments', label: 'Client Assignments', icon: 'fa-solid fa-users-gear' }
    ];
    const isTableLoading = ref(false);
    const assignForm = reactive({
        client_id: null as number | null,
        plan_id: null as number | null,
        billing_cycle: 'Monthly',
        payment_status: 'Pending',
        start_date: new Date().toISOString().split('T')[0],
        is_trial: false,
        auto_renew: true
    });

    const form = reactive<PlanForm>({
        name: '', tier: '', description: '', price: 0, subscription_type_id: 1,
        user_limit: 1, api_calls_per_month: 0, ai_tokens_per_month: 0, ai_agents_count: 0,
        minutes_per_month: 0, is_active: true, is_popular: false, discount_percentage: 0,
        sort_order: 0, display_price: 0, yearly_discounted_price: 0, monthly_total_price: 0,
        yearly_total_price: 0, discounted_price: 0, total_price: 0, tax_rate: 0
    });

    const errors = reactive({ name: '', tier: '' });

    const toastMessage = ref<{
        title: string; messages: string[]; type: 'success' | 'error' | 'info' | '';
    }>({ title: '', messages: [], type: '' });

    // --- Computed ---
    const plansList = computed(() => {
        const subscriptions = subStore.subscriptions as SubscriptionResponse;
        return subscriptions?.data?.plans || [];
    });

    const paymentOptions = computed(() => {
        const subscriptions = subStore.subscriptions as any;
        return subscriptions?.data?.payment_options || [];
    });

    const subscriptionTypes = computed<SubscriptionType[]>(() => {
        const subs = subStore.subscriptions as SubscriptionResponse;
        return subs?.data?.subscription_types || [
            { id: 1, name: 'Monthly' },
            { id: 2, name: 'Yearly' }
        ];
    });

    const sortedSubscriptions = computed(() => {
        const search = searchQuery.value.trim().toLowerCase();
        const filtered = plansList.value.filter(item => {
            if (!item) return false;
            const matchesSearch = item.name?.toLowerCase().includes(search) || item.tier?.toLowerCase().includes(search);
            let expectedTypeId = billingCycle.value === 'Yearly' ? 2 : 1;
            return matchesSearch && (!item.subscription_type_id || item.subscription_type_id === expectedTypeId);
        });
        return [...filtered].sort((a, b) => {
            if (search.length > 0) return (a.sort_order ?? 9999) - (b.sort_order ?? 9999);
            if (a.is_popular !== b.is_popular) return b.is_popular ? 1 : -1;
            return (a.sort_order ?? 9999) - (b.sort_order ?? 9999);
        });
    });

    const isFormInvalid = computed(() => !!errors.name || !!errors.tier || !form.name || !form.tier);

    // --- Methods ---
    const showToast = (title: string, messages: string[], type: 'success' | 'error' | 'info') => {
        toastMessage.value = { title, messages, type };
        const timeout = type === 'error' ? 8000 : 5000;
        setTimeout(() => {
            if (toastMessage.value.title === title) {
                toastMessage.value = { title: '', messages: [], type: '' };
            }
        }, timeout);
    };

    const resetForm = () => {
        Object.assign(form, {
            name: '', tier: '', description: '', price: 0, user_limit: 1,
            api_calls_per_month: 0, ai_tokens_per_month: 0, ai_agents_count: 0,
            minutes_per_month: 0, is_active: true, is_popular: false,
            discount_percentage: 0, discounted_price: 0, tax_rate: 0,
            display_price: 0, yearly_discounted_price: 0, monthly_total_price: 0,
            yearly_total_price: 0, total_price: 0
        });
        errors.name = '';
        errors.tier = '';
        selectedItem.value = null;

        isEditing.value = false;
    };

    const validateName = () => {
        const onlyLetters = /^[A-Za-z\s]+$/;
        if (!form.name.trim()) errors.name = transStore.t('subscription.validation.name') ;
        else if (!onlyLetters.test(form.name)) errors.name = transStore.t('subscription.letters.only') ;
        else if (form.name.trim().length < 2) errors.name =  transStore.t('subscription.validation.short') ;
        else errors.name = "";
    };

    const validateTier = () => { errors.tier = !form.tier ? transStore.t('subscription.select.tier') : ""; };

    const handleFormSubmit = async () => {
        validateName(); validateTier();
        if (isFormInvalid.value) {
            showToast(transStore.t('toast.validation.error'), [transStore.t('subscription.fix.error')], 'error');
            return;
        }
        isSubmitting.value = true;
        try {
            let response;
            if (isEditing.value && selectedItem.value?.id) {
                response = await subStore.updateSubscriptionPlan(selectedItem.value.id, { ...form });
            } else {
                response = await subStore.createSubscriptionPlan({ ...form });
            }
            showToast(transStore.t('toast.success'), [response?.message || transStore.t('subscription.plan.save')], 'success');
            setTimeout(async () => {
                isModalOpen.value = false;
                await subStore.fetchSubscriptionList();
            }, 1000);
        } catch (error: any) {
            const responseData = error.response?.data || error;
            showToast(transStore.t('toast.error'), [responseData?.message ||transStore.t('subscription.error.occured')], 'error');
        } finally { isSubmitting.value = false;
        }
    };
    // Add these to your computed section in useSubscriptionModule
    const calculatedMonthlyTotal = computed(() => {
        const price = billingCycle.value === 'Yearly' ? form.price : form.price;
        const discount = (form.discount_percentage / 100) * price;
        const discountedPrice = price - discount;
        const tax = (form.tax_rate / 100) * discountedPrice;
        return discountedPrice + tax;
    });

    const calculatedYearlyTotal = computed(() => {
        // Yearly is usually (MonthlyPrice * 12) - Discount + Tax
        const annualBase = form.price * 12;
        const discount = (form.discount_percentage / 100) * annualBase;
        const discountedPrice = annualBase - discount;
        const tax = (form.tax_rate / 100) * discountedPrice;
        return discountedPrice + tax;
    });

    const handleConfirmDelete = async () => {
        if (!selectedItem.value || isSubmitting.value) return;
        isSubmitting.value = true;
        try {
            const response = await subStore.deleteSubscriptionPlan(selectedItem.value.id);
            showToast(transStore.t('toast.success'), [response?.message || transStore.t('subscription.plan.deleted')], 'success');
            setTimeout(async () => {

                isDeleteModalOpen.value = false;
                await subStore.fetchSubscriptionList();
                selectedItem.value = null;
            }, 1000);
        } catch (error: any) {
            showToast(transStore.t('toast.error'), [error.response?.data?.message], 'error');
        } finally { isSubmitting.value = false; }
    };

    const getCorrectPlanId = (item: any) => {
        if (item.current_subscription?.plan_details) return item.current_subscription.plan_details.id;
        if (item.subscription_plan_id) return item.subscription_plan_id;
        if (item.subscription_plan_name && plansList.value) {
            return plansList.value.find(p => p.name === item.subscription_plan_name)?.id || null;
        }
        return null;
    };

    const handlePaymentStatusUpdate = async () => {
        if (!selectedItemForPayment.value) return;
        isSubmitting.value = true;
        try {
            const item = selectedItemForPayment.value;
            const payload = {
                client_id: item.id,
                plan_id: getCorrectPlanId(item),
                payment_status: newStatus.value
            };
            const responseData = await subStore.updatePaymentStatus(payload);
            showToast(transStore.t('toast.success'), [responseData.message || transStore.t('subscription.update.success')], 'success');
            isPaymentModalOpen.value = false;
            await subStore.fetchClients();
        } catch (error: any) {
            showToast(transStore.t('toast.error'), [error.response?.data?.message || transStore.t('subscription.update.failed')], 'error');
        } finally { isSubmitting.value = false; }
    };


// --- Assignment Methods ---
    const openAssignModal = (client: any) => {
        selectedClient.value = client;
        assignForm.client_id = client.id;
        assignForm.plan_id = client.current_subscription?.id || null;
        statusMessage.value = { text: '', type: '' };
        isAssignModalOpen.value = true;
    };

    const handleAssignSubmit = async () => {
        if (!assignForm.plan_id || !assignForm.client_id) {
            showToast(transStore.t('toast.validation.error'), [transStore.t('subscription.plan.selected')], 'error');
            return;
        }

        const selectedType = subscriptionTypes.value.find(type => type.name === assignForm.billing_cycle);
        if (!selectedType?.id) {
            showToast(transStore.t('toast.validation.error'), [transStore.t('subscription.invalid.cycle')], 'error');
            return;
        }
console.log('billing cycle', assignForm.billing_cycle);
        isSubmitting.value = true;
        try {
            const response = await (subStore as any).subscriptionPlanAssign({
                client_id: assignForm.client_id,
                plan_id: assignForm.plan_id,
                billing_cycle: assignForm.billing_cycle,
                subscription_type_id: selectedType.id,
                payment_status: assignForm.payment_status,
                start_date: assignForm.start_date,
                is_trial: assignForm.is_trial,
                auto_renew: assignForm.auto_renew
            });

            showToast(transStore.t('toast.success'), [response?.message], 'success');
            setTimeout(async () => {

                isAssignModalOpen.value = false;
                await subStore.fetchClients();
                assignForm.plan_id = null;
            }, 300);
        } catch (error: any) {
            const responseData = error.response?.data || error;
            showToast(transStore.t('toast.error'), [responseData?.message || transStore.t('subscription.assign.error')], 'error');
        } finally {
            isSubmitting.value = false;
        }
    };

    // --- End Assignment Methods ---
    const endAssignForm = reactive({
        client_id: null as number | null,
        subscription_id: null as number | null,
        reason: '',
        immediate: false
    });

    const openEndAssignmentModal = (client: any) => {
        statusMessage.value = { text: '', type: '' };
        selectedClient.value = client;
        endAssignForm.client_id = client.id;
        const sub = client.current_subscription;
        endAssignForm.subscription_id = (sub && typeof sub === 'object') ? sub.id : sub;
        endAssignForm.reason=""
        endAssignForm.immediate = false;
        isEndAssignModalOpen.value = true;
    };

    const handleEndSubmit = async () => {
        if (!endAssignForm.subscription_id) {
            showToast(transStore.t('toast.error'), [transStore.t('subscription.no.active.sub')], 'error');
            return;
        }
        isSubmitting.value = true;
        try {
            const response = await subStore.endAssignment(endAssignForm.subscription_id, {
                reason: endAssignForm.reason,
                immediate: endAssignForm.immediate
            });
            showToast(transStore.t('toast.success'), [response?.message], 'success');
            setTimeout(async () => {
                isEndAssignModalOpen.value = false;
                await subStore.fetchClients();

            }, 300);
        } catch (error: any) {
            showToast(transStore.t('toast.error'), [transStore.t('subscription.validation.reason')], 'error');
            statusMessage.value = {
                text:transStore.t('subscription.validation.reason'),
                type: 'error'
            };
        } finally {
            isSubmitting.value = false;
        }
    };

    const openSubscriptionViewModal = async (clientId: string | number) => {
        isSubmitting.value = true;

        isFetchingSubscription.value = true;
        try {
            const response = await subStore.getSubscriptionByClient(clientId);
            if (response?.success) {
                selectedSubscription.value = response.data;
                isSubscriptionModalOpen.value = true;
            }
        } catch (error) {
            showToast(transStore.t('toast.error'), [transStore.t('subscription.no.sub')], 'error');
        } finally {
            isSubmitting.value = false;
            isFetchingSubscription.value = false;
        }
    };

    const openViewModal = (sub: any) => {
        // 1. Assign the data directly from the list item
        selectedItem.value = sub;

        // 2. Open the modal immediately
        isViewModalOpen.value = true;
    };
    const openPaymentModal = (item: any) => {
        selectedItemForPayment.value = item;
        const correctId = getCorrectPlanId(item);
        if (correctId && selectedItemForPayment.value) {
            selectedItemForPayment.value.subscription_plan_id = correctId;
        }
        newStatus.value = item.payment_status || 'Pending';
        isPaymentModalOpen.value = true;
        isSubscriptionModalOpen.value = false;
    };


    const showScrollButtons = computed(() => {
        return sortedSubscriptions.value.length > 3;
    });
    const displayPrice = computed({
        get() {
            return billingCycle.value === 'Yearly' ? form.price * 12 : form.price;
        },
        set(val: number) {
            form.price = billingCycle.value === 'Yearly' ? val / 12 : val;
        }
    });
    const filteredPlans = computed(() => {
        console.log("Showing all plans:", plansList.value);
        return plansList.value;
    });

    const handleConfirmToggle = async () => {
        // 1. Safety check: Ensure an item is selected and we aren't already submitting
        if (!selectedItem.value || isSubmitting.value) return;

        isSubmitting.value = true;

        try {
            // 2. Call the subscription service/store
            // We pass the ID and the current status (the backend usually flips it)
            console.log(selectedItem.value.id);
            const response = await subStore.toggleSubscriptionStatus(
                selectedItem.value.id,
                selectedItem.value.is_active
            );

            if (response && response.success) {
                // 3. Success Notification with direct strings
                const successMsg = response?.message || transStore.t('subscription.status.updated') ;
                showToast(transStore.t('toast.success'), [successMsg], 'success');

                // 4. Close the modal after a brief delay
                setTimeout(() => {
                    isToggleModalOpen.value = false;
                    selectedItem.value = null;
                }, 150);

            } else {
                // Handle cases where the API returns success: false
                throw new Error(response.message || transStore.t('subscription.fail.update'));
            }
        } catch (error: any) {
            // 5. Error Handling
            const errorTitle = transStore.t('toast.error');
            const errorMessage = error.response?.data?.message ||transStore.t('subscription.permission.error') ;
            const errorDetail = error.response?.data?.detail || "";

            showToast(errorTitle, [errorMessage, errorDetail], 'error');
        } finally {
            // 6. Reset loading state regardless of outcome
            isSubmitting.value = false;
        }
    };
    // Watcher
    watch(() => assignForm.billing_cycle, () => {
        assignForm.plan_id = null;
    });
    // --- Other Utility Methods (Simplified for brevity, following your logic) ---
    const openAddModal = () => { isEditing.value = false; resetForm(); isModalOpen.value = true; };
    const openEditModal = (sub: any) => { isEditing.value = true; selectedItem.value = sub;Object.assign(form, { ...sub }); isModalOpen.value = true; };
    const openDeleteModal = (sub: any) => { selectedItem.value = sub;         console.log("Sub Data:", sub);
        isDeleteModalOpen.value = true; };
    const scrollLeft = () => scrollContainer.value?.scrollBy({ left: -360, behavior: 'smooth' });
    const scrollRight = () => scrollContainer.value?.scrollBy({ left: 360, behavior: 'smooth' });

    const openToggleModal = (sub: any) => {
        selectedItem.value = sub;
        console.log("Sub Data:", sub);
        isToggleModalOpen.value = true;
    };
    const activePlans = computed(() => {
        return filteredPlans.value.filter(plan => plan.is_active === true);
    });
    const totalPrice = computed(() =>
        Math.round(
            billingCycle.value === 'Yearly'
                ? form.yearly_total_price
                : form.monthly_total_price
        )
    );
    const handleTabClick = (tabId:any) => {
        activeTab.value = tabId;

        // Assuming the second tab has an ID of 'clients' or index 1
        if (tabId === 'assignments') {
            gettingClients();
        }
        // else {
        //     gettingPlans();
        // }
    };
    const gettingClients = async () => {
        // Only fetch if we don't have clients yet OR if you want to force refresh
        if (subStore.clients && subStore.clients.length > 0) {
            console.log("client Data:", subStore.clients.length);
            return;
        }


        try {
            isTableLoading.value = true;
            await subStore.fetchClients();
        } catch (error) {
            console.error("Failed to sync data:", error);
        } finally {
            isTableLoading.value = false;
        }
    };


    onMounted(async () => {

        if (subStore.subscriptions && Object.keys(subStore.subscriptions).length > 0) {
            console.log("return sub Data:", subStore.subscriptions.length);
isLoading.value = false;
            return;
        }
        console.log("Sub Data:", subStore.subscriptions.length);
        try {
            console.log("try block")

            isLoading.value = true;
            await subStore.fetchSubscriptionList()
        } catch (error) {
            console.error("Failed to sync data:", error);
        } finally {
            isLoading.value = false;
        }
    });
// --- Client Filtering & Pagination ---
    const filteredClients = computed(() => {
        const query = searchQueryClient.value?.toLowerCase().trim();
        const list = (subStore.clients || []) as any[];
        if (!query) return list;
        return list.filter(item =>
            Object.values(item).some(val =>
                val !== null && val !== undefined &&
                String(val).toLowerCase().includes(query)
            )
        );
    });

    const totalPages = computed(() =>
        Math.ceil(filteredClients.value.length / itemsPerPage.value) || 1
    );

    const paginatedClients = computed(() => {
        const start = (currentPageClient.value - 1) * itemsPerPage.value;
        const end = start + itemsPerPage.value;
        const data = filteredClients.value.slice(start, end);
        if (data.length === 0 && currentPageClient.value > 1) currentPageClient.value--;
        return data;
    });


    // Return everything needed by the template
    return {
        // State
        isAdmin,
        isChildModule,
        breadcrumbItems,
        activeTab,
        tabs,
        handleTabClick,
        gettingClients,
        searchQuery,
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
        plansList,
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
        validateTier,
        scrollLeft,
        scrollRight,
        showToast,

        showScrollButtons,
        subStore,
        displayPrice,
        filteredPlans,
        openToggleModal,
        isToggleModalOpen,
        handleConfirmToggle,
        activePlans,
        totalPrice,
        calculatedMonthlyTotal,
        calculatedYearlyTotal,
        isLoading,
        isTableLoading,
        isFetchingPlan,
        transStore,
        searchQueryClient,
        currentPageClient,
        itemsPerPage,
        filteredClients,
        paginatedClients,
        totalPages,
    };

}