-- Your SQL goes here
-- We use sqlite FTS5 extension to create a virtual table
-- that indexes the content of the table chats

CREATE VIRTUAL TABLE fts_messages USING fts5(payload, content='messages', content_rowid='id', tokenize='trigram');

CREATE TRIGGER messages_fts_after_insert AFTER INSERT ON messages BEGIN
  INSERT INTO fts_messages(rowid, payload) VALUES (new.id, json_extract(new.payload, '$.text.content'));
END;
CREATE TRIGGER messages_fts_after_delete AFTER DELETE ON messages BEGIN
  INSERT INTO fts_messages(fts_messages, rowid, payload) VALUES('delete', old.id, json_extract(old.payload, '$.text.content'));
END;
CREATE TRIGGER messages_fts_after_update AFTER UPDATE ON messages BEGIN
  INSERT INTO fts_messages(fts_messages, rowid, payload) VALUES('delete', old.id, json_extract(old.payload, '$.text.content'));
  INSERT INTO fts_messages(rowid, payload) VALUES (new.id, json_extract(new.payload, '$.text.content'));
END;

-- FILL THE VIRTUAL TABLE WITH THE EXISTING DATA
INSERT INTO fts_messages(rowid, payload)
SELECT id, json_extract(payload, '$.text.content')
FROM messages;


