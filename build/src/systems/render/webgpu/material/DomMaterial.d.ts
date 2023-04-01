import { ColorGPU } from "@valeera/mathx";
import { Material } from "./Material";
export declare class DomMaterial extends Material {
    constructor();
    get backgroundColor(): ColorGPU;
    set backgroundColor(c: ColorGPU);
    get borderColor(): ColorGPU;
    set borderColor(c: ColorGPU);
    get height(): number;
    set height(c: number);
    get width(): number;
    set width(c: number);
}
