import { Ray3, Vector2Like } from "@valeera/mathx";
import { Entity } from "@valeera/x/build/x";
export declare class Raycaster {
    ray: Ray3;
    near: number;
    far: number;
    constructor(ray: Ray3, near?: number, far?: number);
    updateFromCamera(vec2: Vector2Like, camera: Entity): void;
}
