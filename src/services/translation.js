// // src/services/localizationService.js
// import { axiosInstance } from "@/utils/axiosInstance.js";
//
// const STORAGE_PREFIX = 'lang_';
//
// // src/services/localizationService.js
// export const localizationService = {
//     async getMissingTranslations(langCode, requestedKeys) {
//         const storageKey = `${STORAGE_PREFIX}${langCode}`;
//         const cached = JSON.parse(localStorage.getItem(storageKey) || '{}');
//
//         const missingKeys = requestedKeys
//             .map(k => k.trim())
//             .filter(key => !cached[key]);
//
//         // If nothing is missing, return the cache so Pinia can use it
//         if (missingKeys.length === 0) {
//             return cached;
//         }
//
//         try {
//             console.log("lang to backend",langCode)
//             const response = await axiosInstance.post('/api/users/localizations/bulk-fetch/', {
//                 language_code: langCode,
//                 codes: missingKeys
//             });
//
//             if (response.data.success) {
//                 const updatedCache = { ...cached, ...response.data.localizations };
//                 localStorage.setItem(storageKey, JSON.stringify(updatedCache));
//                 return updatedCache;
//             }
//         } catch (error) {
//             console.error("Localization Fetch Failed:", error);
//         }
//
//         return cached;
//     }
// }
// ;


import { axiosInstance } from "@/utils/axiosInstance.js";

const STORAGE_PREFIX = 'lang_';

// src/services/localizationService.js
export const localizationService = {
    async getModuleTranslations(langCode, moduleId = null) {
        const storageKey = `${STORAGE_PREFIX}${langCode}`;
        const cached = JSON.parse(localStorage.getItem(storageKey) || '{}');

        // If moduleId is null, we'll use 'global' as the cache flag
        const moduleFlag = `__module_${moduleId || 'global'}_loaded`;

        if (cached[moduleFlag]) {
            return cached;
        }

        try {
            console.log(moduleId)
            const response = await axiosInstance.post('/api/users/localizations/bulk-fetch/', {
                language_code: langCode,
                module_id: moduleId // This will now send null to the backend
            });

            if (response.data.success) {
                const updatedCache = {
                    ...cached,
                    ...response.data.localizations,
                    [moduleFlag]: true
                };
                localStorage.setItem(storageKey, JSON.stringify(updatedCache));
                return updatedCache;
            }
        } catch (error) {
            console.error("Fetch Failed for module:", moduleId || 'global', error);
        }

        return cached;
    }
};