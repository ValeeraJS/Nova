import EventFire from "@valeera/eventfirer";
import Timeline from "@valeera/timeline";
import { DEFAULT_ENGINE_OPTIONS, EngineEvents, EngineOptions } from "./IEngine";
import { EngineTaskChunk } from "./TaskChunk";

export class Engine extends EventFire.mixin(Timeline) {
    public options: Required<EngineOptions>;
    public static Events = EngineEvents;
    private taskChunkTimeMap = new Map<EngineTaskChunk, number>();

    #taskChunks = new Map<string, EngineTaskChunk>();

    public constructor(options: EngineOptions = {}) {
        super();
        this.options = {
            ...DEFAULT_ENGINE_OPTIONS,
            ...options,
        }
        if (this.options.autoStart) {
            this.start();
        }
    }

    addTask(task: Function, needTimeReset?: boolean, chunkName?: string) {
        if (!chunkName) {
            return super.addTask(task, needTimeReset);
        }
        const chunk = this.#taskChunks.get(chunkName);
        if (!chunkName) {
            return super.addTask(task, needTimeReset);
        }

        chunk.addTask(task, needTimeReset);

        return this;
    }

    addTaskChunk(chunk: EngineTaskChunk, needTimeReset?: boolean) {
        this.#taskChunks.set(chunk.name, chunk);
        if (needTimeReset) {
            this.taskChunkTimeMap.set(chunk, this.time);
        }

        return this;
    }

    removeTaskChunk(chunk: EngineTaskChunk | string) {
        if (typeof chunk === 'string') {
            this.#taskChunks.delete(chunk);
        } else {
            this.#taskChunks.delete(chunk.name);
        }

        return this;
    }

    runChunk(chunk: EngineTaskChunk, time: number, delta: number) {
        if (chunk.disabled) {
            return this;
        }
        chunk.run(time - (this.taskChunkTimeMap.get(chunk) ?? 0), delta);

        return this;
    }

    protected update(time: number, delta: number): this {
        this.fire(Engine.Events.LOOP_STARTED, this);
        super.update(time, delta);
        this.#taskChunks.forEach((chunk) => {
            this.runChunk(chunk, time, delta);
        });
        this.fire(Engine.Events.LOOP_ENDED, this);

        return this;
    }
}
