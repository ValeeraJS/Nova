import IEntity from "@valeera/x/src/interfaces/IEntity";
import { Matrix4Component } from "../matrix4";
import { TRANSLATION_3D } from "../constants";

export default (position: Matrix4Component | IEntity) => {
    if ((position as IEntity).isEntity) {
        position = (position as IEntity).getComponent(TRANSLATION_3D) as Matrix4Component;
    }
    return new Proxy(position, {
        get: (target: Matrix4Component, property: string) => {
            if (property === 'x') {
                return target.data[12];
            } else if (property === 'y') {
                return target.data[13];
            } else if (property === 'z') {
                return target.data[14];
            }
            return (target as any)[property];
        },
        set: (target: Matrix4Component, property: string, value: number) => {
            if (property === 'x') {
                target.dirty = true;
                target.data[12] = value;
                return true;
            } else if (property === 'y') {
                target.dirty = true;
                target.data[13] = value;
                return true;
            } else if (property === 'z') {
                target.dirty = true;
                target.data[14] = value;
                return true;
            }
            return false;
        },
    });
}
