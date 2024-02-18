import { World } from "@valeera/x";
import { AProjection2 } from "../../components/matrix3";
import { Camera2 } from "../../entities/Camera2";

export const createCamera2 = (projection: AProjection2, name = "camera", world?: World): Camera2 => {
	const entity = new Camera2(projection, name);

	if (world) {
		world.addEntity(entity);
	}
	return entity;
}
