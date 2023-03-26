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

export async function selectMessage(id: number):Promise<MessageStruct> {
  const db = await connectDb();
  return await db.select<MessageStruct[]>(`
  SELECT * FROM messages
  WHERE id = $1
  `, [id]).then(r => r[0]);
}

export async function deleteMessageAndSubtree(messageId: number):Promise<void> {
  const db = await connectDb();

  const messagesToDelete = await db.select<{id: number}[]>(`
    WITH RECURSIVE submessages(id) AS (
      SELECT id
      FROM messages
      WHERE id = $1
      UNION ALL
      SELECT messages.id
      FROM messages
      JOIN submessages ON submessages.id = messages.parent_id
    )
    SELECT id FROM submessages;
  `, [messageId]);

  const messagesListStr = messagesToDelete.map(m => m.id).join(', ');
  console.log(messagesListStr);

  // delete messages
  await db.execute(`
    DELETE FROM messages
    WHERE id IN (${messagesListStr});
    `);

}