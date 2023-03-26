-- This file should undo anything in `up.sql`

DROP TRIGGER IF EXISTS messages_content_json_valid_before_insert;
DROP TRIGGER IF EXISTS messages_content_json_valid_before_update;