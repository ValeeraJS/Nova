import { ColorGPU, Vector4 } from "@valeera/mathx";
import { ColorGPUMaterialNode } from "./ColorGPUMaterialNode";
import { IHasExportMaterialNode, IHasImportMaterialNode, MaterialNode, MaterialNodeType } from "./MaterialNode";
export interface IFragmentMaterialNode extends IHasImportMaterialNode {
    imports: {
        vec4: IHasExportMaterialNode<Vector4 | Float32Array | ColorGPU>;
    };
}
export declare class FragmentMaterialNode extends MaterialNode implements IFragmentMaterialNode {
    readonly type = MaterialNodeType.Fragment;
    imports: {
        vec4: ColorGPUMaterialNode;
    };
}
