import { Ray3, Vector2Like } from "@valeera/mathx";
import { Entity } from "@valeera/x";
import { Object3 } from "../../entities/Object3";
export declare class Raycaster {
    ray: Ray3;
    near: number;
    far: number;
    constructor(ray: Ray3, near?: number, far?: number);
    updateFromCamera(vec2: Vector2Like, camera: Object3): void;
    intersect(entity: Entity, deep?: boolean, result?: Entity[]): Entity[];
}
