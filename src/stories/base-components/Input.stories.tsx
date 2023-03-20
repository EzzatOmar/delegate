import Input, {InputProps} from "../../base-components/Input";

import type { Meta, StoryObj } from "@storybook/html";
import type { ComponentProps } from "solid-js";
import Icons from "../../bootstrap";

type Story = StoryObj<InputProps>;

export const Primary: Story = {
  args: {
    size: 'md',
    variant: 'primary',
    disabled: false,
    placeholder: 'Enter your name',
  },
};

export default {
  title: "base-component/Input",
  tags: ["autodocs"],
  parameters: {
    docs: {
        description: {
            component: 'Standard Input'
        }
    }
  },
  // outsource
  decorators: [
    (Story) => (
      <div class="bg-canvas-800 p-4">
        <Story />
      </div>
    ),
  ],
  /**
   * Here you need to render JSX for HMR work!
   *
   * render: Input won't trigger HMR updates
   */
  render: (props) => <Input {...props} />,
  argTypes: {
    size: {
      type: { name: "string", required: false },
      description: "Size of the Input",
      options: ["sm", "md", "lg"],
      control: { type: "select" },
    },
    variant: {
      type: { name: "string", required: false },
      description: "Variant of the Input",
      options: ["primary", "success", "neutral", "warning", "danger", "text"],
      control: { type: "select" },
    },
    prefix: {
      type: { name: "string", required: false },
      description: "Prefix icon",
      options: Object.keys(Icons),
      control: { type: "select" },
    },
    suffix: {
      type: { name: "string", required: false },
      description: "Suffix icon",
      options: Object.keys(Icons),
      control: { type: "select" },
    },
    placeholder: {
      type: { name: "string", required: false },
      description: "Placeholder",
      control: { type: "text" },
    },
    outline: {
      type: { name: "boolean", required: false },
      description: "Outline variant",
      control: { type: "boolean" },
    },
    disabled: {
      type: { name: "boolean", required: false },
      description: "Disabled state",
      control: { type: "boolean" },
    },
    loading: {
      type: { name: "boolean", required: false },
      description: "Loading state",
      control: { type: "boolean" },
    },

  },
} as Meta<ComponentProps<typeof Input>>;
