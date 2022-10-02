<script lang="ts">
	import { basicSetup } from "codemirror";
	import { editor as monacoEditor } from "monaco-editor";
	import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
    import typescriptWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
	import { EditorView, keymap } from "@codemirror/view";
	import { EditorState } from "@codemirror/state";
	import { indentWithTab } from "@codemirror/commands"
	import { javascript } from "@codemirror/lang-javascript";
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
                return new editorWorker();
            }
        };

		editor.set(monacoEditor.create(editorWrapper, {
			language: "typescript"
		}))
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
