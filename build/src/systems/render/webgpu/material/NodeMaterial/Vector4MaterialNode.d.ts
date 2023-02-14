import { Vector4, ColorGPU } from "@valeera/mathx";
import { IHasExportMaterialNode, MaterialNode, MaterialNodeDataType, MaterialNodeType } from "./MaterialNode";
export interface IVector4Float32MaterialNode extends IHasExportMaterialNode<Vector4 | ColorGPU | Float32Array> {
    output: {
        value: Vector4 | ColorGPU | Float32Array;
        dataType: MaterialNodeDataType;
    };
}
export declare class Vector4Float32MaterialNode extends MaterialNode implements IVector4Float32MaterialNode {
    readonly type = MaterialNodeType.Fragment;
    output: {
        value: Float32Array;
        dataType: MaterialNodeDataType;
    };
}
