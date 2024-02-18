import { System, Entity } from "@valeera/x";
export declare class TweenSystem extends System {
    constructor(name?: string);
    destroy(): this;
    handle(entity: Entity, _time: number, delta: number): this;
}
