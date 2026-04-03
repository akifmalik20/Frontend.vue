// src/stores/translationStore.js
import { defineStore } from 'pinia';
import { localizationService } from '../services/translation.js';

export const useTranslationStore = defineStore('translations', {
    state: () => ({
        texts: {},
        currentLang: (localStorage.getItem('user_language') || 'en').replace(/"/g, ''),
        loadedModules: new Set(),
    }),
    actions: {

        async loadTranslations(moduleId = null) {
            // Removed the "if (!moduleId) return" to allow null/global fetches
            console.log("INITIAL LANGUAGE",localStorage.getItem('user_language'));
            const data = await localizationService.getModuleTranslations(
                (localStorage.getItem('user_language') || 'en').replace(/"/g, ''),
                moduleId
            );

            this.texts = { ...this.texts, ...data }; // Merge with existing texts
            this.loadedModules.add(moduleId || 'global');
        },
        async setLanguage(newLang) {
            this.currentLang = newLang;

            this.texts = {};
            const activeModules = Array.from(this.loadedModules);
            console.log(activeModules)
            this.loadedModules.clear();
            await this.loadTranslations();
            const lastId = activeModules.at(-1);

            console.log(lastId);

            await this.loadTranslations(lastId);


        }
    },
    getters: {
        t: (state) => (key) => state.texts[key] || key
    }
});