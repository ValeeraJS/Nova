import { IParser } from "../IResourceItem";
import { Texture } from "../../systems/render/texture/Texture";
import { IFrame } from "../../systems/render/texture/spritesheet/IFrame";
import { drawSpriteBlock } from "../../utils/drawSpriteBlock";

export const AtlasParser: IParser<Texture[]> = async (blob: Blob, json: { frames: IFrame[] }) => {
	const bitmap = await createImageBitmap(blob);
	const result: Texture[] = [];

	for (let i = 0, len = json.frames.length; i < len; i++) {
		const f = json.frames[i];
		const tex = new Texture({
			image: await drawSpriteBlock(bitmap, f.w, f.h, f),
			size: [f.w, f.h],
			name: f.name ?? "atlas_" + i
		});
		result.push(tex);
	}

	return result;
}
