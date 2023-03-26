-- Your SQL goes here


CREATE TABLE chats (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  title TEXT NOT NULL DEFAULT 'New chat',
  bot_uid TEXT REFERENCES bots (uid) ON DELETE SET NULL,
  last_message_unix_timestamp INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  settings TEXT NOT NULL
);