import { BitmapFontChar3 } from "./BitmapFontText";
import { BitmapFontJson } from "./BitmapFontType";
export declare class BitmapFontManager {
    fontStore: Map<string, BitmapFontJson>;
    addFont(json: BitmapFontJson): this;
    createChar(charTextOrCode: string | number, fontName: string): BitmapFontChar3;
}
