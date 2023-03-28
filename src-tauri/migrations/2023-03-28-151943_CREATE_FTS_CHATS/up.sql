-- Your SQL goes here
-- We use sqlite FTS5 extension to create a virtual table
-- that indexes the content of the table chats

CREATE VIRTUAL TABLE fts_chats USING fts5(title, content='chats', content_rowid='id', tokenize='trigram');

CREATE TRIGGER chats_fts_after_insert AFTER INSERT ON chats BEGIN
  INSERT INTO fts_chats(rowid, title) VALUES (new.id, new.title);
END;
CREATE TRIGGER chats_fts_after_delete AFTER DELETE ON chats BEGIN
  INSERT INTO fts_chats(fts_chats, rowid, title) VALUES('delete', old.id, old.title);
END;
CREATE TRIGGER chats_fts_after_update AFTER UPDATE ON chats BEGIN
  INSERT INTO fts_chats(fts_chats, rowid, title) VALUES('delete', old.id, old.title);
  INSERT INTO fts_chats(rowid, title) VALUES (new.id, new.title);
END;

-- FILL THE VIRTUAL TABLE WITH THE EXISTING DATA
INSERT INTO fts_chats(rowid, title)
SELECT id, title
FROM chats;


