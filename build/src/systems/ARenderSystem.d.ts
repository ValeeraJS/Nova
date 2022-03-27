import IEntity from "@valeera/x/src/interfaces/IEntity";
import IEntityManager from "@valeera/x/src/interfaces/IEntityManager";
import ISystemManager from "@valeera/x/src/interfaces/ISystemManager";
import IWorld, { TWorldInjection } from "@valeera/x/src/interfaces/IWorld";
import IRenderSystem from "./IRenderSystem";
export default abstract class ARenderSystem implements IRenderSystem {
    addRenderer(renderer: any): this;
    setClear(): this;
    id: number;
    disabled: boolean;
    entitySet: WeakMap<IEntityManager, Set<IEntity>>;
    loopTimes: number;
    name: string;
    usedBy: ISystemManager[];
    checkEntityManager(entityManager: IEntityManager): this;
    checkUpdatedEntities(manager: IEntityManager | null): this;
    query(entity: IEntity): boolean;
    handle(entity: IEntity, params: TWorldInjection): this;
    run(world: IWorld): this;
}
