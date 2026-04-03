import { ref, computed, onMounted, reactive } from 'vue'
import { useModuleStore } from '@/stores/moduleStore'
import { useUserStore }   from '@/stores/userStore'
import { useAuthStore }   from '@/stores/authStore'
import { useTranslationStore } from '@/stores/translationStore'

export function useModuleAssignment() {
    const moduleStore = useModuleStore()
    const userStore   = useUserStore()
    const authStore   = useAuthStore()
    const transStore  = useTranslationStore()
    const isModuleLoading = ref(false);

    // ─────────────────────────────────────────────────────────
    // INTERFACES
    // ─────────────────────────────────────────────────────────

    interface RawModule {
        id:           number
        code:         string
        description?: string
        icon?:        string | null
        url?:         string | null
        is_active?:   boolean
        [key: string]: any
    }

    interface Assignment {
        id:               number
        user_id:          number
        module_id:        number
        module_name:      string
        module_code:      string
        module_parent_id: number | null
        sequence:         number
        is_active:        boolean
        is_default:       boolean
        [key: string]: any
    }

    interface ModalRow {
        module_id:        number
        label:            string
        code:             string
        checked:          boolean
        parent_id:        number | null
        wasAssigned:      boolean
        originalParentId: number | null
    }

    // ─────────────────────────────────────────────────────────
    // TARGETS
    // ─────────────────────────────────────────────────────────

    const selectedTargetId = ref<number | null>(null)

    const targets = computed(() => {
        if (authStore.user?.is_superuser) {
            return (userStore.clients as any[]).map(c => ({
                id: c.id, auth_user: c.auth_user,
                label: c.full_name || c.username + (c.company_name ? ' - ' + c.company_name : ''),
            }))
        }
        return (userStore.users as any[]).map(u => ({
            id: u.id, auth_user: u.auth_user,
            label: (u.full_name || u.username) + ' (' + u.email + ')',
        }))
    })

    const onTargetChange = async () => {
        searchInput.value = ''; searchQuery.value = ''; currentPage.value = 1
        collapsedParents.value = new Set()
        if (!selectedTargetId.value) { moduleStore.clearCurrentAssigned(); return }
        await moduleStore.fetchAssignedModules(selectedTargetId.value)
    }

    // ─────────────────────────────────────────────────────────
    // ASSIGNED TABLE  –  search / sort / pagination
    // ─────────────────────────────────────────────────────────

    const searchInput  = ref('')
    const searchQuery  = ref('')
    const sortKey      = ref<string | null>(null)
    const sortAsc      = ref(true)
    const currentPage  = ref(1)
    const itemsPerPage = ref(10)

    let _searchTimer: ReturnType<typeof setTimeout> | null = null
    const handleSearch = () => {
        if (_searchTimer) clearTimeout(_searchTimer)
        _searchTimer = setTimeout(() => { searchQuery.value = searchInput.value; currentPage.value = 1 }, 250)
    }

    const handleSort = (key: string) => {
        sortKey.value === key
            ? (sortAsc.value = !sortAsc.value)
            : (sortKey.value = key, sortAsc.value = true)
        currentPage.value = 1
    }

    // ─────────────────────────────────────────────────────────
    // ASSIGNED TABLE  –  hierarchical tree
    // ─────────────────────────────────────────────────────────

    const collapsedParents = ref<Set<number>>(new Set())
    const toggleCollapse   = (mid: number) => {
        const s = new Set(collapsedParents.value)
        s.has(mid) ? s.delete(mid) : s.add(mid)
        collapsedParents.value = s
    }
    const isCollapsed = (mid: number) => collapsedParents.value.has(mid)

    const assignedTree = computed(() => {
        const q   = searchQuery.value.toLowerCase()
        const all = moduleStore.currentAssigned as Assignment[]

        const cmp = (a: Assignment, b: Assignment) => {
            if (!sortKey.value) return 0
            const av = String(a[sortKey.value] ?? '')
            const bv = String(b[sortKey.value] ?? '')
            return sortAsc.value ? av.localeCompare(bv) : bv.localeCompare(av)
        }

        const assignedIds = new Set(all.map(a => a.module_id))

        const roots = all
            .filter(a => !a.module_parent_id || !assignedIds.has(a.module_parent_id))
            .sort(cmp)

        const kids = all.filter(a => !!a.module_parent_id && assignedIds.has(a.module_parent_id))

        interface Node extends Assignment { _children: Assignment[] }

        const tree: Node[] = roots.map(r => ({
            ...r,
            module_parent_id: assignedIds.has(r.module_parent_id as number)
                ? r.module_parent_id
                : null,
            _children: kids.filter(k => k.module_parent_id === r.module_id).sort(cmp),
        }))

        if (!q) return tree

        return tree
            .map(n => ({
                ...n,
                _children: n._children.filter(c =>
                    c.module_name?.toLowerCase().includes(q) ||
                    c.module_code?.toLowerCase().includes(q)
                ),
            }))
            .filter(n =>
                n.module_name?.toLowerCase().includes(q) ||
                n.module_code?.toLowerCase().includes(q) ||
                n._children.length > 0
            )
    })

    const flatAssigned = computed((): Assignment[] => {
        const rows: Assignment[] = []
        for (const node of assignedTree.value) {
            rows.push(node)
            if (!isCollapsed(node.module_id) && (node as any)._children?.length)
                rows.push(...(node as any)._children)
        }
        return rows
    })

    const paginatedAssigned = computed(() => {
        const s = (currentPage.value - 1) * itemsPerPage.value
        return flatAssigned.value.slice(s, s + itemsPerPage.value)
    })

    const totalPages = computed(() =>
        Math.ceil(flatAssigned.value.length / itemsPerPage.value)
    )

    const pageNumbers = computed((): (number | '...')[] => {
        const total = totalPages.value, cur = currentPage.value
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
        const pages = new Set<number>([1, total, cur])
        if (cur > 1) pages.add(cur - 1)
        if (cur < total) pages.add(cur + 1)
        const sorted = [...pages].sort((a, b) => a - b)
        const out: (number | '...')[] = []; let prev = 0
        for (const p of sorted) { if (p - prev > 1) out.push('...'); out.push(p); prev = p }
        return out
    })

    const goToPage = (p: number) => { currentPage.value = p }
    const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
    const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }

    const isChild = (a: Assignment) =>
        !!a.module_parent_id &&
        (moduleStore.currentAssigned as Assignment[]).some(x => x.module_id === a.module_parent_id)

    const isParent = (a: Assignment) =>
        (moduleStore.currentAssigned as Assignment[]).some(x => x.module_parent_id === a.module_id)

    const childCount = (a: Assignment) =>
        (moduleStore.currentAssigned as Assignment[]).filter(x => x.module_parent_id === a.module_id).length

    const parentName = (a: Assignment): string | null => {
        if (!a.module_parent_id) return null
        const p = (moduleStore.currentAssigned as Assignment[]).find(x => x.module_id === a.module_parent_id)
        return p ? (p.module_name || p.module_code) : null
    }

    // ─────────────────────────────────────────────────────────
    // ASSIGN MODAL
    // ─────────────────────────────────────────────────────────

    const isAssignModalOpen = ref(false)
    const assignError       = ref('')
    const modalSearch       = ref('')
    const assignIsActive    = ref(true)
    const assignIsDefault   = ref(false)
    const modalLoading      = ref(false)  // true while fetching modules for the modal

    const modalRows = ref<ModalRow[]>([])

    const isAlreadyAssigned = (moduleId: number): boolean =>
        (moduleStore.currentAssigned as Assignment[]).some(a => a.module_id === moduleId)

    const visibleModalRows = computed(() => {
        const q = modalSearch.value.toLowerCase().trim()
        if (!q) return modalRows.value
        return modalRows.value.filter(r =>
            r.label.toLowerCase().includes(q) || r.code.toLowerCase().includes(q)
        )
    })

    const selectedCount = computed(() =>
        modalRows.value.filter(r => r.checked && !r.wasAssigned).length
    )

    const changeCount = computed(() => {
        const assigns   = modalRows.value.filter(r => r.checked && !r.wasAssigned).length
        const unassigns = modalRows.value.filter(r => !r.checked && r.wasAssigned).length
        const updates   = modalRows.value.filter(r =>
            r.checked && r.wasAssigned && r.parent_id !== r.originalParentId
        ).length
        return assigns + unassigns + updates
    })

    const parentOptions = (rowId: number): { id: number; label: string }[] => {
        const seen = new Set<number>()
        const opts: { id: number; label: string }[] = []

        const add = (id: number, label: string) => {
            if (seen.has(id)) return
            seen.add(id)
            opts.push({ id, label })
        }

        for (const r of modalRows.value) {
            if (r.module_id === rowId || !r.checked) continue
            add(r.module_id, r.label)
        }

        for (const a of moduleStore.currentAssigned as Assignment[]) {
            if (a.module_id === rowId) continue
            add(a.module_id, a.module_name || a.module_code)
        }

        return opts
    }

    const toggleRow = (moduleId: number) => {
        const row = modalRows.value.find(r => r.module_id === moduleId)
        if (!row) return
        row.checked = !row.checked
        if (!row.checked) {
            row.parent_id = row.originalParentId
            modalRows.value.forEach(r => { if (r.parent_id === moduleId) r.parent_id = null })
        }
    }

    const setRowParent = (moduleId: number, parentId: number | null) => {
        const row = modalRows.value.find(r => r.module_id === moduleId)
        if (row) row.parent_id = parentId
    }

    const selectAllVisible = () => { visibleModalRows.value.forEach(r => { r.checked = true }) }
    const clearAll         = () => { modalRows.value.forEach(r => { r.checked = false; r.parent_id = null }) }

    /** Populate modalRows from the already-loaded catalogue + current assignments. */
    const _buildModalRows = () => {
        const currentAssigned = moduleStore.currentAssigned as Assignment[]
        modalRows.value = (moduleStore.allModules as RawModule[])
            .filter(m => m.is_active !== false)
            .map(m => {
                const existing = currentAssigned.find(a => a.module_id === m.id)
                return {
                    module_id:        m.id,
                    label:            m.description || m.code,
                    code:             m.code,
                    checked:          !!existing,
                    parent_id:        existing?.module_parent_id ?? null,
                    wasAssigned:      !!existing,
                    originalParentId: existing?.module_parent_id ?? null,
                }
            })
    }


    const openAssignModal = async () => {
        // Reset state and open immediately so user sees the loading indicator
        assignError.value       = ''
        modalSearch.value       = ''
        assignIsActive.value    = true
        assignIsDefault.value   = false
        modalRows.value         = []
        modalLoading.value      = true
        isAssignModalOpen.value = true

        try {
            // Fetch catalogue + current assignments in parallel
            const fetches: Promise<any>[] = [moduleStore.fetchAllModules()]
            if (selectedTargetId.value) {
                fetches.push(moduleStore.fetchAssignedModules(selectedTargetId.value))
            }
            await Promise.all(fetches)
        } catch (e: any) {
            assignError.value = transStore.t('module.failed');
        } finally {
            modalLoading.value = false
        }

        // Build rows after data is guaranteed to be fresh
        _buildModalRows()
    }

    const closeAssignModal = () => { isAssignModalOpen.value = false }

    const submitAssign = async () => {
        if (!selectedTargetId.value) return

        const toAssign   = modalRows.value.filter(r => r.checked && !r.wasAssigned)
        const toUnassign = modalRows.value.filter(r => !r.checked && r.wasAssigned)
        const toUpdate   = modalRows.value.filter(r =>
            r.checked && r.wasAssigned && r.parent_id !== r.originalParentId
        )

        if (!toAssign.length && !toUnassign.length && !toUpdate.length) {
            assignError.value = transStore.t('module.no.changes.detected');
            return
        }
        assignError.value = ''

        try {
            if (toAssign.length > 0) {
                const payload = toAssign.map((r, i) => ({
                    module_id: r.module_id,
                    parent_id: r.parent_id,
                    sequence:  i + 1,
                }))
                await moduleStore.assignModules(
                    selectedTargetId.value,
                    payload,
                    { is_active: assignIsActive.value, is_default: assignIsDefault.value },
                )
            }

            for (const r of toUnassign) {
                await moduleStore.unassignModule(selectedTargetId.value!, r.module_id)
            }

            for (const r of toUpdate) {
                await moduleStore.updateAssignment(selectedTargetId.value!, r.module_id, {
                    parent_id: r.parent_id,
                })
            }

            await moduleStore.fetchAssignedModules(selectedTargetId.value!)
            closeAssignModal()

        } catch (err: any) {
            assignError.value = err?.message || transStore.t('module.error.try.again');
        }
    }

    // ─────────────────────────────────────────────────────────
    // UNASSIGN
    // ─────────────────────────────────────────────────────────

    const showUnassignConfirm = ref(false)
    const unassignTarget      = ref<Assignment | null>(null)

    const openUnassignConfirm = (a: Assignment) => {
        unassignTarget.value = a; showUnassignConfirm.value = true
    }
    const confirmUnassign = async () => {
        if (!unassignTarget.value) return
        await moduleStore.unassignModule(unassignTarget.value.user_id, unassignTarget.value.module_id)
        if (selectedTargetId.value)
            await moduleStore.fetchAssignedModules(selectedTargetId.value)
        showUnassignConfirm.value = false
        unassignTarget.value      = null
    }

    const toggleActive = async (a: Assignment) =>
        moduleStore.updateAssignment(a.user_id, a.module_id, { is_active: !a.is_active })

    // ─────────────────────────────────────────────────────────
    // INIT
    // ─────────────────────────────────────────────────────────

    onMounted(async () => {
        if (userStore.clients && userStore.clients.length > 0 || userStore.users && userStore.users.length > 0)
        {
            isModuleLoading.value = false;
            return;
        }
        try{
            isModuleLoading.value = true;
            const fetchTargets = authStore.user?.is_superuser
                ? userStore.fetchClients()
                : userStore.fetchUsers()
            //await Promise.all([moduleStore.fetchAllModules(), fetchTargets])
            await fetchTargets;
            await moduleStore.fetchAllModules();
        }
        catch(err) {
            //console.log("here i am ")
            isModuleLoading.value = false;
        }
        finally {
            //console.log("here i am in final block")
            isModuleLoading.value = false;
        }
    })

    // ─────────────────────────────────────────────────────────
    // TOAST
    // ─────────────────────────────────────────────────────────

    const toast = reactive<{ title: string; message: string; type: '' | 'success' | 'error' | 'info' }>(
        { title: '', message: '', type: '' }
    )
    const showToast = (title: string, message: string, type: 'success' | 'error' | 'info') => {
        toast.title = title; toast.message = message; toast.type = type
        setTimeout(() => { toast.type = '' }, type === 'error' ? 8000 : 5000)
    }

    // ─────────────────────────────────────────────────────────
    // EXPORTS
    // ─────────────────────────────────────────────────────────

    return {
        moduleStore, transStore,

        selectedTargetId, targets, onTargetChange,

        searchInput, sortKey, sortAsc, currentPage, itemsPerPage,
        assignedTree, flatAssigned, paginatedAssigned, totalPages, pageNumbers,
        handleSearch, handleSort, goToPage, prevPage, nextPage,
        collapsedParents, toggleCollapse, isCollapsed,
        isChild, isParent, childCount, parentName,

        isAssignModalOpen, assignError, modalSearch, modalLoading,
        assignIsActive, assignIsDefault,
        modalRows, visibleModalRows, selectedCount, changeCount,
        isAlreadyAssigned, parentOptions,
        toggleRow, setRowParent,
        selectAllVisible, clearAll,
        openAssignModal, closeAssignModal, submitAssign,

        showUnassignConfirm, unassignTarget, openUnassignConfirm, confirmUnassign,

        toggleActive,
        isModuleLoading,
        toast, showToast,
    }
}