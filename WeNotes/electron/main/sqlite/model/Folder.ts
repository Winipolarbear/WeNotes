export default class Folder {
  id: number
  pid: number
  title: string
  position: number
  child_notes_count: number
  child_folders_count: number
  constructor(pid: number, title: string, position?: number) {
    this.pid = pid
    this.title = title
    if (position) {
      this.position = position
    }
  }
}
