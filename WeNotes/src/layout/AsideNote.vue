<template>
  <aside-resize :width="noteWidth" @width-change="handleWidthChange">
    <div class="notes">
      <header>
        <div class="header">
          <div class="icon" @click="toggleFolder">
            <ep-fold v-if="!folderHide"></ep-fold>
            <ep-expand v-else></ep-expand>
          </div>
          <div class="title">{{ title }}</div>
          <div class="count">{{ node?.child_notes_count || 0 }}</div>
        </div>
        <div class="search-wrap">
          <el-input
            class="input"
            v-model="search"
            placeholder="Search"
            :prefix-icon="Search"
          />
          <div class="icon" @click="handleNewNote" v-if="!isTrash">
            <fluent-note-add-28-regular
              style="transform: rotate(270deg)"
            ></fluent-note-add-28-regular>
          </div>
        </div>
      </header>
      <main class="note-container">
        <template v-if="theNotes.pinnedNotes.length">
          <el-collapse :model-value="['Pinned', 'Notes']">
            <el-collapse-item title="Pinned" name="Pinned">
              <div
                class="note"
                :class="{ active: currentNote?.id === item.id }"
                v-for="item in theNotes.pinnedNotes"
                :key="item.id"
                @click="handleNoteClick(item.id)"
                @contextmenu.prevent="handleNoteMenu(item.id, item.is_pinned)"
              >
                <div class="title" :title="item.title">{{ item.title }}</div>
                <div class="time">{{ item.update_time }}</div>
                <div class="trash">
                  <ep-delete @click="handleDeleteNote(item.id)"></ep-delete>
                </div>
                <div class="tags" v-if="item.tags.length">
                  <div
                    class="tag"
                    v-for="tag in item.tags"
                    :key="tag.name + tag.color"
                  >
                    <span
                      class="tag-color"
                      :style="{ backgroundColor: tag.color }"
                    ></span>
                    <span class="tag-name">{{ tag.name }}</span>
                  </div>
                </div>
              </div>
            </el-collapse-item>
            <el-collapse-item
              name="Notes"
              title="Notes"
              class="collapse-notes"
              v-show="theNotes.normalNotes.length"
            >
              <div
                class="note"
                :class="{ active: currentNote?.id === item.id }"
                v-for="item in theNotes.normalNotes"
                :key="item.id"
                @click="handleNoteClick(item.id)"
                @contextmenu.prevent="handleNoteMenu(item.id, item.is_pinned)"
              >
                <div class="title" :title="item.title">{{ item.title }}</div>
                <div class="time">{{ item.update_time }}</div>
                <div class="trash">
                  <ep-delete @click="handleDeleteNote(item.id)"></ep-delete>
                </div>
                <div class="tags" v-if="item.tags.length">
                  <div
                    class="tag"
                    v-for="tag in item.tags"
                    :key="tag.name + tag.color"
                  >
                    <span
                      class="tag-color"
                      :style="{ backgroundColor: tag.color }"
                    ></span>
                    <span class="tag-name">{{ tag.name }}</span>
                  </div>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </template>
        <template v-else>
          <div
            class="note"
            :class="{ active: currentNote?.id === item.id }"
            v-for="item in theNotes.normalNotes"
            :key="item.id"
            @click="handleNoteClick(item.id)"
            @contextmenu.prevent="handleNoteMenu(item.id, item.is_pinned)"
          >
            <div class="title" :title="item.title">{{ item.title }}</div>
            <div class="time">{{ item.update_time }}</div>
            <div class="trash">
              <ep-delete @click="handleDeleteNote(item.id)"></ep-delete>
            </div>
            <div class="tags" v-if="item.tags.length">
              <div
                class="tag"
                v-for="tag in item.tags"
                :key="tag.name + tag.color"
              >
                <span
                  class="tag-color"
                  :style="{ backgroundColor: tag.color }"
                ></span>
                <span class="tag-name" :title="tag.name">{{ tag.name }}</span>
              </div>
            </div>
          </div>
        </template>
      </main>
    </div>
    <el-dialog v-model="bindTag" title="Add Tag" :center="true" width="400">
      <el-scrollbar height="300px">
        <div class="tag-wrap">
          <el-checkbox-group size="large" v-model="checkList">
            <div v-for="tag in tags" :key="tag.id">
              <el-checkbox
                :label="tag.id"
                @change="(...arg) => handleCheck(tag.id, arg)"
              >
                <div class="tag-item">
                  <div
                    class="color"
                    :style="{ backgroundColor: tag.color }"
                  ></div>
                  <div class="name">{{ tag.name }}</div>
                </div>
              </el-checkbox>
            </div>
          </el-checkbox-group>
        </div>
      </el-scrollbar>
    </el-dialog>
    <el-dialog v-model="moveNote" title="Move Note" :center="true" width="350">
      <div class="move-wrap" style="text-align: center">
        <el-select
          :value="{}"
          placeholder="Move this note to ?"
          size="large"
          @change="handleMove"
        >
          <el-option
            v-for="folder in folders"
            :key="folder.id"
            :label="folder.title"
            :value="folder.id"
            :disabled="folder.id === target.folder_id"
          />
        </el-select>
      </div>
    </el-dialog>
  </aside-resize>
</template>
<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { Search } from '@element-plus/icons-vue'

import { Note, SpecialNodeID, PinnedNote } from '@/types'
import {
  CurrentNode,
  CurrentNote,
  useConfigStore,
  useFolderStore,
} from '@/store'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

const configStore = useConfigStore()
const { noteWidth, folderHide } = storeToRefs(configStore)
const { changeNoteWidth, toggleFolder } = configStore
const handleWidthChange = (width) => {
  changeNoteWidth(width)
}

const folderStore = useFolderStore()
const { folders, notes, node, currentNode, currentNote, tags, search } =
  storeToRefs(folderStore)
const { getFolders, getTags, getNotes, changeCurrentNote } = folderStore

const theNotes = computed(() => {
  const now = dayjs()
  const pinnedNotes = []
  const normalNotes = []
  notes.value.forEach((note) => {
    const noteTime = dayjs(note.update_time)
    const diff = now.diff(noteTime, 'day')
    let update_time
    if (diff > 7) {
      update_time = noteTime.format('M/DD/YY')
    } else if (diff >= 1) {
      update_time = noteTime.fromNow() + ' ' + noteTime.format('h:mm A')
    } else {
      update_time = noteTime.format('h:mm A')
    }
    const newNote = { ...note, update_time }
    if (note.is_pinned === PinnedNote.TRUE) {
      pinnedNotes.push(newNote)
    } else {
      normalNotes.push(newNote)
    }
  })
  return {
    pinnedNotes,
    normalNotes,
  }
})

const title = computed(() => {
  console.log({ node })
  if ('title' in node.value) {
    return node.value.title
  } else if ('name' in node.value) {
    return node.value.name
  }
  return ''
})
const isTrash = computed(
  () =>
    currentNode.value.type === 'sys' && node.value.id === SpecialNodeID.TRASH
)

const handleNewNote = async () => {
  const { type, id } = currentNode.value
  const title = dayjs().format('MMMM DD, YYYY, h:mm:ss A')
  console.log(title)
  let noteId
  if (type === 'tag') {
    const note = new Note(SpecialNodeID.DEFAULT_NOTES, title)
    noteId = await window.api.addNote(note)
    await getTags()
  } else {
    const newId = type === 'sys' ? SpecialNodeID.DEFAULT_NOTES : id
    const note = new Note(newId, title)
    noteId = await await window.api.addNote(note)
    await getFolders()
  }
  await getNotes()
  changeCurrentNote({
    id: noteId,
  } as CurrentNote)
}

const handleDeleteNote = async (noteId: number) => {
  if (isTrash.value) {
    await ElMessageBox.confirm(
      'Are you sure you want to delete this note permanently? It will not be recoverable.',
      'Delete Note',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )
    await window.api.deleteNote(noteId)
  } else {
    await window.api.moveNote(noteId, SpecialNodeID.TRASH)
    // const note = notes.value.find((item) => item.id === noteId)
    // changeCurrentNote(note as CurrentNote)
  }
  notes.value = notes.value.filter((note) => note.id !== noteId)
  getFolders()
  getTags()
  // getNotes()
}
const handleNoteClick = (noteId: number) => {
  const note = notes.value.find((item) => item.id === noteId)
  changeCurrentNote(note as CurrentNote)
}
const handleNoteMenu = (id: number, is_pinned: PinnedNote) => {
  window.api.showNoteContextMenu(id, is_pinned)
  const find = notes.value.find((note) => note.id === id)
  target.value = find
  console.log(target)
}
const checkList = ref([])

const bindTag = ref(false)
const target = ref()
watch(target, () => {
  checkList.value = target.value.tags.map((tag) => tag.id)
})
const moveNote = ref(false)

const handleCheck = async (tagId, [isCheck]) => {
  const noteId = target.value.id
  console.log(isCheck, noteId, tagId)
  if (isCheck) {
    await window.api.addTagToNote(noteId, tagId)
  } else {
    await window.api.removeTagFromNote(noteId, tagId)
  }
  await getTags()
  getNotes()
}
const handleMove = async (folderId) => {
  const noteId = target.value.id
  moveNote.value = false
  await window?.api.moveNote(noteId, folderId)
  if (noteId === currentNote.value.id) {
    currentNode.value.id = folderId
  } else {
    getNotes()
  }
  getFolders()
}

onMounted(() => {
  window?.api.onTagNote(async (event, id: number) => {
    bindTag.value = true
  })
  window?.api.onPinNote(async (event, id: number, is_pinned: PinnedNote) => {
    const pin = is_pinned === PinnedNote.TRUE ? false : true
    await window.api.pinNote(id, pin)
    getNotes()
  })
  window?.api.onMoveNote((event, noteId: number) => {
    moveNote.value = true
  })
})
</script>
<style lang="scss" scoped>
.el-input {
  --el-input-bg-color: var(--el-bg-color-page);
}
.notes {
  display: flex;
  flex-direction: column;

  header {
    position: sticky;
    top: 0;
    background-color: var(--el-bg-color-page);
    padding-bottom: 10px;
    z-index: var(--el-index-top);
  }
  .header {
    padding: 0 6px;
    height: 36px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    .title {
      flex: 1;
      font-size: 14px;
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .count {
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }
  }
  .search-wrap {
    margin-top: 4px;
    padding: 0 0 0 6px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    .input {
      height: 28px;
    }
  }
  .icon {
    display: flex;
    align-items: center;
    color: var(--el-color-primary);
    cursor: pointer;
    transition: color 0.2s;
    svg {
      font-size: 1.1em;
    }
    &:hover {
      color: var(--el-color-primary-light-3);
    }
  }
  main {
    padding-bottom: 50px;
    flex: 1;
    --padding: 8px;
    :deep(.el-collapse) {
      --el-collapse-header-bg-color: var(--el-bg-color-page);
      --el-collapse-content-bg-color: var(--el-bg-color-page);
      --el-collapse-header-height: 32px;
      --el-collapse-header-text-color: var(--el-text-color-placeholder);
      .el-collapse-item {
        .el-collapse-item__header {
          padding-left: var(--padding);
          &.focusing:focus:not(:hover) {
            color: var(--el-collapse-header-text-color);
          }
        }
        .el-collapse-item__content {
          padding-bottom: 0px;
        }
        &.collapse-notes {
          pointer-events: none;
          .el-icon {
            display: none;
          }
          .el-collapse-item__content {
            pointer-events: auto;
          }
        }
      }
    }
    .note {
      padding: var(--padding);
      font-size: var(--el-font-size-base);
      line-height: 1.5;
      cursor: pointer;
      user-select: none;
      position: relative;
      &.active {
        background-color: var(--el-color-primary-light-8);
      }
      &:hover:not(.active) {
        background-color: var(--el-color-info-light-7);
      }
      &:not(:first-child) {
        border-top: var(--el-border);
      }
      .trash {
        position: absolute;
        right: 12px;
        top: 10px;
        color: var(--el-text-color-regular);
      }
      .title {
        color: var(--el-text-color-primary);
        width: calc(100% - 24px);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .time {
        font-size: var(--el-font-size-small);
        color: var(--el-text-color-regular);
      }
      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        max-height: 77px;
        overflow: auto;
        &::-webkit-scrollbar,
        &::-webkit-scrollbar-track {
          background-color: transparent;
        }
        &::-webkit-scrollbar-thumb:active,
        &::-webkit-scrollbar-thumb:hover {
          background-color: var(--el-color-info-light-7) !important;
        }
        &:active::-webkit-scrollbar-thumb,
        &:focus-within::-webkit-scrollbar-thumb,
        &:focus::-webkit-scrollbar-thumb,
        &:hover::-webkit-scrollbar-thumb {
          background-color: var(--el-color-info-light-5);
          border: 4px solid transparent;
          background-clip: content-box;
          border-radius: 10px;
        }
        .tag {
          background-color: var(--el-color-primary-light-9);
          border: var(--el-border);
          border-radius: 10px;
          max-width: 150px;
          display: flex;
          align-items: center;
          padding: 0 5px;
          gap: 4px;

          .tag-color {
            flex-shrink: 0;
            width: 13px;
            aspect-ratio: 1 / 1;
            border-radius: 50%;
          }
          .tag-name {
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }
}
</style>
<style lang="scss">
.el-checkbox__label {
  height: 100%;
  display: flex;
  align-items: center;
}
.tag-item {
  height: 100%;
  display: flex;
  gap: 6px;
  align-items: center;
  pointer-events: none;
  .color {
    flex-shrink: 0;
    width: 13px;
    aspect-ratio: 1 / 1;
    border-radius: 50%;
  }
  .name {
    height: 100%;
    display: flex;
    width: 100px;
    flex-grow: 0;
    flex-shrink: 0;
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
