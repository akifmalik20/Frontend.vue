import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useTourStore } from '@/stores/tourStore';
import { useTranslationStore } from "@/stores/translationStore";

export function useDashboard() {
    const authStore = useAuthStore();
    const tourStore = useTourStore();
    const transStore = useTranslationStore();

    // --- Tour Configuration ---
    const DASHBOARD_TOUR_STEPS = [
        {
            id: 'sidebar',
            selector: '[data-tour-id="sidebar-main"]',
            title: 'Main navigation',
            description: 'Use the sidebar to switch between modules like dashboard, clients, users, and settings.',
            placement: 'right',
        },
        {
            id: 'header',
            selector: '[data-tour-id="dashboard-header"]',
            title: 'Dashboard overview',
            description: 'This header shows your current role and a quick welcome message.',
            placement: 'bottom',
        },
        {
            id: 'stats',
            selector: '[data-tour-id="dashboard-stats"]',
            title: 'Key stats',
            description: 'These cards highlight important metrics so you can see system health at a glance.',
            placement: 'bottom',
        },
    ];

    const startDashboardTour = () => {
        tourStore.startTour('dashboard-main', DASHBOARD_TOUR_STEPS);
    };

    // --- Mock Data / Stats ---
    const stats = [
        { title: 'Active Calls', value: '3', icon: 'fa-solid fa-phone', bg: 'bg-blue-50', text: 'text-blue-500' },
        { title: 'Available Agents', value: '2', icon: 'fa-solid fa-users', bg: 'bg-emerald-50', text: 'text-emerald-500' },
        { title: 'Pending Tickets', value: '2', icon: 'fa-solid fa-ticket', bg: 'bg-cyan-50', text: 'text-cyan-500' },
        { title: 'Calls in Queue', value: '3', icon: 'fa-solid fa-list-ol', bg: 'bg-orange-50', text: 'text-orange-500' },
    ];

    const recentCalls = [
        { number: '6203606518', status: 'Answered', time: '18:37:58' },
        { number: '6203606519', status: 'Missed', time: '19:15:22' },
        { number: '6203606520', status: 'In Queue', time: '20:05:10' },
        { number: '6203606521', status: 'Answered', time: '21:30:45' },
    ];

    const agentStatus = [
        { name: 'Sarah Johnson', status: 'Available', initial: 'S', calls: '0/3' },
        { name: 'Mike Wilson', status: 'Busy', initial: 'M', calls: '2/3' },
        { name: 'Emma Davis', status: 'Available', initial: 'E', calls: '1/3' },
        { name: 'Alex Chen', status: 'Offline', initial: 'A', calls: '0/3' },
    ];

    // --- Helper Functions ---
    const getStatusDotColor = (status: string) => {
        if (status === 'Answered') return 'bg-green-500';
        if (status === 'Missed') return 'bg-red-500';
        return 'bg-yellow-500';
    };

    const getStatusTextColor = (status: string) => {
        if (status === 'Answered') return 'text-green-600';
        if (status === 'Missed') return 'text-red-600';
        return 'text-yellow-600';
    };

    onMounted(() => {
      // tourStore.maybeStartOnce('dashboard-main', DASHBOARD_TOUR_STEPS);
    });

    return {
        authStore,
        transStore,
        stats,
        recentCalls,
        agentStatus,
        startDashboardTour,
        getStatusDotColor,
        getStatusTextColor
    };
}