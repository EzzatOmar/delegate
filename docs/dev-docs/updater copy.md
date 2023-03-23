# Database  

Sqlite is used. The default location is in app data dir.
Diesel is used for db migrations.  

`diesel migration generate <MIRGATION_NAME>`  
Run in src-tauri.
This will create a folder in src-tauri/migrations/<date-MIGRATION_NAME> with 
two files. up.sql & down.sql. 

On startup Delegate will automatically apply the latest migrations.  