import { VECTOR3_TOP, cross as crossVec3, length as lengthVec3, normalize as normalizeVec3, dot as dotVec3, VECTOR3_LEFT } from "../vector/Vector3";
import { EPSILON } from "../constants";
import { dot as dotVec4, lerp as lerpVec4, normalize as normalizeVec4 } from '../vector/Vector4';

let ax: number, ay: number, az: number, aw: number, bx: number, by: number, bz: number, bw: number;
let s = 0, c = 0, rad = 0, dotTmp = 0, omega = 0, scale0 = 0, scale1 = 0;
let tmpVec3 = new Float32Array(3);

export const angleTo = (a: Float32Array, b: Float32Array) => {
    dotTmp = dot(a, b);

    return Math.acos(2 * dotTmp * dotTmp - 1);
}

export const conjugate = (a: Float32Array, out: Float32Array = new Float32Array(4)) => {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = a[3];
    return out;
}

export const create = (x = 0, y = 0, z = 0, w = 1, out = new Float32Array(4)) => {
    out[0] = x;
	out[1] = y;
	out[2] = z;
	out[3] = w;

	return out;
}

export const dot = dotVec4;

export const fromAxisAngle = (axis: Float32Array, rad: number, out: Float32Array = new Float32Array(4)) => {
    rad = rad * 0.5;
    s = Math.sin(rad);
    out[0] = s * axis[0];
    out[1] = s * axis[1];
    out[2] = s * axis[2];
    out[3] = Math.cos(rad);
    return out;
}

export function fromMatrix3(m: Float32Array, out: Float32Array) {
    let fTrace = m[0] + m[4] + m[8];
    let fRoot;

    if (fTrace > 0.0) {
        fRoot = Math.sqrt(fTrace + 1.0); // 2w
        out[3] = 0.5 * fRoot;
        fRoot = 0.5 / fRoot; // 1/(4w)
        out[0] = (m[5] - m[7]) * fRoot;
        out[1] = (m[6] - m[2]) * fRoot;
        out[2] = (m[1] - m[3]) * fRoot;
    } else {
        let i = 0;
        if (m[4] > m[0]) i = 1;
        if (m[8] > m[i * 3 + i]) i = 2;
        let j = (i + 1) % 3;
        let k = (i + 2) % 3;

        fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
        out[i] = 0.5 * fRoot;
        fRoot = 0.5 / fRoot;
        out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
        out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
        out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
    }

    return out;
}

export const identity = (out: Float32Array = new Float32Array(4)): Float32Array => {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
}

export const invert = (a: Float32Array, out: Float32Array = new Float32Array(4)) => {
    ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    dotTmp = ax * ax + ay * ay + az * az + aw * aw;

    if (dotTmp) {
        c = 1.0 / dotTmp;
        out[0] = -ax * c;
        out[1] = -ay * c;
        out[2] = -az * c;
        out[3] = aw * c;
    } else {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
    }

    return out;
}

export const lerp = lerpVec4;

export const multiply = (a: Float32Array, b: Float32Array, out: Float32Array) => {
    ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    bx = b[0],
        by = b[1],
        bz = b[2],
        bw = b[3];

    out[0] = ax * bw + aw * bx + ay * bz - az * by;
    out[1] = ay * bw + aw * by + az * bx - ax * bz;
    out[2] = az * bw + aw * bz + ax * by - ay * bx;
    out[3] = aw * bw - ax * bx - ay * by - az * bz;
    return out;
}

export const random = (out: Float32Array) => {
    ax = Math.random();
    ay = Math.random();
    az = Math.random();

    c = Math.sqrt(1 - ax);
    s = Math.sqrt(ax);

    out[0] = c * Math.sin(2.0 * Math.PI * ay);
    out[1] = c * Math.cos(2.0 * Math.PI * ay);
    out[2] = s * Math.sin(2.0 * Math.PI * az);
    out[3] = s * Math.cos(2.0 * Math.PI * az);
    return out;
}

export const rotationTo = (a: Float32Array, b: Float32Array, out: Float32Array) => {
    dotTmp = dotVec3(a, b);
    if (dotTmp < -0.999999) {
        crossVec3(VECTOR3_LEFT, a, tmpVec3);
        if (lengthVec3(tmpVec3) < 0.000001) {
            crossVec3(VECTOR3_TOP, a, tmpVec3);
        }
        normalizeVec3(tmpVec3, tmpVec3);
        fromAxisAngle(tmpVec3, Math.PI, out);
        return out;
    } else if (dotTmp > 0.999999) {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
        out[3] = 1;
        return out;
    } else {
        crossVec3(tmpVec3, a, b);
        out[0] = tmpVec3[0];
        out[1] = tmpVec3[1];
        out[2] = tmpVec3[2];
        out[3] = 1 + dotTmp;
        return normalizeVec4(out, out);
    }
}

export const rotateX = (a: Float32Array, rad: number, out: Float32Array) => {
    rad *= 0.5;

    ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    bx = Math.sin(rad),
        bw = Math.cos(rad);

    out[0] = ax * bw + aw * bx;
    out[1] = ay * bw + az * bx;
    out[2] = az * bw - ay * bx;
    out[3] = aw * bw - ax * bx;
    return out;
}

export const rotateY = (a: Float32Array, rad: number, out: Float32Array) => {
    rad *= 0.5;

    ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    by = Math.sin(rad),
        bw = Math.cos(rad);

    out[0] = ax * bw - az * by;
    out[1] = ay * bw + aw * by;
    out[2] = az * bw + ax * by;
    out[3] = aw * bw - ay * by;
    return out;
}

export const rotateZ = (a: Float32Array, rad: number, out: Float32Array) => {
    rad *= 0.5;

    ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    bz = Math.sin(rad),
        bw = Math.cos(rad);

    out[0] = ax * bw + ay * bz;
    out[1] = ay * bw - ax * bz;
    out[2] = az * bw + aw * bz;
    out[3] = aw * bw - az * bz;
    return out;
}

export const slerp = (a: Float32Array, b: Float32Array, t: number, out: Float32Array) => {
    ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    bx = b[0],
        by = b[1],
        bz = b[2],
        bw = b[3];

    c = ax * bx + ay * by + az * bz + aw * bw;

    if (c < 0.0) {
        c = -c;
        bx = -bx;
        by = -by;
        bz = -bz;
        bw = -bw;
    }
    if (1.0 - c > EPSILON) {
        omega = Math.acos(c);
        s = Math.sin(omega);
        scale0 = Math.sin((1.0 - t) * omega) / s;
        scale1 = Math.sin(t * omega) / s;
    } else {
        scale0 = 1.0 - t;
        scale1 = t;
    }

    out[0] = scale0 * ax + scale1 * bx;
    out[1] = scale0 * ay + scale1 * by;
    out[2] = scale0 * az + scale1 * bz;
    out[3] = scale0 * aw + scale1 * bw;

    return out;
}

export const toAxisAngle = (q: Float32Array, outAxis: Float32Array = new Float32Array(3)): number => {
    rad = Math.acos(q[3]) * 2.0;
    s = Math.sin(rad / 2.0);
    if (s > EPSILON) {
        outAxis[0] = q[0] / s;
        outAxis[1] = q[1] / s;
        outAxis[2] = q[2] / s;
    } else {
        outAxis[0] = 1;
        outAxis[1] = 0;
        outAxis[2] = 0;
    }
    return rad;
}

export const toString = (a: Float32Array) => {
    return `quat("${a[0]}, ${a[1]}, ${a[2]}, ${a[3]})`;
}
