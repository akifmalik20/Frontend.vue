import { defineStore } from 'pinia';
import { axiosInstance } from "@/utils/axiosInstance.js";
export const useSubscriptionStore = defineStore('subscriptionStore', {
    state: () => ({
        subscriptions: [],
        subscription_types: [],
        clients:[],
        payment_options: [],
        loading: false,
        error: null,
    }),

    actions: {
        getAuthHeader() {
            const token = localStorage.getItem('access_token');
            return { Authorization: 'Bearer ' + token };
        },


        async updatePaymentStatus(payload) {
            try {
                // Create the request body
                const requestBody = {
                    user_id: payload.client_id,
                    plan_id: payload.plan_id,
                    payment_status: payload.payment_status
                };

                const response = await axiosInstance.patch(
                    `/api/subscription/update-payment-status/`,
                    requestBody
                );
                await this.fetchSubscriptionList();
                return response.data;
            } catch (error) {
                throw error;
            }
        }
        ,
        async fetchSubscriptionList() {
            try {
                const response = await axiosInstance.get('/api/subscription/plans');
                // If the API returns data.data.subscription_types, adjust accordingly
                this.subscriptions = response.data || {};
                this.subscription_types = response.data.subscription_types || []; // Fallback to []
                this.payment_options = response.data.payment_options || [];

                return response.data;
            } catch (error) {
                console.error('Error fetching subscriptions:', error);
                throw error;
            }
        },
        async fetchClients() {
            try {
                const res = await axiosInstance.get(
                    '/api/users/account/list/',
                    {
                        params: { user_is_active: true}, // Keep this for consistency

                        headers: this.getAuthHeader()
                    }
                );

                // Filter active users on the frontend since backend isn't filtering
                this.clients = (res.data?.data || []).filter(user =>
                    user.is_active === true || user.user_is_active === true
                );

                console.log(`Total users from API: ${res.data?.data?.length}, Active users: ${this.clients.length}`);

            } catch (err) {
                console.error('Fetch Clients Error:', err);
            }
        },
        async endAssignment(subscriptionId, payload) {
            const response = await axiosInstance.put(
                `/api/subscription/${subscriptionId}/end/`,
                payload
            );
            // await this.fetchSubscriptionList();
            await  this.fetchClients();
            return response.data;
        },
        async getSubscriptionByClient(clientId) {
            try {
                console.log("Client_id",clientId);
                const response = await axiosInstance.get(
                    `/api/subscription/client/${clientId}/`
                );
                return response.data;
            } catch (error) {
                console.error("Error fetching client subscription:", error);
                throw error;
            }
        },
        // 3. Create New Role
        async createSubscriptionPlan(subscriptionData) {
            this.loading = true;
            this.error = null;
            try {

                const response = await axiosInstance.post("/api/subscription/plans/create/", subscriptionData, {
                    headers: this.getAuthHeader()
                });
                return response.data;
            } catch (err) {
                this.error = err.response?.data?.message || "Failed to create localization";
                throw err;
            } finally {
                this.loading = false;
            }
        },
        async updateSubscriptionPlan(id, updatedData) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axiosInstance.put(`/api/subscription/plans/${id}/update/`, updatedData, {
                    headers: this.getAuthHeader()
                });

                await this.fetchSubscriptionList();
                return response.data;
            } catch (err) {
                this.error = err.response?.data?.message || "Failed to update plan";
                throw err;
            } finally {
                this.loading = false;
            }
        },

        // 2. View Specific  Data
        async viewSubscriptionById(id) {
            this.loading = true;
            try {
                const response = await axiosInstance.get(`/api/subscription/plans/${id}/`, {
                    headers: this.getAuthHeader()
                });
                return response.data;
            } catch (err) {
                console.error("Error fetching detail:", err);
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async deleteSubscriptionPlan(id) {
            this.loading = true;
            this.error = null; // Clear previous errors

            try {
                const response = await axiosInstance.delete(`/api/subscription/plans/${id}/delete/`, {
                    headers: this.getAuthHeader()
                });
               await  this.fetchSubscriptionList();

                return response.data;
            } catch (err) {
                // Direct, descriptive error handling
                this.error = err.response?.data?.detail || err.response?.data?.message || "Failed to delete item";
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async subscriptionPlanAssign(payload) {
            this.loading = true;
            try {
               console.log("Payload",payload);
                const response = await axiosInstance.post(`/api/subscription/assign/`, payload, {
                    headers: this.getAuthHeader()
                });
                await  this.fetchClients();
                return response.data;
            } catch (err) {
                console.error("Error Assigning:", err);
                throw err;
            } finally {
                this.loading = false;
            }
        },
        async toggleSubscriptionStatus(id, currentStatus)
        {
            this.loading = true;
            try {
                const payload = {
                    plan_id: id,
                    is_active: !currentStatus // Flips the current state
                };
                // Using POST based on your payload requirement
                const response = await axiosInstance.post(`/api/subscription/subscription-plans/set-status/`, payload, {
                    headers: this.getAuthHeader()
                });

                // Refresh the list so the UI reflects the DB state
                await this.fetchSubscriptionList();
                return response.data;
            } finally {
                this.loading = false;
            }
        }
}});
