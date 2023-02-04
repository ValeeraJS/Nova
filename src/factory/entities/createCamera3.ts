import { IEntity, IWorld } from "@valeera/x";
import { AProjection3 } from "../../components/matrix4";
import Camera3 from "../../entities/Camera3";

export default (projection: AProjection3, name = "camera", world?: IWorld): IEntity => {
	const entity = new Camera3(name, projection);

	if (world) {
		world.addEntity(entity);
	}
	return entity;
}
