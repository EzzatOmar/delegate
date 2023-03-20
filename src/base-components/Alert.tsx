import { mergeProps, Show } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import Svg, { SvgProps } from "./SvgContainer";
import Spinner from "./Spinner";
import Button from "./Button";

export interface AlertProps {
  onClose?: () => void;
  variant?: 'primary' | 'success' | 'neutral' | 'warning' | 'danger';
  closable?: boolean;
  children?: JSX.Element;
  icon?: JSX.Element | SvgProps['name'];

}

export default function Alert(props: AlertProps) {
  // @ts-ignore
  props = mergeProps({ variant: 'primary', closable: false }, props);

  const variantIcon = (variant?: string) => {
    switch (variant) {
      case 'primary':
        return 'infoCircle';
      case 'success':
        return 'checkCircle';
      case 'neutral':
        return 'infoCircle';
      case 'warning':
        return 'exclamationCircle';
      case 'danger':
        return 'exclamationCircle';
      default:
        return 'infoCircle';
    }
  }

  return <div class="bg-slate-700 text-text-100 rounded-sm border border-t-4 border-slate-600 shadow flex gap-4 items-center p-3"
    classList={{
      'border-t-primary-500': props.variant === 'primary',
      'border-t-success-500': props.variant === 'success',
      'border-t-neutral-500': props.variant === 'neutral',
      'border-t-warning-500': props.variant === 'warning',
      'border-t-danger-500': props.variant === 'danger',
    }}
  >
    <Svg name={props.icon as any || variantIcon(props.variant)} class={`text-${props.variant}-500`} />
    <span class="flex-1">
      {props.children}
    </span>
    <Show when={props.closable}>
      <div class="cursor-pointer" onClick={props.onClose}>
        <Svg name="xLg" class="text-text-100 hover:text-primary-500" />
      </div>
    </Show>
  </div>
}