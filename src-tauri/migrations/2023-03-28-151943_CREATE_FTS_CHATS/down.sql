-- This file should undo anything in `up.sql`

DROP TABLE IF EXISTS fts_chats;
DROP TRIGGER IF EXISTS chats_fts_after_update;
DROP TRIGGER IF EXISTS chats_fts_after_delete;
DROP TRIGGER IF EXISTS chats_fts_after_insert;