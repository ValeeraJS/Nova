import ICube from "./interfaces/ICube";
import { round as roundVec3, min as minVec3, max as maxVec3, add as addVec3, equals as equalsVec3, multiplyScalar, minus as minusVec3, clamp as clampVec3, distanceToSquared, fromArray, dot as dotVec3 } from "../vector/Vector3";
import ISphere from "./interfaces/ISphere";
import ITriangle3 from "./interfaces/ITriangle";
import {cross} from './../vector/Vector3';
import { Matrix3 } from "../matrix";

let v1: Float32Array = new Float32Array(3), v2: Float32Array = new Float32Array(3), v0: Float32Array = new Float32Array(3), f1: Float32Array = new Float32Array(3), f2: Float32Array = new Float32Array(3), f0: Float32Array = new Float32Array(3);
let ta: Float32Array = new Float32Array(3), tb: Float32Array = new Float32Array(3), vA = new Float32Array(3);

const defaultMax = [1, 1, 1];

export default class Cube implements ICube {
    min: Float32Array = new Float32Array(3);
    max: Float32Array = new Float32Array(3);
    constructor(a: Float32Array = new Float32Array(3), b: Float32Array = new Float32Array(defaultMax)) {
        minVec3(a, b, this.min);
        maxVec3(a, b, this.max);
    }
}

export const clampPoint = (a: ICube, point: Float32Array, out: Float32Array = new Float32Array(3)) => {
    return clampVec3(point, a.min, a.max, out);
}

export const containsPoint = (a: ICube, b: Float32Array) => {
    return b[0] >= a.min[0] && b[0] <= a.max[0] &&
        b[1] >= a.min[1] && b[1] <= a.max[1] &&
        b[2] >= a.min[2] && b[2] <= a.max[2];
}

export const containsCube = (a: ICube, b: ICube) => {
    return a.min[0] <= b.min[0] && b.max[0] <= a.max[0] &&
        a.min[1] <= b.min[1] && b.max[1] <= a.max[1] &&
        a.min[2] <= b.min[2] && b.max[2] <= a.max[2];
}

export const depth = (a: ICube) => {
    return a.max[2] - a.min[2];
}

export const equals = (a: ICube, b: ICube) => {
    return equalsVec3(a.min, b.min) && equalsVec3(a.max, b.max)
}

export const getCenter = (a: ICube, out: Float32Array = new Float32Array(3)) => {
    addVec3(a.min, a.max, out);
    return multiplyScalar(out, 0.5, out);
}

export const getSize = (a: ICube, out: Float32Array = new Float32Array(3)) => {
    return minusVec3(a.max, a.min, out);
}

export const height = (a: ICube) => {
    return a.max[1] - a.min[1];
}

export const intersect = (a: ICube, b: ICube, out: ICube = new Cube()) => {
    maxVec3(a.min, b.min, out.min);
    minVec3(a.max, b.max, out.max);

    return out;
}

export const intersectsBox = (a: ICube, b: ICube) => {
    return !(b.max[0] < a.min[0] || b.min[0] > a.max[0] ||
        b.max[1] < a.min[1] || b.min[1] > a.max[1] ||
        b.max[2] < a.min[2] || b.min[2] > a.max[2]);
}

export const intersectsSphere = (a: ICube, b: ISphere) => {
    clampPoint(a, b.position, ta);
    return distanceToSquared(ta, b.position) <= b.radius * b.radius;
}

export const intersectsTriangle = (a: ICube, b: ITriangle3) => {

    if (isEmpty(a)) {
        return false;
    }

    getCenter(a, ta);
    minusVec3(a.max, ta, tb);

    // translate triangle to aabb origin
    minusVec3(b.a, ta, v0);
    minusVec3(b.b, ta, v1);
    minusVec3(b.c, ta, v2);

    // compute edge vectors for triangle
    minusVec3(v1, v0, f0);
    minusVec3(v2, v1, f1);
    minusVec3(v0, v2, f2);

    // test against axes that are given by cross product combinations of the edges of the triangle and the edges of the aabb
    // make an axis testing of each of the 3 sides of the aabb against each of the 3 sides of the triangle = 9 axis of separation
    // axis_ij = u_i x f_j (u0, u1, u2 = face normals of aabb = x,y,z axes vectors since aabb is axis aligned)
    let axes = [
        0, -f0[2], f0[1],
        0, -f1[2], f1[1],
        0, -f2[2], f2[1],

        f0[2], 0, -f0[0],
        f1[2], 0, -f1[0],
        f2[2], 0, -f2[0],

        -f0[1], f0[0], 0,
        -f1[1], f1[0], 0,
        -f2[1], f2[0], 0
    ];

    if (!satForAxes(axes, v0, v1, v2, tb)) {
        return false;
    }

    // test 3 face normals from the aabb
    ta = Matrix3.identity();

    if (!satForAxes(axes, v0, v1, v2, tb)) {
        return false;
    }

    // finally testing the face normal of the triangle
    // use already existing triangle edge vectors here
    cross(f0, f1, ta);
    // axes = [_triangleNormal.x, _triangleNormal.y, _triangleNormal.z];

    return satForAxes(ta, v0, v1, v2, tb);

}

export const isEmpty = (a: ICube) => {
    return (a.max[0] < a.min[0]) || (a.max[0] < a.min[0]) || (a.max[0] < a.min[0]);
}

export const round = (a: ICube, out: ICube = new Cube()) => {
    roundVec3(a.min, out.min);
    roundVec3(a.max, out.max);

    return out;
}

export const size = (a: ICube, out: Float32Array = new Float32Array(3)) => {
    return minusVec3(a.max, a.min, out);
}

export const stretch = (a: ICube, b: Float32Array, c: Float32Array, out: ICube = new Cube()) => {
    addVec3(a.min, b, out.min);
    addVec3(a.max, c, out.max);

    return out;
}

export const translate = (a: ICube, b: Float32Array, out: ICube = new Cube()) => {
    addVec3(a.min, b, out.min);
    addVec3(a.max, b, out.max);

    return this;
}

export const union = (a: ICube, b: ICube, out: ICube = new Cube()) => {
    minVec3(a.min, b.min, out.min);
    maxVec3(a.max, b.max, out.max);

    return out;
}

export const volume = (a: ICube) => {
    return (a.max[0] - a.min[0]) * (a.max[1] - a.min[1]) * (a.max[2] - a.min[2]);
}

export const width = (a: ICube) => {
    return a.max[0] - a.min[0];
}

let i: number, j: number, p0: number, p1: number, p2: number, r: number;
function satForAxes(axes: number[] | Float32Array, v0: Float32Array, v1: Float32Array, v2: Float32Array, extents: Float32Array) {
    for (i = 0, j = axes.length - 3; i <= j; i += 3) {
        fromArray(axes, i, vA);
        // project the aabb onto the seperating axis
        r = extents[0] * Math.abs(vA[0]) + extents[1] * Math.abs(vA[1]) + extents[2] * Math.abs(vA[2]);
        // project all 3 vertices of the triangle onto the seperating axis
        p0 = dotVec3(v0, vA);
        p1 = dotVec3(v1, vA);
        p2 = dotVec3(v2, vA);
        // actual test, basically see if either of the most extreme of the triangle points intersects r
        if (Math.max(- Math.max(p0, p1, p2), Math.min(p0, p1, p2)) > r) {
            // points of the projected triangle are outside the projected half-length of the aabb
            // the axis is seperating and we can exit
            return false;
        }
    }
    return true;
}
