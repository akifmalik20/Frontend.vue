import { onMounted, ref, computed, reactive } from 'vue';
import { useGroupRoleStore } from '@/stores/roleGroupStore';
import { useTranslationStore } from '@/stores/translationStore';
import { useAuthStore } from '@/stores/authStore';
import { useModuleBreadcrumb } from '@/composables/useModuleBreadcrumb';
import { useTourStore } from '@/stores/tourStore';

export function useRoleGroup() {
    const authStore = useAuthStore();
    const { isChildModule, breadcrumbItems } = useModuleBreadcrumb();
    const tourStore = useTourStore();
    const transStore = useTranslationStore();
    const roleStoreGroup = useGroupRoleStore();

    const isAdmin = computed(() => authStore.isAdmin);
    const searchQuery = ref('');
    const isSubmitting = ref(false);
    const isHovered = ref(false);
    const isRoleGroupTableLoading = ref(false);

    // --- Pagination & Sorting States ---
    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const sortBy = ref('name');
    const sortDirection = ref('asc');

    const selectedRoleGroup = ref<any>(null);
    const statusMessage = ref({ text: '', type: '' });

    // --- Modal States ---
    const isModalOpen = ref(false);
    const isDeleteModalOpen = ref(false);
    const isViewModalOpen = ref(false);
    const isEditing = ref(false);
    const currentRoleGroupId = ref<number | null>(null);
    const isToggleModalOpen = ref(false);
    const isFetchingRolesGroup = ref(false);

    // --- Form State ---
    const form = reactive({
        name: '',
        role_ids: [] as number[],
        description: '',
        is_active: true
    });

    const toastMessage = ref<{
        title: string;
        messages: string[];
        type: 'success' | 'error' | 'info' | '';
    }>({
        title: '',
        messages: [],
        type: '',
    });

    const errors = reactive({ name: '' });

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
        if (!form.name.trim()) errors.name = transStore.t('validation.name.empty');
        else if (form.name.trim().length < 2) errors.name = transStore.t('validation.name.small');
        else errors.name = "";
    };

    const isFormInvalid = computed(() => !!errors.name || !form.name);

    const resetForm = () => {
        Object.assign(form, { name: '', role_ids: [], description: '', is_active: true });
        errors.name = '';
    };

    const closeCreateModal = () => {
        isModalOpen.value = false;
        resetForm();
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
    const sortRolesGroup = (rolesGroup: any[]) => {
        return [...rolesGroup].sort((a, b) => {
            let aVal = String(a[sortBy.value] || '').toLowerCase();
            let bVal = String(b[sortBy.value] || '').toLowerCase();
            return sortDirection.value === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        });
    };

    const filteredRolesGroup = computed(() => {
        const rolesGroupList = (roleStoreGroup.rolesGroup || []) as any[];

        // Filter by search query
        const filtered = rolesGroupList.filter(roleGroup =>
            roleGroup.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||

            roleGroup.id?.toString().includes(searchQuery.value)
        );

        // Sort the filtered results
        return sortRolesGroup(filtered);
    });

    const paginatedRolesGroup = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage.value;
        const end = start + itemsPerPage.value;
        const data = filteredRolesGroup.value.slice(start, end);
        if (data.length === 0 && currentPage.value > 1) currentPage.value--;
        return data;
    });

    const totalPages = computed(() => Math.ceil(filteredRolesGroup.value.length / itemsPerPage.value));

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


    const openViewModal = (roleGroup: any) => {

        selectedRoleGroup.value = roleGroup;

        isViewModalOpen.value = true;


    };
    const openAddModal = () => {
        isEditing.value = false;
        currentRoleGroupId.value = null;
        resetForm();
        isModalOpen.value = true;
    };

    const openEditModal = (roleGroup: any) => {
        isEditing.value = true;
        currentRoleGroupId.value = roleGroup.id;
        resetForm();

        // Map the local object directly to the form
        Object.assign(form, {
            name: roleGroup.name || '',
            role_ids: roleGroup.role_ids || [],
            description: roleGroup.description || '',
            is_active: roleGroup.is_active ?? true,
        });

        isModalOpen.value = true;
        validateName();
    };
    const handleFormSubmit = async () => {
        validateName();
        if (isFormInvalid.value) {
            showToast(transStore.t('toast.validation.error'), [transStore.t('rolegroup.toast.form.errors')], 'error');
            return;
        }
        isSubmitting.value = true;
        try {
            let response = isEditing.value && currentRoleGroupId.value
                ? await roleStoreGroup.updateRoleGroup(currentRoleGroupId.value, { ...form })
                : await roleStoreGroup.createRoleGroup({ ...form });

            if (response && response.success) {
                showToast(transStore.t('toast.success'), [response?.message || transStore.t('rolegroup.toast.save.success')], 'success');
                setTimeout(async () => {
                    closeCreateModal();
                    await roleStoreGroup.fetchRolesGroup();
                }, 500);
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || transStore.t('rolegroup.toast.save.failed'), error.response?.data?.detail, 'error');
        } finally { isSubmitting.value = false; }
    };

    const openDeleteModal = (roleGroup: any) => {
        selectedRoleGroup.value = roleGroup;
        isDeleteModalOpen.value = true;
    };

    const handleConfirmDelete = async () => {
        if (!selectedRoleGroup.value) return;
        isSubmitting.value = true;
        try {
            const response = await roleStoreGroup.deleteRoleGroup(selectedRoleGroup.value.id);
            if (response && response.success) {
                showToast(transStore.t('toast.success'), [response?.message || transStore.t('rolegroup.toast.delete.success')], 'success');
                setTimeout(() => {
                    isDeleteModalOpen.value = false;
                    selectedRoleGroup.value = null;
                }, 500);
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || transStore.t('rolegroup.toast.delete.failed'), error.response?.data?.detail, 'error');
        } finally { isSubmitting.value = false; }
    };

    const openToggleModel = (roleGroup: any) => {
        selectedRoleGroup.value = roleGroup;
        isToggleModalOpen.value = true;
    };

    const handleConfirmToggle = async () => {
        if (!selectedRoleGroup.value || isSubmitting.value) return;
        isSubmitting.value = true;
        try {
            const response = await roleStoreGroup.toggleRoleGroupStatus(selectedRoleGroup.value.id, selectedRoleGroup.value.is_active);
            if (response && response.success) {
                showToast(transStore.t('toast.success'), [response?.message || transStore.t('rolegroup.toast.status.updated')], 'success');
                setTimeout(() => {
                    isToggleModalOpen.value = false;
                    selectedRoleGroup.value = null;
                }, 100);
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || transStore.t('rolegroup.toast.permission.error'), error.response?.data?.detail, 'error');
        } finally { isSubmitting.value = false; }
    };

    const activeRoleTypes = computed(() => (roleStoreGroup.roleTypes as any[]).filter(type => type.is_active === 'true' || type.is_active === true));

    const roleTypeComputed = computed({
        get() { return activeRoleTypes.value.filter(roleGroup => form.role_ids.includes(roleGroup.id)); },
        set(newValue) { form.role_ids = newValue.map(roleGroup => roleGroup.id); }
    });


    const isSelected = (option: any) => form.role_ids.includes(option.id);

    const ROLEGROUP_TOUR_STEPS = [
        { id: 'sidebar', selector: '[data-tour-id="sidebar-main"]', title: 'Main navigation', description: 'Use the sidebar...', placement: 'right' },
        { id: 'rolegroup-header', selector: '[data-tour-id="module-header"]', title: 'Role groups header', description: 'This header shows...', placement: 'bottom' },
        { id: 'rolegroup-filters', selector: '[data-tour-id="module-filters"]', title: 'Search and controls', description: 'Use search and...', placement: 'bottom' },
        { id: 'rolegroup-main', selector: '[data-tour-id="module-main"]', title: 'Role groups table', description: 'This table lists...', placement: 'top' },
    ];

    onMounted(async () => {

        if (roleStoreGroup.rolesGroup && roleStoreGroup.rolesGroup.length > 0)
        {

            isRoleGroupTableLoading.value = false;
            return;
        }

        try {
            console.log("try block")

            isRoleGroupTableLoading.value = true;
            await roleStoreGroup.fetchRolesGroup();
            await roleStoreGroup.fetchRole();
            isRoleGroupTableLoading.value = false;
        } catch (error) {
            console.error("Failed to sync data:", error);
        } finally {
                  }
    });



    // Return everything needed by the template
    return {
        isAdmin, searchQuery, isSubmitting, isHovered, currentPage, itemsPerPage, sortBy, sortDirection,
        selectedRoleGroup, statusMessage, isModalOpen, isDeleteModalOpen, isViewModalOpen, isEditing,
        isToggleModalOpen, form, toastMessage, errors, formatDate, validateName, isFormInvalid,
        filteredRolesGroup, paginatedRolesGroup, totalPages, pageNumbers, handleSort, goToPage,
        nextPage, prevPage, openViewModal, openAddModal, openEditModal, handleFormSubmit,
        openDeleteModal, openToggleModel, handleConfirmDelete, handleConfirmToggle,
        roleTypeComputed, isSelected, closeCreateModal, transStore, breadcrumbItems, isChildModule,
        roleStoreGroup,
        resetForm,isRoleGroupTableLoading,
        activeRoleTypes,isFetchingRolesGroup
    };
}