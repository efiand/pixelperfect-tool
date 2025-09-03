import { copyFile } from "node:fs/promises";

copyFile("README.md", "dist/README.md");
