import { batch, createMemo } from "solid-js";
import { createStore, produce, reconcile, SetStoreFunction } from "solid-js/store";
import { ChatStruct, deleteChat, insertChat, selectChats, updateChatTitle, updateSystemMessage } from "../controller/database/models/chats";
import { deleteMessageAndSubtree, insertMessage, MessageStruct, selectMessage, selectMessages, updateMessagePayload } from "../controller/database/models/messages";
import { chatCompletion, chatCompletionStream, CreateChatCompletionChunk } from "../controller/network/openai";
import { GlobalError } from "../error";
import { useAlert } from "./useAlert";
import { BotConfig, BotSettings, BotState, OpenAiBody, OpenAiConfig, useBot } from "./useBot";

export type ChatMessage = {
  id: number;
  senderUid: string | null;
  receiverUid: string | null;
  // one and only one key must be set, application level gurantee
  payload: {
    text?: { content: string },
    raw?: any[],
    audio?: { url: string, duration: number },
    image?: { url: string },
    video?: { url: string, duration: number }
  };
  unixTimestamp: number;
  chatId: number;
  parentId: number | null;
}

export type ChatState = {
  id: number;
  title: string;
  bot_uid: string | null;
  get bot(): BotState | null;
  _messages?: ChatMessage[]; // TODO: this should be a tree
  get messages(): ChatMessage[];
  get config():BotConfig | undefined;
  get api():BotSettings['api'] | undefined;
  lastMessageUnixTimestamp: number;
  settings: ChatSetting;
  selected: boolean;
};

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>> // If property is an array, apply DeepPartial recursively to each item
    : T[P] extends object
    ? DeepPartial<T[P]> // If property is an object, apply DeepPartial recursively to the object
    : T[P] // Otherwise, leave property as-is
};

export type ChatSetting = {
  botSettings: DeepPartial<BotSettings>;
}

export type ChatStore = {
  chats: ChatState[];
}

type CreateChatStruct = Omit<ChatStruct, "id" | "last_message_unix_timestamp" >;

export type ChatValue = [
  state: ChatStore,
  stateFullActions: {
    setState: SetStoreFunction<ChatStore>;
    selectChat: typeof selectChat;
    addMessage: typeof addMessage;
    fetchAndSyncChatsFromDb: typeof fetchAndSyncChatsFromDb;
    createChat: typeof createChat;
    editChatTitle: typeof editChatTitle;
    editSystemMessage: typeof editSystemMessage;
    removeChat: typeof removeChat;
    dropMessageAndChildren: typeof dropMessageAndChildren;
  },
  stateLessActions: {
    toChatState: typeof toChatState;
    toChatmessage: typeof toChatmessage;
    toChatSettings: typeof toChatSettings;
    buildChatStruct: typeof buildChatStruct;
  }
];

const defaultState:ChatStore = {
  chats: [],
};

const [state, setState] = createStore( defaultState , {name: "chatStore"});

// STATEFULL ACTIONS

/**
 * Updates the store
 * Replace this later with a generate updateSettings function
 */
async function editSystemMessage(args: {id: number, systemMessage: string}):Promise<[ChatState | null,  GlobalError | null]> {
  const [chat, gErr] = await updateSystemMessage(args)
  .then(chat => [toChatState(chat), null])
  .catch(err => [null, {UserAlert: err} as GlobalError]) as [ChatState | null, GlobalError | null];

  if(gErr) return [null, gErr];

  // NOTE: in case the chat is not in the store, we should actually add it
  // but this should never happen - just in case
  // @ts-ignore
  setState('chats', c => c.id === chat!.id, 'settings', reconcile(chat?.settings));

  return [state.chats.find(c => c.id === chat!.id)!, null];
}

/**
 * Updates the store
 */
async function dropMessageAndChildren(args: {id: number}) {
  let [message, gErr] = await selectMessage(args.id)
  .then(msg => [msg, null])
  .catch(err => [null, {UserAlert: err} as GlobalError]) as [MessageStruct | null, GlobalError | null];
  if(gErr) return [null, gErr];


  let gErr2 = await deleteMessageAndSubtree(args.id)
  .catch(err => ({UserAlert: err}) as GlobalError);
  if(gErr2) return [null, gErr2];

  const [messages, gErr3] = await selectMessages(message!.chat_id)
  .then(msg => [msg.map(toChatmessage), null])
  .catch(err => [null, {UserAlert: err} as GlobalError]) as [ChatMessage | null, GlobalError | null];

  if(gErr3) return [null, gErr3];

  setState('chats', c => c.id === message!.chat_id, '_messages', messages!);

  return [state.chats.find(c => c.id === message!.chat_id)!, null];
}

/**
 * Updates the store
 */
async function createChat(args: CreateChatStruct):Promise<[ChatState | null,  GlobalError | null]> {
  const [chat, gErr] = await insertChat(args)
    .then(chat => [toChatState(chat), null])
    .catch(err => [null, {UserAlert: err} as GlobalError]) as [ChatState | null, GlobalError | null];

    if(gErr) return [null, gErr];

    setState("chats", [...state.chats, chat!]);

    return [state.chats.find(c => c.id === chat!.id)!, null];
}

/**
 * Updates the store
 */
function selectChat(id: number) {
  batch(() => {
    setState('chats', c => c.id !== id, 'selected', false);
    setState('chats', c => c.id === id, 'selected', true);
  })
}

/**
 * Updates the store
 */
async function editChatTitle(args: {id: number, title: string}):Promise<[ChatState | null,  GlobalError | null]> {
  const [chat, gErr] = await updateChatTitle(args)
  .then(chat => [toChatState(chat), null])
  .catch(err => [null, {UserAlert: err} as GlobalError]) as [ChatState | null, GlobalError | null];

  if(gErr) return [null, gErr];

  // NOTE: in case the chat is not in the store, we should actually add it
  // but this should never happen - just in case
  setState('chats', c => c.id === chat!.id, 'title', chat!.title);

  return [state.chats.find(c => c.id === chat!.id)!, null];
}

/**
 * Updates the store
 * Return null if success, otherwise return the error
 */
async function removeChat(args: {id: number}):Promise<GlobalError | null> {
  const [_, gErr] = await deleteChat(args)
  .then(chat => [chat, null])
  .catch(err => [null, {UserAlert: err} as GlobalError]) as [ChatStruct | null, GlobalError | null];

  if(gErr) return gErr;

  batch(() => {
    setState('chats', chats => chats.filter(c => c.id !== args.id));
    if(state.chats.length > 0 && !state.chats.find(c => c.selected)) {
      selectChat(state.chats[0].id);
    }
  })

  return null;
}

/**
 * Updates the store
 */
function openAiChatCompletionResponseHandler(chat: ChatState, parentMessageId: number, opts?: {onBotResponseHandler?: (params: [response: any, gErr: GlobalError | null]) => void}) {
  const openAiBody = chat.api?.body as OpenAiBody | undefined;
  if(!openAiBody) {
    if(opts?.onBotResponseHandler) opts.onBotResponseHandler([null, {UserAlert: 'No OpenAI api body'}]);
    return;
  }

  
  if(openAiBody.stream) {
    let messageStruct:MessageStruct;
    let inserted = false;

    const onUpsert = async (data: CreateChatCompletionChunk[]) => {
      const responseMessage = data?.map(d => d.choices.at(0)?.delta.content).join('');

      if(!inserted) {
        inserted = true;
        const msgToInsert:  Omit<MessageStruct, "id" | "unix_timestamp"> = {
          chat_id: chat.id,
          sender_uid: chat?.bot?.uid!,
          receiver_uid: null,
          parent_id: parentMessageId,
          payload: JSON.stringify({
              raw: [data],
              text: {
                content: responseMessage,
              }
          })
        };

        messageStruct = await insertMessage(msgToInsert);

      } else {
        if(!messageStruct) return false;
        messageStruct.payload = JSON.stringify({
          raw: [data],
          text: {
            content: responseMessage,
          }
        });
        messageStruct = await updateMessagePayload(messageStruct.id, messageStruct.payload);
      }

      const msg = toChatmessage(messageStruct);
      // update store
      setState('chats', c => c.id === chat.id, '_messages', produce(msgs => {
        if(!msgs) {
          msgs = [msg];
          return;
        }
        const index = msgs.findIndex(m => m.id === msg.id);
        if(index === -1) {
          msgs.push(msg);
        } else {
          msgs[index] = msg;
        }
      }));

      return true;
    };

    chatCompletionStream(chat!, {
      async onDone(data) {


        const success = await onUpsert(data);

        if(success && opts?.onBotResponseHandler) opts.onBotResponseHandler([data, null]);
      },
      async onMessage(data) {
        const success = await onUpsert(data);

      },
      onError(gErr) {
        if(opts?.onBotResponseHandler) opts.onBotResponseHandler([null, gErr]);
      }
    });

  } else {
    chatCompletion(chat!).then(async ([res, gErrResponse]) => {
      if(gErrResponse) {
        if(opts?.onBotResponseHandler) opts.onBotResponseHandler([null, gErrResponse]);
        return;
      }
      const responseMessage = res?.choices?.at(0)?.message?.content;
      if(!responseMessage) {
        if(opts?.onBotResponseHandler) opts.onBotResponseHandler([null, {UserAlert: 'No response from bot'}]);
        return;
      }
  
      const responseChatMessage:  Omit<ChatMessage, "id" | "unixTimestamp"> = {
        chatId: chat.id,
        senderUid: chat?.bot?.uid!,
        receiverUid: null,
        parentId: parentMessageId,
        payload: {
          raw: [res],
          text: {
            content: responseMessage,
          }
        }
      };
      addMessage(responseChatMessage).then(gErr => {
        if(opts?.onBotResponseHandler) opts.onBotResponseHandler([null, gErr]);
      });
  
      if(opts?.onBotResponseHandler) opts.onBotResponseHandler([res, null]);
  
    }).catch(err => {
      if(opts?.onBotResponseHandler) opts.onBotResponseHandler([null, {UserAlert: err}]);
    })
  }



}

/**
 * Updates the store
 */
async function addMessage(message: Omit<ChatMessage, "id" | "unixTimestamp">, opts?: {
    onBotResponseHandler?: (params: [response: any, gErr: GlobalError | null]) => void},
  ):Promise<GlobalError | null> {
  const chat = state.chats.find(chat => chat.id === message.chatId);
  if(!chat) return {UserAlert: 'Chat not found'};

  let msgToInsert:Omit<MessageStruct, "id" | "unix_timestamp">;

  msgToInsert = {
    chat_id: message.chatId,
    sender_uid: message.senderUid,
    receiver_uid: message.receiverUid,
    parent_id: message.parentId,
    payload: JSON.stringify(message.payload),
  };

  const [_, {setAlert}] = useAlert();
  // insert message in db
  const [newMessage, gErr] = await insertMessage(msgToInsert)
  .then(m => ([toChatmessage(m), null]))
  .catch(err => [null, {UserAlert: err} as GlobalError]) as [ChatMessage | null, GlobalError | null];
  if(gErr) return gErr;
  // update store
  setState('chats', c => c.id === message.chatId, '_messages', [...chat.messages, newMessage!]);

  // send message to bot
  if(newMessage?.receiverUid)
    if(chat?.bot?.settings?.api?.endpoint === "https://api.openai.com/v1/chat/completions") {
      openAiChatCompletionResponseHandler(chat, newMessage.id, opts);
    } else {
      setAlert({variant: 'warning', children: `Bot with endpoint ${chat?.bot?.settings.api.endpoint} not supported`, duration: 7000});
    }

  return null;
}

/**
 * Updates the store
 */
const fetchAndSyncChatsFromDb = async ():Promise<GlobalError | null> => {
  const [chats, gerr] = await selectChats()
  .then(b => [b, null])
  .catch(err => {
    return [null, {UserAlert: err} as GlobalError];
  }) as [ChatStruct[] | null, GlobalError | null];
  if(gerr) return gerr;
  const chatStates = chats!.map(toChatState);
  setState("chats", chatStates);
  return null;
};


// STATE LESS ACTIONS

function toChatSettings(args: string):ChatSetting {
  // TODO: validate args
  return JSON.parse(args);
}

function toChatState(args: ChatStruct):ChatState {
  const [botStore] = useBot();
  const [__, {setAlert, handleGlobalError}] = useAlert();

  const chat:ChatState = {
    id: args.id,
    bot_uid: args.bot_uid,
    get config() {
      return (chat?.settings?.botSettings?.config ?? chat?.bot?.settings?.config);
    },
    get api() {
      return (chat?.settings?.botSettings?.api ?? chat?.bot?.settings?.api) as BotSettings['api'] | undefined;
    },
    get bot() {
      if (this.bot_uid) {
        return botStore.bots.find(bot => bot.uid === this.bot_uid) ?? null;
      }
      return null;
    },
    _messages: undefined,
    get messages() {
      // sort by unix_timestamp
      if (this._messages) {
        let sorted = createMemo(() => [...this._messages!].sort((a,b) => a.unixTimestamp - b.unixTimestamp));
        return sorted();
      }
      selectMessages(this.id)
      .then(messages => {
        const [store, sfa, sla] = useChat();
        const chat = store.chats.find(c => c.id === this.id);
        if(!chat) return handleGlobalError({UserAlert: 'Chat not found'});

        sfa.setState('chats', c => c.id === this.id, '_messages', reconcile(messages!.map(m => sla.toChatmessage(m))));
      })
      .catch(err => {
        handleGlobalError({UserAlert: err});
      });

      return [];
    },
    title: args.title,
    lastMessageUnixTimestamp: args.last_message_unix_timestamp,
    settings: toChatSettings(args.settings),
    selected: false,
  };
  return chat;
};

function toChatmessage(args: MessageStruct):ChatMessage {
  // TODO: validate MessageStruct before returning
  const message:ChatMessage = {
    id: args.id,
    senderUid: args.sender_uid,
    receiverUid: args.receiver_uid,
    payload: JSON.parse(args.payload),
    unixTimestamp: args.unix_timestamp,
    chatId: args.chat_id,
    parentId: args.parent_id,
  };
  return message;
};

function buildChatStruct (args: Omit<CreateChatStruct, "settings">, settings: {botSettings: DeepPartial<BotSettings>}):CreateChatStruct {
  let struct:Omit<ChatStruct, "id" | "last_message_unix_timestamp" > = {
    bot_uid: args.bot_uid,
    title: args.title,
    settings: JSON.stringify(settings),
  };

  return struct;
}

export const useChat = ():ChatValue => {
  return [state,
    { setState, selectChat, addMessage, fetchAndSyncChatsFromDb, createChat, editChatTitle, editSystemMessage, removeChat, dropMessageAndChildren },
    { toChatState, toChatmessage, toChatSettings, buildChatStruct }
  ];
}

// expose store to window for debugging
// @ts-ignore
window.storeChat = state;
// @ts-ignore
window.setChat = { setState };