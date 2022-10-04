import * as monaco from "monaco-editor";
import { fileTypes } from "./languages";
import { Store } from "./store";


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

export function onSave(fileHandle: FileSystemFileHandle, editor: monaco.editor.IStandaloneCodeEditor) {
	writeFile(fileHandle, editor.getValue())
}

export async function onOpen(store: Store, editor: monaco.editor.IStandaloneCodeEditor) {
	const fh = await getFileHandle();
	const file = await fh.getFile();

	const ext = getExtension(file.name);

	monaco.editor.getModels().forEach((model) => model.dispose());
	editor.setModel(monaco.editor.createModel(await file.text(), fileTypes.get(ext), monaco.Uri.file(file.name)));

	store.set("fileHandle", fh);
}

export function onClose(editor: monaco.editor.IStandaloneCodeEditor) {
	editor.setValue("");
}

export function getExtension(fname: string) {
	return fname.slice((Math.max(0, fname.lastIndexOf(".")) || Infinity) + 1);
}