/* eslint-disable no-unused-vars */
import {
  dialog,
  BrowserWindow,
  ipcMain,
  Menu,
  MenuItemConstructorOptions,
} from 'electron'

import fs from 'fs'

import pkg from '../../package.json'
import { win } from '.'
import {
  addFolder,
  deleteFolderRecursively,
  getFirstLevelFolders,
  getFoldersByPid,
  updateFolder,
  updateFolderTitle,
} from './sqlite/dao/FolderDao'
import {
  addTag,
  addTagToNote,
  deleteTag,
  getAllTags,
  getTagsByNoteId,
  removeTagFromNote,
  updateTag,
  updateTagColor,
  updateTagName,
} from './sqlite/dao/TagDao'
import { Folder, Note, Tag } from './sqlite/model'
import {
  addNote,
  importNote,
  deleteNote,
  getAllNotes,
  getNoteById,
  getNotesByFolderId,
  getNotesByTagId,
  moveNote,
  pinNote,
  updateNote,
  updateNoteTitle,
} from './sqlite/dao/NoteDao'
import { PinnedNote } from './sqlite/model/Note'

import base64Img from 'base64-img'

import { getLinkPreview } from 'link-preview-js'

// eslint-disable-next-line @typescript-eslint/no-var-requires
// const markdownpdf = require('markdown-pdf')

ipcMain.handle('getFirstLevelFolders', async () => getFirstLevelFolders())

ipcMain.handle('getFoldersByPid', async (event, pid: number) =>
  getFoldersByPid(pid)
)

ipcMain.handle('addFolder', async (event, folder: Folder) => addFolder(folder))

ipcMain.handle('updateFolder', async (event, folder: Folder) =>
  updateFolder(folder)
)
ipcMain.handle(
  'updateFolderTitle',
  async (event, title: string, folderId: number) =>
    updateFolderTitle(title, folderId)
)

ipcMain.handle('deleteFolderRecursively', async (event, folderId: number) =>
  deleteFolderRecursively(folderId)
)

ipcMain.handle('getAllTags', async () => getAllTags())

ipcMain.handle('addTag', async (event, tag: Tag) => addTag(tag))

ipcMain.handle('updateTag', async (event, tag: Tag) => updateTag(tag))

ipcMain.handle('updateTagName', async (event, id: number, name: string) =>
  updateTagName(id, name)
)

ipcMain.handle('updateTagColor', async (event, id: number, color: string) =>
  updateTagColor(id, color)
)

ipcMain.handle('deleteTag', async (event, tagId: number) => deleteTag(tagId))

ipcMain.handle('addTagToNote', async (event, noteId: number, tagId: number) =>
  addTagToNote(noteId, tagId)
)

ipcMain.handle(
  'removeTagFromNote',
  async (event, noteId: number, tagId: number) =>
    removeTagFromNote(noteId, tagId)
)

ipcMain.handle('addNote', async (event, note: Note) => addNote(note))

ipcMain.handle('importNote', async (event, note: Note) => importNote(note))

ipcMain.handle('updateNote', async (event, note: Note) => updateNote(note))

ipcMain.handle(
  'updateNoteTitle',
  async (event, noteId: number, title: string) => updateNoteTitle(noteId, title)
)

ipcMain.handle('pinNote', async (event, noteId: number, isPin: boolean) =>
  pinNote(noteId, isPin)
)

ipcMain.handle('moveNote', async (event, noteId: number, folderId: number) =>
  moveNote(noteId, folderId)
)
ipcMain.handle('deleteNote', async (event, noteId: number) =>
  deleteNote(noteId)
)
ipcMain.handle(
  'getNotesByFolderId',
  async (event, folderId: number, search: string) =>
    getNotesByFolderId(folderId, search)
)
ipcMain.handle('getAllNotes', async (event, search: string) =>
  getAllNotes(search)
)

ipcMain.handle(
  'getNotesByTagId',
  async (event, tagId: number, search: string) => getNotesByTagId(tagId, search)
)
ipcMain.handle('getNoteById', async (event, noteId: number) =>
  getNoteById(noteId)
)

ipcMain.handle('getAppName', async () => pkg.name)

ipcMain.handle('getPlatform', async () => process.platform)

ipcMain.handle('isMaximized', async () => win.isMaximized())

ipcMain.on('minimize', () => {
  win.minimize()
})
ipcMain.on('maximize', () => {
  win.maximize()
})
ipcMain.on('restore', () => {
  win.unmaximize()
})
ipcMain.on('close', () => {
  win.close()
})
ipcMain.on('show-context-menu', (event, id: number, isTag: boolean) => {
  const template = isTag
    ? ([
        {
          label: 'Rename Tag',
          click: () => {
            event.sender.send('renameTag', id)
          },
        },
        { type: 'separator' },
        // {
        //   label: 'Change Tag Color',
        //   click: () => {
        //     event.sender.send('changeTagColor', id)
        //   },
        // },
        // { type: 'separator' },
        {
          label: 'Delete Tag',
          click: () => {
            event.sender.send('deleteTag', id)
          },
        },
      ] as MenuItemConstructorOptions[])
    : ([
        {
          label: 'Rename Folder',
          click: () => {
            event.sender.send('renameFolder', id)
          },
        },
        { type: 'separator' },
        // {
        //   label: 'Add Subfolder',
        //   click: () => {
        //     event.sender.send('addFolder', id)
        //   },
        // },
        // { type: 'separator' },
        {
          label: 'Delete Folder',
          click: () => {
            event.sender.send('deleteFolder', id)
          },
        },
      ] as MenuItemConstructorOptions[])
  const menu = Menu.buildFromTemplate(template)
  menu.popup({ window: BrowserWindow.fromWebContents(event.sender) })
})

ipcMain.on(
  'show-note-context-menu',
  async (event, id: number, is_pinned: PinnedNote) => {
    console.log(id, is_pinned)
    const template = [
      {
        label: is_pinned === PinnedNote.TRUE ? 'Unpin Note' : 'Pin Note',
        click: () => {
          event.sender.send('pinNote', id, is_pinned)
        },
      },
      { type: 'separator' },
      {
        label: 'Tag Note ＞',
        click: () => {
          event.sender.send('tagNote', id)
        },
      },

      { type: 'separator' },
      {
        label: 'Move Note ＞',
        click: () => {
          event.sender.send('moveNote', id)
        },
      },
    ] as MenuItemConstructorOptions[]
    const menu = Menu.buildFromTemplate(template)
    menu.popup({ window: BrowserWindow.fromWebContents(event.sender) })
  }
)

ipcMain.handle('saveFile', async (event, fileContent, type) => {
  type = ['md', 'html', 'txt', 'pdf'].includes(type) ? type : 'md'
  const filters = [
    {
      name: type,
      extensions: [type],
    },
  ]
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'export notes',
    buttonLabel: 'save',
    filters,
  })
  if (!canceled && filePath) {
    try {
      if (type === 'pdf') {
        // await transformPdf(fileContent, filePath)
      } else {
        fs.writeFileSync(filePath, fileContent)
      }
    } catch (error) {
      console.log(error)
      return [false, error]
    }
    return [true]
  }
  return [false]
})

ipcMain.handle('getLinkInfo', async (event, link: string) => {
  const info = await getLinkPreview(link, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
    },
    timeout: 10000,
    followRedirects: 'follow',
  })

  const favicons = info.favicons
  const icoFind = favicons.find((favicon) => favicon.endsWith('favicon.ico'))
  let url = icoFind
  if (!icoFind) {
    const pngFind = favicons.find((favicon) => favicon.endsWith('.png'))
    url = pngFind ? pngFind : favicons[0]
  }

  let base64
  try {
    base64 = await getImgBase64(url)
  } catch (error) {
    console.log(error)
  }
  if (base64) {
    ;(info as any).base64 = base64
  }
  return info
})

// function transformPdf(fileContent, path) {
//   return new Promise((res) => {
//     markdownpdf().from.string(fileContent).to(path, res)
//   })
// }

function getImgBase64(url) {
  return new Promise((res, rej) => {
    if (!url) rej(new Error('no url'))
    base64Img.requestBase64(url, function (err, data, body) {
      if (err) rej(err)
      res(body)
    })
  })
}
