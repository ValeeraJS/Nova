// import clampCommon from "../common/clamp";
// import clampSafeCommon from "../common/clampSafe";
import closeToCommon from "../common/closeTo";

let ax: number, ay: number, az: number, aw: number, bx: number, by: number, bz: number, len: number;
let ix: number, iy: number, iz: number, iw: number;
let A: number, B: number, C: number, D: number, E: number, F: number, G: number, H: number, I: number, J: number;


export const add = (a: Float32Array, b: Float32Array, out: Float32Array = new Float32Array(4)) => {
	out[0] = a[0] + b[0];
	out[1] = a[1] + b[1];
	out[2] = a[2] + b[2];
	out[3] = a[3] + b[3];
	return out;
}

export function ceil(a: Float32Array, out: Float32Array = new Float32Array(4)) {
	out[0] = Math.ceil(a[0]);
	out[1] = Math.ceil(a[1]);
	out[2] = Math.ceil(a[2]);
	out[3] = Math.ceil(a[3]);
	return out;
}

export const closeTo = (a: Float32Array, b: Float32Array) => {
	return closeToCommon(a[0], b[0]) && closeToCommon(a[1], b[1]) && closeToCommon(a[2], b[2]) && closeToCommon(a[3], b[3]);
}

export const create = (x = 0, y = 0, z = 0, w = 0, out = new Float32Array(4)) => {
	out[0] = x;
	out[1] = y;
	out[2] = z;
	out[3] = w;

	return out;
}

export const cross = (u: Float32Array, v: Float32Array, w: Float32Array, out: Float32Array = new Float32Array(4)) => {
	A = v[0] * w[1] - v[1] * w[0],
		B = v[0] * w[2] - v[2] * w[0],
		C = v[0] * w[3] - v[3] * w[0],
		D = v[1] * w[2] - v[2] * w[1],
		E = v[1] * w[3] - v[3] * w[1],
		F = v[2] * w[3] - v[3] * w[2];
	G = u[0];
	H = u[1];
	I = u[2];
	J = u[3];

	out[0] = H * F - I * E + J * D;
	out[1] = -(G * F) + I * C - J * B;
	out[2] = G * E - H * C + J * A;
	out[3] = -(G * D) + H * B - I * A;

	return out;
}

export const distanceTo = (a: Float32Array, b: Float32Array) => {
	ax = b[0] - a[0];
	ay = b[1] - a[1];
	az = b[2] - a[2];
	aw = b[3] - a[3];
	return Math.hypot(ax, ay, az, aw);
}

export const distanceToSquared = (a: Float32Array, b: Float32Array) => {
	ax = b[0] - a[0];
	ay = b[1] - a[1];
	az = b[2] - a[2];
	aw = b[3] - a[3];
	return ax * ax + ay * ay + az * az + aw * aw;
}

export const divide = (a: Float32Array, b: Float32Array, out: Float32Array = new Float32Array(4)) => {
	out[0] = a[0] / b[0];
	out[1] = a[1] / b[1];
	out[2] = a[2] / b[2];
	out[3] = a[3] / b[3];
	return out;
}

export const dot = (a: Float32Array, b: Float32Array) => {
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}

export const equals = (a: Float32Array, b: Float32Array) => {
	return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}

export function floor(a: Float32Array, out: Float32Array) {
	out[0] = Math.floor(a[0]);
	out[1] = Math.floor(a[1]);
	out[2] = Math.floor(a[2]);
	out[3] = Math.floor(a[3]);
	return out;
}

export const from = (a: Float32Array, out: Float32Array = new Float32Array(4)): Float32Array => {
	out[0] = a[0];
	out[1] = a[1];
	out[2] = a[2];
	out[3] = a[3];

	return out;
}

export const fromValues = (x: number, y: number, z: number, w: number, out: Float32Array = new Float32Array(4)): Float32Array => {
	out[0] = x;
	out[1] = y;
	out[2] = z;
	out[3] = w;

	return out;
}

export const inverse = (a: Float32Array, out: Float32Array = new Float32Array(4)) => {
	out[0] = 1.0 / a[0];
	out[1] = 1.0 / a[1];
	out[2] = 1.0 / a[2];
	out[3] = 1.0 / a[3];
	return out;
}

export const length = (a: Float32Array) => {
	return Math.hypot(a[0], a[1], a[2], a[3]);
}

export const lengthSquared = (a: Float32Array) => {
	ax = a[0];
	ay = a[1];
	az = a[2];
	aw = a[3];
	return ax * ax + ay * ay + az * az + aw * aw;
}

export const lerp = (a: Float32Array, b: Float32Array, t: number, out: Float32Array = new Float32Array(4)) => {
	ax = a[0];
	ay = a[1];
	az = a[2];
	aw = a[3];
	out[0] = ax + t * (b[0] - ax);
	out[1] = ay + t * (b[1] - ay);
	out[2] = az + t * (b[2] - az);
	out[3] = aw + t * (b[3] - aw);
	return out;
}

export const max = (a: Float32Array, b: Float32Array, out: Float32Array = new Float32Array(4)) => {
	out[0] = Math.max(a[0], b[0]);
	out[1] = Math.max(a[1], b[1]);
	out[2] = Math.max(a[2], b[2]);
	out[3] = Math.max(a[3], b[3]);
	return out;
}

export const min = (a: Float32Array, b: Float32Array, out: Float32Array = new Float32Array(4)) => {
	out[0] = Math.min(a[0], b[0]);
	out[1] = Math.min(a[1], b[1]);
	out[2] = Math.min(a[2], b[2]);
	out[3] = Math.min(a[3], b[3]);
	return out;
}

export const minus = (a: Float32Array, b: Float32Array, out: Float32Array = new Float32Array(4)) => {
	out[0] = a[0] - b[0];
	out[1] = a[1] - b[1];
	out[2] = a[2] - b[2];
	out[3] = a[3] - b[3];
	return out;
}

export const multiply = (a: Float32Array, b: Float32Array, out: Float32Array = new Float32Array(4)) => {
	out[0] = a[0] * b[0];
	out[1] = a[1] * b[1];
	out[2] = a[2] * b[2];
	out[3] = a[3] * b[3];
	return out;
}

export const multiplyScalar = (a: Float32Array, b: number, out: Float32Array = new Float32Array(4)) => {
	out[0] = a[0] * b;
	out[1] = a[1] * b;
	out[2] = a[2] * b;
	out[3] = a[3] * b;
	return out;
}

export const negate = (a: Float32Array, out: Float32Array = new Float32Array(4)) => {
	out[0] = -a[0];
	out[1] = -a[1];
	out[2] = -a[2];
	out[3] = -a[3];
	return out;
}

export const normalize = (a: Float32Array, out: Float32Array = new Float32Array(4)) => {
	ax = a[0];
	ay = a[1];
	az = a[2];
	aw = a[3];
	len = ax * ax + ay * ay + az * az + aw * aw;
	if (len > 0) {
		len = 1 / Math.sqrt(len);
	}
	out[0] = ax * len;
	out[1] = ay * len;
	out[2] = az * len;
	out[3] = aw * len;
	return out;
}


export const round = (a: Float32Array, out: Float32Array = new Float32Array(4)) => {
	out[0] = Math.round(a[0]);
	out[1] = Math.round(a[1]);
	out[2] = Math.round(a[2]);
	out[3] = Math.round(a[3]);
	return out;
}

export function toString(a: Float32Array) {
	return `vec4(${a[0]}, ${a[1]}, ${a[2]}, ${a[3]})`;
}

export function transformMatrix4(a: Float32Array, m: Float32Array, out: Float32Array = new Float32Array(4)) {
	ax = a[0],
		ay = a[1],
		az = a[2],
		aw = a[3];
	out[0] = m[0] * ax + m[4] * ay + m[8] * az + m[12] * aw;
	out[1] = m[1] * ax + m[5] * ay + m[9] * az + m[13] * aw;
	out[2] = m[2] * ax + m[6] * ay + m[10] * az + m[14] * aw;
	out[3] = m[3] * ax + m[7] * ay + m[11] * az + m[15] * aw;
	return out;
}

export const transformQuat = (a: Float32Array, q: Float32Array, out: Float32Array = new Float32Array(4)) => {
	bx = a[0],
		by = a[1],
		bz = a[2];
	ax = q[0],
		ay = q[1],
		az = q[2],
		aw = q[3];

	ix = aw * bx + ay * bz - az * by;
	iy = aw * by + az * bx - ax * bz;
	iz = aw * bz + ax * by - ay * bx;
	iw = -ax * bx - ay * by - az * bz;

	out[0] = ix * aw + iw * -ax + iy * -az - iz * -ay;
	out[1] = iy * aw + iw * -ay + iz * -ax - ix * -az;
	out[2] = iz * aw + iw * -az + ix * -ay - iy * -ax;
	out[3] = a[3];

	return out;
}
