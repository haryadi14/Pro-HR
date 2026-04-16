<template>
  <div class="max-w-3xl mx-auto space-y-8">
    <header class="text-center">
      <h1 class="text-3xl font-bold text-slate-900">Attendance</h1>
      <p class="text-slate-500">Log your presence for today.</p>
    </header>

    <div class="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 text-center space-y-6">
      <div class="flex justify-center">
        <div :class="isCheckedIn ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'" class="p-6 rounded-full transition-colors duration-500">
          <Clock class="w-16 h-16" />
        </div>
      </div>
      
      <div>
        <p class="text-4xl font-mono font-bold text-slate-900">{{ currentTime }}</p>
        <p class="text-slate-500 mt-1">{{ today }}</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <button 
          @click="logAttendance('in')" 
          :disabled="isCheckedIn || loading"
          class="flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all group"
          :class="isCheckedIn ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed' : 'border-green-100 hover:border-green-500 hover:bg-green-50'"
        >
          <LogIn class="w-8 h-8 mb-2 text-green-600 group-hover:scale-110 transition-transform" />
          <span class="font-bold text-slate-900">Check In</span>
        </button>

        <button 
          @click="logAttendance('out')" 
          :disabled="!isCheckedIn || loading"
          class="flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all group"
          :class="!isCheckedIn ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed' : 'border-red-100 hover:border-red-500 hover:bg-red-50'"
        >
          <LogOut class="w-8 h-8 mb-2 text-red-600 group-hover:scale-110 transition-transform" />
          <span class="font-bold text-slate-900">Check Out</span>
        </button>
      </div>

      <div v-if="location" class="flex items-center justify-center space-x-2 text-xs text-slate-400">
        <MapPin class="w-3 h-3" />
        <span>Location: {{ location }}</span>
      </div>
    </div>

    <section class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100">
        <h2 class="font-bold text-slate-900">History</h2>
      </div>
      <div class="divide-y divide-slate-50">
        <div v-for="item in history.slice().reverse()" :key="item.id" class="px-6 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div :class="item.type === 'in' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'" class="px-2 py-1 rounded text-xs font-bold uppercase">
              {{ item.type }}
            </div>
            <div>
              <p class="text-sm font-medium text-slate-900">{{ formatDate(item.timestamp) }}</p>
              <p class="text-xs text-slate-500">{{ item.location }}</p>
            </div>
          </div>
          <span class="text-sm font-mono text-slate-600">{{ formatTime(item.timestamp) }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Clock, LogIn, LogOut, MapPin } from 'lucide-vue-next';
import { useAuthStore } from '../store/auth';

const authStore = useAuthStore();
const history = ref<any[]>([]);
const loading = ref(false);
const isCheckedIn = ref(false);
const location = ref('');
const currentTime = ref('');
const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

let timer: any;

const updateClock = () => {
  currentTime.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
};

const fetchHistory = async () => {
  try {
    const res = await fetch('/api/attendance/my', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    history.value = await res.json();
    if (history.value.length > 0) {
      isCheckedIn.value = history.value[history.value.length - 1].type === 'in';
    }
  } catch (err) {
    console.error(err);
  }
};

const logAttendance = async (type: 'in' | 'out') => {
  loading.value = true;
  try {
    const response = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ type, location: location.value || 'Office HQ' })
    });
    
    if (response.ok) {
      await fetchHistory();
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();
const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

onMounted(() => {
  fetchHistory();
  updateClock();
  timer = setInterval(updateClock, 1000);
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      location.value = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
    });
  }
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>
