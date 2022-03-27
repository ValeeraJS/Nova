import Component from "@valeera/x/src/Component";
export declare enum TWEEN_STATE {
    IDLE = 0,
    START = 1,
    PAUSE = 2,
    STOP = -1
}
export declare type InterpolationType = {
    type: 'number' | 'vector2' | 'vector3' | 'vector4';
    origin: number | Float32Array;
    delta: number | Float32Array;
};
export default class Tween extends Component<Map<string, InterpolationType>> {
    from: any;
    to: any;
    duration: number;
    loop: number;
    state: TWEEN_STATE;
    time: number;
    data: Map<string, InterpolationType>;
    private oldLoop;
    constructor(from: any, to: any, duration?: number, loop?: number);
    reset(): void;
    private checkKeyAndType;
}
