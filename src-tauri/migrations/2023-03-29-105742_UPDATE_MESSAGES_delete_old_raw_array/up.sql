-- Your SQL goes here
-- Remove old message raw data, they are to big to be stored in the database
-- We just remove then, future raw data will be stored more efficiently
-- as we don't add new items on every stream chunk
UPDATE messages SET payload = json_set(payload, '$.raw', '[]');