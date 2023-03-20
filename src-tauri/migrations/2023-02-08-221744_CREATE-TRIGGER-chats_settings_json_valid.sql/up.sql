-- Your SQL goes here

CREATE TRIGGER chats_settings_json_valid_before_insert
BEFORE INSERT ON chats
BEGIN
  SELECT
    CASE
      WHEN NOT json_valid(NEW.settings) THEN
        RAISE (ABORT, 'Invalid JSON inserted in chats.settings')
    END;
END;

CREATE TRIGGER chats_settings_json_valid_before_update
BEFORE UPDATE OF settings ON chats
BEGIN
  SELECT
    CASE
      WHEN NOT json_valid(NEW.settings) THEN
        RAISE (ABORT, 'Invalid JSON updated in chats.settings')
    END;
END;

