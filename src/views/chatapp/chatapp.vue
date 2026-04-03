<template>
  <div class="min-h-screen from-emerald-50 via-green-50 to-teal-50 p-4 md:p-6">
    <div class="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden flex flex-col lg:flex-row h-[600px]">

      <!-- ===== SIDEBAR ===== -->
      <div class="lg:w-72 bg-gradient-to-b from-green-50 to-emerald-50 border-r border-green-100 flex flex-col">

<!--         Sidebar Header -->
        <div class="p-5 bg-gradient-to-r from-teal-600 to-emerald-600">
          <h2 class="font-semibold text-white text-lg flex items-center gap-2">
            <font-awesome-icon :icon="['fas', 'comment-dots']" class="w-4 h-4" />
            Messages
          </h2>
          <p class="text-teal-100 text-sm mt-1">Your conversations</p>
        </div>

        <!-- Search Box -->
        <div class="p-3 border-b border-green-100 relative search-box">
          <input
              v-model="searchQuery"
              @input="onSearch"
              placeholder="Search users..."
              class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 bg-white hover:border-teal-300 text-sm outline-none"
          />

          <!-- Search Dropdown -->
          <div
              v-if="showSearch && searchQuery"
              class="absolute left-3 right-3 top-full mt-1 bg-white border border-green-100 rounded-xl shadow-lg z-10 overflow-hidden"
          >
            <div
                v-for="user in chatStore.searchResults"
                :key="user.id"
                class="flex items-center gap-3 px-4 py-2.5 hover:bg-green-50 cursor-pointer transition-colors duration-200"
                @click="openChat(user.auth_user_id,user.full_name)"
            >
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {{ getUserInitials(user.full_name) }}
              </div>
              <span class="text-sm text-gray-800 font-medium">{{ user.full_name}}</span>
            </div>

            <div v-if="chatStore.searchResults.length === 0" class="px-4 py-3 text-sm text-gray-500 text-center">
              No users found
            </div>
          </div>
        </div>

        <!-- Section Label -->
        <p class="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-widest">Recent</p>

        <!-- Recent Chats List -->
        <div class="flex-1 overflow-y-auto">
          <div
              v-for="chat in chatStore.recentChats"
              :key="chat.other_user_id"
              class="flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-green-50 transition-all duration-200"
              :class="chatStore.activeUserId === chat.other_user_id
              ? 'bg-white border-l-2 border-l-teal-500'
              : 'hover:bg-white'"
              @click="openChat(chat.other_user_id)"
          >
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
              {{ getUserInitials(chat.other_user_name) }}
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-center">
                <span class="text-sm font-semibold text-gray-900">{{ chat.other_user_name }}</span>
                <span class="text-xs text-gray-400">{{ formatTime(chat.last_message_time) }}</span>
              </div>
              <div class="flex justify-between items-center mt-0.5">
                <span class="text-xs text-gray-500 truncate max-w-[160px]">{{ chat.last_message }}</span>
<!--                <span-->
<!--                    v-if="chat.unread_count > 0"-->
<!--                    class="ml-2 bg-teal-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"-->
<!--                >-->
<!--                  {{ chat.unread_count }}-->
<!--                </span>-->
              </div>
            </div>
          </div>

          <div v-if="chatStore.recentChats.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-400">
            <font-awesome-icon :icon="['fas', 'comment-slash']" class="w-10 h-10 mb-3 text-gray-300" />
            <p class="text-sm">No chats yet</p>
          </div>
        </div>
      </div>

      <!-- ===== MAIN AREA ===== -->
      <div class="flex-1 flex flex-col overflow-hidden">

        <!-- No chat selected -->
        <div v-if="!chatStarted" class="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
          <div class="w-16 h-16 rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center">
            <font-awesome-icon icon="fa-solid fa-comments" class="w-7 h-7 text-teal-400" />
          </div>
          <p class="text-sm text-gray-500">Select a conversation to start chatting</p>
        </div>

        <!-- Chat Screen -->
        <div v-else class="flex flex-col flex-1 overflow-hidden">

          <!-- Top Bar -->
          <div class="flex items-center gap-3 px-5 py-4 border-b border-green-100 bg-white">
            <button
                @click="goBack"
                class="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600 border border-gray-200 hover:border-teal-300 px-3 py-1.5 rounded-lg transition-all duration-200"
            >
              <font-awesome-icon :icon="['fas', 'arrow-left']" class="w-3 h-3" />
              Back
            </button>

            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {{ getUserInitials(activeUserName) }}
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-900">{{ activeUserName }}</p>
              <p class="text-xs text-emerald-500">Online</p>
            </div>
          </div>

          <!-- Messages Log -->
          <div class="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 h-[400px]" ref="chatLog">
            <div
                v-for="msg in chatStore.messages"
                :key="msg.conversation_id"
                :ref="el => observeMessage(el)"
                class="flex"
                :class="msg.sender_id === auth_user_id ? 'justify-end' : 'justify-start'"
            >
              <div
                  class="max-w-[65%] px-4 py-2.5 text-sm leading-relaxed"
                  :class="msg.sender_id === auth_user_id
                   ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-2xl rounded-br-sm'
                   : 'bg-gray-100 text-gray-800 border border-green-100 rounded-2xl rounded-bl-sm'"
              >
                {{ msg.message }}

                <div
                    class="flex items-center gap-1 mt-1"
                    :class="msg.sender_id === auth_user_id ? 'justify-end' : 'justify-start'"
                >
                <span class="text-[11px] opacity-70" :class="msg.sender_id === auth_user_id ? 'text-white' : 'text-gray-400'">
                 {{ formatTime(msg.sent_at) }}
                 </span>

                  <span
                      v-if="msg.sender_id === auth_user_id" class="text-[11px] opacity-80" :class="msg.status === 'read' ? 'text-teal-200' : 'text-white'">
                    <span v-if="msg.status === 'sent'">✓</span>
                  <span v-else-if="msg.status === 'delivered'">✓✓</span>
                  <span v-else-if="msg.status === 'read'">✓✓</span>
                   </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Input Bar -->
          <div class="px-4 py-3 border-t border-green-100 bg-white flex items-center gap-3">
            <input
                v-model="newMessage"
                @keyup.enter="sendMessage"
                placeholder="Type a message..."
                class="flex-1 px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white hover:border-teal-300 transition-all duration-300 outline-none"
            />
            <button
                @click="sendMessage"
                class="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-sm font-semibold rounded-full hover:from-teal-600 hover:to-emerald-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <font-awesome-icon :icon="['fas', 'paper-plane']" class="w-3.5 h-3.5" />
              Send
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore.js';
import { useChatStore } from '@/stores/chatappStore';

const chatStore = useChatStore();
const authStore = useAuthStore();

let reconnectTimer = null;
let isIntentionallyClosed = false;

const chatLog = ref(null);
const chatStarted = ref(false);
const showSearch = ref(false);
const newMessage = ref('');
const searchQuery = ref('');

console.log('AuthStore user id:', authStore.authUserId);
const auth_user_id = computed(() => parseInt(authStore.authUserId));
console.log('Current user id:', auth_user_id.value);

// ── Active user name for the top bar
const activeUserName = computed(() => {
  if (chatStore.activeUserName) return chatStore.activeUserName;  // ← from search dropdown
  const chat = chatStore.recentChats.find(c => c.other_user_id === chatStore.activeUserId);
  return chat?.other_user_name ?? '';
});

// ── Avatar initials helper
function getUserInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
}

// ── Format timestamp
function formatTime(time) {
  // Append 'Z' to tell JS this is UTC
  const fixed = time.includes('T') ? time : time.replace(' ', 'T') + 'Z';
  const date = new Date(fixed);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString();
}

// ── Open chat
async function openChat(userId, username = null) {
  chatStore.messages = [];
  chatStore.activeUserId = userId;       // ← add this
  chatStore.activeUserName = username;
  chatStore.loadChat(userId);
  chatStarted.value = true;
  showSearch.value = false;
  searchQuery.value='';
  chatStore.searchResults = [];
  await nextTick();
  scrollToBottom();
}

// ── Go back to chat list
function goBack() {
  chatStarted.value = false;
}

// ── Search
const onSearch = () => {
  showSearch.value = true;
  const cached = localStorage.getItem('cached_users');

  if (!cached) {
    chatStore.fetchSearchList(auth_user_id.value);
    return;
  }
  const parsed = JSON.parse(cached);
  console.log("Cached user sample:", parsed[0]);
  chatStore.searchResults = JSON.parse(cached).filter(user => user.username.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
};

// Close search dropdown when clicking outside .search-box
document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-box')) {
    showSearch.value = false;
  }
});

// ── Auto scroll to bottom on new messages
const scrollToBottom = () => {
  if (chatLog.value) {
    chatLog.value.scrollTop = chatLog.value.scrollHeight;
  }
};

watch(() => chatStore.messages, async () => {
  await nextTick();
  scrollToBottom();
}, { deep: true });

// ── Read receipts via IntersectionObserver
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const id = entry.target.dataset.id;
    const msg = chatStore.messages.find(m => m.conversation_id == id);

    if (msg && msg.status !== 'read' && msg.sender_id != auth_user_id.value) {
      msg.status = 'read';
      chatStore.sendMessage({
        type: 'read_ack',
        conversation_id: msg.conversation_id
      });
    }

    observer.unobserve(entry.target);
  });
}, { threshold: 0.6 });

const observeMessage = (el) => {
  if (el) observer.observe(el);
};

// ── Send message
const sendMessage = () => {
  if (!newMessage.value.trim()) return;
  chatStore.sendMessage({
    to_user_id: chatStore.activeUserId,
    message: newMessage.value
  });
  newMessage.value = '';
};

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  const token = authStore.accessToken || localStorage.getItem('access_token');
  if (token) {
    chatStore.connect(token);
    await chatStore.fetchRecentChats();
    await chatStore.fetchSearchList(authStore.authUserId);
  }
});

onUnmounted(() => {
  isIntentionallyClosed = true;
  clearTimeout(reconnectTimer);
  chatStore.socket?.close();
  observer.disconnect();
});
</script>