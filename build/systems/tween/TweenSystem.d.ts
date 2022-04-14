import System from "@valeera/x/src/System";
import IEntity from "@valeera/x/src/interfaces/IEntity";
import IWorld, { TWorldInjection } from "@valeera/x/src/interfaces/IWorld";
export default class TweenSystem extends System {
    query(entity: IEntity): boolean;
    destroy(): this;
    run(world: IWorld): this;
    handle(entity: IEntity, _params: TWorldInjection): this;
}
