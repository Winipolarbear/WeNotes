<template>
  <el-aside>
    <div class="aside-container" ref="asideRef">
      <el-scrollbar>
        <slot></slot>
      </el-scrollbar>
      <div class="resize" @mousedown="handleMouseDown"></div>
    </div>
  </el-aside>
</template>

<script lang="ts" setup>
interface resizeProp {
  minWidth?: number
  maxWidth?: number
  width: number
}
const props = withDefaults(defineProps<resizeProp>(), {
  minWidth: 200,
  maxWidth: 350,
  width: 200,
})

interface Emits {
  (e: 'width-change', width: number): void
}
const emits = defineEmits<Emits>()

const isResizing = ref(false)
const asideRef = ref<HTMLElement | null>(null)
const handleMouseDown = () => {
  document.body.style.cursor = 'col-resize'
  window.addEventListener('selectstart', handleTextSelect)
  window.addEventListener('dragstart', handleDrag)
  isResizing.value = true
}
const handleTextSelect = (e: Event) => {
  e.preventDefault()
}
const handleDrag = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
}
const handleMouseMove = (e: MouseEvent) => {
  if (!isResizing.value) return
  // e.preventDefault()
  const scrollWidth = Math.min(
    Math.max(
      props.minWidth,
      e.clientX - asideRef.value!.getBoundingClientRect().left
    ),
    props.maxWidth
  )
  emits('width-change', scrollWidth)
}
const handleMouseUp = () => {
  if (!isResizing.value) return
  document.body.style.cursor = 'auto'
  isResizing.value = false
  window.removeEventListener('selectstart', handleTextSelect)
  window.removeEventListener('dragstart', handleDrag)
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
})
onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
})
</script>

<style lang="scss" scoped>
.el-aside {
  --el-aside-width: calc(v-bind(props.width) * 1px);
  padding-top: var(--padding-app-top);
  .aside-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-wrap: nowrap;
    .el-scrollbar {
      flex: 1;
    }
    .resize {
      height: 100%;
      padding: 0 2px;
      width: 5px;
      display: flex;
      justify-content: center;
      cursor: col-resize;
      background-color: var(--el-border-color-darker);
      background-clip: content-box;
    }
  }
}
</style>
