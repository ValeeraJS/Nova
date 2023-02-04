import { Component } from "@valeera/x";
export declare enum TWEEN_STATE {
    IDLE = 0,
    START = 1,
    PAUSE = 2,
    STOP = -1
}
export type InterpolationType = {
    type: 'number' | 'vector2' | 'vector3' | 'vector4';
    origin: number | Float32Array | number[] | ArrayLike<number>;
    delta: number | Float32Array | number[] | ArrayLike<number>;
};
export default class Tween extends Component<Map<string, InterpolationType>> {
    static States: typeof TWEEN_STATE;
    from: any;
    to: any;
    duration: number;
    loop: number;
    state: TWEEN_STATE;
    time: number;
    end: boolean;
    private loopWholeTimes;
    constructor(from: any, to: any, duration?: number, loop?: number);
    reset(): void;
    private checkKeyAndType;
}
