import { Geometry } from "../geometry";
import { Renderable, RenderableData } from "../Renderable";
import { IMaterial } from "./material";
export interface Mesh3Data extends RenderableData<Geometry, IMaterial> {
    geometry: Geometry;
    material: IMaterial;
}
export declare class Mesh3 extends Renderable<Geometry, IMaterial> {
    static readonly RenderType = "mesh3";
    constructor(geometry: Geometry, material?: IMaterial);
}
