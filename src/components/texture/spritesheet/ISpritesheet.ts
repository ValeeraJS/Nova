import IFrame from "./IFrame";

export default interface ISpritesheet {
    image: string; // 图片url
    frames: IFrame[];
    spriteSize: {
        w: number;
        h: number;
    }
}
