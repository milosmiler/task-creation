<script setup>
defineProps({
  hasTasks: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div class="empty-state">
    <div class="empty-mark" :class="{ error: !hasTasks }">{{ hasTasks ? '✓' : '✕' }}</div>
    <h2>No hay tareas para mostrar</h2>
    <p>Crea una tarea o ajusta los filtros activos.</p>
  </div>
</template>
