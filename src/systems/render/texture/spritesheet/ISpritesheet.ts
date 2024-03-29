import { IFrame } from "./IFrame";

export interface ISpritesheet {
    image: string; // 图片url
    frames: IFrame[];
    spriteSize: {
        w: number;
        h: number;
    }
}

export interface IAltas {
    image: string;
    frame: IFrame;
    spriteSize: {
        w: number;
        h: number;
    }
}
