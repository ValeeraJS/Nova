import { IColorGPU, IColorRGB, IColorRGBA, IColorRGBAJson, IColorRGBJson, ColorGPU } from "@valeera/mathx";
export type ColorFormatType = IColorGPU | string | Float32Array | number[] | number | IColorRGB | IColorRGBA | IColorRGBAJson | IColorRGBJson;
declare const _default: (color: IColorGPU | string | Float32Array | number[] | number | IColorRGB | IColorRGBA | IColorRGBAJson | IColorRGBJson, result?: ColorGPU) => ColorGPU;
export default _default;
