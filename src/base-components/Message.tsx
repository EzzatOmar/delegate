import { Editor } from "@tiptap/core";
import { onCleanup, onMount } from "solid-js";
import { createTiptapEditor } from "solid-tiptap";
import Doc from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text';
import HardBreak from '@tiptap/extension-hard-break';
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import hljs from "highlight.js/lib/common";
import { lowlight } from 'lowlight/lib/core'
import { htmlEncode } from "js-htmlencode";
import { ChatMessage } from "../hooks/useChat";

// register tiptap syntax highlighter
hljs.listLanguages().forEach(lang => {
  const langModule = hljs.getLanguage(lang);
  if (langModule) lowlight.registerLanguage(lang, () => langModule);
});


export interface MessageProps {
  message: ChatMessage;
  left: boolean;
}

export function Message(props: MessageProps) {
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

  return <div ref={editorDiv!}
  classList={{
      'bg-yellow-800': !props.left,
      'bg-gray-700': props.left,
      'ml-8': !props.left,
      'mr-8': props.left,
  }}
  class="message p-2 rounded-lg my-1"></div>
}
