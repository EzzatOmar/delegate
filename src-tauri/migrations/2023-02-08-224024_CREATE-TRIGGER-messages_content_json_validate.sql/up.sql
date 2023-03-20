-- Your SQL goes here

CREATE TRIGGER messages_payload_json_valid_before_insert
BEFORE INSERT ON messages
BEGIN
  SELECT
    CASE
      WHEN NOT json_valid(NEW.payload) THEN
        RAISE (ABORT, 'Invalid JSON')
    END;
END;

CREATE TRIGGER messages_payload_json_valid_before_update
BEFORE UPDATE OF payload ON messages
BEGIN
  SELECT
    CASE
      WHEN NOT json_valid(NEW.payload) THEN
        RAISE (ABORT, 'Invalid JSON')
    END;
END;

-- TODO: Add trigger preven nested cycling references parent_id