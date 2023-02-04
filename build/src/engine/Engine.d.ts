import { EngineEvents, EngineOptions } from "./IEngine";
import { EngineTaskChunk } from "./TaskChunk";
declare const Engine_base: any;
export declare class Engine extends Engine_base {
    #private;
    options: Required<EngineOptions>;
    static Events: typeof EngineEvents;
    private taskChunkTimeMap;
    constructor(options?: EngineOptions);
    addTask(task: Function, needTimeReset?: boolean, chunkName?: string): any;
    addTaskChunk(chunk: EngineTaskChunk, needTimeReset?: boolean): this;
    removeTaskChunk(chunk: EngineTaskChunk | string): this;
    runChunk(chunk: EngineTaskChunk, time: number, delta: number): this;
    protected update(time: number, delta: number): this;
}
export {};
