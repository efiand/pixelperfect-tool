# pixelperfect changelog

Undescribed versions are deprecated.


## 1.2.1
* Package's name is `@efiand/pixelperfect` now.
* Default class `.pineglade-pp` renamed to `.pixelperfect`.
* `window.pinegladePP` settings object renamed to `window.pixelperfect`.

## 1.1.4
* Change the implementation of offsets to from `transform` to `background-position`. This will avoid scrollbars when associating a layer with an arbitrary selector inside the `body`.


## 1.1.2

* Add custom selector for `.pixelperfect` element (`window.pinegladePP.selector`). Default value is `body` (for compatibility with previous versions).
* Change default desktop breakpoint from 1260 to 1240.
* Add this changelog.


## 1.0.9

* Bugfix (problem of `--pp-img` value in Mac OS).


## 1.0.8

* Added modifier keystroke check.
* Code refactoring by [@fyvfyv](https://github.com/fyvfyv) to make it more prettier and simple.


## 1.0.6

* Support `R` key: clear offsets in LocalStorage.
* Update npm packages.


## 1.0.5

* Support `I` key: toggle invert mode of image layer (default – apply invert filter).
* Document hotkeys in `README.md` and some same text edits.
* Add npm shield to `README.md`.


## 1.0.0

* First edition.
