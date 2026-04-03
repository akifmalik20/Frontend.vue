import { onMounted, ref, computed, reactive } from 'vue';
import { useRoleStore } from '@/stores/roleStore';
import { useTranslationStore } from '@/stores/translationStore';
import { useAuthStore } from '@/stores/authStore';
import { useModuleBreadcrumb } from '@/composables/useModuleBreadcrumb';
import { useTourStore } from '@/stores/tourStore';

export function useRoles() {
    const authStore = useAuthStore();
    const { isChildModule, breadcrumbText, breadcrumbItems } = useModuleBreadcrumb();
    const tourStore = useTourStore();
    const transStore = useTranslationStore();
    const roleStore = useRoleStore();

    const isAdmin = computed(() => authStore.isAdmin);
    const searchQuery = ref('');
    const isSubmitting = ref(false);

    // --- Pagination & Sorting States ---
    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const sortBy = ref('name');
    const sortDirection = ref('asc');

    const selectedRole = ref<any>(null);
    const statusMessage = ref({ text: '', type: '' });

    // --- Modal States ---
    const isModalOpen = ref(false);
    const isDeleteModalOpen = ref(false);
    const isViewModalOpen = ref(false);
    const isEditing = ref(false);
    const currentRoleId = ref<number | null>(null);
    const isToggleModalOpen = ref(false);
    const isRolesTableLoading = ref(false);
    const isFetchingRoles = ref(false);

    // --- Form State ---
    const form = reactive({
        name: '',
        role_type: '',
        description: '',
        is_active: true
    });

    const errors = reactive({ name: '', role_type: '' });

    const toastMessage = ref<{
        title: string;
        messages: string[];
        type: 'success' | 'error' | 'info' | '';
    }>({
        title: '',
        messages: [],
        type: '',
    });

    // --- Helper Functions ---
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    const validateName = () => {
        if (!form.name.trim()) errors.name = transStore.t('validaiton.name.empty');
        else if (form.name.trim().length < 2) errors.name = transStore.t('validation.name.small');
        else errors.name = "";
    };

    const validateType = () => {
        errors.role_type = !form.role_type ? transStore.t('role.form.validation.role.type') : "";
    };

    const isFormInvalid = computed(() => !!errors.name || !!errors.role_type || !form.name || !form.role_type);

    const resetForm = () => {
        Object.assign(form, { name: '', role_type: '', description: '', is_active: true });
        errors.name = '';
        errors.role_type = '';
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

    // --- Sorting & Filtering ---
    const sortRoles = (roles: any[]) => {
        return [...roles].sort((a, b) => {
            let aVal = sortBy.value === 'role_type_name' ? a.role_type_name : a[sortBy.value];
            let bVal = sortBy.value === 'role_type_name' ? b.role_type_name : b[sortBy.value];

            aVal = String(aVal || '').toLowerCase();
            bVal = String(bVal || '').toLowerCase();

            return sortDirection.value === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        });
    };

    const filteredRoles = computed(() => {
        const rolesList = (roleStore.roles || []) as any[];
        const filtered = rolesList.filter(role =>
            role.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            (role.role_type_name && role.role_type_name.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
            role.id?.toString().includes(searchQuery.value)
        );
        return sortRoles(filtered);
    });

    const paginatedRoles = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage.value;
        const end = start + itemsPerPage.value;
        const data = filteredRoles.value.slice(start, end);
        if (data.length === 0 && currentPage.value > 1) currentPage.value--;
        return data;
    });

    const totalPages = computed(() => Math.ceil(filteredRoles.value.length / itemsPerPage.value));

    const pageNumbers = computed(() => {
        const pages = [];
        const maxVisiblePages = 5;
        if (totalPages.value <= maxVisiblePages) {
            for (let i = 1; i <= totalPages.value; i++) pages.push(i);
        } else {
            let start = Math.max(1, currentPage.value - 2);
            let end = Math.min(totalPages.value, start + maxVisiblePages - 1);
            if (end - start + 1 < maxVisiblePages) start = Math.max(1, end - maxVisiblePages + 1);
            for (let i = start; i <= end; i++) pages.push(i);
        }
        return pages;
    });

    // --- Handlers ---
    const handleSort = (column: string) => {
        if (sortBy.value === column) {
            sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
        } else {
            sortBy.value = column;
            sortDirection.value = 'asc';
        }
        currentPage.value = 1;
    };

    const goToPage = (page: number) => { if (page >= 1 && page <= totalPages.value) currentPage.value = page; };
    const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
    const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };


    const openViewModal = (role: any) => {
        // 1. Assign the role data directly from the table row
        selectedRole.value = role;

        // 2. Open the modal instantly
        isViewModalOpen.value = true;


    };
    const openAddModal = () => {
        isEditing.value = false;
        currentRoleId.value = null;
        resetForm();
        isModalOpen.value = true;
    };

    const openEditModal = (role: any) => {
        isEditing.value = true;
        currentRoleId.value = role.id;
        resetForm();

        // Map the local 'role' data directly to the form
        Object.assign(form, {
            name: role.name || '',
            role_type: role.role_type || '',
            description: role.description || '',
            is_active: role.is_active ?? true,
        });

        isModalOpen.value = true;

        // Run validations immediately so the UI reflects the current state
        validateName();
        validateType();
    };
    const handleFormSubmit = async () => {
        validateName();
        validateType();
        if (isFormInvalid.value) {
            showToast(transStore.t('toast.error'), [transStore.t('role.toast.form.errors')], 'error');
            return;
        }
        isSubmitting.value = true;
        try {
            let response = (isEditing.value && currentRoleId.value)
                ? await roleStore.updateRole(currentRoleId.value, { ...form })
                : await roleStore.createRole({ ...form });

            showToast(transStore.t('toast.success'), [response?.message || transStore.t('role.toast.save.success')], 'success');
            setTimeout(async () => {
                isModalOpen.value = false;
                await roleStore.fetchRoles();
                resetForm();
            }, 10);
        } catch (error: any) {
            const resp = error?.response?.data || error;
            const msgs = resp?.errors ? Object.values(resp.errors).flat() as string[] : [resp?.message || resp?.detail || transStore.t('role.toast.save.failed')];
            showToast(transStore.t('toast.error'), msgs, 'error');
        } finally { isSubmitting.value = false; }
    };

    const openDeleteModal = (role: any) => {
        selectedRole.value = role;
        isDeleteModalOpen.value = true;
    };

    const handleConfirmDelete = async () => {
        if (!selectedRole.value) return;
        isSubmitting.value = true;
        try {
            const response = await roleStore.deleteRole(selectedRole.value.id);
            showToast(transStore.t('toast.success'), [response?.message], 'success');
            setTimeout(async () => {
                isDeleteModalOpen.value = false;
                selectedRole.value = null;
                await roleStore.fetchRoles();
            }, 900);
        } catch (error: any) {
            const resp = error.response?.data || error;
            showToast(transStore.t('role.toast.delete.failed'), [resp?.message || resp?.detail || transStore.t('role.toast.operation.failed')], 'error');
        } finally { isSubmitting.value = false; }
    };

    const openToggleModel = (role: any) => {
        selectedRole.value = role;
        isToggleModalOpen.value = true;
    };

    const handleConfirmToggle = async () => {
        if (!selectedRole.value || isSubmitting.value) return;
        isSubmitting.value = true;
        try {
            const response = await roleStore.toggleRoleStatus(selectedRole.value.id, selectedRole.value.is_active);
            showToast(transStore.t('toast.success'), [response?.message], 'success');
            setTimeout(async () => {
                isToggleModalOpen.value = false;
                await roleStore.fetchRoles();
                selectedRole.value = null;
            }, 900);
        } catch (error: any) {
            showToast(transStore.t('role.toast.update.failed'), [error.response?.data?.message], 'error');
            await roleStore.fetchRoles();
        } finally { isSubmitting.value = false; }
    };

    const ROLES_TOUR_STEPS = [
        { id: 'sidebar', selector: '[data-tour-id="sidebar-main"]', title: 'Main navigation', description: '...', placement: 'right' },
        { id: 'roles-header', selector: '[data-tour-id="module-header"]', title: 'Roles module header', description: '...', placement: 'bottom' },
        { id: 'roles-filters', selector: '[data-tour-id="module-filters"]', title: 'Search and filters', description: '...', placement: 'bottom' },
        { id: 'roles-table', selector: '[data-tour-id="module-main"]', title: 'Roles table', description: '...', placement: 'top' },
    ];
    function startRolesTour() {
        tourStore.startTour('roles-main', ROLES_TOUR_STEPS);
    }
    onMounted(async () => {
        if (roleStore.roles && roleStore.roles.length > 0)
        {

            isRolesTableLoading.value = false;
            return;
        }
        try {


            isRolesTableLoading.value = true;
            await roleStore.fetchRoles();
            await roleStore.fetchRoleTypes();
           // tourStore.maybeStartOnce('roles-main', ROLES_TOUR_STEPS);
        }
       
        finally {
                isRolesTableLoading.value = false;

            }
        
    });

    return {
        isAdmin, searchQuery, isSubmitting, currentPage, itemsPerPage, sortBy, sortDirection,
        selectedRole, statusMessage, toastMessage, isModalOpen, isDeleteModalOpen, isViewModalOpen,
        isEditing, isToggleModalOpen, form, errors, formatDate, validateName, validateType,
        isFormInvalid, filteredRoles, paginatedRoles, totalPages, pageNumbers, handleSort,
        goToPage, nextPage, prevPage, openViewModal, openAddModal, openEditModal,
        handleFormSubmit, openDeleteModal, handleConfirmDelete, openToggleModel, handleConfirmToggle,
        resetForm, transStore, breadcrumbText, breadcrumbItems, isChildModule, roleStore,startRolesTour,isRolesTableLoading,isFetchingRoles

    };
}