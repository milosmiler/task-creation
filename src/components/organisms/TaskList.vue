<script setup>
defineProps({
  tasks: {
    type: Array,
    required: true
  },
  categoryNameById: {
    type: Object,
    required: true
  }
})

defineEmits(['delete', 'edit', 'toggle-status'])

const formatDate = (value) => {
  if (!value) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(`${value}T00:00:00`))
}
</script>

<template>
  <div class="task-list">
    <article
      v-for="task in tasks"
      :key="task.id"
      class="task-item"
      :class="{ completed: task.status === 'Completada' }"
    >
      <div class="task-main">
        <button
          class="status-toggle"
          type="button"
          :aria-label="`Cambiar estado de ${task.title}`"
          @click="$emit('toggle-status', task)"
        >
          <span />
        </button>

        <div class="task-content">
          <div class="task-title-row">
            <h3>{{ task.title }}</h3>
            <span class="status-pill">{{ task.status }}</span>
          </div>

          <p>{{ task.description }}</p>

          <div class="task-meta">
            <span>{{ categoryNameById[task.category_id] ?? 'Sin categoría' }}</span>
            <span>{{ formatDate(task.due_date) }}</span>
          </div>
        </div>
      </div>

      <div class="task-actions">
        <button class="icon-button" type="button" aria-label="Editar tarea" @click="$emit('edit', task)">
          ✎
        </button>
        <button class="icon-button danger" type="button" aria-label="Eliminar tarea" @click="$emit('delete', task.id)">
          ×
        </button>
      </div>
    </article>
  </div>
</template>
