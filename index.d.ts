declare global {
	interface Window {
		isPPLoaded?: boolean;
		pixelperfect?: PixelperfectOptions;
	}

	type _PixelperfectOptions = PixelperfectOptions;
}

export interface PixelperfectOptions {
	breakpoints?: null | number[];
	ext?: string;
	folder?: string;
	page?: null | string;
	selector?: string;
}

export default function (options?: PixelperfectOptions): void;
