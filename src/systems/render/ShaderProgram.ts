import { IShaderProgram } from "./IMatrial";

export class ShaderProgram implements IShaderProgram {
	descriptor = {
		code: "",
	};
	name: string;
	dirty: boolean;
	constructor(code: string, name: string = "program") {
		this.descriptor.code = code;
		this.name = name;
		this.dirty = true;
	}

	get code() {
		return this.descriptor.code;
	}

	set code(value: string) {
		this.descriptor.code = value;
		this.dirty = true;
	}
}
