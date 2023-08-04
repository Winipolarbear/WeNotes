import db from '../db'
import { Tag } from '../model'

export function addTag(tag: Tag): number {
  const stmt = db.prepare(`INSERT INTO tag (name,color) values(@name, @color);`)
  const info = stmt.run(tag)
  return info.lastInsertRowid
}

export function updateTag(tag: Tag) {
  const stmt = db.prepare(
    `UPDATE tag 
    set name = @name,
    color = @color, 
    position = @position, 
    WHERE id = @id;`
  )
  const info = stmt.run(tag)
  return Boolean(info.changes)
}

export function updateTagName(id: number, name: string) {
  const stmt = db.prepare(
    `UPDATE tag 
    set name = @name
    WHERE id = @id;`
  )
  const info = stmt.run({ name, id })
  return Boolean(info.changes)
}

export function updateTagColor(id: number, color: string) {
  const stmt = db.prepare(
    `UPDATE tag 
    set color = @color
    WHERE id = @id;`
  )
  const info = stmt.run({ color, id })
  return Boolean(info.changes)
}

export function deleteTag(tagId: number) {
  const stmt = db.prepare(
    `DELETE FROM tag
    WHERE id = ?;`
  )
  const info = stmt.run(tagId)
  return Boolean(info.changes)
}
export function getAllTags(): Tag[] {
  const stmt = db.prepare(
    `SELECT id,name,color,position,child_notes_count
    FROM tag
    ORDER BY position DESC;`
  )
  const tags = stmt.all()
  return tags
}

export function getTagById(tagId: number): Tag {
  const stmt = db.prepare(
    `SELECT id,name,color 
    FROM tag
    WHERE id = ?;`
  )
  const tag = stmt.get(tagId)
  return tag
}
export function getTagsByNoteId(noteId: number): Tag[] {
  const stmt = db.prepare(
    `SELECT id,name,color 
    FROM tag
    LEFT OUTER JOIN tag_note ON tag.id = tag_note.tag_id
    WHERE note_id = ?;`
  )
  const tags = stmt.all(noteId)
  return tags
}

export function addTagToNote(noteId: number, tagId: number) {
  const stmt = db.prepare(`INSERT INTO tag_note values(?,?);`)
  const info = stmt.run(noteId, tagId)
  return info.lastInsertRowid
}

export function removeTagFromNote(noteId: number, tagId: number) {
  const stmt = db.prepare(`DELETE FROM tag_note 
  WHERE note_id = ? AND tag_id = ?;`)
  const info = stmt.run(noteId, tagId)
  return Boolean(info.changes)
}
