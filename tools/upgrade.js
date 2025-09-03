import { execSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { devDependencies = {} } = require("../package.json");

const list = Object.keys(devDependencies);
if (list.length) {
	execSync(`npm i -DE ${list.join("@latest ")}@latest`);
}
