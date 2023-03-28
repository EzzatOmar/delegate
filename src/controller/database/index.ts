import Database from "tauri-plugin-sql-api";
const defaultDbPath = import.meta.env.VITE_DELEGATE_DATABASE_URL;

let db: Database;

export async function connectDb() {
  if(db) return db;
  const dbPath = defaultDbPath || 'delegate.sqlite';
  db = await Database.load(`sqlite:${dbPath}`);
  return db;
}

export async function getVersion() {
  const db = await connectDb();
  const version = await db.select<{version: string}[]>("SELECT sqlite_version() as version");
  return version.at(0);
}
