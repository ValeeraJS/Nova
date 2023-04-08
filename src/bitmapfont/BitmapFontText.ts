import { EuclidPosition3 } from "../components";
import { Object3 } from "../entities/Object3";
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
	charData: BitmapFontChar;
	font: BitmapFontJson;
	constructor(char: BitmapFontChar, font: BitmapFontJson) {
		super({
			type: BitmapFontChar3.RenderType,
			geometry: CommonGeometry,
			material: new BitmapFontMaterial(font.pages[char.page]),
		});
		this.charData = char;
		this.font = font;
		this.update();
	}

	update() {
		(this.data.material as BitmapFontMaterial).offset.x = this.charData.xoffset;
		(this.data.material as BitmapFontMaterial).offset.y = this.charData.yoffset;
		(this.data.material as BitmapFontMaterial).size.x = this.charData.width;
		(this.data.material as BitmapFontMaterial).size.y = this.charData.height;
		(this.data.material as BitmapFontMaterial).position.x = this.charData.x;
		(this.data.material as BitmapFontMaterial).position.y = this.charData.y;
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
				this.charData = this.font.chars[i];
				return this.update();
			}
		}
		return this;;
	}
}

export class BitmapFontString extends Object3 {
	font: BitmapFontJson;
	constructor(str: string, font: BitmapFontJson, name?: string) {
		super(name ?? str);
		this.font = font;
		this.setText(str);
	}
	destroyChildren() {
		for (let i = 0, len = this.children.length; i < len; i++) {
			(this.children[i] as any).destroy();
		}
	}
	setText(text: string) {
		this.destroyChildren();
		let x = 0;
		for (let i = 0, len = text.length; i < len; i++) {
			const e = new Object3();
			let char: BitmapFontChar3;
			const code = text.charCodeAt(i);
			for (let i = 0, len = this.font.chars.length; i < len; i++) {
				if (this.font.chars[i].id === code) {
					char = new BitmapFontChar3(this.font.chars[i], this.font);
					break;
				}
			}
			e.addComponent(char);
			(e.position as EuclidPosition3).x = x;
			x += char.charData.xadvance;
			this.addChild(e);
		}
	}
}
