<script lang="ts">
	/**
	 * DESIGN_CORE_CANDIDATE: StructuredTableEditor — ported for Docs; promote to design-core/forms later.
	 */
	import ArrowDownIcon from '@lucide/svelte/icons/arrow-down';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import ArrowUpIcon from '@lucide/svelte/icons/arrow-up';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { autosizeTextarea } from '@lapismd/design-core/forms';

	type TablePatch = {
		columns: string[];
		rows: string[][];
	};

	let {
		columns = [],
		rows = [],
		onChange = () => {}
	}: {
		columns?: string[];
		rows?: string[][];
		onChange?: (table: TablePatch) => void;
	} = $props();

	const normalizedColumns = $derived(columns.length ? columns : ['Column']);
	const normalizedRows = $derived(rows.length ? normalizeRows(rows, normalizedColumns.length) : [[]]);

	function emit(nextColumns: string[], nextRows: string[][]) {
		onChange({
			columns: nextColumns,
			rows: normalizeRows(nextRows, nextColumns.length)
		});
	}

	function updateColumn(index: number, value: string) {
		const nextColumns = [...normalizedColumns];
		nextColumns[index] = value;
		emit(nextColumns, normalizedRows);
	}

	function addColumn() {
		const nextColumns = [...normalizedColumns, `Column ${normalizedColumns.length + 1}`];
		emit(
			nextColumns,
			normalizedRows.map((row) => [...row, ''])
		);
	}

	function removeColumn(index: number) {
		const nextColumns = normalizedColumns.filter((_, columnIndex) => columnIndex !== index);
		const safeColumns = nextColumns.length ? nextColumns : ['Column'];
		emit(
			safeColumns,
			normalizedRows.map((row) => row.filter((_, cellIndex) => cellIndex !== index))
		);
	}

	function moveColumn(index: number, direction: -1 | 1) {
		const targetIndex = index + direction;
		if (targetIndex < 0 || targetIndex >= normalizedColumns.length) return;

		const nextColumns = [...normalizedColumns];
		[nextColumns[index], nextColumns[targetIndex]] = [nextColumns[targetIndex], nextColumns[index]];

		const nextRows = normalizedRows.map((row) => {
			const nextRow = [...row];
			[nextRow[index], nextRow[targetIndex]] = [nextRow[targetIndex], nextRow[index]];
			return nextRow;
		});

		emit(nextColumns, nextRows);
	}

	function updateCell(rowIndex: number, columnIndex: number, value: string) {
		const nextRows = normalizedRows.map((row, index) => (index === rowIndex ? [...row] : row));
		nextRows[rowIndex][columnIndex] = value;
		emit(normalizedColumns, nextRows);
	}

	function addRow() {
		emit(normalizedColumns, [...normalizedRows, Array.from({ length: normalizedColumns.length }, () => '')]);
	}

	function removeRow(index: number) {
		const nextRows = normalizedRows.filter((_, rowIndex) => rowIndex !== index);
		emit(normalizedColumns, nextRows.length ? nextRows : [[]]);
	}

	function moveRow(index: number, direction: -1 | 1) {
		const targetIndex = index + direction;
		if (targetIndex < 0 || targetIndex >= normalizedRows.length) return;

		const nextRows = normalizedRows.map((row) => [...row]);
		[nextRows[index], nextRows[targetIndex]] = [nextRows[targetIndex], nextRows[index]];
		emit(normalizedColumns, nextRows);
	}

	function normalizeRows(value: string[][], width: number) {
		return value.map((row) => Array.from({ length: width }, (_, index) => row[index] ?? ''));
	}
</script>

<div class="cv-structured-table-editor">
	<div class="cv-structured-table-editor__scroll">
		<table>
			<thead>
				<tr>
					{#each normalizedColumns as column, columnIndex (columnIndex)}
						<th>
							<div class="cv-structured-table-editor__header-cell">
								<input
									aria-label={`Column ${columnIndex + 1}`}
									value={column}
									placeholder={`Column ${columnIndex + 1}`}
									oninput={(event) => updateColumn(columnIndex, event.currentTarget.value)}
								/>
								<div class="cv-structured-table-editor__cell-actions">
									<button
										type="button"
										aria-label={`Move column ${columnIndex + 1} left`}
										disabled={columnIndex === 0}
										onclick={() => moveColumn(columnIndex, -1)}
									>
										<ArrowLeftIcon aria-hidden="true" />
									</button>
									<button
										type="button"
										aria-label={`Move column ${columnIndex + 1} right`}
										disabled={columnIndex === normalizedColumns.length - 1}
										onclick={() => moveColumn(columnIndex, 1)}
									>
										<ArrowRightIcon aria-hidden="true" />
									</button>
									<button
										type="button"
										aria-label={`Remove column ${columnIndex + 1}`}
										onclick={() => removeColumn(columnIndex)}
									>
										<Trash2Icon aria-hidden="true" />
									</button>
								</div>
							</div>
						</th>
					{/each}
					<th class="cv-structured-table-editor__action-column">
						<button type="button" aria-label="Add column" onclick={addColumn}>
							<PlusIcon aria-hidden="true" />
						</button>
					</th>
				</tr>
			</thead>
			<tbody>
				{#each normalizedRows as row, rowIndex (rowIndex)}
					<tr>
						{#each normalizedColumns as _, columnIndex (columnIndex)}
							<td>
								<textarea
									rows="1"
									aria-label={`Row ${rowIndex + 1} column ${columnIndex + 1}`}
									value={row[columnIndex] ?? ''}
									placeholder="Add value"
									use:autosizeTextarea={row[columnIndex] ?? ''}
									oninput={(event) =>
										updateCell(rowIndex, columnIndex, event.currentTarget.value)}
								></textarea>
							</td>
						{/each}
						<td class="cv-structured-table-editor__action-column">
							<div class="cv-structured-table-editor__row-actions">
								<div class="cv-structured-table-editor__row-move">
									<button
										type="button"
										aria-label={`Move row ${rowIndex + 1} up`}
										disabled={rowIndex === 0}
										onclick={() => moveRow(rowIndex, -1)}
									>
										<ArrowUpIcon aria-hidden="true" />
									</button>
									<button
										type="button"
										aria-label={`Move row ${rowIndex + 1} down`}
										disabled={rowIndex === normalizedRows.length - 1}
										onclick={() => moveRow(rowIndex, 1)}
									>
										<ArrowDownIcon aria-hidden="true" />
									</button>
								</div>
								<button type="button" aria-label={`Remove row ${rowIndex + 1}`} onclick={() => removeRow(rowIndex)}>
									<Trash2Icon aria-hidden="true" />
								</button>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<button type="button" class="cv-structured-table-editor__add-row" onclick={addRow}>
		<PlusIcon aria-hidden="true" />
		Add row
	</button>
</div>

<style>
	.cv-structured-table-editor {
		display: grid;
		gap: 0.55rem;
		width: 100%;
		padding-top: 0.35rem;
	}

	.cv-structured-table-editor__scroll {
		overflow-x: auto;
		border: 1px solid var(--kanban-border, rgb(226 232 240));
		border-radius: 0.6rem;
		background: var(--kanban-card, rgb(255 255 255));
	}

	.cv-structured-table-editor table {
		width: 100%;
		min-width: 28rem;
		border-collapse: separate;
		border-spacing: 0;
	}

	.cv-structured-table-editor th,
	.cv-structured-table-editor td {
		border-bottom: 1px solid color-mix(in srgb, var(--kanban-border, rgb(226 232 240)) 82%, transparent);
		padding: 0;
		vertical-align: top;
	}

	.cv-structured-table-editor thead th {
		background: color-mix(in srgb, var(--card-color, var(--column-color, var(--kanban-accent, rgb(14 165 233)))) 9%, transparent);
	}

	.cv-structured-table-editor th + th,
	.cv-structured-table-editor td + td {
		border-left: 1px solid color-mix(in srgb, var(--kanban-border, rgb(226 232 240)) 72%, transparent);
	}

	.cv-structured-table-editor tbody tr:last-child td {
		border-bottom: 0;
	}

	.cv-structured-table-editor__header-cell {
		display: grid;
		grid-template-columns: minmax(8rem, 1fr) auto;
		align-items: center;
		min-height: 2.35rem;
	}

	.cv-structured-table-editor input,
	.cv-structured-table-editor textarea {
		width: 100%;
		border: 0;
		background: transparent;
		color: inherit;
		font: inherit;
		outline: 0;
		padding: 0.48rem 0.58rem;
	}

	.cv-structured-table-editor input {
		font-size: 0.8rem;
		font-weight: 900;
	}

	.cv-structured-table-editor textarea {
		min-height: 2.25rem;
		resize: none;
	}

	.cv-structured-table-editor button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: 0;
		background: transparent;
		color: var(--kanban-muted);
		cursor: pointer;
		font: inherit;
		font-size: 0.82rem;
		font-weight: 800;
	}

	.cv-structured-table-editor button:hover,
	.cv-structured-table-editor button:focus-visible {
		background: color-mix(in srgb, var(--kanban-card-foreground, rgb(15 23 42)) 6%, transparent);
		color: var(--kanban-card-foreground, rgb(15 23 42));
		outline: 0;
	}

	.cv-structured-table-editor button:disabled {
		cursor: default;
		opacity: 0.35;
	}

	.cv-structured-table-editor button:disabled:hover,
	.cv-structured-table-editor button:disabled:focus-visible {
		background: transparent;
		color: var(--kanban-muted);
	}

	.cv-structured-table-editor button :global(svg) {
		width: 0.95rem;
		height: 0.95rem;
	}

	.cv-structured-table-editor__action-column {
		width: 5.75rem;
		min-width: 5.75rem;
		text-align: center;
	}

	.cv-structured-table-editor tbody .cv-structured-table-editor__action-column {
		vertical-align: middle;
	}

	.cv-structured-table-editor__action-column button {
		width: 1.62rem;
		min-height: 1.62rem;
		border-radius: 0.28rem;
		padding: 0;
	}

	.cv-structured-table-editor thead .cv-structured-table-editor__action-column button {
		width: 100%;
		min-height: 2.35rem;
		border-radius: 0;
	}

	.cv-structured-table-editor__cell-actions,
	.cv-structured-table-editor__row-actions {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.12rem;
		padding-inline: 0 0.25rem;
	}

	.cv-structured-table-editor__row-actions {
		min-height: 2.25rem;
	}

	.cv-structured-table-editor__row-move {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0;
	}

	.cv-structured-table-editor__row-actions button {
		width: 1rem;
		min-height: 1rem;
		border-radius: 0.25rem;
	}

	.cv-structured-table-editor__row-actions button :global(svg) {
		width: 0.75rem;
		height: 0.75rem;
	}

	.cv-structured-table-editor__add-row {
		justify-self: start;
		gap: 0.4rem;
		border: 1px dashed var(--kanban-border, rgb(226 232 240)) !important;
		border-radius: 999px;
		padding: 0.38rem 0.75rem;
	}
</style>
