import ISphere from "./interfaces/ISphere";
import { IVector3, Vector3 } from "../vector";
import { IVector3Data } from "../vector/interfaces/IVector3";
import { distanceTo, distanceToSquared, equals as equalsVec3, minusScalar as minusScalarVec3, addScalar as addScalarVec3 } from "../vector/Vector3";
import Cube from "./Cube";
import ICube from "./interfaces/ICube";

let r = 0;

export default class Sphere implements ISphere {
    position: IVector3;
    radius: number;

    constructor(position: IVector3 = new Vector3, radius: number = 1) {
        this.position = position;
        this.radius = radius;
    }
}

export const boundingBox = (a: ISphere, out: ICube = new Cube()) => {
    minusScalarVec3(a.position, a.radius, out.min);
    addScalarVec3(a.position, a.radius, out.max);

    return out;
}

export const containsPoint = (a: ISphere, b: IVector3Data) => {
    return distanceToSquared(a.position, b) <= a.radius * a.radius;
}

export const distanceToPoint = (a: ISphere, b: IVector3Data) => {
    return distanceTo(a.position, b) - a.radius;
}

export const equals = (a: ISphere, b: ISphere) => {
    return equalsVec3(a.position, b.position) && a.radius === b.radius;
}

export const intersectsSphere = (a: ISphere, b: ISphere) => {
    r = a.radius + b.radius;
    return distanceToSquared(a.position, b.position) <= r * r;
}
