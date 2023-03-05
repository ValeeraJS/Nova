import { Geometry } from "./geometry/Geometry";
import { Renderable, RenderableData } from "./Renderable";
import { IMaterial } from "./IMatrial";
import { DEFAULT_MATERIAL3 } from "./webgpu/material/defaultMaterial";

export interface Mesh3Data extends RenderableData<Geometry, IMaterial> {
    geometry: Geometry;
    material: IMaterial;
}

export class Mesh3 extends Renderable<Geometry, IMaterial> {
    public static readonly RenderType = "mesh3";
    constructor(geometry: Geometry, material: IMaterial = DEFAULT_MATERIAL3) {
        super({
            type: Mesh3.RenderType,
            geometry,
            material
        });
    }
}
