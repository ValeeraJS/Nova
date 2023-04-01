import { Material } from "./Material";
export declare class ColorMaterial extends Material {
    constructor(color?: Float32Array);
    setColor(r: number, g: number, b: number, a: number): this;
}
