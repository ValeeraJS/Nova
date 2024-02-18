import { EuclidPosition3 } from "../components";
import { Object3 } from "../entities/Object3";
import { Geometry, Renderable } from "../systems/render";
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

export type FontStyle = {
	textAlign?: "left" | "center" | "right";
	fontSize?: number;
}

export class BitmapFontString extends Object3 {
	font: BitmapFontJson;
	#text: string;
	#chars: Object3[] = [];
	style: FontStyle = {};
	#textPixelWidth = 0;
	constructor(str: string, font: BitmapFontJson, name?: string) {
		super(name ?? str);
		this.font = font;
		this.#text = str;
		this.update(str);
	}
	destroy() {
		for (let i = 0, len = this.#chars.length; i < len; i++) {
			(this.#chars[i] as any).destroy();
		}

		return super.destroy();
	}

	get text() {
		return this.#text;
	}

	set text(text: string) {
		this.#text = text;
		this.update(this.#text);
	}

	get textAlign() {
		return this.style.textAlign;
	}

	set textAlign(value: "left" | "center" | "right") {
		const old = this.style.textAlign;
		this.style.textAlign = value;
		if (old === value) {
			return;
		}
		const v1 = old === "right" ? 0 : (old === "center" ? 0.5 : 1 );
		const v2 = value === "right" ? 0 : (value === "center" ? 0.5 : 1 );
		const delta = v2 - v1;
		for (let i = 0, len = this.#text.length; i < len; i++) {
			(this.#chars[i].position as EuclidPosition3).x += delta * this.#textPixelWidth;
		}
	}

	update(text: string) {
		let x = 0;
		const oldLength = this.#chars.length;
		for (let i = 0, len = text.length; i < len; i++) {
			const e = this.#chars[i] ?? new Object3();
			let char: BitmapFontChar3 = e.getComponent(BitmapFontChar3) as BitmapFontChar3;
			const code = text.charCodeAt(i);
			if (char) {
				char.setChar(code);
			} else {
				for (let i = 0, len = this.font.chars.length; i < len; i++) {
					if (this.font.chars[i].id === code) {
						char = new BitmapFontChar3(this.font.chars[i], this.font);
						break;
					}
				}
				e.addComponent(char);
				this.#chars.push(e);
			}
			(e.position as EuclidPosition3).x = x;
			x += char.charData.xadvance;
			this.addChild(e);
			e.disabled = false;
		}
		this.#textPixelWidth = x;
		if (this.style.textAlign === "center") {
			const h = x * 0.5;
			for (let i = 0, len = this.#text.length; i < len; i++) {
				(this.#chars[i].position as EuclidPosition3).x -= h;
			}
		} else if (this.style.textAlign === "right") {
			for (let i = 0, len = this.#text.length; i < len; i++) {
				(this.#chars[i].position as EuclidPosition3).x -= x;
			}
		}
		if (oldLength > this.#text.length) {
			for (let i = this.#text.length; i < oldLength; i++) {
				this.#chars[i].disabled = true;
			}
		}
	}
}
