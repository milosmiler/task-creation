<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import MetricCard from '../components/molecules/MetricCard.vue'
import CategoryPanel from '../components/organisms/CategoryPanel.vue'
import EmptyState from '../components/organisms/EmptyState.vue'
import TaskForm from '../components/organisms/TaskForm.vue'
import TaskList from '../components/organisms/TaskList.vue'
import { categoriesApi, tasksApi } from '../services/api'

defineEmits(['logout'])

const tasks = ref([])
const categories = ref([])
const isLoading = ref(false)
const isSavingTask = ref(false)
const isSavingCategory = ref(false)
const editingTask = ref(null)
const errorMessage = ref('')
const successMessage = ref('')

const filters = reactive({
  categoryId: '',
  status: '',
  search: ''
})

const stats = computed(() => {
  const total = tasks.value.length
  const completed = tasks.value.filter((task) => task.status === 'Completada').length
  const pending = total - completed

  return { total, completed, pending }
})

const filteredTasks = computed(() => {
  const search = filters.search.trim().toLowerCase()

  return tasks.value.filter((task) => {
    const matchesCategory = !filters.categoryId || Number(task.category_id) === Number(filters.categoryId)
    const matchesStatus = !filters.status || task.status === filters.status
    const haystack = `${task.title} ${task.description ?? ''}`.toLowerCase()
    const matchesSearch = !search || haystack.includes(search)

    return matchesCategory && matchesStatus && matchesSearch
  })
})

const sortedTasks = computed(() => {
  return [...filteredTasks.value].sort((first, second) => {
    if (!first.due_date) return 1
    if (!second.due_date) return -1
    return new Date(first.due_date) - new Date(second.due_date)
  })
})

const categoryNameById = computed(() => {
  return categories.value.reduce((names, category) => {
    names[category.id] = category.name
    return names
  }, {})
})

const loadData = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const [taskList, categoryList] = await Promise.all([
      tasksApi.list(),
      categoriesApi.list()
    ])

    tasks.value = taskList
    categories.value = categoryList
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}

const saveTask = async (taskPayload) => {
  isSavingTask.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    if (editingTask.value) {
      const updatedTask = await tasksApi.update(editingTask.value.id, taskPayload)
      tasks.value = tasks.value.map((task) => task.id === updatedTask.id ? updatedTask : task)
      successMessage.value = 'Tarea actualizada.'
    } else {
      const createdTask = await tasksApi.create(taskPayload)
      tasks.value = [createdTask, ...tasks.value]
      successMessage.value = 'Tarea creada.'
    }

    editingTask.value = null
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isSavingTask.value = false
  }
}

const saveCategory = async (categoryPayload) => {
  isSavingCategory.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const createdCategory = await categoriesApi.create(categoryPayload)
    categories.value = [...categories.value, createdCategory].sort((a, b) => a.name.localeCompare(b.name))
    successMessage.value = 'Categoría creada.'
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isSavingCategory.value = false
  }
}

const editTask = (task) => {
  editingTask.value = { ...task }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEdit = () => {
  editingTask.value = null
}

const deleteTask = async (taskId) => {
  const task = tasks.value.find((item) => item.id === taskId)
  const shouldDelete = window.confirm(`¿Eliminar la tarea "${task?.title ?? ''}"?`)

  if (!shouldDelete) return

  errorMessage.value = ''
  successMessage.value = ''

  try {
    await tasksApi.remove(taskId)
    tasks.value = tasks.value.filter((item) => item.id !== taskId)
    successMessage.value = 'Tarea eliminada.'
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  }
}

const toggleTaskStatus = async (task) => {
  const nextStatus = task.status === 'Completada' ? 'Pendiente' : 'Completada'

  try {
    const updatedTask = await tasksApi.update(task.id, {
      ...normalizeTask(task),
      status: nextStatus
    })

    tasks.value = tasks.value.map((item) => item.id === updatedTask.id ? updatedTask : item)
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  }
}

const clearFilters = () => {
  filters.categoryId = ''
  filters.status = ''
  filters.search = ''
}

const normalizeTask = (task) => ({
  title: task.title,
  description: task.description,
  status: task.status,
  due_date: task.due_date,
  category_id: task.category_id
})

const getErrorMessage = (error) => {
  const validationErrors = error.response?.data?.errors

  if (validationErrors) {
    return Object.values(validationErrors).flat().join(' ')
  }

  return error.response?.data?.message || 'No se pudo completar la operación.'
}

onMounted(loadData)
</script>

<template>
  <main class="app-shell">
    <header class="topbar">
        <h1>Gestor de tareas</h1>
      <div class="topbar-actions">
        <button class="ghost-button" type="button" @click="loadData">
          Actualizar
        </button>
        <button class="ghost-button" type="button" @click="$emit('logout')">
          Salir
        </button>
      </div>
    </header>

    <section class="summary-grid" aria-label="Resumen de tareas">
      <MetricCard label="Total" :value="stats.total" />
      <MetricCard label="Pendientes" :value="stats.pending" />
      <MetricCard label="Completadas" :value="stats.completed" />
    </section>

    <p v-if="errorMessage" class="alert alert-error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="alert alert-success">{{ successMessage }}</p>

    <section class="workspace-grid">
      <aside class="side-panel">
        <TaskForm
          :categories="categories"
          :editing-task="editingTask"
          :is-saving="isSavingTask"
          @cancel="cancelEdit"
          @submit="saveTask"
        />

        <CategoryPanel
          :categories="categories"
          :is-saving="isSavingCategory"
          @submit="saveCategory"
        />
      </aside>

      <section class="task-board" aria-label="Listado de tareas">
        <div class="board-toolbar">
          <label class="field search-field">
            <span>Buscar</span>
            <input v-model="filters.search" type="search" placeholder="Título o descripción" />
          </label>

          <label class="field">
            <span>Categoría</span>
            <select v-model="filters.categoryId">
              <option value="">Todas</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </label>

          <label class="field">
            <span>Estado</span>
            <select v-model="filters.status">
              <option value="">Todos</option>
              <option>Pendiente</option>
              <option>Completada</option>
            </select>
          </label>

          <button class="ghost-button compact" type="button" @click="clearFilters">
            Limpiar
          </button>
        </div>

        <div v-if="isLoading" class="loading-bar">Cargando tareas...</div>

        <TaskList
          v-else-if="sortedTasks.length"
          :tasks="sortedTasks"
          :category-name-by-id="categoryNameById"
          @delete="deleteTask"
          @edit="editTask"
          @toggle-status="toggleTaskStatus"
        />
        <EmptyState v-else :has-tasks="tasks.length > 0" />
      </section>
    </section>
  </main>
</template>
