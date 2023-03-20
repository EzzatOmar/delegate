-- Your SQL goes here

CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  sender_uid TEXT REFERENCES bots(uid),
  receiver_uid TEXT REFERENCES bots(uid),
  payload TEXT NOT NULL,
  unix_timestamp INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  parent_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
  UNIQUE (id),
  CHECK ((sender_uid IS NULL AND receiver_uid IS NOT NULL) OR (sender_uid IS NOT NULL AND receiver_uid IS NULL))
);

-- TODO: add trigger listen to insert/update/delete on messages table
-- update chat.last_message_unix_timestamp column