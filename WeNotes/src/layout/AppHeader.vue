<template>
  <header>
    <div class="app">
      <img class="logo" :src="logo" />
      <div class="app-name">{{ appName }}</div>
    </div>
    <div class="win-btns">
      <div class="win-btn" @click="handleMinimize">
        <codicon-chrome-minimize></codicon-chrome-minimize>
      </div>
      <div class="win-btn" v-if="isMaximized" @click="handleRestore">
        <codicon-chrome-restore></codicon-chrome-restore>
      </div>
      <div class="win-btn" v-else @click="handleMaximize">
        <codicon-chrome-maximize></codicon-chrome-maximize>
      </div>
      <div class="win-btn close" @click="handleClose">
        <codicon-chrome-close></codicon-chrome-close>
      </div>
    </div>
  </header>
</template>

<script lang="ts" setup>
import logo from '/icon.ico'
const appName = ref('')
const isMac = ref(false)
const isMaximized = ref(false)
const justifyContent = computed(() => (isMac.value ? 'center' : 'flex-start'))
watch(isMaximized, (isMaximized) => {
  const borderRadius = isMaximized ? '0px' : '8px'
  const app = document.querySelector('#app') as HTMLDivElement
  app.style.setProperty('border-radius', borderRadius)
})
onMounted(async () => {
  window.api.getAppName().then((name: string) => (appName.value = name))
  window.api
    .getPlatform()
    .then((platform: string) => (isMac.value = platform === 'darwin'))
  window.api.isMaximized().then((max: boolean) => (isMaximized.value = max))
})
const handleMinimize = () => window.api.minimize()
const handleRestore = () => {
  window.api.restore()
  isMaximized.value = false
}
const handleMaximize = () => {
  window.api.maximize()
  isMaximized.value = true
}
const handleClose = () => window.api.close()
</script>
<style lang="scss" scoped>
header {
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: v-bind(justifyContent);
  padding-left: 10px;
  background-color: var(--el-bg-color);
  user-select: none;
  -webkit-app-region: drag;
  position: relative;
  .app {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--el-text-color-primary);
    .logo {
      width: 18px;
      aspect-ratio: 1 / 1;
    }
  }
  .win-btns {
    -webkit-app-region: no-drag;
    position: absolute;
    right: 0;
    height: 100%;
    display: flex;
    align-items: center;
    .win-btn {
      font-size: 0.8em;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 100%;
      cursor: pointer;
      &:hover {
        background-color: var(--el-fill-color-dark);
      }
      &.close {
        &:hover {
          background-color: #fb7373;
        }
      }
    }
  }
}
</style>
