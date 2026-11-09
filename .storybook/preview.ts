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
  globalTypes: {
    // Brand selection is independent from the light/dark colour mode.
    theme: {
      description: "Brand theme",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "default", title: "Default" },
          { value: "lapis", title: "Lapis" },
        ],
        dynamicTitle: true,
      },
    },
    // colorMode is toggled by the manager TOOL in
    // manager-color-mode-toggle.tsx (single sun/moon button).
  },
  initialGlobals: {
    theme: "lapis",
    colorMode: "light",
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
    (story, context) => {
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute(
          "data-ui-theme",
          String(context.globals.theme ?? "lapis"),
        );
        document.documentElement.classList.toggle(
          "dark",
          context.globals.colorMode === "dark",
        );
      }
      return story();
    },
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
    // Brand switcher is owned by globalTypes.theme above; keep the addon
    // decorator for data-ui-theme without a second toolbar control.
    themes: { disable: true },
    // Docs TOC (right rail): Installation / Structure / API headings from MDX + Markdown.
    docs: {
      toc: {
        headingSelector: "h2, h3",
        title: "On this page",
      },
    },
  },
};

export default preview;
