import { Vector2, Vector3, Vector4 } from "@valeera/mathx/src";
import Component from "@valeera/x/src/Component";

export enum TWEEN_STATE {
	IDLE = 0,
	START = 1,
	PAUSE = 2,
	STOP = -1
}

export type InterpolationType {
	type: 'number' | 'vector2' | 'vector3' | 'vector4';
	origin: number | Float32Array; // 原始值
	delta: number | Float32Array; // to和from值的差
}

export default class Tween extends Component<Map<string, InterpolationType>> {
	public from: any;
	public to: any;
	public duration: number;
	public loop: number;
	public state: TWEEN_STATE;
	public time: number;
	public data!: Map<string, InterpolationType>;
	private oldLoop: number;

	constructor(from: any, to: any, duration: number = 1000, loop = 0) {
		super("tween", new Map());
		this.oldLoop = loop;
		this.from = from;
		this.to = to;
		this.duration = duration;
		this.loop = loop;
		this.state = TWEEN_STATE.IDLE;
		this.time = 0;
		this.checkKeyAndType(from, to);
	}

	public reset() {
		this.loop = this.oldLoop;
		this.time = 0;
		this.state = TWEEN_STATE.IDLE;
	}

	// 检查from 和 to哪些属性是可以插值的
	private checkKeyAndType(from: any, to: any) {
		let map = this.data;
		for (let key in to) {
			if (key in from) {
				// TODO 目前只支持数字和F32数组插值，后续扩展
				if (typeof to[key] === 'number' &&  'number' === from[key]) {
					map.set(key, {
						type: 'number',
						origin: from[key],
						delta: to[key] - from[key]
					});
				} else if (to[key] instanceof Float32Array && from[key] instanceof Float32Array) {
					if (Math.min(from[key].length, to[key].length) === 2) {
						map.set(key, {
							type: 'vector2',
							origin: new Float32Array(from[key]),
							delta: Vector2.minus(to[key], from[key])
						});
					} else if (Math.min(from[key].length, to[key].length) === 3) {
						map.set(key, {
							type: 'vector3',
							origin: new Float32Array(from[key]),
							delta: Vector3.minus(to[key], from[key])
						});
					} else if (Math.min(from[key].length, to[key].length) === 4) {
						map.set(key, {
							type: 'vector4',
							origin: new Float32Array(from[key]),
							delta: Vector4.minus(to[key], from[key])
						});
					}
				}
			}
		}

		return this;
	}
}
