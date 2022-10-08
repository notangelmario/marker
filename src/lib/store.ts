// deno-lint-ignore-file no-explicit-any
export class Store {
	private s: Map<string, any>
	private toPersist: Array<string>

	constructor() {
		this.s = new Map();
		this.toPersist = ["visited", "theme"];

		this.toPersist.forEach((persistKey) => {
			const storedValue = localStorage.getItem(persistKey);

			if (storedValue) {
				this.s.set(persistKey, JSON.parse(storedValue))
			}
		})
	}

	get<Type>(key: string): Type | null {
		return this.s.get(key) ?? null;
	}

	set(key: string, value: any): void {
		if (this.toPersist.includes(key)) {
			localStorage.setItem(key, JSON.stringify(value));
		}

		this.s.set(key, value);
	}
}

export function initStore() {
	const store = new Store();
		
	return store;
}