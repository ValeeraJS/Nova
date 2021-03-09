import clampCommon from "../common/clamp";
import clampSafeCommon from "../common/clampSafe";
import closeToCommon from "../common/closeTo";
import floorToZeroCommon from "../common/floorToZero";
import { EPSILON, DEG_360_RAD } from "../constants";
import { IPolar } from "../polar";

let x = 0, y = 0, c = 0, s = 0;

export const add = (a: Float32Array, b: Float32Array, out: Float32Array = new Float32Array(2)) => {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];

    return out;
};

export const addScalar = (a: Float32Array, b: number, out: Float32Array = new Float32Array(2)) => {
    out[0] = a[0] + b;
    out[1] = a[1] + b;

    return out;
};

export const angle = (a: Float32Array): number => {
    return Math.atan2(a[1], a[0]);
};

export const ceil = (a: Float32Array, out: Float32Array = new Float32Array(2)): Float32Array => {
    out[0] = Math.ceil(a[0]);
    out[1] = Math.ceil(a[1]);

    return out;
};

export const clamp = (a: Float32Array, min: Float32Array, max: Float32Array, out: Float32Array = new Float32Array(2)): Float32Array => {
    out[0] = clampCommon(a[0], min[0], max[0]);
    out[1] = clampCommon(a[1], min[1], max[1]);

    return out;
};

export const clampSafe = (a: Float32Array, min: Float32Array, max: Float32Array, out: Float32Array = new Float32Array(2)): Float32Array => {
    out[0] = clampSafeCommon(a[0], min[0], max[0]);
    out[1] = clampSafeCommon(a[1], min[1], max[1]);

    return out;
};

export const clampLength = (a: Float32Array, min: Float32Array, max: Float32Array, out: Float32Array = new Float32Array(2)): Float32Array => {
    out[0] = clampSafeCommon(a[0], min[0], max[0]);
    out[1] = clampSafeCommon(a[1], min[1], max[1]);

    return out;
};

export const clampScalar = (a: Float32Array, min: number, max: number, out: Float32Array = new Float32Array(2)): Float32Array => {
    out[0] = clampCommon(a[0], min, max);
    out[1] = clampCommon(a[1], min, max);

    return out;
};

export const closeTo = (a: Float32Array, b: Float32Array, epsilon = EPSILON): boolean => {
    return distanceTo(a, b) <= epsilon;
};

export const closeToRect = (a: Float32Array, b: Float32Array, epsilon = EPSILON): boolean => {
    return closeToCommon(a[0], b[0], epsilon) && closeToCommon(a[1], b[1], epsilon);
};

export const closeToManhattan = (a: Float32Array, b: Float32Array, epsilon = EPSILON): boolean => {
    return distanceToManhattan(a, b) <= epsilon;
};

export const clone = (a: Float32Array, out: Float32Array = new Float32Array(2)): Float32Array => {
    out[0] = a[0];
    out[1] = a[1];

    return out;
};

export const cross = (a: Float32Array, b: Float32Array): number => {
    return a[0] * b[1] - a[1] * b[0];
};

export const create = (x: number, y: number, out: Float32Array = new Float32Array(2)): Float32Array => {
    out[0] = x;
    out[1] = y;

    return out;
}

export const distanceTo = (a: Float32Array, b: Float32Array): number => {
    x = b[0] - a[0];
    y = b[1] - a[1];
    return Math.hypot(x, y);
};

export const distanceToManhattan = (a: Float32Array, b: Float32Array): number => {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
};

export const distanceToSquared = (a: Float32Array, b: Float32Array): number => {
    x = a[0] - b[0];
    y = a[1] - b[1];

    return x * x + y * y;
};

export const divide = (a: Float32Array, b: Float32Array, out: Float32Array = new Float32Array(2)): Float32Array => {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];

    return out;
};

export const divideScalar = (a: Float32Array, scalar: number, out: Float32Array = new Float32Array(2)): Float32Array => {
    return multiplyScalar(a, 1 / scalar, out);
};

export const dot = (a: Float32Array, b: Float32Array): number => {
    return a[0] * b[0] + a[1] * b[1];
}

export const equals = (a: Float32Array, b: Float32Array): boolean => {
    return a[0] === b[0] && a[1] === b[1];
}

export const floor = (a: Float32Array, out: Float32Array = new Float32Array(2)): Float32Array => {
    out[0] = Math.floor(a[0]);
    out[1] = Math.floor(a[1]);

    return out;
}

export const floorToZero = (a: Float32Array, out: Float32Array = new Float32Array(2)): Float32Array => {
    out[0] = floorToZeroCommon(a[0]);
    out[1] = floorToZeroCommon(a[1]);

    return out;
}

export const from = (a: Float32Array, out: Float32Array = new Float32Array(2)): Float32Array => {
    out[0] = a[0];
    out[1] = a[1];

    return out;
};

export const fromArray = (arr: number[], index = 0, out: Float32Array = new Float32Array(2)): Float32Array => {
    out[0] = arr[index];
    out[1] = arr[index + 1];

    return out;
};

export const fromJson = (j: { x: number; y: number }, out: Float32Array = new Float32Array(2)) => {
    out[0] = j.x;
    out[1] = j.y;

    return out;
}

export const fromPolar = (p: IPolar, out: Float32Array = new Float32Array(2)): Float32Array => {
    out[0] = Math.cos(p.a) * p.r;
    out[1] = Math.sin(p.a) * p.r;

    return out;
};

export const fromScalar = (value = 0, out: Float32Array = new Float32Array(2)): Float32Array => {
    out[0] = out[1] = value;

    return out;
};

export const inverse = (a: Float32Array, out: Float32Array = new Float32Array(2)): Float32Array => {
    out[0] = 1 / a[0] || 0;
    out[1] = 1 / a[1] || 0;

    return out;
};

export const length = (a: Float32Array): number => {
    return Math.sqrt(a[0] * a[0] + a[1] * a[1]);
};

export const lengthManhattan = (a: Float32Array): number => {
    return Math.abs(a[0]) + Math.abs(a[1]);
};

export const lengthSquared = (a: Float32Array): number => {
    return a[0] * a[0] + a[1] * a[1];
};

export const lerp = (a: Float32Array, b: Float32Array, alpha: number, out: Float32Array = new Float32Array(2)): Float32Array => {
    out[0] = (b[0] - a[0]) * alpha + a[0];
    out[1] = (b[1] - a[1]) * alpha + a[1];

    return out;
};

export const max = (a: Float32Array, b: Float32Array, out: Float32Array = new Float32Array(2)): Float32Array => {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);

    return out;
}

export const min = (a: Float32Array, b: Float32Array, out: Float32Array = new Float32Array(2)): Float32Array => {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);

    return out;
}

export const minus = (a: Float32Array, b: Float32Array, out: Float32Array = new Float32Array(2)): Float32Array => {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[0];

    return out;
}

export const minusScalar = (a: Float32Array, num: number, out: Float32Array = new Float32Array(2)): Float32Array => {
    out[0] = a[0] - num;
    out[1] = a[1] - num;

    return out;
}

export const multiply = (a: Float32Array, b: Float32Array, out: Float32Array = new Float32Array(2)): Float32Array => {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];

    return out;
}

export const multiplyScalar = (a: Float32Array, scalar: number, out: Float32Array = new Float32Array(2)): Float32Array => {
    out[0] = a[0] * scalar;
    out[1] = a[1] * scalar;

    return out;
}

export const negate = (a: Float32Array, out: Float32Array = new Float32Array(2)): Float32Array => {
    out[0] = -a[0];
    out[1] = -a[1];

    return out;
}

export const normalize = (a: Float32Array, out: Float32Array = new Float32Array(2)): Float32Array => {
    return divideScalar(a, length(a) || 1, out);
}

export const random = (length: number = 1, out: Float32Array = new Float32Array(2)) => {
    x = Math.random() * DEG_360_RAD;
    out[0] = Math.cos(x) * length;
    out[1] = Math.sin(x) * length;

    return out;
}

export const rotate = (a: Float32Array, angle: number, center: Float32Array = VECTOR2_ZERO, out: Float32Array = new Float32Array(2)): Float32Array => {
    c = Math.cos(angle);
    s = Math.sin(angle);

    x = a[0] - center[0];
    y = a[1] - center[1];

    out[0] = x * c - y * s + center[0];
    out[1] = x * s + y * c + center[1];

    return out;
}

export const round = (a: Float32Array, out: Float32Array = new Float32Array(2)): Float32Array => {
    out[0] = Math.round(a[0]);
    out[1] = Math.round(a[1]);

    return out;
}

export const set = (x = 0, y = 0, out: Float32Array = new Float32Array(2)): Float32Array => {
    out[0] = x;
    out[1] = y;

    return out;
}

export const setLength = (a: Float32Array, length: number, out: Float32Array = new Float32Array(2)): Float32Array => {
    normalize(a, out);
    multiplyScalar(out, length, out);
    return out;
}

export const toArray = (a: Float32Array, arr: number[] = []): number[] => {
    arr[0] = a[0];
    arr[1] = a[1];

    return arr;
}

export const toPalorJson = (a: Float32Array, p = { a: 0, r: 0 }): IPolar => {
    p.r = length(a);
    p.a = angle(a);

    return p;
}

export const toString = (a: Float32Array): string => {
    return `vec2(${a[0]}, ${a[1]})`;
}

export const transformMatrix3 = (a: Float32Array, m: Float32Array, out: Float32Array): Float32Array => {
    x = a[0];
    y = a[1];
    out[0] = m[0] * x + m[3] * y + m[6];
    out[1] = m[1] * x + m[4] * y + m[7];

    return out
}

export const VECTOR2_ZERO = new Float32Array([0, 0]);
export const VECTOR2_TOP = new Float32Array([0, 1]);
export const VECTOR2_BOTTOM = new Float32Array([0, -1]);
export const VECTOR2_LEFT = new Float32Array([-1, 0]);
export const VECTOR2_RIGHT = new Float32Array([1, 0]);
