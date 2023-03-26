import ChatPanel from "../components/ChatPanel";
import SideNav from "../components/SideNav";
import SideBar from "../components/SideBar";
import { Match, onMount, Switch } from "solid-js";
import { useNavigation } from "../hooks/useNavigation";

function ChatView() {
    return <div class="flex">
        <SideNav />
        <SideBar />
        <ChatPanel />
    </div>
}

function BotView() {
    return <div class="flex">
        <SideNav />
        <div>
            TODO: Bot View
        </div>
    </div>
}

export default function Main() {
    const [nav, a] = useNavigation();

    return <Switch fallback={<div>404</div>}>
        <Match when={nav.tab === "chats"}>{ChatView}</Match>
        <Match when={nav.tab === "bots"}>{BotView}</Match>
    </Switch>
}