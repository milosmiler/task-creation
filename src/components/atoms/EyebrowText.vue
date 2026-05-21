<script setup>
defineProps({
  text: {
    type: String,
    required: true
  }
})
</script>

<template>
  <p class="eyebrow">{{ text }}</p>
</template>
