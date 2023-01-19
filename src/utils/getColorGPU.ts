import { IColorGPU, IColorRGB, IColorRGBA, IColorRGBAJson, IColorRGBJson, ColorGPU, ColorRGB, ColorRGBA, ColorHSL } from "@valeera/mathx";

export type ColorFormatType = IColorGPU | string | Float32Array | number[] | number | IColorRGB | IColorRGBA | IColorRGBAJson | IColorRGBJson;

let tempColorRGB = new ColorRGB();

export default (color: IColorGPU | string | Float32Array | number[] | number | IColorRGB | IColorRGBA | IColorRGBAJson | IColorRGBJson, result = new ColorGPU()) => {
    if (color instanceof ColorGPU) {
        result.set(color);
    } else if (typeof color === "string") {
        ColorGPU.fromString(color, result);
    } else if (typeof color === "number") {
        ColorGPU.fromHex(color, 1, result);
    } else if (color instanceof ColorRGB) {
        ColorGPU.fromColorRGB(color, result);
    } else if (color instanceof ColorRGBA) {
        ColorGPU.fromColorRGBA(color, result);
    } else if (color instanceof ColorHSL) {
        ColorGPU.fromColorRGB(ColorRGB.fromHSL(color.h, color.s, color.l, tempColorRGB), result);
    } else if (color instanceof Float32Array || color instanceof Array) {
        ColorGPU.fromArray(color, result);
    } else if (color instanceof Float32Array || color instanceof Array) {
        ColorGPU.fromArray(color, result);
    } else {
        if ("a" in color) {
            ColorGPU.fromJson(color as IColorRGBAJson, result);
        } else {
            ColorGPU.fromJson({
                ...color as IColorRGBJson,
                a: 1
            }, result);
        }
    }
    return result;
}