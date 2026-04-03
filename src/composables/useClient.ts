import { ref, computed, onMounted, reactive, watch } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import { useTranslationStore } from '@/stores/translationStore';

// Types/Interfaces
export interface RoleGroup {
    id: number;
    name: string;
}

export interface Client {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    email: string;
    phone?: string;
    company_name?: string;
    avatar?: string | null;
    is_active: boolean;
    role_groups_list?: RoleGroup[];
    language?: number;
    language_name?: string;
    last_login?: string | null;
    created_at?: string;
    updated_at?: string;
    created_by_name?: string;
    total_users?: number;
    total_active_users?: number;
    subscription_status?: string;
    subscription_plan_name?: string;
    plan_tier?: string;
    plan_price?: string;
    plan_period?: string;
    current_api_calls?: number;
    current_minutes?: number;
    current_ai_tokens?: number;
    current_ai_agents?: number;
    next_billing_date?: string | null;
}

export interface ToastMessage {
    title: string;
    messages: string[];
    type: 'success' | 'error' | 'info' | '';
}

export interface ToggleConfirmData {
    client: Client | null;
    newStatus: boolean;
}

export interface CreateFormData {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirm_password: string;
    phone: string;
    company_name: string;
    role_group_ids: number[];
    language: number | null;
    is_active: boolean;
}

export interface LocalErrors {
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
}

export function useClient() {
    const clientStore = useUserStore();
    const authStore = useAuthStore();
    const transStore = useTranslationStore();

    // State
    const searchQuery = ref('');
    const searchInput = ref('');
    const isSubmitting = ref(false);
    const isCreateModalOpen = ref(false);
    const isEditMode = ref(false);
    const editingClientId = ref<number | null>(null);
    const isViewModalOpen = ref(false);
    const selectedClient = ref<Client | null>(null);
    const showToggleConfirm = ref(false);
    const isTogglingStatus = ref(false);
    const toggleConfirmData = ref<ToggleConfirmData>({
        client: null,
        newStatus: false,
    });
    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const sortKey = ref<string | null>(null);
    const sortAsc = ref(true);
    const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null);
    const isClientTableLoading = ref(false);
    const isFetchingClient = ref(false);

    const toastMessage = ref<ToastMessage>({
        title: '',
        messages: [],
        type: '',
    });

    const createForm = reactive<CreateFormData>({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirm_password: '',
        phone: '',
        company_name: '',
        role_group_ids: [],
        language: null,
        is_active: true,
    });

    const createErrors = reactive<Record<string, string[]>>({});
    const localErrors = reactive<LocalErrors>({
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
    });

    const passwordStrength = ref(0);
    const passwordStrengthLabel = ref<'Weak' | 'Fair' | 'Good' | 'Strong'>('Weak');

    // Computed
    const hasCreateErrors = computed(() => Object.keys(createErrors).length > 0);

    const isFormValid = computed(() => {
        const base =
            createForm.username.trim() &&
            createForm.first_name.trim() &&
            createForm.last_name.trim() &&
            createForm.company_name.trim() &&
            validateEmail(createForm.email) &&
            validatePhone(createForm.phone);

        if (isEditMode.value) {
            if (createForm.password) {
                return Boolean(base && passwordStrength.value >= 50 && createForm.confirm_password && !localErrors.confirmPassword);
            }
            return Boolean(base);
        }

        return Boolean(
            base &&
            passwordStrength.value >= 50 &&
            createForm.password &&
            createForm.confirm_password &&
            !localErrors.confirmPassword
        );
    });

    const filteredClients = computed<Client[]>(() => {
        let list = (clientStore.clients as Client[]).filter(c =>
            c.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            c.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            (c.full_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ?? false) ||
            (c.company_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ?? false)
        );

        if (sortKey.value) {
            list = [...list].sort((a: any, b: any) => {
                const av = a[sortKey.value!] ?? '';
                const bv = b[sortKey.value!] ?? '';
                return sortAsc.value
                    ? String(av).localeCompare(String(bv))
                    : String(bv).localeCompare(String(av));
            });
        }

        return list;
    });

    const paginatedClients = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage.value;
        return filteredClients.value.slice(start, start + itemsPerPage.value);
    });

    const totalPages = computed(() =>
        Math.ceil(filteredClients.value.length / itemsPerPage.value)
    );

    const pageNumbers = computed(() => {
        const maxVisiblePages = 5;
        const pages = [];

        if (totalPages.value <= maxVisiblePages) {
            for (let i = 1; i <= totalPages.value; i++) {
                pages.push(i);
            }
        } else {
            const start = Math.max(1, currentPage.value - 2);
            const end = Math.min(totalPages.value, start + maxVisiblePages - 1);

            if (start > 1) pages.push(1);
            if (start > 2) pages.push('...');

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (end < totalPages.value - 1) pages.push('...');
            if (end < totalPages.value) pages.push(totalPages.value);
        }

        return pages;
    });

    const roleGroupsComputed = computed<RoleGroup[]>({
        get() {
            return (clientStore.roleGroups as RoleGroup[]).filter(group =>
                createForm.role_group_ids.includes(group.id)
            );
        },
        set(selectedGroups) {
            createForm.role_group_ids = selectedGroups.map(g => g.id);
        },
    });

    // Helper Functions
    const validateEmail = (email: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const validatePhone = (phone: string) =>
        /^[0-9]{10,15}$/.test(phone);

    const formatFieldName = (field: string) => {
        return field
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const formatDate = (date?: string | null) =>
        date ? new Date(date).toLocaleString() : '—';

    const getAvatarInitials = (name?: string | null): string => {
        if (!name) return '?';
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) return '?';
        const first = parts[0]!.charAt(0).toUpperCase();
        if (parts.length === 1) return first;
        return (first + parts[parts.length - 1]!.charAt(0).toUpperCase());
    };

    const showToast = (title: string, messages: string[], type: 'success' | 'error' | 'info') => {
        toastMessage.value = {
            title,
            messages,
            type,
        };

        const timeout = type === 'error' ? 8000 : 5000;
        setTimeout(() => {
            if (toastMessage.value.title === title) {
                toastMessage.value = { title: '', messages: [], type: '' };
            }
        }, timeout);
    };

    // Watchers
    watch(() => createForm.email, val => {
        localErrors.email = !val
            ? ''
            : validateEmail(val)
                ? ''
                : transStore.t('client.error.email_invalid');
    });

    watch(() => createForm.phone, val => {
        localErrors.phone = !val
            ? ''
            : validatePhone(val)
                ? ''
                : transStore.t('client.error.phone_invalid');
    });

    watch(() => createForm.password, val => {
        if (isEditMode.value && !val) {
            passwordStrength.value = 0;
            localErrors.password = '';
            return;
        }

        let score = 0;
        if (val.length >= 8) score += 25;
        if (/[A-Z]/.test(val)) score += 25;
        if (/[0-9]/.test(val)) score += 25;
        if (/[^A-Za-z0-9]/.test(val)) score += 25;

        passwordStrength.value = score;
        passwordStrengthLabel.value = score <= 25
            ? transStore.t('client.password_strength.weak')
            : score <= 50
                ? transStore.t('client.password_strength.fair')
                : score <= 75
                    ? transStore.t('client.password_strength.good')
                    : transStore.t('client.password_strength.strong');

        localErrors.password = score < 50 ? transStore.t('client.error.password_weak') : '';
    });

    watch(
        () => [createForm.password, createForm.confirm_password],
        ([p, c]) => {
            if (isEditMode.value && !p) {
                localErrors.confirmPassword = '';
                return;
            }
            localErrors.confirmPassword =
                c && p !== c ? transStore.t('client.error.passwords_mismatch') : '';
        }
    );

    // Actions / Methods
    const resetCreateForm = () => {
        Object.assign(createForm, {
            username: '',
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            confirm_password: '',
            phone: '',
            company_name: '',
            role_group_ids: [],
            language: null,
            is_active: true,
        });

        Object.keys(createErrors).forEach(k => delete createErrors[k]);
        (Object.keys(localErrors) as (keyof typeof localErrors)[])
            .forEach(k => (localErrors[k] = ''));

        passwordStrength.value = 0;
        passwordStrengthLabel.value = transStore.t('client.password_strength.weak');

        isEditMode.value = false;
        editingClientId.value = null;
    };

    const openCreateModal = () => {
        resetCreateForm();
        isCreateModalOpen.value = true;
    };

    const closeCreateModal = () => {
        isCreateModalOpen.value = false;
        resetCreateForm();
    };

    const openEditModal = (client: Client) => {
        resetCreateForm();
        isEditMode.value = true;
        editingClientId.value = client.id;

        Object.assign(createForm, {
            username: client.username,
            first_name: client.first_name || '',
            last_name: client.last_name || '',
            email: client.email,
            phone: client.phone || '',
            company_name: client.company_name || '',
            role_group_ids: client.role_groups_list?.map(r => r.id) || [],
            language: client.language ?? null,
            is_active: client.is_active,
        });

        isCreateModalOpen.value = true;
    };

    const submitCreateClient = async () => {
        if (!isFormValid.value) {
            showToast(transStore.t('toast.error'), [transStore.t('client.error.fix_errors_msg')], 'error');
            return;
        }

        isSubmitting.value = true;
        Object.keys(createErrors).forEach(k => delete createErrors[k]);

        try {
            const payload: any = {
                username: createForm.username,
                first_name: createForm.first_name,
                last_name: createForm.last_name,
                email: createForm.email,
                phone: createForm.phone,
                company_name: createForm.company_name,
                is_active: createForm.is_active,
            };

            if (createForm.password) {
                payload.password = createForm.password;
            }

            if (createForm.language) {
                payload.language = createForm.language;
            }

            if (createForm.role_group_ids.length > 0) {
                payload.role_group_ids = createForm.role_group_ids;
            }

            let res;
            if (isEditMode.value && editingClientId.value) {
                res = await clientStore.updateClient(editingClientId.value, payload);
            } else {
                res = await clientStore.createClient(payload);
            }

            showToast(transStore.t('toast.success'),
                [res?.message || (isEditMode.value
                    ? transStore.t('client.message.update_success')
                    : transStore.t('client.message.create_success'))],
                'success'
            );

            closeCreateModal();
            await clientStore.fetchClients();
        } catch (err: any) {
            const response = err?.response?.data || err;

            Object.keys(createErrors).forEach(k => delete createErrors[k]);

            if (response?.errors) {
                Object.assign(createErrors, response.errors);
                const errorMessages = Object.values(response.errors).flat() as string[];
                showToast(response?.message || transStore.t('client.error.validation_failed'), errorMessages, 'error');
            } else {
                showToast(response?.message || transStore.t('client.error.operation_failed'), [], 'error');
            }
        } finally {
            isSubmitting.value = false;
        }
    };

    const openToggleConfirmModal = (client: Client) => {
        toggleConfirmData.value = {
            client: client,
            newStatus: !client.is_active
        };
        showToggleConfirm.value = true;
    };

    const confirmToggleStatus = async () => {
        if (!toggleConfirmData.value.client) return;

        isTogglingStatus.value = true;

        try {
            const res = await clientStore.toggleClientStatus(
                toggleConfirmData.value.client.id,
                toggleConfirmData.value.newStatus
            );

            showToast(transStore.t('toast.success'),
                [res?.message || (toggleConfirmData.value.newStatus
                    ? transStore.t('client.message.activate_success')
                    : transStore.t('client.message.deactivate_success'))],
                'success'
            );

            showToggleConfirm.value = false;
            await clientStore.fetchClients();
        } catch (error: any) {
            showToast(transStore.t('toast.error'),
                [error?.response?.data?.message || transStore.t('client.error.status_update_failed_msg')],
                'error'
            );
        } finally {
            isTogglingStatus.value = false;
            toggleConfirmData.value = { client: null, newStatus: false };
        }
    };
    const openViewModal = (client: Client) => {
        selectedClient.value = client;
        isViewModalOpen.value = true;
    };
    const closeViewModal = () => {
        isViewModalOpen.value = false;
        selectedClient.value = null;
    };

    const goToPage = (p: number) => {
        if (p !== currentPage.value) {
            currentPage.value = p;
        }
    };

    const prevPage = () => {
        if (currentPage.value > 1) currentPage.value--;
    };

    const nextPage = () => {
        if (currentPage.value < totalPages.value) currentPage.value++;
    };

    const handleSort = (key: string) => {
        if (sortKey.value === key) {
            sortAsc.value = !sortAsc.value;
        } else {
            sortKey.value = key;
            sortAsc.value = true;
        }
    };

    const handleSearch = (event: Event) => {
        const target = event.target as HTMLInputElement;
        if (target) {
            const value = target.value;

            if (searchTimeout.value) {
                clearTimeout(searchTimeout.value);
            }

            searchTimeout.value = setTimeout(() => {
                searchQuery.value = value;
                currentPage.value = 1;
            }, 300);
        }
    };

    // Lifecycle
    onMounted(async () => {

        if (clientStore.clients && clientStore.clients.length > 0)
        {
            isClientTableLoading.value = false;
            return;
        }
        try {
            isClientTableLoading.value = true;

            await Promise.all([
                clientStore.fetchClients(),
                clientStore.fetchRoleGroups()
            ]);
        } catch (error) {
            showToast(transStore.t('toast.error'),
                [transStore.t('client.error.load_initial_data_failed')],
                'error'
            );
        }
        finally {
            isClientTableLoading.value = false;

        }
    });

    return {
        // State
        searchQuery,
        isClientTableLoading,
        searchInput,
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
        resetCreateForm,
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
        formatDate,
        formatFieldName,
        getAvatarInitials,
        showToast,
        isFetchingClient 

    };
}