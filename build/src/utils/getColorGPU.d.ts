import { IColorGPU, IColorRGB, IColorRGBA, IColorRGBAJson, IColorRGBJson, ColorGPU, IColorRYB, IColorRYBA } from "@valeera/mathx";
export type ColorFormatType = IColorGPU | string | Float32Array | number[] | number | IColorRGB | IColorRGBA | IColorRGBAJson | IColorRGBJson | IColorRYB | IColorRYBA;
export declare const getColorGPU: (color: ColorFormatType, result?: ColorGPU) => ColorGPU;
