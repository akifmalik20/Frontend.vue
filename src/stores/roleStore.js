import { defineStore } from 'pinia';
import { axiosInstance } from "@/utils/axiosInstance.js";

export const useRoleStore = defineStore('roleStore', {
  state: () => ({
    roles: [], 
    roleTypes: [], 
    selectedRoleDetail: null, // Edit form fill
    loading: false,
    error: null,
  }),

  actions: {
    
    getAuthHeader() {
      const token = localStorage.getItem('access_token');
      return { Authorization: 'Bearer ' + token };
    },

    // 1. Fetch Role Types (Dropdowns)
      async fetchRoleTypes() {
          try {
              const response = await axiosInstance.get("/api/roles/role-types/list/", {
                  headers: this.getAuthHeader()
              });
              this.roleTypes = response.data;
              console.log("these are typessss:",this.roleTypes);
          } catch (err) {

              console.error("Store level error (RoleTypes):", err);

          }
      },

    // 2. Fetch All Roles (Table list)
      async fetchRoles() {
          this.loading = true;
          this.error = null;
          try {
              const response = await axiosInstance.get("/api/roles/roles/list/", {
                  headers: this.getAuthHeader()
              });
              this.roles = response.data;
          } catch (err) {
              this.error = "An unexpected error occurred.";
              console.error("Store level error:", this.error);
          } finally {
              this.loading = false;
          }
      },

      // 3. Create New Role
      async createRole(roleData) {
          this.loading = true;
          this.error = null;
          try {
              const response = await axiosInstance.post("/api/roles/roles/create/", roleData, {
                  headers: this.getAuthHeader()
              });
              return response.data;

          } finally {
              this.loading = false;
          }
      },
    // 4. Update Existing Role
      async updateRole(id, updatedData) {
          this.loading = true;
          this.error = null;
          try {
              const response = await axiosInstance.put(`/api/roles/roles/update/${id}/`, updatedData, {
                  headers: this.getAuthHeader()
              });
              return response.data;

          }  finally {
              this.loading = false;
          }
      },
    // 5. Viewing Role Details (Specific ID ka data dekhne ke liye)



    // 7. Delete Role
      async deleteRole(id) {
          this.loading = true;
          try {
              const response = await axiosInstance.delete(`/api/roles/roles/delete/${id}/`, {
                  headers: this.getAuthHeader()
              });
            await this.fetchRoles();
              return response.data;
          }  finally {
              this.loading = false;
          }
      },

      async toggleRoleStatus(id, currentStatus) {
          this.loading = true;


          try {
              const payload = {
                  role_id: id,
                  is_active: !currentStatus // Flips the current state
              };

              // Using POST based on your payload requirement
              const response = await axiosInstance.post(`/api/roles/roles/set-active-status/`, payload, {
                  headers: this.getAuthHeader()
              });

              // Refresh the list so the UI reflects the DB state
              await this.fetchRoles();
              return response.data;
          } finally {
              this.loading = false;
          }
      },
      async viewRoleDataById(id) {
          this.loading = true;
          try {
              const response = await axiosInstance.get(`/api/roles/roles/detail/${id}/`, {
                  headers: this.getAuthHeader()
              });
              return response.data;
          } finally {
              this.loading = false;
          }
      }
  }
});