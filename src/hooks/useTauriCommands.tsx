import { invoke } from "@tauri-apps/api";
import { ChatState, ChatMessage, useChat } from "./useChat";
import { BotState, useBot } from "./useBot";
import { batch } from "solid-js";
import { produce, reconcile } from "solid-js/store";

// NOTE: placeholder once we need tauri IPC calls

type FnReturnProps = {
}

export const useTauriCommands = ():[undefined, FnReturnProps] => {

  return [undefined, {
  }];
}