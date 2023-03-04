import { IShaderProgram } from "./IMatrial";

export class ShaderProgram implements IShaderProgram {
	data = {
		code: "",
		entry: "",
	};
	dirty: boolean;
	constructor(code: string, entry: string = "main") {
		this.data.code = code;
		this.data.entry = entry;
		this.dirty = true;
	}

	get code() {
		return this.data.code;
	}

	set code(value: string) {
		this.data.code = value;
		this.dirty = true;
	}

	get entry() {
		return this.data.entry;
	}

	set entry(value: string) {
		this.data.entry = value;
		this.dirty = true;
	}
}
