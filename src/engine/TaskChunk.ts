import EventFirer from "@valeera/eventfirer";

export class EngineTaskChunk extends EventFirer {
    public static readonly START = 'start';
    public static readonly END = 'end';
    public name: string;
    public disabled = false;
    public time = 0;
    public delta = 0;
	private taskTimeMap = new WeakMap<Function, number>();

    #tasks: Function[] = [];

    get tasksCount() {
        return this.#tasks.length;
    }

    public constructor(name: string) {
        super();
        this.name = name;
    }

    public addTask(task: Function, needTimeReset?: boolean) {
        this.#tasks.push(task);
        if (needTimeReset) {
			this.taskTimeMap.set(task, this.time);
		}
    }

    public removeTask(task: Function) {
        let i = this.#tasks.indexOf(task);
        if (i > -1) {
            this.#tasks.splice(i, 1);
        }
    }

    public run = (time: number, delta: number): this => {
        this.time = time;
        this.delta = delta;
        this.fire(EngineTaskChunk.START, this);
        let len = this.#tasks.length;

        for (let i = 0; i < len; i++) {
            const t = this.#tasks[i];
            t(time - (this.taskTimeMap.get(t) ?? 0), delta);
        }

        return this.fire(EngineTaskChunk.END, this);
    }
}
