let len = 0, sum = 0;

/**
 * @function sumArray
 * @desc 求数组的和
 * @see sum
 * @param {number[]} arr
 * @returns {number} 和
 * @example Mathx.sumArray([1, 2, 3]); // 6;
 */
export default (arr: number[]): number => {
	sum = 0;
	len = arr.length;
	for (let i = 0; i < len; i++) {
		sum += arr[i];
	}

	return sum;
};
