<script setup>
import { RouterView } from 'vue-router'
import { Toaster } from '@/components/ui/toast'
</script>

<template>
  <Toaster />
  <div class="container">
    <RouterView />
  </div>
</template>

<style scoped>
.container {
  @apply ml-auto mr-auto w-full h-full pl-5 pr-5 pt-5 pb-5;
}
</style>
