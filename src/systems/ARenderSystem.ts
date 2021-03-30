import IEntity from "@valeera/x/src/interfaces/IEntity";
import IEntityManager from "@valeera/x/src/interfaces/IEntityManager";
import ISystemManager from "@valeera/x/src/interfaces/ISystemManager";
import IWorld, { TWorldInjection } from "@valeera/x/src/interfaces/IWorld";
import IRenderSystem from "./IRenderSystem";

export default abstract class ARenderSystem implements IRenderSystem {
    addRenderer(renderer: any): this {
        throw new Error("Method not implemented.");
    }
    setClear(): this {
        throw new Error("Method not implemented.");
    }
    id: number = 0;
    disabled: boolean = false;
    entitySet: WeakMap<IEntityManager, Set<IEntity>> = new WeakMap<IEntityManager, Set<IEntity>>();
    loopTimes: number = 0;
    name: string = "";
    usedBy: ISystemManager[] = [];
    checkEntityManager(entityManager: IEntityManager): this {
        throw new Error("Method not implemented.");
    }
    checkUpdatedEntities(manager: IEntityManager | null): this {
        throw new Error("Method not implemented.");
    }
    query(entity: IEntity): boolean {
        throw new Error("Method not implemented.");
    }
    handle(entity: IEntity, params: TWorldInjection): this {
        throw new Error("Method not implemented.");
    }
    run(world: IWorld): this {
        throw new Error("Method not implemented.");
    }
    
}