import { Component } from "@valeera/x";
import { RENDERABLE } from "../../components/constants";

export interface RenderableData<T, U> {
    type: string;
    geometry: T;
    material: U;
}

export class Renderable<T, U> extends Component<RenderableData<T, U>> {
    public tags = [{
        label: RENDERABLE,
        unique: false
    }];

    constructor(data: RenderableData<T, U>) {
        super(data, undefined, RENDERABLE);
    }

    get geometry() {
        return this.data.geometry;
    }

    set geometry(v: T) {
        this.data.geometry = v;
        this.dirty = true;
    }

    get material() {
        return this.data.material;
    }

    set material(v: U) {
        this.data.material = v;
        this.dirty = true;
    }
}
