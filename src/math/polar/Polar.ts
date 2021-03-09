import IPolar from "./interfaces/IPolar";

let x: number, y: number;

/**
 * @class
 * @classdesc 极坐标
 * @implements {Mathx.IPolar}
 * @name Mathx.Polar
 * @desc 极坐标，遵守数学右手定则。规定逆时针方向为正方向。
 * @param {number} [r=0] | 距离极点距离
 * @param {number} [a=0] | 旋转弧度，规定0弧度为笛卡尔坐标系x轴方向
 */
export default class Polar implements IPolar {
	/**
	 * @public
	 * @method create
	 * @memberof Mathx.Polar
	 * @desc 创建一个极坐标
	 * @param {number} [r=0] 距离
	 * @param {number} [a=0] 弧度
	 * @returns {Mathx.Polar} 新的极坐标实例
	 */
	public static create(r = 0, a = 0): Polar {
		return new Polar(r, a);
	}

	public a: number;
	public r: number;
	/**
	 * @public
	 * @member {number} Mathx.Polar.prototype.a
	 * @desc 旋转弧度
	 * @default 0
	 */
	/**
	 * @public
	 * @member {number} Mathx.Polar.prototype.r
	 * @desc 距离
	 * @default 0
	 */
	public constructor(r = 0, a = 0) {
		this.r = r;
		this.a = a;
	}

	/**
	 * @public
	 * @method Mathx.Polar.prototype.distanceTo
	 * @desc 求该坐标到另一个极坐标的欧几里得距离
	 * @param {Mathx.IPolar} p | 目标极坐标
	 * @returns {number} 欧几里得距离
	 */
	public distanceTo(p: IPolar): number {
		return Math.sqrt(this.distanceToSquared(p));
	}

	/**
	 * @public
	 * @method Mathx.Polar.prototype.distanceToManhattan
	 * @desc 求该坐标到另一个极坐标的曼哈顿距离
	 * @param {Mathx.IPolar} p | 目标极坐标
	 * @returns {number} 曼哈顿距离
	 */
	public distanceToManhattan({ r, a }: IPolar): number {
		return Math.cos(a) * r - this.x() + Math.sin(a) * r - this.y();
	}

	/**
	 * @public
	 * @method Mathx.Polar.prototype.distanceToSquared
	 * @desc 求该坐标到另一个极坐标的欧几里得距离平方
	 * @param {Mathx.IPolar} p | 目标极坐标
	 * @returns {number} 欧几里得距离平方
	 */
	public distanceToSquared({ r, a }: IPolar): number {
		return this.r * this.r + r * r - 2 * r * this.r * Math.cos(a - this.a);
	}

	/**
	 * @public
	 * @method Mathx.Polar.prototype.fromVector2
	 * @desc 将一个二维向量数据转化为自身的极坐标值
	 * @param {Mathx.IVector2} vector2 | 二维向量
	 * @returns {number} this
	 */
	public fromVector2(v: Float32Array): this {
		x = v[0];
		y = v[1];
		this.r = Math.sqrt(x * x + y * y);
		this.a = Math.atan2(y, x);

		return this;
	}

	/**
	 * @public
	 * @method Mathx.Polar.prototype.lengthManhattan
	 * @desc 求自身离原点的曼哈顿距离
	 * @returns {number} 曼哈顿距离
	 */
	public lengthManhattan(): number {
		return (Math.cos(this.a) + Math.sin(this.a)) * this.r;
	}

	/**
	 * @public
	 * @method Mathx.Polar.prototype.set
	 * @desc 设置极坐标值
	 * @param {number} [r=0] 距离
	 * @param {number} [a=0] 弧度
	 * @returns {number} this
	 */
	public set(r = 0, a = 0): this {
		this.r = r;
		this.a = a;

		return this;
	}

	/**
	 * @public
	 * @method Mathx.Polar.prototype.setA
	 * @desc 设置极坐标的弧度
	 * @param {number} [a=0] 角度
	 * @returns {number} this
	 */
	public setA(a = 0): this {
		this.a = a;

		return this;
	}

	/**
	 * @public
	 * @method Mathx.Polar.prototype.setR
	 * @desc 设置极坐标的弧度
	 * @param {number} [r=0] 距离
	 * @returns {number} this
	 */
	public setR(r = 0): this {
		this.r = r;

		return this;
	}

	/**
	 * @public
	 * @method Mathx.Polar.prototype.toJson
	 * @desc 将极坐标转化为纯json对象，纯数据
	 * @param {IPolar} [json] 被修改的json对象，如果不传则会新创建json对象。
	 * @returns {Mathx.IPolar} json
	 */
	public toJson(json: IPolar = { a: 0, r: 0 }): IPolar {
		json.r = this.r;
		json.a = this.a;

		return json;
	}

	/**
	 * @public
	 * @method Mathx.Polar.prototype.toString
	 * @desc 将极坐标转化为字符串
	 * @returns {string} 形式为"(r, a)"的字符串
	 */
	public toString(): string {
		return `(${this.r}, ${this.a})`;
	}

	/**
	 * @public
	 * @method Mathx.Polar.prototype.toVector2Json
	 * @desc 将极坐标转化为二维向量的json形式，纯数据
	 * @param {IVector2} [json] 被修改的json对象，如果不传则会新创建json对象。
	 * @returns {IVector2} json
	 */
	public toVector2Json(vec2: Float32Array): Float32Array {
		vec2[0] = this.x();
		vec2[1] = this.y();

		return vec2;
	}

	/**
	 * @public
	 * @method Mathx.Polar.prototype.x
	 * @desc 获取极坐标对应二维向量的x的值
	 * @returns {number} x
	 */
	public x(): number {
		return Math.cos(this.a) * this.r;
	}

	/**
	 * @public
	 * @method Mathx.Polar.prototype.y
	 * @desc 获取极坐标对应二维向量的y的值
	 * @returns {number} y
	 */
	public y(): number {
		return Math.sin(this.a) * this.r;
	}
}
