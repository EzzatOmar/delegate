use diesel::{prelude::*, sqlite::SqliteConnection};
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};

use crate::{get_state};

pub fn establish_connection() -> Result<SqliteConnection, ConnectionError> {
  let db_path = get_state().lock().unwrap().database_url.clone();
  let mut conn = SqliteConnection::establish(&db_path)?;

  diesel::sql_query("PRAGMA foreign_keys = ON;")
    .execute(&mut conn)
    .map_err(|err| ConnectionError::BadConnection(err.to_string()))?;

  diesel::sql_query("PRAGMA journal_mode = WAL;")
    .execute(&mut conn)
    .map_err(|err| ConnectionError::BadConnection(err.to_string()))?;

  diesel::sql_query("PRAGMA synchronous = NORMAL;")
    .execute(&mut conn)
    .map_err(|err| ConnectionError::BadConnection(err.to_string()))?;

  Ok(conn)
}

fn run_migrations() {
  let mut conn = establish_connection().unwrap();

  pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("./migrations");
  conn.run_pending_migrations(MIGRATIONS).unwrap();
}

pub fn init_database() {

  run_migrations();

}