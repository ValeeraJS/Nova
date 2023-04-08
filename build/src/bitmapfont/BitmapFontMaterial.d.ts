import { Vector2, Vector2Like, Vector4, Vector4Like } from "@valeera/mathx";
import { Texture, Sampler } from "../systems/render";
import { IMaterial } from "../systems/render/IMatrial";
import { Material } from "../systems/render/webgpu";
export declare class BitmapFontMaterial extends Material implements IMaterial {
    #private;
    constructor(texture: Texture, sampler?: Sampler);
    get sampler(): Sampler;
    set sampler(sampler: Sampler);
    get texture(): Texture;
    set texture(texture: Texture);
    get channel(): Vector4;
    set channel(vec4: Vector4Like);
    get position(): Vector2;
    set position(vec2: Vector2Like);
    get size(): Vector2;
    set size(vec2: Vector2Like);
    get offset(): Vector2;
    set offset(vec2: Vector2Like);
    get bitmapSize(): Vector2;
    set bitmapSize(vec2: Vector2Like);
    setTextureAndSampler(texture: Texture, sampler?: Sampler): this;
    update(): this;
}
