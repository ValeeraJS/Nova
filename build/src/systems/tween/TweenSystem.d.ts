import ASystem from "@valeera/x/src/ASystem";
import IEntity from "@valeera/x/src/interfaces/IEntity";
import IWorld, { TWorldInjection } from "@valeera/x/src/interfaces/IWorld";
export default class TweenSystem extends ASystem {
    query(entity: IEntity): boolean;
    destroy(): void;
    run(world: IWorld): this;
    handle(entity: IEntity, params: TWorldInjection): this;
}
