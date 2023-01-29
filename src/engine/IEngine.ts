export enum EngineEvents {
	LOOP_STARTED = "loop-started",
	LOOP_ENDED = "loop-ended",
}

export interface EngineOptions {
	container?: HTMLElement;
	autoStart?: boolean;
}

export const DEFAULT_ENGINE_OPTIONS: Required<EngineOptions> = {
	autoStart: true,
	container: document.body
}
