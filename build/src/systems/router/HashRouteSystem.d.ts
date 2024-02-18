import { World, Entity, System } from "@valeera/x";
export declare class HashRouteSystem extends System {
    private static listeningHashChange;
    private static count;
    private static listener;
    static currentPath: string;
    currentPath: string;
    constructor();
    destroy(): this;
    handle(entity: Entity): this;
    run(world: World, time: number, delta: number): this;
}
