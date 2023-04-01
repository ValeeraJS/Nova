import { Texture, Sampler } from "../../texture";
import { IMaterial } from "../../IMatrial";
import { Material } from "./Material";
export declare class TextureMaterial extends Material implements IMaterial {
    constructor(texture: Texture, sampler?: Sampler);
    get sampler(): Sampler;
    set sampler(sampler: Sampler);
    get texture(): Texture;
    set texture(texture: Texture);
    get alpha(): number;
    set alpha(alpha: number);
    setTextureAndSampler(texture: Texture, sampler?: Sampler): this;
}
