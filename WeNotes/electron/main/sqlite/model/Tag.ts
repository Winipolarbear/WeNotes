export default class Tag {
  id: number
  name: string
  color: string
  child_notes_count: number
  position: number
  constructor(name: string, color: string) {
    this.name = name
    this.color = color
  }
}
