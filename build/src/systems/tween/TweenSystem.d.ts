import { System, IEntity } from "@valeera/x";
export default class TweenSystem extends System {
    query(entity: IEntity): boolean;
    destroy(): this;
    handle(entity: IEntity, time: number, delta: number): this;
}
