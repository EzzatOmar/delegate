-- Your SQL goes here

CREATE TABLE logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  log_type TEXT CHECK(log_type IN ('error', 'warning', 'debug', 'info', 'http_request', 'http_response')) NOT NULL,
  unix_timestamp INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  message TEXT NOT NULL
);

CREATE TRIGGER logs_message_json_valid_before_insert
BEFORE INSERT ON logs
BEGIN
  SELECT
    CASE
      WHEN NOT json_valid(NEW.message) THEN
        RAISE (ABORT, 'Invalid JSON')
    END;
END;

CREATE TRIGGER logs_message_json_valid_before_update
BEFORE UPDATE OF message ON logs
BEGIN
  SELECT
    CASE
      WHEN NOT json_valid(NEW.message) THEN
        RAISE (ABORT, 'Invalid JSON')
    END;
END;
