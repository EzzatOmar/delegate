import { mergeProps, Show } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import Svg, { SvgProps } from "./SvgContainer";
import Spinner from "./Spinner";
import { mergeRefs } from "@solid-primitives/refs";

export interface ButtonProps {
  onClick?: () => void;
  variant?: 'primary' | 'success' | 'neutral' | 'warning' | 'danger' | 'text';
  disabled?: boolean;
  loading?: boolean;
  outline?: boolean;
  children?: JSX.Element;
  prefix?: JSX.Element | SvgProps['name'];
  suffix?: JSX.Element;
  size?: 'sm' | 'md' | 'lg';
  ref?: HTMLButtonElement | ((el: HTMLButtonElement) => void);

}

export default function Button(props: ButtonProps) {
  // @ts-ignore
  props = mergeProps({ variant: 'primary', size: 'md', outline: false, disabled: false }, props);
  let ref!: HTMLButtonElement;

  return <button ref={mergeRefs(el => (ref = el), props.ref)}
    class="flex gap-2 items-center rounded px-1 relative w-full"
    classList={{
      'text-sm': props.size === 'sm',
      'text-base': props.size === 'md',
      'text-lg': props.size === 'lg',
      'bg-primary-500 hover:bg-primary-600': props.variant === 'primary' && !props.outline,
      'bg-success-500 hover:bg-success-600': props.variant === 'success' && !props.outline,
      'bg-neutral-500 hover:bg-neutral-600': props.variant === 'neutral' && !props.outline,
      'bg-warning-600 hover:bg-warning-700': props.variant === 'warning' && !props.outline,
      'bg-danger-500 hover:bg-danger-600': props.variant === 'danger' && !props.outline,
      'text-blue-400 hover:text-sky-500': props.variant === 'text' && !props.outline,
      'text-white': props.variant !== 'text' && props.outline,
      // outline
      'border-2 border-primary-500 hover:bg-primary-500 text-primary-500 hover:text-canvas-900': props.variant === 'primary' && props.outline,
      'border-2 border-success-500 hover:bg-success-500 text-success-5003 hover:text-canvas-900': props.variant === 'success' && props.outline,
      'border-2 border-neutral-500 hover:bg-neutral-500 text-neutral-500 hover:text-canvas-900': props.variant === 'neutral' && props.outline,
      'border-2 border-warning-600 hover:bg-warning-600 text-warning-600 hover:text-canvas-900': props.variant === 'warning' && props.outline,
      'border-2 border-danger-500 hover:bg-danger-600 text-danger-500': props.variant === 'danger' && props.outline,
      'border-2 border-blue-400 text-blue-400 hover:text-blue-500 hover:border-blue-500': props.variant === 'text' && props.outline,
      'cursor-pointer': !props.disabled,
      'cursor-not-allowed': props.disabled,
      'opacity-50': props.disabled,
      'opacity-100': !props.disabled,
    }}
    disabled={props.disabled}
    onClick={props.onClick}
  >
    <Show when={props.loading}>
      <div class="absolute flex w-full justify-center">
        <Spinner />
      </div>
    </Show>
    <div classList={{ "invisible": props.loading }}>
      {typeof props.prefix === 'string' && <Svg name={props.prefix as any} />}
      {typeof props.prefix !== 'string' && props.prefix}
    </div>
    <div classList={{ "invisible": props.loading }} class="m-auto">
      {props.children}
    </div>
    <div classList={{ "invisible": props.loading }}>
      {typeof props.suffix === 'string' && <Svg name={props.suffix as any} />}
      {typeof props.suffix !== 'string' && props.suffix}
    </div>
  </button>
}