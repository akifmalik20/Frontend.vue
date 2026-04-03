import { defineStore } from 'pinia'
import axiosInstance from "@/utils/axiosInstance.js";
import { useAuthStore } from "@/stores/authStore";

export const useChatStore = defineStore('chat', {
    state: () => ({
        socket: null,
        user: null,
        isConnected: false,
        isConnecting: false,
        activeUserId: null,
        loading: false,
        allUsersCache: [],
        messages: [],
        searchResults: [],
        recentChats:[]
    }),

    actions: {
        getAuthHeader() {
            return {
                Authorization: 'Bearer ' + localStorage.getItem('access_token'),
            };
        },
        async fetchSearchList(auth_user_id) {

            console.log("Auth user id for the SEARCH LIST:",auth_user_id)
            const res = await axiosInstance.post(
                'api/chatapp/chat/search/',
                { auth_user_id },
                   {headers: this.getAuthHeader()}
            );

            this.searchResults = res.data;
            localStorage.setItem('cached_users', JSON.stringify(res.data))

            console.log("Search list result:", this.searchResults);
        },

        async fetchRecentChats() {
            const res = await axiosInstance.get('api/chatapp/chat/recent_chats',
            { headers: this.getAuthHeader() }
            );
            this.recentChats =  res.data;
            console.log("Recent chats for the current user",this.recentChats);
        },
        connect(token) {
            if (this.socket &&
                (this.socket.readyState === WebSocket.OPEN ||
                    this.socket.readyState === WebSocket.CONNECTING)) {
                return;
            }

            this.isConnecting = true;

            const url = `ws://127.0.0.1:8000/ws/chat/?token=${token}`;
            this.socket = new WebSocket(url);

            this.socket.onopen = () => {
                this.isConnected = true;
                this.isConnecting = false;

            };

            this.socket.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.sub_type === "chat_history") {
                    this.messages = data.messages;
                    if (this.activeUserId) {
                        localStorage.setItem(`chat_${this.activeUserId}`, JSON.stringify(data.messages));
                    }
                    return;
                }

                if (data.sub_type === "new_message") {
                    this.messages.push(data);
                    if (this.activeUserId) {
                        const cached = JSON.parse(localStorage.getItem(`chat_${this.activeUserId}`) || '[]');
                        cached.push(data);
                        localStorage.setItem(`chat_${this.activeUserId}`, JSON.stringify(cached));
                    }
                    return;
                }

                if (data.sub_type === "delivered_receipt") {
                    const msg = this.messages.find(m => m.conversation_id == data.conversation_id);
                    if (msg) msg.status = "delivered";
                }

                if (data.sub_type === "read_receipt") {
                    const msg = this.messages.find(m => m.conversation_id == data.conversation_id);
                    if (msg) msg.status = "read";
                }
            };

            this.socket.onclose = () => {
                this.isConnected = false;
                this.isConnecting = false;
                console.warn("❌ WS Closed");

                setTimeout(() => {
                    this.connect(token); // auto reconnect
                }, 20);
            };
        },

        sendMessage(payload) {
            if (this.socket?.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify(payload));
            }
        },

        loadChat(otherUserId) {

            this.activeUserId = otherUserId;
            const cached = localStorage.getItem(`chat_${otherUserId}`);

            if (cached) {
                this.messages = JSON.parse(cached);
                return;
            }
            this.messages=[];
            this.sendMessage({
                type: "load_chat",
                other_user_id: otherUserId
            });
        }
    },
    persist: {
        key: 'chatStore',
        paths: ['messages', 'activeUserId'], // persist these fields only
        storage: localStorage
    }
});