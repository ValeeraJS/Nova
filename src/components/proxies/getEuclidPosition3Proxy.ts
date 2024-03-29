import { Entity } from "@valeera/x";
import Matrix4Component from "../matrix4/Matrix4Component";
import { TRANSLATION_3D } from "../constants";

export default (position: Matrix4Component | Entity) => {
    if ((position as Entity).isEntity) {
        position = (position as Entity).getComponent(TRANSLATION_3D) as Matrix4Component;
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
        set: (target: Matrix4Component, property: string, value: number | boolean) => {
            if (property === 'x') {
                target.dirty = true;
                target.data[12] = value as number;
                return true;
            } else if (property === 'y') {
                target.dirty = true;
                target.data[13] = value as number;
                return true;
            } else if (property === 'z') {
                target.dirty = true;
                target.data[14] = value as number;
                return true;
            } else if (property === 'dirty') {
                target.dirty = value as boolean;
                return true;
            }
            return false;
        },
    });
}
