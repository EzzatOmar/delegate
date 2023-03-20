// https://docs.diesel.rs/master/diesel_migrations/macro.embed_migrations.html#automatic-rebuilds
fn main() {
  println!("cargo:rerun-if-changed=./migrations");
}