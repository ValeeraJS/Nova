import { Euler } from "@valeera/mathx/src/euler";
import { EulerRotationOrders } from "@valeera/mathx/src/euler/IEuler";
import { Matrix4 } from "@valeera/mathx/src/matrix";
import IEntity from "@valeera/x/src/interfaces/IEntity";
import { Matrix4Component } from "..";

export default (position: Matrix4Component | IEntity) => {
    if ((position as IEntity).isEntity) {
        position = (position as IEntity).getComponent("rotation3") as Matrix4Component;
    }
    let euler = Euler.fromMatrix4((position as Matrix4Component).data);
    return new Proxy(position, {
        get: (target: Matrix4Component, property: string) => {
            if (property === 'x' || property === 'y' || property === 'z' || property === 'order') {
                return euler[property];
            }
            return (target as any)[property];
        },
        set: (target: Matrix4Component, property: string, value: number | EulerRotationOrders) => {
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
            }
            return false;
        },
    });
}
