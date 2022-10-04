import { editor, Uri } from "monaco-editor";
import { Store } from "./store.ts";

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

export function onSave(fileHandle: FileSystemFileHandle, editorInstance: editor.IStandaloneCodeEditor) {
	writeFile(fileHandle, editorInstance.getValue())
}

export async function onOpen(store: Store, editorInstance: editor.IStandaloneCodeEditor) {
	const fh = await getFileHandle();
	const file = await fh.getFile();

	editor.getModels().forEach((model) => model.dispose());
	editorInstance.setModel(editor.createModel(await file.text(), undefined, Uri.file(file.name)));

	store.set("fileHandle", fh);
}

export function onClose(editorInstance: editor.IStandaloneCodeEditor) {
	editorInstance.setValue("");
}