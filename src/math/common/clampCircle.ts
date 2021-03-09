import floorToZero from "./floorToZero";

let circle: number, v: number;

/**
 * @function clampCircle
 * @desc 将目标值限定在指定周期区间内。假定min小于等于max才能得到正确的结果。
 * @param {number} val 目标值
 * @param {number} min 最小值，必须小于等于max
 * @param {number} max 最大值，必须大于等于min
 * @returns {number} 限制之后的值
 * @example Mathx.clampCircle(3 * Math.PI, 0, 2 * Math.PI); // Math.PI;
 * Mathx.clampCircle(2 * Math.PI, -Math.PI, Math.PI); // 0;
 */
export default (val: number, min: number, max: number): number => {
	circle = max - min;
	v = floorToZero(min / circle) * circle + (val % circle);
	if (v < min) {
		return v + circle;
	} else if (v > max) {
		return v - circle;
	}
	return v;
};
