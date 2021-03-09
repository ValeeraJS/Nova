import closeToCommon from "../common/closeTo";

let a00 = 0, a01 = 0, a10 = 0, a11 = 0;
let b00 = 0, b01 = 0, b10 = 0, b11 = 0, det = 0;
let x = 0, y = 0;

const UNIT_MATRIX2_DATA = [
    1, 0,
    0, 1,
];

export const UNIT_MATRIX2 = new Float32Array(UNIT_MATRIX2_DATA);

export const add = (a: Float32Array, b: Float32Array, out: Float32Array) => {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];

    return out;
}

export const adjoint = (a: Float32Array, out: Float32Array): Float32Array => {
    a00 = a[0];
    out[0] = a[3];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = a00;

    return out;
}

export const closeTo = (a: Float32Array, b: Float32Array): boolean => {
    a00 = a[0];
    a10 = a[1];
    a01 = a[2];
    a11 = a[3];
    b00 = b[0];
    b10 = b[1];
    b01 = b[2];
    b11 = b[3];
    return closeToCommon(a00, b00) && closeToCommon(a01, b01) && closeToCommon(a10, b10) && closeToCommon(a11, b11);
}

export const create = (a = UNIT_MATRIX2_DATA): Float32Array => {
    return new Float32Array(a);
};

export const determinant = (a: Float32Array): number => {
    return a[0] * a[3] - a[1] * a[2];
}

export const equals = (a: Float32Array, b: Float32Array) => {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}

export const frobNorm = (a: Float32Array): number => {
    return Math.hypot(a[0], a[1], a[2], a[3]);
}

export const from = (a: Float32Array, out: Float32Array = new Float32Array(4)): Float32Array => {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];

    return out;
};

export const fromRotation = (rad: number, out: Float32Array = new Float32Array(4)): Float32Array => {
    y = Math.sin(rad);
    x = Math.cos(rad);
    out[0] = x;
    out[1] = y;
    out[2] = -y;
    out[3] = x;

    return out;
}

export const fromScaling = (v: Float32Array, out: Float32Array = new Float32Array(4)) => {
    out[0] = v[0];
    out[1] = 0;
    out[2] = 0;
    out[3] = v[1];

    return out;
}

export const identity = (out: Float32Array = new Float32Array(4)): Float32Array => {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;

    return out;
}

export function invert(a: Float32Array, out: Float32Array = new Float32Array(4)): Float32Array | null {
    a00 = a[0];
    a10 = a[1];
    a01 = a[2];
    a11 = a[3];

    det = determinant(a);

    if (!det) {
        return null;
    }

    det = 1.0 / det;

    out[0] = a11 * det;
    out[1] = -a10 * det;
    out[2] = -a01 * det;
    out[3] = a00 * det;

    return out;
}

export function minus(a: Float32Array, b: Float32Array, out: Float32Array = new Float32Array(4)): Float32Array {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];

    return out;
}

export const multiply = (a: Float32Array, b: Float32Array, out: Float32Array = new Float32Array(4)): Float32Array => {
    a00 = a[0];
    a10 = a[1];
    a01 = a[2];
    a11 = a[3];
    b00 = b[0];
    b10 = b[1];
    b01 = b[2];
    b11 = b[3];
    out[0] = a00 * b00 + a01 * b10;
    out[1] = a10 * b00 + a11 * b10;
    out[2] = a00 * b01 + a01 * b11;
    out[3] = a10 * b01 + a11 * b11;

    return out;
}

export const multiplyScalar = (a: Float32Array, b: number, out: Float32Array = new Float32Array(4)): Float32Array => {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;

    return out;
}

export const rotate = (a: Float32Array, rad: number, out: Float32Array = new Float32Array(4)): Float32Array => {
    a00 = a[0];
    a10 = a[1];
    a01 = a[2];
    a11 = a[3];
    y = Math.sin(rad);
    x = Math.cos(rad);
    out[0] = a00 * x + a01 * y;
    out[1] = a10 * x + a11 * y;
    out[2] = a00 * -y + a01 * x;
    out[3] = a10 * -y + a11 * x;

    return out;
}

export const scale = (a: Float32Array, v: Float32Array, out: Float32Array = new Float32Array(4)) => {
    a00 = a[0];
    a10 = a[1];
    a01 = a[2];
    a11 = a[3];
    x = v[0];
    y = v[1];
    out[0] = a00 * x;
    out[1] = a10 * x;
    out[2] = a01 * y;
    out[3] = a11 * y;

    return out;
}

export function toString(a: Float32Array) {
    return `mat2(${a[0]}, ${a[1]}, ${a[2]}, ${a[3]})`;
}

export const transpose = (a: Float32Array, out: Float32Array = new Float32Array(4)): Float32Array => {
    if (out === a) {
        a01 = a[1];
        out[1] = a[2];
        out[2] = a01;
    } else {
        out[0] = a[0];
        out[1] = a[2];
        out[2] = a[1];
        out[3] = a[3];
    }

    return out;
}
