import { defineStore } from 'pinia';
import { axiosInstance } from '@/utils/axiosInstance.js';

export const useUserStore = defineStore('userStore', {
    state: () => ({
        users: [],
        clients: [],
        selectedUser: null,
        selectedClient: null,
        roleGroups: [],
        loading: false,
        error: null,
        // Password reset state
        resetEmail: null,
        resetSuccess: false,
    }),

    actions: {
        getAuthHeader() {
            return {
                Authorization: 'Bearer ' + localStorage.getItem('access_token'),
            };
        },

        // ==================== SHARED ====================

        async fetchRoleGroups() {
            const res = await axiosInstance.get(
                '/api/roles/role-groups/list/',
                { headers: this.getAuthHeader() }
            );
            this.roleGroups = res.data.filter(g => g.is_active);
        },

        // ==================== USERS ====================

        async fetchUsers() {
            try {
                const res = await axiosInstance.get(
                    '/api/users/account/list/',
                    {
                        params: { user_type: 'client' },
                        headers: this.getAuthHeader(),
                    }
                );
                this.users = res.data?.data || [];
            } catch (error) {
                console.error(error);
            }
        },

        async fetchUserById(id) {
            const res = await axiosInstance.get(
                `/api/users/account/detail/${id}/`,
                { headers: this.getAuthHeader() }
            );
            this.selectedUser = res.data.data;
            return this.selectedUser;
        },

        async createUser(payload) {
            const res = await axiosInstance.post(
                '/api/users/account/create/',
                payload,
                { headers: this.getAuthHeader() }
            );
            await this.fetchUsers();
            return res.data;
        },

        async updateUser(id, payload) {
            const res = await axiosInstance.put(
                `/api/users/account/update/${id}/`,
                payload,
                { headers: this.getAuthHeader() }
            );
            await this.fetchUsers();
            return res.data;
        },

        async deleteUser(id) {
            const res = await axiosInstance.delete(
                `/api/users/account/delete/${id}/`,
                { headers: this.getAuthHeader() }
            );
            await this.fetchUsers();
            return res.data;
        },

        // ==================== CLIENTS ====================

        async fetchClients() {
            try {
                const res = await axiosInstance.get(
                    '/api/users/account/list/',
                    { headers: this.getAuthHeader() }
                );
                this.clients = res.data?.data || [];
            } catch (err) {
                console.error('Fetch Clients Error:', err);
            }
        },

        async fetchClientById(id) {
            const res = await axiosInstance.get(
                `/api/users/account/detail/${id}/`,
                { headers: this.getAuthHeader() }
            );
            this.selectedClient = res.data.data;
            return this.selectedClient;
        },

        async createClient(payload) {
            const res = await axiosInstance.post(
                '/api/users/account/create/',
                payload,
                { headers: this.getAuthHeader() }
            );
            await this.fetchClients();
            return res.data;
        },

        async updateClient(id, payload) {
            const res = await axiosInstance.put(
                `/api/users/account/update/${id}/`,
                payload,
                { headers: this.getAuthHeader() }
            );
            await this.fetchClients();
            return res.data;
        },

        async deleteClient(id) {
            const res = await axiosInstance.delete(
                `/api/users/account/delete/${id}/`,
                { headers: this.getAuthHeader() }
            );
            await this.fetchClients();
            return res.data;
        },

        // ==================== TOGGLE ACTIVE (shared — works for both) ====================

        async toggleActiveStatus(id, isActive) {
            const res = await axiosInstance.patch(
                `/api/users/account/toggle-active/${id}/`,
                { is_active: isActive },
                { headers: this.getAuthHeader() }
            );
            await this.fetchUsers();
            return res.data;
        },

        // Used by clientView — refreshes clients list after toggle
        async toggleClientStatus(id, isActive) {
            const res = await axiosInstance.patch(
                `/api/users/account/toggle-active/${id}/`,
                { is_active: isActive },
                { headers: this.getAuthHeader() }
            );
            await this.fetchClients();
            return res.data;
        },

        // ==================== ROLE GROUP ASSIGNMENT (client-only) ====================

        // Assign or remove FK role_group on a client
        // method: 'PUT' to assign, 'DELETE' to remove
        async updateClientRoleGroup(clientId, roleGroupId = null, method = 'PUT') {
            const config = { headers: this.getAuthHeader() };
            const url = `/api/users/account/role-group/${clientId}/`;

            const res = method === 'DELETE'
                ? await axiosInstance.delete(url, config)
                : await axiosInstance.put(url, { role_group_id: roleGroupId }, config);

            await this.fetchClients();
            return res.data;
        },

        // Add a role group to client's M2M role_groups
        async addClientRoleGroup(clientId, roleGroupId) {
            const res = await axiosInstance.post(
                `/api/users/account/role-groups/${clientId}/`,
                { role_group_id: roleGroupId },
                { headers: this.getAuthHeader() }
            );
            await this.fetchClients();
            return res.data;
        },

        // Remove a role group from client's M2M role_groups
        async removeClientRoleGroup(clientId, roleGroupId) {
            const res = await axiosInstance.delete(
                `/api/users/account/role-groups/${clientId}/`,
                {
                    headers: this.getAuthHeader(),
                    data: { role_group_id: roleGroupId },
                }
            );
            await this.fetchClients();
            return res.data;
        },

        // Get all M2M role groups for a client
        async fetchClientRoleGroups(clientId) {
            const res = await axiosInstance.get(
                `/api/users/account/role-groups/${clientId}/`,
                { headers: this.getAuthHeader() }
            );
            return res.data;
        },

        // Bulk replace all role groups for a client
        async bulkUpdateClientRoleGroups(clientId, roleGroupIds) {
            const res = await axiosInstance.put(
                `/api/users/account/role-groups/bulk/${clientId}/`,
                { role_group_ids: roleGroupIds },
                { headers: this.getAuthHeader() }
            );
            await this.fetchClients();
            return res.data;
        },

        // ==================== PASSWORD RESET ====================

        /**
         * Request password reset - sends reset link to user's email
         * No authentication required (public endpoint)
         * @param {string} email - User's email address
         * @returns {Promise<Object>} Response data
         */
        async requestPasswordReset(email) {
            this.loading = true;
            this.error = null;
            this.resetSuccess = false;

            try {
                const res = await axiosInstance.post(
                    '/api/users/password-reset/request/',
                    { email }
                );

                if (res.data.success) {
                    this.resetEmail = email;
                    this.resetSuccess = true;
                }

                return res.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to send reset link';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Validate password reset token
         * No authentication required (public endpoint)
         * @param {string} uid - Encoded user ID from email link
         * @param {string} token - Reset token from email link
         * @returns {Promise<Object>} Response data with email if valid
         */
        async validateResetToken(uid, token) {
            this.loading = true;
            this.error = null;

            try {
                const res = await axiosInstance.post(
                    '/api/users/password-reset/validate/',
                    { uid, token }
                );

                return res.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Invalid or expired reset link';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Confirm password reset with new password
         * No authentication required (public endpoint)
         * @param {string} uid - Encoded user ID from email link
         * @param {string} token - Reset token from email link
         * @param {string} newPassword - New password to set
         * @returns {Promise<Object>} Response data
         */
        async confirmPasswordReset(uid, token, newPassword) {
            this.loading = true;
            this.error = null;

            try {
                const res = await axiosInstance.post(
                    '/api/users/password-reset/confirm/',
                    {
                        uid,
                        token,
                        new_password: newPassword
                    }
                );

                return res.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to reset password';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Clear password reset state
         */
        clearResetState() {
            this.resetEmail = null;
            this.resetSuccess = false;
            this.error = null;
        }
    },
});