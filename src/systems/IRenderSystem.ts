export default interface IRenderSystem {
	clear(): this;
	render(): this;
	end(): this;
}
