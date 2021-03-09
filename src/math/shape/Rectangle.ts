import IRectangle from "./interfaces/IRectangle";
import { IVector2Data } from "../vector/interfaces/IVector2";
import Vector2, { min as minVec2, max as maxVec2, add as addVec2, equals as equalsVec2, multiplyScalar, minus as minusVec2 } from "../vector/Vector2";

export default class Rectangle implements IRectangle {
    min: IVector2Data = new Vector2();
    max: IVector2Data = new Vector2();
    constructor(a: IVector2Data = new Vector2(), b: IVector2Data = new Vector2(1, 1)) {
        minVec2(a, b, this.min);
        maxVec2(a, b, this.max);
    }
}

export const area = (a: IRectangle) => {
    return (a.max[0] - a.min[0]) * (a.max[1] - a.min[1]);
}

export const containsPoint = (a: IVector2Data) => {
    return a[0] >= this.min[0] && a[0] <= this.max[0] &&
        a[1] >= this.min[1] && a[1] <= this.max[1];
}

export const containsRectangle = (box: IRectangle) => {
    return this.min[0] <= box.min[0] && box.max[0] <= this.max[0] &&
        this.min[1] <= box.min[1] && box.max[1] <= this.max[1];
}

export const equals = (a: IRectangle, b: IRectangle) => {
    return equalsVec2(a.min, b.min) && equalsVec2(a.max, b.max);
}

export const getCenter = (a: IRectangle, out: IVector2Data = new Vector2()) => {
    addVec2(a.min, a.max, out);
    return multiplyScalar(out, 0.5, out);
}

export const getSize = (a: IRectangle, out: IVector2Data = new Vector2()) => {
    return minusVec2(a.max, a.min, out);
}

export const height = (a: IRectangle) => {
    return a.max[1] - a.min[1];
}

export const intersect = (a: IRectangle, b: IRectangle, out: IRectangle = new Rectangle()) => {
    maxVec2(a.min, b.min, out.min);
    minVec2(a.max, b.max, out.max);

    return out;
}

export const stretch = (a: IRectangle, b: IVector2Data, c: IVector2Data, out: IRectangle = new Rectangle()) => {
    addVec2(a.min, b, out.min);
    addVec2(a.max, c, out.max);

    return out;
}

export const translate = (a: IRectangle, b: IVector2Data, out: IRectangle = new Rectangle()) => {
    addVec2(a.min, b, out.min);
    addVec2(a.max, b, out.max);

    return this;
}

export const union = (a: IRectangle, b: IRectangle, out: IRectangle = new Rectangle()) => {
    minVec2(a.min, b.min, out.min);
    maxVec2(a.max, b.max, out.max);

    return out;
}

export const width = (a: IRectangle) => {
    return a.max[0] - a.min[0];
}
