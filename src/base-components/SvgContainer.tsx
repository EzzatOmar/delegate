import BootstrapIcons from "../bootstrap";
import type { IconName } from "../bootstrap";
import { mergeRefs } from "@solid-primitives/refs";

// TODO: add storybook

export interface SvgProps {
    name: IconName;
    class?: string;
    size?: number | 'sm' | 'md' | 'lg';
    onClick?: (e: MouseEvent & {
        currentTarget: HTMLDivElement;
        target: Element;
    } | undefined) => void;
    ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
}


export default function Svg(props: SvgProps) {
    let ref!: HTMLDivElement;

    const getJSX = (name: IconName) => {
        return BootstrapIcons[name];
    }
    const getSize = (size?: number | 'sm' | 'md' | 'lg') => {
        switch (size) {
            case undefined:
                return 1;
            case 'sm':
                return 0.75;
            case 'md':
                return 1;
            case 'lg':
                return 1.25;
            default:
                return size;
        }
    }
    return <div ref={mergeRefs(el => (ref = el), props.ref)}
        class={props.class} style={{ scale: getSize(props.size) }} onClick={props.onClick}>
        {/* @ts-ignore */}
        {BootstrapIcons[props.name] && getJSX(props.name)}
    </div>

}