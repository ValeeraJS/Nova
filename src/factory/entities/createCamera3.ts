import { World } from "@valeera/x";
import { AProjection3 } from "../../components/matrix4";
import { Camera3 } from "../../entities/Camera3";

export const createCamera3 = (projection: AProjection3, name = "camera", world?: World): Camera3 => {
	const entity = new Camera3(name, projection);

	if (world) {
		world.addEntity(entity);
	}
	return entity;
}
