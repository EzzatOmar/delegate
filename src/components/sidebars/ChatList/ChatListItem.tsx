import { createEffect, createSignal, For, mergeProps, onCleanup, onMount, Show } from "solid-js";
import { useMachine } from '@xstate/solid';
import { createMachine } from 'xstate';
import Svg from "../../../base-components/SvgContainer";
import { useAlert } from "../../../hooks/useAlert";
import { ChatState, useChat } from "../../../hooks/useChat";

// TODO: finish state transitions
const lifeCycleMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QGEAWBDALgSU2AtgDICWAZmMgJ4DGANmAHQAO6ssxAbmAMQDKAooX7IAKgG0ADAF1EoJgHt2mYvIB2skAA9EAJgkSGAFgDsATgAcOwxIBsNgIw2d9gDQhKic8YYBWG8Z1jHx0fCR1zc0MAXyi3NCxcAhJyKjpGFjZORlV5ACd8dFpufgARbHFpDQUlFXUkLUQAWgBmQxsGe2MJIJ97K2tDV3dEYIYbc3HTUxtmiR8fa3MYuIwcPCIyChp6ZlZ2LgZIYmVVKG5kAEEAOWRBSRl66uPajW0ERqtmhimJQdM+nwTcymZpuDwIezNHRGGYOPSGcz2PxOZYgeJrJKbVI7DL7RhHE5nXgXABq-HuVUUzzUryaJmhzWM9lMOhsU1MAyG4Mh0LazThv0RyJ0qPRiQ2KW2jHQ1GUXG4AFUrgIhKIKY8qcoafU3jpWgxgbYoU4QRyfKDhu97EZAgFEVDujZQhZRatxcktmkGDK5dk8gUiqVyuq5JqXjrEIyvlDmj4AnYkXZjGDIwtvoDms0kTpwoYza6EusPdjpbKsocIM9TnxSeTKhqatrQLqfKYba2uoNWeEOSmEIMfGNLD3DAjevaCxiJZ6dj7ywTiNXLjc7vXQ426s3EAjvOZuqPMxFApDDH2B0Oc8DR+Zx5CYrEQDkIHANGKi1ipZSN7T3n5zAxGWZVl2U5PtGnsSIGD0YwZljexISdHxJ3dD8vVxLIv2pTcGl-PQAKZFk2SmUDLUaaYGACZkFg5MxhyQh830xSU0L2cscnyQpMK1bC3haUZwm6SxDEZWEfDAts9ScGCIL6E8XQYt132YnFWIOBdTi48Mt3eWMGQI4DiN+LlEEha1nCPewJE6QJwmaZClJnUtfU0pscOca1DBCUxOz6Jwrz7eEGAkSIZh0CxGTCYw7IUwsmMc70ywOdiAxcnjI38KDIQWfxghZbyAv+XwuizJETGC1sbHsuKSwS30KyrKBUp-Rk208jsjO7fzLUGQwjEZPNLH0G9AXvKIgA */
  id: "ChatItemLifeCycle",
  initial: "passive",
  schema: {
    events: {} as { type: "SELECT" } | { type: "EDIT" } | { type: "SAVE" } | { type: "CANCEL" } | { type: "UNSELECT" },
  },
  tsTypes: {} as import("./ChatListItem.typegen").Typegen0,
  states: {
    passive: {
      on: {
        SELECT: "active"
      },

      states: {
        normal: {
          on: {
            EDIT: "editing"
          }
        },

        editing: {
          on: {
            CANCEL: "normal",
            SAVE: "normal"
          }
        }
      },

      initial: "normal"
    },

    active: {
      on: {
        UNSELECT: "passive"
      },

      states: {
        normal: {
          on: {
            EDIT: "editing"
          }
        },

        editing: {
          on: {
            SAVE: "normal",
            CANCEL: "normal"
          }
        }
      },

      initial: "normal"
    },
  }
}, {

});
export interface ChatListItemProps {
  chat: ChatState;
}

function RenderEditState(props: { chat: ChatState; send: (event: any) => void; }) {
  const [_, { removeChat, editChatTitle }] = useChat();
  const [__, { handleGlobalError }] = useAlert();

  let inputRef: HTMLInputElement;
  let okSvgRef: HTMLDivElement;

  onMount(() => {
    inputRef.focus();
  });

  const onSave = async () => {
    const newTitel = inputRef.value;
    let [chat, gErr] = await editChatTitle({ title: inputRef.value, id: props.chat.id });

    if (gErr) {
      handleGlobalError(gErr);
    }
    props.send({ type: 'SAVE' });
  };

  const onCancel = async () => {
    props.send({ type: 'CANCEL' });
  };

  return <div class="flex">
    <div class="flex-1 text-ellipsis overflow-hidden whitespace-nowrap">
    <input ref={inputRef!} type="text" class="bg-transparent border border-blue-500 text-white w-full" placeholder="New chat" value={props.chat.title ?? 'New chat'} onKeyDown={e => {
          if (e.key === 'Enter') onSave();
          if (e.key === 'Escape') onCancel();
        }} />
    </div>
    <div class="gap-2 items-center flex">
      <Svg ref={okSvgRef!} name="check" class="hover:text-primary-400" onClick={async e => { onSave(); }} />
      <Svg name="x" class="hover:text-danger-400" onClick={async e => { onCancel(); }} />
    </div>
  </div>
}

function RenderNormalState(props: { chat: ChatState; send: (event: any) => void; }) {
  const [_, { removeChat }] = useChat();

  return <div class="flex">
    <div class="flex-1 text-ellipsis overflow-hidden whitespace-nowrap">{props.chat.title ?? 'New chat'}</div>
    <div class="gap-2 items-center hidden group-hover:flex">
      <Svg name="pen" class="hover:text-primary-400" onClick={e => {
        // e?.stopPropagation();
        props.send({ type: 'EDIT' });
      }} />
      <Svg name="trash" class="hover:text-primary-400" onClick={async e => {
        // e?.stopPropagation();
        let gErr = await removeChat({ id: props.chat.id });

        if (gErr) {
          // handleGlobalError(gErr);
        }
      }} />
    </div>
  </div>
}

export function ChatListItem(props: ChatListItemProps) {
  const [state, send] = useMachine(lifeCycleMachine);
  const [edit, setEdit] = createSignal(false); // remove
  const [_, sfa, ___] = useChat();
  const [__, { handleGlobalError }] = useAlert();
  let okSvgRef: HTMLDivElement; // remove

  props = mergeProps({ selected: false, label: 'New Chat' }, props);

  // TODO remove
  const EditMode = () => {
    let inputRef: HTMLInputElement;

    onMount(() => {
      inputRef.focus();
    });
    return <>
      <div class="flex-1 text-ellipsis overflow-hidden whitespace-nowrap">
        <input ref={inputRef!} type="text" class="bg-transparent border border-blue-500 text-white w-full" placeholder="New chat" value={props.chat.title ?? 'New chat'} onKeyDown={e => {
          if (e.key === 'Enter') okSvgRef.click();
        }} /> </div>
      <div class="flex gap-1">
        <Svg ref={okSvgRef!} name="check" class="hover:text-primary-400" onClick={async e => {
          let [chat, gErr] = await sfa.editChatTitle({ title: inputRef.value, id: props.chat.id });

          if (gErr) {
            handleGlobalError(gErr);
          }
          setEdit(false);

        }} />
        <Svg name="x" class="hover:text-primary-400" onClick={async e => { setEdit(false); }} />
      </div>
    </>
  }


  createEffect(() => {
    if (props.chat.selected) {
      send('SELECT');
    } else {
      send('UNSELECT');
    }
  });

  return <div class="flex hover:bg-slate-500 cursor-pointer w-full px-1 flex-col group"
    classList={{ 'bg-slate-500': state.matches('active') }}
    onClick={e => { sfa.selectChat(props.chat.id) }}
  >
    <Show when={state.matches('active.editing') || state.matches('passive.editing')}
      fallback={<RenderNormalState chat={props.chat} send={send} />}>
      <RenderEditState chat={props.chat} send={send} />
    </Show>
    <div class="text-xs text-stone-400 text-ellipsis overflow-hidden whitespace-nowrap">{props.chat.messages.at(-1)?.payload?.text?.content?.substring(0, 45)}&nbsp;</div>
  </div>

  // return <div class="flex hover:bg-slate-400 items-center cursor-pointer w-full px-1"
  //   classList={{ 'bg-slate-500': state.matches('active') }}
  //   onClick={e => { sfa.selectChat(props.chat.id) }}
  // >
  //   <Show when={edit()} fallback={<NormalMode />}>
  //     <EditMode />
  //   </Show>
  // </div>
}