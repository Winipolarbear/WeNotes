<template>
  <el-main v-loading="load">
    <header>
      <div class="operation">
        <el-popover
          :visible="operationVisible"
          :width="600"
          placement="bottom-start"
          :hide-after="0"
          :offset="8"
        >
          <template #reference>
            <span @click="operationVisible = true">AAa</span>

            <!-- <span @click="handleClick">AAa</span> -->
          </template>
          <div
            class="operation-container"
            v-click-outside="handleOperationClick"
          >
            <div class="op" @click="handleHeading(1)">title</div>
            <div class="op" @click="handleHeading(2)">subtitle</div>
            <div class="op" @click="handleHeading()">body</div>
            <el-tooltip content="Bold" placement="bottom" :hide-after="0">
              <div class="op op-b" @click="handleBold">B</div>
            </el-tooltip>
            <el-tooltip content="Italic" placement="bottom" :hide-after="0">
              <div class="op op-i" @click="handleItalic">I</div>
            </el-tooltip>
            <el-tooltip content="Strike" placement="bottom" :hide-after="0">
              <div class="op op-icon" @click="HandleStrike">
                <carbon-text-strikethrough
                  style="width: 1.3em; height: 1.3em"
                ></carbon-text-strikethrough>
              </div>
            </el-tooltip>
            <el-tooltip
              content="Inline code"
              placement="bottom"
              :hide-after="0"
            >
              <div class="op op-icon" @click="HandleCode">
                <mdi-code></mdi-code>
              </div>
            </el-tooltip>
            <el-tooltip
              content="Ordered list"
              placement="bottom"
              :hide-after="0"
            >
              <div class="op op-icon" @click="handleOl">
                <pajamas-list-numbered></pajamas-list-numbered>
              </div>
            </el-tooltip>
            <el-tooltip
              content="Unordered list"
              placement="bottom"
              :hide-after="0"
            >
              <div class="op op-icon" @click="handleUl">
                <pajamas-list-bulleted></pajamas-list-bulleted>
              </div>
            </el-tooltip>
            <el-tooltip content="Task" placement="bottom" :hide-after="0">
              <div class="op op-icon" @click="handleTask">
                <pajamas-todo-done
                  style="width: 1.1em; height: 1.1em"
                ></pajamas-todo-done>
              </div>
            </el-tooltip>

            <div>
              <el-popover
                :visible="linkVisible"
                :width="320"
                placement="bottom"
                :hide-after="0"
                :offset="8"
                :teleported="false"
              >
                <template #reference>
                  <div class="op op-icon" @click="linkVisible = true">
                    <el-tooltip
                      content="Add link"
                      placement="bottom"
                      :hide-after="0"
                      ><mdi-link-variant-plus></mdi-link-variant-plus
                    ></el-tooltip>
                  </div>
                </template>
                <div v-click-outside="() => (linkVisible = false)">
                  <el-form
                    label-position="top"
                    :model="linkForm"
                    ref="linkFormRef"
                    :rules="linkRule"
                    :hide-required-asterisk="true"
                  >
                    <el-form-item label="Link" prop="link">
                      <el-input
                        autocomplete="off"
                        placeholder="Link starts with http:// or https://"
                        v-model.trim="linkForm.link"
                      ></el-input>
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="handleLink"
                        >Add</el-button
                      >
                    </el-form-item>
                  </el-form>
                </div>
              </el-popover>
            </div>

            <el-tooltip content="Blockquote" placement="bottom" :hide-after="0">
              <div class="op op-icon" @click="HandleBlockquote">
                <tabler-blockquote
                  style="width: 1.3em; height: 1.3em"
                ></tabler-blockquote>
              </div>
            </el-tooltip>
            <el-tooltip
              content="Insert codeBlock"
              placement="bottom"
              :hide-after="0"
            >
              <div class="op op-icon" @click="HandleCodeBlock">
                <ph-code-block
                  style="width: 1.3em; height: 1.3em"
                ></ph-code-block>
              </div>
            </el-tooltip>
          </div>
        </el-popover>
      </div>
      <div class="title" v-click-outside="changeTitle">
        <!-- <el-color-picker v-model="tagColor" v-if="title && !isTitleEditing" /> -->
        <el-input
          ref="title"
          v-if="isTitleEditing"
          @keydown.enter="changeTitle"
          v-model="currentNote.title"
        />
        <span class="title-text" v-else @click="handleTitleClick">{{
          currentNote?.title
        }}</span>
      </div>
      <div class="right">
        <div
          class="icon preview"
          :class="previewStyleClass"
          @click="handlePreviewClick"
        >
          <el-tooltip content="Preview" placement="bottom" :hide-after="0"
            ><icon-park-outline-preview-open></icon-park-outline-preview-open
          ></el-tooltip>
        </div>

        <div class="icon share" @click="handleShareClick">
          <el-popover
            :width="270"
            placement="bottom-end"
            :hide-after="0"
            :offset="8"
            :visible="shareVisible"
          >
            <template #reference>
              <ep-share @click="shareVisible = true"></ep-share>
            </template>
            <div
              class="operation-container"
              v-click-outside="() => (shareVisible = false)"
            >
              <span class="op" @click="getMarkdown">Markdown</span>
              <span class="op" @click="getTxt">Txt</span>
              <span class="op" @click="getHtml">Html</span>
              <span class="op" @click="getPdf">Pdf</span>
            </div>
          </el-popover>
        </div>
        <div class="icon setting">
          <el-popover
            :width="150"
            placement="bottom-end"
            :hide-after="0"
            :offset="8"
            trigger="click"
            :visible="darkVisible"
          >
            <template #reference>
              <ep-setting @click="darkVisible = true"></ep-setting>
            </template>
            <div
              class="operation-container setting"
              v-click-outside="() => (darkVisible = false)"
            >
              <div>
                <span
                  class="op"
                  @click="toggleDark"
                  :class="{ 'dark-active': !isDark }"
                  >light</span
                >
                <span
                  class="op"
                  @click="toggleDark"
                  :class="{ 'dark-active': isDark }"
                  >dark</span
                >
              </div>
              <div class="op export" @click="handleImportStart">
                Import note
              </div>
            </div>
          </el-popover>
        </div>
      </div>
    </header>
    <main>
      <the-editor-b
        :is-dark="isDark"
        :preview-style="previewStyle"
        ref="editor"
      ></the-editor-b>
    </main>
    <el-dialog
      v-model="importDialog"
      title="Import Note"
      width="500"
      @close="handleFormClose"
    >
      <el-form
        :model="importForm"
        ref="importFormRef"
        :rules="rules"
        :hide-required-asterisk="true"
      >
        <el-form-item label="Title" :label-width="80" prop="title">
          <el-input v-model="importForm.title" autocomplete="off" />
        </el-form-item>
        <el-form-item label="File" :label-width="80" prop="file">
          <el-upload
            class="upload"
            style="width: 80%"
            ref="upload"
            accept=".md,.txt"
            :action="''"
            :auto-upload="false"
            :limit="1"
            :on-exceed="handleExceed"
            :on-change="handleChange"
            :on-remove="handleRemove"
          >
            <template #trigger>
              <el-button type="primary">select file</el-button>
            </template>
            <template #tip>
              <div class="el-upload__tip">txt/md files only.</div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item label="Folder" :label-width="80" prop="folder">
          <el-select
            v-model="importForm.folder"
            filterable
            placeholder="Please select a folder"
          >
            <el-option
              v-for="folder in folders"
              :label="folder.title"
              :value="folder.id"
              :key="folder.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleFormClose">Cancel</el-button>
          <el-button type="primary" @click="handleImport"> Confirm </el-button>
        </span>
      </template>
    </el-dialog>
  </el-main>
</template>
<script lang="ts" setup>
import {
  FormInstance,
  FormRules,
  UploadFile,
  ClickOutside as vClickOutside,
} from 'element-plus'
import TheEditor from '@/components/TheEditor.vue'

import { genFileId } from 'element-plus'
import dayjs from 'dayjs'
import type { UploadInstance, UploadProps, UploadRawFile } from 'element-plus'

import { useFolderStore, useConfigStore, CurrentNote } from '@/store'
import { storeToRefs } from 'pinia'
import { transformHtml } from '@/utils'
import { Note, SpecialNodeID } from '@/types'
const isTitleEditing = ref(false)

const handleTitleClick = () => {
  cache = currentNote.value.title
  isTitleEditing.value = true
  nextTick(() => {
    title.value?.focus()
  })
}
const folderStore = useFolderStore()
const { currentNote, folders, currentNode } = storeToRefs(folderStore)
const { getFolders, changeCurrentNote } = folderStore
const configStore = useConfigStore()
const { previewStyle } = storeToRefs(configStore)
const title = ref()
let cache = ''
const changeTitle = async () => {
  const { title, id } = currentNote.value
  if (!isTitleEditing.value || title.trim() === '') return
  isTitleEditing.value = false
  if (title != cache) {
    await window.api.updateNoteTitle(id, title)
    // currentNote.value.title = title.value
    folderStore.getNotes()
  } else {
    currentNote.value.title = cache
    cache = ''
  }
}
const operationVisible = ref(false)

const handleOperationClick = () => {
  operationVisible.value = false
}

const isDark = useDark()
console.log({ isDark })

const editor = ref<InstanceType<typeof TheEditor> | null>(null)

const previewStyleClass = computed(() => ({
  active: previewStyle.value === 'vertical',
}))
const handlePreviewClick = () => {
  previewStyle.value = previewStyle.value === 'tab' ? 'vertical' : 'tab'
}

const handleHeading = (level?: number) => {
  editor.value?.exec('heading', { level })
  operationVisible.value = false
}

const handleBold = () => {
  editor.value?.exec('bold')
  operationVisible.value = false
}

const handleItalic = () => {
  editor.value?.exec('italic')
  operationVisible.value = false
}
const HandleStrike = () => {
  editor.value?.exec('strike')
  operationVisible.value = false
}
const HandleCode = () => {
  editor.value?.exec('code')
  operationVisible.value = false
}
const HandleBlockquote = () => {
  editor.value?.exec('blockQuote')
  operationVisible.value = false
}
const HandleCodeBlock = () => {
  editor.value?.exec('codeBlock')
  operationVisible.value = false
}
const handleOl = () => {
  editor.value?.exec('orderedList')
  operationVisible.value = false
}
const handleUl = () => {
  editor.value?.exec('bulletList')
  operationVisible.value = false
}
const handleTask = () => {
  editor.value?.exec('taskList')
  operationVisible.value = false
}
const linkVisible = ref(false)
const linkForm = reactive({
  link: '',
})
const linkFormRef = ref<FormInstance>()
const linkRule = reactive<FormRules>({
  link: [
    { required: true, message: 'Please input a link', trigger: 'change' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (
          !/^(https?):\/\/([\w-]+(\.[\w-]+)*\/)*[\w-]+(\.[\w-]+)*\/?(\?([\w\-.,@?^=%&:/~+#]*)+)?/.test(
            value
          )
        ) {
          return callback(new Error('Please input a valid link'))
        }
        return callback()
      },
      trigger: 'change',
    },
  ],
})

const handleLink = async () => {
  console.log(123)

  const valid = await linkFormRef.value.validate()

  if (valid) {
    load.value = true
    try {
      await editor.value.insertLink(linkForm.link)
    } catch (error) {
      console.log(error)
    }
    operationVisible.value = false
    linkFormRef.value.resetFields()
    linkVisible.value = false
    load.value = false
  }
}

const handleShareClick = () => {
  shareVisible.value = true
}
const load = ref(false)
const getHtml = () => {
  load.value = true
  shareVisible.value = false
  const html = transformHtml(currentNote.value.title, editor.value.getHtml())
  window.api
    .saveFile(html, 'html')
    .then(() => {
      ElNotification({
        title: 'Success',
        message: 'Save successfully',
        type: 'success',
        offset: 100,
      })
    })
    .finally(() => (load.value = false))
}
const getPdf = () => {
  // load.value = true
  shareVisible.value = false
  window.print()
  // const markdown = editor.value?.getMarkdown().replaceAll(/\n/g, '\n\n')
  // window.api
  //   .saveFile(markdown, 'pdf')
  //   .then(() => {
  //     ElNotification({
  //       title: 'Success',
  //       message: 'Save successfully',
  //       type: 'success',
  //       offset: 100,
  //     })
  //   })
  //   .finally(() => (load.value = false))
}
const shareVisible = ref(false)
const darkVisible = ref(false)
const toggleDark = () => {
  isDark.value = !isDark.value
  darkVisible.value = false
}
const getMarkdown = () => {
  load.value = true
  shareVisible.value = false
  const markdown = editor.value?.getMarkdown().replaceAll(/\n/g, '\n\n')
  window.api
    .saveFile(markdown)
    .then(() => {
      ElNotification({
        title: 'Success',
        message: 'Save successfully',
        type: 'success',
        offset: 100,
      })
    })
    .finally(() => (load.value = false))
}
const getTxt = () => {
  load.value = true
  shareVisible.value = false
  const markdown = editor.value?.getMarkdown().replaceAll(/\n/g, '\n\n')
  window.api
    .saveFile(markdown, 'txt')
    .then(([success, error]) => {
      if (success) {
        ElNotification({
          title: 'Success',
          message: 'Save successfully',
          type: 'success',
          offset: 100,
        })
      } else if (error) {
        ElNotification({
          title: 'Error',
          message: error.message,
          type: 'error',
          offset: 100,
        })
      }
    })
    .finally(() => (load.value = false))
}
const importDialog = ref(false)
const importFormRef = ref<FormInstance>()
const importForm = reactive({
  title: '',
  folder: SpecialNodeID.DEFAULT_NOTES,
  content: '',
  file: [],
})
const rules = reactive<FormRules>({
  title: [
    { required: true, message: 'Please input note name', trigger: 'blur' },
  ],
  file: [
    {
      required: true,
      message: 'Please upload the note file',
      trigger: 'change',
    },
  ],
  folder: [
    { required: true, message: 'Please select a folder', trigger: 'change' },
  ],
})
const upload = ref<UploadInstance>()

const handleExceed: UploadProps['onExceed'] = (files) => {
  upload.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  upload.value!.handleStart(file)
}
const handleChange = (uploadFile: UploadFile, list) => {
  console.log(uploadFile, list)
  importForm.file = list
  importFormRef.value.validateField('file')
  const { raw } = uploadFile
  const reader = new FileReader()
  reader.readAsText(raw)
  reader.onload = (e) => {
    importForm.content = e.target.result as string
  }
}
const handleRemove = () => {
  importFormRef.value.validateField('file')
}
const handleImportStart = () => {
  importForm.title = dayjs().format('MMMM DD, YYYY, h:mm:ss A')
  importDialog.value = true
}
const handleFormClose = () => {
  importFormRef.value.resetFields()
  importDialog.value = false
}
const handleImport = () => {
  if (!importFormRef) return
  console.log(importForm.file)

  importFormRef.value.validate(async (valid) => {
    if (valid) {
      console.log(importForm)
      const { title, content, folder: folderId } = importForm
      const note = new Note(folderId, title, content)
      const noteId = await window.api.importNote(note)
      currentNode.value.id = folderId
      currentNode.value.type = 'folder'
      note.id = noteId
      changeCurrentNote(note as CurrentNote)
      await getFolders()
      handleFormClose()
    } else {
      return false
    }
  })
}
</script>
<style lang="scss" scoped>
.el-main {
  padding: var(--padding-app-top) 0 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  header {
    padding: 0 12px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    gap: 12px;
    border-bottom: 1px solid var(--el-border-color-darker);
    .operation {
      font-size: 16px;
      color: var(--el-color-primary);
      cursor: pointer;
      user-select: none;

      &::first-letter {
        font-size: 20px;
      }
    }
    .title {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      .title-text {
        user-select: none;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    .right {
      display: flex;
      align-items: center;
      gap: 10px;
      .icon {
        &:hover {
          color: var(--el-text-color-primary);
        }
        transition: color 0.2s;
        color: var(--el-text-color-regular);
        cursor: pointer;
        svg {
          width: 1.5em;
          height: 1.5em;
        }
        &.preview.active {
          color: var(--el-color-primary-light-3);
        }
      }
    }
  }
  main {
    flex: 1;
  }
}
</style>
<style lang="scss">
.operation-container {
  display: flex;
  gap: 8px;
  font-size: 16px;
  align-items: center;
  justify-content: center;
  &.setting {
    flex-direction: column;
    column-gap: 12px;
  }
  .op {
    word-break: keep-all;
    padding: 4px 8px;
    border-radius: 2px;
    cursor: pointer;
    &.dark-active {
      pointer-events: none;
      color: var(--el-text-color-disabled);
    }
  }
  .op.op-b {
    font-weight: 900;
  }
  .op.op-i {
    font-style: italic;
  }
  .op:hover {
    background-color: var(--el-color-primary-light-8);
  }
  .op-icon {
    display: flex;
    align-items: center;
  }
}
</style>
