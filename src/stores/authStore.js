// src/stores/auth.js
import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

import { axiosInstance } from "@/utils/axiosInstance";
import router from '@/router';
import {useTranslationStore} from "@/stores/translationStore.js";

export const useAuthStore = defineStore('auth', () => {
  // --- States ---
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'));
  const accessToken = ref(localStorage.getItem('access_token'));
  const refreshToken = ref(localStorage.getItem('refresh_token'));
  const modules = ref(JSON.parse(localStorage.getItem('modules') || '[]'));
  const languages = ref(JSON.parse(localStorage.getItem('languages') || '[]'));
  const userLanguage = ref(JSON.parse(localStorage.getItem('user_language') || 'null'));
  const userLanguageName = ref(localStorage.getItem('user_language_name') || null);
  const userType = ref(localStorage.getItem('user_type') || null);
  const userRoles = ref(JSON.parse(localStorage.getItem('user_roles') || '[]'));
  const companyName = ref(localStorage.getItem('company_name') || null);
  const userPhone = ref(localStorage.getItem('user_phone') || null);
  const userAvatar = ref(localStorage.getItem('user_avatar') || null);

  // New fields for client_id and user_id tracking
  const clientId = ref(localStorage.getItem('client_id') || null);
  const userId = ref(localStorage.getItem('user_id') || null);
  const authUserId = ref(localStorage.getItem('auth_user_id') || null);

  // Additional fields for custom users
  const clientAuthUserId = ref(localStorage.getItem('client_auth_user_id') || null);
  const clientUsername = ref(localStorage.getItem('client_username') || null);
  const clientCompany = ref(localStorage.getItem('client_company') || null);

  // --- IMPERSONATION STATES ---
  const impersonating = ref(localStorage.getItem('impersonating') === 'true');
  const originalAdmin = ref(JSON.parse(localStorage.getItem('original_admin') || 'null'));
  const impersonationToken = ref(localStorage.getItem('impersonation_token') || null);
  const impersonationStartTime = ref(localStorage.getItem('impersonation_start_time') || null);
  const recentImpersonations = ref(JSON.parse(localStorage.getItem('recent_impersonations') || '[]'));

  const loading = ref(false);
  const error = ref(null);

  // --- Getters ---
  const isAuthenticated = computed(() => {
    return !!accessToken.value && accessToken.value !== 'undefined' && accessToken.value !== 'null';
  });
const transStore=useTranslationStore();
  const currentLanguage = computed(() => userLanguage.value);
  const currentLanguageName = computed(() => userLanguageName.value);
  const userModules = computed(() => modules.value);
  const availableLanguages = computed(() => languages.value);

  // Get default module/dashboard route
  const defaultRoute = computed(() => {
    // First try to find the dashboard module
    const dashboardModule = modules.value.find(m => m.code === 'sentra.dashboard' && m.is_active === true);
    if (dashboardModule) return dashboardModule.url;

    // Then try to find any module marked as default
    const defaultModule = modules.value.find(m => m.is_default === true && m.is_active === true);
    if (defaultModule) return defaultModule.url;

    // Then get the first active module
    const firstModule = modules.value.find(m => m.is_active === true);
    if (firstModule) return firstModule.url;

    // Fallback based on user type
    if (userType.value === 'admin') return '/admin';
    if (userType.value === 'client') return '/client/dashboard';
    if (userType.value === 'custom_user') return '/user/dashboard';

    return '/';
  });

  const userProfile = computed(() => {
    return {
      id: user.value?.user_id || user.value?.id,
      username: user.value?.username,
      email: user.value?.email,
      first_name: user.value?.first_name,
      last_name: user.value?.last_name,
      full_name: user.value?.full_name,
      is_superuser: user.value?.is_superuser || false,
      is_active: user.value?.is_active || true,
      user_type: userType.value,
      language: userLanguage.value,
      language_name: userLanguageName.value,
      roles: userRoles.value,
      auth_user_id: authUserId.value,
      client_id: clientId.value,
      user_id: userId.value,
      client_auth_user_id: clientAuthUserId.value,
      client_username: clientUsername.value,
      client_company: clientCompany.value,
      company_name: companyName.value,
      phone: userPhone.value,
      avatar: userAvatar.value,
      modules_count: modules.value?.length || 0,
      impersonating: impersonating.value,
      original_admin: originalAdmin.value
    };
  });

  const getModuleNavigation = computed(() => {
    return modules.value
        .filter(module => module.is_active === true)
        .sort((a, b) => (a.sequence || 999) - (b.sequence || 999))
        .map(module => ({
          id: module.id,
          code: module.code,
          title: module.description,
          icon: module.icon,
          to: module.url,
          isActive: module.is_active,
          sequence: module.sequence,
          isDefault: module.is_default || false
        }));
  });

  const mainNavigation = computed(() => {
    return getModuleNavigation.value.filter(module =>
        ['sentra.dashboard', 'sentra.users', 'sentra.clients', 'sentra.reports'].includes(module.code)
    );
  });

  const adminNavigation = computed(() => {
    return getModuleNavigation.value.filter(module =>
        ['sentra.roles', 'sentra.modules', 'sentra.permissions', 'sentra.settings'].includes(module.code)
    );
  });

  const otherNavigation = computed(() => {
    const mainAndAdminCodes = [...mainNavigation.value, ...adminNavigation.value].map(m => m.code);
    return getModuleNavigation.value.filter(module => !mainAndAdminCodes.includes(module.code));
  });

  // --- IMPERSONATION GETTERS ---
  const isImpersonating = computed(() => impersonating.value === true);

  const isAdmin = computed(() => {
    return user.value?.is_superuser || hasRole('Admin') || hasRole('System User Admin');
  });

  const isClient = computed(() => userType.value === 'client');
  const isCustomUser = computed(() => userType.value === 'custom_user');

  const canSwitchUser = computed(() => {
    return (user.value?.is_superuser || hasRole('Admin') || hasRole('System User Admin')) && !impersonating.value;
  });

  const impersonationBadgeText = computed(() => {
    if (!impersonating.value) return '';
    return `Impersonating: ${userProfile.value?.full_name || userProfile.value?.username}`;
  });

  const getCurrentUserId = computed(() => {
    if (isCustomUser.value) return userId.value;
    return authUserId.value;
  });

  const getClientId = computed(() => clientId.value);

  // Auto-update axios Authorization header
  watch(accessToken, (token) => {
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  }, { immediate: true });

  // --- Helper Functions ---
  const hasModuleAccess = (moduleCode) => {
    return modules.value.some(module => module.code === moduleCode && module.is_active === true);
  };

  const getModuleByCode = (moduleCode) => {
    return modules.value.find(module => module.code === moduleCode);
  };

  const getLanguageByCode = (languageCode) => {
    return languages.value.find(lang => lang.code === languageCode);
  };

  const hasRole = (roleName) => {
    return userRoles.value.includes(roleName);
  };

  const hasAnyRole = (roleNames) => {
    return roleNames.some(role => userRoles.value.includes(role));
  };

  const hasAllRoles = (roleNames) => {
    return roleNames.every(role => userRoles.value.includes(role));
  };

  // --- Token Debug Helper ---
  function decodeToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Failed to decode token:', e);
      return null;
    }
  }

  // --- Force navigation to default route ---
  function navigateToDefaultRoute() {
    const route = defaultRoute.value;
    console.log('Navigating to default route:', route);

    // Use replace to avoid history stack issues
    router.replace(route).then(() => {
      console.log('✅ Navigation complete to:', route);

      // Force a small delay to ensure components re-render
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('auth-state-changed', {
          detail: {
            userType: userType.value,
            impersonating: impersonating.value,
            route: route
          }
        }));
      }, 100);
    }).catch(err => {
      console.error('Navigation error:', err);
      // Fallback to push
      router.push(route);
    });
  }

  // --- Actions ---

  // 1. Login
  async function login(credentials) {
    loading.value = true;
    error.value = null;

    try {
      const response = await axiosInstance.post('/api/accounts/login/', {
        email: credentials.email,
        password: credentials.password
      });

      const data = response.data;

      accessToken.value = data.access_token;
      refreshToken.value = data.refresh_token;

      user.value = {
        user_id: data.user_id,
        username: data.username,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        full_name: data.full_name,
        is_superuser: data.is_superuser,
        is_active: data.is_active
      };

      modules.value = data.modules || [];
      languages.value = data.languages || [];
      userLanguage.value = data.language;
      userLanguageName.value = data.language_name;
      userType.value = data.user_type;
      userRoles.value = data.roles || [];
      userAvatar.value = data.avatar;
      authUserId.value = data.auth_user_id || data.user_id;

      if (data.client_id) {
        clientId.value = data.client_id;
      }

      if (isCustomUser.value) {
        userId.value = data.user_id;
        clientAuthUserId.value = data.client_auth_user_id;
        clientUsername.value = data.client_username;
        clientCompany.value = data.client_company;
      }

      companyName.value = data.company_name || null;
      userPhone.value = data.phone || null;
      userAvatar.value = data.avatar || null;

      // Reset impersonation state
      impersonating.value = false;
      originalAdmin.value = null;
      impersonationToken.value = null;
      impersonationStartTime.value = null;

      saveToStorage();

      // Navigate to default route after login
//      setTimeout(() => navigateToDefaultRoute(), 50);

      return data;
    } catch (err) {
      error.value = err.response?.data?.message || err.response?.data?.detail || 'Login failed';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // 2. SWITCH USER - COMPLETELY UPDATED with modules support
  async function switchUser(username) {
    loading.value = true;
    error.value = null;

    try {
      const response = await axiosInstance.post('/api/admin/switch-user/', { username });
      const data = response.data;

      console.log('✅ Switch user response:', data);

      // Store new tokens
      accessToken.value = data.access_token;
      refreshToken.value = data.refresh_token;

      // Store impersonation state
      impersonating.value = true;
      originalAdmin.value = data.original_admin;
      impersonationToken.value = data.access_token;
      impersonationStartTime.value = new Date().toISOString();

      // Store impersonated user data
      user.value = {
        user_id: data.user.user_id || data.user.id,
        username: data.user.username,
        email: data.user.email,
        first_name: data.user.first_name,
        last_name: data.user.last_name,
        full_name: data.user.full_name,
        is_superuser: false,
        is_active: true
      };

      // ✅ CRITICAL: Store modules from the response
      modules.value = data.modules || [];

      // Update user type
      if (data.user.is_client) {
        userType.value = 'client';
      } else if (data.user.is_custom_user) {
        userType.value = 'custom_user';
      } else {
        userType.value = 'user';
      }

      // Store user roles
      userRoles.value = data.user.roles || [];

      // Store user profile data
      userPhone.value = data.user.phone || null;
      userAvatar.value = data.user.avatar || null;
      companyName.value = data.user.company_name || null;
      authUserId.value = data.user.auth_user_id || data.user.id;

      // Store language
      userLanguage.value = data.user.language || null;
      userLanguageName.value = data.user.language_name || null;

      // Store languages list
      languages.value = data.user.languages || [];

      // Store ID tracking
      if (data.user.is_client) {
        clientId.value = data.user.client_id || data.user.id;
        userId.value = null;
      } else if (data.user.is_custom_user) {
        userId.value = data.user.user_id || data.user.id;
        clientId.value = data.user.client_id;
        clientUsername.value = data.user.client_name;
        clientCompany.value = data.user.client_company;
      }

      saveToStorage();

      // Add to recent impersonations
      addToRecentImpersonations({
        id: data.user.id,
        username: data.user.username,
        full_name: data.user.full_name,
        user_type: userType.value,
        timestamp: new Date().toISOString()
      });

      console.log('✅ Switch successful - Modules loaded:', modules.value.length);
      console.log('🌐 Redirecting to site home (root "/") after switch');

      // Instead of going to the default module/dashboard,
      // navigate to the root home page using Vue Router
      router.push('/').then(() => {
        console.log('✅ Successfully navigated to home page after switch');
      }).catch(err => {
        console.error('Navigation error:', err);
        // Fallback to hard redirect if routing fails
        window.location.href = '/';
      });

      return { success: true, user: data.user };
    } catch (err) {
      console.error('❌ Switch user error:', err);
      error.value = err.response?.data?.error || 'Failed to switch user';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  // 3. RETURN TO ADMIN - COMPLETELY UPDATED with modules support and forced refresh
  async function returnToAdmin() {
    loading.value = true;
    error.value = null;

    try {
      // First, check if we're actually impersonating
      if (!impersonating.value) {
        console.error('Not in impersonation mode');
        return { success: false, error: 'Not in impersonation mode' };
      }

      console.log('🔄 Returning to admin...');

      const response = await axiosInstance.post('/api/admin/return-to-admin/');
      const data = response.data;

      console.log('✅ Return to admin response:', data);

      // Store new admin tokens
      accessToken.value = data.access_token;
      refreshToken.value = data.refresh_token;

      // Reset impersonation state
      impersonating.value = false;
      originalAdmin.value = null;
      impersonationToken.value = null;
      impersonationStartTime.value = null;

      // ✅ CRITICAL: Restore admin modules from response
      modules.value = data.modules || [];

      // Restore admin user data
      user.value = {
        user_id: data.user.user_id || data.user.id,
        username: data.user.username,
        email: data.user.email,
        first_name: data.user.first_name,
        last_name: data.user.last_name,
        full_name: data.user.full_name,
        is_superuser: data.user.is_admin,
        is_active: true
      };

      userType.value = 'admin';
      userRoles.value = data.user.roles || [];

      // Restore admin profile data
      userPhone.value = data.user.phone || null;
      userAvatar.value = data.user.avatar || null;
      companyName.value = data.user.company_name || null;
      authUserId.value = data.user.auth_user_id || data.user.id;

      // Restore language
      userLanguage.value = data.user.language || null;
      userLanguageName.value = data.user.language_name || null;

      // Restore languages list
      languages.value = data.user.languages || [];

      saveToStorage();

      // Clear impersonation items from localStorage
      localStorage.removeItem('impersonating');
      localStorage.removeItem('original_admin');
      localStorage.removeItem('impersonation_token');
      localStorage.removeItem('impersonation_start_time');

      console.log('✅ Return to admin successful - Modules loaded:', modules.value.length);
      console.log('🌐 Redirecting admin to site home (root "/")');

      // Always send admin back to the website root home page
      // with a full reload, ignoring module default routes.
      window.location.href = '/';

      return { success: true };
    } catch (err) {
      console.error('❌ Return to admin error:', err);
      console.error('Error response:', err.response?.data);

      error.value = err.response?.data?.error || 'Failed to return to admin';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  // 4. Search users
  async function searchUsers(query) {
    if (!query || query.length < 2) return [];

    try {
      const response = await axiosInstance.get('/api/admin/users/search/', {
        params: { q: query }
      });
      return response.data.results || [];
    } catch (err) {
      console.error('Search users error:', err);
      return [];
    }
  }

  // 5. Check impersonation status
  async function checkImpersonation() {
    if (!accessToken.value) {
      impersonating.value = false;
      return { impersonating: false };
    }

    try {
      // First, decode the token locally to check for impersonation claims
      const tokenData = decodeToken(accessToken.value);
      console.log('Token data:', tokenData);

      if (tokenData && tokenData.impersonating === true) {
        console.log('✅ Token has impersonating claim:', tokenData);
        impersonating.value = true;

        if (tokenData.original_admin_id && !originalAdmin.value) {
          originalAdmin.value = {
            id: tokenData.original_admin_id,
            username: tokenData.original_admin_username,
            full_name: tokenData.original_admin_full_name || tokenData.original_admin_username
          };
          localStorage.setItem('impersonating', 'true');
          localStorage.setItem('original_admin', JSON.stringify(originalAdmin.value));
        }

        return { impersonating: true, ...tokenData };
      }

      // Fallback to API call
      const response = await axiosInstance.get('/api/admin/check-impersonation/');

      impersonating.value = response.data.impersonating;

      if (impersonating.value && !originalAdmin.value) {
        originalAdmin.value = {
          id: response.data.original_admin_id,
          username: response.data.original_admin_username,
          full_name: response.data.original_admin_full_name || response.data.original_admin_username
        };
        impersonationStartTime.value = response.data.impersonation_started;

        localStorage.setItem('impersonating', 'true');
        localStorage.setItem('original_admin', JSON.stringify(originalAdmin.value));
        if (impersonationStartTime.value) {
          localStorage.setItem('impersonation_start_time', impersonationStartTime.value);
        }
      }

      return response.data;
    } catch (err) {
      console.error('Check impersonation error:', err);

      // If API fails, check token locally as fallback
      const tokenData = decodeToken(accessToken.value);
      if (tokenData && tokenData.impersonating === true) {
        impersonating.value = true;
        return { impersonating: true, ...tokenData };
      }

      impersonating.value = false;
      return { impersonating: false };
    }
  }

  // 6. Add to recent impersonations
  function addToRecentImpersonations(user) {
    const recent = recentImpersonations.value.filter(u => u.id !== user.id);
    recent.unshift(user);
    recentImpersonations.value = recent.slice(0, 5);
    localStorage.setItem('recent_impersonations', JSON.stringify(recentImpersonations.value));
  }

  // 7. Clear recent impersonations
  function clearRecentImpersonations() {
    recentImpersonations.value = [];
    localStorage.removeItem('recent_impersonations');
  }

  // 8. Update user language
  async function updateUserLanguage(languageCode) {
    try {
      const languageObj = languages.value.find(lang => lang.code === languageCode);
      if (languageObj) {
        userLanguage.value = languageCode;
        userLanguageName.value = languageObj.name;
        localStorage.setItem('user_language', JSON.stringify(languageCode));
        localStorage.setItem('user_language_name', languageObj.name);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating language:', err);
      return false;
    }
  }

  // 9. Refresh Access Token
  async function refreshAccessToken() {
    if (!refreshToken.value) {
      return null;
    }

    try {
      const response = await axiosInstance.post('/api/accounts/token/refresh/', {
        refresh: refreshToken.value
      });

      const data = response.data;
      accessToken.value = data.access || data.access_token;
      localStorage.setItem('access_token', accessToken.value);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken.value}`;

      return accessToken.value;
    } catch (err) {
      return null;
    }
  }

  // 10. Logout
  function logout() {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    modules.value = [];
    languages.value = [];
    userLanguage.value = null;
    userLanguageName.value = null;
    userType.value = null;
    userRoles.value = [];
    companyName.value = null;
    userPhone.value = null;
    userAvatar.value = null;

    clientId.value = null;
    userId.value = null;
    authUserId.value = null;
    clientAuthUserId.value = null;
    clientUsername.value = null;
    clientCompany.value = null;

    impersonating.value = false;
    originalAdmin.value = null;
    impersonationToken.value = null;
    impersonationStartTime.value = null;
    recentImpersonations.value = [];

    error.value = null;

    // Clear all localStorage
    localStorage.clear();
    sessionStorage.clear();

    delete axiosInstance.defaults.headers.common['Authorization'];
    router.push('/login');
  }

  // 11. Save to Storage
  function saveToStorage() {
    if (accessToken.value) localStorage.setItem('access_token', accessToken.value);
    if (refreshToken.value) localStorage.setItem('refresh_token', refreshToken.value);
    if (user.value) {
      localStorage.setItem('user', JSON.stringify(user.value));
      sessionStorage.setItem('currentUser', JSON.stringify(user.value));
    }

    localStorage.setItem('modules', JSON.stringify(modules.value));
    localStorage.setItem('languages', JSON.stringify(languages.value));

    if (userLanguage.value) localStorage.setItem('user_language', JSON.stringify(userLanguage.value));
    if (userLanguageName.value) localStorage.setItem('user_language_name', userLanguageName.value);
    if (userType.value) localStorage.setItem('user_type', userType.value);
    localStorage.setItem('user_roles', JSON.stringify(userRoles.value));

    if (clientId.value) localStorage.setItem('client_id', clientId.value);
    if (userId.value) localStorage.setItem('user_id', userId.value);
    if (authUserId.value) localStorage.setItem('auth_user_id', authUserId.value);
    if (clientAuthUserId.value) localStorage.setItem('client_auth_user_id', clientAuthUserId.value);
    if (clientUsername.value) localStorage.setItem('client_username', clientUsername.value);
    if (clientCompany.value) localStorage.setItem('client_company', clientCompany.value);

    if (companyName.value) localStorage.setItem('company_name', companyName.value);
    if (userPhone.value) localStorage.setItem('user_phone', userPhone.value);
    if (userAvatar.value) localStorage.setItem('user_avatar', userAvatar.value);

    // Save impersonation state
    if (impersonating.value) {
      localStorage.setItem('impersonating', 'true');
    } else {
      localStorage.removeItem('impersonating');
    }

    if (originalAdmin.value) {
      localStorage.setItem('original_admin', JSON.stringify(originalAdmin.value));
    } else {
      localStorage.removeItem('original_admin');
    }

    if (impersonationToken.value) {
      localStorage.setItem('impersonation_token', impersonationToken.value);
    }

    if (impersonationStartTime.value) {
      localStorage.setItem('impersonation_start_time', impersonationStartTime.value);
    }

    localStorage.setItem('recent_impersonations', JSON.stringify(recentImpersonations.value));
  }

  // 12. Get Auth Headers
  function getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(accessToken.value && { 'Authorization': `Bearer ${accessToken.value}` })
    };
  }

  // 13. Update user profile
  function updateUserProfile(profileData) {
    if (profileData.first_name !== undefined) user.value.first_name = profileData.first_name;
    if (profileData.last_name !== undefined) user.value.last_name = profileData.last_name;
    if (profileData.email !== undefined) user.value.email = profileData.email;
    if (profileData.phone !== undefined) userPhone.value = profileData.phone;
    if (profileData.avatar !== undefined) userAvatar.value = profileData.avatar;
    if (profileData.company_name !== undefined) companyName.value = profileData.company_name;

    if (profileData.first_name || profileData.last_name) {
      user.value.full_name = `${user.value.first_name} ${user.value.last_name}`.trim();
    }

    saveToStorage();
  }

  // 14. Load from storage
  function loadFromStorage() {
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    const storedAccessToken = localStorage.getItem('access_token');
    const storedRefreshToken = localStorage.getItem('refresh_token');
    const storedModules = JSON.parse(localStorage.getItem('modules') || '[]');
    const storedLanguages = JSON.parse(localStorage.getItem('languages') || '[]');
    const storedUserLanguage = JSON.parse(localStorage.getItem('user_language') || 'null');
    const storedUserLanguageName = localStorage.getItem('user_language_name');
    const storedUserType = localStorage.getItem('user_type');
    const storedUserRoles = JSON.parse(localStorage.getItem('user_roles') || '[]');
    const storedCompanyName = localStorage.getItem('company_name');
    const storedUserPhone = localStorage.getItem('user_phone');
    const storedUserAvatar = localStorage.getItem('user_avatar');

    const storedClientId = localStorage.getItem('client_id');
    const storedUserId = localStorage.getItem('user_id');
    const storedAuthUserId = localStorage.getItem('auth_user_id');
    const storedClientAuthUserId = localStorage.getItem('client_auth_user_id');
    const storedClientUsername = localStorage.getItem('client_username');
    const storedClientCompany = localStorage.getItem('client_company');

    const storedImpersonating = localStorage.getItem('impersonating') === 'true';
    const storedOriginalAdmin = JSON.parse(localStorage.getItem('original_admin') || 'null');
    const storedImpersonationToken = localStorage.getItem('impersonation_token');
    const storedImpersonationStartTime = localStorage.getItem('impersonation_start_time');
    const storedRecentImpersonations = JSON.parse(localStorage.getItem('recent_impersonations') || '[]');

    if (storedUser && storedAccessToken) {
      user.value = storedUser;
      accessToken.value = storedAccessToken;
      refreshToken.value = storedRefreshToken;
      modules.value = storedModules;
      languages.value = storedLanguages;
      userLanguage.value = storedUserLanguage;
      userLanguageName.value = storedUserLanguageName;
      userType.value = storedUserType;
      userRoles.value = storedUserRoles;
      companyName.value = storedCompanyName;
      userPhone.value = storedUserPhone;
      userAvatar.value = storedUserAvatar;

      clientId.value = storedClientId;
      userId.value = storedUserId;
      authUserId.value = storedAuthUserId;
      clientAuthUserId.value = storedClientAuthUserId;
      clientUsername.value = storedClientUsername;
      clientCompany.value = storedClientCompany;

      impersonating.value = storedImpersonating;
      originalAdmin.value = storedOriginalAdmin;
      impersonationToken.value = storedImpersonationToken;
      impersonationStartTime.value = storedImpersonationStartTime;
      recentImpersonations.value = storedRecentImpersonations;
    }
  }

  // 15. Check module permission with URL
  function canAccessRoute(routePath) {
    const normalizedPath = routePath.replace(/\/$/, '');
    return modules.value.some(module => {
      if (!module.is_active) return false;
      const modulePath = module.url?.replace(/\/$/, '');
      return modulePath === normalizedPath;
    });
  }

  // 16. Save Module Sequence
  async function saveModuleSequence(sequenceData) {
    loading.value = true;
    error.value = null;

    try {
      const response = await axiosInstance.post('/api/modules/update-sequence/', sequenceData);

      if (response.data.success) {
        sequenceData.forEach(item => {
          const moduleIndex = modules.value.findIndex(m => m.id === item.module_id);
          if (moduleIndex !== -1) {
            modules.value[moduleIndex].sequence = item.sequence;
          }
        });
        modules.value.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
        saveToStorage();
        return response.data;
      } else {
        throw new Error(response.data.error || response.data.message || 'Failed to update sequence');
      }
    } catch (err) {
      console.error('Error saving module sequence:', err);
      error.value = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to save module sequence';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Initialize
  loadFromStorage();

  const moduleId = computed(() => {
    return modules.value?.find(m => m.is_default)?.id ?? null;
  });
  return {
    // States
    user,
    accessToken,
    refreshToken,
    modules,
    languages,
    userLanguage,
    userLanguageName,
    userType,
    userRoles,
    companyName,
    userPhone,
    userAvatar,
    clientId,
    userId,
    authUserId,
    clientAuthUserId,
    clientUsername,
    clientCompany,
    impersonating,
    originalAdmin,
    impersonationToken,
    impersonationStartTime,
    recentImpersonations,
    loading,
    error,

    // Getters
    isAuthenticated,
    currentLanguage,
    currentLanguageName,
    userModules,
    availableLanguages,
    userProfile,
    getModuleNavigation,
    mainNavigation,
    adminNavigation,
    otherNavigation,
    isAdmin,
    isClient,
    isCustomUser,
    defaultRoute,
    getCurrentUserId,
    getClientId,
    isImpersonating,
    canSwitchUser,
    impersonationBadgeText,

    // Helper Functions
    hasModuleAccess,
    getModuleByCode,
    getLanguageByCode,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    canAccessRoute,
    decodeToken,

    // Actions
    getAuthHeaders,
    login,
    logout,
    refreshAccessToken,
    saveToStorage,
    updateUserLanguage,
    updateUserProfile,
    loadFromStorage,
    saveModuleSequence,
    switchUser,
    returnToAdmin,
    searchUsers,
    checkImpersonation,
    addToRecentImpersonations,
    clearRecentImpersonations,
    moduleId,
    // Navigation Helper
    navigateToDefaultRoute
  };
});