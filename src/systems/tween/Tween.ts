import { Vector2, Vector3, Vector4 } from "@valeera/mathx";
import { Easing } from "@valeera/mathx";
import { Component } from "@valeera/x";

export enum TWEEN_STATE {
	IDLE = 0,
	START = 1,
	PAUSE = 2,
	STOP = -1
}

export type InterpolationType = {
	type: 'number' | 'vector2' | 'vector3' | 'vector4';
	origin: number | Float32Array | number[] | ArrayLike<number>; // 原始值
	delta: number | Float32Array | number[] | ArrayLike<number>; // to和from值的差
}

export class Tween extends Component<Map<string, InterpolationType>> {
	public static States = TWEEN_STATE;
	public from: any;
	public to: any;
	public duration: number;
	public loopTimes: number;
	public state: TWEEN_STATE;
	public time: number;
	public end = false;
	public loop: number;
	public easing: (p: number) => number = Easing.Linear;

	constructor(from: any, to: any, duration = 1000, loop = 0) {
		super(new Map(), [], "Tween");
		this.loop = loop;
		this.from = from;
		this.to = to;
		this.duration = duration;
		this.loopTimes = loop;
		this.state = TWEEN_STATE.IDLE;
		this.time = 0;
		this.checkKeyAndType(from, to);
	}

	public reset() {
		this.loopTimes = this.loop;
		this.time = 0;
		this.state = TWEEN_STATE.IDLE;
		this.end = false;
	}

	// 检查from 和 to哪些属性是可以插值的
	private checkKeyAndType(from: any, to: any) {
		let map = this.data;
		if (from instanceof Float32Array && to instanceof Float32Array) {
			if (Math.min(from.length, to.length) === 2) {
				map.set(' ', {
					type: 'vector2',
					origin: new Float32Array(from),
					delta: Vector2.minus(to, from)
				});
			} else if (Math.min(from.length, to.length) === 3) {
				map.set(' ', {
					type: 'vector3',
					origin: new Float32Array(from),
					delta: Vector3.minus(to, from)
				});
			} else if (Math.min(from.length, to.length) === 4) {
				map.set(' ', {
					type: 'vector4',
					origin: new Float32Array(from),
					delta: Vector4.minus(to, from)
				});
			}
			return this;
		}
		for (let key in to) {
			if (key in from) {
				// TODO 目前只支持数字和F32数组插值，后续扩展
				if (typeof to[key] === 'number' && typeof from[key] === 'number') {
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
