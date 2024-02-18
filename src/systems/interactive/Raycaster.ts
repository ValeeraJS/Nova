import { Ray3, Vector2Like, Vector3 } from "@valeera/mathx";
import { Entity } from "@valeera/x";
import { AProjection3, OrthogonalProjection } from "../../components";
import { PROJECTION_3D } from "../../components/constants";
import { Object3 } from "../../entities/Object3";
import type Raycastable from "./Raycastable";

export class Raycaster {
	ray: Ray3;
	near: number;
	far: number;
    constructor(ray: Ray3, near: number = 0, far: number = Infinity) {
		this.ray = ray;
		this.near = near;
		this.far = far;
    }

	updateFromCamera(vec2: Vector2Like, camera: Object3) {
		const cameraComponent: AProjection3 = camera.getComponentByTagLabel(PROJECTION_3D) as AProjection3;
		const position = this.ray.position;
		const direction = this.ray.direction;
		// TODO 怎么更加严谨判断类型
		if (cameraComponent instanceof OrthogonalProjection) {
			Vector3.fromXYZ(vec2[0], vec2[1], cameraComponent.data[14], position);
			Vector3.fromXYZ(vec2[0], vec2[1], -1, direction);
			Vector3.transformMatrix4(position, cameraComponent.inverseMatrix, position);
			Vector3.transformMatrix4(position, camera.worldMatrix.data, position);
			Vector3.transformDirection(direction, camera.worldMatrix.data, direction);
		} else {
			Vector3.fromMatrix4Translate(camera.worldMatrix.data, position);
			Vector3.fromXYZ(vec2[0], vec2[1], 0.5, direction);
			Vector3.transformMatrix4(direction, cameraComponent.inverseMatrix, direction);
			Vector3.transformMatrix4(direction, camera.worldMatrix.data, direction);
			Vector3.minus(direction, position, direction);
			Vector3.normalize(direction, direction);
		}
	}

	intersect(entity: Entity, deep = false, result: Entity[] = []) {
		const component = entity.getComponentByTagLabel("Raycastable") as Raycastable;

		if (component) {
			component.raycast(entity, this, deep, result);
		}

		if (deep) {
			const children = entity.children as Entity[];
			for (let i = 0, len = children.length; i < len; i++) {
				this.intersect(children[i], deep, result);
			}
		}

		return result;
	}
}
