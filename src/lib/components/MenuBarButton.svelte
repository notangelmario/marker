<script lang="ts">
	interface Button {
		label: string;
		onClick?: () => void;
		disabled?: boolean;
	}

	export let label: string;
	export let buttons: Array<Button | null>;
	let button: HTMLButtonElement;
	let subMenu: HTMLDivElement;
	let subMenuOpened = false;

	function openSubMenu() {
		subMenu.style.display = "block";
		subMenuOpened = true

		function onClick(e: any) {
			if (e.target !== subMenu) {
				subMenu.style.display = "none";
				subMenuOpened = false

				window.removeEventListener("click", onClick);
			}
		}

		window.addEventListener("click", onClick)
	}
</script>

<div class="button-wrapper">
	<button
		on:click|stopPropagation={openSubMenu}
		bind:this={button}
		class:focused={subMenuOpened}
	>
		{label}
	</button>

	<div
		class="sub-menu"
		bind:this={subMenu}
	>
		{#each buttons as button}
			{#if button === null}
				<hr />
			{:else}
				<button
					on:click={button.onClick}
					disabled={button.disabled}
				>
					{button.label}
				</button>
			{/if}
		{/each}
	</div>
</div>

<style scoped>
	.button-wrapper > button {
		padding: 0 .5rem;
		height: 24px;
		cursor: default;
		background-color: #fff;
		border-radius: var(--radius);
		outline: none;
		border: none;
	}

	.sub-menu {
		background-color: #fff;
		position: absolute;
		overflow: hidden;
		display: none;
		box-shadow: var(--shadow);
		border-radius: var(--radius);
		z-index: 1;
	}

	button:hover, button.focused {
		filter: brightness(.9);
	}

	.sub-menu button {
		display: block;
		background-color: #fff;
		outline: none;
		border: none;
		padding: .25rem 1rem;
		width: 15rem;
		text-align: left;
	}

	hr {
		margin: .25rem 0;
		pointer-events: none;
	}
</style>