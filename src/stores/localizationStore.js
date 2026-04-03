import { defineStore } from 'pinia';
import { axiosInstance } from "@/utils/axiosInstance.js";

export const useLocalizationStore = defineStore('localizationStore', {
    state: () => ({
        localizations: [],
        loading: false,
        error: null,
        module:[]
    }),

    actions: {
        getAuthHeader() {
            const token = localStorage.getItem('access_token');
            return { Authorization: 'Bearer ' + token };
        },


        async fetchLocalizationList() {
            this.loading = true;
            this.error = null;
            try {
                const response = await axiosInstance.get("/api/users/localizations/", {
                    headers: this.getAuthHeader()
                });


                if (response.data && response.data.success) {

                    this.localizations = response.data.data;
                } else {
                    this.error = response.data.message || "Subscriptions load nahi ho sakein.";
                }

            } catch (err) {
                // Server error message handle karna
                this.error = err.response?.data?.message || "Server se connect karne mein masla hua.";
                console.error("Localization Store Error:", err);
            } finally {
                this.loading = false;
            }
        },
        // 3. Create New Role
        async createLocalization(localizationData) {
            this.loading = true;
            this.error = null;
            try {
                // Changed 'roleData' to 'subscriptionData' to match the parameter
                const response = await axiosInstance.post("/api/users/localizations/create/", localizationData, {
                    headers: this.getAuthHeader()
                });
                return response.data;
            } catch (err) {
                this.error = err.response?.data?.message || "Failed to create localization";
                throw err; // Crucial so the component can catch the error
            } finally {
                this.loading = false;
            }
        },
        async updateLocalization(id, updatedData) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axiosInstance.put(`/api/users/localizations/${id}/update/`, updatedData, {
                    headers: this.getAuthHeader()
                });

                // Refresh the list automatically after update
                await this.fetchLocalizationList();
                return response.data;
            } catch (err) {
                this.error = err.response?.data?.message || "Failed to update plan";
                throw err;
            } finally {
                this.loading = false;
            }
        },

        // 2. View Specific Localization Data
        // async viewLocalizationById(id) {
        //     this.loading = true;
        //     try {
        //         const response = await axiosInstance.get(`/api/users/localizations/${id}/`, {
        //             headers: this.getAuthHeader()
        //         });
        //         return response.data;
        //     } catch (err) {
        //         console.error("Error fetching detail:", err);
        //         throw err;
        //     } finally {
        //         this.loading = false;
        //     }
        // },

        async deleteLocalization(id) {
            this.loading = true;
            try {
                const response = await axiosInstance.delete(`/api/users/localizations/${id}/delete/`, {
                    headers: this.getAuthHeader()
                });

                await this.fetchLocalizationList();
                // Return true if status is 200-299 even if response.data is empty
                return response.status >= 200 && response.status < 300;
            } catch (err) {
                this.error = err.response?.data?.message || "Failed to delete item";
                throw err;
            } finally {
                this.loading = false;
            }
        },
        async fetchModules() {
            try {
                const response = await axiosInstance.get("/api/modules/list", {
                    headers: this.getAuthHeader()
                });
                this.module = response.data;
            } catch (err) {

                console.error("Store level error (RoleTypes):", err);

            }
        }



    }});
