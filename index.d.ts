interface PixelperfectOptions {
  breakpoints?: number[] | null;
  ext?: string;
  folder?: string;
  page?: string | null;
  selector?: string;
}

export default function (options: PixelperfectOptions): void;
