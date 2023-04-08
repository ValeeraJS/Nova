import { BitmapFontChar3 } from "./BitmapFontText";
import { BitmapFontJson } from "./BitmapFontType";

export class BitmapFontManager {
    fontStore: Map<string, BitmapFontJson> = new Map();
    addFont(json: BitmapFontJson): this {
        if (this.fontStore.has(json.info.face)) {
            console.log(`Font "${json.info.face}" already exists`);
            return this;
        }
        this.fontStore.set(json.info.face, json);
        return this;
    }
    createChar(charTextOrCode: string | number, fontName: string, fontSize?: number): BitmapFontChar3 {
        if (typeof charTextOrCode === "string") {
            charTextOrCode = charTextOrCode.charCodeAt(0);
        }
        let fontData = this.fontStore.get(fontName);
        let char: BitmapFontChar3
        for (let i = 0, len = fontData.chars.length; i<len; i++) {
            if (fontData.chars[i].id === charTextOrCode) {
                char  = new BitmapFontChar3(fontData.chars[i], fontData);
            }
        }
        return char;
    }
}