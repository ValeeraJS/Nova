import { ColorGPU } from "@valeera/mathx";
import { Vector4Like } from "@valeera/mathx/src";
import { MaterialNodeDataType, MaterialNodeType } from "./MaterialNode";
import { Vector4Float32MaterialNode } from "./Vector4MaterialNode";

export class ColorGPUMaterialNode extends Vector4Float32MaterialNode {
    readonly type = MaterialNodeType.Fragment;
    output = {
        value: new ColorGPU(4),
        dataType: MaterialNodeDataType.Vector4Float32,
    }

    set(vec4: Vector4Like) {
        this.output.value.set(vec4);
        this.dirty = true;
    }

    get r() {
        return this.output.value[0];
    }
    set r(v: number) {
        this.output.value[0] = v;
        this.dirty = true;
    }
    get g() {
        return this.output.value[1];
    }
    set g(v: number) {
        this.output.value[1] = v;
        this.dirty = true;
    }
    get b() {
        return this.output.value[2];
    }
    set b(v: number) {
        this.output.value[2] = v;
        this.dirty = true;
    }
    get a() {
        return this.output.value[3];
    }
    set a(v: number) {
        this.output.value[3] = v;
        this.dirty = true;
    }
}