<script setup>
import { reactive } from 'vue'

defineProps({
  errorMessage: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['submit'])

const loginForm = reactive({
  email: '',
  password: '',
  remember: true
})

const submitLogin = () => {
  emit('submit', { ...loginForm })
}
</script>

<template>
  <main class="login-shell">
    <section class="login-visual" aria-label="Presentación">
      <div class="login-brand">
        <span class="eyebrow">Task creator</span>
        <h1>Organiza tus tareas sin perder el ritmo.</h1>
        <p>
          Entra a tu espacio de trabajo para crear, filtrar y cerrar pendientes con claridad.
        </p>
      </div>

      <div class="login-preview" aria-hidden="true">
        <div class="preview-row checked">
          <span></span>
          <strong>Definir entregables</strong>
        </div>
        <div class="preview-row">
          <span></span>
          <strong>Revisar prioridades</strong>
        </div>
        <div class="preview-row">
          <span></span>
          <strong>Planear la semana</strong>
        </div>
      </div>
    </section>

    <section class="login-panel" aria-label="Inicio de sesión">
      <div class="login-heading">
        <span class="eyebrow">Bienvenido</span>
        <h2>Inicia sesión</h2>
      </div>

      <form class="login-form" @submit.prevent="submitLogin">
        <label class="field">
          <span>Correo</span>
          <input
            v-model="loginForm.email"
            autocomplete="email"
            placeholder="tu@email.com"
            type="email"
          />
        </label>

        <label class="field">
          <span>Contraseña</span>
          <input
            v-model="loginForm.password"
            autocomplete="current-password"
            placeholder="Ingresa tu contraseña"
            type="password"
          />
        </label>

        <label class="remember-row">
          <input v-model="loginForm.remember" type="checkbox" />
          <span>Mantener sesión iniciada</span>
        </label>

        <p v-if="errorMessage" class="alert alert-error">{{ errorMessage }}</p>

        <button class="primary-button login-button" type="submit">
          Entrar al gestor
        </button>
      </form>
    </section>
  </main>
</template>
