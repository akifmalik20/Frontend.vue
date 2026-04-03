<template>
  <div class="h-screen flex flex-col font-sans overflow-hidden bg-gray-50">
    <NavBar class="shrink-0" />

    <div class="flex flex-1 overflow-hidden">
      <SideBar /> <main class="flex-1 overflow-y-auto p-8 pt-20">
      <div class="max-w-7xl mx-auto">
        <router-view />
      </div>
    </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import SideBar from '@/components/sideBar.vue';
import NavBar from "@/components/NavBar.vue";
</script>