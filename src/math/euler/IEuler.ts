export default interface IEuler {
    x: number;
    y: number;
    z: number;
    order: EulerRotationOrders;
}

export enum EulerRotationOrders {
    XYZ = 'xyz',
    ZXY = 'zxy',
    YZX = 'yzx',
    XZY = 'xzy',
    ZYX = 'zyx',
    YXZ = 'yxz',
}
