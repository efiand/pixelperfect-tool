const PP_OFFSETS_KEY = 'ppOffsets';

function ensureValidPpOffsets() {
	try {
		const raw = localStorage.getItem(PP_OFFSETS_KEY);

		if (!raw) {
			localStorage.setItem(PP_OFFSETS_KEY, '{}');
			return;
		}

		JSON.parse(raw);
	} catch {
		localStorage.setItem(PP_OFFSETS_KEY, '{}');
	}
}

export { ensureValidPpOffsets };
