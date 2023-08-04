import db from '../db'
import { Folder } from '../model'

export enum SpecialFolderId {
  ROOT = 0,
  TRASH,
  DEFAULT_FOLDER,
}

export function addFolder(folder: Folder): number {
  const stmt = db.prepare(
    `INSERT INTO folder(pid,title) 
    values(@pid,@title);`
  )
  const info = stmt.run(folder)
  return info.lastInsertRowid
}

export function updateFolder(folder: Folder) {
  const stmt = db.prepare(
    `UPDATE folder 
    set pid = @pid,
    title = @title, 
    position = @position
    WHERE id = @id;`
  )
  const info = stmt.run(folder)
  return Boolean(info.changes)
}
export function updateFolderTitle(title: string, folderId: number) {
  const stmt = db.prepare(
    `UPDATE folder 
    SET title = ?
    WHERE id =?;`
  )
  const info = stmt.run(title, folderId)
  return Boolean(info.changes)
}

export function deleteFolder(folderId: number) {
  const stmt = db.prepare(
    `DELETE FROM folder 
    WHERE id = ?;`
  )
  const info = stmt.run(folderId)
  return Boolean(info.changes)
}

export function getFoldersByPid(pid: number): Folder[] {
  const stmt = db.prepare(
    `SELECT id,pid,title,position,child_notes_count,child_folders_count
    FROM folder
    WHERE pid = ?
    ORDER BY position DESC;`
  )
  const result = stmt.all(pid)
  const folders = result.map((folder) => {
    const f = {
      ...folder,
    }
    if (folder.child_folders_count > 0) {
      f.children = []
    }
    return f
  })
  return folders
}

export function getFirstLevelFolders() {
  const rootFolder = getFoldersByPid(-1)[0]
  const folders = getFoldersByPid(SpecialFolderId.ROOT)
  const result = []
  let trashFolder, defaultFolder
  folders.forEach((folder: Folder) => {
    const { id } = folder
    if (id === SpecialFolderId.TRASH) {
      trashFolder = folder
    } else if (id === SpecialFolderId.DEFAULT_FOLDER) {
      defaultFolder = folder
    } else {
      result.push(folder)
    }
  })
  result.unshift(rootFolder, trashFolder, defaultFolder)
  return result
}

export function deleteFolderRecursively(folderId: number) {
  deleteFolder(folderId)
  const sonFolders = getFoldersByPid(folderId)
  for (const { id } of sonFolders) {
    deleteFolderRecursively(id)
  }
}
