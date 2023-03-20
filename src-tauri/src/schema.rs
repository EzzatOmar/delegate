// @generated automatically by Diesel CLI.

diesel::table! {
    bots (uid) {
        uid -> Text,
        name -> Text,
        description -> Text,
        api_key -> Nullable<Text>,
        settings -> Text,
    }
}

diesel::table! {
    chats (id) {
        id -> Integer,
        title -> Text,
        bot_uid -> Nullable<Text>,
        last_message_unix_timestamp -> Integer,
        settings -> Text,
    }
}

diesel::table! {
    config (key) {
        key -> Text,
        value -> Binary,
    }
}

diesel::table! {
    messages (id) {
        id -> Integer,
        sender_uid -> Nullable<Text>,
        receiver_uid -> Nullable<Text>,
        payload -> Text,
        unix_timestamp -> Integer,
        chat_id -> Integer,
        parent_id -> Nullable<Integer>,
    }
}

diesel::joinable!(chats -> bots (bot_uid));
diesel::joinable!(messages -> chats (chat_id));

diesel::allow_tables_to_appear_in_same_query!(
    bots,
    chats,
    config,
    messages,
);
