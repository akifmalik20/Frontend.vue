import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';

// Define response types
interface PasswordResetResponse {
    success: boolean;
    message?: string;
    user_type?: string;
}

export function usePasswordReset() {
    const route = useRoute();
    const router = useRouter();
    const userStore = useUserStore();

    // --- View state: 'request', 'confirm', or 'success' ---
    const view = ref<'request' | 'confirm' | 'success'>('request');

    // --- UI States ---
    const showPassword = ref(false);
    const showConfirmPassword = ref(false);
    const isSubmitting = ref(false);

    const requestForm = reactive({
        email: '',
    });

    const confirmForm = reactive({
        newPassword: '',
        confirmPassword: '',
    });

    const resetToken = reactive({
        uid: '',
        token: '',
    });

    const toast = reactive({
        show: false,
        title: '',
        messages: [] as string[],
        type: 'success' as 'success' | 'error',
    });

    const successMessage = reactive({
        title: 'Check Your Email!',
        description: 'If an account exists with this email, you will receive a password reset link shortly.',
    });

    // --- Methods ---
    const showToast = (title: string, messages: string[], type: 'success' | 'error' = 'success') => {
        toast.title = title;
        toast.messages = messages;
        toast.type = type;
        toast.show = true;

        setTimeout(() => {
            toast.show = false;
        }, 5000);
    };

    const handleRequestReset = async () => {
        isSubmitting.value = true;
        try {
            const response = await userStore.requestPasswordReset(requestForm.email) as PasswordResetResponse;

            if (response.success) {
                view.value = 'success';
                successMessage.title = 'Check Your Email!';
                successMessage.description = response.message || 'If an account exists with this email, you will receive a password reset link shortly.';
            }
        } catch (error: any) {
            showToast(
                'Error',
                [error.response?.data?.message || 'Failed to send reset link. Please try again.'],
                'error'
            );
        } finally {
            isSubmitting.value = false;
        }
    };

    const handleConfirmReset = async () => {
        if (confirmForm.newPassword !== confirmForm.confirmPassword) {
            showToast('Error', ['Passwords do not match'], 'error');
            return;
        }

        isSubmitting.value = true;
        try {
            const response = await userStore.confirmPasswordReset(
                resetToken.uid,
                resetToken.token,
                confirmForm.newPassword
            ) as PasswordResetResponse;

            if (response.success) {
                view.value = 'success';
                successMessage.title = 'Password Reset Successful!';
                successMessage.description = 'Your password has been reset successfully. You can now log in with your new password.';

                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            }
        } catch (error: any) {
            showToast(
                'Error',
                [error.response?.data?.message || 'Failed to reset password. The link may be invalid or expired.'],
                'error'
            );
        } finally {
            isSubmitting.value = false;
        }
    };

    onMounted(async () => {
        const uid = route.params.uid as string;
        const token = route.params.token as string;

        if (uid && token) {
            resetToken.uid = uid;
            resetToken.token = token;
            view.value = 'confirm';

            try {
                await userStore.validateResetToken(uid, token);
            } catch (error: any) {
                showToast(
                    'Invalid Link',
                    ['This password reset link is invalid or has expired. Please request a new one.'],
                    'error'
                );

                setTimeout(() => {
                    view.value = 'request';
                    router.push('/password-reset');
                }, 3000);
            }
        }
    });

    return {
        view,
        showPassword,
        showConfirmPassword,
        isSubmitting,
        requestForm,
        confirmForm,
        toast,
        successMessage,
        handleRequestReset,
        handleConfirmReset,
        showToast,
        userStore
    };
}