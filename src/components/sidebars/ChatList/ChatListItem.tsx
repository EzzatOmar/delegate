import { createSignal, For, mergeProps, onMount, Show } from "solid-js";
import Button from "../../../base-components/Button";
import Svg from "../../../base-components/SvgContainer";
import { useAlert } from "../../../hooks/useAlert";
import { useBot } from "../../../hooks/useBot";
import { ChatState, useChat } from "../../../hooks/useChat";

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