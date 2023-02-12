import { System, IEntity } from "@valeera/x";
export declare class TweenSystem extends System {
    query(entity: IEntity): boolean;
    destroy(): this;
    handle(entity: IEntity, _time: number, delta: number): this;
}
