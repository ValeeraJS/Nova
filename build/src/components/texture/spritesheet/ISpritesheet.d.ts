import IFrame from "./IFrame";
export default interface ISpritesheet {
    image: string;
    frames: IFrame[];
    spriteSize: {
        w: number;
        h: number;
    };
}
