import IFrame from "./IFrame";
export default interface ISpritesheet {
    image: string;
    frames: IFrame[];
    spriteSize: {
        w: number;
        h: number;
    };
}
export interface IAltas {
    image: string;
    frame: IFrame;
    spriteSize: {
        w: number;
        h: number;
    };
}
