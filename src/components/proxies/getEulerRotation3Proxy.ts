import { EulerAngle, EulerRotationOrders, Matrix4 } from "@valeera/mathx";
import { Entity } from "@valeera/x";
import { Matrix4Component } from "..";
import { ROTATION_3D } from "../constants";

export default (position: Matrix4Component | Entity) => {
    if ((position as Entity).isEntity) {
        position = (position as Entity).getComponent(ROTATION_3D) as Matrix4Component;
    }
    let euler = EulerAngle.fromMatrix4((position as Matrix4Component).data);
    return new Proxy(position, {
        get: (target: Matrix4Component, property: string) => {
            if (property === 'x' || property === 'y' || property === 'z' || property === 'order') {
                return euler[property];
            }
            return (target as any)[property];
        },
        set: (target: Matrix4Component, property: string, value: number | EulerRotationOrders | boolean) => {
            if (property === 'x' || property === 'y' || property === 'z') {
                target.dirty = true;
                euler[property] = value as number;
                Matrix4.fromEuler(euler, target.data);
                return true;
            } else if (property === 'order') {
                target.dirty = true;
                euler.order = value as EulerRotationOrders;
                Matrix4.fromEuler(euler, target.data);
                return true;
            } else if (property === 'dirty') {
                target.dirty = value as boolean;
                return true;
            }
            return false;
        },
    });
}
