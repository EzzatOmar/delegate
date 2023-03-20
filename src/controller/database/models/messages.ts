import { connectDb } from "../index";

export type MessageStruct = {
  id: number;
  sender_uid: string | null;
  receiver_uid: string | null;
  payload: string;
  unix_timestamp: number;
  chat_id: number
  parent_id: number | null
}

export async function insertMessage(msg: Omit<MessageStruct, "id" | "unix_timestamp">):Promise<MessageStruct> {
  const db = await connectDb();
  return db.select<MessageStruct[]>(`
    INSERT INTO messages (sender_uid, receiver_uid, payload, chat_id, parent_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `, [msg.sender_uid, msg.receiver_uid, msg.payload, msg.chat_id, msg.parent_id])
  .then(r => r[0]);
}

export async function selectMessages(chat_id: number):Promise<MessageStruct[]> {
  const db = await connectDb();
  return await db.select<MessageStruct[]>(`
  SELECT * FROM messages
  WHERE chat_id = $1
  ORDER BY unix_timestamp DESC;
  `, [chat_id]);
}