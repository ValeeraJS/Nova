import { Ray3, Vector2, Vector2Like } from "@valeera/mathx";
import { Entity } from "@valeera/x/build/x";

export class Raycaster {
	ray: Ray3;
	near: number;
	far: number;
    constructor(ray: Ray3, near: number = 0, far: number = Infinity) {
		this.ray = ray;
		this.near = near;
		this.far = far;
    }

	updateFromCamera(vec2: Vector2Like, camera: Entity) {
		
	}
}
