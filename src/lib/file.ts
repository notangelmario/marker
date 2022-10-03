import { get } from 'svelte/store';
import { editor as monacoEditor, Uri } from "monaco-editor";
import { fileHandle, editor } from "./stores";

export async function getFileHandle() {
	const [fileSystemHandle] = await window.showOpenFilePicker();

	return fileSystemHandle
}

export async function writeFile(fileHandle: FileSystemFileHandle, contents: string) {
	const writable = await fileHandle.createWritable();
	await writable.write({
		data: contents,
		type: "write"
	});
	await writable.close();
}

export function onSave() {
	writeFile(get(fileHandle), get(editor).getValue())
}

export async function onOpen() {
	const fh = await getFileHandle();
	const file = await fh.getFile();

	fileHandle.set(fh);
	const newModel = monacoEditor.createModel(await file.text(), undefined, Uri.file(file.name))

	get(editor).setModel(newModel);
}

export function onClose() {
	get(editor).setValue("");

	fileHandle.set(undefined);
}