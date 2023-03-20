import { createSignal, For, mergeProps, onMount, Show } from "solid-js";
import Button from "../../base-components/Button";
import Svg from "../../base-components/SvgContainer";
import { useAlert } from "../../hooks/useAlert";
import { useBot } from "../../hooks/useBot";
import { ChatState, useChat } from "../../hooks/useChat";

export interface ChatListItemProps {
    chat: ChatState;
}

export function ChatListItem(props: ChatListItemProps) {
    const [edit, setEdit] = createSignal(false);
    const [_, sfa, ___] = useChat();
    const [__, { handleGlobalError }] = useAlert();
    let okSvgRef:HTMLDivElement;

    props = mergeProps({ selected: false, label: 'New Chat' }, props);

    const EditMode = () => {
        let inputRef: HTMLInputElement;

        onMount(() => {
            inputRef.focus();
        });
        return <>
            <div class="flex-1 text-ellipsis overflow-hidden whitespace-nowrap">
                <input ref={inputRef!} type="text" class="bg-transparent border border-blue-500 text-white w-full" placeholder="New chat" value={props.chat.title ?? 'New chat'} onKeyDown={e => {
                    if(e.key === 'Enter') okSvgRef.click();
                }} /> </div>
            <div class="flex gap-1">
                <Svg ref={okSvgRef!} name="check" class="hover:text-primary-400" onClick={async e => { 
                    let [chat, gErr] = await sfa.editChatTitle({ title: inputRef.value, id: props.chat.id });

                    if(gErr) {
                        handleGlobalError(gErr);
                    }
                    setEdit(false);

                    }} />
                <Svg name="x" class="hover:text-primary-400" onClick={async e => { setEdit(false); }} />
            </div>
        </>
    }

    const NormalMode = () => {
        const [_, {removeChat}] = useChat();

        return <>
            <div class="flex-1 text-ellipsis overflow-hidden whitespace-nowrap">{props.chat.title ?? 'New chat'}</div>
            <div class="flex gap-1">
                <Svg name="pen" class="hover:text-primary-400" onClick={e => { setEdit(true) }} />
                <Svg name="trash" class="hover:text-primary-400" onClick={async e => {
                    e?.stopPropagation();
                    let gErr = await removeChat({ id: props.chat.id });

                    if(gErr) {
                        handleGlobalError(gErr);
                    }
                }}/>
            </div>
        </>
    }

    return <div class="flex border border-transparent hover:border-canvas-200 rounded items-center cursor-pointer w-full px-1"
        classList={{ 'bg-slate-500': props.chat.selected }}
        onClick={e => { sfa.selectChat(props.chat.id)}}
    >
        <Show when={edit()} fallback={<NormalMode />}>
            <EditMode />
        </Show>
    </div>
}

async function create_chat(args: { bot_uid: string }) {
    const [_, { handleGlobalError }] = useAlert();
    const [__, { createChat, selectChat }, { buildChatStruct }] = useChat();
    const botStruct = buildChatStruct({
        title: "New chat",
        bot_uid: args.bot_uid,
    }, {
        botSettings: {}
    });
    const [chat, gErr] = await createChat(botStruct);
    if (gErr) handleGlobalError(gErr);
    selectChat(chat!.id);
}

export default function ChatList() {
    const [chatList, sfa, _] = useChat();
    const [botStore] = useBot();
    const { handleGlobalError, setAlert } = useAlert()[1];

    onMount(async () => {
        const gErr = await sfa.fetchAndSyncChatsFromDb();
        if (gErr) handleGlobalError(gErr);

    })

    return <div class="text-white flex flex-col h-screen">
        <div class="p-2 border-b border-canvas-400 flex-shrink">
            <Button onClick={() => {
                let bot = botStore.bots.at(0);
                if(!bot) {
                    setAlert({ variant: 'warning', children: 'No bot found', duration: 6000 });
                    return;
                }
                create_chat({ bot_uid: bot.uid });
            }} prefix="plus" variant="primary" outline={true}><span class="text-canvas-100">Chat</span></Button>
        </div>
        <div class="flex flex-col gap-2 py-2 px-1 flex-grow overflow-scroll">
            <For each={chatList.chats}>
                {(chat) => <ChatListItem chat={chat} />}
            </For>
        </div>
    </div>
}