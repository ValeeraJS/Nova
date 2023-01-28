import EventFirer from "@valeera/eventfirer";

export class EngineTaskChunk extends EventFirer {
    public static readonly START = 'start';
    public static readonly END = 'end';
    public name: string;

    #tasks: Function[] = [];

    get tasksCount() {
        return this.#tasks.length;
    }

    public constructor(name: string) {
        super();
        this.name = name;
    }

    public addTask(task: Function) {
        this.#tasks.push(task);
    }

    public removeTask(task: Function) {
        let i = this.#tasks.indexOf(task);
        if (i > -1) {
            this.#tasks.splice(i, 1);
        }
    }

    public run = (time: number, delta: number): this => {
        this.fire(EngineTaskChunk.START, this);
        let len = this.#tasks.length;

        for (let i = 0; i < len; i++) {
            this.#tasks[i](time, delta);
        }

        return this.fire(EngineTaskChunk.END, this);
    }
}
