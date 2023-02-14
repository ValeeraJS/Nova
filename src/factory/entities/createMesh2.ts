import { IWorld } from "@valeera/x";
import { MESH2 } from "../../components/constants";
import Object2 from "../../entities/Object2";
import { Geometry } from "../../systems/render";
import { DEFAULT_MATERIAL3 } from "../../systems/render/webgpu/material/defaultMaterial";
import { IMaterial } from "../../systems/render/webgpu/material/IMatrial";
import { Mesh2 } from "../../systems/render/webgpu/Mesh2";

export default (geometry: Geometry, material: IMaterial = DEFAULT_MATERIAL3, name = MESH2, world?: IWorld): Object2 => {
	const entity = new Object2(name);
	entity.addComponent(new Mesh2(geometry, material));

	if (world) {
		world.addEntity(entity);
	}
	return entity;
}
