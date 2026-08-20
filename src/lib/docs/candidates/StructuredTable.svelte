<script lang="ts">
	/**
	 * DESIGN_CORE_CANDIDATE: StructuredTable — ported for Docs; promote to design-core/forms later.
	 */
	let {
		columns = [],
		rows = [],
		empty = ''
	}: {
		columns?: string[];
		rows?: string[][];
		empty?: string;
	} = $props();

	const visibleColumns = $derived(columns.filter((column) => column.trim()));
</script>

{#if visibleColumns.length}
	<div class="cv-structured-table-wrap">
		<table class="cv-structured-table">
			<thead>
				<tr>
					{#each visibleColumns as column, columnIndex (`${column}-${columnIndex}`)}
						<th>{column}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each rows as row, rowIndex (rowIndex)}
					<tr>
						{#each visibleColumns as _, cellIndex (cellIndex)}
							<td>{row[cellIndex] ?? ''}</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else if empty}
	<p class="cv-structured-table-empty">{empty}</p>
{/if}

<style>
	.cv-structured-table-wrap {
		overflow-x: auto;
		width: 100%;
	}

	.cv-structured-table {
		width: 100%;
		border: 1px solid var(--kanban-border, rgb(226 232 240));
		border-collapse: separate;
		border-radius: 0.6rem;
		border-spacing: 0;
		background: var(--kanban-card, rgb(255 255 255));
		font-size: 0.92rem;
		overflow: hidden;
	}

	.cv-structured-table th,
	.cv-structured-table td {
		border-bottom: 1px solid color-mix(in srgb, var(--kanban-border, rgb(226 232 240)) 84%, transparent);
		padding: 0.55rem 0.7rem;
		text-align: left;
		vertical-align: top;
	}

	.cv-structured-table th {
		background: color-mix(in srgb, var(--card-color, var(--column-color, var(--kanban-accent, rgb(14 165 233)))) 10%, var(--kanban-card, rgb(255 255 255)));
		font-size: 0.78rem;
		font-weight: 900;
		white-space: nowrap;
	}

	.cv-structured-table th + th,
	.cv-structured-table td + td {
		border-left: 1px solid color-mix(in srgb, var(--kanban-border, rgb(226 232 240)) 74%, transparent);
	}

	.cv-structured-table tbody tr:nth-child(even) td {
		background: color-mix(in srgb, var(--kanban-card-foreground, rgb(15 23 42)) 3%, transparent);
	}

	.cv-structured-table tbody tr:last-child td {
		border-bottom: 0;
	}

	.cv-structured-table td {
		overflow-wrap: anywhere;
	}

	.cv-structured-table-empty {
		margin: 0;
		color: var(--kanban-muted);
		font-size: 0.85rem;
		font-weight: 700;
	}
</style>
