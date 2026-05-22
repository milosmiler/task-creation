<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import LoginView from './views/LoginView.vue'
import PanelView from './views/PanelView.vue'

const isAuthenticated = ref(localStorage.getItem('taskManagerSession') === 'active')
const currentPath = ref(window.location.pathname)
const loginError = ref('')

const routeTo = (path, replace = false) => {
  if (window.location.pathname !== path) {
    const method = replace ? 'replaceState' : 'pushState'
    window.history[method]({}, '', path)
  }

  currentPath.value = path
}

const syncRoute = () => {
  const path = window.location.pathname

  if (!isAuthenticated.value) {
    routeTo('/login', true)
    return
  }

  if (path !== '/panel') {
    routeTo('/panel', true)
    return
  }

  currentPath.value = path
}

const login = (credentials) => {
  loginError.value = ''

  if (!credentials.email.trim() || !credentials.password.trim()) {
    loginError.value = 'Ingresa tu correo y contraseña para continuar.'
    return
  }

  isAuthenticated.value = true

  if (credentials.remember) {
    localStorage.setItem('taskManagerSession', 'active')
  }

  routeTo('/panel')
}

const logout = () => {
  localStorage.removeItem('taskManagerSession')
  isAuthenticated.value = false
  loginError.value = ''
  routeTo('/login')
}

const handleLocationChange = () => {
  currentPath.value = window.location.pathname
  syncRoute()
}

onMounted(() => {
  window.addEventListener('popstate', handleLocationChange)
  syncRoute()
})

onUnmounted(() => {
  window.removeEventListener('popstate', handleLocationChange)
})
</script>

<template>
  <LoginView
    v-if="currentPath === '/login'"
    :error-message="loginError"
    @submit="login"
  />

  <PanelView
    v-else-if="currentPath === '/panel'"
    @logout="logout"
  />
</template>
