import db from '../db'
import { Note } from '../model'
import { PinnedNote } from '../model/Note'
import { SpecialFolderId } from './FolderDao'
import { getTagsByNoteId } from './TagDao'

export function addNote(note: Note): number {
  const stmt = db.prepare(
    `INSERT INTO note (folder_id, title ,create_time,update_time) values(@folder_id, @title, @create_time,@update_time);`
  )
  const now = new Date().getTime()
  note.create_time = now
  note.update_time = now
  const info = stmt.run(note)
  return info.lastInsertRowid
}
export function importNote(note: Note): number {
  const stmt = db.prepare(
    `INSERT INTO note (folder_id, title, content,create_time,update_time) values(@folder_id, @title,@content, @create_time,@update_time);`
  )
  const now = new Date().getTime()
  note.create_time = now
  note.update_time = now
  const info = stmt.run(note)
  return info.lastInsertRowid
}

export function updateNote(note: Note) {
  const stmt = db.prepare(
    `UPDATE note 
    set folder_id = @folder_id,
    content = @content, 
    scrollbar_position = @scrollbar_position,
    update_time = @update_time
    WHERE id = @id;`
  )
  const now = new Date().getTime()
  note.update_time = now
  const info = stmt.run(note)
  return Boolean(info.changes)
}

export function updateNoteTitle(noteId: number, title: string) {
  const stmt = db.prepare(
    `UPDATE note 
    set title = ?,
    update_time = ?
    WHERE id = ?;`
  )
  const now = new Date().getTime()
  const info = stmt.run(title, now, noteId)
  return Boolean(info.changes)
}

export function pinNote(noteId: number, isPin = true) {
  const stmt = db.prepare(
    `UPDATE note 
    set is_pinned = ?
    WHERE id = ?;`
  )
  const is_pinned = isPin ? PinnedNote.TRUE : PinnedNote.FALSE
  const info = stmt.run(is_pinned, noteId)
  return Boolean(info.changes)
}

export function moveNote(noteId: number, folderId: number) {
  const stmt = db.prepare(
    `UPDATE note 
    set folder_id = ?
    WHERE id = ?;`
  )
  const info = stmt.run(folderId, noteId)
  return Boolean(info.changes)
}

export function deleteNote(noteId: number) {
  const stmt = db.prepare(
    `DELETE FROM note 
    WHERE id = ?;`
  )
  const info = stmt.run(noteId)
  return Boolean(info.changes)
}
function escapeSearch(text) {
  text = text.replace(/(%|_|\/)/g, '/$1')
  text = text.replace(/'/, "''")
  return `%${text}%`
}
export function getNotesByFolderId(folderId: number, search = ''): Note[] {
  const stmt = db.prepare(
    `SELECT id,folder_id,title,create_time,update_time,is_pinned 
  FROM note
  WHERE folder_id = ? and (content like ? escape '/' or title like ? escape '/')
  ORDER BY is_pinned DESC,update_time DESC;`
  )
  search = escapeSearch(search)
  const notes = stmt.all(folderId, search, search)
  for (const note of notes) {
    const noteId = note.id
    const tags = getTagsByNoteId(noteId)
    note.tags = tags
  }
  return notes
}

export function getAllNotes(search = ''): Note[] {
  const stmt = db.prepare(
    `SELECT id,folder_id,title,create_time,update_time,is_pinned 
  FROM note
  WHERE folder_id != ${SpecialFolderId.TRASH} and (content like ? escape '/' or title like ? escape '/')
  ORDER BY is_pinned DESC,update_time DESC;`
  )
  search = escapeSearch(search)
  const notes = stmt.all(search, search)
  for (const note of notes) {
    const noteId = note.id
    const tags = getTagsByNoteId(noteId)
    note.tags = tags
  }
  return notes
}

export function getNotesByTagId(tagId: number, search = ''): Note[] {
  const stmt = db.prepare(
    `SELECT id,folder_id,title,create_time,update_time,is_pinned 
  FROM note
  LEFT OUTER JOIN tag_note ON note.id = tag_note.note_id
  WHERE tag_id = ? and (content like ? escape '/' or title like ? escape '/')
  ORDER BY is_pinned DESC,update_time DESC;`
  )
  search = escapeSearch(search)
  const notes = stmt.all(tagId, search, search)
  for (const note of notes) {
    const noteId = note.id
    const tags = getTagsByNoteId(noteId)
    note.tags = tags
  }
  return notes
}

export function getNoteById(noteId: number): Note {
  const stmt = db.prepare(
    `SELECT id,folder_id,title,content,create_time,update_time,scrollbar_position,is_pinned 
FROM note
WHERE id = ?;`
  )
  const note = stmt.get(noteId)
  console.log({ note })
  note.tags = getTagsByNoteId(note.id)
  return note
}
