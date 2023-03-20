#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod global_state;
mod global_error;
mod controller;
mod tauri_commands;
mod models;
mod schema;
mod database;
use log::info;
use dotenvy::dotenv;
use std::env;
use crate::{database::{init_database}};
use std::sync::Mutex;

lazy_static::lazy_static! {
    static ref STATE: Mutex<AppState> = Mutex::new(AppState::new());
}

fn get_state() -> &'static Mutex<AppState> {
    &STATE
}

struct AppState {
    database_url: String,
}
impl AppState {
    fn new() -> Self {
        Self {
            database_url: String::new(),
        }
    }
}

fn main() {
    dotenv().ok();

    let log_level = env::var("RUST_LOG").unwrap_or("info".to_string());
    env_logger::init_from_env(env_logger::Env::default().default_filter_or(&log_level));
    info!("Starting Tauri application...");
    info!("Database initialized");
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .manage(global_state::GlobalState(Mutex::new(global_state::StateStruct {
        })))
        .setup(|setup| {
            let config = setup.config();
            let app_data_dir = tauri::api::path::app_data_dir(&config).unwrap();
            let database_url = match env::var("VITE_DELEGATE_DATABASE_URL") {
                Ok(val) => app_data_dir.join(val),
                Err(_e) => {
                  app_data_dir.join("delegate.sqlite")
                }
            };
            // acquire a write lock to modify the state
            STATE.lock().unwrap().database_url = database_url.to_str().unwrap().to_string();
            // create folder if it doesn't exist
            std::fs::create_dir_all(app_data_dir.parent().unwrap()).unwrap();

            init_database();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
