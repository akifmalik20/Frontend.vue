<template>
  <div class="chatbot-container">
    <!-- Chat Icon Button - Fixed position -->
    <transition name="bounce">
      <button
          v-if="!chatStore.isChatOpen"
          @click="chatStore.openChat"
          class="chat-icon-button"
          aria-label="Open AI Assistant"
      >
        <!-- Animated pulsing rings -->
        <div class="pulse-ring pulse-ring-1"></div>
        <div class="pulse-ring pulse-ring-2"></div>
        <div class="pulse-ring pulse-ring-3"></div>

        <!-- Rotating gradient border -->
        <div class="rotating-border"></div>

        <!-- Main chat icon with gradient -->
        <div class="chat-icon-main">
          <!-- Using your chatbot image -->
          <img
              src="@/assets/images/chatbot.png"
              alt="AI Chatbot"
              class="chatbot-image"
              @error="handleImageError"
          />

          <!-- Shine effect -->
          <div class="shine-effect"></div>
        </div>

        <!-- Floating badge only for unread messages -->
        <div v-if="hasUnreadMessages" class="notification-badge">
          <span class="badge-dot"></span>
        </div>

        <!-- Tooltip with smooth fade -->
        <div class="chat-tooltip">
          <span>💬 {{transStore.t('assistant.chat.with.ai')}}</span>
          <span v-if="hasUnreadMessages" class="tooltip-notice">({{transStore.t('assistant.new.message')}})</span>
        </div>
      </button>
    </transition>

    <!-- Chat Window -->
    <transition name="slide-fade">
      <div
          v-if="chatStore.isChatOpen"
          class="chat-window"
      >
        <!-- Header -->
        <div class="chat-header">
          <div class="flex items-center gap-4">
            <!-- AI Avatar -->
            <div class="chat-avatar">
              <img
                  src="@/assets/images/chatbot.png"
                  alt="AI Assistant"
                  class="w-full h-full object-cover"
                  @error="handleImageError"
              />
              <div class="avatar-status-dot"></div>
            </div>
            <div class="chat-title-section">
              <h3 class="chat-title">{{transStore.t('assistant.ai')}}</h3>
              <p class="chat-subtitle">
                <span class="status-indicator"></span>
                 {{transStore.t('assistant.ready.assist')}}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">


            <!-- Close button -->
            <button
                @click="chatStore.closeChat"
                class="header-button"
                aria-label="Close chat"
            >
              <font-awesome-icon icon="fa-solid fa-times" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Messages Container -->
        <div
            ref="chatContainer"
            class="chat-messages"
        >
          <TransitionGroup name="message-slide">
            <div
                v-for="(message, index) in chatStore.messages"
                :key="`msg-${index}`"
                class="message-wrapper"
            >
              <!-- User Message -->
              <div v-if="message.type === 'user'" class="user-message-container">
                <div class="user-message">
                  <div class="message-text">
                    {{ formatMessageText(message.text) }}
                  </div>
                  <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                </div>
                <div class="user-avatar">
                  <font-awesome-icon icon="fa-solid fa-user" class="w-3 h-3 text-white" />
                </div>
              </div>

              <!-- Bot Message -->
              <div v-else class="bot-message-container">
                <div class="bot-avatar">
                  <img
                      src="@/assets/images/chatbot.png"
                      alt="AI"
                      class="w-full h-full object-cover"
                      @error="handleImageError"
                  />
                </div>
                <div
                    class="bot-message"
                    :class="{ 'error-message': message.isError }"
                >
                  <div
                      class="message-text"
                      v-html="renderMarkdown(formatMessageText(message.text))"
                  ></div>
                  <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                </div>
              </div>
            </div>
          </TransitionGroup>

          <!-- Loading Indicator -->
          <div v-if="chatStore.isLoading" class="bot-message-container loading-message">
            <div class="bot-avatar">
              <img
                  src="@/assets/images/chatbot.png"
                  alt="AI"
                  class="w-full h-full object-cover loading-pulse"
                  @error="handleImageError"
              />
            </div>
            <div class="bot-message">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area with Voice -->
        <div class="chat-input-section">
          <form @submit.prevent="handleSubmit" class="w-full">
            <div
                class="input-container"
                :class="{
                'input-focused': isTextareaFocused,
                'input-disabled': chatStore.isLoading,
                'recording-active': isRecording
              }"
            >
              <!-- Voice Recording Indicator -->
              <div v-if="isRecording" class="recording-indicator">
                <div class="recording-dot"></div>
                <span class="recording-text">{{transStore.t('assistant.listening')}}</span>
                <span class="recording-timer">{{ formatRecordingTime }}</span>
              </div>

              <!-- Voice Action Buttons -->
              <div v-if="isRecording" class="voice-actions">
                <button
                    type="button"
                    @click="stopRecording"
                    class="voice-button voice-stop"
                    title="Stop recording"
                >
                  <font-awesome-icon icon="fa-solid fa-stop" class="w-4 h-4" />
                </button>
                <button
                    type="button"
                    @click="cancelRecording"
                    class="voice-button voice-cancel"
                    title="Cancel"
                >
                  <font-awesome-icon icon="fa-solid fa-times" class="w-4 h-4" />
                </button>
              </div>

              <div class="input-content">
                <textarea
                    v-model="inputMessage"
                    :disabled="chatStore.isLoading || isRecording"
                    class="message-textarea"
                    :rows="1"
                    :placeholder="isRecording ? transStore.t('assistant.speaking'): transStore.t('assistant.type.message') "
                    @keydown.enter.prevent="(e) => !e.shiftKey && !chatStore.isLoading && !isRecording && handleSubmit()"
                    @focus="isTextareaFocused = true"
                    @blur="isTextareaFocused = false"
                    @input="autoResize"
                    ref="messageInput"
                ></textarea>

                <div class="action-buttons">
                  <!-- Voice Button -->
                  <button
                      v-if="!isRecording"
                      type="button"
                      @click="startRecording"
                      :disabled="chatStore.isLoading"
                      class="voice-button"
                      :class="{ 'voice-button-active': !chatStore.isLoading }"
                      title="Voice input"
                  >
                    <font-awesome-icon icon="fa-solid fa-microphone" class="w-4 h-4" />
                  </button>

                  <!-- Send Button -->
                  <button
                      v-if="!isRecording"
                      type="submit"
                      :disabled="chatStore.isLoading || !inputMessage.trim()"
                      class="send-button"
                      :class="{ 'send-button-active': inputMessage.trim() }"
                  >
                    <font-awesome-icon
                        icon="fa-solid fa-paper-plane"
                        class="w-4 h-4 send-icon"
                        :class="{ 'animate-pulse': chatStore.isLoading }"
                    />
                  </button>
                </div>
              </div>
            </div>

            <!-- Voice Status Messages -->
            <div v-if="voiceStatus" class="voice-status" :class="voiceStatusClass">
              <font-awesome-icon
                  v-if="voiceStatusClass.includes('listening')"
                  icon="fa-solid fa-ear-listen"
                  class="w-3 h-3 mr-1"
              />
              <font-awesome-icon
                  v-else-if="voiceStatusClass.includes('processing')"
                  icon="fa-solid fa-spinner"
                  spin
                  class="w-3 h-3 mr-1"
              />
              <font-awesome-icon
                  v-else-if="voiceStatusClass.includes('error')"
                  icon="fa-solid fa-circle-exclamation"
                  class="w-3 h-3 mr-1"
              />
              {{ voiceStatus }}
            </div>

            <!-- Helper text -->
            <div class="input-helper">
              <span class="text-[10px]">
                <font-awesome-icon icon="fa-solid fa-keyboard" class="w-2 h-2 mr-1" />
                {{transStore.t('assistant.enter.send')}}
                <font-awesome-icon icon="fa-solid fa-microphone" class="w-2 h-2 mx-1" />
                {{transStore.t('assistant.for.voice')}}
              </span>
              <span v-if="inputMessage.length > 0 && !isRecording" class="text-[10px] font-medium">
                {{ inputMessage.length }}
              </span>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, watch, computed, onUnmounted } from 'vue';
import { useChatStore } from '@/stores/chatbotStore';
import { useAuthStore } from '@/stores/authStore';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import MarkdownIt from 'markdown-it';
import {useTranslationStore} from "@/stores/translationStore.js";

const chatStore = useChatStore();
const authStore = useAuthStore();
const transStore = useTranslationStore();
const inputMessage = ref('');
const isTextareaFocused = ref(false);
const chatContainer = ref(null);
const messageInput = ref(null);
const imageError = ref(false);

// Voice recognition variables
const isRecording = ref(false);
const recognition = ref(null);
const recordingStartTime = ref(0);
const recordingTime = ref(0);
const recordingTimer = ref(null);
const voiceStatus = ref('');
const isSupported = ref(typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window));

// Compute if there are unread bot messages
const hasUnreadMessages = computed(() => {
  const messages = chatStore.messages;
  if (messages.length === 0) return false;

  const lastMessage = messages[messages.length - 1];
  const isChatOpen = chatStore.isChatOpen;

  return lastMessage.type === 'bot' && !isChatOpen;
});

// Format recording time
const formatRecordingTime = computed(() => {
  const minutes = Math.floor(recordingTime.value / 60);
  const seconds = Math.floor(recordingTime.value % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

// Voice status class for styling
const voiceStatusClass = computed(() => {
  if (!voiceStatus.value) return '';
  if (voiceStatus.value.includes('Error') || voiceStatus.value.includes('No speech') || voiceStatus.value.includes('denied')) {
    return 'voice-status-error';
  }
  if (voiceStatus.value.includes('Listening') || voiceStatus.value.includes('Starting')) {
    return 'voice-status-listening';
  }
  if (voiceStatus.value.includes('Processing') || voiceStatus.value.includes('Message sent')) {
    return 'voice-status-processing';
  }
  return '';
});

// Initialize speech recognition
const initSpeechRecognition = () => {
  if (!isSupported.value) {
    voiceStatus.value = transStore.t('assistant.voice.browser.support');
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition.value = new SpeechRecognition();

  recognition.value.continuous = true;
  recognition.value.interimResults = true;
  recognition.value.lang = 'en-US';
  recognition.value.maxAlternatives = 1;

  recognition.value.onstart = () => {
    voiceStatus.value = transStore.t('assistant.listening');
    startRecordingTimer();
  };

  recognition.value.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    // Update textarea with interim results
    if (interimTranscript) {
      inputMessage.value = formatMessageText(interimTranscript);
      autoResize();
    }

    // If we have final results, update the text
    if (finalTranscript) {
      inputMessage.value = formatMessageText(finalTranscript);
      autoResize();
    }
  };

  recognition.value.onerror = (event) => {
    console.error('Speech recognition error:', event.error);

    switch(event.error) {
      case 'no-speech':
        voiceStatus.value =  transStore.t('assistant.no.speech');
        break;
      case 'audio-capture':
        voiceStatus.value =   transStore.t('assistant.no.microphone');
        break;
      case 'not-allowed':
        voiceStatus.value = transStore.t('assistant.no.microphone.access');
        break;
      default:
        voiceStatus.value = `Error: ${event.error}`;
    }

    stopRecording();
  };

  recognition.value.onend = () => {
    stopRecording();
    if (inputMessage.value.trim()) {
      voiceStatus.value =  transStore.t('assistant.processing.speech');
      // Auto-send after a short delay
      setTimeout(() => {
        handleSubmit();
        voiceStatus.value =  transStore.t('assistant.message.sent');
        setTimeout(() => voiceStatus.value = '', 2000);
      }, 500);
    } else {
      voiceStatus.value =  transStore.t('assistant.no.speech');
      setTimeout(() => voiceStatus.value = '', 3000);
    }
  };
};

// Format message text to handle long URLs and text
const formatMessageText = (text) => {
  if (!text) return '';

  // Handle URLs - break long URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, (url) => {
    // If URL is longer than 30 characters, break it
    if (url.length > 30) {
      // Insert zero-width space after /, //, :, ?, &, =, ., _, - to allow breaking
      const breakableUrl = url
          .replace(/\//g, '/\u200B')
          .replace(/:/g, ':\u200B')
          .replace(/\?/g, '?\u200B')
          .replace(/&/g, '&\u200B')
          .replace(/=/g, '=\u200B')
          .replace(/\./g, '.\u200B')
          .replace(/_/g, '_\u200B')
          .replace(/-/g, '-\u200B');
      return breakableUrl;
    }
    return url;
  });
};

// Format text for display with proper word breaking
const formatDisplayText = (text) => {
  if (!text) return '';

  // Add word break opportunities for long unbreakable strings
  const maxLength = 40; // Maximum characters before forcing a break

  return text.split(' ').map(word => {
    if (word.length > maxLength) {
      // Insert zero-width space every maxLength characters
      return word.match(new RegExp(`.{1,${maxLength}}`, 'g')).join('\u200B');
    }
    return word;
  }).join(' ');
};

// Start recording
const startRecording = async () => {
  if (!isSupported.value) {
    voiceStatus.value =   transStore.t('assistant.voice.browser.support');
    return;
  }

  if (isRecording.value) return;

  try {
    initSpeechRecognition();
    isRecording.value = true;
    inputMessage.value = '';
    voiceStatus.value =   transStore.t('assistant.starting.voice');

    // Request microphone permission
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately after getting permission
      stream.getTracks().forEach(track => track.stop());

      // Start recognition
      setTimeout(() => {
        recognition.value.start();
      }, 100);
    } catch (error) {
      console.error('Microphone access denied:', error);
      voiceStatus.value =   transStore.t('assistant.no.microphone.access');
      isRecording.value = false;
    }
  } catch (error) {
    console.error('Error starting voice recognition:', error);
    voiceStatus.value =   transStore.t('assistant.starting.error');
    isRecording.value = false;
  }
};

// Stop recording
const stopRecording = () => {
  if (recognition.value && isRecording.value) {
    try {
      recognition.value.stop();
    } catch (e) {
      console.log('Recognition already stopped');
    }
  }

  isRecording.value = false;
  stopRecordingTimer();
};

// Cancel recording
const cancelRecording = () => {
  stopRecording();
  inputMessage.value = '';
  voiceStatus.value =   transStore.t('assistant.record.cancel');
  setTimeout(() => voiceStatus.value = '', 2000);
};

// Start recording timer
const startRecordingTimer = () => {
  recordingStartTime.value = Date.now();
  recordingTime.value = 0;

  recordingTimer.value = setInterval(() => {
    recordingTime.value = Math.floor((Date.now() - recordingStartTime.value) / 1000);
  }, 1000);
};

// Stop recording timer
const stopRecordingTimer = () => {
  if (recordingTimer.value) {
    clearInterval(recordingTimer.value);
    recordingTimer.value = null;
  }
};

// Cleanup on unmount
onUnmounted(() => {
  stopRecording();
});

// Markdown renderer
const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: true
});

const renderMarkdown = (text) => {
  return md.render(text);
};

// Handle image error - fallback to icon
const handleImageError = (event) => {
  imageError.value = true;
  const svg = `<svg class="w-full h-full p-1 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>`;
  event.target.outerHTML = svg;
};

// Format timestamp
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Auto-resize textarea
const autoResize = () => {
  const textarea = messageInput.value;
  if (textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 80) + 'px';
  }
};

// Scroll to bottom with smooth animation
const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTo({
      top: chatContainer.value.scrollHeight,
      behavior: 'smooth'
    });
  }
};

// Handle submit
const handleSubmit = async () => {
  if (!inputMessage.value.trim() || chatStore.isLoading) return;

  const message = inputMessage.value.trim();
  inputMessage.value = '';

  if (messageInput.value) {
    messageInput.value.style.height = 'auto';
  }

  try {
    const userId = authStore.user?.id || authStore.user?.user_id;

    if (!userId) {
      console.error('User ID not found');
      return;
    }

    await chatStore.sendMessage(message, userId, authStore.user?.language);
    await scrollToBottom();
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

// Handle clear chat


// Watch for new messages
watch(() => chatStore.messages.length, () => {
  scrollToBottom();
});

// Initialize
onMounted(() => {
  chatStore.initializeChat();
});
</script>

<style scoped>
/* ==================== CONTAINER - PROPER POSITIONING ==================== */
.chatbot-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  pointer-events: none;
}

.chatbot-container > * {
  pointer-events: auto;
}

/* ==================== CHAT ICON - FIXED VISIBILITY ==================== */
.chat-icon-button {
  position: relative;
  width: 60px;
  height: 60px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: block;
  visibility: visible;
  opacity: 1;
}

.chat-icon-button:hover {
  transform: scale(1.15) rotate(5deg);
}

.chat-icon-button:active {
  transform: scale(0.9);
}

/* Multiple Pulsing Rings */
.pulse-ring {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border-radius: 50%;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  opacity: 0.4;
  z-index: 1;
}

.pulse-ring-1 {
  animation: mega-pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.pulse-ring-2 {
  animation: mega-pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  animation-delay: 0.8s;
}

.pulse-ring-3 {
  animation: mega-pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  animation-delay: 1.6s;
}

@keyframes mega-pulse {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.6);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

/* Rotating Gradient Border */
.rotating-border {
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border-radius: 50%;
  background: linear-gradient(45deg, #14b8a6, #0d9488, #14b8a6, #0d9488);
  background-size: 300% 300%;
  animation: gradient-rotate 3s linear infinite;
  opacity: 0.6;
  z-index: 2;
}

@keyframes gradient-rotate {
  0% {
    background-position: 0% 50%;
    transform: rotate(0deg);
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
    transform: rotate(360deg);
  }
}

/* Main Icon Container */
.chat-icon-main {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
      0 8px 25px -5px rgba(20, 184, 166, 0.6),
      0 15px 40px -8px rgba(20, 184, 166, 0.4),
      0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  overflow: hidden;
  animation: float-icon 3s ease-in-out infinite;
  z-index: 3;
}

@keyframes float-icon {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-6px);
  }
}

.chatbot-image {
  width: 40px;
  height: 40px;
  object-fit: contain;
  position: relative;
  z-index: 4;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

/* Shine Effect */
.shine-effect {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 70%
  );
  animation: shine 3s infinite;
  pointer-events: none;
  z-index: 4;
}

@keyframes shine {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}

/* Notification Badge */
.notification-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  border-radius: 50%;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(20, 184, 166, 0.5);
  animation: badge-bounce 2s ease-in-out infinite;
  z-index: 5;
}

@keyframes badge-bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.badge-dot {
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
  animation: dot-pulse 1.5s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

/* Enhanced Tooltip */
.chat-tooltip {
  position: absolute;
  bottom: calc(100% + 16px);
  right: 0;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  color: white;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  transform: translateY(10px) scale(0.9);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: none;
  box-shadow:
      0 10px 30px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  z-index: 6;
}

.tooltip-notice {
  font-size: 11px;
  opacity: 0.9;
  color: #14b8a6;
  font-weight: normal;
}

.chat-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  right: 24px;
  border: 8px solid transparent;
  border-top-color: #1f2937;
}

.chat-icon-button:hover .chat-tooltip {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* ==================== VOICE RECORDING STYLES ==================== */
.recording-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 10px;
  margin-bottom: 8px;
  animation: pulse-gold 2s infinite;
  width: 100%;
}

@keyframes pulse-gold {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(245, 158, 11, 0);
  }
}

.recording-dot {
  width: 10px;
  height: 10px;
  background: #dc2626;
  border-radius: 50%;
  animation: blink-red 1s infinite;
}

@keyframes blink-red {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

.recording-text {
  font-size: 12px;
  font-weight: 600;
  color: #92400e;
  flex: 1;
}

.recording-timer {
  font-size: 12px;
  font-weight: 700;
  color: #92400e;
  font-family: monospace;
}

.voice-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  width: 100%;
  justify-content: center;
}

.voice-button {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #e5e7eb;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
}

.voice-button:hover:not(:disabled) {
  background: #d1d5db;
  transform: scale(1.05);
}

.voice-button-active {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  cursor: pointer;
}

.voice-button-active:hover {
  background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.voice-stop {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.voice-stop:hover {
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
  transform: scale(1.1);
}

.voice-cancel {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
  color: white;
}

.voice-cancel:hover {
  background: linear-gradient(135deg, #9ca3af 0%, #4b5563 100%);
  transform: scale(1.1);
}

/* Input container when recording */
.recording-active {
  border-color: #fbbf24;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 20%, #f9fafb 100%);
}

.recording-active .message-textarea {
  background: transparent;
}

.input-content {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  width: 100%;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* Voice Status Messages */
.voice-status {
  margin-top: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
  text-align: left;
  animation: fade-in 0.3s ease-out;
  display: flex;
  align-items: center;
}

.voice-status-listening {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border: 1px solid #93c5fd;
}

.voice-status-processing {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  color: #166534;
  border: 1px solid #86efac;
}

.voice-status-error {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border: 1px solid #fca5a5;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ==================== CHAT WINDOW ==================== */
.chat-window {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 420px;
  max-height: 600px;
  background: white;
  border-radius: 20px;
  box-shadow:
      0 25px 70px -15px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform-origin: bottom right;
  z-index: 9999;
}

/* Header */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
  position: relative;
  overflow: hidden;
  min-height: 80px;
}

.chat-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: header-shimmer 4s linear infinite;
}

@keyframes header-shimmer {
  0% {
    transform: translate(-50%, -50%);
  }
  100% {
    transform: translate(50%, 50%);
  }
}

.chat-avatar {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.avatar-status-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #22c55e;
  border: 2px solid white;
  border-radius: 50%;
  animation: status-pulse 2s ease-in-out infinite;
}

@keyframes status-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(34, 197, 94, 0);
  }
}

.chat-title-section {
  flex: 1;
  position: relative;
  z-index: 1;
}

.chat-title {
  font-weight: 700;
  font-size: 18px;
  line-height: 1.2;
  margin: 0 0 4px 0;
}

.chat-subtitle {
  font-size: 13px;
  opacity: 0.95;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-indicator {
  width: 6px;
  height: 6px;
  background: #22c55e;
  border-radius: 50%;
  display: inline-block;
  animation: blink 2s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

.header-button {
  padding: 10px;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  color: white;
  background: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  z-index: 1;
}

.header-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1) rotate(5deg);
}

.header-button:active {
  transform: scale(0.9);
}

/* Messages Area */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%);
  max-height: 400px;
  min-height: 400px;
}

/* Custom Scrollbar */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  border-radius: 10px;
}

/* Message Wrapper */
.message-wrapper {
  margin-bottom: 16px;
  animation: message-appear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes message-appear {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* User Message */
.user-message-container {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  animation: slide-in-right 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.user-message {
  max-width: 75%;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
  padding: 12px 16px;
  border-radius: 20px 20px 4px 20px;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
  position: relative;
  animation: message-pop 0.3s ease-out;
}

@keyframes message-pop {
  0% {
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.4);
}

/* Bot Message */
.bot-message-container {
  display: flex;
  gap: 10px;
  animation: slide-in-left 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.bot-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(20, 184, 166, 0.4);
  border: 2px solid white;
}

.bot-message {
  max-width: 75%;
  background: white;
  color: #1f2937;
  padding: 12px 16px;
  border-radius: 20px 20px 20px 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: message-pop 0.3s ease-out;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.message-text {
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  hyphens: auto;
}

/* Force long unbreakable strings to wrap */
.message-text {
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
}

.message-time {
  font-size: 10px;
  opacity: 0.6;
  display: block;
  margin-top: 6px;
  text-align: right;
}

/* Typing Indicator */
.typing-indicator {
  display: flex;
  gap: 5px;
  padding: 4px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  animation: typing-bounce 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing-bounce {
  0%, 60%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-12px) scale(1.2);
    opacity: 1;
  }
}

.loading-pulse {
  animation: pulse-avatar 1.5s ease-in-out infinite;
}

@keyframes pulse-avatar {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(0.95);
  }
}

/* Input Section */
.chat-input-section {
  padding: 16px 20px;
  background: white;
  border-top: 1px solid #e5e7eb;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-radius: 16px;
  border: 2px solid #e5e7eb;
  background: #f9fafb;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-focused {
  border-color: #14b8a6;
  background: white;
  box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.1);
  transform: translateY(-2px);
}

.input-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message-textarea {
  flex: 1;
  resize: none;
  border: none;
  background: transparent;
  font-size: 14px;
  line-height: 1.5;
  max-height: 80px;
  min-height: 40px;
  outline: none;
  font-family: inherit;
  width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
}

.message-textarea::placeholder {
  color: #9ca3af;
}

/* Send Button */
.send-button {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.send-button-active {
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.4);
}

.send-button-active:hover {
  transform: scale(1.1) rotate(15deg);
  box-shadow: 0 6px 20px rgba(20, 184, 166, 0.5);
}

.send-button-active:hover .send-icon {
  animation: send-wiggle 0.5s ease-in-out;
}

@keyframes send-wiggle {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-10deg);
  }
  75% {
    transform: rotate(10deg);
  }
}

.send-button-active:active {
  transform: scale(0.9);
}

.input-helper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  color: #9ca3af;
  padding: 0 4px;
  font-size: 10px;
}

/* ==================== TRANSITIONS ==================== */
.bounce-enter-active {
  animation: bounce-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.bounce-leave-active {
  animation: bounce-out 0.4s ease-in;
}

@keyframes bounce-in {
  0% {
    transform: scale(0) rotate(-360deg);
    opacity: 0;
  }
  60% {
    transform: scale(1.2) rotate(20deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

@keyframes bounce-out {
  0% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: scale(0) rotate(360deg);
    opacity: 0;
  }
}

.slide-fade-enter-active {
  animation: slide-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-fade-leave-active {
  animation: slide-down 0.3s ease-in;
}

@keyframes slide-up {
  0% {
    transform: translateY(40px) scale(0.8);
    opacity: 0;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes slide-down {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(40px) scale(0.8);
    opacity: 0;
  }
}

/* ==================== MARKDOWN STYLING ==================== */
:deep(.message-text p) {
  margin: 0 0 8px 0;
  word-break: break-word;
  overflow-wrap: break-word;
}

:deep(.message-text p:last-child) {
  margin-bottom: 0;
}

:deep(.message-text ul),
:deep(.message-text ol) {
  margin: 8px 0;
  padding-left: 20px;
  word-break: break-word;
}

:deep(.message-text li) {
  margin-bottom: 4px;
  word-break: break-word;
}

:deep(.message-text code) {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
  font-family: 'Courier New', monospace;
  word-break: break-all;
  white-space: pre-wrap;
}

:deep(.message-text pre) {
  background: #1f2937;
  color: #e5e7eb;
  padding: 10px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 8px 0;
  font-size: 13px;
}

:deep(.message-text pre code) {
  background: transparent;
  color: inherit;
  padding: 0;
  font-size: inherit;
  white-space: pre;
}

:deep(.message-text a) {
  color: #0d9488;
  text-decoration: underline;
  word-break: break-all;
  overflow-wrap: break-word;
  hyphens: auto;
}

/* Force long URLs to wrap */
:deep(.message-text a) {
  display: inline-block;
  max-width: 100%;
  word-break: break-all;
  overflow-wrap: break-word;
}

/* ==================== RESPONSIVE ==================== */
@media (max-width: 640px) {
  .chatbot-container {
    bottom: 16px;
    right: 16px;
  }

  .chat-window {
    width: calc(100vw - 32px);
    max-width: 400px;
    right: 0;
    bottom: 0;
  }

  .chat-icon-button {
    width: 56px;
    height: 56px;
  }

  .chat-icon-main {
    width: 56px;
    height: 56px;
  }

  .chatbot-image {
    width: 36px;
    height: 36px;
  }

  .voice-actions {
    flex-direction: row;
  }

  .user-message,
  .bot-message {
    max-width: 85%;
  }

  .message-text {
    font-size: 13px;
    line-height: 1.4;
  }
}

@media (max-height: 700px) {
  .chat-window {
    max-height: calc(100vh - 100px);
  }

  .chat-messages {
    max-height: calc(100vh - 300px);
    min-height: 300px;
  }
}
</style>