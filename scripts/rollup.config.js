import json from "rollup-plugin-json";
import typescript from "rollup-plugin-typescript2";
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
	input: "src/index.ts",
	output: [
		{
			file: "build/Nova.js",
			format: "umd",
			indent: "\t",
			name: "Nova",
			sourcemap: false
		},
		{
			file: "build/Nova.module.js",
			format: "es",
			indent: "\t",
			sourcemap: false
		}
	],
	plugins: [
		json(),
		nodeResolve(),
		typescript({
			tsconfig: "./tsconfig.json"
		})
	]
};
