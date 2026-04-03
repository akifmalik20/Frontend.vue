import { ref, computed, onMounted, reactive, watch } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import { useTranslationStore } from '@/stores/translationStore';
import { useModuleBreadcrumb } from '@/composables/useModuleBreadcrumb';

// Types/Interfaces
export interface RoleGroup {
    id: number;
    name: string;
}

export interface User {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    email: string;
    phone?: string;
    is_active: boolean;
    role_groups_list?: RoleGroup[];
    language?: number;
    language_name?: string;
    total_users?: number;
    last_login?: string | null;
    created_at?: string;
    updated_at?: string;
    created_by_name?: string;
    avatar?: string | null;
}

export interface ToastMessage {
    title: string;
    messages: string[];
    type: 'success' | 'error' | 'info' | '';
}

export interface ToggleConfirmData {
    user: User | null;
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
    language: number | null;
    is_active: boolean;
}

export interface LocalErrors {
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
}

export interface StatusMessage {
    title: string;
    messages: string[];
    type: 'success' | 'error' | '';
}

export function useUsers() {
    const userStore = useUserStore();
    const authStore = useAuthStore();
    const transStore = useTranslationStore();
    const { isChildModule, breadcrumbItems } = useModuleBreadcrumb();

    // State
    const searchQuery = ref('');
    const searchInput = ref('');
    const isSubmitting = ref(false);
    const isDeleting = ref(false);
    const isCreateModalOpen = ref(false);
    const isEditMode = ref(false);
    const editingUserId = ref<number | null>(null);
    const showDeleteConfirm = ref(false);
    const userToDelete = ref<User | null>(null);
    const isViewModalOpen = ref(false);
    const selectedUser = ref<User | null>(null);
    const showToggleConfirm = ref(false);
    const isTogglingStatus = ref(false);
    const toggleConfirmData = ref<ToggleConfirmData>({
        user: null,
        newStatus: false,
    });
    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const sortKey = ref<string | null>(null);
    const sortAsc = ref(true);
    const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

    const toastMessage = ref<ToastMessage>({
        title: '',
        messages: [],
        type: '',
    });

    const statusMessage = ref<StatusMessage>({
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
    const passwordStrengthLabel = ref<'Weak' | 'Fair' | 'Good' | 'Strong'>(transStore.t('user.strength.weak'));

    // Helper Functions
    const validateEmail = (email: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const validatePhone = (phone: string) =>
        /^[0-9]{10,15}$/.test(phone);

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
        toastMessage.value = { title, messages, type };
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
                : transStore.t('user.error.email_invalid');
    });

    watch(() => createForm.phone, val => {
        localErrors.phone = !val
            ? ''
            : validatePhone(val)
                ? ''
                : transStore.t('user.error.phone_invalid');
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
        passwordStrengthLabel.value =
            score <= 25 ? transStore.t('user.strength.weak') :
                score <= 50 ? transStore.t('user.strength.fair') :
                    score <= 75 ? transStore.t('user.strength.good') :
                        transStore.t('user.strength.strong');

        localErrors.password = score < 50 ? transStore.t('user.error.password_weak') : '';
    });

    watch(
        () => [createForm.password, createForm.confirm_password],
        ([p, c]) => {
            if (isEditMode.value && !p) {
                localErrors.confirmPassword = '';
                return;
            }
            localErrors.confirmPassword =
                c && p !== c ? transStore.t('user.error.passwords_mismatch') : '';
        }
    );

    // Computed
    const isFormValid = computed(() => {
        const base =
            createForm.username.trim() &&
            createForm.first_name.trim() &&
            createForm.last_name.trim() &&
            validateEmail(createForm.email) &&
            validatePhone(createForm.phone) &&
            createForm.language !== null;

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

    const filteredUsers = computed<User[]>(() => {
        let list = (userStore.users as User[]).filter(u =>
            u.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            (u.full_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ?? false)
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

    const paginatedUsers = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage.value;
        return filteredUsers.value.slice(start, start + itemsPerPage.value);
    });

    const totalPages = computed(() =>
        Math.ceil(filteredUsers.value.length / itemsPerPage.value)
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

    // Methods
    const resetCreateForm = () => {
        Object.assign(createForm, {
            username: '',
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            confirm_password: '',
            phone: '',
            language: null,
            is_active: true,
        });

        statusMessage.value = { title: '', messages: [], type: '' };
        Object.keys(createErrors).forEach(k => delete createErrors[k]);
        (Object.keys(localErrors) as (keyof typeof localErrors)[])
            .forEach(k => (localErrors[k] = ''));

        passwordStrength.value = 0;
        passwordStrengthLabel.value = transStore.t('user.strength.weak');

        isEditMode.value = false;
        editingUserId.value = null;
    };

    const openCreateModal = () => {
        resetCreateForm();
        isCreateModalOpen.value = true;
    };

    const closeCreateModal = () => {
        isCreateModalOpen.value = false;
        resetCreateForm();
    };

    const openEditModal = (user: User) => {
        resetCreateForm();
        isEditMode.value = true;
        editingUserId.value = user.id;

        Object.assign(createForm, {
            username: user.username,
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email,
            phone: user.phone || '',
            language: user.language ?? null,
            is_active: user.is_active,
        });

        isCreateModalOpen.value = true;
    };

    const submitCreateUser = async () => {
        if (!isFormValid.value) {
            return;
        }

        isSubmitting.value = true;
        statusMessage.value = { title: '', messages: [], type: '' };
        Object.keys(createErrors).forEach(k => delete createErrors[k]);

        try {
            const clientId = authStore.getClientId;
            if (!clientId) {
                throw new Error(transStore.t('user.error.client_id_missing'));
            }

            const payload: any = {
                username: createForm.username,
                first_name: createForm.first_name,
                last_name: createForm.last_name,
                email: createForm.email,
                phone: createForm.phone,
                language: createForm.language,
                is_active: createForm.is_active,
                client_id: parseInt(clientId)
            };

            if (createForm.password) {
                payload.password = createForm.password;
            }

            let res;
            if (isEditMode.value && editingUserId.value) {
                res = await userStore.updateUser(editingUserId.value, payload);
            } else {
                if (!createForm.password) {
                    throw new Error(transStore.t('user.error.password_required_new'));
                }
                res = await userStore.createUser(payload);
            }

            statusMessage.value = {
                title: 'Success',
                messages: [res?.message || transStore.t('user.message.operation_success')],
                type: 'success',
            };

            await userStore.fetchUsers();

            showToast(transStore.t('toast.success'),
                [res?.message || (isEditMode.value
                    ? transStore.t('user.message.update_success')
                    : transStore.t('user.message.create_success'))],
                'success'
            );

            closeCreateModal();

        } catch (err: any) {
            const response = err?.response?.data || err;
            statusMessage.value = {
                title: response?.message || transStore.t('user.error.validation_failed'),
                messages: [],
                type: 'error',
            };

            if (response?.errors) {
                Object.assign(createErrors, response.errors);
                statusMessage.value.messages = Object.values(response.errors).flat() as string[];
            }
        } finally {
            isSubmitting.value = false;
        }
    };

    const closeDeleteModal = () => {
        showDeleteConfirm.value = false;
        userToDelete.value = null;
        statusMessage.value = {
            title: '',
            messages: [],
            type: '',
        };
    };

    const confirmDeleteUser = (user: User) => {
        userToDelete.value = user;
        statusMessage.value = {
            title: '',
            messages: [],
            type: '',
        };
        showDeleteConfirm.value = true;
    };

    const performDeleteUser = async () => {
        if (!userToDelete.value) return;

        isDeleting.value = true;
        statusMessage.value = { title: '', messages: [], type: '' };

        try {
            const res = await userStore.deleteUser(userToDelete.value.id);

            if (!res?.success) {
                throw new Error(res?.message || transStore.t('user.error.delete_failed'));
            }

            statusMessage.value = {
                title: 'Success',
                messages: [res.message],
                type: 'success',
            };

        } catch (error) {
            statusMessage.value = {
                title: 'Error',
                messages: [transStore.t('user.error.delete_failed_msg')],
                type: 'error',
            };
        } finally {
            isDeleting.value = false;
        }
    };

    const openToggleConfirmModal = (user: User) => {
        toggleConfirmData.value = {
            user: user,
            newStatus: !user.is_active,
        };
        showToggleConfirm.value = true;
    };

    const confirmToggleStatus = async () => {
        if (!toggleConfirmData.value.user) return;

        isTogglingStatus.value = true;

        try {
            const res = await userStore.toggleActiveStatus(
                toggleConfirmData.value.user.id,
                toggleConfirmData.value.newStatus
            );

            showToast(transStore.t('toast.success'),
                [res?.message || (toggleConfirmData.value.newStatus
                    ? transStore.t('user.message.activate_success')
                    : transStore.t('user.message.deactivate_success'))],
                'success'
            );

            showToggleConfirm.value = false;
            await userStore.fetchUsers();

        } catch (error: any) {
            showToast(transStore.t('toast.error'),
                [error?.response?.data?.message || transStore.t('user.error.status_update_failed_msg')],
                'error'
            );
        } finally {
            isTogglingStatus.value = false;
            toggleConfirmData.value = { user: null, newStatus: false };
        }
    };

    const openViewModal = async (user: User) => {
        try {
            isSubmitting.value = true;
            selectedUser.value = await userStore.fetchUserById(user.id);
            isViewModalOpen.value = true;
        } catch (error) {
            statusMessage.value = {
                title: 'Error',
                messages: [transStore.t('user.error.load_details_failed')],
                type: 'error',
            };
        } finally {
            isSubmitting.value = false;
        }
    };

    const closeViewModal = () => {
        isViewModalOpen.value = false;
        selectedUser.value = null;
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

    const handleSearch = (value: string) => {
        if (searchTimeout.value) {
            clearTimeout(searchTimeout.value);
        }

        searchTimeout.value = setTimeout(() => {
            searchQuery.value = value;
            currentPage.value = 1;
        }, 300);
    };

    // Lifecycle
    onMounted(async () => {
        try {
            await Promise.all([
                userStore.fetchUsers(),
                userStore.fetchRoleGroups()
            ]);
        } catch (error) {
            console.error('Failed to load initial data:', error);
        }
    });

    return {
        // State
        searchQuery,
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
        resetCreateForm,
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
        showToast,
    };
}