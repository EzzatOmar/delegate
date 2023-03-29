import { createSignal, For, Match, onMount, Switch } from "solid-js";
import { useMachine } from '@xstate/solid';
import { createMachine } from 'xstate';
import Button from "../../../base-components/Button";
import Svg from "../../../base-components/SvgContainer";
import { useAlert } from "../../../hooks/useAlert";
import { useBot } from "../../../hooks/useBot";
import { useChat } from "../../../hooks/useChat";
import { ChatListItem } from "./ChatListItem";
import Input from "../../../base-components/Input";
import { ftsChat } from "../../../controller/database/models/chats";
import { ftsMessages } from "../../../controller/database/models/messages";

const lifeCycleMachine = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QGEAWBDALgGQJax1wDMxkBPAYwBswA6XCGgYhMwtVwDsoBtABgC6iUAAcA9rFyZcYzsJAAPRAEYATAFZaANnUAOXeuVbVAZnVmjAGhBlEugOy0AnHz5a3y9eadflAXz9rNCw8AjwScmo6KjF0CC4oJlgAVwoKOFh+ISQQcUlpWXklBDMtWhMjEyddYzc+dQAWe2tbBF1lWgaDLXs9ZWV7Hr0AoIxCMOJSShpaGLiElnRcKmSAJzAs+TypGTkc4rNNBtV+nydVfTMWlXsTZ11VBor1H3s1dXsRkGDxwgjpuhgVarMSrFhgNgcbibHLbAp7UDFVSqPjaBoeW7uZROLQmLTXBDIhq0ew+dTuEx8VT2PgDBoBQIgThiCBweQ-UJ-KZRLYSHaFfaIAC0+JswtMtAepNMPixvXOXw5+C5kRmDBovPyuyKiGOBP0nVc7i0nm8vkVY054W5Mzm8W4mv5CMUiEeuhJuhMBiMpnMhlFrQN6LqJq8VXNjKVE3+UVo6zirVEfPhOoQ6nq5V0Ti9yM9yj4eIJuO0H3luj4TnsDSavQtIWV1tVgOBoMdKcFaapzmUTT4DS01fzOIJAzu1Uez1e70+DKAA */
    id: "ChatListLifeCycle",
    initial: "idle",
    states: {
        idle: {
            on: {
                fetching: "loading"
            }
        },

        loading: {
            on: {
                failure: "error",
                success: "ready"
            }
        },

        ready: {
            type: "final",
            entry: "selectChatIfNot"
        },

        error: {
            on: {
                fetching: "loading"
            }
        }
    }
});

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

async function loading(send: (event: string) => void) {
    const [_, sfa] = useChat();
    const { handleGlobalError } = useAlert()[1];

    send('fetching');

    const gErr = await sfa.fetchAndSyncChatsFromDb();
    if (gErr) {
        handleGlobalError(gErr);
        send('failure');
    } else {
        send('success');
    }

}

function RenderLoadingState() {
    return <div class="flex flex-col justify-center items-center h-full">
        <Svg name="arrowClockwise" size="lg" class="animate-spin" />
    </div>
}

function RenderReadyState() {
    const [chatList] = useChat();
    const [botStore] = useBot();
    const { setAlert } = useAlert()[1];
    const [searchIds, setSearchIds] = createSignal<number[] | null>(null);

    const filteredChats = () => chatList.chats.filter(c => {
        const ids = searchIds();
        if (ids === null) return true;
        return ids.includes(c.id);
    }).reverse();

    const onSearch = async (e: InputEvent & { currentTarget: HTMLInputElement; target: Element; }) => {
        const query = e.currentTarget.value;
        if(query) {
            const mIds = await ftsMessages(query).then(messages => messages.map(m => m.chat_id));
            const cIds = await ftsChat(query) .then(chats => chats.map(c => c.id));
            setSearchIds([...mIds, ...cIds]);
        } else {
            setSearchIds(null);
        }
    }

    return <>
        <div class="flex flex-col gap-2 m-2">
            <Button onClick={() => {
                let bot = botStore.bots.at(0);
                if (!bot) {
                    setAlert({ variant: 'warning', children: 'No bot found', duration: 6000 });
                    return;
                }
                create_chat({ bot_uid: bot.uid });
            }} prefix="plusLg" variant="primary" outline={true}><span class="text-canvas-100">New Chat</span></Button>

            <Input class="bg-canvas-600 text-text-300 placeholder:text-text-500 text-sm" placeholder="search" onInput={onSearch}  />
        </div>


        <div class="flex flex-col gap-2 py-2 flex-grow overflow-scroll">
            <For each={filteredChats()}>
                {(chat) => <ChatListItem chat={chat} />}
            </For>
        </div>
    </>
}

function RenderErrorState(props: {send: (event: string) => void}) {
    return <div class="inline-block pt-5 h-full self-center justify-self-center">
        {/* BUTTON TO RETRY */}
            <Button onClick={() => loading(props.send)} prefix="arrowClockwise" variant="warning" outline={false}>
                <span class="text-canvas-100">Retry</span>
            </Button>
    </div>
}

export default function ChatList() {
    const [chatList, {selectChat}] = useChat();

    const [state, send] = useMachine(lifeCycleMachine, {
        actions: {
            selectChatIfNot: () => {
                const selected = chatList.chats.find(c => c.selected);
                const first = chatList.chats.at(0)?.id;
                if (!selected && first) {
                    selectChat(first);
                }
            }
        }
    });

    onMount(async () => {
        await loading(send);
    })

    return <div class="text-white flex flex-col h-screen">
        <Switch>
            <Match when={state.matches('loading')}>
                <RenderLoadingState />
            </Match>
            <Match when={state.matches('ready')}>
                <RenderReadyState />
            </Match>
            <Match when={state.matches('error')}>
                <RenderErrorState send={send} />
            </Match>
        </Switch>
    </div>
}