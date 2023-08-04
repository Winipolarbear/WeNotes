import { defineStore } from 'pinia'
import type { PreviewStyle } from '@toast-ui/editor'
export const useConfigStore = defineStore('config', {
  state: () => {
    return {
      folderWidth: 200,
      noteWidth: 200,
      folderHide: false,
      previewStyle: 'tab' as PreviewStyle,
    }
  },
  actions: {
    changeFolderWidth(width: number) {
      this.folderWidth = width
    },
    changeNoteWidth(width: number) {
      this.noteWidth = width
    },
    toggleFolder() {
      this.folderHide = !this.folderHide
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        storage: localStorage,
      },
    ],
  },
})
