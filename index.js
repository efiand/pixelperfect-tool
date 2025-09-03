/** @type {(options?: _PixelperfectOptions) => void} */
export default (options = {}) => {
	if (!window || window.isPPLoaded) {
		return;
	}

	const PP_CLASS = "pixelperfect";
	const DEFAUL_PAGE = "index";
	const DEFAULT_BREAKPOINTS = [320, 768, 1240];
	const DEFAULT_FOLDER = "pixelperfect";
	const DEFAULT_EXT = "jpg";

	/** @type {Record<string, [number, number]>} */
	const COORDINATE_STEPS = {
		ArrowDown: [0, 1],
		ArrowLeft: [-1, 0],
		ArrowRight: [1, 0],
		ArrowUp: [0, -1],
	};

	/** @type {(event: KeyboardEvent) => boolean} */
	function checkModPressed(event) {
		return event.ctrlKey || event.shiftKey || event.altKey || event.metaKey;
	}

	/** @type {(a: number, b: number) => number} */
	function sortBP(a, b) {
		return a - b;
	}

	class Pixelperfect {
		constructor() {
			const {
				breakpoints = null,
				ext = DEFAULT_EXT,
				folder = DEFAULT_FOLDER,
				page = null,
				selector = "body",
			} = window.pixelperfect || options;

			this._isPP = Boolean(Number(localStorage.getItem("pp") || 0));
			this._isInvert = Boolean(Number(localStorage.getItem("ppInvert") || 1));

			this._breakpoints = breakpoints ? Array.from(new Set(breakpoints)).sort(sortBP) : DEFAULT_BREAKPOINTS;
			this._currentBreakpoint = 0;
			this._folder = folder;
			this._ext = ext;

			/** @type {HTMLElement} */
			this._PPElement = /** @type {NonNullable<HTMLElement>} */ (document.querySelector(selector));

			if (page) {
				this._page = page;
			} else {
				const [, currentPage = ""] = window.location.pathname.match(/^\/?(.*?)(\.html?)?$/) || [];
				this._page = currentPage.replace(/\/$/, "") || DEFAUL_PAGE;
			}

			this._offsets = JSON.parse(localStorage.getItem("ppOffsets") || "") || {};
			if (!this._offsets[this._page]) {
				this._offsets[this._page] = {};
			}
			for (const breakpoint of this._breakpoints) {
				if (!this._offsets[this._page][breakpoint]) {
					this._offsets[this._page][breakpoint] = [0, 0];
				}
			}
			this._saveOffsets();

			this._keydownHandler = this._keydownHandler.bind(this);
			this._changeScreenMode = this._changeScreenMode.bind(this);

			this._changeScreenMode();
			this._setOffsets();
			this._managePP();
			this._manageInvert();

			window.addEventListener("resize", this._changeScreenMode);
			document.addEventListener("keydown", this._keydownHandler);
		}

		_changeScreenMode() {
			const { clientWidth } = this._PPElement;
			let currentBreakpoint = 0;

			for (const breakpoint of this._breakpoints) {
				if (clientWidth < breakpoint) {
					continue;
				}
				currentBreakpoint = breakpoint;
			}

			if (this._currentBreakpoint === currentBreakpoint) {
				return;
			}

			this._currentBreakpoint = currentBreakpoint;
			this._setBgProperty(this._currentBreakpoint);
			this._setOffsets();
		}

		/** @type {(event: KeyboardEvent) => void} */
		_keydownHandler(event) {
			if (document.activeElement !== document.body || checkModPressed(event)) {
				return;
			}

			if (event.code === "KeyP") {
				event.preventDefault();
				this._isPP = !this._isPP;
				this._managePP();
			} else if (this._isPP && event.code === "KeyI") {
				event.preventDefault();
				this._isInvert = !this._isInvert;
				this._manageInvert();
			} else if (this._isPP && event.code === "KeyR") {
				event.preventDefault();
				localStorage.removeItem("ppOffsets");
				window.location.reload();
			} else if (this._isPP) {
				const steps = COORDINATE_STEPS[event.code];
				if (!steps) {
					return;
				}

				event.preventDefault();
				this._movePP(...steps);
			}
		}

		_manageInvert() {
			this._PPElement.style.setProperty(`--pp-filter`, this._isInvert ? "invert(1)" : "none");
			localStorage.setItem("ppInvert", `${Number(this._isInvert)}`);
		}

		_managePP() {
			if (getComputedStyle(this._PPElement).position === "fixed") {
				this._scrollableElement = document.documentElement;
				this._scrollTop = this._PPElement.scrollTop;
			} else {
				this._scrollableElement = this._PPElement;
				this._scrollTop = document.documentElement.scrollTop;
			}
			const { scrollBehavior } = getComputedStyle(this._PPElement);

			this._PPElement.classList.toggle(PP_CLASS, this._isPP);

			this._PPElement.style.scrollBehavior = "auto";
			this._scrollableElement.scroll(0, this._scrollTop);
			this._PPElement.style.scrollBehavior = scrollBehavior;

			localStorage.setItem("pp", `${Number(this._isPP)}`);
		}

		/** @type (x: number, y: number) => void */
		_movePP(x, y) {
			this._offsets[this._page][this._currentBreakpoint][0] += x;
			this._offsets[this._page][this._currentBreakpoint][1] += y;
			this._saveOffsets();
			this._setOffsets();
		}

		_saveOffsets() {
			localStorage.setItem("ppOffsets", JSON.stringify(this._offsets));
		}

		_setBgProperty(breakpoint = 0) {
			const bg = breakpoint ? `url("${this._folder}/${this._page}-${breakpoint}.${this._ext}")` : "none";
			this._PPElement.style.setProperty(`--pp-img`, bg);
		}

		_setOffsets() {
			const [x = 0, y = 0] = this._offsets[this._page][this._currentBreakpoint] || [];
			this._PPElement.style.setProperty("--pp-offset-x", `${x}px`);
			this._PPElement.style.setProperty("--pp-offset-y", `${y}px`);
		}
	}

	document.head.insertAdjacentHTML(
		"beforeend",
		`<style>.pixelperfect{position:relative;height:auto;overflow-x:hidden;overflow-y:auto}.pixelperfect::after{content:"";position:absolute;top:0;right:0;bottom:0;left:0;z-index:1000000;background-image:var(--pp-img);background-repeat:no-repeat;background-position:calc(50% + var(--pp-offset-x)) var(--pp-offset-y);opacity:.5;filter:var(--pp-filter);pointer-events:none}</style>`,
	);

	new Pixelperfect();

	window.isPPLoaded = true;
};
