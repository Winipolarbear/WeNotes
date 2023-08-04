/* eslint-disable no-unused-labels */
import { contextBridge, ipcRenderer } from 'electron'

import { Folder, Note, Tag } from '../main/sqlite/model'
import { PinnedNote } from '../main/sqlite/model/Note'

const getAllTags = () => ipcRenderer.invoke('getAllTags')

const getFirstLevelFolders = () => ipcRenderer.invoke('getFirstLevelFolders')

const getFoldersByPid = (pid: number) =>
  ipcRenderer.invoke('getFoldersByPid', pid)

const addFolder = (folder: Folder) => ipcRenderer.invoke('addFolder', folder)

const updateFolder = (folder: Folder) =>
  ipcRenderer.invoke('updateFolder', folder)

const updateFolderTitle = (title: string, folderId: number) =>
  ipcRenderer.invoke('updateFolderTitle', title, folderId)

const deleteFolderRecursively = (folderId: number) =>
  ipcRenderer.invoke('deleteFolderRecursively', folderId)

const addTag = (tag: Tag) => ipcRenderer.invoke('addTag', tag)

const updateTag = (tag: Tag) => ipcRenderer.invoke('updateTag', tag)

const updateTagName = (id: number, name: string) =>
  ipcRenderer.invoke('updateTagName', id, name)

const updateTagColor = (id: number, color: string) =>
  ipcRenderer.invoke('updateTagColor', id, color)

const deleteTag = (tagId: number) => ipcRenderer.invoke('deleteTag', tagId)

const addTagToNote = (noteId: number, tagId: number) =>
  ipcRenderer.invoke('addTagToNote', noteId, tagId)

const removeTagFromNote = (noteId: number, tagId: number) =>
  ipcRenderer.invoke('removeTagFromNote', noteId, tagId)

const addNote = (note: Note) => ipcRenderer.invoke('addNote', note)

const importNote = (note: Note) => ipcRenderer.invoke('importNote', note)

const updateNote = (note: Note) => ipcRenderer.invoke('updateNote', note)

const updateNoteTitle = (noteId, title) =>
  ipcRenderer.invoke('updateNoteTitle', noteId, title)

const pinNote = (noteId: number, isPin: boolean) =>
  ipcRenderer.invoke('pinNote', noteId, isPin)

const moveNote = (noteId: number, folderId: number) =>
  ipcRenderer.invoke('moveNote', noteId, folderId)

const deleteNote = (noteId: number) => ipcRenderer.invoke('deleteNote', noteId)

const getNotesByFolderId = (folderId: number, search: string) =>
  ipcRenderer.invoke('getNotesByFolderId', folderId, search)

const getAllNotes = (search: string) =>
  ipcRenderer.invoke('getAllNotes', search)

const getNotesByTagId = (tagId: number, search: string) =>
  ipcRenderer.invoke('getNotesByTagId', tagId, search)

const getNoteById = (noteId: number) =>
  ipcRenderer.invoke('getNoteById', noteId)

const getAppName = () => ipcRenderer.invoke('getAppName')

const getPlatform = () => ipcRenderer.invoke('getPlatform')

const isMaximized = () => ipcRenderer.invoke('isMaximized')

const minimize = () => ipcRenderer.send('minimize')
const maximize = () => ipcRenderer.send('maximize')
const restore = () => ipcRenderer.send('restore')
const close = () => ipcRenderer.send('close')

const showContextMenu = (id: number, isTag = false) =>
  ipcRenderer.send('show-context-menu', id, isTag)

const showNoteContextMenu = (id: number, is_pinned: PinnedNote) =>
  ipcRenderer.send('show-note-context-menu', id, is_pinned)

const onRenameFolder = (callback) => ipcRenderer.on('renameFolder', callback)

const onAddFolder = (callback) => ipcRenderer.on('addFolder', callback)

const onDeleteFolder = (callback) => ipcRenderer.on('deleteFolder', callback)
const onRenameTag = (callback) => ipcRenderer.on('renameTag', callback)

const onDeleteTag = (callback) => ipcRenderer.on('deleteTag', callback)

const onChangeTagColor = (callback) =>
  ipcRenderer.on('changeTagColor', callback)

const onTagNote = (callback) => ipcRenderer.on('tagNote', callback)

const onPinNote = (callback) => ipcRenderer.on('pinNote', callback)

const onMoveNote = (callback) => ipcRenderer.on('moveNote', callback)

const getLinkInfo = (link: string) => ipcRenderer.invoke('getLinkInfo', link)

const saveFile = (fileContent, type = 'md') =>
  ipcRenderer.invoke('saveFile', fileContent, type)

export const API = {
  getAllTags,
  getFirstLevelFolders,
  getFoldersByPid,
  addFolder,
  updateFolder,
  updateFolderTitle,
  deleteFolderRecursively,
  addTag,
  updateTag,
  updateTagName,
  updateTagColor,
  deleteTag,
  addTagToNote,
  removeTagFromNote,
  addNote,
  importNote,
  updateNote,
  updateNoteTitle,
  pinNote,
  moveNote,
  deleteNote,
  getNotesByFolderId,
  getAllNotes,
  getNotesByTagId,
  getNoteById,
  getAppName,
  getPlatform,
  isMaximized,
  minimize,
  maximize,
  restore,
  close,
  showContextMenu,
  showNoteContextMenu,
  onRenameFolder,
  onAddFolder,
  onDeleteFolder,
  onRenameTag,
  onDeleteTag,
  onChangeTagColor,
  onTagNote,
  onPinNote,
  onMoveNote,
  getLinkInfo,
  saveFile,
}

contextBridge.exposeInMainWorld('api', API)
