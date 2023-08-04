export default class Note {
  id: number
  folder_id: number
  title: string
  content: string
  scrollbar_position = 0
  create_time: number
  update_time: number
  delete_time: number
  is_pinned: PinnedNote = PinnedNote.FALSE
  constructor(
    folderId: number,
    title: string,
    content?: string,
    scrollbarPosition?: number,
    isPinnedNote?: PinnedNote
  ) {
    this.folder_id = folderId
    this.title = title
    if (content) {
      this.content = content
    }
    if (scrollbarPosition) {
      this.scrollbar_position = scrollbarPosition
    }
    if (isPinnedNote) {
      this.is_pinned = isPinnedNote
    }
  }
}
export enum PinnedNote {
  FALSE = 0,
  TRUE,
}
