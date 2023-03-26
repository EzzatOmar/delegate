import Svg, {SvgProps} from "./SvgContainer";

// TODO: add storybook
export interface SpinnerProps {
    size?: SvgProps['size'];
}


export default function Spinner (props: SpinnerProps) {

    return <div class="flex text-2xl">
        <div class="animate-spin block">
            <Svg name="arrowRepeat" class="text-canvas-100" size={props.size ?? 1} />
        </div>
    </div>
}