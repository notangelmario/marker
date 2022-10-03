class PersistentStore {
	private s: Map<string, string>

	constructor() {
		this.s = new Map();
	}

	get(key: string): string | null {
		const storedValue = localStorage.getItem(key);

		if (storedValue !== null) {
			this.s.set(key, storedValue);
			return storedValue;
		}

		return this.s.get(key) ?? null;
	}

	set(key: string, value: string): void {
		this.s.set(key, value);
	}
}

export function initStore() {
	const store = new Map<string, any>();
	const persistentStore = new PersistentStore();
		
	return { store, persistentStore }
}