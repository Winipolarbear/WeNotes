import { defineStore } from 'pinia'
import { Tag, Folder, Note, SpecialNodeID } from '@/types'

export interface CurrentNode {
  type: 'folder' | 'sys' | 'tag'
  id: number
}
export interface CurrentNote extends Note {
  type: 'sys' | 'folder' | 'tag'
  typeId: number
}
export const useFolderStore = defineStore(
  'folder',
  () => {
    const sysFolders = ref<Folder[]>([])
    const folders = ref<Folder[]>([])
    const tags = ref<Tag[]>([])
    async function getFolders() {
      window.api?.getFirstLevelFolders().then((folders: Folder[]) => {
        console.log(folders)
        this.sysFolders = [folders.shift(), folders.shift()]
        this.folders = folders
        console.log('sysFolders', this.sysFolders)
        console.log('folders', this.folders)
      })
    }
    async function getTags() {
      window.api?.getAllTags().then((allTags: Tag[]) => {
        this.tags = allTags
      })
    }

    const currentNode: CurrentNode = reactive({
      type: 'folder',
      id: 2,
    })
    watch([folders, tags], () => {
      const { type, id } = currentNode
      let find = null
      if (type === 'tag') {
        find = tags.value.find((tag) => tag.id === id)
      } else if (type === 'folder') {
        find = folders.value.find((folder) => folder.id === id)
      } else {
        return
      }
      console.log('find', find)
      if (!find) {
        currentNode.type = 'folder'
        currentNode.id = 2
      }
    })
    const findInChildren = (id, arr) => {
      for (const folder of arr) {
        if (folder.id === id) {
          return folder
        } else if (folder?.children?.length > 0) {
          findInChildren(id, folder.children)
        }
      }
      return null
    }
    const node = computed(() => {
      if (currentNode.type === 'tag') {
        return tags.value.find((tag) => tag.id === currentNode.id)
      } else {
        const target = currentNode.type === 'folder' ? folders : sysFolders
        // return findInChildren(currentNode.id, target.value)
        return target.value.find((tag) => tag.id === currentNode.id)
      }
    })

    const search = ref('')
    const notes = ref<Note[]>([])

    async function getNotes(newNode = currentNode) {
      const { type, id } = newNode
      if (type === 'tag') {
        notes.value = await window.api.getNotesByTagId(id, search.value)
      } else if (type === 'sys' && id === SpecialNodeID.ROOT) {
        notes.value = await window.api.getAllNotes(search.value)
      } else {
        notes.value = await window.api.getNotesByFolderId(id, search.value)
      }
      //move note to other folder , change the folder but keep the note selected.
      const find = notes.value.find((note) => note.id === currentNote.value.id)
      if (find) {
        console.log({ find })
        return
      }
      const note = { ...notes.value[0] } as CurrentNote
      console.log('getNote', note)
      console.log(type, id)
      console.log(currentNote.value?.type, currentNote.value?.typeId)
      if (
        currentNote.value?.type !== type ||
        currentNote.value?.typeId !== id ||
        !currentNote.value?.id
      ) {
        note.type = type
        note.typeId = id
        currentNote.value = note
      }
    }

    watch([currentNode, search], async ([newNode]) => {
      getNotes(newNode)
    })
    watch(notes, () => {
      console.log(123123123)
      if (!currentNote.value) return
      const { id } = currentNote.value
      const { type, id: typeId } = currentNode
      const find = notes.value.find((note) => note.id === id)
      if (!find) {
        currentNote.value = {
          ...notes.value?.[0],
          type,
          typeId,
        }
      }
    })
    const currentNote = ref<CurrentNote>()

    watch(currentNote, async (newNote, oldNote) => {
      console.log(123, newNote, oldNote)
      if (newNote?.id !== oldNote?.id && newNote.id) {
        const note = await window.api.getNoteById(newNote.id)
        currentNote.value = {
          ...newNote,
          ...note,
        }
        console.log(currentNote)
      }
    })

    function changeCurrentNote(note: CurrentNote) {
      const { type, id } = currentNode
      note.type = type
      note.typeId = id
      currentNote.value = note
    }

    // watch([notes, () => currentNode.id, () => currentNode.type], (...arg) => {
    //   console.log('bian', arg)
    // })

    function changeCurrentNode(type: 'folder' | 'sys' | 'tag', id: number) {
      currentNode.type = type
      currentNode.id = id
    }

    return {
      sysFolders,
      folders,
      tags,
      currentNode,
      currentNote,
      node,
      notes,
      search,
      changeCurrentNode,
      changeCurrentNote,
      getFolders,
      getTags,
      getNotes,
    }
  },
  {
    persist: {
      enabled: true,
      strategies: [{ storage: localStorage }],
    },
  }
)
