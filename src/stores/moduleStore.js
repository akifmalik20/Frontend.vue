import { defineStore } from 'pinia';
import { axiosInstance } from '@/utils/axiosInstance.js';

export const useModuleStore = defineStore('moduleStore', {
    state: () => ({

        allModules: [],


        assignedModules: {},


        currentAssigned: [],

        loading: false,
        assigning: false,
        error: null,
    }),

    actions: {
        getAuthHeader() {
            return {
                Authorization: 'Bearer ' + localStorage.getItem('access_token'),
            };
        },

        // ==================== FETCH ALL MODULES ====================

        async fetchAllModules() {
            try {
                this.loading = true;
                const res = await axiosInstance.get('/api/modules/list', {
                    headers: this.getAuthHeader(),
                });
                this.allModules = res.data || [];
                return this.allModules;
            } catch (err) {
                console.error('Fetch modules error:', err);
                this.error = err?.response?.data?.message || 'Failed to fetch modules';
                throw err;
            } finally {
                this.loading = false;
            }
        },

        // ==================== FETCH ASSIGNED MODULES ====================

        async fetchAssignedModules(targetId = null | Number) {
            try {
                this.loading = true;
                const params = targetId ? { target_id: targetId } : {};
                const res = await axiosInstance.get('/api/modules/assigned/', {
                    params,
                    headers: this.getAuthHeader(),
                });
                const data = res.data?.data || [];

                if (targetId) {
                    this.assignedModules[targetId] = data;
                }
                this.currentAssigned = data;
                return data;
            } catch (err) {
                console.error('Fetch assigned modules error:', err);
                this.error = err?.response?.data?.message || 'Failed to fetch assigned modules';
                throw err;
            } finally {
                this.loading = false;
            }
        },


        async assignModules(targetId, modulesWithHierarchy, options = {}) {
            try {
                this.assigning = true;
                const payload = {
                    target_id:  targetId,
                    modules:    modulesWithHierarchy,   // [{ module_id, parent_id }]
                    is_active:  options.is_active  ?? true,
                    is_default: options.is_default ?? false,
                };
                const res = await axiosInstance.post('/api/modules/assign/', payload, {
                    headers: this.getAuthHeader(),
                });
                await this.fetchAssignedModules(targetId);
                return res.data;
            } catch (err) {
                console.error('Assign modules error:', err);
                this.error = err?.response?.data?.message || 'Failed to assign modules';
                throw err;
            } finally {
                this.assigning = false;
            }
        },

        // ==================== UNASSIGN MODULE ====================

        async unassignModule(targetId, moduleId) {
            try {
                this.assigning = true;
                const res = await axiosInstance.delete('/api/modules/unassign/', {
                    headers: this.getAuthHeader(),
                    data: { target_id: targetId, module_id: moduleId },
                });
                await this.fetchAssignedModules(targetId);
                return res.data;
            } catch (err) {
                console.error('Unassign module error:', err);
                this.error = err?.response?.data?.message || 'Failed to unassign module';
                throw err;
            } finally {
                this.assigning = false;
            }
        },

        // ==================== UPDATE ASSIGNMENT ====================
        // Supports updating parent_id to re-parent a module in the user's tree.
        // fields can include: is_active, is_default, sequence, parent_id

        async updateAssignment(targetId, moduleId, fields = {}) {
            try {
                this.assigning = true;
                const payload = {
                    target_id: targetId,
                    module_id: moduleId,
                    ...fields,
                };
                const res = await axiosInstance.patch('/api/modules/assign/update/', payload, {
                    headers: this.getAuthHeader(),
                });
                await this.fetchAssignedModules(targetId);
                return res.data;
            } catch (err) {
                console.error('Update assignment error:', err);
                this.error = err?.response?.data?.message || 'Failed to update assignment';
                throw err;
            } finally {
                this.assigning = false;
            }
        },

        // ==================== BULK UPDATE HIERARCHY ====================
        // Saves the entire tree structure (parent_id for every module) in one call.
        // Payload: { target_id, hierarchy: [{ module_id, parent_id, sequence }] }

        async updateHierarchy(targetId, hierarchy) {
            try {
                this.assigning = true;
                const res = await axiosInstance.patch('/api/modules/assign/hierarchy/', {
                    target_id: targetId,
                    hierarchy,
                }, {
                    headers: this.getAuthHeader(),
                });
                await this.fetchAssignedModules(targetId);
                return res.data;
            } catch (err) {
                console.error('Update hierarchy error:', err);
                this.error = err?.response?.data?.message || 'Failed to update hierarchy';
                throw err;
            } finally {
                this.assigning = false;
            }
        },

        // ==================== HELPERS ====================

        getAssignedForTarget(targetId) {
            return this.assignedModules[targetId] || [];
        },

        getAssignedModuleIds(targetId) {
            return (this.assignedModules[targetId] || []).map(m => m.module_id);
        },

        clearCurrentAssigned() {
            this.currentAssigned = [];
            this.error = null;
        },
    },
});