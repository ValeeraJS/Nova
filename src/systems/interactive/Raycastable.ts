import { Entity } from "@valeera/x";
import { Component } from "@valeera/x";
import { Raycaster } from "./Raycaster";

export default abstract class Raycastable extends Component<any> {
    inverseMatrix = new Float32Array(16);
    constructor(data: any) {
        super("Raycastable", data, [{
			label: "Raycastable",
			unique: true
		}]);
    }

    abstract raycast(entity: Entity, raycaster: Raycaster, deep: boolean, result: Entity[]): Entity[];
}
