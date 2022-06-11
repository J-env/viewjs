<script setup lang="ts">
import HelloWorld from '@/components/HelloWorld.vue'
</script>

<template>
  <div>
    <h1>App</h1>
  </div>

  <div>
    <div class="relative">
      <img class="w-full h-full" src="@/assets/images/logo.png" alt="">
    </div>
  </div>

  <HelloWorld msg="Hello Vue 3 + TypeScript + Vite" />
</template>

<style>
h1 {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
