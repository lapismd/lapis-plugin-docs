<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';

	let {
		chapterScrollPercent = 0,
		documentRoot = null
	}: {
		chapterScrollPercent?: number;
		documentRoot?: HTMLElement | null;
	} = $props();

	let ringElement = $state<HTMLElement | null>(null);

	const chapterPercent = $derived(Math.max(0, Math.min(100, Math.round(chapterScrollPercent))));
	const ringRadius = 15.5;
	const ringCircumference = 2 * Math.PI * ringRadius;
	const chapterRingOffset = $derived(ringCircumference * (1 - chapterPercent / 100));

	function fallbackPosition(ring: HTMLElement) {
		const ringSize = ring.offsetWidth || 38;
		const styles = getComputedStyle(document.documentElement);
		const gutterRaw = styles.getPropertyValue('--markdown-floating-toc-gutter').trim();
		const scrollbarRaw = styles
			.getPropertyValue('--markdown-floating-toc-scrollbar-offset')
			.trim();
		const gutter = Number.parseFloat(gutterRaw) || 1.45;
		const scrollbarOffset = Number.parseFloat(scrollbarRaw) || 1;
		const gutterPx = gutterRaw.endsWith('rem') || !gutterRaw ? gutter * 16 : gutter;
		const scrollbarPx = scrollbarRaw.endsWith('rem') || !scrollbarRaw ? scrollbarOffset * 16 : scrollbarOffset;
		const edge = 0.8 * 16 + scrollbarPx;
		const centerFromRight = edge + gutterPx / 2;
		const top = Math.max(12, window.innerHeight / 2 - ringSize - 24);
		ring.style.top = `${top}px`;
		ring.style.left = 'auto';
		ring.style.right = `${Math.max(0, centerFromRight - ringSize / 2)}px`;
	}

	function positionAboveTocRail() {
		const ring = ringElement;
		if (!ring) return;

		const rail =
			documentRoot?.querySelector<HTMLElement>('.markdown-floating-toc__rail') ??
			document.querySelector<HTMLElement>('.markdown-floating-toc__rail');
		if (!rail) {
			fallbackPosition(ring);
			return;
		}

		const rect = rail.getBoundingClientRect();
		if (rect.width <= 0 || rect.height <= 0) {
			fallbackPosition(ring);
			return;
		}

		const ringSize = ring.offsetWidth || 38;
		const gap = 10;
		const top = Math.max(12, rect.top - ringSize - gap);
		const left = rect.left + rect.width / 2 - ringSize / 2;
		ring.style.top = `${top}px`;
		ring.style.left = `${left}px`;
		ring.style.right = 'auto';
	}

	$effect(() => {
		chapterScrollPercent;
		documentRoot;
		const ring = ringElement;
		if (!ring) return;

		positionAboveTocRail();

		const onUpdate = () => positionAboveTocRail();
		window.addEventListener('resize', onUpdate);
		window.addEventListener('scroll', onUpdate, true);

		const resizeObserver =
			typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onUpdate) : null;
		const rail =
			documentRoot?.querySelector<HTMLElement>('.markdown-floating-toc__rail') ??
			document.querySelector<HTMLElement>('.markdown-floating-toc__rail');
		if (rail && resizeObserver) resizeObserver.observe(rail);

		const mutationObserver =
			documentRoot && typeof MutationObserver !== 'undefined'
				? new MutationObserver(onUpdate)
				: null;
		if (documentRoot && mutationObserver) {
			mutationObserver.observe(documentRoot, {
				childList: true,
				subtree: true,
				attributes: true,
				attributeFilter: ['class', 'style']
			});
		}

		const timer = setTimeout(onUpdate, 0);
		return () => {
			clearTimeout(timer);
			window.removeEventListener('resize', onUpdate);
			window.removeEventListener('scroll', onUpdate, true);
			resizeObserver?.disconnect();
			mutationObserver?.disconnect();
		};
	});
</script>

<div
	bind:this={ringElement}
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
		position: fixed;
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
