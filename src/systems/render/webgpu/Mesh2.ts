import { Geometry, IMaterial } from "../../../components";
import { DEFAULT_MATERIAL3 } from "../../../components/material/defaultMaterial";
import { Renderable, RenderableData } from "../Renderable";

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
