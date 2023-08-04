<template>
  <div class="tree-pane">
    <header>
      <div class="title">
        <slot name="title"></slot>
      </div>
      <el-popover
        ref="popoverRef"
        :visible="visible"
        :hide-after="0"
        :offset="3"
        placement="bottom"
        :width="200"
      >
        <template #reference>
          <div class="icon" @click="handleClick" ref="clickRef">
            <mdi-map-marker-plus-outline
              v-if="props.type === 'tag'"
            ></mdi-map-marker-plus-outline>
            <fluent-folder-add-28-regular v-else></fluent-folder-add-28-regular>
          </div>
        </template>
        <div>
          <slot name="popover"></slot>
        </div>
      </el-popover>
    </header>
    <main>
      <slot name="tree"></slot>
    </main>
  </div>
</template>
<script lang="ts" setup>
interface TreePaneEmits {
  (e: 'quit'): void
}
const emits = defineEmits<TreePaneEmits>()
interface Props {
  type: 'tag' | 'folder'
}
const props = defineProps<Props>()
const visible = ref(false)
const popoverRef = ref(null)
const handleClick = () => {
  visible.value = true
}
const clickRef = ref<HTMLElement | null>(null)
const close = () => {
  visible.value = false
  emits('quit')
}
defineExpose({ close })
const handleDocumentClick = (e: Event) => {
  const path = e.composedPath?.()
  path.pop()
  path.pop()
  const isClickBtn = path.some((el: EventTarget) => {
    return el === clickRef.value
  })
  if (!visible.value || isClickBtn) return
  const list = ['el-popover', 'el-color-picker__panel']

  const isClickPopoverOrColorPicker = path.some((el: EventTarget) => {
    const { classList } = el as HTMLElement
    const flag = list.some((classStr) => classList.contains(classStr))
    return flag
  })
  if (!isClickPopoverOrColorPicker) {
    visible.value = false
    nextTick(() => emits('quit'))
  }
}
onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})
onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>
<style lang="scss" scoped>
.tree-pane {
  header {
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 4px;
    .title {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
    .icon {
      display: flex;
      align-items: center;
      color: var(--el-color-primary);
      cursor: pointer;
      transition: color 0.2s;
      &:hover {
        color: var(--el-color-primary-light-3);
      }
    }
  }
}
</style>
