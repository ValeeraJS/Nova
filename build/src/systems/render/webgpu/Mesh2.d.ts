import { Geometry, IMaterial } from "../../../components";
import { Renderable, RenderableData } from "../Renderable";
export interface Mesh2Data extends RenderableData<Geometry, IMaterial> {
    geometry: Geometry;
    material: IMaterial;
}
export declare class Mesh2 extends Renderable<Geometry, IMaterial> {
    static readonly RenderType = "mesh2";
    constructor(geometry: Geometry, material?: IMaterial);
}
