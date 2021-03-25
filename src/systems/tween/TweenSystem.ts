import { Vector2, Vector3, Vector4 } from "@valeera/mathx/src/vector";
import ASystem from "@valeera/x/src/ASystem";
import IEntity from "@valeera/x/src/interfaces/IEntity";
import IWorld, { TWorldInjection } from "@valeera/x/src/interfaces/IWorld";
import Tween from "../../components/tween/Tween";

export default class TweenSystem extends ASystem {

    public query(entity: IEntity): boolean {
        return entity.hasComponent("tween");
    }

    public destroy(): void {
        throw new Error("Method not implemented.");
    }

    public run(world: IWorld): this {
        
        return super.run(world);
    }

    public handle(entity: IEntity, params: TWorldInjection): this {
        let tweenC = entity.getComponent("tween") as Tween;
        let map = tweenC.data;
        let from= tweenC.from;
        map.forEach((data, key) => {
            let rate = tweenC.time / tweenC.duration;
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