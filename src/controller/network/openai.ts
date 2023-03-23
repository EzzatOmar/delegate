import { GlobalError } from '../../error';
import { Body } from "@tauri-apps/api/http"
import { BotState, OpenAiBody, OpenAiConfig } from '../../hooks/useBot';
import { ChatState } from '../../hooks/useChat';
import { unwrap } from 'solid-js/store';
import { fetch } from './help';

// https://github.com/openai/openai-openapi

export async function verifiyApiKey (apiKey: string): Promise<GlobalError | null> {

  return await fetch<{error: GlobalError['OpenAiError']}>('https://api.openai.com/v1/models', {
    method: 'GET',
    timeout: 30,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  })
  .then(r => {
    if (r.status === 200) {
      return null;
    } else {
      return {
        UserAlert: `${r.data?.error?.message}`,
        OpenAiError: r.data.error,
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

export async function chatCompletion(chat: ChatState):Promise<[CreateChatCompletionResponse | null, GlobalError | null]> {
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
  if(import.meta.env.VITE_LOG === 'DEBUG') console.log('chatCompletion REQUEST', {endpoint, method, body});

  return await fetch<CreateChatCompletionResponse>(endpoint, {
    method,
    timeout: 120,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: body ? Body.json(body): undefined
  }).then(r => {
    if(import.meta.env.VITE_LOG === 'DEBUG') console.log('chatCompletio RESPONSE', r);
    if (r.status === 200) {
      return [r.data, null];
    } else {
      let err = (r.data as any).error as GlobalError['OpenAiError'];
      return [null, {
        UserAlert: `${err?.type} ${err?.message}`,
        OpenAiError: err,
      } as GlobalError];
    }
  }).catch(err => ([null, {UserAlert: err} as GlobalError])) as [CreateChatCompletionResponse | null, GlobalError | null];

}