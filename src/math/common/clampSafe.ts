/**
 * @function clampSafe
 * @desc 与clamp函数功能一样，将目标值限定在指定区间内。但此函数是安全的，不要求第二个参数必须小于第三个参数
 * @see clamp
 * @param {number} val 目标值
 * @param {number} a 区间中一个最值
 * @param {number} b 区间中另一个最值
 * @returns {number} 限制之后的值
 * @example Mathx.clamp(1, 0, 2); // 1;
 * Mathx.clamp(1, 2, 0); // 1;
 * Mathx.clamp(-1, 0, 2); // 0;
 * Mathx.clamp(-1, 2, 0); // 0;
 * Mathx.clamp(3, 0, 2); // 2;
 * Mathx.clamp(3, 2, 0); // 2;
 */
export default (val: number, a: number, b: number): number => {
	if (a > b) {
		return Math.max(b, Math.min(a, val));
	} else if (b > a) {
		return Math.max(a, Math.min(b, val));
	}

	return a;
};
