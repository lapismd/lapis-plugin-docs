<script lang="ts">
	/**
	 * DESIGN_CORE_CANDIDATE: SearchableChoicePicker — ported for Docs; promote to design-core/forms later.
	 */
  import "./SearchableChoicePicker.css";
  import { Command as CommandPrimitive } from "bits-ui";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import SearchIcon from "@lucide/svelte/icons/search";
  import type { SearchableChoiceOption } from "@lapismd/design-core/forms";

  let {
    value = "",
    options,
    placeholder = "Select option",
    searchPlaceholder = "Search...",
    emptyLabel = "No options found.",
    ariaLabel = "Select option",
    allowCustom = true,
    normalize = (next: string) => next.trim().toLowerCase(),
    onChange = () => {},
  }: {
    value?: string;
    options: SearchableChoiceOption[];
    placeholder?: string;
    searchPlaceholder?: string;
    emptyLabel?: string;
    ariaLabel?: string;
    allowCustom?: boolean;
    normalize?: (value: string) => string;
    onChange?: (value: string) => void;
  } = $props();

  let open = $state(false);
  let query = $state("");
  let root = $state<HTMLElement | null>(null);

  const currentOption = $derived(
    options.find((option) => option.value === value),
  );
  const triggerLabel = $derived(
    currentOption?.label ?? (value.trim() || placeholder),
  );
  const showPlaceholder = $derived(!value.trim());

  const filteredOptions = $derived.by(() => {
    const needle = query.trim().toLowerCase();
    return options.filter((option) => {
      if (!needle) return true;
      const haystack = [
        option.value,
        option.label,
        ...(option.keywords ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  });

  const trimmedQuery = $derived(query.trim());
  const exactMatch = $derived(
    trimmedQuery.length > 0 &&
      options.some(
        (option) =>
          option.value.toLowerCase() === trimmedQuery.toLowerCase() ||
          option.label.toLowerCase() === trimmedQuery.toLowerCase(),
      ),
  );
  const canCreateCustom = $derived(
    allowCustom && trimmedQuery.length > 0 && !exactMatch,
  );

  $effect(() => {
    if (!open) return;

    let armed = false;
    const armTimer = setTimeout(() => {
      armed = true;
    }, 0);

    function handlePointerDown(event: PointerEvent) {
      if (!armed) return;
      if (!(event.target instanceof Node)) return;
      if (root?.contains(event.target)) return;
      open = false;
    }

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      clearTimeout(armTimer);
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  });

  $effect(() => {
    if (!open) query = "";
  });

  function select(nextValue: string) {
    onChange(normalize(nextValue));
    open = false;
  }

  function toggleOpen() {
    open = !open;
  }

  function handleCustomSelect() {
    if (!trimmedQuery) return;
    select(trimmedQuery);
  }
</script>

<div bind:this={root} class="cv-searchable-choice-picker" data-open={open}>
  <button
    type="button"
    class="cv-searchable-choice-trigger"
    class:is-placeholder={showPlaceholder}
    aria-label={ariaLabel}
    aria-haspopup="listbox"
    aria-expanded={open}
    onclick={toggleOpen}
  >
    <span class="cv-searchable-choice-trigger-label">{triggerLabel}</span>
    <ChevronDownIcon aria-hidden="true" />
  </button>

  {#if open}
    <div class="cv-searchable-choice-popover">
      <CommandPrimitive.Root
        class="cv-searchable-choice-command"
        label={ariaLabel}
        shouldFilter={false}
        loop
      >
        <div class="cv-searchable-choice-command-input-row">
          <SearchIcon aria-hidden="true" />
          <CommandPrimitive.Input
            bind:value={query}
            class="cv-searchable-choice-command-input"
            placeholder={searchPlaceholder}
          />
        </div>
        <CommandPrimitive.List class="cv-searchable-choice-command-list">
          {#if filteredOptions.length > 0}
            <CommandPrimitive.Group
              class="cv-searchable-choice-command-group"
              value="options"
              forceMount
            >
              <CommandPrimitive.GroupItems>
                {#each filteredOptions as option (option.value)}
                  <CommandPrimitive.Item
                    class={[
                      "cv-searchable-choice-command-item",
                      option.value === value && "is-active",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    value={option.value}
                    keywords={[option.label, ...(option.keywords ?? [])]}
                    onSelect={() => select(option.value)}
                  >
                    <span class="cv-searchable-choice-option-label">
                      {option.label}
                    </span>
                    {#if option.label.toLowerCase() !== option.value.toLowerCase()}
                      <span class="cv-searchable-choice-option-value">
                        {option.value}
                      </span>
                    {/if}
                  </CommandPrimitive.Item>
                {/each}
              </CommandPrimitive.GroupItems>
            </CommandPrimitive.Group>
          {/if}

          {#if canCreateCustom}
            <CommandPrimitive.Group
              class="cv-searchable-choice-command-group"
              value="create"
              forceMount
            >
              <CommandPrimitive.GroupItems>
                <CommandPrimitive.Item
                  class="cv-searchable-choice-command-item"
                  value={`__create__:${trimmedQuery}`}
                  onSelect={handleCustomSelect}
                >
                  <span class="cv-searchable-choice-create-label">
                    Use "{trimmedQuery}"
                  </span>
                </CommandPrimitive.Item>
              </CommandPrimitive.GroupItems>
            </CommandPrimitive.Group>
          {:else if filteredOptions.length === 0}
            <CommandPrimitive.Empty
              class="cv-searchable-choice-empty"
              forceMount
            >
              {emptyLabel}
            </CommandPrimitive.Empty>
          {/if}
        </CommandPrimitive.List>
      </CommandPrimitive.Root>
    </div>
  {/if}
</div>
