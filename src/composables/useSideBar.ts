import { computed, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useTranslationStore } from '@/stores/translationStore';
import { storeToRefs } from 'pinia';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface RawModule {
    id: number | string;
    code: string;
    description: string;
    icon: string | null;
    url: string | null;
    parent_id: number | null;
    is_active: boolean;
    user_module_is_active?: boolean;
    sequence?: number;
    is_default?: boolean;
    children?: RawModule[];
}

export interface Module {
    id: number | string;
    title: string;
    icon: string;
    to: string;
}

export interface ModuleWithChildren extends Module {
    children?: RawModule[];
}

// ─── Composable ───────────────────────────────────────────────────────────────

export function useSidebar() {
    const router = useRouter();
    const route = useRoute();

    const authStore = useAuthStore();
    const { modules, userProfile } = storeToRefs(authStore);
    const transStore = useTranslationStore();

    // ── State ──────────────────────────────────────────────────────────────────

    const isCollapsed = ref(false);
    const localModules = ref<ModuleWithChildren[]>([]);
    const originalModules = ref<ModuleWithChildren[]>([]);
    const hasChanges = ref(false);
    const isSaving = ref(false);
    const saveSuccess = ref(false);
    const draggedIndex = ref<number | null>(null);
    const draggedOverIndex = ref<number | null>(null);
    const activeParentModule = ref<RawModule | null>(null);
    const isLoadingTranslation = ref(false);

    // ── Computed ───────────────────────────────────────────────────────────────

    const activeParentChildren = computed<RawModule[]>(() => {
        if (!activeParentModule.value) return [];
        return (activeParentModule.value.children || []).filter(
            (child) => child.is_active && (child.user_module_is_active ?? true)
        );
    });

    // ── Helpers ────────────────────────────────────────────────────────────────

    function isParentItemActive(item: ModuleWithChildren): boolean {
        const path = (route.path || '').replace(/\/$/, '');
        if (item.to && item.to.replace(/\/$/, '') === path) return true;
        const children = item.children || [];
        return children.some((c) => c.url && c.url.replace(/\/$/, '') === path);
    }

    function initializeModulesFromStore(newModules?: RawModule[] | null): void {
        const sourceModules = newModules ?? (modules.value as RawModule[] | null);

        if (!sourceModules || sourceModules.length === 0) {
            localModules.value = [];
            originalModules.value = [];
            hasChanges.value = false;
            draggedIndex.value = null;
            draggedOverIndex.value = null;
            activeParentModule.value = null;
            return;
        }

        const parentModules = sourceModules
            .filter(
                (m) =>
                    m.is_active &&
                    (m.user_module_is_active ?? true) &&
                    (m.parent_id === null || m.parent_id === undefined)
            )
            .sort((a, b) => (a.sequence || 999) - (b.sequence || 999));

        localModules.value = parentModules.map((m) => ({
            id: m.id,
            title: m.description,
            icon: m.icon || 'fa-solid fa-home',
            to: m.url || '',
            children: m.children || [],
        }));

        originalModules.value = JSON.parse(JSON.stringify(localModules.value));
    }

    function checkForChanges(): void {
        const hasOrderChanged = localModules.value.some((module, index) => {
            return module.id !== originalModules.value[index]?.id;
        });
        hasChanges.value = hasOrderChanged;
    }

    // ── Watchers ───────────────────────────────────────────────────────────────

    // Sync modules from store (skip if user has unsaved reorder changes)
    watch(
        modules,
        (newModules) => {
            if (hasChanges.value) return;
            initializeModulesFromStore(newModules as unknown as RawModule[]);
        },
        { immediate: true }
    );

    // Reset sidebar when the logged-in user changes
    watch(
        () => userProfile.value?.id,
        () => {
            initializeModulesFromStore();
        }
    );

    // Open correct parent panel based on current route
    watch(
        () => route.path,
        (path) => {
            if (!path) return;
            const normalizedPath = path.replace(/\/$/, '');
            const allModules = (modules.value as RawModule[]) || [];

            for (const parent of allModules) {
                if (!parent.children?.length) continue;
                const hasMatchingChild = parent.children.some(
                    (c) => c.url && c.url.replace(/\/$/, '') === normalizedPath
                );
                if (hasMatchingChild) {
                    activeParentModule.value = parent;
                    return;
                }
            }

            // Current route belongs to a parent or an unrelated URL
            activeParentModule.value = null;
        },
        { immediate: true }
    );

    // ── Handlers ───────────────────────────────────────────────────────────────

    async function handleChildClick(child: RawModule): Promise<void> {
        console.log('Clicked Child:', child.description);
        console.log('Module ID:', child.id);
        console.log('Module Code:', child.code);

        isLoadingTranslation.value = true;
        await transStore.loadTranslations(child.id as any);
        isLoadingTranslation.value = false;
    }

    async function handleParentClick(item: ModuleWithChildren): Promise<void> {
        const rawModule = (modules.value as RawModule[]).find((m) => m.id === item.id);
        if (!rawModule) return;

        console.log('Module Code:', rawModule.code);
        console.log('Module ID:', rawModule.id);

        isLoadingTranslation.value = true;
        if (rawModule.id !== 20) {
            await transStore.loadTranslations(rawModule.id as any);
        }
        isLoadingTranslation.value = false;

        if (item.children && item.children.length) {
            activeParentModule.value = rawModule;
        } else if (item.to) {
            router.push(item.to);
        }
    }

    function goBackToParents(): void {
        activeParentModule.value = null;
    }

    // Drag & Drop
    function handleDragStart(index: number): void {
        draggedIndex.value = index;
    }

    function handleDragOver(e: DragEvent, index: number): void {
        e.preventDefault();
        draggedOverIndex.value = index;
    }

    function handleDrop(e: DragEvent, dropIndex: number): void {
        e.preventDefault();
        draggedOverIndex.value = null;

        if (draggedIndex.value === null || draggedIndex.value === dropIndex) {
            return;
        }

        const newModules = [...localModules.value];
        const draggedItem = newModules[draggedIndex.value];

        if (!draggedItem) {
            draggedIndex.value = null;
            return;
        }

        newModules.splice(draggedIndex.value, 1);
        newModules.splice(dropIndex, 0, draggedItem);

        localModules.value = newModules;
        draggedIndex.value = null;

        checkForChanges();
    }

    function handleDragEnd(): void {
        draggedIndex.value = null;
        draggedOverIndex.value = null;
    }

    // Save / Cancel
    async function handleSave(): Promise<void> {
        if (isSaving.value) return;

        isSaving.value = true;
        saveSuccess.value = false;

        try {
            const sequenceData = localModules.value.map((module, index) => ({
                user_id: userProfile.value.id,
                module_id: module.id,
                sequence: index + 1,
            }));

            await authStore.saveModuleSequence(sequenceData);

            originalModules.value = JSON.parse(JSON.stringify(localModules.value));
            hasChanges.value = false;
            saveSuccess.value = true;

            setTimeout(() => {
                saveSuccess.value = false;
            }, 2000);
        } catch (error) {
            console.error('Error saving module sequence:', error);
        } finally {
            isSaving.value = false;
        }
    }

    function handleCancel(): void {
        if (isSaving.value) return;

        localModules.value = JSON.parse(JSON.stringify(originalModules.value));
        hasChanges.value = false;
        saveSuccess.value = false;
        draggedIndex.value = null;
        draggedOverIndex.value = null;
        activeParentModule.value = null;
    }

    // ── Return ─────────────────────────────────────────────────────────────────

    return {
        // Store refs (read-only in template)
        userProfile,

        // State
        isCollapsed,
        localModules,
        hasChanges,
        isSaving,
        saveSuccess,
        draggedIndex,
        draggedOverIndex,
        activeParentModule,
        isLoadingTranslation,

        // Computed
        activeParentChildren,

        // Helpers
        isParentItemActive,

        // Handlers
        handleChildClick,
        handleParentClick,
        goBackToParents,
        handleDragStart,
        handleDragOver,
        handleDrop,
        handleDragEnd,
        handleSave,
        handleCancel,
    };
}