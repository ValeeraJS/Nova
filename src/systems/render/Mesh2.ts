
import { Geometry } from "./geometry";
import { Renderable, RenderableData } from "./Renderable";
import { IMaterial } from "./IMatrial";
import { DEFAULT_MATERIAL3 } from "./webgpu/material/defaultMaterial";

export interface Mesh2Data extends RenderableData<Geometry, IMaterial> {
    geometry: Geometry;
    material: IMaterial;
}

export class Mesh2 extends Renderable<Geometry, IMaterial> {
    public static readonly RenderType = "mesh2";
    constructor(geometry: Geometry, material: IMaterial = DEFAULT_MATERIAL3) {
        super({
            type: Mesh2.RenderType,
            geometry,
            material
        });
    }
}
