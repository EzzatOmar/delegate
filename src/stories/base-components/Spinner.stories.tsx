import Spinner, {SpinnerProps} from "../../base-components/Spinner";

import type { Meta, StoryObj } from "@storybook/html";
import type { ComponentProps } from "solid-js";

type Story = StoryObj<SpinnerProps>;

export const Primary: Story = {
  args: {
    size: 'md',
  },
};

export default {
  title: "base-component/Spinner",
  tags: ["autodocs"],
  parameters: {
    docs: {
        description: {
            component: 'Spinner - shows loading state'
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
   */
  render: (props) => <Spinner {...props} />,
  argTypes: {

  },
} as Meta<ComponentProps<typeof Spinner>>;
