import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useTranslationStore } from '@/stores/translationStore';

export function useLogin() {
    const router = useRouter();
    const authStore = useAuthStore();
    const transStore = useTranslationStore();
    const isTranslationLogin = ref(false);

    const form = reactive({
        email: '',
        password: '',
        remember: false
    });

    const errorMessage = ref('');
    const successMessage = ref('');
    const errors = reactive({ email: '', password: '' });
    let messageTimeout: any = null;

    const clearMessages = () => {
        if (messageTimeout) clearTimeout(messageTimeout);
        errorMessage.value = '';
        successMessage.value = '';
    };

    const showMessage = (type: 'error' | 'success', message: string) => {
        clearMessages();
        if (type === 'error') errorMessage.value = message;
        else successMessage.value = message;
        messageTimeout = setTimeout(() => clearMessages(), 5000);
    };

    const handleLogin = async () => {
        errors.email = '';
        errors.password = '';
        clearMessages();

        // Basic Validation
        if (!form.email) errors.email = 'Email is required';
        if (!form.password) errors.password = 'Password is required';
        if (errors.email || errors.password) return;

        try {
            await authStore.login({ email: form.email, password: form.password });

            // Handle "Remember Me"
            if (form.remember) {
                localStorage.setItem('rememberedEmail', form.email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            showMessage('success', 'Login successful! Redirecting...');
            const defaultModuleId =authStore.moduleId;
            await transStore.loadTranslations(defaultModuleId);
            authStore.navigateToDefaultRoute();

            //setTimeout(() => router.push('/admin'), 1500);

        } catch (err: any) {
            showMessage('error', err.response?.data?.detail || 'Login failed. Please check credentials.');
        }
        finally{

        }
    };

    onMounted(async () => {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            form.email = rememberedEmail;
            form.remember = true;
        }


    });

    onUnmounted(() => {
        clearMessages();
        // Ensure loading state is reset if the user navigates away mid-request
        authStore.loading = false;
    });

    return {
        form,
        errors,
        errorMessage,
        successMessage,
        authStore, // Return store to access authStore.loading in template
        handleLogin,
        clearMessages,
        isTranslationLogin
    };
}