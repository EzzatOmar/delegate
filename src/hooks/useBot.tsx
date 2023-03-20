import { createStore, SetStoreFunction } from "solid-js/store";
import { v4 } from 'uuid';
import { BotStruct, insertBot, selectBots } from "../controller/database/models/bots";
import { GlobalError } from "../error";
import { QueryResult } from "tauri-plugin-sql-api";
import { openaiNetwork } from "../controller/network";

export type BotState<TSettingConfig = BotConfig, TSettingApiBody = ApiBody> = {
  uid: string;
  name: string;
  description: string;
  apiKey: string | null;
  settings: BotSettings<TSettingConfig, TSettingApiBody>;
};

type ModelType = "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "BINARY";
type ConfigType = "OpenAiChat";
export type BotSettings<TConfig = BotConfig, TApiBody = ApiBody> = {
  provider: string;
  inputType: ModelType[];
  outputType: string[];
  configType: ConfigType;
  config: TConfig;
  api: {
    endpoint: string;
    method: "GET" | "POST";
    headers: { [key: string]: string };
    body?: TApiBody
  },
}

export type BotConfig = {};
export type ApiBody = {};

export type OpenAiConfig = BotConfig & {systemMessage?: string};
export type OpenAiBody = ApiBody & {
  model: string;
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
  stop?: string[] | null;
  max_tokens?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  logit_bias?: { [key: string]: number };
  user?: string;

} ;

export type BotStore = {
  bots: BotState[];
}

export type BotValue = [
  state: BotStore,
  stateFullActions: {
    setState: SetStoreFunction<BotStore>;
    fetchAndSyncBotsFromDb: () => Promise<GlobalError | null>;
    createBot: (args: BotStruct) => Promise<[BotState | null, GlobalError | null]>;
  },
  stateLessActions: {
    toBotState: (args: BotStruct) => BotState;
    toBotSettings: (args: string) => BotSettings;
    buildOpenAiStruct: (args: {apiKey: string}) => BotStruct;
  }
];

const defaultState:BotStore = {
  bots: [],
};

const [state, setState] = createStore( defaultState , {name: "botStore"});

// STATELESS ACTIONS
function buildOpenAiStruct (args: {apiKey: string}):BotStruct {
  let openAiConfig:OpenAiConfig = {};

  let openAiBody:OpenAiBody = {
    model: "gpt-3.5-turbo",
    temperature: 1.0,
    top_p: 1.0,
    n: 1,
    stream: false,
    stop: null,
    max_tokens: undefined,
    presence_penalty: 0.0,
    frequency_penalty: 0.0,
    logit_bias: undefined,
    user: undefined,
  };
  let openAiChatSetting: BotSettings = {
    config: openAiConfig,
    inputType: ["TEXT"],
    outputType: ["TEXT"],
    configType: "OpenAiChat",
    provider: "https://api.openai.com",
    api: {
      endpoint: "https://api.openai.com/v1/chat/completions",
      method: "POST",
      headers: {},
      body: openAiBody,
    }
  }

  let struct:BotStruct = {
    uid: v4(),
    name: "OpenAI ChatGPT",
    description: "OpenAI ChatGPT",
    api_key: args.apiKey,
    settings: JSON.stringify(openAiChatSetting),
  }

  return struct;
}

function toBotSettings(args: string) {
  // TODO: validate JSON
  return JSON.parse(args) as BotSettings;
}

function toBotState(args: BotStruct) {
  const chat:BotState = {
    uid: args.uid,
    name: args.name,
    description: args.description,
    apiKey: args.api_key,
    settings: toBotSettings(args.settings),
  };
  return chat;
};

// STATEFULL ACTIONS

/**
 * Updates the store
 */
async function createBot(args: BotStruct): Promise<[BotState | null, GlobalError | null]> {
  // NOTE: verifiy API key first
  const gErrVerify = await openaiNetwork.verifiyApiKey(args.api_key);
  if(gErrVerify) return [null, gErrVerify];

  let [qr, gErr] = await insertBot(args)
    .then(b => [b, null])
    .catch(err => {
      return [null, {UserAlert: err} as GlobalError];
    }) as [QueryResult | null, GlobalError | null];

  if(gErr) return [null, gErr];
  if(qr!.rowsAffected !== 1) return [null, {UserAlert: "Bot creation failed"} as GlobalError];

  const botState = toBotState(args);
  setState("bots", [...state.bots, botState]);

  return [state["bots"].find(b => b.uid === botState.uid)!, null];
}

/**
 * Updates the store
 */
async function fetchAndSyncBotsFromDb():Promise<GlobalError | null> {
  const [bots, gErr] = await selectBots()
  .then(b => [b, null])
  .catch(err => {
    return [null, {UserAlert: err} as GlobalError];
  }) as [BotStruct[] | null, GlobalError | null];
  if(gErr) return gErr;
  const botStates = bots!.map(toBotState).filter(b => b.uid !== '00000000-0000-0000-0000-000000000000');
  setState("bots", botStates);
  return null;
};



export const useBot = ():BotValue => {
  return [state, { setState, fetchAndSyncBotsFromDb, createBot }, { toBotState, buildOpenAiStruct, toBotSettings }];
}

// expose store to window for debugging
// @ts-ignore
window.storeBot = state;
// @ts-ignore
window.setBot = { setState };