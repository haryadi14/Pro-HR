<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-900">
    <nav v-if="authStore.isAuthenticated" class="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-8">
            <div class="flex-shrink-0 flex items-center">
              <span class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ProHR</span>
            </div>
            <div class="hidden sm:flex sm:space-x-4">
              <router-link to="/" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-100 transition-colors" active-class="bg-slate-100 text-blue-600">Dashboard</router-link>
              <router-link to="/attendance" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-100 transition-colors" active-class="bg-slate-100 text-blue-600">Attendance</router-link>
              <router-link to="/reports" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-100 transition-colors" active-class="bg-slate-100 text-blue-600">Reports</router-link>
              <router-link v-if="authStore.isAdmin" to="/admin" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-100 transition-colors" active-class="bg-slate-100 text-blue-600">Admin</router-link>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-slate-500 hidden md:block">Welcome, {{ authStore.user?.name }}</span>
            <button @click="logout" class="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors">Logout</button>
          </div>
        </div>
      </div>
    </nav>
    
    <main :class="authStore.isAuthenticated ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8' : ''">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from './store/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: 'Inter', sans-serif;
}
</style>
