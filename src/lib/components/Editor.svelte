<script lang="ts">
	import { editor as monacoEditor, KeyMod, KeyCode } from "monaco-editor";
	import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
    import typescriptWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
    import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
	import { editor, fileHandle } from "../stores";
	import { writeFile } from "../file";
	import { onMount } from "svelte";

	let editorWrapper;

	function onSave() {
		writeFile($fileHandle, $editor.getValue())
	}

	onMount(() => {
		// @ts-ignore
        self.MonacoEnvironment = {
            getWorker: function (_moduleId: any, label: string) {
                if (label === "typescript") {
                    return new typescriptWorker();
                }
				if (label === "json") {
					return new jsonWorker();
				}
                return new editorWorker();
            }
        };

		const editorInstance = monacoEditor.create(editorWrapper, {
			language: "typescript",
		})

		editorInstance.addCommand(KeyMod.CtrlCmd | KeyCode.KeyS, onSave);

		editor.set(editorInstance);
	})
</script>

<div bind:this={editorWrapper} class="editor-wrapper"></div>


<style scoped>
	.editor-wrapper {
		width: 100%;
		flex: 1;
		overflow-y: scroll;
	}
</style>
