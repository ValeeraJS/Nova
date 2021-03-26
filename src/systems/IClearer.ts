import { IColorGPUJson } from "@valeera/mathx/src/color/ColorGPU";
import IEngine from "../engine/IEngine";

export default interface IClearer {
    color: IColorGPUJson,
    engine: IEngine,
    clear(): any;
    setColor(): this;
}