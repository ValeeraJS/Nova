import { Geometry, Renderable } from "../systems/render";
import { IMaterial } from "../systems/render/IMatrial";
import { BitmapFontChar, BitmapFontJson } from "./BitmapFontType";
export declare class BitmapFontChar3 extends Renderable<Geometry, IMaterial> {
    #private;
    static readonly RenderType = "mesh3";
    font: BitmapFontJson;
    constructor(char: BitmapFontChar, font: BitmapFontJson);
    update(): this;
    setChar(text: string | number): this;
}
