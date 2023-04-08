import { Geometry } from "./geometry/Geometry";
import { Renderable } from "./Renderable";
import { IMaterial } from "./IMatrial";
import { Texture } from "./texture/Texture";
export declare class Sprite3 extends Renderable<Geometry, IMaterial> {
    static readonly RenderType = "mesh3";
    constructor(texture: Texture, width?: number, height?: number);
}
