import type { EditorView } from "codemirror";
import { writable } from "svelte/store";


export const editor = writable<EditorView>()
export const fileHandle = writable<FileSystemFileHandle>()