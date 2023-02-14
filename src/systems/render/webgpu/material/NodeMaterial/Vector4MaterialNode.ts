import { Vector4, ColorGPU } from "@valeera/mathx";
import { IHasExportMaterialNode, MaterialNode, MaterialNodeDataType, MaterialNodeType } from "./MaterialNode";

export interface IVector4Float32MaterialNode extends IHasExportMaterialNode<Vector4 | ColorGPU | Float32Array> {
    output: {
        value: Vector4 | ColorGPU | Float32Array;
        dataType: MaterialNodeDataType;
    }
}

export class Vector4Float32MaterialNode extends MaterialNode implements IVector4Float32MaterialNode {
    readonly type = MaterialNodeType.Fragment;
    output = {
        value: new Float32Array(4),
        dataType: MaterialNodeDataType.Vector4Float32,
    }
}
