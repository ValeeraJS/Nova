export const DEFAULT_BLEND_STATE: GPUBlendState = {
	color: {
		srcFactor: 'src-alpha',
		dstFactor: 'one-minus-src-alpha',
		operation: 'add',
	},
	alpha: {
		srcFactor: 'zero',
		dstFactor: 'one',
		operation: 'add',
	}
}
