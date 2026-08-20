<script lang="ts">
	/**
	 * DESIGN_CORE_CANDIDATE: WorkspaceHistoryControls — ported for Docs; promote to design-core/forms later.
	 */
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';

	let {
		ariaLabel = 'Workspace history navigation',
		class: className = '',
		onNavigate = defaultNavigate
	}: {
		ariaLabel?: string;
		class?: string;
		onNavigate?: (direction: -1 | 1) => void | Promise<void>;
	} = $props();

	let pointerActionHandled = false;

	function defaultNavigate(direction: -1 | 1) {
		if (typeof window === 'undefined') return;
		window.history.go(direction);
	}

	function runPointerAction(event: PointerEvent, direction: -1 | 1) {
		pointerActionHandled = true;
		event.preventDefault();
		event.stopPropagation();
		void onNavigate(direction);
		setTimeout(() => {
			pointerActionHandled = false;
		}, 0);
	}

	function runKeyboardAction(event: MouseEvent, direction: -1 | 1) {
		event.stopPropagation();
		if (pointerActionHandled) return;
		void onNavigate(direction);
	}
</script>

<div
	class={`workspace-history-controls topbar-history-controls ${className}`.trim()}
	role="group"
	aria-label={ariaLabel}
>
	<button
		type="button"
		aria-label="Go back"
		title="Go back"
		onpointerdown={(event) => runPointerAction(event, -1)}
		onclick={(event) => runKeyboardAction(event, -1)}
	>
		<ArrowLeftIcon aria-hidden="true" />
	</button>
	<button
		type="button"
		aria-label="Go forward"
		title="Go forward"
		onpointerdown={(event) => runPointerAction(event, 1)}
		onclick={(event) => runKeyboardAction(event, 1)}
	>
		<ArrowRightIcon aria-hidden="true" />
	</button>
</div>

<style>
	.workspace-history-controls.topbar-history-controls {
		display: inline-flex;
		flex: 0 0 auto;
		align-self: center;
		inline-size: max-content;
		min-inline-size: max-content;
		overflow: hidden;
		border: 1px solid var(--workspace-history-border, var(--border));
		border-radius: 0.45rem;
		background: var(--workspace-history-background, var(--background));
		box-shadow: 0 1px 2px var(--workspace-history-shadow, rgb(0 0 0 / 0.08));
	}

	.workspace-history-controls.topbar-history-controls button {
		display: grid;
		flex: 0 0 2rem;
		width: 2rem;
		height: 2rem;
		min-height: 2rem;
		place-items: center;
		border: 0;
		border-radius: 0;
		background: transparent;
		color: inherit;
		cursor: pointer;
		font: inherit;
		padding: 0;
	}

	.workspace-history-controls button:hover,
	.workspace-history-controls button:focus-visible {
		outline: 0;
		background: var(
			--workspace-history-hover-background,
			color-mix(in srgb, var(--muted-foreground) 10%, transparent)
		);
		color: var(--workspace-history-hover-foreground, currentColor);
	}

	.workspace-history-controls :global(svg) {
		width: 1rem;
		height: 1rem;
		flex: none;
	}
</style>
