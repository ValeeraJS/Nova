import IEntity from "@valeera/x/src/interfaces/IEntity";
import IWorld from "@valeera/x/src/interfaces/IWorld";
import { AProjection3 } from "../../components/matrix4";
import Camera3 from "../../entities/Camera3";

export default (projection: AProjection3, name = "camera", world?: IWorld): IEntity => {
	const entity = new Camera3(name, projection);

	if (world) {
		world.addEntity(entity);
	}
	return entity;
}
