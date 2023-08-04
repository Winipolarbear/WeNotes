<template>
  <div class="app-layout">
    <el-container>
      <aside-folder></aside-folder>
      <aside-note></aside-note>
      <main-edit></main-edit>
    </el-container>
  </div>
</template>
<script setup lang="ts">
import { Node } from '@/types'

// const node = ref<Node>()
// const handleNodeClick = (data) => {
//   console.log({ node: data })
//   node.value = data
// }
</script>
<style lang="scss" scoped>
.app-layout {
  width: 100%;
  height: 100%;
  .el-container {
    width: 100%;
    height: 100%;
  }
}
</style>
