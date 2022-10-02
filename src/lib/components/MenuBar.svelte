<script lang="ts">
	import { getFileHandle, writeFile } from "../file";
	import { editor, fileHandle as fileHandleStore } from "../stores";


	async function openFileClick() {
		const fileHandle = await getFileHandle();
		const file = await fileHandle.getFile();

		fileHandleStore.set(fileHandle);

		$editor.dispatch({
			changes: { from: 0, to: $editor.state.doc.length, insert: await file.text() }
		})
	}

	function saveFileClick() {
		writeFile($fileHandleStore, $editor.state.doc as unknown as string)
	}
</script>

<div class="menuBarWrapper">
	<button on:click={openFileClick}>Open File</button>
	<button on:click={saveFileClick} disabled={!$fileHandleStore}>Save File</button>
</div>

<style scoped>
	.menuBarWrapper {
		display: flex;
		flex-flow: row;
		flex-wrap: nowrap;
	}
</style>