-- Your SQL goes here

CREATE TRIGGER bots_settings_json_valid_before_insert
BEFORE INSERT ON bots
BEGIN
  SELECT
    CASE
      WHEN NOT json_valid(NEW.settings) THEN
        RAISE (ABORT, 'Invalid JSON inserted in bots.settings')
    END;
END;

CREATE TRIGGER bots_settings_json_valid_before_update
BEFORE UPDATE OF settings ON bots
BEGIN
  SELECT
    CASE
      WHEN NOT json_valid(NEW.settings) THEN
        RAISE (ABORT, 'Invalid JSON updated in bots.settings')
    END;
END;

