export default (min: number = 0, max: number = 1): number => {
	return min + Math.random() * (max - min);
}
