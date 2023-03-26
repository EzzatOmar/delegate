import { connectDb } from "../index";

export type logStruct = {
  id: number;
  log_type: 'error' | 'warning' | 'debug' | 'info' | 'http_request' | 'http_response';
  unix_timestamp: number;
  message: string;
}

export async function insertLog(log: Omit<logStruct, "id" | "unix_timestamp">):Promise<logStruct> {
  const db = await connectDb();
  return db.select<logStruct[]>(`
  INSERT INTO logs (log_type, message)
  VALUES ($1, $2)
  RETURNING *;
  `, [log.log_type, log.message])
  .then(r => r[0]);
}
