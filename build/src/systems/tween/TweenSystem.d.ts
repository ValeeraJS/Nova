import { System, IEntity } from "@valeera/x";
export declare class TweenSystem extends System {
    constructor(name?: string);
    destroy(): this;
    handle(entity: IEntity, _time: number, delta: number): this;
}
