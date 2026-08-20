<script lang="ts">
	/**
	 * DESIGN_CORE_CANDIDATE: ChoiceMenu — ported for Docs; promote to design-core/forms later.
	 */
  let {
    value,
    options,
    labels = {},
    ariaLabel,
    onChange = () => {},
  }: {
    value: string;
    options: string[];
    labels?: Record<string, string>;
    ariaLabel: string;
    onChange?: (value: string) => void;
  } = $props();
</script>

<details class="cv-form-choice-menu">
  <summary aria-label={ariaLabel}>{labels[value] ?? value}</summary>
  <div>
    {#each options as option (option)}
      <button
        type="button"
        class:active={value === option}
        onclick={(event) => {
          onChange(option);
          const details = event.currentTarget.closest("details");
          if (details) details.open = false;
        }}
      >
        {labels[option] ?? option}
      </button>
    {/each}
  </div>
</details>

<style>
  .cv-form-choice-menu {
    position: relative;
    width: fit-content;
    max-width: 100%;
  }

  .cv-form-choice-menu summary {
    display: inline-flex;
    min-height: 1.65rem;
    align-items: center;
    border: 1px solid var(--cv-form-border, var(--kanban-border, var(--border)));
    border-radius: 999px;
    color: var(--cv-form-muted, var(--kanban-muted, var(--muted-foreground)));
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 650;
    list-style: none;
    padding: 0 0.75rem;
  }

  .cv-form-choice-menu summary::-webkit-details-marker {
    display: none;
  }

  .cv-form-choice-menu summary:hover,
  .cv-form-choice-menu summary:focus-visible {
    color: var(
      --cv-form-foreground,
      var(--kanban-foreground, var(--foreground))
    );
    outline: 0;
  }

  .cv-form-choice-menu > div {
    position: absolute;
    top: calc(100% + 0.3rem);
    right: 0;
    z-index: 30;
    display: grid;
    min-width: 10rem;
    gap: 0.15rem;
    border: 1px solid var(--cv-form-border, var(--kanban-border, var(--border)));
    border-radius: 0.4rem;
    background: var(--cv-form-popover, var(--kanban-card, var(--popover)));
    box-shadow: 0 1rem 2rem
      var(--cv-form-shadow, var(--kanban-shadow, rgb(15 23 42 / 12%)));
    padding: 0.35rem;
  }

  .cv-form-choice-menu button {
    min-height: 1.75rem;
    border: 0;
    border-radius: 0.25rem;
    background: transparent;
    color: var(
      --cv-form-foreground,
      var(--kanban-foreground, var(--foreground))
    );
    cursor: pointer;
    font: inherit;
    font-size: 0.8rem;
    text-align: left;
    padding: 0 0.5rem;
  }

  .cv-form-choice-menu button:hover,
  .cv-form-choice-menu button:focus-visible,
  .cv-form-choice-menu button.active {
    background: var(
      --cv-form-selection,
      color-mix(in srgb, var(--card-color, var(--primary)) 12%, transparent)
    );
    outline: 0;
  }
</style>
