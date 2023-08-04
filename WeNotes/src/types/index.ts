export interface TreeNode {
  id: number
  title: string
  pid: number
  position: number
  child_notes_count: number
  child_folders_count: number
}
export enum PinnedNote {
  FALSE = 0,
  TRUE,
}
export enum NodeType {
  Note = 0,
  FOLDER,
}
export class Note {
  id?: number
  folder_id: number
  title: string
  content?: string
  scrollbar_position = 0
  create_time?: number
  update_time?: number
  delete_time?: number
  is_pinned: PinnedNote = PinnedNote.FALSE
  tags?: Tag[]
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
export class Folder {
  id?: number
  pid: number
  title: string
  position?: number
  child_notes_count?: number
  child_folders_count?: number
  constructor(pid: number, title: string, position?: number) {
    this.pid = pid
    this.title = title
    if (position) {
      this.position = position
    }
  }
}

export class Tag {
  id?: number
  name: string
  color: string
  child_notes_count?: number
  position?: number
  constructor(name: string, color: string) {
    this.name = name
    this.color = color
  }
}
export enum SpecialNodeID {
  ROOT = 0,
  TRASH,
  DEFAULT_NOTES,
}

export type Node = Pick<TreeNode, 'id' | 'title' | 'child_notes_count'> & {
  isTag: boolean
}
