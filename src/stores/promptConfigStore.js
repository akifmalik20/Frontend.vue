import { defineStore } from 'pinia';
import { axiosInstance } from "@/utils/axiosInstance.js";

export const usePromptConfigStore = defineStore('promptConfigStore', {
    state: () => ({
        promptConfigs: [],
        selectedPromptDetail: null,
        clients: [],
        loading: false,
        error: null,
    }),

    actions: {

        getAuthHeader() {
            const token = localStorage.getItem('access_token');
            return { Authorization: 'Bearer ' + token };
        },

        // 0. Fetch All Clients (for dropdown)
        async fetchClients() {
            try {
                const response = await axiosInstance.get("/api/users/account/list/", {
                    headers: this.getAuthHeader()
                });
                this.clients = response.data?.data || [];
            } catch (err) {
                console.error("Failed to fetch clients:", err);
            }
        },

        // 1. Fetch All Prompt Configs (Table list)
        async fetchPromptConfigs() {
            this.loading = true;
            this.error = null;
            try {
                const response = await axiosInstance.get("/api/users/prompt-config/list/", {
                    headers: this.getAuthHeader()
                });
                this.promptConfigs = response.data?.data || response.data;
                console.log(this.promptConfigs);
            } catch (err) {
                this.error = "An unexpected error occurred.";
                console.error("Store level error:", this.error);
            } finally {
                this.loading = false;
            }
        },

        // 2. Create New Prompt Config
        async createPromptConfig(promptData) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axiosInstance.post("/api/users/prompt-config/create/", promptData, {
                    headers: this.getAuthHeader()
                });
                return response.data;
            } finally {
                this.loading = false;
            }
        },

        // 3. Update Existing Prompt Config
        async updatePromptConfig(id, updatedData) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axiosInstance.put(`/api/users/prompt-config/${id}/`, updatedData, {
                    headers: this.getAuthHeader()
                });
                return response.data;
            } finally {
                this.loading = false;
            }
        },

        // 4. View Prompt Config Details by ID


        // 5. Delete Prompt Config
        async deletePromptConfig(id) {
            this.loading = true;
            try {
                const response = await axiosInstance.delete(`/api/users/prompt-config/${id}/`, {
                    headers: this.getAuthHeader()
                });
                await this.fetchPromptConfigs();
                return response.data;
            } finally {
                this.loading = false;
            }
        },
        // async viewPromptConfigById(id) {
        //     this.loading = true;
        //     try {
        //         const response = await axiosInstance.get(`/api/users/prompt-config/${id}/`, {
        //             headers: this.getAuthHeader()
        //         });
        //         return response.data;
        //     } finally {
        //         this.loading = false;
        //     }
        // },
    }
});