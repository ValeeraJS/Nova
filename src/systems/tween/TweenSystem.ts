import { Vector2, Vector3, Vector4 } from "@valeera/mathx";
import { System, Entity } from "@valeera/x";
import { Tween } from "./Tween";

export class TweenSystem extends System {
    public constructor(name: string = "Tween System") {
        super((entity: Entity): boolean => {
            const component = entity.getComponent("tween") as Tween;
            if (!component) {
                return false;
            }
            component.time = 0;
            return true;
        }, () => { }, undefined, undefined, name);
    }

    public destroy(): this {
        throw new Error("Method not implemented.");
    }

    public handle(entity: Entity, _time: number, delta: number): this {
        let tweens = entity.getComponentsByClass(Tween) as Tween[];

        for (let i = 0, len = tweens.length; i < len; i++) {
            const tween = tweens[i];

            if (tween.end) {
                continue;
            }
            tween.time += delta;
            if (tween.time > tween.duration) {
                tween.loopTimes--;
                if (tween.loopTimes >= 0) {
                    tween.time -= tween.duration;
                } else {
                    tween.end = true;
                    tween.time = tween.duration;
                }
            }
            let map = tween.data;
            let from = tween.from;
            let rate = tween.easing(tween.time / tween.duration);
            if (from instanceof Float32Array) {
                let data = map.get(' ') as any;
                if (data.type === "vector2") {
                    Vector2.multiplyScalar(data.delta as Float32Array, rate, from as any);
                    Vector2.add(data.delta as Float32Array, data.origin as Float32Array, from as any);
                } else if (data.type === "vector3") {
                    Vector3.multiplyScalar(data.delta as Float32Array, rate, from as any);
                    Vector3.add(data.delta as Float32Array, data.origin as Float32Array, from as any);
                } else if (data.type === "vector4") {
                    Vector4.multiplyScalar(data.delta as Float32Array, rate, from as any);
                    Vector4.add(data.delta as Float32Array, data.origin as Float32Array, from as any);
                }

                return this;
            }

            map.forEach((data, key) => {
                if (data.type === "number") {
                    from[key] = (data.origin as number) + (data.delta as number) * rate;
                } else if (data.type === "vector2") {
                    Vector2.multiplyScalar(data.delta as Float32Array, rate, from[key]);
                    Vector2.add(data.delta as Float32Array, data.origin as Float32Array, from[key]);
                } else if (data.type === "vector3") {
                    Vector3.multiplyScalar(data.delta as Float32Array, rate, from[key]);
                    Vector3.add(data.delta as Float32Array, data.origin as Float32Array, from[key]);
                } else if (data.type === "vector4") {
                    Vector4.multiplyScalar(data.delta as Float32Array, rate, from[key]);
                    Vector4.add(data.delta as Float32Array, data.origin as Float32Array, from[key]);
                }
            });
        }
        return this;
    }

}
