import { QueryResult } from "tauri-plugin-sql-api";
import { connectDb } from "../index";

export type ChatStruct = {
  id: number;
  title: string;
  bot_uid: string | null;
  last_message_unix_timestamp: number;
  settings: string;
};

export async function ftsChat(query: string):Promise<ChatStruct[]> {
  const db = await connectDb();
  return db.select<ChatStruct[]>(`
  WITH cte AS (
    SELECT rowid FROM fts_chats($1)
  )
  SELECT *
  FROM chats
  WHERE id IN (SELECT rowid FROM cte)
  `, [query]);
}

export async function insertChat(chat: Omit<ChatStruct, "id" | "last_message_unix_timestamp">):Promise<ChatStruct> {
  const db = await connectDb();
  return db.select<ChatStruct[]>(`
    INSERT INTO chats (title, bot_uid, settings)
    VALUES ($1, $2, $3)
    RETURNING *;
  `, [chat.title, chat.bot_uid, chat.settings])
  .then(r => r[0]);
}

export async function updateSystemMessage(chat: {id: number, systemMessage: string}):Promise<ChatStruct> {
  const db = await connectDb();
  return db.select<ChatStruct[]>(`
    UPDATE chats 
    SET settings = json_set(settings, '$.botSettings.config.systemMessage', $1)
    WHERE id = $2
    RETURNING *;
  `, [chat.systemMessage, chat.id])
  .then(r => r[0]);
}

export async function updateChatTitle(chat: {id: number, title: string}):Promise<ChatStruct> {
  const db = await connectDb();
  return db.select<ChatStruct[]>(`
    UPDATE chats
    SET title = $1
    WHERE id = $2
    RETURNING *;
  `, [chat.title, chat.id])
  .then(r => r[0]);
}

export async function deleteChat(chat: {id: number}):Promise<ChatStruct> {
  const db = await connectDb();
  return db.select<ChatStruct[]>(`
    DELETE FROM chats
    WHERE id = $1
    RETURNING *;
  `, [chat.id])
  .then(r => r[0]);
}

export async function selectChats():Promise<ChatStruct[]> {
  const db = await connectDb();
  return await db.select<ChatStruct[]>("SELECT * FROM chats;");
}