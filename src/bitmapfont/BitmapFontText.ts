import { Geometry, Renderable, Texture } from "../systems/render";
import { createPlane } from "../systems/render/geometry/factory3";
import { IMaterial } from "../systems/render/IMatrial";
import { BitmapFontMaterial } from "./BitmapFontMaterial";
import { BitmapFontChar, BitmapFontJson } from "./BitmapFontType";

const CommonGeometry = createPlane({
	width: 1,
	height: 1,
})

export class BitmapFontChar3 extends Renderable<Geometry, IMaterial> {
	public static readonly RenderType = "mesh3";
	#charData: BitmapFontChar;
	font: BitmapFontJson;
	constructor(char: BitmapFontChar, font: BitmapFontJson) {
		super({
			type: BitmapFontChar3.RenderType,
			geometry: CommonGeometry,
			material: new BitmapFontMaterial(font.pages[char.page]),
		});
		this.#charData = char;
		this.font = font;
		this.update();
	}

	update() {
		(this.data.material as BitmapFontMaterial).offset.x = this.#charData.xoffset;
		(this.data.material as BitmapFontMaterial).offset.y = this.#charData.yoffset;
		(this.data.material as BitmapFontMaterial).size.x = this.#charData.width;
		(this.data.material as BitmapFontMaterial).size.y = this.#charData.height;
		(this.data.material as BitmapFontMaterial).position.x = this.#charData.x;
		(this.data.material as BitmapFontMaterial).position.y = this.#charData.y;
		(this.data.material as BitmapFontMaterial).bitmapSize.x = this.font.common.scaleW;
		(this.data.material as BitmapFontMaterial).bitmapSize.y = this.font.common.scaleH;
		(this.data.material as BitmapFontMaterial).update();
		this.dirty = this.data.material.dirty = true;

		return this;
	}

	setChar(text: string | number) {
		if (typeof text === "string") {
			text = text.charCodeAt(0);
		}
		for (let i = 0, len = this.font.chars.length; i < len; i++) {
			if (this.font.chars[i].id === text) {
				this.#charData = this.font.chars[i];
				return this.update();
			}
		}
		return this;;
	}
}
