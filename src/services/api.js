import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

const unwrap = (response) => {
  const payload = response.data

  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data

  return payload?.data ?? payload
}

export const tasksApi = {
  async list(params = {}) {
    return unwrap(await api.get('/tasks', { params }))
  },
  async create(task) {
    return unwrap(await api.post('/tasks', task))
  },
  async update(id, task) {
    return unwrap(await api.put(`/tasks/${id}`, task))
  },
  async remove(id) {
    return unwrap(await api.delete(`/tasks/${id}`))
  }
}

export const categoriesApi = {
  async list() {
    return unwrap(await api.get('/categories'))
  },
  async create(category) {
    return unwrap(await api.post('/categories', category))
  }
}

export default api
