import { computed, onMounted } from 'vue'
import { useChatbotAnalyticsStore } from '@/stores/chatbotAnalyticsStore'
import {useTranslationStore} from "@/stores/translationStore";

export function useChatbotAnalytics() {
    const store = useChatbotAnalyticsStore()

// Computed properties
    const summary = computed(() => store.summary)
    const charts = computed(() => store.charts)
    const context = computed(() => store.context)
    const detailedStats = computed(() => store.detailedStats)
    const topUsers = computed(() => store.topUsers)
    const recentActivity = computed(() => store.recentActivity)
const transStore=useTranslationStore()
    const trendsDatasets = computed(() => {
        const trends = charts.value.daily_trends?.datasets || {}
        return [
            {
                label: 'Upload Embeddings',
                data: trends.upload_embeddings || [],
                borderColor: '#FF6384',
                backgroundColor: 'rgba(255, 99, 132, 0.1)',
                tension: 0.4
            },
            {
                label: 'Query Embeddings',
                data: trends.query_embeddings || [],
                borderColor: '#36A2EB',
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                tension: 0.4
            },
            {
                label: 'Response Tokens',
                data: trends.response_tokens || [],
                borderColor: '#FFCE56',
                backgroundColor: 'rgba(255, 206, 86, 0.1)',
                tension: 0.4
            }
        ]
    })

    const detailedStatsList = computed(() => {
        if (context.value.filter_level === 'global') {
            return detailedStats.value.clients || []
        } else if (context.value.filter_level === 'client') {
            return detailedStats.value.users || []
        }
        return []
    })

// Methods
    const formatNumber = (num:any) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
        return num.toString()
    }

    const formatTime = (timestamp: string | number | Date) => {
        if (!timestamp) return ''

        const date = new Date(timestamp)
        const now = new Date()

        // Use .getTime() to get the numerical value in milliseconds
        const diffMs = now.getTime() - date.getTime()

        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return date.toLocaleDateString()
    }

    const truncateText = (text:any, length:any) => {
        if (!text) return ''
        return text.length > length ? text.substring(0, length) + '...' : text
    }

    const getEntityName = (item:any) => {
        if (item.client_name) return item.client_name
        if (item.user__username) return item.user__username
        return `ID: ${item.client_id || item.user_id}`
    }

// Event handlers
    const handleClientChange = () => {
        store.setClient(store.tempSelectedClient)
    }

    const handleUserChange = () => {
        store.setUser(store.tempSelectedUser)
    }

    const handleApplyFilters = () => {
        store.applyFilters()
    }

    const handlePeriodChange = () => {
        store.setPeriod(store.selectedPeriod)
    }

    const handleGroupByChange = () => {
        store.setGroupBy(store.selectedGroupBy)
    }

    const handleResetFilters = () => {
        store.resetFilters()
    }

    const handleTableClientClick = (clientId:any) => {
        store.tempSelectedClient = clientId
        store.tempSelectedUser = null
        store.applyFilters()
    }

    const handleTableUserClick = (userId:any) => {
        store.tempSelectedUser = userId
        store.applyFilters()
    }

// Lifecycle
    onMounted(async () => {
        console.log('Component mounted, fetching analytics...')
        await store.fetchClientsAndUsers()
        await store.fetchAnalytics()
    })

    return {
        store,
        summary,
        charts,
        context,
        detailedStatsList,
        topUsers,
        recentActivity,
        trendsDatasets,
        formatNumber,
        formatTime,
        truncateText,
        getEntityName,
        handleClientChange,
        handleUserChange,
        handleApplyFilters,
        handlePeriodChange,
        handleGroupByChange,
        handleResetFilters,
        handleTableClientClick,
        handleTableUserClick,
        transStore
    }
}
