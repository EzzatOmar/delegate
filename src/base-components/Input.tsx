import { mergeProps, onMount, Show } from "solid-js";
import Svg, { SvgProps } from "./SvgContainer";
import {mergeRefs} from "@solid-primitives/refs";

export interface InputProps {
  onInput?: (e: InputEvent & { currentTarget: HTMLInputElement; target: Element; }) => void;
  onKeyDown?: (e: KeyboardEvent & { currentTarget: HTMLInputElement; target: Element; }) => void;
  variant?: 'primary' | 'success' | 'neutral' | 'warning' | 'danger' | 'text';
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  prefix?: SvgProps['name'];
  prefixClass?: string;
  suffix?: SvgProps['name'];
  suffixClass?: string;
  size?: 'sm' | 'md' | 'lg';
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
}

export default function Input(props: InputProps) {
  // @ts-ignore
  props = mergeProps({ variant: 'primary', size: 'md', outline: false, disabled: false }, props);
  let ref!: HTMLDivElement;

  return (
    <div ref={mergeRefs(el => (ref = el), props.ref)}>
      <Show when={props.label}>
        <label for="account-number" class="block text-sm font-medium text-text-200"
          classList={{
            'text-sm': props.size === 'sm',
            'text-base': props.size === 'md',
            'text-lg': props.size === 'lg',
          }}>
          {props.label}
        </label>
      </Show>
      <div class="relative mt-1 rounded-md shadow-sm">
        <Show when={props.prefix}>
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400" aria-hidden="true" >
            <Svg class={props.prefixClass} name={props.prefix!} />
          </div>
        </Show>
        <input
          type="text"
          name="account-number"
          id="account-number"
          disabled={props.disabled}
          class="block w-full px-1 rounded-sm h-8 border-primary-100 focus:border-blue-500 focus:ring-blue-500 bg-canvas-400 text-text-800 placeholder:text-text-200"
          classList={{
            'pl-9': !!props.prefix,
            'pr-9': !!props.suffix,
            'text-sm': props.size === 'sm',
            'text-base': props.size === 'md',
            'text-lg': props.size === 'lg',
          }}
          onInput={props.onInput}
          onKeyDown={props.onKeyDown}
          placeholder={props.placeholder}
        />
        <Show when={props.suffix}>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400" aria-hidden="true" >
            <Svg class={props.suffixClass} name={props.suffix!} />
          </div>
        </Show>
      </div>
    </div>
  )
}