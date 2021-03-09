export default (value: number): boolean => {
	return (value & (value - 1)) === 0 && value !== 0;
}
