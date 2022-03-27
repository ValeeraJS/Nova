import { Component } from "@valeera/x/src";
import ImageBitmapTexture from "../texture/ImageBitmapTexture";
import Sampler from "../texture/Sampler";
import IMaterial, { IShaderCode } from "./IMatrial";
export default class TextureMaterial extends Component<IShaderCode> implements IMaterial {
    data: IShaderCode;
    constructor(texture: ImageBitmapTexture, sampler?: Sampler);
    get sampler(): Sampler;
    set sampler(sampler: Sampler);
    get texture(): ImageBitmapTexture;
    set texture(texture: ImageBitmapTexture);
    setTextureAndSampler(texture: ImageBitmapTexture, sampler?: Sampler): this;
}
