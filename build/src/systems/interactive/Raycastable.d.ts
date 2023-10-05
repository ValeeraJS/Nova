import { Entity } from "@valeera/x";
import { Component } from "@valeera/x";
import { Raycaster } from "./Raycaster";
export default abstract class Raycastable extends Component<any> {
    inverseMatrix: Float32Array;
    constructor(data: any);
    abstract raycast(entity: Entity, raycaster: Raycaster, deep: boolean, result: Entity[]): Entity[];
}
