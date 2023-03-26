import Button, {ButtonProps} from "../../base-components/Button";

import type { Meta, StoryObj } from "@storybook/html";
import type { ComponentProps } from "solid-js";
import Icons from "../../bootstrap";

type Story = StoryObj<ButtonProps>;

export const Primary: Story = {
  args: {
    children: 'Button',
    size: 'md',
    variant: 'primary',
    prefix: 'plus',
    outline: false,
    disabled: false,
    loading: false,
  },
};

export default {
  title: "base-component/Button",
  tags: ["autodocs"],
  parameters: {
    docs: {
        description: {
            component: 'Standard Button'
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
   * render: Button won't trigger HMR updates
   */
  render: (props) => <Button {...props} />,
  argTypes: {
    size: {
      type: { name: "string", required: false },
      description: "Size of the button",
      options: ["sm", "md", "lg"],
      control: { type: "select" },
    },
    variant: {
      type: { name: "string", required: false },
      description: "Variant of the button",
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
} as Meta<ComponentProps<typeof Button>>;
