<script setup lang="ts">
const isDark = useDark()

const toggleTheme = useToggle(isDark)
</script>

<template>
  <app-header></app-header>
  <app-layout></app-layout>
</template>

<style>
:root {
  --padding-app-top: 6px;
}
</style>
