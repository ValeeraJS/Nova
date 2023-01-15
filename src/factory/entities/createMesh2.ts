import IComponent from "@valeera/x/src/interfaces/IComponent";
import IEntity from "@valeera/x/src/interfaces/IEntity";
import IWorld from "@valeera/x/src/interfaces/IWorld";
import { MESH2 } from "../../components/constants";
import { DEFAULT_MATERIAL3 } from "../../components/material/defaultMaterial";
import IMaterial from "../../components/material/IMatrial";
import { Renderable } from "../../components/tag";
import Object2 from "../../entities/Object2";

export default (geometry: IComponent<any>, material: IMaterial = DEFAULT_MATERIAL3, name = MESH2, world?: IWorld): IEntity => {
	const entity = new Object2(name);
	entity.addComponent(geometry)
		.addComponent(material)
		.addComponent(new Renderable(MESH2));

	if (world) {
		world.addEntity(entity);
	}
	return entity;
}
