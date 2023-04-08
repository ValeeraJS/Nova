import { Texture } from "../systems/render/texture/Texture";

export type BitmapFontChar = {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    xoffset: number;
    yoffset: number;
    xadvance: number;
    page: number;
    chnl: number;
}

export type BitmapFontKerning = {
    first: number;
    second: number;
    amount: number;
}

export type BitmapFontCommonInfo = {
    lineHeight: number;
    base: number; // 基线位置
    scaleW: number;
    scaleH: number;
    pages: number;
    packed: boolean;
    alphaChnl: number;
    redChnl: number;
    greenChnl: number;
    blueChnl: number;
}

export type BitmapFontInfo = {
    face: string;
    size: number;
    bold: boolean;
    italic: boolean;
    charset: string;
    unicode: boolean;
    stretchH: number;
    smooth: boolean;
    aa: boolean;
    padding: number[];
    spacing: number[];
    outline: number;
}

export type BitmapFontJson = {
    pages: Texture[];
    chars: BitmapFontChar[];
    kernings: BitmapFontKerning[];
    info?: BitmapFontInfo;
    common?: BitmapFontCommonInfo;
}
