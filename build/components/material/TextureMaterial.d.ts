import AtlasTexture from "../texture/AtlasTexture";
import ImageBitmapTexture from "../texture/ImageBitmapTexture";
import Sampler from "../texture/Sampler";
import IMaterial, { IShaderCode } from "./IMatrial";
import Material from "./Material";
export default class TextureMaterial extends Material implements IMaterial {
    data: IShaderCode;
    constructor(texture: ImageBitmapTexture | AtlasTexture, sampler?: Sampler);
    get sampler(): Sampler;
    set sampler(sampler: Sampler);
    get texture(): ImageBitmapTexture;
    set texture(texture: ImageBitmapTexture);
    setTextureAndSampler(texture: ImageBitmapTexture, sampler?: Sampler): this;
}
