import json from "rollup-plugin-json";
import typescript from "rollup-plugin-typescript2";
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
	input: "src/index.ts",
	output: [
		{
			file: "build/Engine.js",
			format: "umd",
			indent: "\t",
			name: "Engine",
			sourcemap: true
		},
		{
			file: "build/Engine.module.js",
			format: "es",
			indent: "\t",
			sourcemap: true
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
