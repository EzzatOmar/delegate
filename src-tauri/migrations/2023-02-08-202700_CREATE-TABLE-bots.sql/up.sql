-- Your SQL goes here

CREATE TABLE bots (
  uid TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  api_key TEXT,
  settings TEXT NOT NULL
);
