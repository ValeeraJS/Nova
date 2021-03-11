import json from "rollup-plugin-json";
import typescript from "rollup-plugin-typescript2";

export default {
	input: "src/index.ts",
	output: [
		{
			file: "build/Engine.legacy.js",
			format: "umd",
			indent: "\t",
			name: "Engine",
			sourcemap: true
		},
		{
			file: "build/Engine.legacy.module.js",
			format: "es",
			indent: "\t",
			sourcemap: true
		}
	],
	plugins: [
		json(),
		typescript({
			tsconfig: "./tsconfig.legacy.json"
		})
	]
};
