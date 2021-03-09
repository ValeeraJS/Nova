import IRay from "./interfaces/IRay";
import IVector3, { IVector3Data } from "../vector/interfaces/IVector3";
import Vector3, { multiplyScalar, normalize, from, minus, dot, distanceToSquared, add } from "../vector/Vector3";
import ISphere from "../shape/interfaces/ISphere";

let dis: number, r2: number, d2: number, v = new Vector3();

export default class Ray implements IRay {
    position: IVector3Data;
    direction: IVector3Data;
    constructor(position: IVector3Data = new Vector3(), direction: IVector3Data = new Vector3(0, 0, -1)) {
        this.position = position;
        this.direction = normalize(direction);
    }
}

export const at = (a: IRay, b: number, out: IVector3Data = new Vector3()) => {
    return multiplyScalar(a.direction, b, out);
}

export const distanceToPoint = (a: IRay, point: IVector3Data) => {
    return Math.sqrt(distanceSqToPoint(a, point));
}

export const distanceSqToPoint = (a: IRay, point: IVector3Data) => {
    minus(point, a.position, v);
    dis = dot(v, a.direction);

    if (dis < 0) {
        return distanceToSquared(a.position, point);
    }

    multiplyScalar(a.direction, dis, v);
    add(v, a.position, v);

    return distanceToSquared(v, point);
}

export const lookAt = (a: IRay, b: IVector3, out: IRay = new Ray()) => {
    if (a !== out) {
        from(a.position, out.position);
    }

    normalize(minus(b, a.position, out.direction));
    return out;
}

export const intersectSphere = (ray: IRay, sphere: ISphere, target: IVector3Data) => {
    minus(sphere.position, ray.position, v);
    dis = dot(v, ray.direction);
    d2 = dot(v, v) - dis * dis;
    r2 = sphere.radius * sphere.radius;

    if (d2 > r2) return null;

    var thc = Math.sqrt(r2 - d2);

    var t0 = dis - thc;

    var t1 = dis + thc;

    if (t0 < 0 && t1 < 0) return null;

    if (t0 < 0) return at(ray, t1, target);

    return at(ray, t0, target);
}

export const intersectsSphere = (ray: IRay, sphere: ISphere) => {
    return distanceSqToPoint(ray, sphere.position) <= (sphere.radius * sphere.radius);
}
