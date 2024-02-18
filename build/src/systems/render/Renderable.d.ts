import { Component } from "@valeera/x";
export interface RenderableData<T, U> {
    type: string;
    geometry: T;
    material: U;
}
export declare class Renderable<T, U> extends Component<RenderableData<T, U>> {
    tags: {
        label: string;
        unique: boolean;
    }[];
    constructor(data: RenderableData<T, U>);
    get geometry(): T;
    set geometry(v: T);
    get material(): U;
    set material(v: U);
}
