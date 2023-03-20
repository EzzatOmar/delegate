import { onMount, Show } from "solid-js";
import Button from "../base-components/Button";
import Input from "../base-components/Input";
import { useAlert } from "../hooks/useAlert";
import { useBot } from "../hooks/useBot";
import { useChat } from "../hooks/useChat";
import Document from "./canvas/Document";

function BuildOpenAiGPT3() {
    const [_, {setAlert, handleGlobalError}] = useAlert();
    const [__, {createBot}, {buildOpenAiStruct}] = useBot();
    let ref:HTMLDivElement;
    let btnRef:HTMLButtonElement;
    return <div>
        Enter your OpenAi key to create a new bot. 
        <br />
        <a rel="noopener" href="https://beta.openai.com/account/api-keys" target="_blank" class="text-sm text-blue-400">Get your key here</a>
        <Input placeholder="OpenAi Api Key" ref={ref!} onKeyDown={e => {if(e.key === 'Enter') btnRef.click();}} />
        <div class="mt-2 w-28">
            {/* TODO: add loading state */}
            <Button variant="primary" size="md" ref={btnRef!} onClick={async () => {
                let input = ref.querySelector('input')!;
                if(!input.value) return setAlert({children: 'Please enter a valid key', duration: 6000, variant: 'warning'});
                let openAiStruct = buildOpenAiStruct({apiKey: input.value});
                let [botState, err] = await createBot(openAiStruct);
                if(err) {
                    handleGlobalError(err);
                } else {
                    setAlert({children: 'Bot created successfully', duration: 6000, variant: 'success'});
                }

            }} >Create Bot</Button>
        </div>
    </div>
}

export default function ChatPanel() {
    const [_, {handleGlobalError}] = useAlert();
    const [botStore, { fetchAndSyncBotsFromDb }, __] = useBot();
    const [chatStore] = useChat();

    onMount(async () => {
        let gErr = await fetchAndSyncBotsFromDb()
        if(gErr) handleGlobalError(gErr);
    })
    return <div class="w-full text-text-100 px-2 bg-canvas-700">
        <Show when={botStore.bots.length > 0}
            fallback={<BuildOpenAiGPT3 />}>
                <Show when={chatStore.chats.length > 0}>
                    <Document />
                </Show>
        </Show>
    </div>
}