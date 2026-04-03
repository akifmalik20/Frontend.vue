import { defineStore } from 'pinia';
import { axiosInstance } from "@/utils/axiosInstance.js";

export const useGroupRoleStore = defineStore('roleGroupStore', {
    state: () => ({
        rolesGroup: [],
        roleTypes: [],
        selectedRoleDetail: null, // Edit form ko fill karne ke liye
        loading: false,
        error: null,

    }),

    actions: {

        getAuthHeader() {
            const token = localStorage.getItem('access_token');
            return { Authorization: 'Bearer ' + token };
        },

        // 1. Fetch Role Types (Dropdowns)
        ///fetch list of roles
        async fetchRole() {
            try {
                const response = await axiosInstance.get("/api/roles/roles/list/", {
                    headers: this.getAuthHeader()
                });
                this.roleTypes = response.data;
            } catch (err) {

                console.error("Store level error (RoleTypes):", err);

            }
        },

        // 2. Fetch All Roles (Table list)
        ///fetch group roles
        async fetchRolesGroup() {
            this.loading = true;
            this.error = null;
            try {
                const response = await axiosInstance.get("/api/roles/role-groups/list/", {
                    headers: this.getAuthHeader()
                });
                this.rolesGroup = response.data;

            } catch (err) {
                this.error = "An unexpected error occurred.";
                console.error("Store level error:", this.error);
            } finally {
                this.loading = false;
            }
        },

        // 3. Create New Role
        async createRoleGroup(roleGroupData) {

            this.loading = true;
            this.error = null;
            try {
                const response = await axiosInstance.post("/api/roles/role-groups/create/", roleGroupData, {
                    headers: this.getAuthHeader()
                });
                return response.data;

            } finally {
                this.loading = false;
            }
        },
        // 4. Update Existing Role
        async updateRoleGroup(id, updatedData) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axiosInstance.put(`/api/roles/role-groups/update/${id}/`, updatedData, {
                    headers: this.getAuthHeader()
                });
                return response.data;

            }  finally {
                this.loading = false;
            }
        },
        // 5. Viewing Role Details (Specific ID ka data dekhne ke liye)
        async viewRoleGroupDataById(id) {
            this.loading = true;
            try {
                const response = await axiosInstance.get(`/api/roles/role-groups/detail/${id}/`, {
                    headers: this.getAuthHeader()
                });
                return response.data;
            } finally {
                this.loading = false;
            }
        },


        // 7. Delete Role
        async deleteRoleGroup(id) {
            this.loading = true;
            try {
                const response = await axiosInstance.delete(`/api/roles/role-groups/delete/${id}/`, {
                    headers: this.getAuthHeader()
                });
                await this.fetchRolesGroup();
                return response.data;
            }  finally {
                this.loading = false;
            }
        },

        async toggleRoleGroupStatus(id, currentStatus)
        {
            this.loading = true;
            try {
                const payload = {
                    role_group_id: id,
                    is_active: !currentStatus // Flips the current state
                };
                // Using POST based on your payload requirement
                const response = await axiosInstance.post(`/api/roles/role-groups/toggle-active/`, payload, {
                    headers: this.getAuthHeader()
                });

                // Refresh the list so the UI reflects the DB state
                await this.fetchRolesGroup();
                return response.data;
            } finally {
                this.loading = false;
            }
        }
    }
});