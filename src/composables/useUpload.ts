import { ref, reactive, computed, onMounted } from 'vue';
import { useChatbotStore } from '@/stores/chatbotStore';
import { useModuleBreadcrumb } from '@/composables/useModuleBreadcrumb';
import { useTranslationStore } from "@/stores/translationStore";

// --- Interfaces ---
interface Document {
    title: string;
    chunk_count: number;
    file_bytes: string | null;
    // We'll generate these client-side
    id?: string;
    file_type?: string;
    file_size?: number;
    uploaded_at?: string;
    is_active?: boolean;
}

export function useDocumentManagement() {
    const transStore = useTranslationStore();
    const chatbotStore = useChatbotStore();
    const { isChildModule, breadcrumbItems } = useModuleBreadcrumb();

    // --- UI & Modal States ---
    const isSubmitting = ref(false);
    const isDownloading = ref(false);
    const statusMessage = ref({ text: '', type: '' });
    const isUploadModalOpen = ref(false);
    const isDeleteModalOpen = ref(false);
    const isViewModalOpen = ref(false);

    // --- Document Data States ---
    const selectedFile = ref<File | null>(null);
    const fileInput = ref<HTMLInputElement | null>(null);
    const documentToDelete = ref<Document| null>(null);
    const documentToView = ref<Document | null>(null);

    // --- Form State ---
    const form = reactive({
        file: null as File | null,
        user_id: JSON.parse(localStorage.getItem('user') || '{}').user_id?.toString() || '1'
    });

    const errors = reactive({
        file: ''
    });

    // --- Helper Functions ---
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const generateId = (title: string) => {
        return title.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substr(2, 6);
    };

    const getFileIcon = (document: Document) => {
        const fileName = document.title.toLowerCase();
        if (fileName.endsWith('.pdf')) return 'fa-file-pdf';
        if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) return 'fa-file-word';
        if (fileName.endsWith('.txt')) return 'fa-file-alt';
        if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) return 'fa-file-excel';
        if (fileName.endsWith('.csv')) return 'fa-file-csv';
        return 'fa-file';
    };

    const getFileIconColor = (document: Document) => {
        const fileName = document.title.toLowerCase();
        if (fileName.endsWith('.pdf')) return 'text-red-500';
        if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) return 'text-blue-500';
        if (fileName.endsWith('.txt')) return 'text-gray-500';
        if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx') || fileName.endsWith('.csv')) return 'text-green-500';
        return 'text-gray-400';
    };

    const base64ToBlob = (base64Data: string, contentType: string) => {
        const byteCharacters = atob(base64Data);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) byteNumbers[i] = slice.charCodeAt(i);
            byteArrays.push(new Uint8Array(byteNumbers));
        }
        return new Blob(byteArrays, { type: contentType });
    };

    // --- Computed ---
    const processedDocuments = computed(() => {
        if (!chatbotStore.documents) return [];
        return chatbotStore.documents.map((doc: any) => ({
            ...doc,
            id: doc.id || generateId(doc.title),
            file_type: doc.title.split('.').pop()?.toUpperCase() ?? 'FILE',
            file_size: doc.file_bytes ? Math.floor(doc.file_bytes.length * 0.75) : 0,
            uploaded_at: new Date().toISOString(),
            is_active: doc.chunk_count > 0
        }));
    });

    // --- Logic Methods ---
    const validateForm = () => {
        if (!form.file) {
            errors.file = transStore.t('document.upload.error.select.file');
            return false;
        }
        const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
        const fileExt = '.' + form.file.name.split('.').pop()?.toLowerCase();
        if (!allowedTypes.includes(fileExt)) {
            errors.file = transStore.t('document.upload.file.not.supported');
            return false;
        }
        if (form.file.size > 10 * 1024 * 1024) {
            errors.file = transStore.t('document.upload.file.size');
            return false;
        }
        errors.file = "";
        return true;
    };

    const resetForm = () => {
        form.file = null;
        selectedFile.value = null;
        errors.file = '';
        if (fileInput.value) fileInput.value.value = '';
    };

    const handleFileSelect = (event: Event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0]; // This is 'File | undefined'

        if (file) {
            // By putting it inside this 'if', TS knows it's not undefined
            form.file = file as File;
            selectedFile.value = file as File;
            errors.file = "";
        }
    };
    const handleUploadSubmit = async () => {
        if (!validateForm()) return;
        isSubmitting.value = true;
        try {
            const response = await chatbotStore.uploadDocument({ file: form.file, user_id: form.user_id });
            if (response?.success) {
                statusMessage.value = { text: response.message || "Upload success!", type: 'success' };
                setTimeout(async () => {
                    await chatbotStore.fetchDocuments();
                    isUploadModalOpen.value = false;
                    resetForm();
                }, 2000);
            }
        } catch (error: any) {
            statusMessage.value = { text: error.response?.data?.message || "Upload failed.", type: 'error' };
        } finally { isSubmitting.value = false; }
    };

    const handleViewDocument = () => {
        if (!documentToView.value?.file_bytes) return;
        isDownloading.value = true;
        try {
            const base64Data = documentToView.value.file_bytes;
            const fileName = documentToView.value.title;
            const mimeType = fileName.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream';
            const blob = base64ToBlob(base64Data, mimeType);
            const url = URL.createObjectURL(blob);

            if (fileName.toLowerCase().endsWith('.pdf')) {
                window.open(url, '_blank');
            } else {
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                link.click();
            }
            setTimeout(() => { URL.revokeObjectURL(url); isViewModalOpen.value = false; }, 1000);
        } catch (e) {
            statusMessage.value = { text: "Error opening file.", type: 'error' };
        } finally { isDownloading.value = false; }
    };

    const handleDeleteDocument = async () => {
        if (!documentToDelete.value) return;
        isSubmitting.value = true;
        try {
            const response = await chatbotStore.deleteDocument(documentToDelete.value.title);
            if (response?.success) {
                statusMessage.value = { text: "Deleted successfully!", type: 'success' };
                setTimeout(async () => {
                    await chatbotStore.fetchDocuments();
                    isDeleteModalOpen.value = false;
                }, 1500);
            }
        } catch (e: any) {
            statusMessage.value = { text: "Delete failed.", type: 'error' };
        } finally { isSubmitting.value = false; }
    };
    const openUploadModal = () => {
        resetForm();
        statusMessage.value = { text: '', type: '' };
        isUploadModalOpen.value = true;
    };
    const formatChunkCount = (count: number) => {
        return count === 1 ? '1 chunk' : `${count} chunks`;
    };
    const openDeleteModal = (document: Document) => {
        documentToDelete.value = document;
        isDeleteModalOpen.value = true;
    };

    const openViewModal = (document: Document) => {
        documentToView.value = document;
        isViewModalOpen.value = true;
        statusMessage.value = { text: '', type: '' };
    };

    const removeFile = () => {
        form.file = null;
        selectedFile.value = null;
        errors.file = '';
        if (fileInput.value) {
            fileInput.value.value = '';
        }
    };
    onMounted(() => { chatbotStore.fetchDocuments(); });

    return {
        transStore, chatbotStore, isChildModule, breadcrumbItems,
        isSubmitting, statusMessage, isUploadModalOpen, isDeleteModalOpen, isViewModalOpen,
        selectedFile, fileInput, documentToDelete, documentToView, isDownloading,
        form, errors, processedDocuments,openViewModal,openDeleteModal,
        formatFileSize, getFileIcon, getFileIconColor,removeFile,
        handleFileSelect, handleUploadSubmit, handleViewDocument, formatChunkCount,handleDeleteDocument,openUploadModal,
        resetForm, triggerFileInput: () => fileInput.value?.click()
    };
}