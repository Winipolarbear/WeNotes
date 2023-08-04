<template>
  <aside-resize
    v-show="!folderHide"
    :width="folderWidth"
    @width-change="handleWidthChange"
  >
    <div>
      <el-tree
        ref="fixedTreeRef"
        :data="sysFolders"
        :current-node-key="sysCurrent"
        @node-click="handleNodeClickFixed"
        node-key="id"
        empty-text=""
      >
        <template #default="{ data }">
          <div class="fixed-node">
            <span class="fixed-node-icon">
              <template v-if="data.id === 0">
                <ep-edit />
              </template>
              <template v-if="data.id === 1">
                <ep-delete />
              </template>
            </span>
            <span class="node-title">
              {{ data.title }}
            </span>
            <span class="node-count">
              {{ data.child_notes_count }}
            </span>
          </div>
        </template>
      </el-tree>
    </div>
    <tree-pane @quit="handleFolderQuit" ref="folderRef" type="folder">
      <template #title>Folders</template>
      <template #tree>
        <el-tree
          ref="folderTreeRef"
          :data="folders"
          :props="defaultProps"
          :lazy="true"
          :load="loadFolder"
          :current-node-key="folderCurrent"
          :expand-on-click-node="false"
          :highlight-current="true"
          @node-contextmenu="handleFolderContextMenu"
          @node-click="handleNodeClickFolder"
          node-key="id"
          empty-text=""
        >
          <template #default="{ data }">
            <div class="tree-node">
              <span class="node-title">
                <span
                  class="input"
                  v-if="folderTitle.id && folderTitle.id === data.id"
                >
                  <el-input
                    v-model="folderTitle.title"
                    :ref="(el) => (inputRef = el)"
                    @keydown.enter="handleFolderTitleEditBlur"
                    @blur="handleFolderTitleEditBlur"
                  ></el-input>
                </span>
                <span class="title" v-else>
                  {{ data.title }}
                </span>
              </span>
              <span class="node-count">
                {{ data.child_notes_count }}
              </span>
            </div>
          </template>
        </el-tree>
      </template>
      <template #popover>
        <el-form
          :model="newFolder"
          ref="folderFormRef"
          :rules="newFolderRules"
          label-position="top"
          :hide-required-asterisk="true"
          status-icon
        >
          <el-form-item label="Folder Name" prop="title">
            <el-input v-model="newFolder.title" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="handleFolderConfirm">
              Create
            </el-button>
            <el-button size="small" @click="handleFolderCancel"
              >Cancel</el-button
            >
          </el-form-item>
        </el-form>
      </template>
    </tree-pane>
    <tree-pane @quit="handleTagQuit" ref="tagRef" type="tag">
      <template #title>Tags</template>
      <template #tree>
        <el-tree
          ref="tagTreeRef"
          :data="tags"
          node-key="id"
          empty-text=""
          :current-node-key="tagCurrent"
          @node-contextmenu="handleTagContextMenu"
          @node-click="handleNodeClickTag"
        >
          <template #default="{ data }">
            <div class="tree-node">
              <span class="color">
                <el-color-picker
                  v-model="data.color"
                  size="small"
                  @change="(color) => handleChangeTagColor(data.id, color)"
                ></el-color-picker>
              </span>
              <span class="node-title">
                <span class="input" v-if="tagName.id && tagName.id === data.id">
                  <el-input
                    v-model="tagName.name"
                    :ref="(el) => (inputRef = el)"
                    @keydown.enter="handleTagNameEditBlur"
                    @blur="handleTagNameEditBlur"
                  ></el-input>
                </span>
                <span class="title" v-else>
                  {{ data.name }}
                </span>
              </span>
              <span class="node-count">
                {{ data.child_notes_count }}
              </span>
            </div>
          </template>
        </el-tree>
      </template>
      <template #popover>
        <el-form
          :model="newTag"
          ref="tagFormRef"
          :rules="newTagRules"
          label-position="top"
          :hide-required-asterisk="true"
          status-icon
        >
          <el-form-item label="Tag Name" prop="name">
            <el-input v-model="newTag.name" />
          </el-form-item>
          <el-form-item label="Tag Color" prop="color">
            <el-color-picker
              color-format="hex"
              :predefine="predefineColors"
              v-model="newTag.color"
            /><span style="margin-left: 10px">{{ newTag.color }}</span>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="handleTagConfirm">
              Create
            </el-button>
            <el-button size="small" @click="handleTagCancel">Cancel</el-button>
          </el-form-item>
        </el-form>
      </template>
    </tree-pane>
  </aside-resize>
</template>

<script lang="ts" setup>
import type { ElTree, FormInstance, FormRules } from 'element-plus'
// import { ElMessageBox } from 'element-plus'

import TreePane from '@/components/TreePane.vue'
import { Tag, SpecialNodeID, Folder } from '@/types'

import { useFolderStore, useConfigStore } from '@/store'
import { storeToRefs } from 'pinia'

const configStore = useConfigStore()
const { folderWidth, folderHide } = storeToRefs(configStore)

const handleWidthChange = (width) => {
  configStore.changeFolderWidth(width)
}

const folderStore = useFolderStore()
const { sysFolders, folders, tags, currentNode, node } =
  storeToRefs(folderStore)
console.log({ folders })
const { getFolders, getTags, changeCurrentNode } = folderStore

// const tagCurrent = computed(() => {
//   if (currentNode.value.type !== 'tag') return null
//   return currentNode.value.id
// })

watch(
  [sysFolders, folders, tags, currentNode],
  () => {
    const { type, id } = currentNode.value
    nextTick(() => {
      console.log(type, id)
      switch (type) {
        case 'sys':
          folderTreeRef.value?.setCurrentKey(null)
          tagTreeRef.value?.setCurrentKey(null)
          fixedTreeRef.value?.setCurrentKey(id)
          break
        case 'folder':
          tagTreeRef.value?.setCurrentKey(null)
          fixedTreeRef.value?.setCurrentKey(null)
          folderTreeRef.value?.setCurrentKey(id)
          break
        case 'tag':
          folderTreeRef.value?.setCurrentKey(null)
          fixedTreeRef.value?.setCurrentKey(null)
          tagTreeRef.value?.setCurrentKey(id)
          break
      }
    })
  },
  {
    flush: 'post',
  }
)

const sysCurrent = computed(() => {
  if (currentNode.value.type !== 'sys') return null
  return currentNode.value.id
})
const folderCurrent = computed(() => {
  if (currentNode.value.type !== 'folder') return null

  return currentNode.value.id
})
const tagCurrent = computed(() => {
  if (currentNode.value.type !== 'tag') return null
  return currentNode.value.id
})

const fixedTreeRef = ref<InstanceType<typeof ElTree>>()
const folderTreeRef = ref<InstanceType<typeof ElTree>>()
const tagTreeRef = ref<InstanceType<typeof ElTree>>()

const folderRef = ref<InstanceType<typeof TreePane> | null>(null)
const folderFormRef = ref<FormInstance | null>(null)
const newFolder = reactive({
  title: '',
})
const handleFolderConfirm = async () => {
  if (!folderFormRef) return
  folderFormRef.value.validate(async (valid) => {
    if (valid) {
      const folder = new Folder(SpecialNodeID.ROOT, newFolder.title)
      await window.api.addFolder(folder)
      getFolders()
      handleFolderCancel()
    } else {
      return false
    }
  })
}
const handleFolderCancel = () => {
  folderFormRef.value?.resetFields()
  folderRef.value?.close()
}

const newFolderRules = reactive<FormRules>({
  title: [
    { required: true, message: 'Please input Folder name', trigger: 'blur' },
  ],
})
const tagRef = ref<InstanceType<typeof TreePane> | null>(null)
const tagFormRef = ref<FormInstance | null>(null)
const predefineColors = ref([
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
  '#00a8ff',
  '#2ecc71',
  '#c71585',
  '#f368e0',
  '#fc427b',
  '#fff200',
  '#ed6d3d',
  '#dd6b7b',
  '#995d7f',
  '#e60012',
  '#535164',
  '#44bd32',
  '#9aecdb',
])
const newTag = reactive({
  name: '',
  color: '#FF0000',
})
const handleTagConfirm = () => {
  if (!tagFormRef) return
  tagFormRef.value.validate(async (valid) => {
    if (valid) {
      const tag = new Tag(newTag.name, newTag.color)
      await window.api.addTag(tag)
      getTags()
      handleTagCancel()
    } else {
      return false
    }
  })
}
const handleTagCancel = () => {
  tagFormRef.value?.resetFields()
  tagRef.value?.close()
}
const newTagRules = reactive<FormRules>({
  name: [{ required: true, message: 'Please input Tag name', trigger: 'blur' }],
  color: [{ required: true, message: 'Please select a Tag color' }],
})

const handleFolderQuit = () => {
  folderFormRef.value?.resetFields()
}
const handleTagQuit = () => {
  tagFormRef.value?.resetFields()
}

const loadFolder = async (node, resolve) => {
  console.log(node)
  const pid = node.data.id
  console.log({ pid })
  const result = await window.api.getFoldersByPid(pid)
  console.log({ result })
  resolve(result)
}

onMounted(() => {
  console.log({ changeCurrentNode })

  if (sysFolders.value.length === 0) {
    console.log(123)
  }
  getFolders()
  getTags()

  window.api.onRenameFolder((event, id) => {
    folderTitle.id = id
    folderTitle.title = folders.value.find((folder) => folder.id === id)?.title
    nextTick(() => {
      inputRef.value?.focus()
    })
    titleCache = folderTitle.title.toString()
  })
  window.api.onDeleteFolder((event, id) => {
    ElMessageBox.confirm(
      'Are you sure you want to delete this folder? All notes and any subfolders will be deleted.',
      'Delete Folder',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )
      .then(async () => {
        await window.api.deleteFolderRecursively(id)
        // getFirstLevelFolders()
        getFolders()
      })
      .catch(() => {
        // catch error
      })
  })
  window.api.onRenameTag((event, id) => {
    tagName.id = id
    tagName.name = tags.value.find((tag) => tag.id === id)?.name
    nextTick(() => {
      inputRef.value?.focus()
    })
    titleCache = tagName.name.toString()
  })
  window.api.onDeleteTag(async (event, id) => {
    await window.api.deleteTag(id)
    getTags()
  })
  // window.api.onAddFolder(async (event, id) => {
  //   const folder = new Folder(id, newFolder.title)
  //   await window.api.addFolder(folder)
  //   getFolders()
  // })
})

const folderTitle = reactive({
  id: null,
  title: '',
})
const inputRef = ref()
let titleCache = ''
const handleFolderTitleEditBlur = async () => {
  const { title = '', id } = folderTitle
  if (!id || title.trim() === '') return
  if (title !== titleCache) {
    const result = await window.api.updateFolderTitle(title, id)
    if (result) {
      const folder = folders.value.find((folder) => folder.id === id)
      folder.title = title
    }
  }
  folderTitle.id = null
  folderTitle.title = ''
  titleCache = ''
}
const tagName = reactive({
  id: null,
  name: '',
})

const handleTagNameEditBlur = async () => {
  const { name = '', id } = tagName
  if (!id || name.trim() === '') return
  if (name !== titleCache) {
    const result = await window.api.updateTagName(id, name)
    if (result) {
      const tag = tags.value.find((tag) => tag.id === id)
      tag.name = name
    }
  }
  tagName.id = null
  tagName.name = ''
  titleCache = ''
}
const handleChangeTagColor = (id, color) => {
  console.log(id, color)
  window.api.updateTagColor(id, color)
}
const handleNodeContextMenu = (id, isTag = false) => {
  window.api.showContextMenu(id, isTag)
}
const handleFolderContextMenu = (event, data) => {
  const id = data.id
  if (id === SpecialNodeID.DEFAULT_NOTES) return
  handleNodeContextMenu(id, false)
}
const handleTagContextMenu = (event, data) => {
  const id = data.id
  handleNodeContextMenu(id, true)
}
const handleNodeClickFixed = (data) => {
  console.log(data)
  folderTreeRef.value.setCurrentKey(null, true)
  tagTreeRef.value.setCurrentKey(null, true)
  changeCurrentNode('sys', data.id)
}
const handleNodeClickFolder = (data) => {
  fixedTreeRef.value.setCurrentKey(null, true)
  tagTreeRef.value.setCurrentKey(null, true)
  changeCurrentNode('folder', data.id)
}
const handleNodeClickTag = (data) => {
  fixedTreeRef.value.setCurrentKey(null, true)
  folderTreeRef.value.setCurrentKey(null, true)
  changeCurrentNode('tag', data.id)
}

const defaultProps = {
  children: 'children',
  label: 'title',
  isLeaf: (data: any) => data.child_folders_count === 0,
}
</script>

<style lang="scss" scoped>
:deep(.el-tree) {
  background-color: var(--el-bg-color-page);
  .el-tree-node.is-current > .el-tree-node__content {
    background-color: var(--el-color-primary-light-8);
  }
}
:deep(.el-tree-node__content) {
  height: 36px;
  padding-right: 10px;
  color: var(--el-text-color-primary);
  .fixed-node {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex: 1;
    height: 100%;
    position: relative;
    span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .fixed-node-icon {
      position: absolute;
      left: -20px;
    }
  }
  .tree-node {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: calc(100% - 24px);
    max-width: calc(100% - 24px);
    height: 100%;
    position: relative;
    gap: 10px;
    user-select: none;
    .node-title {
      width: calc(100% - 10px - 12px);
      height: 100%;
      display: flex;
      align-items: center;
      .input {
        margin-left: -12px;
      }
      .title {
        display: inline-block;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    .color {
      position: relative;
      left: -18px;
      height: 100%;

      .el-color-picker--small {
        height: 100%;

        display: flex;
        align-items: center;
        .el-color-picker__trigger {
          height: 23px;
          width: 23px;
        }
      }
      & + .node-title {
        margin-left: -20px;
      }
    }
  }
}
</style>
