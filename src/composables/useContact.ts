import { onMounted, ref, computed, reactive } from 'vue';
import { useContactStore } from '@/stores/contactStore';
import { useTranslationStore } from '@/stores/translationStore';
import { useAuthStore } from '@/stores/authStore';
import { useModuleBreadcrumb } from '@/composables/useModuleBreadcrumb';
import { useTourStore } from '@/stores/tourStore';
import Papa from 'papaparse';
export function useContact() {
    const authStore = useAuthStore();
    const { isChildModule, breadcrumbItems } = useModuleBreadcrumb();
    const tourStore = useTourStore();
    const transStore = useTranslationStore();
    const contactStore = useContactStore();

    const isAdmin = computed(() => authStore.isAdmin);
    const searchQuery = ref('');
    const isSubmitting = ref(false);
    const isHovered = ref(false);
    const isContactTableLoading = ref(false);

    // --- Pagination & Sorting States ---
    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const sortBy = ref('name');
    const sortDirection = ref('asc');

    const selectedContact = ref<any>(null);
    //const statusMessage = ref({ text: '', type: '' });
    const statusMessage = reactive({ text: '', type: '' });
    // --- Modal States ---
    const isModalOpen = ref(false);
    const isDeleteModalOpen = ref(false);
    const isViewModalOpen = ref(false);
    const isEditing = ref(false);
    const currentContactId = ref<number | null>(null);
    const isToggleModalOpen = ref(false);
    const isFetchingContactView = ref(false);
    const isUploadModalOpen = ref(false);
    // Add the 'File' type to the ref
    const selectedFile = ref<File | null>(null);

// If you are using a 'form' object as seen in your template:

    const form = reactive({
        name: '',
        phone_number: '',
       city:'',
        country:'',
        state:'',
        zip_code:'',

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

    const errors = reactive({ name: '',phone_number:'',city:'',country:'', state:'',zip_code:'',file:''});


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
        if (!form.name.trim()) errors.name =  transStore.t('contacts.required.name');
        else if (form.name.trim().length < 2) errors.name = transStore.t('contacts.short.name');
        else errors.name = "";
    };
    const validateState = () => {
        if (!form.state.trim()) errors.state =  transStore.t('contacts.required.state');
        else if (form.state.trim().length < 2) errors.state =  transStore.t('contacts.short.state');
        else errors.state = "";
    };
    const validateZipCode = () => {
        if (!form.zip_code.trim()) errors.zip_code =transStore.t('contacts.required.zip');
        else if (form.zip_code.trim().length < 4) errors.zip_code = transStore.t('contacts.short.zip');
        else errors.zip_code = "";
    };
    const validateCity = () => {
        if (!form.city.trim()) errors.city = transStore.t('contacts.required.city');
        else if (form.city.trim().length < 2) errors.city = transStore.t('contacts.short.city');
        else errors.city = "";
    };
    const validateCountry = () => {
        if (!form.country.trim()) errors.country = transStore.t('contacts.required.country');
        else if (form.country.trim().length < 2) errors.country =  transStore.t('contacts.short.country');
        else errors.country = "";
    };
    const validatePhone = () => {
        const phoneValue = form.phone_number.trim();

        if (!phoneValue) {
            errors.phone_number = transStore.t('contacts.required.phone');
        } else if (!/^[0-9]{10,15}$/.test(phoneValue)) {
            errors.phone_number = transStore.t('contacts.invalid.phone');
        } else {
            errors.phone_number = "";
        }
    };


    const isFormInvalid = computed(() => !!errors.name || !form.name || !form.phone_number|| !form.city||!form.country);

    const resetForm = () => {
        Object.assign(form, { name: '', city:'', phone_number: '', country: '' ,zip_code:'',state:''});
        errors.name = '';
        errors.city='';
        errors.country='';
        errors.zip_code='';
        errors.state='';
        errors.phone_number = '';

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
    const sortContacts = (contacT: any[]) => {
        return [...contacT].sort((a, b) => {
            let aVal = String(a[sortBy.value] || '').toLowerCase();
            let bVal = String(b[sortBy.value] || '').toLowerCase();
            return sortDirection.value === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        });
    };

 
    const filteredContacts = computed(() => {
        // Access the .data array specifically
        const contactsList = (contactStore.contacts || []) as any[];

        // Filter by search query
        const filtered = contactsList.filter(contact =>
            contact.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            contact.id?.toString().includes(searchQuery.value)
        );

        // Sort the filtered results
        return sortContacts(filtered);
    });
    const paginatedContact = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage.value;
        const end = start + itemsPerPage.value;
        const data = filteredContacts.value.slice(start, end);
        if (data.length === 0 && currentPage.value > 1) currentPage.value--;
        console.log(data)
        return data;

    });

    const totalPages = computed(() => Math.ceil(filteredContacts.value.length / itemsPerPage.value));

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
        selectedContact.value = role;
        isViewModalOpen.value = true;
    };
    const openAddModal = () => {
        isEditing.value = false;
        currentContactId.value = null;
        resetForm();
        isModalOpen.value = true;
    };
    const openAddBulkModal = () => {
        isUploadModalOpen.value = true;
        resetFormBulk();
    };

    const handleFileSelect = (event: any) => {
        const file = event.target.files[0];
        if (!file) return;
        const isCsv = file.type === 'text/csv' || file.name.endsWith('.csv');

        if (isCsv) {
            selectedFile.value = file;
            errors.file = '';
        } else {
            selectedFile.value = null;
            errors.file =  transStore.t('contacts.valid.csv');
            event.target.value = '';
        }
    };

    const handleUploadSubmit = () => {
        if (!selectedFile.value) return;

        isSubmitting.value = true;
        statusMessage.text = '';
        Papa.parse(selectedFile.value, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                // Check if results actually contain data
                if (results.data && results.data.length > 0) {
                    await uploadContacts(results.data);
                } else {
                    statusMessage.text =  transStore.t('contacts.empty.scv') ;
                    statusMessage.type = 'error';
                    isSubmitting.value = false;
                }
            },
            error: (error) => {
                statusMessage.text = transStore.t('contacts.parsing.csv') + error.message;
                statusMessage.type = 'error';
                isSubmitting.value = false;
            }
        });
    };

    const uploadContacts = async (contactsArray:any) => {
        try {
            // Your API expects: { "contacts": [...] }
            const payload = { contacts: contactsArray };

            const response = await contactStore.bulkCreateContacts( payload);


            if (response?.success) {
                showToast(
                    transStore.t('toast.success'),
                    [response?.message || transStore.t('contacts.save.success')],
                    'success'
                );

                setTimeout(() => {
                    isUploadModalOpen.value = false;
                    resetForm();
                }, 500);
                isContactTableLoading.value = true;
                await contactStore.fetchContacts();
                //await contactStore.fetchRole();
                isContactTableLoading.value = false;

            }

        }
        catch (err: any) {
            statusMessage.type = 'error';
            const data = err.response?.data;

            if (data?.errors) {
                // Map through the array and extract the string from non_field_errors
                const errorDetails = data.errors
                    .map((e: any) => {
                        // Access the first string in the non_field_errors array
                        const msg = e.errors?.non_field_errors?.[0] || "Unknown error";
                        return `Row ${e.row}: ${msg}`;
                    })
                    .join(' | ');

                statusMessage.text = `Failed: ${data.message} (${data.failed_count} errors). ${errorDetails}`;
            } else {
                statusMessage.text = data?.message;
            }
        }
        finally {
            isSubmitting.value = false;
        }
    };

    const resetFormBulk = () => {
        selectedFile.value = null;
        statusMessage.text = '';
        errors.file = '';
    };

    const openEditModal = (contact: any) => {
        isEditing.value = true;
        currentContactId.value = contact.id;
        resetForm();

        // Map the local object directly to the form
        Object.assign(form, {
            name: contact.name || '',
            phone_number: contact.phone_number|| '',
            city: contact.city || '',
            country: contact.country||'',
            zip_code:contact.zip_code || '',
            state:contact.state || '',
        });

        isModalOpen.value = true;
        //validateName();
    };
    const handleFormSubmit = async () => {
        validateName();
        validateCity();
        validatePhone();
        validateCountry();
        validateState();
        validateZipCode()
        if (isFormInvalid.value) {
            showToast(transStore.t('toast.validation.error'), [ transStore.t('contacts.form.errors.fix')], 'error');
            return;
        }
        //console.log("hy",{...form});
        isSubmitting.value = true;
        try {
            let response = isEditing.value && currentContactId.value
                ? await contactStore.updateContact(currentContactId.value, { ...form })
                : await contactStore.createContacts({ ...form });

            if (response && response.success) {
                showToast(transStore.t('toast.success'), [response?.message || transStore.t('contacts.save.success')], 'success');
                setTimeout(async () => {

                    await contactStore.fetchContacts();
                    closeCreateModal();
                }, 500);
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || transStore.t('contacts.save.error'), error.response?.data?.detail, 'error');
        } finally { isSubmitting.value = false; }
    };

    const openDeleteModal = (contact: any) => {
        selectedContact.value = contact;
        isDeleteModalOpen.value = true;
    };
    const handleConfirmDelete = async () => {
        if (!selectedContact.value) return;

        isSubmitting.value = true;

        try {
            const response = await contactStore.deleteContact(selectedContact.value.id);

            if (response?.success) {
                showToast(
                    transStore.t('toast.success'),
                    [response?.message ||transStore.t('contacts.delete.success') ],
                    'success'
                );

                setTimeout(() => {
                    isDeleteModalOpen.value = false;
                    selectedContact.value = null;
                }, 500);
                isContactTableLoading.value = true;
                await contactStore.fetchContacts();
                //await contactStore.fetchRole();
                isContactTableLoading.value = false;

            }

        } catch (error: any) {
            showToast(
                error.response?.data?.message || transStore.t('contacts.delete.fail') ,
                error.response?.data?.detail,
                'error'
            );
        } finally {
            isSubmitting.value = false;
        }
    };


    

    const formatFileSize = (size:any) => {
        if (!size) return "0 B";
        if (size < 1024) return size + " B";
        if (size < 1024 * 1024) return (size / 1024).toFixed(2) + " KB";
        return (size / (1024 * 1024)).toFixed(2) + " MB";
    };
    onMounted(async () => {
        
        if (contactStore.contacts && contactStore.contacts.length > 0)
        {

            isContactTableLoading.value = false;
            return;
        }

        try {
            //console.log("try block")

            isContactTableLoading.value = true;
            await contactStore.fetchContacts();
            //await contactStore.fetchRole();
            isContactTableLoading.value = false;
        } catch (error) {
            //console.error("Failed to sync data:", error);
        } finally {
        }
    });


    // Return everything needed by the template
    return {
        isAdmin, searchQuery, isSubmitting, isHovered, currentPage, itemsPerPage, sortBy, sortDirection,
        selectedContact, statusMessage, isModalOpen, isDeleteModalOpen, isViewModalOpen, isEditing,
        isToggleModalOpen, form, toastMessage, errors, formatDate, validateName, isFormInvalid,
        filteredContacts, paginatedContact, totalPages, pageNumbers, handleSort, goToPage,
        nextPage, prevPage, openViewModal, openAddModal, openEditModal, handleFormSubmit,
        openDeleteModal,  handleConfirmDelete,
          closeCreateModal, transStore, breadcrumbItems, isChildModule,isUploadModalOpen,selectedFile,
        contactStore,formatFileSize,
        resetForm,isContactTableLoading,
        isFetchingContactView,validateCity,validateCountry,validatePhone,validateZipCode,validateState,openAddBulkModal,handleFileSelect,handleUploadSubmit
    };
}

