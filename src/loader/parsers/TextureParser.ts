import Texture from "../../components/texture/Texture";
import { IParser } from "../IResourceItem";

export const TextureParser: IParser<Texture> = async (blob: Blob) => {
    const bitmap = await createImageBitmap(blob);
    return new Texture(bitmap.width, bitmap.height, bitmap);
}
