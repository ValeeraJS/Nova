import { Texture } from "../../systems/render/texture/Texture";
import { IParser } from "../IResourceItem";
export type GifFrame = {
    x: number;
    y: number;
    width: number;
    height: number;
    has_local_palette: boolean;
    palette_offset: number;
    palette_size: number;
    data_offset: number;
    data_length: number;
    transparent_index: number;
    interlaced: boolean;
    delay: number;
    disposal: number;
};
export declare const GifParser: IParser<Texture[]>;
