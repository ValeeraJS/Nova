import { IColorGPUJson } from "@valeera/mathx/src/color/ColorGPU";
import WebGPUEngine from "../../engine/WebGPUEngine";
export default class Clearer {
    color: IColorGPUJson;
    engine: WebGPUEngine;
    constructor(engine: WebGPUEngine, color?: IColorGPUJson);
    clear(): this;
}
