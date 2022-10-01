export const openFile = async () => {
	const [fileHandle] = await window.showOpenFilePicker();

	const file = await fileHandle.getFile();
	console.log(await file.text());
	const doc = await file.text();

	return doc;
}