import Timeline from "@valeera/timeline";
import { EngineEvents, EngineOptions } from "./IEngine";
import { EngineTaskChunk } from "./TaskChunk";
declare const Engine_base: (new (...args: any[]) => {
    filters: import("@valeera/eventfire").TFilter[];
    listeners: Map<import("@valeera/eventfire").TEventKey, import("@valeera/eventfire").TListenersValue>;
    all(listener: import("@valeera/eventfire").TListener, checkDuplicate?: boolean): any;
    clearListenersByKey(eventKey: import("@valeera/eventfire").TEventKey): any;
    clearAllListeners(): any;
    filt(rule: import("@valeera/eventfire").TEventFilter, listener: import("@valeera/eventfire").TListenerFilter, checkDuplicate?: boolean): any;
    fire(eventKey: import("@valeera/eventfire").TEventKey | import("@valeera/eventfire").TEventKey[], target?: any): any;
    off(eventKey: import("@valeera/eventfire").TEventKey, listener: import("@valeera/eventfire").TListener): any;
    on(eventKey: import("@valeera/eventfire").TEventKey | import("@valeera/eventfire").TEventKey[], listener: import("@valeera/eventfire").TListener, checkDuplicate?: boolean): any;
    once(eventKey: import("@valeera/eventfire").TEventKey, listener: import("@valeera/eventfire").TListener, checkDuplicate?: boolean): any;
    times(eventKey: import("@valeera/eventfire").TEventKey, times: number, listener: import("@valeera/eventfire").TListener, checkDuplicate?: boolean): any;
}) & typeof Timeline;
export declare class Engine extends Engine_base {
    #private;
    options: Required<EngineOptions>;
    static Events: typeof EngineEvents;
    private taskChunkTimeMap;
    constructor(options?: EngineOptions);
    addTask(task: Function, needTimeReset?: boolean, chunkName?: string): this;
    addTaskChunk(chunk: EngineTaskChunk, needTimeReset?: boolean): this;
    removeTask(task: Function, chunkName?: string): this;
    removeTaskChunk(chunk: EngineTaskChunk | string): this;
    runChunk(chunk: EngineTaskChunk, time: number, delta: number): this;
    protected update(time: number, delta: number): this;
}
export {};
