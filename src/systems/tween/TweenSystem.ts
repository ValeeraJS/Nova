import { Vector2, Vector3, Vector4 } from "@valeera/mathx";
import System from "@valeera/x/src/System";
import IEntity from "@valeera/x/src/interfaces/IEntity";
import IWorld from "@valeera/x/src/interfaces/IWorld";
import Tween from "../../components/tween/Tween";

export default class TweenSystem extends System {

    public query(entity: IEntity): boolean {
        return entity.hasComponent("tween");
    }

    public destroy(): this {
        throw new Error("Method not implemented.");
    }

    public run(world: IWorld, time: number, delta: number): this {
        
        return super.run(world, time, delta);
    }

    public handle(entity: IEntity): this {
        let tweenC = entity.getComponent("tween") as Tween;
        let map = tweenC.data;
        let from= tweenC.from;
        let rate = tweenC.time / tweenC.duration;
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

        return this;
    }
    
}