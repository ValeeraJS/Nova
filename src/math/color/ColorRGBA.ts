import COLOR_HEX_MAP from "./ColorName";
import IColorRGBA, { IColorRGBAData } from "./interfaces/IColorRGBA";

export default class ColorRGBA extends Uint8Array implements IColorRGBA {
	readonly length: 4;

	public constructor(r = 0, g = 0, b = 0, a = 255) {
		super(4);
		this[0] = r;
		this[1] = g;
		this[2] = b;
		this[3] = a;
	}

	get r() {
		return this[0];
	}

	set r(val: number) {
		this[0] = val;
	}

	get g() {
		return this[1];
	}

	set g(val: number) {
		this[1] = val;
	}

	get b() {
		return this[2];
	}

	set b(val: number) {
		this[2] = val;
	}

	get a() {
		return this[3];
	}

	set a(val: number) {
		this[3] = val;
	}
}

export const create = (r = 0, g = 0, b = 0, a = 255) => {
	return new ColorRGBA(r, g, b, a);
}

export const equals = (a: IColorRGBAData, b: IColorRGBAData) => {
	return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}

export const fromHex = (hex: number, a = 1, out: IColorRGBAData) => {
	out[0] = hex >> 16;
	out[1] = hex >> 8 & 255;
	out[2] = hex & 255;
	out[3] = a;

	return out;
}

export const fromScalar = (scalar: number, a = 1, out: IColorRGBAData) => {
	out[0] = scalar;
	out[1] = scalar;
	out[2] = scalar;
	out[3] = a;

	return out;
}

export const fromString = (str: string, a = 1, out: IColorRGBAData) => {
	if (str in COLOR_HEX_MAP) {
		return fromHex(COLOR_HEX_MAP[str], a, out);
	}
	out[3] = a;

	return out;
}