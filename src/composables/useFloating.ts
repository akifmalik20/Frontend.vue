import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useTranslationStore } from '@/stores/translationStore';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface SearchUser {
    id: number | string;
    username: string;
    full_name?: string;
    email?: string;
    user_type?: string;
    avatar?: string;
    is_active?: boolean;
    client_company?: string;
}

export interface RecentUser {
    id: number | string;
    username: string;
    full_name?: string;
    user_type?: string;
}

export interface NotificationPayload {
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T {
    let timer: ReturnType<typeof setTimeout> | null = null;
    return function (this: any, ...args: Parameters<T>) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    } as T;
}

// ─── Composable ───────────────────────────────────────────────────────────────

export function useFloatingSwitchUser() {
    const authStore = useAuthStore();
    const transStore = useTranslationStore();

    // ── State ──────────────────────────────────────────────────────────────────

    const isExpanded = ref(false);
    const isImpersonationExpanded = ref(true);
    const searchQuery = ref('');
    const searchResults = ref<SearchUser[]>([]);
    const selectedUser = ref<SearchUser | null>(null);
    const isSearching = ref(false);
    const error = ref('');
    const recentUsers = ref<RecentUser[]>([]);

    // ── Computed ───────────────────────────────────────────────────────────────

    const getUserType = computed(() => {
        if (!authStore.userProfile) return '';
        if (authStore.isClient) return 'Client';
        if (authStore.isCustomUser) return 'User';
        if (authStore.isAdmin) return 'Admin';
        return 'User';
    });

    const getUserTypeClass = computed(() => {
        if (!authStore.userProfile) return '';
        if (authStore.isClient) return 'badge-client';
        if (authStore.isCustomUser) return 'badge-user';
        if (authStore.isAdmin) return 'badge-admin';
        return 'badge-user';
    });

    // ── Helpers ────────────────────────────────────────────────────────────────

    function getAvatarColor(userType?: string) {
        const colors: Record<string, string> = {
            admin: 'bg-purple-100 text-purple-700',
            client: 'bg-blue-100 text-blue-700',
            user: 'bg-green-100 text-green-700',
            default: 'bg-gray-100 text-gray-700',
        };
        return colors[userType ?? 'default'] ?? colors['default'];
    }

    function showNotification({ type, title, message }: NotificationPayload): void {
        window.dispatchEvent(
            new CustomEvent('show-notification', { detail: { type, title, message } })
        );
        console.log(`[${type}] ${title}: ${message}`);
    }

    function addToRecentUsers(user: SearchUser): void {
        const recent = recentUsers.value.filter((u) => u.id !== user.id);
        recent.unshift({
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            user_type: user.user_type,
        });
        recentUsers.value = recent.slice(0, 5);
        localStorage.setItem('recent_impersonations', JSON.stringify(recentUsers.value));
    }

    // ── Panel Controls ─────────────────────────────────────────────────────────

    function expandPanel(): void {
        isExpanded.value = true;
    }

    function collapsePanel(): void {
        isExpanded.value = false;
    }

    // ── Search ─────────────────────────────────────────────────────────────────

    function clearSearch(): void {
        searchQuery.value = '';
        selectedUser.value = null;
        searchResults.value = [];
        error.value = '';
    }

    function selectUser(user: SearchUser): void {
        selectedUser.value = user;
        searchQuery.value = user.username;
        searchResults.value = [user];
        error.value = '';
    }

    const debouncedSearch = debounce(async () => {
        if (searchQuery.value.length < 2) {
            searchResults.value = [];
            return;
        }

        isSearching.value = true;
        error.value = '';

        try {
            const results = await (authStore as any).searchUsers(searchQuery.value);
            searchResults.value = results;
        } catch (err) {
            console.error('Search error:', err);
            error.value = transStore.t('impersonation.fail.search');
        } finally {
            isSearching.value = false;
        }
    }, 300);

    // ── Switch / Return ────────────────────────────────────────────────────────

    async function switchUser(): Promise<void> {
        if (!selectedUser.value) {
            error.value = transStore.t('impersonation.select.user');
            return;
        }

        try {
            const result = await (authStore as any).switchUser(selectedUser.value.username);

            if (result.success) {
                addToRecentUsers(selectedUser.value);
                isExpanded.value = false;
                clearSearch();
                showNotification({
                    type: 'success',
                    title: 'Switched User',
                    message: `Now viewing as ${selectedUser.value.full_name || selectedUser.value.username}`,
                });
            } else {
                error.value = result.error || transStore.t('impersonation.switch.fail');
            }
        } catch (err: any) {
            console.error('Switch user error:', err);
            error.value = err.response?.data?.error || transStore.t('impersonation.error.switch');
        }
    }

    async function quickSwitch(user: SearchUser): Promise<void> {
        selectUser(user);
        await switchUser();
    }

    async function returnToAdmin(): Promise<void> {
        try {
            const result = await (authStore as any).returnToAdmin();
            if (result.success) {
                showNotification({
                    type: 'success',
                    title: transStore.t('impersonation.return.admin'),
                    message: transStore.t('impersonation.welcome.admin'),
                });
            } else {
                showNotification({
                    type: 'error',
                    title: transStore.t('impersonation.error'),
                    message: result.error || transStore.t('impersonation.fail.return.admin'),
                });
            }
        } catch (err) {
            console.error('Failed to return to admin:', err);
            showNotification({
                type: 'error',
                title: transStore.t('impersonation.error'),
                message: transStore.t('impersonation.fail.return.admin'),
            });
        }
    }

    // ── Keyboard Shortcut ──────────────────────────────────────────────────────

    function handleKeyboardShortcut(e: KeyboardEvent): void {
        if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
            e.preventDefault();
            if (authStore.isAdmin && !authStore.isImpersonating) {
                isExpanded.value = true;
                nextTick(() => {
                    (document.querySelector('.search-input') as HTMLInputElement)?.focus();
                });
            }
        }
    }

    // ── Lifecycle ──────────────────────────────────────────────────────────────

    onMounted(() => {
        const stored = localStorage.getItem('recent_impersonations');
        if (stored) {
            try {
                recentUsers.value = JSON.parse(stored).slice(0, 5);
            } catch (e) {
                console.error('Failed to parse recent impersonations:', e);
            }
        }
        window.addEventListener('keydown', handleKeyboardShortcut);
    });

    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeyboardShortcut);
    });

    // ── Watchers ───────────────────────────────────────────────────────────────

    watch(isExpanded, async (val) => {
        if (val) {
            await nextTick();
            (document.querySelector('.search-input') as HTMLInputElement)?.focus();
        }
    });

    watch(
        () => (authStore as any).impersonating,
        (newVal) => {
            console.log('🎭 FloatingSwitchUser detected impersonation change:', newVal);
            if (newVal) {
                isImpersonationExpanded.value = true;
            } else {
                isExpanded.value = false;
                isImpersonationExpanded.value = false;
            }
        },
        { immediate: true }
    );

    // ── Return ─────────────────────────────────────────────────────────────────

    return {
        // Stores
        authStore,
        transStore,

        // State
        isExpanded,
        isImpersonationExpanded,
        searchQuery,
        searchResults,
        selectedUser,
        isSearching,
        error,
        recentUsers,

        // Computed
        getUserType,
        getUserTypeClass,

        // Helpers
        getAvatarColor,

        // Panel
        expandPanel,
        collapsePanel,

        // Search
        clearSearch,
        selectUser,
        debouncedSearch,

        // Actions
        switchUser,
        quickSwitch,
        returnToAdmin,
    };
}