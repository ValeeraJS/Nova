import { Spherical, Vector2, Vector3 } from "@valeera/mathx";
import { Component } from "@valeera/x";
export declare class OrbitControls extends Component<any> {
    speedTheta: number;
    speedPhi: number;
    speedZoom: number;
    minDistance: number;
    maxDistance: number;
    minPolarAngle: number;
    maxPolarAngle: number;
    disabled: boolean;
    spherical: Spherical;
    dom: HTMLElement;
    target: Vector3;
    constructor(target?: Vector3, dom?: HTMLElement);
    isDown: boolean;
    screenPositionOld: Vector2;
    screenPositionNew: Vector2;
    positionDelta: Vector2;
    innerPosition: Vector3;
    addEvent(): void;
    update(): void;
}
