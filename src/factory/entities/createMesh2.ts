import { IComponent, IEntity, IWorld } from "@valeera/x";
import { MESH2 } from "../../components/constants";
import { DEFAULT_MATERIAL3 } from "../../components/material/defaultMaterial";
import IMaterial from "../../components/material/IMatrial";
import { Renderable } from "../../components/tag";
import Object2 from "../../entities/Object2";

export default (geometry: IComponent<any>, material: IMaterial = DEFAULT_MATERIAL3, name = MESH2, world?: IWorld): Object2 => {
	const entity = new Object2(name);
	entity.addComponent(geometry)
		.addComponent(material)
		.addComponent(new Renderable(MESH2));

	if (world) {
		world.addEntity(entity);
	}
	return entity;
}
