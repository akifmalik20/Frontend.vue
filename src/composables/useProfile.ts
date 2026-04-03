import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { axiosInstance } from '@/utils/axiosInstance';
import {useTranslationStore} from "@/stores/translationStore";

export function useProfile() {
    const authStore = useAuthStore();
    const fileInput = ref<HTMLInputElement | null>(null);
    const transStore = useTranslationStore();

    // --- Tab Management ---
    const activeTab = ref('profile');

    // --- Form Data ---
    const formData = ref({
        first_name: '',
        last_name: '',
        phone: '',
        company_name: '',
        avatar: '',
        full_name: ''
    });

    const originalData = ref<Record<string, any>>({});
    const loading = ref(false);
    const updating = ref(false);
    const errorMessage = ref('');
    const successMessage = ref('');
    const avatarFile = ref<File | null>(null);

    // --- Computed Properties ---
    const userTypeDisplay = computed(() => {
        if (authStore.isAdmin) return 'Administrator';
        if (authStore.isClient) return 'Client Account';
        if (authStore.isCustomUser) return 'Team Member';
        return 'User';
    });

    const userTypeBadgeColor = computed(() => {
        if (authStore.isAdmin) return 'bg-gradient-to-r from-emerald-500 to-emerald-600';
        if (authStore.isClient) return 'bg-gradient-to-r from-teal-500 to-teal-600';
        if (authStore.isCustomUser) return 'bg-gradient-to-r from-green-500 to-green-600';
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
    });

    const hasChanges = computed(() => {
        return JSON.stringify(formData.value) !== JSON.stringify(originalData.value) || avatarFile.value !== null;
    });

    const avatarUrl = computed(() => {
        const avatar = formData.value.avatar;
        if (!avatar) return '';
        if (avatar.startsWith('data:') || avatar.startsWith('http')) return avatar;

        const base = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
        const path = avatar.startsWith('/') ? avatar : `/${avatar}`;
        return `${base}${path}`;
    });

    const userInitials = computed(() => {
        const first = formData.value.first_name?.[0] || '';
        const last = formData.value.last_name?.[0] || '';
        return (first + last).toUpperCase() || authStore.userProfile.username?.[0]?.toUpperCase() || 'U';
    });

    // --- Methods ---
    const loadProfileData = () => {
        const profile = authStore.userProfile;

        formData.value = {
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            phone: profile.phone || '',
            company_name: profile.company_name || '',
            avatar: profile.avatar || '',
            full_name: profile.full_name || ''
        };

        originalData.value = { ...formData.value };
        errorMessage.value = '';
        successMessage.value = '';
    };

    const triggerFileInput = () => {
        fileInput.value?.click();
    };

    const handleAvatarUpload = (event: Event) => {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];

            if (file.size > 2 * 1024 * 1024) {
                errorMessage.value = transStore.t('profile.file.size.error');
                setTimeout(() => (errorMessage.value = ''), 5000);
                return;
            }

            if (!file.type.match('image.*')) {
                errorMessage.value = transStore.t('profile.image.error');;
                setTimeout(() => (errorMessage.value = ''), 5000);
                return;
            }

            avatarFile.value = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                formData.value.avatar = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const removeAvatar = () => {
        formData.value.avatar = '';
        avatarFile.value = null;
        if (fileInput.value) fileInput.value.value = '';
    };

    const updateProfile = async () => {
        if (!hasChanges.value) {
            errorMessage.value = transStore.t('profile.no.changes.detected');
            setTimeout(() => (errorMessage.value = ''), 3000);
            return;
        }

        updating.value = true;
        errorMessage.value = '';
        successMessage.value = '';

        try {
            const userProfile = authStore.userProfile;
            const userType = userProfile.user_type;
            const userId = userProfile.user_id || userProfile.client_id || userProfile.id;

            if (!userId) {
                throw new Error(`User ID not found for user_type="${userType}".`);
            }

            const endpoint = `/api/users/account/update/${userId}/`;
            const formDataObj = new FormData();

            // Append only changed fields
            if (formData.value.first_name !== (originalData.value as any).first_name) {
                formDataObj.append('first_name', formData.value.first_name);
            }
            if (formData.value.last_name !== (originalData.value as any).last_name) {
                formDataObj.append('last_name', formData.value.last_name);
            }
            if (formData.value.phone !== (originalData.value as any).phone) {
                formDataObj.append('phone', formData.value.phone);
            }
            if (userType === 'client' && formData.value.company_name !== (originalData.value as any).company_name) {
                formDataObj.append('company_name', formData.value.company_name);
            }
            if (avatarFile.value) {
                formDataObj.append('avatar', avatarFile.value);
            }

            const response = await axiosInstance.put(endpoint, formDataObj, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success && response.data.data) {
                const serverData = response.data.data;

                const updatedProfile = {
                    ...authStore.userProfile,
                    ...serverData,
                    user_type: userType, // Keep original user_type
                };

                authStore.updateUserProfile(updatedProfile);
                loadProfileData();

                avatarFile.value = null;
                if (fileInput.value) fileInput.value.value = '';

                successMessage.value = response.data.message || transStore.t('profile.update.success');
                setTimeout(() => (successMessage.value = ''), 5000);
            }
        } catch (error: any) {
            console.error('❌ Update error:', error);
            errorMessage.value = error.response?.data?.message || error.response?.data?.detail || transStore.t('profile.update.failed');
            setTimeout(() => (errorMessage.value = ''), 8000);
        } finally {
            updating.value = false;
        }
    };

    const resetForm = () => {
        loadProfileData();
        avatarFile.value = null;
        if (fileInput.value) fileInput.value.value = '';
    };

    // --- Watchers ---
    watch(
        () => [formData.value.first_name, formData.value.last_name],
        () => {
            formData.value.full_name = `${formData.value.first_name} ${formData.value.last_name}`.trim();
        },
        { immediate: true }
    );

    onMounted(() => {
        loadProfileData();
    });

    return {
        fileInput, activeTab, formData, loading, updating,
        errorMessage, successMessage, userTypeDisplay,
        userTypeBadgeColor, hasChanges, avatarUrl, userInitials,
        triggerFileInput, handleAvatarUpload, removeAvatar,
        updateProfile, resetForm, authStore,transStore
    };
}