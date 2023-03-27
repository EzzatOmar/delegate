import { encoding_for_model, Tiktoken } from "@dqbd/tiktoken";
import { unwrap } from 'solid-js/store';
import { GlobalError } from '../../error';
import { OpenAiBody, OpenAiConfig } from '../../hooks/useBot';
import { ChatState } from '../../hooks/useChat';
import { insertLog, logStruct } from "../database/models/logs";
import { fetch as customFetch } from './help';

// https://github.com/openai/openai-openapi

export async function verifiyApiKey(apiKey: string): Promise<GlobalError | null> {
  // <{error: GlobalError['OpenAiError']}>
  return await customFetch('https://api.openai.com/v1/models', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  })
  .then(async r => {
    if (r.status === 200) {
      return null;
    } else {
      const body:{error: GlobalError['OpenAiError']} = await r.json();
      return {
        UserAlert: `${body.error?.message}`,
        OpenAiError: body.error,
    } as GlobalError;
    }
  })
  .catch(err => {
    return {UserAlert: err} as GlobalError;
  });
};

type CreateChatCompletionResponse = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {index?: number, message?: {role: string, content: string}, finish_reason?: string}[];
  usage?: {prompt_tokens: number, completion_tokens: number, total_tokens: number};
}

function reduceMessageLength(messages: { role: string; content: string; }[], maxLength: number, enc: Tiktoken):  { role: string; content: string; }[] {
  const encoded = messages.map(m => enc.encode(m.content))
  const totalLength = encoded.reduce((a, b) => a + b.length, 0);
  if(totalLength <= maxLength) return messages;
  else {
    if(messages.length > 1) {
      // delete element in index 1
      messages.splice(1, 1);
      return reduceMessageLength(messages, maxLength, enc);
    } else {
      return [];
    }
  }

}

function prepareChatData(chat: ChatState): [{endpoint:string, method:"GET"|"POST", body:OpenAiBody, apiKey:string|null}|null, GlobalError | null] {
  if(chat.bot?.settings.configType !== 'OpenAiChat') return [null, {UserAlert: 'Bot must be of configType OpenAiChat'}];

  const botSystemMessage = (chat: ChatState) => chat?.bot?.settings?.config && (chat?.bot?.settings?.config as OpenAiConfig)?.systemMessage;
  const chatSystemMessage = (chat: ChatState) => chat?.settings?.botSettings?.config && (chat?.settings?.botSettings.config as OpenAiConfig)?.systemMessage;

  const systemMessage = chatSystemMessage(chat) ?? botSystemMessage(chat) ?? "You are a helpful assistant.";
  const apiKey = chat.bot.apiKey;
  let {endpoint, method, body: _body} = unwrap(chat.bot.settings.api);
  let body:OpenAiBody & {messages: {role: string, content: string}[]} = _body as any;

  if(body) {
    body.messages = [
      {"role": "system", "content": systemMessage},
      ...chat.messages.map(m => ({role: m.senderUid === null ? 'user' : 'assistant', content: m.payload.text?.content ?? ''})),
    ];
  }
  try {
    const enc = encoding_for_model((chat.api!.body! as OpenAiBody).model as any);
    body.messages = reduceMessageLength(body.messages, 3800, enc);

    enc.free();

  } catch (error) {
    console.error(error);
  }

  if(import.meta.env.VITE_LOG === 'DEBUG') console.log('chatCompletion REQUEST', {endpoint, method, body});

  // NOTE: the object must be readonly but the underlining solid store gets mutated, workaround
  return [JSON.parse(JSON.stringify({endpoint, method, body, apiKey})), null];
}

export async function chatTitle(chat: ChatState):Promise<string> {
  const [chatData, gErr] = prepareChatData(chat);
  if(chatData) {
    chatData.body.stream = false;
    // @ts-ignore
    const [_, ...msgs] = chatData.body.messages;

    // @ts-ignore
    chatData.body.messages = [
      {"role": "system", "content": "You are a title generator. You take a conversation between an user and their assistant as input and generate a short title for it. Less than 5 words."},
      {"role": "user", "content": msgs.map((m:{role: string, content: string}) => {
        if(m.role === 'user') {
          return `USER: \n${m.content}`
        } else {
          return `ASSISTANT: \n${m.content}`
        }
      }).join('\n\n') + '-----\nReturn a short title for this conversation.'},
    ]

    return await customFetch(chatData.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${chatData.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chatData.body)
    }).then(async r => {
      const body:CreateChatCompletionResponse = await r.json();
      if (r.status === 200) {
        let title = body.choices[0].message?.content;
        if(title && title.length < 100) {
          title = title.trim();
          // remove surrounding quotes
          if(title.startsWith('"') && title.endsWith('"')) {
            return title.slice(1, -1);
          } else if(title.startsWith("'") && title.endsWith("'")) {
            return title.slice(1, -1);
          }

          return title;
        }
        throw new Error('title invalid');
      } else {
        throw new Error('chatCompletion failed');
      }
    })
  

  }
  throw new Error('chatData is null');

}

export async function chatCompletion(chat: ChatState):Promise<[CreateChatCompletionResponse | null, GlobalError | null]> {
  const [chatData, gErr] = prepareChatData(chat);

  if(gErr) return [null, gErr];
  const {endpoint, method, body, apiKey} = chatData!;

  return await customFetch(endpoint, {
    method,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  }).then(async r => {
    if(import.meta.env.VITE_LOG === 'DEBUG') console.log('chatCompletio RESPONSE', r, await r.clone().json());
    if (r.status === 200) {
      const body:CreateChatCompletionResponse = await r.json();
      return [body, null];
    } else {
      let err = (r as any).error as GlobalError['OpenAiError'];
      return [null, {
        UserAlert: `${err?.type} ${err?.message}`,
        OpenAiError: err,
      } as GlobalError];
    }
  }).catch(err => ([null, {UserAlert: err} as GlobalError])) as [CreateChatCompletionResponse | null, GlobalError | null];

}

export type CreateChatCompletionChunk = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {index?: number, delta: {content?: string, role?: string}, finish_reason?: string}[];
  usage?: {prompt_tokens: number, completion_tokens: number, total_tokens: number};
}

export async function chatCompletionStream(chat: ChatState, cb: {onError: (gErr: GlobalError) => void; onMessage: (data: CreateChatCompletionChunk[]) => void; onDone: (data: CreateChatCompletionChunk[]) => void;}) {
  const [chatData, gErr] = prepareChatData(chat);
  if(gErr) return cb.onError(gErr);

  if(!chatData) return cb.onError({UserAlert: 'chatData is null'});

  const { apiKey, body, endpoint, method } = chatData;

  const log: Omit<logStruct, "id" | "unix_timestamp">  = {
    log_type: "http_request",
    message: JSON.stringify({
      url:endpoint,
      method,
      headers: {
        'Authorization': `<MASKED>`,
        'Content-Type': 'application/json',
      }
    })
  };

  insertLog(log).catch(err => console.error(err));

  await fetch(endpoint, {
    method,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }).then(async response => {
    console.log(response)
    if(!response.body) return;
    if(response.status !== 200) {
      let err = (await response.json() as any).error as GlobalError['OpenAiError'];
      const gErr = {
        UserAlert: `${err?.type} ${err?.message}`,
        OpenAiError: err,
      } as GlobalError;
      cb.onError(gErr);
      return;
    }

    const headers: {[key:string]: string} =[...response.headers.entries()].reduce((acc, [key, value]) => ({...acc, [key]: value}), {});
    const status = response.status;
    const statusText = response.statusText;

    const reader = response.body.getReader();
    let rawMessage: CreateChatCompletionChunk[] = [];
    const decoder = new TextDecoder();
    reader.read().then(function processResult(result) {
      const chunks = decoder.decode(result.value, {stream: !result.done})
      .split('\n')
      .filter(line => line.length > 0)
      .map(line => {
        line = line.substring(6).trim();
        if(line === '[DONE]') {
          return undefined;
        } else {
          return JSON.parse(line) as CreateChatCompletionChunk
        }
      }).filter(line => line !== undefined) as CreateChatCompletionChunk[];

      chunks.forEach(chunk => {
        // process result
        if(chunk.choices[0].delta) {
          rawMessage.push(chunk);
          cb.onMessage(rawMessage);
        }
      })
      if (result.done) {

        // reduce rawMessages into a single message, move all deltas into a single array
        const delta = rawMessage.map(chunk => chunk.choices.at(0)?.delta);
        const first = rawMessage.at(0) ?? {};
        const body: any = Object.assign(first, {delta})

        const log:Omit<logStruct, "id" | "unix_timestamp"> = {
          log_type: "http_response",
          message: JSON.stringify({body, status, statusText, headers})
        }
        insertLog(log).catch(err => console.error(err));
        cb.onDone(rawMessage);
        return;
      }
      reader.read().then(processResult);
    }).catch(err => {
      console.error('error', err);
      cb.onError({UserAlert: JSON.stringify(err ?? "Error")} as GlobalError);
    });
  }).catch(err => {
    console.error('error', err);
    cb.onError({UserAlert: err} as GlobalError);
  })
}