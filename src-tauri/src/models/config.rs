// use crate::schema::{config};
// use diesel::prelude::*;
// use serde::Serialize;

// #[derive(Queryable, Debug, Serialize)]
// pub struct Config {
//     pub key: String,
//     pub value: Vec<u8>,
// }

// #[derive(Insertable)]
// #[diesel(table_name = config)]
// pub struct NewConfig<'a> {
//     pub key: &'a str,
//     pub value: &'a Vec<u8>,
// }
