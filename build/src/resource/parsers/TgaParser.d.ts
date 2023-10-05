import { Texture } from "./../../systems/render/texture/Texture";
import { IParser } from "./../IResourceItem";
export interface TgaHeader {
    idLength: number;
    colorMapType: number;
    imageType: number;
    colorMapIndex: number;
    colorMapLength: number;
    colorMapDepth: number;
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
    pixelDepth: number;
    flags: number;
    hasEncoding: boolean;
    hasColorMap: boolean;
    isGreyColor: boolean;
}
export declare const TgaParser: IParser<Texture>;
