import { defineConfig } from "rolldown";

export default defineConfig({
	input: "loader.js",
	output: {
		file: "dist/pixelperfect.min.js",
		format: "iife",
		minify: true,
	},
});
