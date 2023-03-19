import { IParser } from "../IResourceItem";
import { Texture } from "../../systems/render/texture/Texture";

export const TextureParser: IParser<Texture> = async (blob: Blob) => {
	const bitmap = await createImageBitmap(blob);
	return new Texture({
		size: [bitmap.width, bitmap.height],
		image: bitmap,
	});
}
