import Database from 'better-sqlite3'
import { homedir } from 'os'
import { join } from 'path'

import pkg from '../../../package.json'

export const appDirectory = join(homedir(), pkg.name)

const dbFile = join(appDirectory, 'note.db')
const db = new Database(dbFile, {
  verbose: console.log,
})
// db.pragma('recursive_triggers = ON')
// db.pragma('SQLITE_MAX_TRIGGER_DEPTH = 1000')
export const createTable = db.transaction(() => {
  const isExists = db
    .prepare(
      `SELECT * FROM sqlite_master WHERE type='table' AND name = 'folder';`
    )
    .get()
  if (isExists) return
  db.exec(`CREATE TABLE IF NOT EXISTS folder (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "pid" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT -1,
    "child_notes_count" INTEGER NOT NULL DEFAULT 0,
		"child_folders_count" INTEGER NOT NULL DEFAULT 0
  );

	CREATE TRIGGER IF NOT EXISTS after_folder_insert AFTER INSERT 
  ON folder
  BEGIN
			UPDATE folder
			SET position = (
				SELECT IFNULL(MAX(position),-1) + 1
				FROM folder 
				WHERE pid = new.pid
			)
			WHERE id = new.id;
			UPDATE folder 
			SET child_folders_count = (
				SELECT COUNT(id)
				FROM folder 
				WHERE pid = new.pid
			)
			WHERE id = new.pid;
  END;
	
	CREATE TRIGGER IF NOT EXISTS after_folder_delete AFTER DELETE 
  ON folder
  BEGIN
			UPDATE note
			SET folder_id = 1
			WHERE folder_id = old.id;
			UPDATE folder 
			SET child_folders_count = (
				SELECT COUNT(id)
				FROM folder 
				WHERE pid = old.pid
			)
			WHERE id = old.pid;
  END;
	
  INSERT OR IGNORE INTO folder(id,pid,title,child_notes_count) values(0,-1,'All Notes',0);
  INSERT OR IGNORE INTO folder(id,pid,title,child_notes_count) values(1,0,'Trash',0);
  INSERT OR IGNORE INTO folder(id,pid,title,child_notes_count) values(2,0,'Notes',0);
  
  CREATE TABLE IF NOT EXISTS note (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "folder_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "scrollbar_position" INTEGER NOT NULL DEFAULT 0,
    "create_time" INTEGER NOT NULL DEFAULT 0,
    "update_time" INTEGER NOT NULL DEFAULT 0,
    "delete_time" INTEGER NOT NULL DEFAULT 0,
    "is_pinned" INTEGER DEFAULT 0
  );
	
  CREATE TRIGGER IF NOT EXISTS after_note_insert AFTER INSERT 
  ON note
  BEGIN
      UPDATE folder 
      SET child_notes_count = (SELECT COUNT(*) FROM note WHERE folder_id = new.folder_id) 
      WHERE id = new.folder_id;
      UPDATE folder
      SET child_notes_count = (SELECT COUNT(*) FROM note WHERE folder_id != 1)
      WHERE id = 0;
  END;
	
--   CREATE TRIGGER IF NOT EXISTS after_note_update_count_sum AFTER UPDATE 
--   ON note
--   BEGIN
--       UPDATE folder
--       SET child_notes_count = (SELECT COUNT(*) FROM note WHERE folder_id != 1)
--       WHERE id = 0;
--   END;
  
  CREATE TRIGGER IF NOT EXISTS after_note_update_count AFTER UPDATE 
  ON note
	WHEN old.folder_id <> new.folder_id
  BEGIN
      UPDATE folder
      SET child_notes_count = (SELECT COUNT(*) FROM note WHERE folder_id != 1)
      WHERE id = 0;
      UPDATE folder
      SET child_notes_count = (SELECT COUNT(*) FROM note WHERE folder_id = old.folder_id)
      WHERE id = old.folder_id;
      UPDATE folder 
      SET child_notes_count = (SELECT COUNT(*) FROM note WHERE folder_id = new.folder_id) 
      WHERE id = new.folder_id;
  END;

  
  CREATE TRIGGER IF NOT EXISTS after_note_delete AFTER DELETE
  ON note
  BEGIN
      UPDATE folder
      SET child_notes_count = (SELECT COUNT(*) FROM note WHERE folder_id = 1)
      WHERE id = 1;
			DELETE FROM tag_note
			WHERE note_id = old.id;
  END;
	
  CREATE TABLE IF NOT EXISTS "tag" (
    "id"	INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "name"	TEXT NOT NULL,
    "color"	TEXT NOT NULL,
    "child_notes_count"	INTEGER NOT NULL DEFAULT 0,
    "position"	INTEGER NOT NULL DEFAULT -1
  );
	
	CREATE TRIGGER IF NOT EXISTS after_tag_insert AFTER INSERT 
  ON tag
  BEGIN
			UPDATE tag
			SET position = (
				SELECT IFNULL(MAX(position),-1) + 1
				FROM tag
			)
			WHERE id = new.id;
  END;
	
	CREATE TRIGGER IF NOT EXISTS after_tag_delete AFTER DELETE
  ON tag
  BEGIN
			DELETE FROM tag_note
			WHERE tag_id = old.id;
  END;
	
	
  CREATE TABLE IF NOT EXISTS "tag_note" (
    "note_id"	INTEGER NOT NULL,
    "tag_id"	INTEGER NOT NULL,
    UNIQUE(note_id, tag_id ) 
  );
	
  CREATE TRIGGER IF NOT EXISTS after_tag_note_insert AFTER INSERT
  ON tag_note
  BEGIN
      UPDATE tag
      SET child_notes_count = (SELECT COUNT(*) FROM tag_note WHERE tag_id = new.tag_id)
      WHERE id = new.tag_id;
  END;
	
  CREATE TRIGGER IF NOT EXISTS after_tag_note_delete AFTER DELETE
  ON tag_note
  BEGIN
      UPDATE tag
      SET child_notes_count = (SELECT COUNT(*) FROM tag_note WHERE tag_id = old.tag_id)
      WHERE id = old.tag_id;
  END;`)
})
createTable()
export default db
