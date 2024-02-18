import { Object3 } from "../entities/Object3";
import { Geometry, Renderable } from "../systems/render";
import { IMaterial } from "../systems/render/IMatrial";
import { BitmapFontChar, BitmapFontJson } from "./BitmapFontType";
export declare class BitmapFontChar3 extends Renderable<Geometry, IMaterial> {
    static readonly RenderType = "mesh3";
    charData: BitmapFontChar;
    font: BitmapFontJson;
    constructor(char: BitmapFontChar, font: BitmapFontJson);
    update(): this;
    setChar(text: string | number): this;
}
export type FontStyle = {
    textAlign?: "left" | "center" | "right";
    fontSize?: number;
};
export declare class BitmapFontString extends Object3 {
    #private;
    font: BitmapFontJson;
    style: FontStyle;
    constructor(str: string, font: BitmapFontJson, name?: string);
    destroy(): this;
    get text(): string;
    set text(text: string);
    get textAlign(): "left" | "center" | "right";
    set textAlign(value: "left" | "center" | "right");
    update(text: string): void;
}
