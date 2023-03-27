import { Match, Switch } from "solid-js";
import ChatList from "./sidebars/ChatList";

export default function SideBar() {

    return <div class="w-56 flex bg-canvas-800">
        <div class="w-full max-h-screen">
            <Switch>
                <Match when={true}>
                    <ChatList />
                </Match>
            </Switch>
        </div>
    </div>
}