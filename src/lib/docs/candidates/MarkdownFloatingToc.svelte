<script lang="ts">
  /**
   * DESIGN_CORE_CANDIDATE: MarkdownFloatingToc — ported for Docs; promote to design-core/forms later.
   */
  import "./markdown-floating-toc.css";
  import type { MarkdownFloatingTocMode } from "./markdown-floating-toc";

  type TocHeading = {
    key: string;
    id: string;
    title: string;
    level: number;
    element: HTMLElement;
  };

  let {
    root = null,
    mode = "auto",
    compact = false,
    disabled = false,
  }: {
    root?: HTMLElement | null;
    mode?: MarkdownFloatingTocMode;
    compact?: boolean;
    disabled?: boolean;
  } = $props();

  let headings = $state<TocHeading[]>([]);
  let activeId = $state("");
  let hoverOpen = $state(false);
  let pinnedOpen = $state(false);
  let focusOpen = $state(false);
  let containerElement = $state<HTMLDivElement | null>(null);
  let panelElement = $state<HTMLElement | null>(null);

  const canCollect = $derived(Boolean(root) && mode !== "off" && !disabled && (mode === "always" || !compact));
  const isVisible = $derived(canCollect && headings.length >= (mode === "always" ? 1 : 2));
  const isOpen = $derived(isVisible && (hoverOpen || pinnedOpen || focusOpen));

  function collectHeadings() {
    if (!root || !canCollect) {
      headings = [];
      activeId = "";
      return;
    }

    const seenKeys = new Map<string, number>();
    const next = Array.from(root.querySelectorAll<HTMLElement>("[data-cv-heading='true']"))
      .map((element, index) => {
        const id = element.id;
        const title = element.dataset.cvHeadingTitle?.trim() || element.textContent?.trim() || "";
        const level = Number.parseInt(element.dataset.cvHeadingLevel ?? element.tagName.slice(1), 10);
        if (!id || !title || !Number.isFinite(level)) return null;
        const baseKey = id;
        const count = seenKeys.get(baseKey) ?? 0;
        seenKeys.set(baseKey, count + 1);
        return {
          // Duplicate DOM ids can appear across nested markdown previews; keep
          // each list item unique for Svelte keyed each blocks.
          key: count === 0 ? baseKey : `${baseKey}__${count + 1}-${index}`,
          id,
          title,
          level,
          element,
        };
      })
      .filter((heading): heading is TocHeading => Boolean(heading));

    headings = next;
    if (!next.some((heading) => heading.id === activeId)) {
      activeId = next[0]?.id ?? "";
    }
  }

  function findScrollRoot(element: HTMLElement) {
    let current: HTMLElement | null = element;
    while (current) {
      const style = getComputedStyle(current);
      const overflowY = `${style.overflowY} ${style.overflow}`;
      if (/(auto|scroll)/.test(overflowY) && current.scrollHeight > current.clientHeight) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }

  function markerWidthFor(level: number) {
    const clampedLevel = Math.min(6, Math.max(1, Math.round(level)));
    return Number((1.24 - (clampedLevel - 1) * 0.16).toFixed(2));
  }

  function updateActiveHeading() {
    if (!headings.length) {
      activeId = "";
      return;
    }

    const scrollRoot = root ? findScrollRoot(root) : null;
    const rootTop = scrollRoot?.getBoundingClientRect().top ?? 0;
    const offset = 96;
    let currentHeading = headings[0];

    for (const heading of headings) {
      if (!heading.element.isConnected) continue;
      const top = heading.element.getBoundingClientRect().top - rootTop;
      if (top <= offset) {
        currentHeading = heading;
      } else {
        break;
      }
    }

    activeId = currentHeading?.id ?? "";
  }

  function handleFocusOut() {
    window.setTimeout(() => {
      if (!containerElement?.contains(document.activeElement)) {
        focusOpen = false;
      }
    }, 0);
  }

  function navigateToHeading(heading: TocHeading) {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    heading.element.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
    if (!heading.element.hasAttribute("tabindex")) {
      heading.element.setAttribute("tabindex", "-1");
    }
    heading.element.focus({ preventScroll: true });
    activeId = heading.id;
    scrollPanelItemIntoView(heading.id);
  }

  function scrollPanelItemIntoView(headingId: string) {
    requestAnimationFrame(() => {
      const item = Array.from(panelElement?.querySelectorAll<HTMLButtonElement>(".markdown-floating-toc__item") ?? [])
        .find((button) => button.dataset.headingId === headingId);

      item?.scrollIntoView({
        block: "nearest",
        inline: "nearest",
      });
    });
  }

  function handleRailHeadingClick(event: MouseEvent, heading: TocHeading) {
    event.preventDefault();
    event.stopPropagation();
    pinnedOpen = true;
    navigateToHeading(heading);
  }

  function handlePanelHeadingClick(event: MouseEvent, heading: TocHeading) {
    event.preventDefault();
    event.stopPropagation();
    navigateToHeading(heading);
    pinnedOpen = false;
  }

  function handleDocumentPointerDown(event: PointerEvent) {
    const target = event.target;
    if (target instanceof Node && containerElement?.contains(target)) return;

    hoverOpen = false;
    pinnedOpen = false;
    focusOpen = false;
  }

  $effect(() => {
    if (!root || !canCollect) {
      headings = [];
      activeId = "";
      return;
    }

    let raf = 0;
    const scheduleCollect = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(collectHeadings);
    };

    collectHeadings();

    const mutationObserver = new MutationObserver(scheduleCollect);
    mutationObserver.observe(root, {
      attributes: true,
      attributeFilter: ["id", "data-cv-heading", "data-cv-heading-level", "data-cv-heading-title"],
      childList: true,
      characterData: true,
      subtree: true,
    });

    return () => {
      cancelAnimationFrame(raf);
      mutationObserver.disconnect();
    };
  });

  $effect(() => {
    if (!root || !isVisible || !headings.length) return;

    let raf = 0;
    const scrollRoot = findScrollRoot(root);
    const scheduleUpdate = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateActiveHeading);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    scrollRoot?.addEventListener("scroll", scheduleUpdate, { passive: true });

    let intersectionObserver: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      intersectionObserver = new IntersectionObserver(scheduleUpdate, {
        root: scrollRoot,
        rootMargin: "-15% 0px -70% 0px",
        threshold: [0, 1],
      });
      for (const heading of headings) {
        intersectionObserver.observe(heading.element);
      }
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      scrollRoot?.removeEventListener("scroll", scheduleUpdate);
      intersectionObserver?.disconnect();
    };
  });

  $effect(() => {
    if (!isOpen) return;

    document.addEventListener("pointerdown", handleDocumentPointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown, true);
    };
  });
</script>

{#if isVisible}
  <div
    class={`markdown-floating-toc ${isOpen ? "is-open" : ""}`}
    role="group"
    aria-label="Document outline"
    bind:this={containerElement}
    style={`--toc-heading-count: ${headings.length}`}
    onpointerenter={() => (hoverOpen = true)}
    onpointerleave={() => (hoverOpen = false)}
    onfocusin={() => (focusOpen = true)}
    onfocusout={handleFocusOut}
  >
    <div
      class="markdown-floating-toc__rail"
      role="list"
      aria-label="Document heading markers"
    >
      {#each headings as heading (heading.key)}
        <button
          type="button"
          class="markdown-floating-toc__rail-marker"
          aria-label={`Open outline and scroll to ${heading.title}`}
          aria-current={activeId === heading.id ? "true" : undefined}
          data-level={heading.level}
          data-heading-id={heading.id}
          onclick={(event) => handleRailHeadingClick(event, heading)}
        >
          <span
            class={`markdown-floating-toc__rail-line ${activeId === heading.id ? "is-active" : ""}`}
            aria-hidden="true"
            style={`--toc-marker-width: ${markerWidthFor(heading.level)}rem`}
          ></span>
        </button>
      {/each}
    </div>

    {#if isOpen}
      <nav
        class="markdown-floating-toc__panel"
        aria-label="Markdown table of contents"
        bind:this={panelElement}
      >
        <p class="markdown-floating-toc__eyebrow">On this page</p>
        <ol>
          {#each headings as heading (heading.key)}
            <li>
              <button
                type="button"
                class={`markdown-floating-toc__item ${activeId === heading.id ? "is-active" : ""}`}
                aria-current={activeId === heading.id ? "true" : undefined}
                data-heading-id={heading.id}
                data-level={heading.level}
                style={`--toc-indent: ${(heading.level - 1) * 0.68}rem`}
                onclick={(event) => handlePanelHeadingClick(event, heading)}
              >
                {heading.title}
              </button>
            </li>
          {/each}
        </ol>
      </nav>
    {/if}
  </div>
{/if}
