
import { defineStore } from 'pinia';
import { axiosInstance } from "@/utils/axiosInstance.js";

export const useChatbotStore = defineStore('chatbotStore', {
    state: () => ({
        documents: [],
        loading: false,
        error: null,
        uploadProgress: 0,
    }),

    actions: {
        getAuthHeader() {
            const token = localStorage.getItem('access_token');
            return {
                Authorization: 'Bearer ' + token
            };
        },

        getJsonHeader() {
            const token = localStorage.getItem('access_token');
            return {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json'
            };
        },

        // Fetch all documents for the current client
        async fetchDocuments() {
            this.loading = true;
            this.error = null;
            try {
                const response = await axiosInstance.get(
                    "/api/chatbot/list-documents/",  // No params needed
                    {
                        headers: this.getJsonHeader()
                    }
                );

                if (response.data && response.data.success) {
                    this.documents = response.data.documents || [];
                }
                return response.data;
            } catch (err) {
                // ... error handling
            } finally {
                this.loading = false;
            }
        },

        async uploadDocument(fileData) {
            this.loading = true;
            this.error = null;
            this.uploadProgress = 0;

            try {
                const formData = new FormData();

                // Append file - IMPORTANT: field name must be 'document' exactly as in Postman
                if (fileData.file) {
                    formData.append('document', fileData.file);
                }

                // Append user_id
                if (fileData.user_id) {
                    formData.append('user_id', fileData.user_id);
                }

                console.log('FormData contents:');
                for (let pair of formData.entries()) {
                    console.log(pair[0] + ': ', pair[1]);
                }

                const response = await axiosInstance.post(
                    "/api/chatbot/upload-document/",
                    formData,
                    {
                        headers: this.getAuthHeader(),
                        // Don't set Content-Type header - browser will set it with boundary
                        onUploadProgress: (progressEvent) => {
                            if (progressEvent.total) {
                                this.uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            }
                        }
                    }
                );

                this.uploadProgress = 100;

                // Refresh documents list after successful upload
                if (response.data.success) {
                    await this.fetchDocuments();
                }

                return response.data;

            } catch (err) {
                this.error = err.response?.data?.message || err.response?.data?.document?.[0] || "Document upload failed.";
                console.error("Chatbot Store error:", err.response?.data);
                throw err;
            } finally {
                this.loading = false;
            }
        },

        // Delete document
        async deleteDocument(documentId) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axiosInstance.delete(
                    `/api/chatbot/documents/delete/${documentId}/`,
                    {
                        headers: this.getJsonHeader()
                    }
                );

                // Refresh documents list after successful delete
                if (response.data.success) {
                    await this.fetchDocuments();
                }

                return response.data;
            } catch (err) {
                this.error = err.response?.data?.message || "Failed to delete document.";
                console.error("Chatbot Store error (deleteDocument):", err);
                throw err;
            } finally {
                this.loading = false;
            }
        },
    }
});
export const useChatStore = defineStore('chatStore', {
    state: () => ({
        messages: [],
        isLoading: false,
        error: null,
        isChatOpen: false,
    }),

    actions: {
        getAuthHeader() {
            const token = localStorage.getItem('access_token');
            return {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json'
            };
        },

        // Initialize chat with welcome message
        initializeChat() {
            if (this.messages.length === 0) {
                this.messages.push({
                    type: 'bot',
                    text: 'Hello! How can I assist you today?',
                    timestamp: new Date()
                });
            }
        },

        // Send message to chatbot
        async sendMessage(userQuery, userId, language='en') {
            this.isLoading = true;
            this.error = null;

            // Add user message immediately
            const userMessage = {
                type: 'user',
                text: userQuery,
                timestamp: new Date()
            };
            this.messages.push(userMessage);

            try {
                const response = await axiosInstance.post(
                    "/api/chatbot/chat/",
                    {
                        user_id: userId,
                        user_query: userQuery,
                        user_language: language
                    },
                    {
                        headers: this.getAuthHeader()
                    }
                );

                // Add bot response
                if (response.data && response.data.answer) {
                    const botMessage = {
                        type: 'bot',
                        text: response.data.answer,
                        timestamp: new Date()
                    };
                    this.messages.push(botMessage);
                }

                return response.data;

            } catch (err) {
                this.error = err.response?.data?.message || "Failed to send message.";

                // Add error message
                const errorMessage = {
                    type: 'bot',
                    text: 'Sorry, I encountered an error. Please try again later.',
                    timestamp: new Date(),
                    isError: true
                };
                this.messages.push(errorMessage);

                console.error("Chat Store error (sendMessage):", err);
                throw err;
            } finally {
                this.isLoading = false;
            }
        },

        // Clear chat history
        clearChat() {
            this.messages = [];
            this.initializeChat();
        },

        // Toggle chat window
        toggleChat() {
            this.isChatOpen = !this.isChatOpen;
            if (this.isChatOpen && this.messages.length === 0) {
                this.initializeChat();
            }
        },

        // Close chat
        closeChat() {
            this.isChatOpen = false;
        },

        // Open chat
        openChat() {
            this.isChatOpen = true;
            if (this.messages.length === 0) {
                this.initializeChat();
            }
        }
    }
});