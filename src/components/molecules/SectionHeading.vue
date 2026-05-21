<script setup>
import EyebrowText from '../atoms/EyebrowText.vue'

defineProps({
  eyebrow: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="section-heading">
    <div>
      <EyebrowText v-if="eyebrow" :text="eyebrow" />
      <h2>{{ title }}</h2>
    </div>
    <slot name="action" />
  </div>
</template>
