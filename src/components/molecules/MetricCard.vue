<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    required: true
  }
})
</script>

<template>
  <article class="metric">
    <span>{{ label }}</span>
    <strong>{{ value }}</strong>
  </article>
</template>
