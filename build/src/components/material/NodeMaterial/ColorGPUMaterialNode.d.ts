import { ColorGPU, Vector4Like } from "@valeera/mathx";
import { MaterialNodeDataType, MaterialNodeType } from "./MaterialNode";
import { Vector4Float32MaterialNode } from "./Vector4MaterialNode";
export declare class ColorGPUMaterialNode extends Vector4Float32MaterialNode {
    readonly type = MaterialNodeType.Fragment;
    output: {
        value: ColorGPU;
        dataType: MaterialNodeDataType;
    };
    set(vec4: Vector4Like): void;
    get r(): number;
    set r(v: number);
    get g(): number;
    set g(v: number);
    get b(): number;
    set b(v: number);
    get a(): number;
    set a(v: number);
}
