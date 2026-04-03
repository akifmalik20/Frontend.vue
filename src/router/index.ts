// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'LandingPage',
    component: () => import('@/views/home/homePage.vue')
  },
  {
    path: '/login',
    name: 'LoginPage',
    component: () => import('../views/auth/login.vue')
  },
  // ==================== PASSWORD RESET ROUTES ====================
  {
    path: '/password-reset',
    name: 'PasswordResetRequest',
    component: () => import('../views/auth/PasswordReset.vue'),
    meta: {
      requiresAuth: false,
      title: 'Forgot Password - Sentra AI'
    }
  },
  {
    path: '/password-reset/:uid/:token',
    name: 'PasswordResetConfirm',
    component: () => import('../views/auth/PasswordReset.vue'),
    meta: {
      requiresAuth: false,
      title: 'Reset Password - Sentra AI'
    }
  },
  // ==================== ADMIN ROUTES ====================
  {
    path: '/admin',
    component: () => import('../views/admin/adminDashboard.vue'),
    meta: { requiresAuth: true },
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'DashboardStats',
        component: () => import('../views/admin/adminDashboardStats.vue')
      },
      {
        path: 'roles',
        name: 'RolesPage',
        component: () => import('../views/admin/roles/rolesView.vue')
      },
      {
        path: 'roles-group',
        name: 'Roles Group',
        component: () => import('../views/admin/roleGroups/rolesGroup.vue')
      },
      {
        path: 'users',
        name: 'UsersView',
        component: () => import('../views/users/usersView.vue')
      },
      {
        path: 'chatbot-analytics',
        name: 'ChatbotAnalytics',
        component: () => import('../views/admin/chatBot/chatBotAnalytics.vue')
      },
      {
        path: '/admin/chatBot/upload/',
        name: 'upload',
        component: () => import('../views/admin/chatBot/upload.vue')
      },
      {
        path: '/admin/chatBot/promptConfig/',
        name: 'promptConfig',
        component: () => import('../views/admin/chatBot/promptConfig.vue')
      },
      {
        path: '/admin/clients',
        name: 'clients',
        component: () => import('../views/client/clientView.vue')
      },
      {
        path: '/profile',
        name: 'profile',
        component: () => import('../views/profile.vue')
      },
      {
        path: 'subscription',
        name: 'subscription',
        component: () => import('../views/admin/subscription/subscriptionPlanManagementPage.vue')
      },
      {
        path: '/moduleAssignment',
        name: 'moduleAssignment',
        component: () => import('../views/moduleAssignment.vue')
      },
      {
        path: 'localization',
        name: 'localization',
        component: () => import('../views/admin/localization/localization.vue')
      },
      {
        path: '/contact/contactsView',
        name: 'contact',
        component: () => import('../views/contact/contactsView.vue')
      },
      {
        path: '/views/chatapp',
        name: 'chatapp',
        component: () => import('../views/chatapp/chatapp.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }
    return { top: 0 }
  },
})

// Add navigation guard for authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('access_token') !== null

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if ((to.name === 'Login' || to.name === 'LoginPage') && isAuthenticated) {
    next('/admin')
  } else {
    next()
  }
})

export default router