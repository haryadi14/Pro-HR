<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <header>
      <h1 class="text-3xl font-bold text-slate-900">Daily Reports</h1>
      <p class="text-slate-500">Submit your daily activity log.</p>
    </header>

    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h2 class="text-lg font-bold text-slate-900 mb-4">New Report</h2>
      <form @submit.prevent="submitReport" class="space-y-4">
        <textarea 
          v-model="newReport" 
          rows="4" 
          required
          placeholder="What did you work on today? Any blockers?"
          class="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
        ></textarea>
        <div class="flex justify-end">
          <button 
            type="submit" 
            :disabled="loading || !newReport"
            class="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            {{ loading ? 'Submitting...' : 'Submit Report' }}
          </button>
        </div>
      </form>
    </div>

    <section class="space-y-4">
      <h2 class="text-xl font-bold text-slate-900">Your History</h2>
      <div v-if="reports.length === 0" class="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400">
        No reports found.
      </div>
      <div v-for="report in reports.slice().reverse()" :key="report.id" class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div class="flex justify-between items-start mb-2">
          <span class="text-xs font-bold text-blue-600 uppercase tracking-widest">{{ formatDate(report.date) }}</span>
          <span class="text-xs text-slate-400">{{ formatTime(report.date) }}</span>
        </div>
        <p class="text-slate-700 whitespace-pre-wrap">{{ report.content }}</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../store/auth';

const authStore = useAuthStore();
const reports = ref<any[]>([]);
const newReport = ref('');
const loading = ref(false);

const fetchReports = async () => {
  try {
    const res = await fetch('/api/reports/my', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    reports.value = await res.json();
  } catch (err) {
    console.error(err);
  }
};

const submitReport = async () => {
  loading.value = true;
  try {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ content: newReport.value })
    });
    
    if (res.ok) {
      newReport.value = '';
      await fetchReports();
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

onMounted(fetchReports);
</script>
