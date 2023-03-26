import { QueryResult } from "tauri-plugin-sql-api";
import { ErrorString } from "../../../error";
import { connectDb } from "../index";

export type BotStruct = {
  uid: string;
  name: string;
  description: string;
  api_key: string;
  settings: string;
}

export async function insertBot(bot: BotStruct):Promise<QueryResult> {
  const db = await connectDb();
  return db.execute(`
    INSERT INTO bots (uid, name, description, api_key, settings)
    VALUES ($1, $2, $3, $4, $5);
  `, [bot.uid, bot.name, bot.description, bot.api_key, bot.settings]);
}

export async function selectBots():Promise<BotStruct[]> {
  const db = await connectDb();
  return await db.select<BotStruct[]>("SELECT * FROM bots;");
}