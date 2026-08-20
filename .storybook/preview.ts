import type { Preview } from "@storybook/svelte-vite";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/source-code-pro";
import "@lapismd/design-core/storybook.css";
import "@lapismd/design-core/themes/lapis.css";
import "@lapismd/design-core/forms/form.tokens.css";
import "@lapis-notes/ui/theme.css";
import "../src/lib/styles.css";
import "../src/lib/storybook.css";
import "./preview.css";

const preview: Preview = {
  tags: ["autodocs", "test"],
  initialGlobals: {
    theme: "lapis",
  },
  decorators: [
    withThemeByDataAttribute({
      themes: {
        default: "default",
        lapis: "lapis",
      },
      defaultTheme: "lapis",
      attributeName: "data-ui-theme",
    }),
  ],
  parameters: {
    layout: "fullscreen",
    options: {
      storySort: {
        order: [
          "Specification",
          [
            "Specification governance",
            "Plugins",
            ["Docs", ["Notes", "Runtime", "Cards"]],
            "Verification",
          ],
          "Plugins",
          ["Docs", ["Shell", "Workspace", "Cards", "Review", "*"]],
          "*",
        ],
      },
    },
    a11y: {
      test: "error",
    },
    backgrounds: { disable: true },
    themes: { disable: true },
  },
};

export default preview;
