import IEntity from "@valeera/x/src/interfaces/IEntity";
import IWorld from "@valeera/x/src/interfaces/IWorld";
import { AProjection2 } from "../../components/matrix3";
import Camera2 from "../../entities/Camera2";

export default (projection: AProjection2, name = "camera", world?: IWorld): IEntity => {
	const entity = new Camera2(name, projection);

	if (world) {
		world.addEntity(entity);
	}
	return entity;
}
