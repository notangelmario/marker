<script lang="ts">
	import { onOpen, onSave, onClose } from "../file";
	import { fileHandle } from "../stores";
	import MenuBarButton from "./MenuBarButton.svelte";
	import logo from "../../assets/logo.png";
	import { version } from "../../../package.json";
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
				disabled: !$fileHandle
			},
			null,
			{
				label: "Close File",
				onClick: onClose,
				disabled: !$fileHandle
			},
		]}
	/>
	<MenuBarButton
		label="About"
		buttons={[
			{
				label: `GitHub repo`,
				onClick: () => window.open("https://github.com/fructoland/pencil", "_blank")
			},
			{
				label: `Version ${version}`,
			},
			{
				label: "Made with ❤ by Fructo",
			}
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