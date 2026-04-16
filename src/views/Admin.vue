<template>
  <div class="space-y-8">
    <header>
      <h1 class="text-3xl font-bold text-slate-900">Admin Panel</h1>
      <p class="text-slate-500">Manage company data and employee activity.</p>
    </header>

    <div v-if="loading" class="text-center py-12">
      <p class="text-slate-500">Loading data...</p>
    </div>

    <div v-else class="space-y-8">
      <!-- Users Table -->
      <section class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 class="font-bold text-slate-900">Employees</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th class="px-6 py-3">Name</th>
                <th class="px-6 py-3">Email</th>
                <th class="px-6 py-3">Role</th>
                <th class="px-6 py-3 text-right">ID</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="user in allData.users" :key="user.id" class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4 text-sm font-medium text-slate-900">{{ user.name }}</td>
                <td class="px-6 py-4 text-sm text-slate-500">{{ user.email }}</td>
                <td class="px-6 py-4">
                  <span :class="user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'" class="px-2 py-1 rounded text-xs font-bold uppercase">
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-6 py-4 text-xs text-slate-400 text-right font-mono">{{ user.id }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- All Attendance -->
        <section class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h2 class="font-bold text-slate-900">All Attendance Logs</h2>
          </div>
          <div class="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
            <div v-for="item in allData.attendance.slice().reverse()" :key="item.id" class="px-6 py-4 flex items-center justify-between">
              <div>
                <p class="text-sm font-bold text-slate-900">{{ getUserName(item.userId) }}</p>
                <p class="text-xs text-slate-500">{{ formatDate(item.timestamp) }} at {{ formatTime(item.timestamp) }}</p>
              </div>
              <div :class="item.type === 'in' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'" class="px-2 py-1 rounded text-xs font-bold uppercase">
                {{ item.type }}
              </div>
            </div>
          </div>
        </section>

        <!-- All Reports -->
        <section class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h2 class="font-bold text-slate-900">All Daily Reports</h2>
          </div>
          <div class="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
            <div v-for="report in allData.reports.slice().reverse()" :key="report.id" class="px-6 py-4">
              <div class="flex justify-between items-start mb-1">
                <p class="text-sm font-bold text-slate-900">{{ getUserName(report.userId) }}</p>
                <span class="text-xs text-slate-400">{{ formatDate(report.date) }}</span>
              </div>
              <p class="text-sm text-slate-600 line-clamp-3">{{ report.content }}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../store/auth';

const authStore = useAuthStore();
const loading = ref(true);
const allData = ref<any>({ users: [], attendance: [], reports: [] });

const fetchAllData = async () => {
  try {
    const res = await fetch('/api/admin/all-data', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (res.ok) {
      allData.value = await res.json();
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const getUserName = (userId: string) => {
  const user = allData.value.users.find((u: any) => u.id === userId);
  return user ? user.name : 'Unknown User';
};

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();
const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

onMounted(fetchAllData);
</script>
