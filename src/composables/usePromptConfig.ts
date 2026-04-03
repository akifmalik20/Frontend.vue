import { ref, reactive, computed, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { usePromptConfigStore } from '@/stores/promptConfigStore';
import { useTranslationStore } from '@/stores/translationStore';
import { useAuthStore } from '@/stores/authStore';
import {useModuleBreadcrumb} from "@/composables/useModuleBreadcrumb.ts";

export function usePromptConfig() {
    const promptStore = usePromptConfigStore();
    const { isChildModule, breadcrumbItems } = useModuleBreadcrumb();
    const transStore = useTranslationStore();
    const authStore = useAuthStore();

    const { availableLanguages } = storeToRefs(authStore);

    const searchQuery = ref('');
    const clientSearchQuery = ref('');
    const isClientDropdownOpen = ref(false);
    const isSubmitting = ref(false);

// --- Pagination & Sorting States ---
    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const sortBy = ref('prompt_text_code');
    const sortDirection = ref('asc');

    const selectedPrompt = ref<any>(null);
    const statusMessage = ref({ text: '', type: '' });
    const isPromptTableLoading = ref(false);

// --- Modal States ---
    const isModalOpen = ref(false);
    const isDeleteModalOpen = ref(false);
    const isViewModalOpen = ref(false);
    const isEditing = ref(false);
    const currentPromptId = ref<number | null>(null);

// --- Form State ---
    const form = reactive({
        prompt_text_code: '',
        prompt_text: '',
        language_code: '',
        auth_user_id: null as number | null, // API expects auth_user_id for create/update
        is_chatbot: true,
        is_aiagent: false,
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

    const errors = reactive({
        prompt_text_code: '',
        prompt_text: '',
        language_code: '',
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

    const validateCode = () => {
        if (!form.prompt_text_code.trim()) {
            errors.prompt_text_code = transStore.t('prompt.validation.code.required');
        } else if (form.prompt_text_code.trim().length < 2) {
            errors.prompt_text_code = transStore.t('prompt.validation.code.min.length');
        } else {
            errors.prompt_text_code = '';
        }
    };

    const validateText = () => {
        if (!form.prompt_text.trim()) {
            errors.prompt_text = transStore.t('prompt.validation.text.required');
        } else if (form.prompt_text.trim().length < 5) {
            errors.prompt_text = transStore.t('prompt.validation.text.min.length');
        } else {
            errors.prompt_text = '';
        }
    };

    const validateLanguage = () => {
        if (!form.language_code) {
            errors.language_code = transStore.t('prompt.validation.language.required');
        } else {
            errors.language_code = '';
        }
    };

    const isFormInvalid = computed(() =>
        !!errors.prompt_text_code || !form.prompt_text_code ||
        !!errors.prompt_text || !form.prompt_text ||
        !!errors.language_code || !form.language_code
    );

// --- Get Client Name from client ID (for display) ---
    const getClientName = (clientId: number | null): string => {
        if (!clientId) return '';
        const clients = (promptStore.clients || []) as any[];
        const client = clients.find(c => c.id === clientId); // Match by client id for display
        return client?.full_name || client?.username || client?.company_name || '';
    };



// --- Get Client by client_id (for display) ---
    const getClientByClientId = (clientId: number | null): any => {
        if (!clientId) return null;
        const clients = (promptStore.clients || []) as any[];
        return clients.find(c => c.id === clientId) || null;
    };

// --- Get language name from code ---
    const getLanguageName = (languageCode: string): string => {
        if (!languageCode) return 'N/A';
        const lang = availableLanguages.value.find((l: any) => l.code === languageCode);
        return lang?.name || languageCode.toUpperCase();
    };

// --- Sorting Function ---
    const sortPromptConfigs = (configs: any[]) => {
        return [...configs].sort((a, b) => {
            if (sortBy.value === 'client_name') {
                // Special handling for client name sorting
                const aName = getClientName(a.client) || '';
                const bName = getClientName(b.client) || '';
                if (sortDirection.value === 'asc') return aName.localeCompare(bName);
                else return bName.localeCompare(aName);
            } else if (sortBy.value === 'language_name') {
                // Sort by language name
                const aLang = getLanguageName(a.language_code);
                const bLang = getLanguageName(b.language_code);
                if (sortDirection.value === 'asc') return aLang.localeCompare(bLang);
                else return bLang.localeCompare(aLang);
            } else {
                let aVal = String(a[sortBy.value] || '').toLowerCase();
                let bVal = String(b[sortBy.value] || '').toLowerCase();
                if (sortDirection.value === 'asc') return aVal.localeCompare(bVal);
                else return bVal.localeCompare(aVal);
            }
        });
    };


    const filteredPromptConfigs = computed(() => {
        const list = (promptStore.promptConfigs || []) as any[];
        console.log("list",list)
        const filtered = list.filter(prompt => {
            const clientName = getClientName(prompt.client);
            const languageName = getLanguageName(prompt.language_code);
            return prompt.prompt_text_code?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                prompt.id?.toString().includes(searchQuery.value) ||
                languageName?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                prompt.language_code?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                clientName?.toLowerCase().includes(searchQuery.value.toLowerCase());
        });
        return sortPromptConfigs(filtered);
    });


    const clientMap = computed(() => {
        const clients = (promptStore.promptConfigs as any)?.clients || [];
        return new Map(clients.map((c: any) => [c.id, c.name]));
    });

// Helper to get initials from a string
    const getInitials = (name: string) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

// Helper to resolve the name from the map
    const resolveClientName = (client: any) => {
        const id = typeof client === 'object' ? client?.id : client;
        return clientMap.value.get(id) || 'Unknown';
    };
    const paginatedPromptConfigs = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage.value;
        const end = start + itemsPerPage.value;
        return filteredPromptConfigs.value.slice(start, end);
    });

// Reset to first page when search changes
    watch(searchQuery, () => {
        currentPage.value = 1;
    });

    const totalPages = computed(() =>
        Math.ceil(filteredPromptConfigs.value.length / itemsPerPage.value)
    );

    const pageNumbers = computed(() => {
        const pages = [];
        const maxVisiblePages = 5;
        if (totalPages.value <= maxVisiblePages) {
            for (let i = 1; i <= totalPages.value; i++) pages.push(i);
        } else {
            let start = Math.max(1, currentPage.value - 2);
            let end = Math.min(totalPages.value, start + maxVisiblePages - 1);
            if (end - start + 1 < maxVisiblePages) {
                start = Math.max(1, end - maxVisiblePages + 1);
            }
            for (let i = start; i <= end; i++) pages.push(i);
        }
        return pages;
    });

// --- Sorting Handler ---
    const handleSort = (column: string) => {
        if (sortBy.value === column) {
            sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
        } else {
            sortBy.value = column;
            sortDirection.value = 'asc';
        }
        currentPage.value = 1;
    };

// --- Pagination Handlers ---
    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages.value) currentPage.value = page;
    };
    const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
    const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };

// --- Toast ---
    const showToast = (title: string, messages: string[], type: 'success' | 'error' | 'info') => {
        toastMessage.value = { title, messages, type };
        const timeout = type === 'error' ? 8000 : 5000;
        setTimeout(() => {
            if (toastMessage.value.title === title) {
                toastMessage.value = { title: '', messages: [], type: '' };
            }
        }, timeout);
    };

// --- Modal Actions ---

// 1. View Detail
    const openViewModal = async (prompt: any) => {
        isSubmitting.value = true;
        statusMessage.value = { text: '', type: '' };
        try {
            selectedPrompt.value = {
                ...prompt,
                client_name: getClientName(prompt.client),
                client_object: getClientByClientId(prompt.client),
                language_name: getLanguageName(prompt.language_code)
            };
            isViewModalOpen.value = true;
        } catch (error: any) {
            showToast(transStore.t('toast.error'), [transStore.t('prompt.notification.load.details.error')], 'error');
        } finally {
            isSubmitting.value = false;
        }
    };

// 2. Add Prompt
    const openAddModal = () => {
        isEditing.value = false;
        currentPromptId.value = null;
        resetForm();
        statusMessage.value = { text: '', type: '' };
        isModalOpen.value = true;
    };

// 3. Edit Prompt
    const openEditModal = async (prompt: any) => {
        isEditing.value = true;
        isSubmitting.value = true;
        currentPromptId.value = prompt.id;
        statusMessage.value = { text: '', type: '' };
        resetForm();
        try {
            form.prompt_text_code = prompt.prompt_text_code || '';
            form.prompt_text = prompt.prompt_text || '';
            form.language_code = prompt.language_code || '';

            const clientObj = getClientByClientId(prompt.client);
            form.auth_user_id = clientObj?.auth_user || null;

            form.is_chatbot = prompt.is_chatbot ?? true;
            form.is_aiagent = prompt.is_aiagent ?? false;
            validateCode();
            validateText();
            validateLanguage();
            isModalOpen.value = true;
        } catch (error: any) {
            showToast(error.response?.data?.message || transStore.t('prompt.notification.fetch.edit.error'),
                error.response?.data?.detail ? [error.response.data.detail] : [transStore.t('prompt.notification.general.error')], 'error');
            isModalOpen.value = true;
        } finally {
            isSubmitting.value = false;
        }
    };

// 4. Save / Update
    const handleFormSubmit = async () => {
        validateCode();
        validateText();
        validateLanguage();
        if (isFormInvalid.value) {
            showToast(transStore.t('toast.validation.error'), [transStore.t('prompt.notification.form.invalid')], 'error');
            return;
        }

        isSubmitting.value = true;
        statusMessage.value = { text: '', type: '' };

        try {
            let response;
            const payload = {
                prompt_text_code: form.prompt_text_code,
                prompt_text: form.prompt_text,
                language_code: form.language_code,
                auth_user_id: form.auth_user_id, // API expects auth_user_id
                is_chatbot: form.is_chatbot,
                is_aiagent: form.is_aiagent,
            };

            if (isEditing.value && currentPromptId.value) {
                response = await promptStore.updatePromptConfig(currentPromptId.value, payload);
            } else {
                response = await promptStore.createPromptConfig(payload);
            }

            if (response) {
                showToast(transStore.t('toast.success'), [response?.message || transStore.t('prompt.notification.save.success')], 'success');
                setTimeout(async () => {
                    closeCreateModal();
                    await promptStore.fetchPromptConfigs();
                }, 500);
            }
        } catch (error: any) {
            showToast(
                error.response?.data?.message || transStore.t('prompt.notification.save.error'),
                error.response?.data?.detail ? [error.response.data.detail] : [transStore.t('prompt.notification.general.error')],
                'error'
            );
        } finally {
            isSubmitting.value = false;
        }
    };

// 5. Open Delete Modal
    const openDeleteModal = (prompt: any) => {
        selectedPrompt.value = {
            ...prompt,
            client_name: getClientName(prompt.client),
            language_name: getLanguageName(prompt.language_code)
        };
        statusMessage.value = { text: '', type: '' };
        isDeleteModalOpen.value = true;
    };

// 6. Confirm Delete
    const handleConfirmDelete = async () => {
        if (!selectedPrompt.value) return;
        isSubmitting.value = true;
        statusMessage.value = { text: '', type: '' };
        try {
            const response = await promptStore.deletePromptConfig(selectedPrompt.value.id);
            if (response) {
                showToast(transStore.t('toast.success'), [response?.message || transStore.t('prompt.notification.delete.success')], 'success');
                setTimeout(() => {
                    isDeleteModalOpen.value = false;
                    selectedPrompt.value = null;
                    promptStore.fetchPromptConfigs();
                }, 500);
            }
        } catch (error: any) {
            showToast(
                error.response?.data?.message || transStore.t('prompt.notification.validation.failed'),
                error.response?.data?.detail ? [error.response.data.detail] : [transStore.t('prompt.notification.general.error')],
                'error'
            );
        } finally {
            isSubmitting.value = false;
        }
    };

    const resetForm = () => {
        Object.assign(form, {
            prompt_text_code: '',
            prompt_text: '',
            language_code: '',
            auth_user_id: null, // Keep as auth_user_id for API
            is_chatbot: true,
            is_aiagent: false,
        });
        errors.prompt_text_code = '';
        errors.prompt_text = '';
        errors.language_code = '';
        clientSearchQuery.value = '';
    };

    const closeCreateModal = () => {
        isModalOpen.value = false;
        resetForm();
    };

    const filteredClientOptions = computed(() => {
        const clients = (promptStore.clients || []) as any[];
        const q = clientSearchQuery.value.toLowerCase();
        if (!q) return clients;
        return clients.filter(c =>
            (c.full_name || '').toLowerCase().includes(q) ||
            (c.username || '').toLowerCase().includes(q) ||
            (c.email || '').toLowerCase().includes(q) ||
            (c.company_name || '').toLowerCase().includes(q)
        );
    });

    const selectedClientLabel = computed(() => {
        if (!form.auth_user_id) return null;
        const clients = (promptStore.clients || []) as any[];
        return clients.find(c => c.auth_user === form.auth_user_id) || null;
    });

    const selectClient = (client: any) => {
        form.auth_user_id = client.auth_user;
        clientSearchQuery.value = '';
        isClientDropdownOpen.value = false;
    };

    const clearClient = () => {
        form.auth_user_id = null;
        clientSearchQuery.value = '';
    };

    const getClientInitials = (name?: string | null): string => {
        if (!name) return '?';
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) return '?';
        const first = parts[0]!.charAt(0).toUpperCase();
        if (parts.length === 1) return first;
        return (first + parts[parts.length - 1]!.charAt(0).toUpperCase());
    };

// Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
        const dropdown = document.getElementById('client-dropdown');
        if (dropdown && !dropdown.contains(event.target as Node)) {
            isClientDropdownOpen.value = false;
        }
    };

    onMounted(async () => {
        if (promptStore.promptConfigs && promptStore.promptConfigs.length > 0)
        {

            isPromptTableLoading.value = false;
            return;
        }
        try {
            isPromptTableLoading.value = true;
            await promptStore.fetchPromptConfigs();
            await promptStore.fetchClients();
            isPromptTableLoading.value = false;

        } catch (error) {
            console.error("Failed to sync data:", error);
        } finally {

        }
    });

    return {
        promptStore, transStore, authStore, availableLanguages,
        searchQuery, clientSearchQuery, isClientDropdownOpen, isSubmitting,pageNumbers,goToPage,nextPage,isFormInvalid,
        currentPage, itemsPerPage, sortBy, sortDirection,openDeleteModal,prevPage,closeCreateModal,validateCode,validateLanguage,validateText,
        selectedPrompt, isModalOpen, isDeleteModalOpen, isViewModalOpen, isEditing,getClientInitials,selectedClientLabel,clearClient,filteredClientOptions,selectClient,formatDate,
        form, errors, toastMessage, paginatedPromptConfigs, totalPages,handleSort,openViewModal,
        handleFormSubmit, handleConfirmDelete, openEditModal, resetForm,filteredPromptConfigs,
        getLanguageName, getClientName, getClientByClientId,isChildModule, breadcrumbItems,isPromptTableLoading,clientMap,getInitials,resolveClientName,
        openAddModal: () => { isEditing.value = false; resetForm(); isModalOpen.value = true; }
    };
}