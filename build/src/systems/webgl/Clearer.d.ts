import { IColorGPUJson } from "@valeera/mathx/src/color/ColorGPU";
import WebGLEngine from "../../engine/WebGLEngine";
export default class Clearer {
    color: IColorGPUJson;
    engine: WebGLEngine;
    constructor(engine: WebGLEngine, color?: IColorGPUJson);
    setColor(color: IColorGPUJson): this;
    updateColor(color: IColorGPUJson): this;
    clear(): this;
}
