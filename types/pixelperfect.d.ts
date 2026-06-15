interface PixelperfectOptions {
	breakpoints?: null | number[];
	ext?: string;
	folder?: string;
	page?: null | string;
	selector?: string;
}

declare global {
	interface Window {
		isPPLoaded?: boolean;
		pixelperfect?: PixelperfectOptions;
	}
}

export type { PixelperfectOptions };
