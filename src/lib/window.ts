import { appWindow } from "@tauri-apps/api/window";
import { type } from "@tauri-apps/api/os";

export const initWindowTitlebar = async () => {
	const closeButton = `
		<div class="titlebar-button" id="titlebar-close">
			<img src="https://api.iconify.design/mdi:close.svg" alt="close" />
		</div>
	`;
	const maximizeButton = `
		<div class="titlebar-button" id="titlebar-maximize">
			<img
				src="https://api.iconify.design/mdi:window-maximize.svg"
				alt="maximize"
			/>
		</div>
	`
	const minimizeButton = `
		<div class="titlebar-button" id="titlebar-minimize">
			<img
				src="https://api.iconify.design/mdi:window-minimize.svg"
				alt="minimize"
			/>
		</div>
	`

	const osType = await type();
	const titlebarElement = document.getElementById("titlebar");

	if (!titlebarElement) {
		throw new Error("No titlebar element present in DOM");
	}
		
	if (osType === "Darwin")
		titlebarElement.classList.add("titlebar-macos");

	titlebarElement.innerHTML = osType === "Darwin" ? (closeButton + minimizeButton + maximizeButton) : (minimizeButton + maximizeButton + closeButton);
}

export const initWindowButtons = () => {
	document.getElementById('titlebar-minimize')?.addEventListener('click', () => appWindow.minimize())
	document.getElementById('titlebar-maximize')?.addEventListener('click', () => appWindow.toggleMaximize())
	document.getElementById('titlebar-close')?.addEventListener('click', () => appWindow.close())
}
