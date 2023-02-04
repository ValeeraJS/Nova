import EventFirer from "@valeera/eventfirer";
export declare class EngineTaskChunk extends EventFirer {
    #private;
    static readonly START = "start";
    static readonly END = "end";
    name: string;
    disabled: boolean;
    time: number;
    delta: number;
    private taskTimeMap;
    get tasksCount(): number;
    constructor(name: string);
    addTask(task: Function, needTimeReset?: boolean): void;
    removeTask(task: Function): void;
    run: (time: number, delta: number) => this;
}
