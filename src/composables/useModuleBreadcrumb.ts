import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { storeToRefs } from 'pinia';

export interface RawModule {
  id: number | string;
  code: string;
  description: string;
  icon?: string | null;
  url?: string | null;
  parent_id?: number | null;
  is_active?: boolean;
  is_default?: boolean;
  children?: RawModule[];
}

export interface BreadcrumbItem {
  label: string;
  url: string | null;
}

/**
 * For the current route, detect if we're on a child module and build breadcrumb:
 * Default Module > Parent Module > Current Module
 */
export function useModuleBreadcrumb() {
  const route = useRoute();
  const authStore = useAuthStore();
  const { modules } = storeToRefs(authStore);

  const result = computed(() => {
    const path = (route.path || '').replace(/\/$/, '');
    const list = (modules.value || []) as RawModule[];
    if (!list.length) return { isChildModule: false, breadcrumbText: '', breadcrumbItems: [] };

    let currentModule: RawModule | null = null;
    let parentModule: RawModule | null = null;

    // Check parent modules (top-level)
    for (const m of list) {
      if (m.url && m.url.replace(/\/$/, '') === path) {
        currentModule = m;
        break;
      }
      // Check children
      const children = m.children || [];
      for (const c of children) {
        if (c.url && c.url.replace(/\/$/, '') === path) {
          currentModule = c;
          parentModule = m;
          break;
        }
      }
      if (currentModule) break;
    }

    const isChildModule = !!(currentModule?.parent_id != null || parentModule);

    if (!isChildModule || !currentModule) {
      return { isChildModule: false, breadcrumbText: '', breadcrumbItems: [] };
    }

    const defaultModule = list.find((m) => m.is_default === true && m.is_active !== false) || list[0] || null;
    const items: BreadcrumbItem[] = [];

    if (defaultModule?.description) {
      items.push({ label: defaultModule.description, url: defaultModule.url || null });
    }
    if (parentModule?.description) {
      items.push({ label: parentModule.description, url: parentModule.url || null });
    }
    if (currentModule?.description) {
      items.push({ label: currentModule.description, url: null }); // current page, not clickable
    }

    const breadcrumbText = items.map((i) => i.label).join(' > ');

    return {
      isChildModule: true,
      breadcrumbText,
      breadcrumbItems: items
    };
  });

  return {
    isChildModule: computed(() => result.value.isChildModule),
    breadcrumbText: computed(() => result.value.breadcrumbText),
    breadcrumbItems: computed(() => result.value.breadcrumbItems)
  };
}
