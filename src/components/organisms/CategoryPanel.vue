<script setup>
import { reactive } from 'vue'
import SectionHeading from '../molecules/SectionHeading.vue'

defineProps({
  categories: {
    type: Array,
    required: true
  },
  isSaving: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit'])

const form = reactive({
  name: ''
})

const submitCategory = () => {
  emit('submit', { name: form.name.trim() })
  form.name = ''
}
</script>

<template>
  <section class="category-panel">
    <SectionHeading eyebrow="Categorías" title="Administrar">
      <template #action>
        <span class="count-badge">{{ categories.length }}</span>
      </template>
    </SectionHeading>

    <form class="inline-form" @submit.prevent="submitCategory">
      <label class="field">
        <span>Nombre</span>
        <input v-model="form.name" type="text" maxlength="80" required />
      </label>
      <button class="primary-button square" type="submit" :disabled="isSaving">
        +
      </button>
    </form>

    <ul class="category-list">
      <li v-for="category in categories" :key="category.id">
        {{ category.name }}
      </li>
    </ul>
  </section>
</template>
