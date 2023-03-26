import Alert, {AlertProps} from "../../base-components/Alert";

import type { Meta, StoryObj } from "@storybook/html";
import type { ComponentProps } from "solid-js";
import Icons from "../../bootstrap";

type Story = StoryObj<AlertProps>;

export const Primary: Story = {
  args: {
    children: 'This is a alert message, you can use it to show some information.',
    variant: 'primary',
    closable: false,
  },
};

export default {
  title: "base-component/Alert",
  tags: ["autodocs"],
  parameters: {
    docs: {
        description: {
            component: 'Alerts are used to provide contextual feedback messages for typical user actions with the handful of available and flexible alert messages.'
        }
    }
  },
  // outsource
  decorators: [
    (Story) => (
        <Story />
      // <div class="bg-canvas-800 p-4"> </div>
    ),
  ],
  /**
   * Here you need to render JSX for HMR work!
   *
   * render: Alert won't trigger HMR updates
   */
  render: (props) => <Alert {...props} />,
  argTypes: {
    variant: {
      type: { name: "string", required: false },
      description: "Variant of the Alert",
      options: ["primary", "success", "neutral", "warning", "danger"],
      control: { type: "select" },
    },
  },
} as Meta<ComponentProps<typeof Alert>>;
