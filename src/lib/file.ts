import monaco from "./monaco";
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

export async function setEditorText(editor: monaco.editor.IStandaloneCodeEditor, fileHandle: FileSystemFileHandle, store: Store, fileAvailableContext: monaco.editor.IContextKey<boolean>) {
	const file = await fileHandle.getFile();

	const ext = getExtension(file.name);

	monaco.editor.getModels().forEach((model) => model.dispose());
	editor.setModel(monaco.editor.createModel(await file.text(), fileTypes.get(ext), monaco.Uri.file(file.name)));

	fileAvailableContext.set(true);
	store.set("fileHandle", fileHandle);
}


export function onSave(fileHandle: FileSystemFileHandle, editor: monaco.editor.IStandaloneCodeEditor) {
	writeFile(fileHandle, editor.getValue())
}


export async function onOpen(store: Store, editor: monaco.editor.IStandaloneCodeEditor, fileAvailableContext: monaco.editor.IContextKey<boolean>) {
	const fh = await getFileHandle();
	await setEditorText(editor, fh, store, fileAvailableContext)
}

export function onClose(editor: monaco.editor.IStandaloneCodeEditor, store: Store, fileAvailableContext: monaco.editor.IContextKey<boolean>) {
	editor.setValue("");
	store.set("fileHandle", null);
	fileAvailableContext.set(false);
}

export function getExtension(fname: string) {
	return fname.slice((Math.max(0, fname.lastIndexOf(".")) || Infinity) + 1);
}

export function initDropFile(element: HTMLElement, editor: monaco.editor.IStandaloneCodeEditor, store: Store, fileAvailableContext: monaco.editor.IContextKey<boolean>) {
	async function dropHandler(e: DragEvent) {
		console.log('File(s) dropped');
	  
		e.preventDefault();
		
		if (e.dataTransfer?.items) {
			const fileHandleRaw = await Array.from(e.dataTransfer.items)[0].getAsFileSystemHandle()
			if (fileHandleRaw?.kind !== "file") return;

			const fileHandle = fileHandleRaw as FileSystemFileHandle;
			setEditorText(editor, fileHandle, store, fileAvailableContext);
		}
	}
	
	element.addEventListener("drop", dropHandler, false);
}

export function initLaunchWithFile(editor: monaco.editor.IStandaloneCodeEditor, store: Store, fileAvailableContext: monaco.editor.IContextKey<boolean>) {
	//@ts-ignore
	window.launchQueue.setConsumer((launchParams) => {
		// Nothing to do when the queue is empty.
		if (!launchParams.files.length) {
			return;
		}
		const fileHandle = launchParams.files[0];

		setEditorText(editor, fileHandle, store, fileAvailableContext)
  });
}