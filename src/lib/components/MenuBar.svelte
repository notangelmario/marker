<script lang="ts">
	import { openFile } from "../file";
	import { editor } from "../stores";


	async function getFile() {
		const text = await openFile();

		$editor.dispatch({
			changes: { from: 0, to: $editor.state.doc.length, insert: text }
		})
	}
</script>

<div>
	<button on:click={getFile}>Open File</button>
</div>