import { onMounted, ref, computed, reactive, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useLocalizationStore } from '@/stores/localizationStore.js';
import { useAuthStore } from '@/stores/authStore';
import { useModuleBreadcrumb } from '@/composables/useModuleBreadcrumb';
import { useTranslationStore } from '@/stores/translationStore';

export function useLocalization() {
    const transStore = useTranslationStore();
    const locStore = useLocalizationStore();
    const authStore = useAuthStore();
    const { isChildModule, breadcrumbItems } = useModuleBreadcrumb();

    const { availableLanguages } = storeToRefs(authStore);
    const isAdmin = computed(() => authStore.isAdmin);

    // --- Basic States ---
    const searchQuery = ref('');
    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const sortBy = ref('id');
    const sortDirection = ref('desc');
    const isViewModalOpen = ref(false);
    const isModalOpen = ref(false);
    const isDeleteModalOpen = ref(false);
    const isSubmitting = ref(false);
    const isEditing = ref(false);
    const currentLocalizationId = ref<number | null>(null);
    const selectedItem = ref<any>(null);
    const statusMessage = ref({ text: '', type: '' });
    const isLoacalizationTableLoading = ref(false);
    const isFetchingLocalization = ref(false);

    // --- Form State ---
    const form = reactive({
        code: '',
        text: '',
        language_code: '',
        module_id: [] as { id: number; [key: string]: any }[], // Explicitly define the object structure
    });

    const errors = reactive({
        code: '',
        text: '',
        language_code: '',
        module_id: ''
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

    // --- Computed Properties ---
    const isFormInvalid = computed(() => {
        return !form.code || !form.text || !form.language_code || !!errors.code || !!errors.text || !!errors.language_code;
    });

    const filteredData = computed(() => {
        const list = (locStore.localizations || []) as any[];
        if (!searchQuery.value) return list;

        const query = searchQuery.value.toLowerCase();
        return list.filter(item =>
            item.code?.toLowerCase().includes(query) ||
            item.text?.toLowerCase().includes(query) ||
            item.language_name?.toLowerCase().includes(query) ||
            item.language_code?.toLowerCase().includes(query) ||
            item.id?.toString().includes(query)
        );
    });

    const sortedData = computed(() => {
        const data = [...filteredData.value];
        return data.sort((a, b) => {
            let aVal = a[sortBy.value] ?? '';
            let bVal = b[sortBy.value] ?? '';

            if (typeof aVal === 'string') {
                return sortDirection.value === 'asc'
                    ? aVal.toLowerCase().localeCompare(String(bVal).toLowerCase())
                    : String(bVal).toLowerCase().localeCompare(aVal.toLowerCase());
            }

            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortDirection.value === 'asc' ? aVal - bVal : bVal - aVal;
            }

            return sortDirection.value === 'asc'
                ? String(aVal).localeCompare(String(bVal))
                : String(bVal).localeCompare(String(aVal));
        });
    });

    const paginatedData = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage.value;
        const end = start + itemsPerPage.value;
        return sortedData.value.slice(start, end);
    });

    const totalItems = computed(() => sortedData.value.length);
    const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

    // --- Watchers ---
    watch([searchQuery, itemsPerPage], () => {
        currentPage.value = 1;
    });

    watch(sortedData, () => {
        if (currentPage.value > totalPages.value) {
            currentPage.value = totalPages.value || 1;
        }
    });

    // --- Methods ---
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true
            });
        } catch { return 'Invalid Date'; }
    };

    const handleSort = (column: string) => {
        if (sortBy.value === column) {
            sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
        } else {
            sortBy.value = column;
            sortDirection.value = 'asc';
        }
    };

    const goToPage = (page: number) => { if (page >= 1 && page <= totalPages.value) currentPage.value = page; };
    const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
    const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };

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
        Object.assign(form, { code: '', text: '', language_code: '', module_id: [] });
        Object.assign(errors, { code: '', text: '', language_code: '', module_id: '' });
    };

    const openAddLocalizationModal = () => {
        isEditing.value = false;
        currentLocalizationId.value = null;
        resetForm();
        isModalOpen.value = true;
    };

    const handleEdit = (loc: any) => {
        isEditing.value = true;
        currentLocalizationId.value = loc.id;
        console.log(loc)
        const selectedModules = (activeModules.value as any[]).filter(mod =>
            Array.isArray(loc.module_id)
                ? loc.module_id.includes(mod.id)
                : loc.module_id === mod.id
        );
        console.log(selectedModules)
        Object.assign(form, {
            code: loc.code,
            text: loc.text,
            language_code: loc.language_code,
            module_id: selectedModules,
        });
        statusMessage.value = { text: '', type: '' };
        isModalOpen.value = true;
    };

    // --- Validations ---
    const validateCode = () => {
        const regex = /^[A-Za-z0-9_.]+$/;
        if (!form.code.trim()) errors.code = transStore.t('localization.validation.code.required');
        else if (!regex.test(form.code)) errors.code = transStore.t('localization.validation.code.invalid.format');
        else if (form.code.trim().length < 2) errors.code = transStore.t('localization.validation.code.min.length');
        else errors.code = "";
    };

    const validateText = () => {
        errors.text = !form.text.trim() ? transStore.t('localization.validation.text.required') : "";
    };

    const validateLanguage = () => {
        errors.language_code = !form.language_code ? transStore.t('localization.validation.language.required') : "";
    };

    const validateModule = () => {
        if (isEditing.value && (!form.module_id || form.module_id.length >= 2)) {
            errors.module_id = transStore.t('localization.validation.module.required.edit');
        } else {
            errors.module_id = "";
        }
    };

    const handleFormSubmit = async () => {
        validateCode(); validateText(); validateLanguage(); validateModule();
        if (errors.code || errors.text || errors.language_code || errors.module_id) return;

        isSubmitting.value = true;
        try {
            const payload = {
                ...form,
                module_ids: form.module_id.map((mod: any) => mod.id)
            };
            const response = isEditing.value && currentLocalizationId.value
                ? await locStore.updateLocalization(currentLocalizationId.value, payload)
                : await locStore.createLocalization(payload);

            if (response) {
                showToast(transStore.t('toast.success'), [response?.message || transStore.t('localization.toast.save.success')], 'success');
                setTimeout(async () => {
                    isModalOpen.value = false;
                    await locStore.fetchLocalizationList();
                    resetForm();
                    currentPage.value = 1;
                }, 1200);
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || transStore.t('localization.toast.save.failed'), error.response?.data?.detail, 'error');
        } finally { isSubmitting.value = false; }
    };

    const openViewLocalizationModal = (loc: any) => {
        selectedItem.value = loc;
        isViewModalOpen.value = true;
    };
    const openDeleteModal = (item: any) => {
        selectedItem.value = item;
        isDeleteModalOpen.value = true;
    };

    const handleConfirmDelete = async () => {
        if (!selectedItem.value) return;
        isSubmitting.value = true;
        try {
            const success = await locStore.deleteLocalization(selectedItem.value.id);
            if (success) {
                showToast(transStore.t('toast.success'), [transStore.t('localization.toast.delete.success')], 'success');
                setTimeout(() => {
                    isDeleteModalOpen.value = false;
                    selectedItem.value = null;
                    currentPage.value = 1;
                }, 1000);
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || transStore.t('localization.toast.delete.failed'), error.response?.data?.detail, 'error');
        } finally { isSubmitting.value = false; }
    };

    const activeModules = computed(() => (locStore.module || []).filter((mod: any) => mod.is_active === true));

    const pageNumbers = computed(() => {
        const pages: (number | string)[] = [];
        const total = totalPages.value;
        const current = currentPage.value;
        if (total <= 5) {
            for (let i = 1; i <= total; i++) pages.push(i);
        } else {
            pages.push(1);
            if (current > 3) pages.push('...');
            let start = Math.max(2, current - 1);
            let end = Math.min(total - 1, current + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (current < total - 2) pages.push('...');
            pages.push(total);
        }
        return pages;
    });
    const startIndex = computed(() => {
        if (totalItems.value === 0) return 0;
        return (currentPage.value - 1) * itemsPerPage.value + 1;
    });
    const endIndex = computed(() => {
        return Math.min(currentPage.value * itemsPerPage.value, totalItems.value);
    });
    onMounted(async () => {
        if (locStore.localizations && locStore.localizations.length > 0)
        {

            isLoacalizationTableLoading.value = false;
            return;
        }
        try{
            isLoacalizationTableLoading.value = true;
            await locStore.fetchLocalizationList();
            await locStore.fetchModules();
        }
        finally {
            isLoacalizationTableLoading.value = false;

        }

    });

    return {
        locStore, isAdmin, isChildModule, breadcrumbItems, availableLanguages,
        searchQuery, currentPage, itemsPerPage, sortBy, sortDirection,
        isViewModalOpen, isModalOpen, isDeleteModalOpen, isSubmitting, isEditing,
        selectedItem, statusMessage, form, errors, toastMessage,
        isFormInvalid, paginatedData, totalItems, totalPages,
        formatDate, handleSort, goToPage, nextPage, prevPage, pageNumbers,
        openAddLocalizationModal, handleEdit, validateCode, validateText,
        validateLanguage, validateModule, handleFormSubmit, openViewLocalizationModal,
        openDeleteModal, handleConfirmDelete, activeModules, transStore,resetForm,startIndex,endIndex,isLoacalizationTableLoading,isFetchingLocalization

    };
}