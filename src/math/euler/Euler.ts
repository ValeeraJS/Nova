import IEuler, { EulerRotationOrders } from "./IEuler";

export class Euler implements IEuler{
    static RotationOrders = EulerRotationOrders;
    x: number;
    y: number;
    z: number;
    order: EulerRotationOrders;
    constructor(x = 0, y = 0, z = 0, order = EulerRotationOrders.XYZ) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.order = order;
    }
}

const createDefault = ()  => {
    return {
        x: 0,
        y: 0,
        z: 0,
        order: EulerRotationOrders.XYZ
    }
}

export const create = (x = 0, y = 0, z = 0, order = EulerRotationOrders.XYZ, out: IEuler = createDefault()): IEuler => {
    out.x = x;
    out.y = y;
    out.z = z;
    out.order = order;

    return out;
}

export const from = (euler: IEuler, out: IEuler = createDefault()): IEuler => {
    out.x = euler.x;
    out.y = euler.y;
    out.z = euler.z;
    out.order = euler.order;

    return out;
}
