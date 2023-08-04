<template>
  <div class="editor" ref="editorRef" />
</template>

<script lang="ts" setup>
import Editor from '@toast-ui/editor'
import type { EditorCore, PreviewStyle } from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'

import 'prismjs/themes/prism.css'
import '@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight.css'

import codeSyntaxHighlight from '@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight-all.js'

import { useFolderStore, CurrentNote } from '@/store'
import { storeToRefs } from 'pinia'
import { Note, SpecialNodeID } from '@/types'

import dayjs from 'dayjs'

let editorEl = null
const editorRef = ref<HTMLDivElement | null>(null)
const editor = ref<EditorCore | null>(null)
// let e = null
const exec = (operateKey: string, payload?: Record<string, any>) =>
  editorEl?.exec(operateKey, payload)

const getCanvasData = async (
  link: string,
  title = '',
  description = '',
  base64: string
) => {
  const canvas = document.createElement('canvas')
  canvas.height = 74
  canvas.width = 700
  const ctx = canvas.getContext('2d')
  const getAdjustedText = (text) => {
    let clip = false
    while (ctx.measureText(text).width > canvas.width - 103) {
      text = text.slice(0, -1)
      clip = true
    }
    if (clip) text += '...'
    return text
  }
  ctx.beginPath()
  ctx.fillStyle = '#f7f7f7'
  ctx.lineJoin = 'round'
  const rect = ctx?.roundRect ? ctx.roundRect.bind(ctx) : ctx.rect.bind(ctx)
  rect(1, 1, canvas.width - 3, canvas.height - 3, 8)
  ctx.fill()
  ctx.beginPath()
  ctx.fillStyle = '#303133'
  ctx.font = '15px arial,sans-serif'
  ctx.fillText(getAdjustedText(title), 90, 22)
  ctx.beginPath()
  ctx.fillStyle = '#606266'
  ctx.font = '13px arial,sans-serif'
  ctx.fillText(getAdjustedText(description), 90, 42)
  ctx.beginPath()
  ctx.fillStyle = '#909399'
  ctx.font = '12px arial,sans-serif'
  ctx.fillText(getAdjustedText(link), 90, 62)
  if (base64) {
    await new Promise((res, rej) => {
      const img = document.createElement('img')
      img.onload = () => {
        ctx.drawImage(img, 0, 0, img.width, img.height, 10, 5, 64, 64)
        res(void 0)
      }
      img.onerror = rej
      img.src = base64
    })
  }
  return canvas.toDataURL('image/png')
}

const insertLink = async (link: string) => {
  try {
    const info = await window.api.getLinkInfo(link)
    const { title = '', description = '', base64 } = info
    const result = await getCanvasData(link, title, description, base64)
    const mdContent = `

![${title}](${result})
[${link}](${link})  

`
    editorEl.insertText(mdContent)
  } catch (error) {
    editorEl.insertText(`

[${link}](${link})

    `)
  }
}
defineExpose({
  exec,
  getHtml: () => editorEl?.getHTML(),
  getMarkdown: () => editorEl?.getMarkdown(),
  insertLink,
})

interface editorProp {
  value?: string
  scrollTop?: number
  previewStyle?: PreviewStyle
}

const props = withDefaults(defineProps<editorProp>(), {
  value: '',
  scrollTop: 0,
  previewStyle: 'tab',
})

const folderStore = useFolderStore()
const { currentNote, currentNode } = storeToRefs(folderStore)
const { getFolders, getTags, getNotes, changeCurrentNote } = folderStore

watch(currentNote, async () => {
  const { id, content, scrollbar_position } = currentNote.value
  console.log({ content, scrollbar_position })
  editorEl?.setMarkdown('')
  if (id) {
    editorEl.setMarkdown(content)
    setTimeout(() => {
      editorEl.setScrollTop(scrollbar_position)
      editorEl.blur()
    }, 20)
    // nextTick(() => {
    //   editorEl.setScrollTop(scrollbar_position)
    //   editorEl.blur()
    // })
  }
  isEdit.value = false
})

watch(
  () => props.previewStyle,
  (previewStyle) => {
    editorEl.changePreviewStyle(previewStyle)
  }
)

const isEdit = ref(false)
watch(isEdit, (newArg, oldArg) => {
  if (newArg && !oldArg) {
    console.log('isEdit')
    getNotes()
  }
})

onMounted(() => {
  editorEl = new Editor({
    el: editorRef.value as HTMLDivElement,
    previewStyle: props.previewStyle,
    height: '100%',
    previewHighlight: true,
    initialValue: currentNote.value?.content,
    referenceDefinition: true,
    hideModeSwitch: true,
    initialEditType: 'markdown',
    usageStatistics: false,
    autofocus: false,
    plugins: [codeSyntaxHighlight],
    toolbarItems: [],
    linkAttributes: {
      target: '_blank',
    },
  })
  editorEl.on('load', () => {
    editorEl.setScrollTop(currentNote.value?.scrollbar_position)
  })
  editorEl.on('keydown', async () => {
    isEdit.value = true
    if (!currentNote.value.id) {
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
  })
  const save = async () => {
    if (!isEdit.value) {
      return
    }
    const { id, folder_id } = currentNote.value
    const content = editorEl.getMarkdown()
    const scrollbar_position = editorEl.getScrollTop()

    await window.api.updateNote({
      id,
      folder_id,
      content,
      scrollbar_position,
    })
  }
  const handleChange = useDebounceFn(save, 50)
  editorEl.on('change', handleChange)

  // e = new Editor({
  //   el: editorRef.value as HTMLDivElement,
  //   previewStyle: props.previewStyle,
  //   height: '100%',
  //   initialValue: value,
  //   hideModeSwitch: true,
  //   initialEditType: 'markdown',
  //   usageStatistics: false,
  //   autofocus: false,
  //   plugins: [codeSyntaxHighlight],
  // })
})
</script>

<style lang="scss" scoped>
.editor {
  height: 100%;
  border: none;
}
</style>
<style lang="scss">
.editor {
  .toastui-editor-defaultUI {
    border: none;
    font-size: 16px;
    .toastui-editor-toolbar {
      height: 0;
      display: none;
      overflow: hidden;
      .toastui-editor-defaultUI-toolbar {
        background-color: var(--el-bg-color-page);
        border-bottom: 1px solid var(--el-border-color-darker);
        button {
          border: 1px solid var(--el-border-color-darker);
        }
      }
    }
    .toastui-editor-md-container,
    .toastui-editor-ww-container {
      background-color: var(--el-bg-color-page);
    }
    .ProseMirror {
      color: var(--el-text-color-primary);
    }
    .toastui-editor-main-container {
      color: var(--el-text-color-primary);
      .toastui-editor-contents {
        p,
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          color: var(--el-text-color-primary);
        }
        h1,
        h2 {
          border-color: var(--el-color-info);
        }
        pre {
          background-color: var(--el-color-info-light-8);
          code {
            color: inherit;
            white-space: pre-wrap;
            background-color: transparent;
          }
        }
        blockquote {
          border-left: 4px solid var(--el-text-color-secondary);
          color: var(--el-text-color-secondary);
          p {
            color: inherit;
          }
        }
        code {
          color: var(--el-color-danger);
          background-color: var(--el-color-danger-light-8);
        }
        del {
          color: var(--el-text-color-placeholder);
        }
        .token.operator,
        .token.entity,
        .token.url,
        .language-css .token.string,
        .style .token.string {
          color: #9a6e3a;
          background: inherit;
        }
        table {
          border: 1px solid var(--el-border-color-darker);
          color: var(--el-text-color-primary);
          tr {
            th {
              border-top: 1px solid var(--el-border-color);
              &:first-of-type {
                border-left: 1px solid var(--el-text-color-placeholder);
              }
              &:last-of-type {
                border-right: 1px solid var(--el-text-color-placeholder);
              }
            }
          }
          th {
            border: 1px solid var(--el-border-color-darker);
            background-color: var(--el-color-info-dark-2);
            color: var(--el-bg-color-page);
          }
          td {
            border: 1px solid var(--el-border-color-darker);
          }
        }
      }
    }

    .toastui-editor-md-code-block-line-background {
      background-color: var(--el-color-info-light-8);
    }
    a {
      color: var(--el-color-primary);
    }
    .toastui-editor-main {
      .toastui-editor-md-splitter {
        background-color: var(--el-border-color-darker);
      }
    }
    .toastui-editor-md-preview {
      padding-bottom: 30px;
      p {
        word-break: break-all;
      }
    }
    .ProseMirror,
    .toastui-editor-md-preview {
      font-size: 18px;
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
    }
    .toastui-editor-md-delimiter,
    .toastui-editor-md-thematic-break,
    .toastui-editor-md-link,
    .toastui-editor-md-table,
    .toastui-editor-md-block-quote {
      color: var(--el-color-info);
    }
    .toastui-editor-md-link.toastui-editor-md-link-desc.toastui-editor-md-marked-text,
    .toastui-editor-md-list-item-style.toastui-editor-md-list-item-odd {
      color: var(--el-color-primary);
    }
    .toastui-editor-md-block-quote .toastui-editor-md-marked-text,
    .toastui-editor-md-list-item .toastui-editor-md-meta {
      color: var(--el-color-info-dark-2);
    }
    .toastui-editor-md-table .toastui-editor-md-table-cell {
      color: var(--el-text-color-primary);
    }
    .toastui-editor-md-list-item-style.toastui-editor-md-list-item-even {
      color: var(--el-color-danger);
    }
  }
}
</style>
