import clampCommon from "../common/clamp";
import clampSafeCommon from "../common/clampSafe";
import closeToCommon from "../common/closeTo";

let ax: number, ay: number, az: number, bx: number, by: number, bz: number;
let ag: number, s: number;

export const add = (a: Float32Array, b: Float32Array, out: Float32Array = new Float32Array(3)): Float32Array => {
	out[0] = a[0] + b[0];
	out[1] = a[1] + b[1];
	out[2] = a[2] + b[2];

	return out;
}

export const addScalar = (a: Float32Array, b: number, out: Float32Array = new Float32Array(3)): Float32Array => {
	out[0] = a[0] + b;
	out[1] = a[1] + b;
	out[2] = a[2] + b;

	return out;
}

export const angle = (a: Float32Array, b: Float32Array): number => {
	ax = a[0],
		ay = a[1],
		az = a[2],
		bx = b[0],
		by = b[1],
		bz = b[2];
	let mag1 = Math.sqrt(ax * ax + ay * ay + az * az),
		mag2 = Math.sqrt(bx * bx + by * by + bz * bz),
		mag = mag1 * mag2,
		cosine = mag && dot(a, b) / mag;
	return Math.acos(clampCommon(cosine, -1, 1));
}

export const clamp = (a: Float32Array, min: Float32Array, max: Float32Array, out: Float32Array = new Float32Array(3)): Float32Array => {
	out[0] = clampCommon(a[0], min[0], max[0]);
	out[1] = clampCommon(a[1], min[1], max[1]);
	out[2] = clampCommon(a[2], min[2], max[2]);

	return out;
}

export const clampSafe = (a: Float32Array, min: Float32Array, max: Float32Array, out: Float32Array = new Float32Array(3)): Float32Array => {
	out[0] = clampSafeCommon(a[0], min[0], max[0]);
	out[1] = clampSafeCommon(a[1], min[1], max[1]);
	out[1] = clampSafeCommon(a[2], min[2], max[2]);

	return out;
};

export const clampScalar = (a: Float32Array, min: number, max: number, out: Float32Array = new Float32Array(3)) => {
	out[0] = clampCommon(a[0], min, max);
	out[1] = clampCommon(a[1], min, max);
	out[2] = clampCommon(a[2], min, max);

	return out;
}

export const clone = (a: Float32Array, out: Float32Array = new Float32Array(3)): Float32Array => {
	out[0] = a[0];
	out[1] = a[1];
	out[2] = a[2];

	return out;
}

export const closeTo = (a: Float32Array, b: Float32Array): boolean => {
	return closeToCommon(a[0], b[0]) && closeToCommon(a[1], b[1]) && closeToCommon(a[2], b[2]);
}

export const create = (x: number, y: number= 0, z: number, out: Float32Array = new Float32Array(3)): Float32Array => {
	out[0] = x;
	out[1] = y;
	out[2] = z;

	return out;
}

export const cross = (a: Float32Array, b: Float32Array, out: Float32Array = new Float32Array(3)): Float32Array => {
	ax = a[0], ay = a[1], az = a[2];
	bx = b[0], by = b[1], bz = b[2];

	out[0] = ay * bz - az * by;
	out[1] = az * bx - ax * bz;
	out[2] = ax * by - ay * bx;

	return out;
}

export const distanceTo = (a: Float32Array, b: Float32Array): number => {
	ax = b[0] - a[0];
	ay = b[1] - a[1];
	az = b[2] - a[2];
	return Math.hypot(ax, ay, az);
};

export const distanceToManhattan = (a: Float32Array, b: Float32Array): number => {
	return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
};

export const distanceToSquared = (a: Float32Array, b: Float32Array): number => {
	ax = a[0] - b[0];
	ay = a[1] - b[1];
	az = a[2] - b[2];

	return ax * ax + ay * ay + az * az;
};

export const divide = (a: Float32Array, b: Float32Array, out: Float32Array = new Float32Array(3)): Float32Array => {
	out[0] = a[0] / b[0];
	out[1] = a[1] / b[1];
	out[2] = a[2] / b[2];

	return out;
}

export const divideScalar = (a: Float32Array, b: number, out: Float32Array = new Float32Array(3)): Float32Array => {
	out[0] = a[0] / b;
	out[1] = a[1] / b;
	out[2] = a[2] / b;

	return out;
}

export const dot = (a: Float32Array, b: Float32Array): number => {
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export const equals = (a: Float32Array, b: Float32Array): boolean => {
	return ((a[0] === b[0]) && (a[1] === b[1]) && (a[2] === b[2]));
}

export const from = (a: Float32Array, out: Float32Array = new Float32Array(3)): Float32Array => {
	out[0] = a[0];
	out[1] = a[1];
	out[2] = a[2];

	return out;
}

export const fromArray = (a: ArrayLike<number>, offset: number = 0, out: Float32Array = new Float32Array(3)): Float32Array => {
	out[0] = a[offset];
	out[1] = a[offset + 1];
	out[2] = a[offset + 2];

	return out;
}

export const fromScalar = (num: number, out: Float32Array = new Float32Array(3)): Float32Array => {
	out[0] = out[1] = out[2] = num;

	return out;
}

export const fromValues = (x: number, y: number, z: number, out: Float32Array = new Float32Array(3)): Float32Array => {
	out[0] = x;
	out[1] = y;
	out[2] = z;

	return out;
}

export const hermite = (a: Float32Array, b: Float32Array, c: Float32Array, d: Float32Array, t: number, out: Float32Array = new Float32Array(3)) => {
	ag = t * t;
	let factor1 = ag * (2 * t - 3) + 1;
	let factor2 = ag * (t - 2) + t;
	let factor3 = ag * (t - 1);
	let factor4 = ag * (3 - 2 * t);

	out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
	out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
	out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;

	return out;
}

export const inverse = (a: Float32Array, out: Float32Array = new Float32Array(3)) => {
	out[0] = 1.0 / a[0];
	out[1] = 1.0 / a[1];
	out[2] = 1.0 / a[2];
	return out;
}

export const length = (a: Float32Array): number => {
	return Math.sqrt(lengthSquared(a));
}

export const lengthManhattan = (a: Float32Array): number => {
	return Math.abs(a[0]) + Math.abs(a[1]) + Math.abs(a[2]);
}

export const lengthSquared = (a: Float32Array): number => {
	return a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
}

export const lerp = (a: Float32Array, b: Float32Array, alpha: number, out: Float32Array = new Float32Array(3)): Float32Array => {
	out[0] += (b[0] - a[0]) * alpha;
	out[1] += (b[1] - a[1]) * alpha;
	out[2] += (b[2] - a[2]) * alpha;

	return out;
}

export const max = (a: Float32Array, b: Float32Array, out: Float32Array = new Float32Array(3)): Float32Array => {
	out[0] = Math.max(a[0], b[0]);
	out[1] = Math.max(a[1], b[1]);
	out[2] = Math.max(a[2], b[2]);

	return out;
}

export const min = (a: Float32Array, b: Float32Array, out: Float32Array = new Float32Array(3)): Float32Array => {
	out[0] = Math.min(a[0], b[0]);
	out[1] = Math.min(a[1], b[1]);
	out[2] = Math.min(a[2], b[2]);

	return out;
}

export const minus = (a: Float32Array, b: Float32Array, out: Float32Array = new Float32Array(3)) => {
	out[0] = a[0] - b[0];
	out[1] = a[1] - b[1];
	out[2] = a[2] - b[2];

	return out;
}

export const minusScalar = (a: Float32Array, b: number, out: Float32Array = new Float32Array(3)) => {
	out[0] = a[0] - b;
	out[1] = a[1] - b;
	out[2] = a[2] - b;

	return out;
}

export const multiply = (a: Float32Array, b: Float32Array, out: Float32Array = new Float32Array(3)) => {
	out[0] = a[0] * b[0];
	out[1] = a[1] * b[1];
	out[2] = a[2] * b[2];

	return out;
}

export const multiplyScalar = (a: Float32Array, scalar: number, out: Float32Array = new Float32Array(3)): Float32Array => {
	out[0] = a[0] * scalar;
	out[1] = a[1] * scalar;
	out[2] = a[2] * scalar;

	return out;
}

export const negate = (a: Float32Array, out: Float32Array = new Float32Array(3)) => {
	out[0] = -a[0];
	out[1] = -a[1];
	out[2] = -a[2];
	return out;
}

export const normalize = (a: Float32Array, out: Float32Array = new Float32Array(3)): Float32Array => {
	return divideScalar(a, length(a) || 1, out);
}

export const rotateX = (a: Float32Array, b: Float32Array, rad: number, out: Float32Array) => {
	ax = a[0] - b[0];
	ay = a[1] - b[1];
	az = a[2] - b[2];

	bx = ax;
	by = ay * Math.cos(rad) - az * Math.sin(rad);
	bz = ay * Math.sin(rad) + az * Math.cos(rad);

	out[0] = bx + b[0];
	out[1] = by + b[1];
	out[2] = bz + b[2];

	return out;
}

export const rotateY = (a: Float32Array, b: Float32Array, rad: number, out: Float32Array) => {
	ax = a[0] - b[0];
	ay = a[1] - b[1];
	az = a[2] - b[2];

	bx = az * Math.sin(rad) + ax * Math.cos(rad);
	by = ay;
	bz = az * Math.cos(rad) - ax * Math.sin(rad);

	out[0] = bx + b[0];
	out[1] = by + b[1];
	out[2] = bz + b[2];

	return out;
}

export const rotateZ = (a: Float32Array, b: Float32Array, rad: number, out: Float32Array) => {
	ax = a[0] - b[0];
	ay = a[1] - b[1];
	az = a[2] - b[2];

	bx = ax * Math.cos(rad) - ay * Math.sin(rad);
	by = ax * Math.sin(rad) + ay * Math.cos(rad);
	bz = az;

	out[0] = bx + b[0];
	out[1] = by + b[1];
	out[2] = bz + b[2];

	return out;
}

export const round = (a: Float32Array, out: Float32Array = new Float32Array(3)): Float32Array => {
	out[0] = Math.round(a[0]);
	out[1] = Math.round(a[1]);
	out[2] = Math.round(a[2]);

	return out;
}

export const set = (x = 0, y = 0, z = 0, out: Float32Array = new Float32Array(3)): Float32Array => {
	out[0] = x;
	out[1] = y;
	out[2] = z;

	return out;
}

export const setLength = (a: Float32Array, len: number, out: Float32Array = new Float32Array(3)): Float32Array => {
	return multiplyScalar(normalize(a, out), len, out);
}

export const slerp = (a: Float32Array, b: Float32Array, t: number, out: Float32Array = new Float32Array(3)): Float32Array => {
	ag = Math.acos(Math.min(Math.max(dot(a, b), -1), 1));
	s = Math.sin(ag);

	ax = Math.sin((1 - t) * ag) / s;
	bx = Math.sin(t * ag) / s;
	out[0] = ax * a[0] + bx * b[0];
	out[1] = ax * a[1] + bx * b[1];
	out[2] = ax * a[2] + bx * b[2];

	return out;
}

export const toString = (a: Float32Array) => {
	return `vec3(${a[0]}, ${a[1]}, ${a[2]})`;
}

export const transformMatrix3 = (a: Float32Array, m: Float32Array, out: Float32Array) => {
	ax = a[0],
		ay = a[1],
		az = a[2];
	out[0] = ax * m[0] + ay * m[3] + az * m[6];
	out[1] = ax * m[1] + ay * m[4] + az * m[7];
	out[2] = ax * m[2] + ay * m[5] + az * m[8];
	return out;
}

export function transformMatrix4(a: Float32Array, m: Float32Array, out: Float32Array = new Float32Array(3)) {
	ax = a[0],
		ay = a[1],
		az = a[2];
	ag = m[3] * ax + m[7] * ay + m[11] * az + m[15];
	ag = ag || 1.0;
	out[0] = (m[0] * ax + m[4] * ay + m[8] * az + m[12]) / ag;
	out[1] = (m[1] * ax + m[5] * ay + m[9] * az + m[13]) / ag;
	out[2] = (m[2] * ax + m[6] * ay + m[10] * az + m[14]) / ag;
	return out;
}

export const transformQuat = (a: Float32Array, q: Float32Array, out: Float32Array = new Float32Array(3)) => {
	let qx = q[0],
		qy = q[1],
		qz = q[2],
		qw = q[3];
	let x = a[0],
		y = a[1],
		z = a[2];
	// var qvec = [qx, qy, qz];
	// var uv = vec3.cross([], qvec, a);
	let uvx = qy * z - qz * y,
		uvy = qz * x - qx * z,
		uvz = qx * y - qy * x;
	// var uuv = vec3.cross([], qvec, uv);
	let uuvx = qy * uvz - qz * uvy,
		uuvy = qz * uvx - qx * uvz,
		uuvz = qx * uvy - qy * uvx;
	// vec3.scale(uv, uv, 2 * w);
	let w2 = qw * 2;
	uvx *= w2;
	uvy *= w2;
	uvz *= w2;
	// vec3.scale(uuv, uuv, 2);
	uuvx *= 2;
	uuvy *= 2;
	uuvz *= 2;
	// return vec3.add(out, a, vec3.add(out, uv, uuv));
	out[0] = x + uvx + uuvx;
	out[1] = y + uvy + uuvy;
	out[2] = z + uvz + uuvz;
	return out;
}

export const VECTOR3_ZERO = new Float32Array([0, 0, 0]);
export const VECTOR3_ONE = new Float32Array([1, 1, 1]);
export const VECTOR3_TOP = new Float32Array([0, 1, 0]);
export const VECTOR3_BOTTOM = new Float32Array([0, -1, 0]);
export const VECTOR3_LEFT = new Float32Array([-1, 0, 0]);
export const VECTOR3_RIGHT = new Float32Array([1, 0, 0]);
export const VECTOR3_FRONT = new Float32Array([0, 0, -1]);
export const VECTOR3_BACK = new Float32Array([0, 0, 1]);

