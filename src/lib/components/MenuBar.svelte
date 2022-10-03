<script lang="ts">
	import { editor as monacoEditor } from "monaco-editor";
	import { fileType, getFileHandle, writeFile } from "../file";
	import { editor, fileHandle as fileHandleStore } from "../stores";


	async function openFileClick() {
		const fileHandle = await getFileHandle();
		const file = await fileHandle.getFile();

		fileHandleStore.set(fileHandle);

		const newModel = monacoEditor.createModel(await file.text(), fileType.get(file.name.match(/\.[0-9a-z]+$/i)[0].slice(1)) ?? undefined)

		$editor.setModel(newModel);
	}

	function saveFileClick() {
		writeFile($fileHandleStore, $editor.getValue())
	}

	function closeFileClick() {
		$editor.setValue("");

		fileHandleStore.set(undefined);
	}
</script>

<ul class="menuBarWrapper">
	<li>
		<span>
			File
		</span>
		<div>
			<button on:click={openFileClick}>Open File...</button>
			<button on:click={saveFileClick} disabled={!$fileHandleStore}>Save File</button>
			<button on:click={closeFileClick} disabled={!$fileHandleStore}>Close File</button>
		</div>
	</li>
</ul>

<style scoped>
	.menuBarWrapper {
		display: flex;
		flex-flow: row;
		flex-wrap: nowrap;
	}

	.menuBarWrapper li > span {
		padding: .25rem .5rem;
		cursor: default;
		background-color: #fff;
	}

	.menuBarWrapper li > span:hover {
		filter: brightness(.9);
	}

	.menuBarWrapper li:hover > div {
		display: flex;
	}

	.menuBarWrapper li > div {
		position: absolute;
		display: none;
		z-index: 999;
		flex-flow: column;
		background-color: #fff;
		padding: .5rem 0;
		outline: 1px solid #000;
		border-radius: 0 .5rem .5rem .5rem;
	}

	button {
		background-color: #fff;
		outline: none;
		border: none;
		padding: .25rem .5rem;
		width: 10rem;
		text-align: left;
	}

	button:hover {
		filter: brightness(.9);
	}
</style>