import { defineStore } from 'pinia';
import { axiosInstance } from "@/utils/axiosInstance.js";
import Papa from "papaparse";
export const useContactStore = defineStore('contactStore', {
    state: () => ({
        contacts: [],
       // roleTypes: [],
        selectedContactDetail: null, // Edit form ko fill karne ke liye
        loading: false,
        error: null,

    }),

    actions: {

        getAuthHeader() {
            const token = localStorage.getItem('access_token');
            return { Authorization: 'Bearer ' + token };
        },



        async fetchContacts() {
            this.loading = true;
            this.error = null;
            try {
                const response = await axiosInstance.get("/api/aiagent/contacts/list/", {
                    headers: this.getAuthHeader()
                });
                this.contacts = response.data.data || [];

            } catch (err) {
                this.error = "An unexpected error occurred.";
                console.error("Store level error:", this.error);
            } finally {
                this.loading = false;
            }
        },

        // 3. Create New Role
        async createContacts(contactDetails) {
            this.loading = true;
            this.error = null;

            try {
                // Get client_id from localStorage
                const clientId = localStorage.getItem("client_id");

                // Merge client_id into payload
                const payload = {
                    ...contactDetails,
                    client_id: clientId
                };

                const response = await axiosInstance.post(
                    "/api/aiagent/contacts/create/",
                    payload,
                    {
                        headers: this.getAuthHeader()
                    }
                );

                return response.data;
               // await fetchcontacts();
            } catch (err) {
                this.error = err;
                throw err;
            } finally {
                this.loading = false;
            }
        },
        // 4. Update Existing Role
        async updateContact(id, updatedData) {
            this.loading = true;
            this.error = null;
            try {
                // Corrected the order: contacts/${id}/update/
                const response = await axiosInstance.put(`/api/aiagent/contacts/${id}/update/`, updatedData, {
                    headers: this.getAuthHeader()
                });
                return response.data;
            } catch (err) {
                this.error = err.message;
                throw err;
            } finally {
                this.loading = false;
            }
        },

        // 7. Delete Role
        async deleteContact(id) {
            this.loading = true;
            try {
                const response = await axiosInstance.delete(`/api/aiagent/contacts/${id}/delete/`, {
                    headers: this.getAuthHeader()
                });
                //await this.fetchcontacts();
                return response.data;
            }  finally {
                this.loading = false;
            }
        },
        async bulkCreateContacts(contactsArray) {
            this.loading = true;


            console.log(contactsArray);
            try {
                const res = await axiosInstance.post(
                    "/api/aiagent/contacts/bulk-upload/", // MATCH THE DJANGO PATH
                    contactsArray, // Send the payload directly
                    {
                        headers: this.getAuthHeader()
                    }
                );
                return res.data;
                this.fetchcontacts();
            } catch (err) {
                this.error = err.response?.data || err.message;
                throw err;
            } finally {
                this.loading = false;
            }
        }


    }
});

