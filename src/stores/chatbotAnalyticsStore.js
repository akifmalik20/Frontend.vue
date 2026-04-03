// stores/chatbotAnalyticsStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axiosInstance from "@/utils/axiosInstance.js";

export const useChatbotAnalyticsStore = defineStore('chatbotAnalytics', () => {
    // State
    const analyticsData = ref(null)
    const loading = ref(false)
    const error = ref(null)

    // Filter states
    const selectedClient = ref(null)
    const selectedUser = ref(null)
    const selectedPeriod = ref('month')
    const selectedGroupBy = ref('day')

    // Temporary filter states (for dropdown selection before apply)
    const tempSelectedClient = ref(null)
    const tempSelectedUser = ref(null)

    // Clients and users data
    const clientsData = ref(null)
    const loadingClients = ref(false)
    const usersByClient = ref({})

    // Getters
    const summary = computed(() => analyticsData.value?.summary || {
        total_tokens: { embeddings: 0, ai_response: 0, all: 0 },
        usage_counts: { documents_uploaded: 0, unique_documents: 0, chat_requests: 0, active_users: 0 },
        averages: { embeddings_per_document: 0, embeddings_per_request: 0, response_tokens_per_request: 0 }
    })

    const charts = computed(() => analyticsData.value?.charts || {
        daily_trends: { labels: [], datasets: {} },
        token_distribution: { labels: [], values: [], colors: [] },
        usage_breakdown: { labels: [], values: [] }
    })

    const context = computed(() => analyticsData.value?.context || {
        filter_level: 'global',
        period: 'month',
        client: null,
        user: null
    })

    const detailedStats = computed(() => analyticsData.value?.detailed_stats || {})
    const topUsers = computed(() => analyticsData.value?.top_users || { labels: [], tokens: [] })
    const recentActivity = computed(() => analyticsData.value?.recent_activity || [])

    // Client options for dropdown
    const clientOptions = computed(() => {
        if (!clientsData.value?.data) return []
        return clientsData.value.data.map(client => ({
            id: client.id,
            name: client.name,
            company_name: client.company_name,
            users: client.users || []
        }))
    })

    // User options based on selected client
    const userOptions = computed(() => {
        if (!tempSelectedClient.value) return []
        const client = clientOptions.value.find(c => c.id === tempSelectedClient.value)
        return client?.users || []
    })

    // Actions
    async function fetchClientsAndUsers() {
        loadingClients.value = true
        try {
            const response = await axiosInstance.get('/api/users/clients-with-users/')
            clientsData.value = response.data

            // Build users lookup
            if (response.data?.data) {
                const usersMap = {}
                response.data.data.forEach(client => {
                    usersMap[client.id] = client.users || []
                })
                usersByClient.value = usersMap
            }
        } catch (err) {
            console.error('Failed to fetch clients and users:', err)
        } finally {
            loadingClients.value = false
        }
    }

    async function fetchAnalytics() {
        loading.value = true
        error.value = null

        try {
            const params = new URLSearchParams()
            if (selectedClient.value) params.append('client_id', selectedClient.value)
            if (selectedUser.value) params.append('user_id', selectedUser.value)
            params.append('period', selectedPeriod.value)
            params.append('group_by', selectedGroupBy.value)

            console.log('Fetching analytics with params:', params.toString())

            const response = await axiosInstance.get('/api/chatbot/dashboard-analytics/', { params })
            console.log('Analytics response:', response.data)

            analyticsData.value = response.data
        } catch (err) {
            console.error('Analytics fetch error:', err)
            error.value = err.response?.data?.message || 'Failed to fetch analytics'
        } finally {
            loading.value = false
        }
    }

    function applyFilters() {
        selectedClient.value = tempSelectedClient.value
        selectedUser.value = tempSelectedUser.value
        fetchAnalytics()
    }

    function setClient(clientId) {
        tempSelectedClient.value = clientId
        tempSelectedUser.value = null // Reset user when client changes
        // Don't fetch analytics yet - wait for apply button
    }

    function setUser(userId) {
        tempSelectedUser.value = userId
        // Don't fetch analytics yet - wait for apply button
    }

    function setPeriod(period) {
        selectedPeriod.value = period
        fetchAnalytics() // Auto-fetch on period change
    }

    function setGroupBy(groupBy) {
        selectedGroupBy.value = groupBy
        fetchAnalytics() // Auto-fetch on group by change
    }

    function resetFilters() {
        tempSelectedClient.value = null
        tempSelectedUser.value = null
        selectedClient.value = null
        selectedUser.value = null
        selectedPeriod.value = 'month'
        selectedGroupBy.value = 'day'
        fetchAnalytics()
    }

    function clearTempFilters() {
        tempSelectedClient.value = selectedClient.value
        tempSelectedUser.value = selectedUser.value
    }

    return {
        // State
        analyticsData,
        loading,
        error,
        selectedClient,
        selectedUser,
        selectedPeriod,
        selectedGroupBy,
        tempSelectedClient,
        tempSelectedUser,
        clientsData,
        loadingClients,
        usersByClient,

        // Getters
        summary,
        charts,
        context,
        detailedStats,
        topUsers,
        recentActivity,
        clientOptions,
        userOptions,

        // Actions
        fetchAnalytics,
        fetchClientsAndUsers,
        setClient,
        setUser,
        setPeriod,
        setGroupBy,
        resetFilters,
        applyFilters,
        clearTempFilters
    }
})