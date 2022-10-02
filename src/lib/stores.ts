import type Monaco from "monaco-editor";
import type { EditorView } from "codemirror";
import { writable } from "svelte/store";


export const editor = writable<Monaco.editor.IStandaloneCodeEditor>()
export const fileHandle = writable<FileSystemFileHandle>()