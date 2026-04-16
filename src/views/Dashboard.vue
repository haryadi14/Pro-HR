<template>
  <div class="space-y-8">
    <header>
      <h1 class="text-3xl font-bold text-slate-900">Dashboard</h1>
      <p class="text-slate-500">Overview of your activity and company status.</p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-blue-50 rounded-xl">
            <Clock class="w-6 h-6 text-blue-600" />
          </div>
          <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">Status</span>
        </div>
        <h3 class="text-lg font-semibold text-slate-900">Attendance Status</h3>
        <p class="text-2xl font-bold text-blue-600 mt-1">{{ lastStatus || 'Not Checked In' }}</p>
      </div>

      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-green-50 rounded-xl">
            <FileText class="w-6 h-6 text-green-600" />
          </div>
          <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">Reports</span>
        </div>
        <h3 class="text-lg font-semibold text-slate-900">Total Reports</h3>
        <p class="text-2xl font-bold text-green-600 mt-1">{{ reports.length }}</p>
      </div>

      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-purple-50 rounded-xl">
            <Calendar class="w-6 h-6 text-purple-600" />
          </div>
          <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">Date</span>
        </div>
        <h3 class="text-lg font-semibold text-slate-900">Today</h3>
        <p class="text-2xl font-bold text-purple-600 mt-1">{{ today }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <section class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 class="font-bold text-slate-900">Recent Attendance</h2>
          <router-link to="/attendance" class="text-sm text-blue-600 hover:underline">View All</router-link>
        </div>
        <div class="divide-y divide-slate-50">
          <div v-for="item in attendance.slice(-5).reverse()" :key="item.id" class="px-6 py-4 flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div :class="item.type === 'in' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'" class="px-2 py-1 rounded text-xs font-bold uppercase">
                {{ item.type }}
              </div>
              <div>
                <p class="text-sm font-medium text-slate-900">{{ formatDate(item.timestamp) }}</p>
                <p class="text-xs text-slate-500">{{ item.location }}</p>
              </div>
            </div>
            <span class="text-xs text-slate-400">{{ formatTime(item.timestamp) }}</span>
          </div>
          <div v-if="attendance.length === 0" class="px-6 py-8 text-center text-slate-400 italic">
            No attendance records found.
          </div>
        </div>
      </section>

      <section class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 class="font-bold text-slate-900">Recent Reports</h2>
          <router-link to="/reports" class="text-sm text-blue-600 hover:underline">View All</router-link>
        </div>
        <div class="divide-y divide-slate-50">
          <div v-for="report in reports.slice(-5).reverse()" :key="report.id" class="px-6 py-4">
            <p class="text-sm text-slate-900 line-clamp-2">{{ report.content }}</p>
            <p class="text-xs text-slate-400 mt-1">{{ formatDate(report.date) }}</p>
          </div>
          <div v-if="reports.length === 0" class="px-6 py-8 text-center text-slate-400 italic">
            No reports submitted yet.
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Clock, FileText, Calendar } from 'lucide-vue-next';
import { useAuthStore } from '../store/auth';

const authStore = useAuthStore();
const attendance = ref<any[]>([]);
const reports = ref<any[]>([]);

const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const lastStatus = computed(() => {
  if (attendance.value.length === 0) return null;
  const last = attendance.value[attendance.value.length - 1];
  return last.type === 'in' ? 'Checked In' : 'Checked Out';
});

const fetchData = async () => {
  try {
    const [attRes, repRes] = await Promise.all([
      fetch('/api/attendance/my', { headers: { 'Authorization': `Bearer ${authStore.token}` } }),
      fetch('/api/reports/my', { headers: { 'Authorization': `Bearer ${authStore.token}` } })
    ]);
    
    attendance.value = await attRes.json();
    reports.value = await repRes.json();
  } catch (err) {
    console.error('Failed to fetch dashboard data', err);
  }
};

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();
const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

onMounted(fetchData);
</script>
