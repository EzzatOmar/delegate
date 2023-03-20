import { JSX } from "solid-js/jsx-runtime"
import { useNavigation } from "../hooks/useNavigation"
import ChatSVG from "./../assets/bootstrap-icons/chat-left-text.svg?component-solid"
import RobotSVG from "./../assets/bootstrap-icons/robot.svg?component-solid"

function SideNavItem(props: {children: JSX.Element, name: 'chats' | 'bots'}) {
    const [nav, {setTab}] = useNavigation();
    return <div class="w-12 h-12 flex items-center justify-center hover:cursor-pointer" onclick={e => setTab(props.name) }>
        {props.children}
    </div>
}

export default function SideNav() {
    const [nav, {}] = useNavigation();

    return <div class="bg-canvas-900 h-screen py-1">
        <SideNavItem name="chats"> <ChatSVG class="scale-150 hover:text-slate-100" classList={{'text-slate-100': nav.tab === 'chats', 'text-slate-400': nav.tab !== 'chats'}} /> </SideNavItem>
        {/* TODO: implement bot view */}
        {/* <SideNavItem name="bots"> <RobotSVG class="scale-150 hover:text-slate-100" classList={{'text-slate-100': nav.tab === 'bots', 'text-slate-400': nav.tab !== 'bots'}} /> </SideNavItem> */}
    </div>
}