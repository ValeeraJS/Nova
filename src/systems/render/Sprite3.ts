import { Geometry } from "./geometry/Geometry";
import { Renderable, RenderableData } from "./Renderable";
import { IMaterial } from "./IMatrial";
import { Texture } from "./texture/Texture";
import { createPlane } from "./geometry/factory3/createPlane";
import { TextureMaterial } from "./webgpu/material/TextureMaterial";

export class Sprite3 extends Renderable<Geometry, IMaterial> {
	public static readonly RenderType = "mesh3";
	constructor(texture: Texture, width?: number, height?: number) {
		super({
			type: Sprite3.RenderType,
			geometry: createPlane({
				width: width ?? texture.width,
				height: height ?? texture.height,
			}),
			material: new TextureMaterial(texture)
		});
	}
}
