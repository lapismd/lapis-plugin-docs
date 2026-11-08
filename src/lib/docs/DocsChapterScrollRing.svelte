<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';

	let {
		chapterScrollPercent = 0
	}: {
		chapterScrollPercent?: number;
	} = $props();

	const chapterPercent = $derived(Math.max(0, Math.min(100, Math.round(chapterScrollPercent))));
	const ringRadius = 15.5;
	const ringCircumference = 2 * Math.PI * ringRadius;
	const chapterRingOffset = $derived(ringCircumference * (1 - chapterPercent / 100));
</script>

<div
	class="docs-chapter-scroll-ring"
	role="progressbar"
	aria-label="Chapter scroll progress"
	aria-valuemin={0}
	aria-valuemax={100}
	aria-valuenow={chapterPercent}
>
	<svg viewBox="0 0 36 36" aria-hidden="true">
		<circle class="docs-chapter-scroll-ring__track" cx="18" cy="18" r={ringRadius}></circle>
		<circle
			class="docs-chapter-scroll-ring__fill"
			cx="18"
			cy="18"
			r={ringRadius}
			stroke-dasharray={ringCircumference}
			stroke-dashoffset={chapterRingOffset}
		></circle>
	</svg>
	{#if chapterPercent >= 100}
		<span class="docs-chapter-scroll-ring__check"><CheckIcon /></span>
	{:else}
		<span class="docs-chapter-scroll-ring__label">{chapterPercent}%</span>
	{/if}
</div>

<style>
	.docs-chapter-scroll-ring {
		position: relative;
		z-index: 36;
		display: grid;
		width: 2.35rem;
		height: 2.35rem;
		place-items: center;
		border-radius: 999px;
		background: color-mix(in srgb, var(--background) 95%, transparent);
		box-shadow: 0 0.55rem 1.2rem color-mix(in srgb, var(--foreground) 10%, transparent);
		backdrop-filter: blur(10px);
		pointer-events: none;
	}

	.docs-chapter-scroll-ring svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		transform: rotate(-90deg);
	}

	.docs-chapter-scroll-ring__track,
	.docs-chapter-scroll-ring__fill {
		fill: none;
		stroke-width: 3;
	}

	.docs-chapter-scroll-ring__track {
		stroke: color-mix(in srgb, var(--border) 85%, transparent);
	}

	.docs-chapter-scroll-ring__fill {
		stroke: color-mix(in srgb, var(--primary) 72%, #22c55e);
		stroke-linecap: round;
		transition: stroke-dashoffset 80ms linear;
	}

	.docs-chapter-scroll-ring__label,
	.docs-chapter-scroll-ring__check {
		position: relative;
		z-index: 1;
		color: var(--foreground);
		font-size: 0.58rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.docs-chapter-scroll-ring__check {
		display: grid;
		place-items: center;
		color: #16a34a;
	}

	.docs-chapter-scroll-ring__check :global(svg) {
		width: 0.85rem;
		height: 0.85rem;
	}
</style>
