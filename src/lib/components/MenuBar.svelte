<script lang="ts">
	import { editor as monacoEditor, Uri } from "monaco-editor";
	import { getFileHandle, onOpen, onSave, onClose } from "../file";
	import { editor, fileHandle as fileHandleStore } from "../stores";
	import MenuBarButton from "./MenuBarButton.svelte";
	import logo from "../../assets/logo.png";
</script> 

<div class="menuBarWrapper">
	<img
		src={logo}
		alt="Pencil"
	/>
	<MenuBarButton
		label="File"
		buttons={[
			{
				label: "Open File...",
				onClick: onOpen,
			},
			{
				label: "Save File",
				onClick: onSave,
				disabled: !$fileHandleStore
			},
			null,
			{
				label: "Close File",
				onClick: onClose,
				disabled: !$fileHandleStore
			},
		]}
	/>
</div>

<style scoped>
	.menuBarWrapper {
		display: flex;
		flex-flow: row;
		flex-wrap: nowrap;
		width: 100%;
	}

	.menuBarWrapper > img {
		width: 18px;
		height: 18px;
		padding: 3px;
	}
</style>