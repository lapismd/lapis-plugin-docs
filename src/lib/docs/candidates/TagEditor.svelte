<script lang="ts">
	/**
	 * DESIGN_CORE_CANDIDATE: TagEditor is a thin ChipAutocomplete wrapper.
	 * Prefer promoting to design-core/forms when shared consumers need it.
	 */
	import ChipAutocomplete from "@lapismd/design-core/forms/ChipAutocomplete.svelte";

	let {
		value = [],
		suggestions = [],
		label = "Tags",
		showLabel = true,
		placeholder = "Add tag...",
		id = undefined,
		embedded = false,
		uppercase = true,
		onChange = () => {}
	}: {
		value?: string[];
		suggestions?: string[];
		label?: string;
		showLabel?: boolean;
		placeholder?: string;
		id?: string;
		embedded?: boolean;
		uppercase?: boolean;
		onChange?: (tags: string[]) => void | Promise<void>;
	} = $props();
</script>

<ChipAutocomplete {value} {suggestions} {label} {showLabel} {placeholder} {id} {embedded} {uppercase} {onChange} />
