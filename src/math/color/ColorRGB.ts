import COLOR_HEX_MAP from "./ColorName";
import IColorRGB, { IColorRGBData } from "./interfaces/IColorRGB";

export default class ColorRGB extends Uint8Array implements IColorRGB {
	readonly length: 3;

	public constructor(r = 0, g = 0, b = 0) {
		super(3);
		this[0] = r;
		this[1] = g;
		this[2] = b;
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
}

export const create = (r = 0, g = 0, b = 0) => {
	return new ColorRGB(r, g, b);
}

export const equals = (a: IColorRGBData, b: IColorRGBData) => {
	return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

export const fromHex = (hex: number, out: IColorRGBData) => {
	out[0] = hex >> 16;
	out[1] = hex >> 8 & 255;
	out[2] = hex & 255;

	return out;
}

export const fromScalar = (scalar: number, out: IColorRGBData) => {
	out[0] = scalar;
	out[1] = scalar;
	out[2] = scalar;

	return out;
}

export const fromString = (str: string, out: IColorRGBData) => {
	if (str in COLOR_HEX_MAP) {
		return fromHex(COLOR_HEX_MAP[str], out);
	} else if (str.startsWith('#')) {
		str = str.substr(1);
		return fromScalar(parseInt(str, 16), out);
	}

	return out;
}