import { Accessor, createEffect, createSignal, For, Match, onCleanup, onMount, Setter, Show, Switch } from "solid-js";
import { createTiptapEditor } from 'solid-tiptap';
import Doc from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text';
import HardBreak from '@tiptap/extension-hard-break';
import History from '@tiptap/extension-history';
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { lowlight } from 'lowlight/lib/core'
import { Editor, Extension } from "@tiptap/core";
import { htmlEncode } from "js-htmlencode";
import hljs from "highlight.js/lib/common";
import Spinner from "../../base-components/Spinner";
import { useAlert } from "../../hooks/useAlert";
import { ChatMessage, ChatState, useChat } from "../../hooks/useChat";
import { OpenAiConfig } from "../../hooks/useBot";
import Svg from "../../base-components/SvgContainer";
import Button from "../../base-components/Button";

// register tiptap syntax highlighter
hljs.listLanguages().forEach(lang => {
    const langModule = hljs.getLanguage(lang);
    if (langModule) lowlight.registerLanguage(lang, () => langModule);
});

function Message(props: { message: ChatMessage, left?: boolean }) {
    let editor: () => Editor | undefined;
    let editorDiv: HTMLDivElement;

    onMount(async () => {

        const formatText = (text: string) => {
            const regex = /```\w*\s*([\s\S]*?)\s*```/g;
            text = text.replace(regex, '<pre><code>$1</code></pre>');
            const regex2 = /\n/g;
            return text.replace(regex2, '<br>');
        }
        editor = createTiptapEditor(() => ({
            element: editorDiv!,
            extensions: [
                Doc,
                Paragraph,
                Text,
                HardBreak,
                CodeBlockLowlight.configure({
                    lowlight
                }),
                // custom
            ],
            content: formatText(htmlEncode(props.message.payload.text?.content ?? '')),
            editable: false,
            autofocus: true,
            editorProps: {
                attributes: {
                }
            }
        }));
    })

    onCleanup(() => {
        editor()?.destroy();
    })
// TODO: here switch between left and right on arg, look current implementation
    return <div ref={editorDiv!} 
    
    class="message bg-yellow-800 p-2 rounded-lg my-1 ml-32"></div>
}

function MessageLeft(props: { message: ChatMessage }) {
    return <div class="bg-gray-700 p-2 rounded-lg my-1 mr-32">{props.message.payload.text?.content}</div>
}

function MessageRight(props: { message: ChatMessage }) {
    let editor: () => Editor | undefined;
    let editorDiv: HTMLDivElement;

    onMount(async () => {

        const formatText = (text: string) => {
            const regex = /```\w*\s*([\s\S]*?)\s*```/g;
            text = text.replace(regex, '<pre><code>$1</code></pre>');
            const regex2 = /\n/g;
            return text.replace(regex2, '<br>');
        }
        editor = createTiptapEditor(() => ({
            element: editorDiv!,
            extensions: [
                Doc,
                Paragraph,
                Text,
                HardBreak,
                CodeBlockLowlight.configure({
                    lowlight
                }),
                // custom
            ],
            content: formatText(htmlEncode(props.message.payload.text?.content ?? '')),
            editable: false,
            autofocus: true,
            editorProps: {
                attributes: {
                }
            }
        }));
    })

    onCleanup(() => {
        editor()?.destroy();
    })


    console.log(props.message.payload.text?.content)
    return <div ref={editorDiv!} class="bot-response bg-yellow-800 p-2 rounded-lg my-1 ml-32"></div>
}


const botSystemMessage = (chat: ChatState) => chat?.bot?.settings?.config && (chat?.bot?.settings?.config as OpenAiConfig)?.systemMessage;
const chatSystemMessage = (chat: ChatState) => chat?.settings?.botSettings?.config && (chat?.settings?.botSettings.config as OpenAiConfig)?.systemMessage;

function Header(props: { chat: ChatState, setConfigView: Setter<boolean>, configView: Accessor<boolean> }) {

    return <h1 class="inline-flex items-baseline content-center gap-2 py-1 max-h-[2rem]">
        <Show when={props.configView()} fallback={
            <Svg name="gear" class="my-auto mr-2 cursor-pointer hover:text-blue-400" size="lg" onClick={e => {
                props.setConfigView(true);
            }} />
        }>
            <Svg name="arrowLeft" class="my-auto mr-2 cursor-pointer hover:text-blue-400" size="lg" onClick={e => {
                props.setConfigView(false);
            }} />
        </Show>
        <span class="max-h-8 truncate">{props.chat?.bot?.name} - </span>
        <span class="truncate max-w-md">
            {chatSystemMessage(props.chat) ?? botSystemMessage(props.chat)}
        </span>

    </h1>
}

function ChatConfigView(props: { chat: ChatState }) {
    const [_, { editSystemMessage }] = useChat();
    const [__, { handleGlobalError }] = useAlert();
    let systemMessageEditor: () => Editor | undefined;
    let systemMessageEditorDiv: HTMLDivElement;

    onMount(async () => {
        systemMessageEditor = createTiptapEditor(() => ({
            element: systemMessageEditorDiv!,
            extensions: [
                Doc,
                Paragraph,
                Text,
                HardBreak,
                History,
                // custom
            ],
            content: chatSystemMessage(props.chat) ?? botSystemMessage(props.chat),
            autofocus: true,
            editorProps: {
                attributes: {
                    class: 'bg-stone-600', // better to use css styles
                }
            }
        }));
    })

    onCleanup(() => {
        systemMessageEditor()?.destroy();
    })

    const onSave = async () => {
        const systemMessage = systemMessageEditor()?.getText();
        if (systemMessage) {
            let [chat, gErr] = await editSystemMessage({ id: props.chat.id, systemMessage });
            if (gErr) handleGlobalError(gErr);
        }
    }

    return <div>
        <label>System message - prepended on every message send.
            <a rel="noopener" href="https://prompts.chat/#prompts" target="_blank" class="text-blue-400 hover:text-blue-600 text-sm">Prompt ideas</a>

            <br />
            Instruct the bot how to behave
        </label>

        <div class="ml-2 my-2">
            <div ref={systemMessageEditorDiv!}></div>
        </div>
        <br />
        <div class="inline-flex">
            <Button size="lg" variant="primary" onClick={onSave}>Save</Button>
        </div>
    </div>
}

function MessageActions(props: { message: ChatMessage }) {
    const [_, {dropMessageAndChildren}] = useChat();

    return <div class="w-12 pt-4">
        <Svg name="trash" class="cursor-pointer hover:text-blue-400" onClick={e => {
            dropMessageAndChildren({id: props.message.id});
        }} />
    </div>
}

function ChatView(props: { chat: ChatState }) {
    const [__, { addMessage }, { }] = useChat();

    let scrollableDiv: HTMLDivElement;
    let inputEditorDiv: HTMLDivElement;
    let editor: () => Editor | undefined;
    const [spinner, setSpinner] = createSignal(false);

    const [_, { setAlert, handleGlobalError }] = useAlert();


    const onEnter = async (inputText: string) => {
        const last_message_id = props.chat?.messages?.at(-1)?.id ?? null;
        if (!props.chat?.bot_uid) {
            setAlert({ children: 'No bot set for this chat', variant: 'warning' });
            return;
        }

        if (inputText && props.chat) {
            setSpinner(true);
            let gErr = await addMessage({ chatId: props.chat.id, payload: { text: { content: inputText } }, parentId: last_message_id, receiverUid: props.chat.bot_uid, senderUid: null },
                {
                    onBotResponseHandler: ([response, gErr]) => {
                        setSpinner(false);
                        if (gErr) {
                            handleGlobalError(gErr);
                            return;
                        }
                    }
                });

            if (gErr) {
                handleGlobalError(gErr);
                return;
            }

            // scroll down
            scrollableDiv.scroll({ top: scrollableDiv.scrollHeight, behavior: 'smooth' });
        }
    }

    const CustomEditorKeyBoardShortcuts = Extension.create({
        addKeyboardShortcuts() {
            return {
                Enter: () => {
                    let text = this.editor.getText();
                    onEnter(text).finally(() => {
                        this.editor.commands.clearContent();
                    });
                    return true;
                },
            };
        },
    });


    onMount(async () => {
        setTimeout(() => {
            // NOTE: Hacky way to scroll to bottom, might break if rendering takes too long
            scrollableDiv.scroll({ top: scrollableDiv.scrollHeight, behavior: 'smooth' });
        }, 30);

        editor = createTiptapEditor(() => ({
            element: inputEditorDiv!,
            extensions: [
                Doc,
                Paragraph,
                Text,
                HardBreak,
                History,
                // custom
                CustomEditorKeyBoardShortcuts
            ],
            content: ``,
            autofocus: true,
            editorProps: {
                attributes: {
                    class: 'bg-stone-600', // better to use css styles
                }
            }
        }));
        // @ts-ignore
        window.editor = editor;
    })

    onCleanup(() => {
        editor()?.destroy();
    })

    createEffect(() => {
        // scroll to bottom on chat change
        if (props.chat.id) {
            scrollableDiv.scroll({ top: scrollableDiv.scrollHeight, behavior: 'auto' });
        }
    })

    createEffect(() => {
        // scroll to bottom on new message
        if (props.chat._messages?.length) {
            scrollableDiv.scroll({ top: scrollableDiv.scrollHeight, behavior: 'smooth' });
        }
    })

    return (
        <div class="flex flex-col" style="height: calc(100% - 2rem)">
            <div class="flex-1 overflow-y-auto mb-1" ref={scrollableDiv!}>
                <For each={props.chat.messages}>
                    {(item) => <div class="flex w-full">
                        <div class="">
                            <MessageActions message={item} />
                        </div>
                        <div class="flex-1">
                            <Switch>
                                <Match when={item.receiverUid === null}>
                                    <MessageRight message={item} />
                                </Match>
                                <Match when={item.senderUid === null}><MessageLeft message={item} /></Match>
                            </Switch>
                        </div>
                    </div>
                    }
                </For>
                <Show when={spinner()}>
                    <div class="flex">
                        <div class="ml-auto mr-3 my-2">
                            <Spinner size={"lg"} />
                        </div>
                    </div>
                </Show>
            </div>

            <div id="editor">
                <div ref={inputEditorDiv!}></div>
            </div>
        </div>
    )


}

export default function Document() {
    const [chatStore, { }, { }] = useChat();
    const [configView, setConfigView] = createSignal(false);

    const selectedChat = () => {
        return chatStore.chats.find(chat => chat.selected);
    }

    return <div class="pb-2 h-screen flex flex-col">
        <Show when={selectedChat()}>
            <>
                <Header chat={selectedChat()!} setConfigView={setConfigView} configView={configView} />
                <Show when={configView()} fallback={<ChatView chat={selectedChat()!} />}>
                    <ChatConfigView chat={selectedChat()!} />
                </Show>
            </>
        </Show>
    </div>
}