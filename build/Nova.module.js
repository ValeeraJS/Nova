class Timeline {
    static State = {
        PAUSED: "paused",
        RUNNING: "running",
        STOPPED: "stopped"
    };
    delta = 0;
    state = Timeline.State.STOPPED;
    time = 0;
    timeScale;
    current = 0;
    last = 0;
    pauseWhenPageHide = false;
    raf;
    tasks = [];
    taskTimeMap = new WeakMap();
    constructor(timeScale = 1, pauseWhenPageHide = false) {
        this.timeScale = timeScale;
        this.pauseWhenPageHide = pauseWhenPageHide;
        if (this.pauseWhenPageHide) {
            window.addEventListener("pageshow", this.setPageHideTime, false);
        }
    }
    addTask(task, needTimeReset) {
        this.tasks.push(task);
        if (needTimeReset) {
            this.taskTimeMap.set(task, this.time);
        }
        return this;
    }
    destroy() {
        this.stop();
        this.tasks.length = 0;
        if (this.pauseWhenPageHide) {
            window.removeEventListener("pageshow", this.setPageHideTime, false);
        }
    }
    pause() {
        if (this.state !== Timeline.State.RUNNING) {
            return this;
        }
        this.state = Timeline.State.PAUSED;
        return this;
    }
    removeTask(task) {
        this.tasks.splice(this.tasks.indexOf(task), 1);
        return this;
    }
    resume() {
        if (this.state !== Timeline.State.PAUSED) {
            return this;
        }
        this.current = performance.now();
        this.state = Timeline.State.RUNNING;
        return this;
    }
    start() {
        if (this.state !== Timeline.State.STOPPED) {
            return this;
        }
        this.time = 0;
        this.current = performance.now();
        this.state = Timeline.State.RUNNING;
        this.run();
        return this;
    }
    stop() {
        this.state = Timeline.State.STOPPED;
        if (typeof this.raf === "number") {
            cancelAnimationFrame(this.raf);
            this.raf = undefined;
        }
        return this;
    }
    update(time, delta) {
        for (const task of this.tasks) {
            task(time - (this.taskTimeMap.get(task) || 0), delta);
        }
        return this;
    }
    setPageHideTime() {
        this.current = performance.now();
        return this;
    }
    run = () => {
        if (this.state === Timeline.State.RUNNING) {
            this.last = this.current;
            this.current = performance.now();
            this.delta = (this.current - this.last) * this.timeScale;
            this.time += this.delta;
            this.update(this.time, this.delta);
        }
        this.raf = requestAnimationFrame(this.run);
        return this;
    };
}

const RefWeakMap = new WeakMap();
const allFilter = () => true;

function checkFilt(firer, eventKey, target) {
    for (const item of firer.filters) {
        if (item.rule(eventKey, target)) {
            item.listener(target, eventKey);
        }
    }
    return firer;
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const mixin$2 = (Base = Object) => {
    return class EventFirer extends Base {
        filters;
        listeners;
        constructor(...args) {
            super(...args);
            this.filters = [];
            this.listeners = new Map();
            RefWeakMap.set(this, {
                fireIndex: -1,
                isFire: false,
                offCount: new Map()
            });
        }
        all(listener, checkDuplicate) {
            return this.filt(allFilter, listener, checkDuplicate);
        }
        clearListenersByKey(eventKey) {
            this.listeners.delete(eventKey);
            return this;
        }
        clearAllListeners() {
            const keys = this.listeners.keys();
            for (const key of keys) {
                this.listeners.delete(key);
            }
            return this;
        }
        filt(rule, listener, checkDuplicate) {
            if (checkDuplicate) {
                let f;
                for (let i = 0, j = this.filters.length; i < j; i++) {
                    f = this.filters[i];
                    if (f.rule === rule && f.listener === listener) {
                        return this;
                    }
                }
            }
            this.filters.push({
                listener,
                rule
            });
            return this;
        }
        fire(eventKey, target) {
            if (eventKey instanceof Array) {
                for (let i = 0, len = eventKey.length; i < len; i++) {
                    this.fire(eventKey[i], target);
                }
                return this;
            }
            const ref = RefWeakMap.get(this);
            ref.isFire = true;
            const array = this.listeners.get(eventKey) || [];
            // let len = array.length;
            let item;
            for (let i = 0; i < array.length; i++) {
                ref.fireIndex = i;
                item = array[i];
                item.listener(target);
                item.times--;
                if (item.times <= 0) {
                    array.splice(i--, 1);
                }
                const count = ref.offCount.get(eventKey);
                if (count) {
                    // 如果在当前事件触发时，监听器依次触发，已触发的被移除
                    i -= count;
                    ref.offCount.clear();
                }
            }
            checkFilt(this, eventKey, target);
            ref.fireIndex = -1;
            ref.offCount.clear();
            ref.isFire = false;
            return this;
        }
        off(eventKey, listener) {
            const array = this.listeners.get(eventKey);
            const ref = RefWeakMap.get(this);
            if (!array) {
                return this;
            }
            const len = array.length;
            for (let i = 0; i < len; i++) {
                if (array[i].listener === listener) {
                    array.splice(i, 1);
                    if (ref.isFire && ref.fireIndex >= i) {
                        const v = ref.offCount.get(eventKey) ?? 0;
                        ref.offCount.set(eventKey, v + 1);
                    }
                    break;
                }
            }
            return this;
        }
        on(eventKey, listener, checkDuplicate) {
            if (eventKey instanceof Array) {
                for (let i = 0, j = eventKey.length; i < j; i++) {
                    this.times(eventKey[i], Infinity, listener, checkDuplicate);
                }
                return this;
            }
            return this.times(eventKey, Infinity, listener, checkDuplicate);
        }
        once(eventKey, listener, checkDuplicate) {
            return this.times(eventKey, 1, listener, checkDuplicate);
        }
        times(eventKey, times, listener, checkDuplicate = false) {
            const array = this.listeners.get(eventKey) || [];
            if (!this.listeners.has(eventKey)) {
                this.listeners.set(eventKey, array);
            }
            if (checkDuplicate) {
                for (let i = 0, j = array.length; i < j; i++) {
                    if (array[i].listener === listener) {
                        return this;
                    }
                }
            }
            array.push({
                listener,
                times
            });
            return this;
        }
    };
};
const EventFirer = mixin$2(Object);

const RefEventFirerMap = new WeakMap();
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function eventfirer(constructor) {
    return new Proxy(constructor, {
        construct(Target, args) {
            const obj = new Target(...args);
            const firer = new EventFirer();
            RefEventFirerMap.set(obj, firer);
            const arr = ClassOnKeyMap.get(constructor);
            if (arr) {
                for (let i = 0, len = arr.length; i < len; i++) {
                    firer.times(arr[i].eventName, arr[i].times, obj[arr[i].method].bind(obj));
                }
            }
            const arr2 = ClassFiltMap.get(constructor);
            if (arr2) {
                for (let i = 0, len = arr2.length; i < len; i++) {
                    firer.filt(arr2[i].rule, obj[arr2[i].method].bind(obj));
                }
            }
            return obj;
        }
    });
}
const fire = (eventName) => {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    return function (target, key) {
        const func = target[key];
        target[key] = function (...args) {
            const v = func.call(this, ...args);
            RefEventFirerMap.get(this)?.fire(eventName, this);
            return v;
        };
        return target[key];
    };
};
const ClassOnKeyMap = new WeakMap();
const times = (eventName, times = Infinity) => {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    return function (target, key) {
        let arr = ClassOnKeyMap.get(target.constructor);
        if (!arr) {
            arr = [];
            ClassOnKeyMap.set(target.constructor, arr);
        }
        arr.push({
            eventName,
            method: key,
            times
        });
    };
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const on = (eventName) => {
    return times(eventName, Infinity);
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const once = (eventName) => {
    return times(eventName, 1);
};
const ClassFiltMap = new WeakMap();
const filt = (rule) => {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    return function (target, key) {
        let arr = ClassFiltMap.get(target.constructor);
        if (!arr) {
            arr = [];
            ClassFiltMap.set(target.constructor, arr);
        }
        arr.push({
            method: key,
            rule
        });
    };
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const all = filt(allFilter);

const ArraybufferDataType = {
    COLOR_GPU: "col",
    COLOR_RGB: "col_rgb",
    COLOR_RGBA: "col_rgba",
    COLOR_RYB: "col_ryb",
    COLOR_RYBA: "col_ryba",
    COLOR_HSL: "col_hsl",
    COLOR_HSLA: "col_hsla",
    COLOR_HSV: "col_hsv",
    COLOR_HSVA: "col_hsva",
    COLOR_CMYK: "col_cmyk",
    EULER: "euler",
    MATRIX2: "mat2",
    MATRIX3: "mat3",
    MATRIX4: "mat4",
    POLAR: "polar",
    QUATERNION: "qua",
    SPHERICAL: "spherical",
    VECTOR2: "vec2",
    VECTOR3: "vec3",
    VECTOR4: "vec4",
};

const DEG_TO_RAD = Math.PI / 180;
const DEG_360_RAD = Math.PI * 2;
const DEG_90_RAD = Math.PI * 0.5;
const DEG_60_RAD = Math.PI / 3;
const DEG_45_RAD = Math.PI * 0.25;
const DEG_30_RAD = Math.PI / 6;
const EPSILON = Math.pow(2, -52);
const RAD_TO_DEG = 180 / Math.PI;
const WEIGHT_GRAY_RED = 0.299;
const WEIGHT_GRAY_GREEN = 0.587;
const WEIGHT_GRAY_BLUE = 0.114;

var constants$2 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	DEG_30_RAD: DEG_30_RAD,
	DEG_360_RAD: DEG_360_RAD,
	DEG_45_RAD: DEG_45_RAD,
	DEG_60_RAD: DEG_60_RAD,
	DEG_90_RAD: DEG_90_RAD,
	DEG_TO_RAD: DEG_TO_RAD,
	EPSILON: EPSILON,
	RAD_TO_DEG: RAD_TO_DEG,
	WEIGHT_GRAY_BLUE: WEIGHT_GRAY_BLUE,
	WEIGHT_GRAY_GREEN: WEIGHT_GRAY_GREEN,
	WEIGHT_GRAY_RED: WEIGHT_GRAY_RED
});

const COLOR_HEX_MAP = {
    aliceblue: 0xf0f8ff,
    antiquewhite: 0xfaebd7,
    aqua: 0x00ffff,
    aquamarine: 0x7fffd4,
    azure: 0xf0ffff,
    beige: 0xf5f5dc,
    bisque: 0xffe4c4,
    black: 0x000000,
    blanchedalmond: 0xffebcd,
    blue: 0x0000ff,
    blueviolet: 0x8a2be2,
    brown: 0xa52a2a,
    burlywood: 0xdeb887,
    cadetblue: 0x5f9ea0,
    chartreuse: 0x7fff00,
    chocolate: 0xd2691e,
    coral: 0xff7f50,
    cornflowerblue: 0x6495ed,
    cornsilk: 0xfff8dc,
    crimson: 0xdc143c,
    cyan: 0x00ffff,
    darkblue: 0x00008b,
    darkcyan: 0x008b8b,
    darkgoldenrod: 0xb8860b,
    darkgray: 0xa9a9a9,
    darkgreen: 0x006400,
    darkgrey: 0xa9a9a9,
    darkkhaki: 0xbdb76b,
    darkmagenta: 0x8b008b,
    darkolivegreen: 0x556b2f,
    darkorange: 0xff8c00,
    darkorchid: 0x9932cc,
    darkred: 0x8b0000,
    darksalmon: 0xe9967a,
    darkseagreen: 0x8fbc8f,
    darkslateblue: 0x483d8b,
    darkslategray: 0x2f4f4f,
    darkslategrey: 0x2f4f4f,
    darkturquoise: 0x00ced1,
    darkviolet: 0x9400d3,
    deeppink: 0xff1493,
    deepskyblue: 0x00bfff,
    dimgray: 0x696969,
    dimgrey: 0x696969,
    dodgerblue: 0x1e90ff,
    firebrick: 0xb22222,
    floralwhite: 0xfffaf0,
    forestgreen: 0x228b22,
    fuchsia: 0xff00ff,
    gainsboro: 0xdcdcdc,
    ghostwhite: 0xf8f8ff,
    gold: 0xffd700,
    goldenrod: 0xdaa520,
    gray: 0x808080,
    green: 0x008000,
    greenyellow: 0xadff2f,
    grey: 0x808080,
    honeydew: 0xf0fff0,
    hotpink: 0xff69b4,
    indianred: 0xcd5c5c,
    indigo: 0x4b0082,
    ivory: 0xfffff0,
    khaki: 0xf0e68c,
    lavender: 0xe6e6fa,
    lavenderblush: 0xfff0f5,
    lawngreen: 0x7cfc00,
    lemonchiffon: 0xfffacd,
    lightblue: 0xadd8e6,
    lightcoral: 0xf08080,
    lightcyan: 0xe0ffff,
    lightgoldenrodyellow: 0xfafad2,
    lightgray: 0xd3d3d3,
    lightgreen: 0x90ee90,
    lightgrey: 0xd3d3d3,
    lightpink: 0xffb6c1,
    lightsalmon: 0xffa07a,
    lightseagreen: 0x20b2aa,
    lightskyblue: 0x87cefa,
    lightslategray: 0x778899,
    lightslategrey: 0x778899,
    lightsteelblue: 0xb0c4de,
    lightyellow: 0xffffe0,
    lime: 0x00ff00,
    limegreen: 0x32cd32,
    linen: 0xfaf0e6,
    magenta: 0xff00ff,
    maroon: 0x800000,
    mediumaquamarine: 0x66cdaa,
    mediumblue: 0x0000cd,
    mediumorchid: 0xba55d3,
    mediumpurple: 0x9370db,
    mediumseagreen: 0x3cb371,
    mediumslateblue: 0x7b68ee,
    mediumspringgreen: 0x00fa9a,
    mediumturquoise: 0x48d1cc,
    mediumvioletred: 0xc71585,
    midnightblue: 0x191970,
    mintcream: 0xf5fffa,
    mistyrose: 0xffe4e1,
    moccasin: 0xffe4b5,
    navajowhite: 0xffdead,
    navy: 0x000080,
    oldlace: 0xfdf5e6,
    olive: 0x808000,
    olivedrab: 0x6b8e23,
    orange: 0xffa500,
    orangered: 0xff4500,
    orchid: 0xda70d6,
    palegoldenrod: 0xeee8aa,
    palegreen: 0x98fb98,
    paleturquoise: 0xafeeee,
    palevioletred: 0xdb7093,
    papayawhip: 0xffefd5,
    peachpuff: 0xffdab9,
    peru: 0xcd853f,
    pink: 0xffc0cb,
    plum: 0xdda0dd,
    powderblue: 0xb0e0e6,
    purple: 0x800080,
    rebeccapurple: 0x663399,
    red: 0xff0000,
    rosybrown: 0xbc8f8f,
    royalblue: 0x4169e1,
    saddlebrown: 0x8b4513,
    salmon: 0xfa8072,
    sandybrown: 0xf4a460,
    seagreen: 0x2e8b57,
    seashell: 0xfff5ee,
    sienna: 0xa0522d,
    silver: 0xc0c0c0,
    skyblue: 0x87ceeb,
    slateblue: 0x6a5acd,
    slategray: 0x708090,
    slategrey: 0x708090,
    snow: 0xfffafa,
    springgreen: 0x00ff7f,
    steelblue: 0x4682b4,
    tan: 0xd2b48c,
    teal: 0x008080,
    thistle: 0xd8bfd8,
    tomato: 0xff6347,
    turquoise: 0x40e0d0,
    violet: 0xee82ee,
    wheat: 0xf5deb3,
    white: 0xffffff,
    whitesmoke: 0xf5f5f5,
    yellow: 0xffff00,
    yellowgreen: 0x9acd32,
};

let max$2 = 0;
class ColorCMYK extends Float32Array {
    dataType = ArraybufferDataType.COLOR_CMYK;
    static fromRGBUnsignedNormal(r, g, b, out = new ColorCMYK()) {
        max$2 = Math.max(r, g, b);
        out[0] = 1 - r / max$2;
        out[1] = 1 - g / max$2;
        out[2] = 1 - b / max$2;
        out[3] = 1 - max$2;
        return out;
    }
    constructor(c = 0, m = 0, y = 0, k = 0) {
        super(4);
        this[0] = c;
        this[1] = m;
        this[2] = y;
        this[3] = k;
    }
    get c() {
        return this[0];
    }
    set c(val) {
        this[0] = val;
    }
    get m() {
        return this[1];
    }
    set m(val) {
        this[1] = val;
    }
    get y() {
        return this[2];
    }
    set y(val) {
        this[2] = val;
    }
    get k() {
        return this[3];
    }
    set k(val) {
        this[3] = val;
    }
}

let max$1 = 0;
let min$1 = 0;
let h$1 = 0;
let s$4 = 0;
let l = 0;
class ColorHSL extends Float32Array {
    dataType = ArraybufferDataType.COLOR_HSL;
    static fromRGBUnsignedNormal(r, g, b, out = new ColorHSL()) {
        max$1 = Math.max(r, g, b);
        min$1 = Math.min(r, g, b);
        l = (max$1 + min$1) / 2;
        if (max$1 === min$1) {
            h$1 = s$4 = 0;
        }
        else {
            let d = max$1 - min$1;
            s$4 = l > 0.5 ? d / (2 - max$1 - min$1) : d / (max$1 + min$1);
            switch (max$1) {
                case r:
                    h$1 = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h$1 = (b - r) / d + 2;
                    break;
                case b:
                    h$1 = (r - g) / d + 4;
                    break;
            }
            h$1 /= 6;
        }
        out[0] = h$1;
        out[1] = s$4;
        out[2] = l;
        return out;
    }
    constructor(h = 0, s = 0, l = 0) {
        super(3);
        this[0] = h;
        this[1] = s;
        this[2] = l;
    }
    get h() {
        return this[0];
    }
    set h(val) {
        this[0] = val;
    }
    get s() {
        return this[1];
    }
    set s(val) {
        this[1] = val;
    }
    get l() {
        return this[2];
    }
    set l(val) {
        this[2] = val;
    }
}

let max = 0;
let min = 0;
let h = 0;
let s$3 = 0;
let v$2 = 0;
class ColorHSV extends Float32Array {
    dataType = ArraybufferDataType.COLOR_HSV;
    static fromRGBUnsignedNormal(r, g, b, out = new ColorHSV()) {
        max = Math.max(r, g, b);
        min = Math.min(r, g, b);
        v$2 = max;
        if (max === min) {
            h = 0;
        }
        else {
            let d = max - min;
            s$3 = v$2 > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        if (max) {
            s$3 = 1 - min / max;
        }
        else {
            s$3 = 0;
        }
        out[0] = h;
        out[1] = s$3;
        out[2] = v$2;
        return out;
    }
    constructor(h = 0, s = 0, v = 0) {
        super(3);
        this[0] = h;
        this[1] = s;
        this[2] = v;
    }
    get h() {
        return this[0];
    }
    set h(val) {
        this[0] = val;
    }
    get s() {
        return this[1];
    }
    set s(val) {
        this[1] = val;
    }
    get v() {
        return this[2];
    }
    set v(val) {
        this[2] = val;
    }
}

const hue2rgb = (p, q, t) => {
    if (t < 0)
        t += 1;
    if (t > 1)
        t -= 1;
    if (t < 1 / 6)
        return p + (q - p) * 6 * t;
    if (t < 1 / 2)
        return q;
    if (t < 2 / 3)
        return p + (q - p) * (2 / 3 - t) * 6;
    return p;
};

class ColorRGBA extends Uint8Array {
    static average = (color) => {
        return (color[0] + color[1] + color[2]) / 3;
    };
    static averageWeighted = (color, wr = WEIGHT_GRAY_RED, wg = WEIGHT_GRAY_GREEN, wb = WEIGHT_GRAY_BLUE) => {
        return color[0] * wr + color[1] * wg + color[2] * wb;
    };
    static clone = (color) => {
        return new ColorRGBA(color[0], color[1], color[2], color[3]);
    };
    static create = (r = 0, g = 0, b = 0, a = 1) => {
        return new ColorRGBA(r, g, b, a);
    };
    static equals = (a, b) => {
        return ((a.r ?? a[0]) === (b.r ?? b[0]) &&
            (a.g ?? a[1]) === (b.g ?? b[1]) &&
            (a.b ?? a[2]) === (b.b ?? b[2]) &&
            (a.a ?? a[3]) === (b.a ?? b[3]));
    };
    static fromArray = (arr, out = new ColorRGBA()) => {
        out[0] = arr[0];
        out[1] = arr[1];
        out[2] = arr[2];
        out[3] = arr[3];
        return out;
    };
    static fromColorRYB = (color, out = new ColorRGBA()) => {
        let r = color[0];
        let y = color[1];
        let b = color[2];
        // Remove the whiteness from the color.
        let w = Math.min(r, y, b);
        r -= w;
        y -= w;
        b -= w;
        let my = Math.max(r, y, b);
        // Get the green out of the yellow and blue
        let g = Math.min(y, b);
        y -= g;
        b -= g;
        if (b && g) {
            b *= 2.0;
            g *= 2.0;
        }
        // Redistribute the remaining yellow.
        r += y;
        g += y;
        // Normalize to values.
        let mg = Math.max(r, g, b);
        if (mg) {
            let n = my / mg;
            r *= n;
            g *= n;
            b *= n;
        }
        // Add the white back in.
        r += w;
        g += w;
        b += w;
        out[0] = r;
        out[1] = g;
        out[2] = b;
        out[3] = 1;
        return out;
    };
    static fromHex = (hex, alpha = 255, out = new ColorRGBA()) => {
        out[0] = hex >> 16;
        out[1] = (hex >> 8) & 255;
        out[2] = hex & 255;
        out[3] = alpha;
        return out;
    };
    static fromHSL = (h, s, l, out = new ColorRGBA()) => {
        let r;
        let g;
        let b;
        if (s === 0) {
            r = g = b = l; // achromatic
        }
        else {
            let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            let p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        out[0] = Math.round(r * 255);
        out[1] = Math.round(g * 255);
        out[2] = Math.round(b * 255);
        out[3] = 255;
        return out;
    };
    static fromJson = (json, out = new ColorRGBA()) => {
        out[0] = json.r;
        out[1] = json.g;
        out[2] = json.b;
        out[3] = json.a;
        return out;
    };
    static fromScalar = (scalar, alpha = 255, out = new ColorRGBA()) => {
        out[0] = scalar;
        out[1] = scalar;
        out[2] = scalar;
        out[3] = alpha;
        return out;
    };
    static fromString = (str, out = new ColorRGBA()) => {
        if (str in COLOR_HEX_MAP) {
            return ColorRGBA.fromHex(COLOR_HEX_MAP[str], 255, out);
        }
        else if (str.startsWith("#")) {
            str = str.substring(1);
            return ColorRGBA.fromScalar(parseInt(str, 16), 255, out);
        }
        else if (str.startsWith("rgba(")) {
            str = str.substring(4, str.length - 1);
            const arr = str.split(",");
            out[0] = parseInt(arr[0], 10);
            out[1] = parseInt(arr[1], 10);
            out[2] = parseInt(arr[2], 10);
            out[3] = parseInt(arr[3], 10);
        }
        return out;
    };
    static grayscale = (color, wr = WEIGHT_GRAY_RED, wg = WEIGHT_GRAY_GREEN, wb = WEIGHT_GRAY_BLUE, out = new ColorRGBA()) => {
        const gray = ColorRGBA.averageWeighted(color, wr, wg, wb);
        ColorRGBA.fromScalar(gray, color[3], out);
        return out;
    };
    dataType = ArraybufferDataType.COLOR_RGBA;
    constructor(r = 0, g = 0, b = 0, a = 255) {
        super(4);
        this[0] = r;
        this[1] = g;
        this[2] = b;
        this[3] = a;
    }
    get r() {
        return this[0];
    }
    set r(val) {
        this[0] = val;
    }
    get g() {
        return this[1];
    }
    set g(val) {
        this[1] = val;
    }
    get b() {
        return this[2];
    }
    set b(val) {
        this[2] = val;
    }
    get a() {
        return this[3];
    }
    set a(val) {
        this[3] = val;
    }
}

class ColorRGB extends Uint8Array {
    static average = (color) => {
        return (color[0] + color[1] + color[2]) / 3;
    };
    static averageWeighted = (color, wr = WEIGHT_GRAY_RED, wg = WEIGHT_GRAY_GREEN, wb = WEIGHT_GRAY_BLUE) => {
        return color[0] * wr + color[1] * wg + color[2] * wb;
    };
    static clone = (color) => {
        return new ColorRGB(color[0], color[1], color[2]);
    };
    static create = (r = 0, g = 0, b = 0) => {
        return new ColorRGB(r, g, b);
    };
    static equals = (a, b) => {
        return (a.r ?? a[0]) === (b.r ?? b[0]) && (a.g ?? a[1]) === (b.g ?? b[1]) && (a.b ?? a[2]) === (b.b ?? b[2]);
    };
    static fromArray = (arr, out = new ColorRGB()) => {
        out[0] = arr[0];
        out[1] = arr[1];
        out[2] = arr[2];
        return out;
    };
    static fromColorRYB(color, out = new ColorRGB()) {
        let r = color[0];
        let y = color[1];
        let b = color[2];
        // Remove the whiteness from the color.
        let w = Math.min(r, y, b);
        r -= w;
        y -= w;
        b -= w;
        let my = Math.max(r, y, b);
        // Get the green out of the yellow and blue
        let g = Math.min(y, b);
        y -= g;
        b -= g;
        if (b && g) {
            b *= 2.0;
            g *= 2.0;
        }
        // Redistribute the remaining yellow.
        r += y;
        g += y;
        // Normalize to values.
        let mg = Math.max(r, g, b);
        if (mg) {
            let n = my / mg;
            r *= n;
            g *= n;
            b *= n;
        }
        // Add the white back in.
        r += w;
        g += w;
        b += w;
        out[0] = r;
        out[1] = g;
        out[2] = b;
        return out;
    }
    static fromHex = (hex, out = new ColorRGB()) => {
        out[0] = hex >> 16;
        out[1] = (hex >> 8) & 255;
        out[2] = hex & 255;
        return out;
    };
    static fromHSL = (h, s, l, out = new ColorRGB()) => {
        let r;
        let g;
        let b;
        if (s === 0) {
            r = g = b = l; // achromatic
        }
        else {
            let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            let p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        out[0] = Math.round(r * 255);
        out[1] = Math.round(g * 255);
        out[2] = Math.round(b * 255);
        return out;
    };
    static fromJson = (json, out = new ColorRGB()) => {
        out[0] = json.r;
        out[1] = json.g;
        out[2] = json.b;
        return out;
    };
    static fromScalar = (scalar, out = new ColorRGB()) => {
        out[0] = scalar;
        out[1] = scalar;
        out[2] = scalar;
        return out;
    };
    static fromString = (str, out = new ColorRGB()) => {
        if (str in COLOR_HEX_MAP) {
            return ColorRGB.fromHex(COLOR_HEX_MAP[str], out);
        }
        else if (str.startsWith("#")) {
            str = str.substring(1);
            return ColorRGB.fromScalar(parseInt(str, 16), out);
        }
        else if (str.startsWith("rgb(")) {
            str = str.substring(4, str.length - 1);
            const arr = str.split(",");
            out[0] = parseInt(arr[0], 10);
            out[1] = parseInt(arr[1], 10);
            out[2] = parseInt(arr[2], 10);
        }
        return out;
    };
    static grayscale = (color, wr = WEIGHT_GRAY_RED, wg = WEIGHT_GRAY_GREEN, wb = WEIGHT_GRAY_BLUE, out = new ColorRGB()) => {
        const gray = ColorRGB.averageWeighted(color, wr, wg, wb);
        ColorRGB.fromScalar(gray, out);
        return out;
    };
    dataType = ArraybufferDataType.COLOR_RGB;
    constructor(r = 0, g = 0, b = 0) {
        super(3);
        this[0] = r;
        this[1] = g;
        this[2] = b;
    }
    get r() {
        return this[0];
    }
    set r(val) {
        this[0] = val;
    }
    get g() {
        return this[1];
    }
    set g(val) {
        this[1] = val;
    }
    get b() {
        return this[2];
    }
    set b(val) {
        this[2] = val;
    }
}

class ColorRYB extends Uint8Array {
    static average = (color) => {
        return (color[0] + color[1] + color[2]) / 3;
    };
    static averageWeighted = (color, wr = 0.333333, wy = 0.333334, wb = 0.333333) => {
        return color[0] * wr + color[1] * wy + color[2] * wb;
    };
    static clone = (color) => {
        return new ColorRYB(color[0], color[1], color[2]);
    };
    static create = (r = 0, g = 0, b = 0) => {
        return new ColorRYB(r, g, b);
    };
    static equals = (a, b) => {
        return (a.r ?? a[0]) === (b.r ?? b[0]) && (a.y ?? a[1]) === (b.y ?? b[1]) && (a.b ?? a[2]) === (b.b ?? b[2]);
    };
    static fromArray = (arr, out = new ColorRYB()) => {
        out[0] = arr[0];
        out[1] = arr[1];
        out[2] = arr[2];
        return out;
    };
    static fromJson = (json, out = new ColorRYB()) => {
        out[0] = json.r;
        out[1] = json.y;
        out[2] = json.b;
        return out;
    };
    static fromRGB = (rgb, out = new ColorRYB()) => {
        rgb[0];
        rgb[1];
        rgb[2];
        return out;
    };
    static fromScalar = (scalar, out = new ColorRYB()) => {
        out[0] = scalar;
        out[1] = scalar;
        out[2] = scalar;
        return out;
    };
    static fromString = (str, out = new ColorRYB()) => {
        if (str.startsWith("ryb(")) {
            str = str.substring(4, str.length - 1);
            const arr = str.split(",");
            out[0] = parseInt(arr[0], 10);
            out[1] = parseInt(arr[1], 10);
            out[2] = parseInt(arr[2], 10);
        }
        return out;
    };
    dataType = ArraybufferDataType.COLOR_RGB;
    constructor(r = 0, y = 0, b = 0) {
        super(3);
        this[0] = r;
        this[1] = y;
        this[2] = b;
    }
    get r() {
        return this[0];
    }
    set r(val) {
        this[0] = val;
    }
    get y() {
        return this[1];
    }
    set y(val) {
        this[1] = val;
    }
    get b() {
        return this[2];
    }
    set b(val) {
        this[2] = val;
    }
}

let r$2;
let g;
let b$1;
class ColorGPU extends Float32Array {
    static average = (color) => {
        return (color[0] + color[1] + color[2]) / 3;
    };
    static averageWeighted = (color, wr = WEIGHT_GRAY_RED, wg = WEIGHT_GRAY_GREEN, wb = WEIGHT_GRAY_BLUE) => {
        return color[0] * wr + color[1] * wg + color[2] * wb;
    };
    static clone = (color) => {
        return new ColorGPU(color[0], color[1], color[2], color[3]);
    };
    static create = (r = 0, g = 0, b = 0, a = 0) => {
        return new ColorGPU(r, g, b, a);
    };
    static equals = (a, b) => {
        return ((a.r ?? a[0]) === (b.r ?? b[0]) &&
            (a.g ?? a[1]) === (b.g ?? b[1]) &&
            (a.b ?? a[2]) === (b.b ?? b[2]) &&
            (a.a ?? a[3]) === (b.a ?? b[3]));
    };
    static fromArray = (arr, out = new ColorGPU()) => {
        out[0] = arr[0];
        out[1] = arr[1];
        out[2] = arr[2];
        out[3] = arr[3];
        return out;
    };
    static fromColorCMYK = (arr, out = new ColorGPU()) => {
        const k = 1 - arr[3];
        out[0] = (1 - arr[0]) * k;
        out[1] = (1 - arr[1]) * k;
        out[2] = (1 - arr[2]) * k;
        out[3] = 1;
        return out;
    };
    static fromColorHSL = (color, out = new ColorGPU()) => {
        let h = color[0];
        let s = color[1];
        let l = color[2];
        if (s === 0) {
            r$2 = g = b$1 = l; // achromatic
        }
        else {
            let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            let p = 2 * l - q;
            r$2 = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b$1 = hue2rgb(p, q, h - 1 / 3);
        }
        out[0] = r$2;
        out[1] = g;
        out[2] = b$1;
        out[3] = 1;
        return out;
    };
    static fromColorHSV = (color, out = new ColorGPU()) => {
        const s = color[1];
        const v = color[2];
        const h6 = color[0] * 6;
        const hi = Math.floor(h6);
        const f = h6 - hi;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);
        if (hi === 0 || hi === 6) {
            out[0] = v;
            out[1] = t;
            out[2] = p;
        }
        else if (hi === 1) {
            out[0] = q;
            out[1] = v;
            out[2] = p;
        }
        else if (hi === 2) {
            out[0] = p;
            out[1] = v;
            out[2] = t;
        }
        else if (hi === 3) {
            out[0] = p;
            out[1] = q;
            out[2] = v;
        }
        else if (hi === 4) {
            out[0] = t;
            out[1] = p;
            out[2] = v;
        }
        else if (hi === 5) {
            out[0] = v;
            out[1] = p;
            out[2] = q;
        }
        out[3] = 1;
        return out;
    };
    static fromColorRGB(color, out = new ColorGPU()) {
        out[0] = color[0] / 255;
        out[1] = color[1] / 255;
        out[2] = color[2] / 255;
        out[3] = 1;
        return out;
    }
    static fromColorRGBA(color, out = new ColorGPU()) {
        out[0] = color[0] / 255;
        out[1] = color[1] / 255;
        out[2] = color[2] / 255;
        out[3] = color[3] / 255;
        return out;
    }
    static fromColorRYB(color, out = new ColorGPU()) {
        let r = color[0];
        let y = color[1];
        let b = color[2];
        // Remove the whiteness from the color.
        let w = Math.min(r, y, b);
        r -= w;
        y -= w;
        b -= w;
        let my = Math.max(r, y, b);
        // Get the green out of the yellow and blue
        let g = Math.min(y, b);
        y -= g;
        b -= g;
        if (b && g) {
            b *= 2.0;
            g *= 2.0;
        }
        // Redistribute the remaining yellow.
        r += y;
        g += y;
        // Normalize to values.
        let mg = Math.max(r, g, b);
        if (mg) {
            let n = my / mg;
            r *= n;
            g *= n;
            b *= n;
        }
        // Add the white back in.
        r += w;
        g += w;
        b += w;
        out[0] = r / 255;
        out[1] = g / 255;
        out[2] = b / 255;
        out[3] = 1;
        return out;
    }
    static fromHex = (hex, alpha = 1, out = new ColorGPU()) => {
        out[0] = (hex >> 16) / 255;
        out[1] = ((hex >> 8) & 255) / 255;
        out[2] = (hex & 255) / 255;
        out[3] = alpha;
        return out;
    };
    static fromJson = (json, out = new ColorGPU()) => {
        out[0] = json.r;
        out[1] = json.g;
        out[2] = json.b;
        out[3] = json.a;
        return out;
    };
    static fromScalar = (scalar, out = new ColorGPU()) => {
        out[0] = scalar;
        out[1] = scalar;
        out[2] = scalar;
        return out;
    };
    static fromString = (str, out = new ColorGPU()) => {
        if (str in COLOR_HEX_MAP) {
            return ColorGPU.fromHex(COLOR_HEX_MAP[str], 1, out);
        }
        else if (str.startsWith("#")) {
            str = str.substring(1);
            return ColorGPU.fromHex(parseInt(str, 16), 1, out);
        }
        else if (str.startsWith("rgb(")) {
            str = str.substring(4, str.length - 1);
            const arr = str.split(",");
            out[0] = parseInt(arr[0], 10) / 255;
            out[1] = parseInt(arr[1], 10) / 255;
            out[2] = parseInt(arr[2], 10) / 255;
        }
        return out;
    };
    static grayscale = (color, wr = WEIGHT_GRAY_RED, wg = WEIGHT_GRAY_GREEN, wb = WEIGHT_GRAY_BLUE, out = new ColorGPU()) => {
        const gray = ColorGPU.averageWeighted(color, wr, wg, wb);
        ColorGPU.fromScalar(gray, out);
        return out;
    };
    dataType = ArraybufferDataType.COLOR_GPU;
    constructor(r = 0, g = 0, b = 0, a = 0) {
        super(4);
        this[0] = r;
        this[1] = g;
        this[2] = b;
        this[3] = a;
    }
    get r() {
        return this[0];
    }
    set r(val) {
        this[0] = val;
    }
    get g() {
        return this[1];
    }
    set g(val) {
        this[1] = val;
    }
    get b() {
        return this[2];
    }
    set b(val) {
        this[2] = val;
    }
    get a() {
        return this[3];
    }
    set a(val) {
        this[3] = val;
    }
}

var ceilPowerOfTwo = (value) => {
    return Math.pow(2, Math.ceil(Math.log(value) / Math.LN2));
};

/**
 * @function clamp
 * @desc 将目标值限定在指定区间内。假定min小于等于max才能得到正确的结果。
 * @see clampSafe
 * @param {number} val 目标值
 * @param {number} min 最小值，必须小于等于max
 * @param {number} max 最大值，必须大于等于min
 * @returns {number} 限制之后的值
 * @example Mathx.clamp(1, 0, 2); // 1;
 * Mathx.clamp(-1, 0, 2); // 0;
 * Mathx.clamp(3, 0, 2); // 2;
 */
var clamp = (val, min, max) => {
    return Math.max(min, Math.min(max, val));
};

/**
 * @function floorToZero
 * @desc 以0为中心取整
 * @param {number} num 数值
 * @return {number} 取整之后的结果
 * @example Mathx.roundToZero(0.8 ); // 0;
 * Mathx.roundToZero(-0.8); // 0;
 * Mathx.roundToZero(-1.1); // -1;
 */
var floorToZeroCommon = (num) => {
    return num < 0 ? Math.ceil(num) : Math.floor(num);
};

let circle, v$1;
/**
 * @function clampCircle
 * @desc 将目标值限定在指定周期区间内。假定min小于等于max才能得到正确的结果。
 * @param {number} val 目标值
 * @param {number} min 最小值，必须小于等于max
 * @param {number} max 最大值，必须大于等于min
 * @returns {number} 限制之后的值
 * @example Mathx.clampCircle(3 * Math.PI, 0, 2 * Math.PI); // Math.PI;
 * Mathx.clampCircle(2 * Math.PI, -Math.PI, Math.PI); // 0;
 */
var clampCircle = (val, min, max) => {
    circle = max - min;
    v$1 = floorToZeroCommon(min / circle) * circle + (val % circle);
    if (v$1 < min) {
        return v$1 + circle;
    }
    else if (v$1 > max) {
        return v$1 - circle;
    }
    return v$1;
};

/**
 * @function clampSafe
 * @desc 与clamp函数功能一样，将目标值限定在指定区间内。但此函数是安全的，不要求第二个参数必须小于第三个参数
 * @see clamp
 * @param {number} val 目标值
 * @param {number} a 区间中一个最值
 * @param {number} b 区间中另一个最值
 * @returns {number} 限制之后的值
 * @example Mathx.clamp(1, 0, 2); // 1;
 * Mathx.clamp(1, 2, 0); // 1;
 * Mathx.clamp(-1, 0, 2); // 0;
 * Mathx.clamp(-1, 2, 0); // 0;
 * Mathx.clamp(3, 0, 2); // 2;
 * Mathx.clamp(3, 2, 0); // 2;
 */
var clampSafeCommon = (val, a, b) => {
    if (a > b) {
        return Math.max(b, Math.min(a, val));
    }
    else if (b > a) {
        return Math.max(a, Math.min(b, val));
    }
    return a;
};

/**
 * @function closeTo
 * @desc 判断一个数是否在另一个数的邻域内，通常用于检验浮点计算是否精度在EPSILON以内
 * @param {number} val 需要判断的数值
 * @param {number} target 目标数值
 * @param {number} [epsilon = Number.EPSILON] 邻域半径
 * @example Mathx.closeTo(0.1 + 0.2, 0.3); // true;
 * Mathx.clamp(2, 3, 1); // true;
 * Mathx.clamp(2, 3, 0.5); // false;
 */
var closeTo = (val, target, epsilon = EPSILON) => {
    return Math.abs(val - target) <= epsilon;
};

var floorPowerOfTwo = (value) => {
    return Math.pow(2, Math.floor(Math.log(value) / Math.LN2));
};

var isPowerOfTwo = (value) => {
    return (value & (value - 1)) === 0 && value !== 0;
};

var lerp = (a, b, p) => {
    return (b - a) * p + a;
};

let d1 = 0, d2$1 = 0;
/**
 * @function mapRange
 * @desc 将目标值按照区间线性映射到另一个区间里面的值。
 * @param {number} value 目标值
 * @param {number} range1 值所在的线性区间
 * @param {number} range2 值需要映射到的目标区间
 * @returns {number} 映射之后的值
 * @example Mathx.mapRange(50, [0, 100], [0, 1]); // 0.5;
 * Mathx.clamp(150, [100, 200], [0, -100]); // -50;
 * Mathx.clamp(10, [0, 1], [0, -2]); // -20;
 */
var mapRange = (value, range1, range2) => {
    d1 = range1[1] - range1[0];
    d2$1 = range2[1] - range2[0];
    return (value - d1 * 0.5) / d2$1 / d1;
};

var randFloat = (min = 0, max = 1) => {
    return min + Math.random() * (max - min);
};

var randInt = (min = 0, max = 1) => {
    return min + Math.floor(Math.random() * (max - min + 1));
};

let len$2 = 0, sum$1 = 0;
/**
 * @function sumArray
 * @desc 求数组的和
 * @see sum
 * @param {number[]} arr
 * @returns {number} 和
 * @example Mathx.sumArray([1, 2, 3]); // 6;
 */
var sumArray = (arr) => {
    sum$1 = 0;
    len$2 = arr.length;
    for (let i = 0; i < len$2; i++) {
        sum$1 += arr[i];
    }
    return sum$1;
};

/**
 * @function sum
 * @desc 求参数之和
 * @see sumArray
 * @param {number[]} arr
 * @returns {number} 和
 * @example Mathx.sumArray(1, 2, 3); // 6;
 * Mathx.sumArray(1, 2, 3, 4, 5); // 15;
 */
var sum = (...arr) => {
    return sumArray(arr);
};

var BackIn = (p) => {
    const s = 1.70158;
    return p === 1 ? 1 : p * p * ((s + 1) * p - s);
};

var BackInOut = (p) => {
    const s = 1.70158 * 1.525;
    if ((p *= 2) < 1) {
        return 0.5 * (p * p * ((s + 1) * p - s));
    }
    p -= 2;
    return 0.5 * (p * p * ((s + 1) * p + s) + 2);
};

var BackOut = (p) => {
    const s = 1.70158;
    return p === 0 ? 0 : --p * p * ((s + 1) * p + s) + 1;
};

/* eslint-disable no-return-assign */
var BounceOut = (p) => {
    if (p < 1 / 2.75) {
        return 7.5625 * p * p;
    }
    else if (p < 2 / 2.75) {
        return 7.5625 * (p -= 1.5 / 2.75) * p + 0.75;
    }
    else if (p < 2.5 / 2.75) {
        return 7.5625 * (p -= 2.25 / 2.75) * p + 0.9375;
    }
    else {
        return 7.5625 * (p -= 2.625 / 2.75) * p + 0.984375;
    }
};

var BounceIn = (p) => {
    return 1 - BounceOut(1 - p);
};

var BounceInOut = (p) => {
    if (p < 0.5) {
        return BounceIn(p * 2) * 0.5;
    }
    return BounceOut(p * 2 - 1) * 0.5 + 0.5;
};

var CircularIn = (p) => {
    return 1 - Math.sqrt(1 - p * p);
};

var CircularInOut = (p) => {
    if ((p *= 2) < 1) {
        return -0.5 * (Math.sqrt(1 - p * p) - 1);
    }
    p -= 2;
    return 0.5 * (Math.sqrt(1 - p * p) + 1);
};

var CircularOut = (p) => {
    return Math.sqrt(1 - --p * p);
};

var CubicIn = (p) => {
    return p * p * p;
};

var CubicInOut = (p) => {
    if ((p *= 2) < 1) {
        return 0.5 * p * p * p;
    }
    p -= 2;
    return 0.5 * (p * p * p + 2);
};

var CubicOut = (p) => {
    return --p * p * p + 1;
};

var ElasticIn = (p) => {
    if (p === 0 || p === 1) {
        return p;
    }
    return -Math.pow(2, 10 * (p - 1)) * Math.sin((p - 1.1) * 5 * Math.PI);
};

var ElasticInOut = (p) => {
    if (p === 0 || p === 1) {
        return p;
    }
    p *= 2;
    if (p < 1) {
        return -0.5 * Math.pow(2, 10 * (p - 1)) * Math.sin((p - 1.1) * 5 * Math.PI);
    }
    return 0.5 * Math.pow(2, -10 * (p - 1)) * Math.sin((p - 1.1) * 5 * Math.PI) + 1;
};

var ElasticOut = (p) => {
    if (p === 0 || p === 1) {
        return p;
    }
    return Math.pow(2, -10 * p) * Math.sin((p - 0.1) * 5 * Math.PI) + 1;
};

var ExponentialIn = (p) => {
    return p === 0 ? 0 : Math.pow(1024, p - 1);
};

var ExponentialInOut = (p) => {
    if (p === 0 || p === 1) {
        return p;
    }
    if ((p *= 2) < 1) {
        return 0.5 * Math.pow(1024, p - 1);
    }
    return 0.5 * (-Math.pow(2, -10 * (p - 1)) + 2);
};

var ExponentialOut = (p) => {
    return p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
};

var Linear = (p) => {
    return p;
};

var QuadraticIn = (p) => {
    return p * p;
};

var QuadraticInOut = (p) => {
    if ((p *= 2) < 1) {
        return 0.5 * p * p;
    }
    return -0.5 * (--p * (p - 2) - 1);
};

var QuadraticOut = (p) => {
    return p * (2 - p);
};

var QuarticIn = (p) => {
    return p * p * p * p;
};

var QuarticInOut = (p) => {
    if ((p *= 2) < 1) {
        return 0.5 * p * p * p * p;
    }
    p -= 2;
    return -0.5 * (p * p * p * p - 2);
};

var QuarticOut = (p) => {
    return 1 - --p * p * p * p;
};

var QuinticIn = (p) => {
    return p * p * p * p * p;
};

var QuinticInOut = (p) => {
    if ((p *= 2) < 1) {
        return 0.5 * p * p * p * p * p;
    }
    p -= 2;
    return 0.5 * (p * p * p * p * p + 2);
};

var QuinticOut = (p) => {
    return --p * p * p * p * p + 1;
};

var SinusoidalIn = (p) => {
    return 1 - Math.sin(((1.0 - p) * Math.PI) / 2);
};

var SinusoidalInOut = (p) => {
    return 0.5 * (1 - Math.sin(Math.PI * (0.5 - p)));
};

var SinusoidalOut = (p) => {
    return Math.sin((p * Math.PI) / 2);
};

var index$4 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	BackIn: BackIn,
	BackInOut: BackInOut,
	BackOut: BackOut,
	BounceIn: BounceIn,
	BounceInOut: BounceInOut,
	BounceOut: BounceOut,
	CircularIn: CircularIn,
	CircularInOut: CircularInOut,
	CircularOut: CircularOut,
	CubicIn: CubicIn,
	CubicInOut: CubicInOut,
	CubicOut: CubicOut,
	ElasticIn: ElasticIn,
	ElasticInOut: ElasticInOut,
	ElasticOut: ElasticOut,
	ExponentialIn: ExponentialIn,
	ExponentialInOut: ExponentialInOut,
	ExponentialOut: ExponentialOut,
	Linear: Linear,
	QuadraticIn: QuadraticIn,
	QuadraticInOut: QuadraticInOut,
	QuadraticOut: QuadraticOut,
	QuarticIn: QuarticIn,
	QuarticInOut: QuarticInOut,
	QuarticOut: QuarticOut,
	QuinticIn: QuinticIn,
	QuinticInOut: QuinticInOut,
	QuinticOut: QuinticOut,
	SinusoidalIn: SinusoidalIn,
	SinusoidalInOut: SinusoidalInOut,
	SinusoidalOut: SinusoidalOut
});

var EulerRotationOrders;
(function (EulerRotationOrders) {
    EulerRotationOrders["XYZ"] = "xyz";
    EulerRotationOrders["ZXY"] = "zxy";
    EulerRotationOrders["YZX"] = "yzx";
    EulerRotationOrders["XZY"] = "xzy";
    EulerRotationOrders["ZYX"] = "zyx";
    EulerRotationOrders["YXZ"] = "yxz";
})(EulerRotationOrders || (EulerRotationOrders = {}));

class EulerAngle extends Float32Array {
    static ORDERS = EulerRotationOrders;
    static clone(euler) {
        return new EulerAngle(euler.x, euler.y, euler.z, euler.order);
    }
    static create(x = 0, y = 0, z = 0, order = EulerRotationOrders.XYZ) {
        return new EulerAngle(x, y, z, order);
    }
    static fromMatrix4(matrix4, out = new EulerAngle()) {
        const m11 = matrix4[0], m12 = matrix4[4], m13 = matrix4[8];
        const m21 = matrix4[1], m22 = matrix4[5], m23 = matrix4[9];
        const m31 = matrix4[2], m32 = matrix4[6], m33 = matrix4[10];
        switch (out.order) {
            case EulerRotationOrders.XYZ:
                out.y = Math.asin(clamp(m13, -1, 1));
                if (Math.abs(m13) < 0.9999999) {
                    out.x = Math.atan2(-m23, m33);
                    out.z = Math.atan2(-m12, m11);
                }
                else {
                    out.x = Math.atan2(m32, m22);
                    out.z = 0;
                }
                break;
            case EulerRotationOrders.YXZ:
                out.x = Math.asin(-clamp(m23, -1, 1));
                if (Math.abs(m23) < 0.9999999) {
                    out.y = Math.atan2(m13, m33);
                    out.z = Math.atan2(m21, m22);
                }
                else {
                    out.y = Math.atan2(-m31, m11);
                    out.z = 0;
                }
                break;
            case EulerRotationOrders.ZXY:
                out.x = Math.asin(clamp(m32, -1, 1));
                if (Math.abs(m32) < 0.9999999) {
                    out.y = Math.atan2(-m31, m33);
                    out.z = Math.atan2(-m12, m22);
                }
                else {
                    out.y = 0;
                    out.z = Math.atan2(m21, m11);
                }
                break;
            case EulerRotationOrders.ZYX:
                out.y = Math.asin(-clamp(m31, -1, 1));
                if (Math.abs(m31) < 0.9999999) {
                    out.x = Math.atan2(m32, m33);
                    out.z = Math.atan2(m21, m11);
                }
                else {
                    out.x = 0;
                    out.z = Math.atan2(-m12, m22);
                }
                break;
            case EulerRotationOrders.YZX:
                out.z = Math.asin(clamp(m21, -1, 1));
                if (Math.abs(m21) < 0.9999999) {
                    out.x = Math.atan2(-m23, m22);
                    out.y = Math.atan2(-m31, m11);
                }
                else {
                    out.x = 0;
                    out.y = Math.atan2(m13, m33);
                }
                break;
            case EulerRotationOrders.XZY:
                out.z = Math.asin(-clamp(m12, -1, 1));
                if (Math.abs(m12) < 0.9999999) {
                    out.x = Math.atan2(m32, m22);
                    out.y = Math.atan2(m13, m11);
                }
                else {
                    out.x = Math.atan2(-m23, m33);
                    out.y = 0;
                }
                break;
        }
        return out;
    }
    order;
    dataType = ArraybufferDataType.EULER;
    constructor(x = 0, y = 0, z = 0, order = EulerRotationOrders.XYZ) {
        super(3);
        this[0] = x;
        this[1] = y;
        this[2] = z;
        this.order = order;
    }
    get x() {
        return this[0];
    }
    set x(value) {
        this[0] = value;
    }
    get y() {
        return this[1];
    }
    set y(value) {
        this[1] = value;
    }
    get z() {
        return this[2];
    }
    set z(value) {
        this[2] = value;
    }
}

let x$4 = 0;
let y$4 = 0;
let c$1 = 0;
let s$2 = 0;
class Vector2 extends Float32Array {
    static VECTOR2_ZERO = new Vector2(0, 0);
    static VECTOR2_TOP = new Vector2(0, 1);
    static VECTOR2_BOTTOM = new Vector2(0, -1);
    static VECTOR2_LEFT = new Vector2(-1, 0);
    static VECTOR2_RIGHT = new Vector2(1, 0);
    static VECTOR2_ONE = new Vector2(1, 1);
    static add = (a, b, out = new Vector2()) => {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        return out;
    };
    static addScalar = (a, b, out = new Vector2(2)) => {
        out[0] = a[0] + b;
        out[1] = a[1] + b;
        return out;
    };
    static angle = (a) => {
        return Math.atan2(a[1], a[0]);
    };
    static ceil = (a, out = new Vector2()) => {
        out[0] = Math.ceil(a[0]);
        out[1] = Math.ceil(a[1]);
        return out;
    };
    static clamp = (a, min, max, out = new Vector2()) => {
        out[0] = clamp(a[0], min[0], max[0]);
        out[1] = clamp(a[1], min[1], max[1]);
        return out;
    };
    static clampSafe = (a, min, max, out = new Vector2()) => {
        out[0] = clampSafeCommon(a[0], min[0], max[0]);
        out[1] = clampSafeCommon(a[1], min[1], max[1]);
        return out;
    };
    static clampLength = (a, min, max, out = new Vector2()) => {
        out[0] = clampSafeCommon(a[0], min[0], max[0]);
        out[1] = clampSafeCommon(a[1], min[1], max[1]);
        return out;
    };
    static clampScalar = (a, min, max, out = new Vector2()) => {
        out[0] = clamp(a[0], min, max);
        out[1] = clamp(a[1], min, max);
        return out;
    };
    static closeTo = (a, b, epsilon = EPSILON) => {
        return Vector2.distanceTo(a, b) <= epsilon;
    };
    static closeToRect = (a, b, epsilon = EPSILON) => {
        return closeTo(a[0], b[0], epsilon) && closeTo(a[1], b[1], epsilon);
    };
    static closeToManhattan = (a, b, epsilon = EPSILON) => {
        return Vector2.distanceToManhattan(a, b) <= epsilon;
    };
    static clone = (a, out = new Vector2()) => {
        out[0] = a[0];
        out[1] = a[1];
        return out;
    };
    static cross = (a, b) => {
        return a[0] * b[1] - a[1] * b[0];
    };
    static create = (x = 0, y = 0, out = new Vector2()) => {
        out[0] = x;
        out[1] = y;
        return out;
    };
    static distanceTo = (a, b) => {
        x$4 = b[0] - a[0];
        y$4 = b[1] - a[1];
        return Math.hypot(x$4, y$4);
    };
    static distanceToManhattan = (a, b) => {
        return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    };
    static distanceToSquared = (a, b) => {
        x$4 = a[0] - b[0];
        y$4 = a[1] - b[1];
        return x$4 * x$4 + y$4 * y$4;
    };
    static divide = (a, b, out = new Vector2()) => {
        out[0] = a[0] / b[0];
        out[1] = a[1] / b[1];
        return out;
    };
    static divideScalar = (a, scalar, out = new Vector2()) => {
        return Vector2.multiplyScalar(a, 1 / scalar, out);
    };
    static dot = (a, b) => {
        return a[0] * b[0] + a[1] * b[1];
    };
    static equals = (a, b) => {
        return a[0] === b[0] && a[1] === b[1];
    };
    static floor = (a, out = new Vector2()) => {
        out[0] = Math.floor(a[0]);
        out[1] = Math.floor(a[1]);
        return out;
    };
    static floorToZero = (a, out = new Vector2()) => {
        out[0] = floorToZeroCommon(a[0]);
        out[1] = floorToZeroCommon(a[1]);
        return out;
    };
    static fromArray = (arr, index = 0, out = new Vector2()) => {
        out[0] = arr[index];
        out[1] = arr[index + 1];
        return out;
    };
    static fromJson = (j, out = new Vector2()) => {
        out[0] = j.x;
        out[1] = j.y;
        return out;
    };
    static fromPolar = (p, out = new Vector2()) => {
        out[0] = Math.cos(p.a) * p.r;
        out[1] = Math.sin(p.a) * p.r;
        return out;
    };
    static fromScalar = (value = 0, out = new Vector2()) => {
        out[0] = out[1] = value;
        return out;
    };
    static inverse = (a, out = new Vector2()) => {
        out[0] = 1 / a[0] || 0;
        out[1] = 1 / a[1] || 0;
        return out;
    };
    static norm = (a) => {
        return Math.sqrt(a[0] * a[0] + a[1] * a[1]);
    };
    static lengthManhattan = (a) => {
        return Math.abs(a[0]) + Math.abs(a[1]);
    };
    static lengthSquared = (a) => {
        return a[0] * a[0] + a[1] * a[1];
    };
    static lerp = (a, b, alpha, out = new Vector2()) => {
        out[0] = (b[0] - a[0]) * alpha + a[0];
        out[1] = (b[1] - a[1]) * alpha + a[1];
        return out;
    };
    static max = (a, b, out = new Vector2()) => {
        out[0] = Math.max(a[0], b[0]);
        out[1] = Math.max(a[1], b[1]);
        return out;
    };
    static min = (a, b, out = new Vector2()) => {
        out[0] = Math.min(a[0], b[0]);
        out[1] = Math.min(a[1], b[1]);
        return out;
    };
    static minus = (a, b, out = new Vector2()) => {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[0];
        return out;
    };
    static minusScalar = (a, num, out = new Vector2()) => {
        out[0] = a[0] - num;
        out[1] = a[1] - num;
        return out;
    };
    static multiply = (a, b, out = new Vector2()) => {
        out[0] = a[0] * b[0];
        out[1] = a[1] * b[1];
        return out;
    };
    static multiplyScalar = (a, scalar, out = new Vector2()) => {
        out[0] = a[0] * scalar;
        out[1] = a[1] * scalar;
        return out;
    };
    static negate = (a, out = new Vector2()) => {
        out[0] = -a[0];
        out[1] = -a[1];
        return out;
    };
    static normalize = (a, out = new Vector2()) => {
        return Vector2.divideScalar(a, Vector2.norm(a) || 1, out);
    };
    static random = (norm = 1, out = new Vector2()) => {
        x$4 = Math.random() * DEG_360_RAD;
        out[0] = Math.cos(x$4) * norm;
        out[1] = Math.sin(x$4) * norm;
        return out;
    };
    static rotate = (a, angle, center = Vector2.VECTOR2_ZERO, out = new Vector2(2)) => {
        c$1 = Math.cos(angle);
        s$2 = Math.sin(angle);
        x$4 = a[0] - center[0];
        y$4 = a[1] - center[1];
        out[0] = x$4 * c$1 - y$4 * s$2 + center[0];
        out[1] = x$4 * s$2 + y$4 * c$1 + center[1];
        return out;
    };
    static round = (a, out = new Vector2()) => {
        out[0] = Math.round(a[0]);
        out[1] = Math.round(a[1]);
        return out;
    };
    static set = (x = 0, y = 0, out = new Vector2()) => {
        out[0] = x;
        out[1] = y;
        return out;
    };
    static setNorm = (a, length, out = new Vector2(2)) => {
        Vector2.normalize(a, out);
        Vector2.multiplyScalar(out, length, out);
        return out;
    };
    static toArray = (a, arr = []) => {
        arr[0] = a[0];
        arr[1] = a[1];
        return arr;
    };
    static toPalorJson = (a, p = { a: 0, r: 0 }) => {
        p.r = Vector2.norm(a);
        p.a = Vector2.angle(a);
        return p;
    };
    static toString = (a) => {
        return `(${a[0]}, ${a[1]})`;
    };
    static transformMatrix3 = (a, m, out = new Vector2()) => {
        x$4 = a[0];
        y$4 = a[1];
        out[0] = m[0] * x$4 + m[3] * y$4 + m[6];
        out[1] = m[1] * x$4 + m[4] * y$4 + m[7];
        return out;
    };
    dataType = ArraybufferDataType.VECTOR2;
    constructor(x = 0, y = 0) {
        super(2);
        this[0] = x;
        this[1] = y;
    }
    get x() {
        return this[0];
    }
    set x(value) {
        this[0] = value;
    }
    get y() {
        return this[1];
    }
    set y(value) {
        this[1] = value;
    }
}

let ax$1;
let ay$1;
let az$1;
let bx$1;
let by$1;
let bz$1;
let ag;
let s$1;
class Vector3 extends Float32Array {
    static VECTOR3_ZERO = new Vector3(0, 0, 0);
    static VECTOR3_ONE = new Vector3(1, 1, 1);
    static VECTOR3_TOP = new Vector3(0, 1, 0);
    static VECTOR3_BOTTOM = new Vector3(0, -1, 0);
    static VECTOR3_LEFT = new Vector3(-1, 0, 0);
    static VECTOR3_RIGHT = new Vector3(1, 0, 0);
    static VECTOR3_FRONT = new Vector3(0, 0, -1);
    static VECTOR3_BACK = new Vector3(0, 0, 1);
    static add = (a, b, out = new Vector3()) => {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        out[2] = a[2] + b[2];
        return out;
    };
    static addScalar = (a, b, out = new Vector3()) => {
        out[0] = a[0] + b;
        out[1] = a[1] + b;
        out[2] = a[2] + b;
        return out;
    };
    static angle = (a, b) => {
        ax$1 = a[0];
        ay$1 = a[1];
        az$1 = a[2];
        bx$1 = b[0];
        by$1 = b[1];
        bz$1 = b[2];
        const mag1 = Math.sqrt(ax$1 * ax$1 + ay$1 * ay$1 + az$1 * az$1);
        const mag2 = Math.sqrt(bx$1 * bx$1 + by$1 * by$1 + bz$1 * bz$1);
        const mag = mag1 * mag2;
        const cosine = mag && Vector3.dot(a, b) / mag;
        return Math.acos(clamp(cosine, -1, 1));
    };
    static clamp = (a, min, max, out = new Vector3()) => {
        out[0] = clamp(a[0], min[0], max[0]);
        out[1] = clamp(a[1], min[1], max[1]);
        out[2] = clamp(a[2], min[2], max[2]);
        return out;
    };
    static clampSafe = (a, min, max, out = new Vector3()) => {
        out[0] = clampSafeCommon(a[0], min[0], max[0]);
        out[1] = clampSafeCommon(a[1], min[1], max[1]);
        out[1] = clampSafeCommon(a[2], min[2], max[2]);
        return out;
    };
    static clampScalar = (a, min, max, out = new Vector3()) => {
        out[0] = clamp(a[0], min, max);
        out[1] = clamp(a[1], min, max);
        out[2] = clamp(a[2], min, max);
        return out;
    };
    static clone = (a, out = new Vector3()) => {
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        return out;
    };
    static closeTo = (a, b) => {
        return closeTo(a[0], b[0]) && closeTo(a[1], b[1]) && closeTo(a[2], b[2]);
    };
    static create = (x = 0, y = 0, z = 0, out = new Vector3()) => {
        out[0] = x;
        out[1] = y;
        out[2] = z;
        return out;
    };
    static cross = (a, b, out = new Vector3()) => {
        ax$1 = a[0];
        ay$1 = a[1];
        az$1 = a[2];
        bx$1 = b[0];
        by$1 = b[1];
        bz$1 = b[2];
        out[0] = ay$1 * bz$1 - az$1 * by$1;
        out[1] = az$1 * bx$1 - ax$1 * bz$1;
        out[2] = ax$1 * by$1 - ay$1 * bx$1;
        return out;
    };
    static distanceTo = (a, b) => {
        ax$1 = b[0] - a[0];
        ay$1 = b[1] - a[1];
        az$1 = b[2] - a[2];
        return Math.hypot(ax$1, ay$1, az$1);
    };
    static distanceToManhattan = (a, b) => {
        return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
    };
    static distanceToSquared = (a, b) => {
        ax$1 = a[0] - b[0];
        ay$1 = a[1] - b[1];
        az$1 = a[2] - b[2];
        return ax$1 * ax$1 + ay$1 * ay$1 + az$1 * az$1;
    };
    static divide = (a, b, out = new Vector3()) => {
        out[0] = a[0] / b[0];
        out[1] = a[1] / b[1];
        out[2] = a[2] / b[2];
        return out;
    };
    static divideScalar = (a, b, out = new Vector3()) => {
        out[0] = a[0] / b;
        out[1] = a[1] / b;
        out[2] = a[2] / b;
        return out;
    };
    static dot = (a, b) => {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    };
    static equals = (a, b) => {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
    };
    static fromArray = (a, offset = 0, out = new Vector3()) => {
        out[0] = a[offset];
        out[1] = a[offset + 1];
        out[2] = a[offset + 2];
        return out;
    };
    static fromScalar = (num, out = new Vector3()) => {
        out[0] = out[1] = out[2] = num;
        return out;
    };
    static fromValues = (x, y, z, out = new Vector3(3)) => {
        out[0] = x;
        out[1] = y;
        out[2] = z;
        return out;
    };
    static fromMatrix4Translate = (mat, out = new Vector3()) => {
        out[0] = mat[12];
        out[1] = mat[13];
        out[2] = mat[14];
        return out;
    };
    static hermite = (a, b, c, d, t, out = new Vector3()) => {
        ag = t * t;
        const factor1 = ag * (2 * t - 3) + 1;
        const factor2 = ag * (t - 2) + t;
        const factor3 = ag * (t - 1);
        const factor4 = ag * (3 - 2 * t);
        out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
        out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
        out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
        return out;
    };
    static inverse = (a, out = new Vector3()) => {
        out[0] = 1.0 / a[0];
        out[1] = 1.0 / a[1];
        out[2] = 1.0 / a[2];
        return out;
    };
    static norm = (a) => {
        return Math.sqrt(Vector3.lengthSquared(a));
    };
    static lengthManhattan = (a) => {
        return Math.abs(a[0]) + Math.abs(a[1]) + Math.abs(a[2]);
    };
    static lengthSquared = (a) => {
        return a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
    };
    static lerp = (a, b, alpha, out = new Vector3()) => {
        out[0] += (b[0] - a[0]) * alpha;
        out[1] += (b[1] - a[1]) * alpha;
        out[2] += (b[2] - a[2]) * alpha;
        return out;
    };
    static max = (a, b, out = new Vector3()) => {
        out[0] = Math.max(a[0], b[0]);
        out[1] = Math.max(a[1], b[1]);
        out[2] = Math.max(a[2], b[2]);
        return out;
    };
    static min = (a, b, out = new Vector3()) => {
        out[0] = Math.min(a[0], b[0]);
        out[1] = Math.min(a[1], b[1]);
        out[2] = Math.min(a[2], b[2]);
        return out;
    };
    static minus = (a, b, out = new Vector3()) => {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        out[2] = a[2] - b[2];
        return out;
    };
    static minusScalar = (a, b, out = new Vector3()) => {
        out[0] = a[0] - b;
        out[1] = a[1] - b;
        out[2] = a[2] - b;
        return out;
    };
    static multiply = (a, b, out = new Vector3()) => {
        out[0] = a[0] * b[0];
        out[1] = a[1] * b[1];
        out[2] = a[2] * b[2];
        return out;
    };
    static multiplyScalar = (a, scalar, out = new Vector3()) => {
        out[0] = a[0] * scalar;
        out[1] = a[1] * scalar;
        out[2] = a[2] * scalar;
        return out;
    };
    static negate = (a, out = new Vector3()) => {
        out[0] = -a[0];
        out[1] = -a[1];
        out[2] = -a[2];
        return out;
    };
    static normalize = (a, out = new Vector3()) => {
        return Vector3.divideScalar(a, Vector3.norm(a) || 1, out);
    };
    static rotateX = (a, b, rad, out = new Vector3()) => {
        ax$1 = a[0] - b[0];
        ay$1 = a[1] - b[1];
        az$1 = a[2] - b[2];
        bx$1 = ax$1;
        by$1 = ay$1 * Math.cos(rad) - az$1 * Math.sin(rad);
        bz$1 = ay$1 * Math.sin(rad) + az$1 * Math.cos(rad);
        out[0] = bx$1 + b[0];
        out[1] = by$1 + b[1];
        out[2] = bz$1 + b[2];
        return out;
    };
    static rotateY = (a, b, rad, out = new Vector3()) => {
        ax$1 = a[0] - b[0];
        ay$1 = a[1] - b[1];
        az$1 = a[2] - b[2];
        bx$1 = az$1 * Math.sin(rad) + ax$1 * Math.cos(rad);
        by$1 = ay$1;
        bz$1 = az$1 * Math.cos(rad) - ax$1 * Math.sin(rad);
        out[0] = bx$1 + b[0];
        out[1] = by$1 + b[1];
        out[2] = bz$1 + b[2];
        return out;
    };
    static rotateZ = (a, b, rad, out = new Vector3()) => {
        ax$1 = a[0] - b[0];
        ay$1 = a[1] - b[1];
        az$1 = a[2] - b[2];
        bx$1 = ax$1 * Math.cos(rad) - ay$1 * Math.sin(rad);
        by$1 = ax$1 * Math.sin(rad) + ay$1 * Math.cos(rad);
        bz$1 = az$1;
        out[0] = bx$1 + b[0];
        out[1] = by$1 + b[1];
        out[2] = bz$1 + b[2];
        return out;
    };
    static round = (a, out = new Vector3()) => {
        out[0] = Math.round(a[0]);
        out[1] = Math.round(a[1]);
        out[2] = Math.round(a[2]);
        return out;
    };
    static set = (x = 0, y = 0, z = 0, out = new Vector3()) => {
        out[0] = x;
        out[1] = y;
        out[2] = z;
        return out;
    };
    static setNorm = (a, len, out = new Vector3()) => {
        return Vector3.multiplyScalar(Vector3.normalize(a, out), len, out);
    };
    static slerp = (a, b, t, out = new Vector3()) => {
        ag = Math.acos(Math.min(Math.max(Vector3.dot(a, b), -1), 1));
        s$1 = Math.sin(ag);
        ax$1 = Math.sin((1 - t) * ag) / s$1;
        bx$1 = Math.sin(t * ag) / s$1;
        out[0] = ax$1 * a[0] + bx$1 * b[0];
        out[1] = ax$1 * a[1] + bx$1 * b[1];
        out[2] = ax$1 * a[2] + bx$1 * b[2];
        return out;
    };
    static toString = (a) => {
        return `(${a[0]}, ${a[1]}, ${a[2]})`;
    };
    static transformMatrix3 = (a, m, out = new Vector3()) => {
        ax$1 = a[0];
        ay$1 = a[1];
        az$1 = a[2];
        out[0] = ax$1 * m[0] + ay$1 * m[3] + az$1 * m[6];
        out[1] = ax$1 * m[1] + ay$1 * m[4] + az$1 * m[7];
        out[2] = ax$1 * m[2] + ay$1 * m[5] + az$1 * m[8];
        return out;
    };
    static transformMatrix4 = (a, m, out = new Vector3()) => {
        ax$1 = a[0];
        ay$1 = a[1];
        az$1 = a[2];
        ag = m[3] * ax$1 + m[7] * ay$1 + m[11] * az$1 + m[15];
        ag = ag ? 1 / ag : 1.0;
        out[0] = (m[0] * ax$1 + m[4] * ay$1 + m[8] * az$1 + m[12]) * ag;
        out[1] = (m[1] * ax$1 + m[5] * ay$1 + m[9] * az$1 + m[13]) * ag;
        out[2] = (m[2] * ax$1 + m[6] * ay$1 + m[10] * az$1 + m[14]) * ag;
        return out;
    };
    static transformQuat = (a, q, out = new Vector3()) => {
        const qx = q[0];
        const qy = q[1];
        const qz = q[2];
        const qw = q[3];
        const x = a[0];
        const y = a[1];
        const z = a[2];
        // var qvec = [qx, qy, qz];
        // var uv = vec3.cross([], qvec, a);
        let uvx = qy * z - qz * y;
        let uvy = qz * x - qx * z;
        let uvz = qx * y - qy * x;
        // var uuv = vec3.cross([], qvec, uv);
        let uuvx = qy * uvz - qz * uvy;
        let uuvy = qz * uvx - qx * uvz;
        let uuvz = qx * uvy - qy * uvx;
        // vec3.scale(uv, uv, 2 * w);
        const w2 = qw * 2;
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
    };
    dataType = ArraybufferDataType.VECTOR3;
    constructor(x = 0, y = 0, z = 0) {
        super(3);
        this[0] = x;
        this[1] = y;
        this[2] = z;
    }
    get x() {
        return this[0];
    }
    set x(value) {
        this[0] = value;
    }
    get y() {
        return this[1];
    }
    set y(value) {
        this[1] = value;
    }
    get z() {
        return this[2];
    }
    set z(value) {
        this[2] = value;
    }
}

// import clampCommon from "../common/clamp";
let ax, ay, az, aw, bx, by, bz, len$1;
let ix, iy, iz, iw;
let A, B, C, D, E, F, G, H, I, J;
class Vector4 extends Float32Array {
    static VECTOR3_ZERO = new Vector4(0, 0, 0, 0);
    static VECTOR3_ONE = new Vector4(1, 1, 1, 1);
    static add = (a, b, out = new Vector4()) => {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        out[2] = a[2] + b[2];
        out[3] = a[3] + b[3];
        return out;
    };
    static ceil = (a, out = new Vector4()) => {
        out[0] = Math.ceil(a[0]);
        out[1] = Math.ceil(a[1]);
        out[2] = Math.ceil(a[2]);
        out[3] = Math.ceil(a[3]);
        return out;
    };
    static closeTo = (a, b) => {
        return (closeTo(a[0], b[0]) &&
            closeTo(a[1], b[1]) &&
            closeTo(a[2], b[2]) &&
            closeTo(a[3], b[3]));
    };
    static create = (x = 0, y = 0, z = 0, w = 0, out = new Vector4()) => {
        out[0] = x;
        out[1] = y;
        out[2] = z;
        out[3] = w;
        return out;
    };
    static cross = (u, v, w, out = new Vector4(4)) => {
        A = v[0] * w[1] - v[1] * w[0];
        B = v[0] * w[2] - v[2] * w[0];
        C = v[0] * w[3] - v[3] * w[0];
        D = v[1] * w[2] - v[2] * w[1];
        E = v[1] * w[3] - v[3] * w[1];
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
    };
    static distanceTo = (a, b) => {
        ax = b[0] - a[0];
        ay = b[1] - a[1];
        az = b[2] - a[2];
        aw = b[3] - a[3];
        return Math.hypot(ax, ay, az, aw);
    };
    static distanceToSquared = (a, b) => {
        ax = b[0] - a[0];
        ay = b[1] - a[1];
        az = b[2] - a[2];
        aw = b[3] - a[3];
        return ax * ax + ay * ay + az * az + aw * aw;
    };
    static divide = (a, b, out = new Vector4()) => {
        out[0] = a[0] / b[0];
        out[1] = a[1] / b[1];
        out[2] = a[2] / b[2];
        out[3] = a[3] / b[3];
        return out;
    };
    static dot = (a, b) => {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
    };
    static equals = (a, b) => {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
    };
    static floor = (a, out = new Vector4()) => {
        out[0] = Math.floor(a[0]);
        out[1] = Math.floor(a[1]);
        out[2] = Math.floor(a[2]);
        out[3] = Math.floor(a[3]);
        return out;
    };
    static fromValues = (x, y, z, w, out = new Vector4()) => {
        out[0] = x;
        out[1] = y;
        out[2] = z;
        out[3] = w;
        return out;
    };
    static inverse = (a, out = new Vector4()) => {
        out[0] = 1.0 / a[0];
        out[1] = 1.0 / a[1];
        out[2] = 1.0 / a[2];
        out[3] = 1.0 / a[3];
        return out;
    };
    static norm = (a) => {
        return Math.hypot(a[0], a[1], a[2], a[3]);
    };
    static lengthSquared = (a) => {
        ax = a[0];
        ay = a[1];
        az = a[2];
        aw = a[3];
        return ax * ax + ay * ay + az * az + aw * aw;
    };
    static lerp = (a, b, t, out = new Vector4()) => {
        ax = a[0];
        ay = a[1];
        az = a[2];
        aw = a[3];
        out[0] = ax + t * (b[0] - ax);
        out[1] = ay + t * (b[1] - ay);
        out[2] = az + t * (b[2] - az);
        out[3] = aw + t * (b[3] - aw);
        return out;
    };
    static max = (a, b, out = new Vector4()) => {
        out[0] = Math.max(a[0], b[0]);
        out[1] = Math.max(a[1], b[1]);
        out[2] = Math.max(a[2], b[2]);
        out[3] = Math.max(a[3], b[3]);
        return out;
    };
    static min = (a, b, out = new Vector4()) => {
        out[0] = Math.min(a[0], b[0]);
        out[1] = Math.min(a[1], b[1]);
        out[2] = Math.min(a[2], b[2]);
        out[3] = Math.min(a[3], b[3]);
        return out;
    };
    static minus = (a, b, out = new Vector4()) => {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        out[2] = a[2] - b[2];
        out[3] = a[3] - b[3];
        return out;
    };
    static multiply = (a, b, out = new Vector4()) => {
        out[0] = a[0] * b[0];
        out[1] = a[1] * b[1];
        out[2] = a[2] * b[2];
        out[3] = a[3] * b[3];
        return out;
    };
    static multiplyScalar = (a, b, out = new Vector4()) => {
        out[0] = a[0] * b;
        out[1] = a[1] * b;
        out[2] = a[2] * b;
        out[3] = a[3] * b;
        return out;
    };
    static negate = (a, out = new Vector4()) => {
        out[0] = -a[0];
        out[1] = -a[1];
        out[2] = -a[2];
        out[3] = -a[3];
        return out;
    };
    static normalize = (a, out = new Vector4()) => {
        ax = a[0];
        ay = a[1];
        az = a[2];
        aw = a[3];
        len$1 = ax * ax + ay * ay + az * az + aw * aw;
        if (len$1 > 0) {
            len$1 = 1 / Math.sqrt(len$1);
        }
        out[0] = ax * len$1;
        out[1] = ay * len$1;
        out[2] = az * len$1;
        out[3] = aw * len$1;
        return out;
    };
    static round = (a, out = new Vector4()) => {
        out[0] = Math.round(a[0]);
        out[1] = Math.round(a[1]);
        out[2] = Math.round(a[2]);
        out[3] = Math.round(a[3]);
        return out;
    };
    static set = (x = 0, y = 0, z = 0, w = 0, out = new Vector4()) => {
        out[0] = x;
        out[1] = y;
        out[2] = z;
        out[4] = w;
        return out;
    };
    static setNorm = (a, length, out = new Vector4(2)) => {
        Vector4.normalize(a, out);
        Vector4.multiplyScalar(out, length, out);
        return out;
    };
    static toString = (a) => {
        return `(${a[0]}, ${a[1]}, ${a[2]}, ${a[3]})`;
    };
    static transformMatrix4 = (a, m, out = new Vector4()) => {
        ax = a[0];
        ay = a[1];
        az = a[2];
        aw = a[3];
        out[0] = m[0] * ax + m[4] * ay + m[8] * az + m[12] * aw;
        out[1] = m[1] * ax + m[5] * ay + m[9] * az + m[13] * aw;
        out[2] = m[2] * ax + m[6] * ay + m[10] * az + m[14] * aw;
        out[3] = m[3] * ax + m[7] * ay + m[11] * az + m[15] * aw;
        return out;
    };
    static transformQuat = (a, q, out = new Vector4()) => {
        bx = a[0];
        by = a[1];
        bz = a[2];
        ax = q[0];
        ay = q[1];
        az = q[2];
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
    };
    dataType = ArraybufferDataType.VECTOR4;
    constructor(x = 0, y = 0, z = 0, w = 0) {
        super(4);
        this[0] = x;
        this[1] = y;
        this[2] = z;
        this[3] = w;
    }
    get x() {
        return this[0];
    }
    set x(value) {
        this[0] = value;
    }
    get y() {
        return this[1];
    }
    set y(value) {
        this[1] = value;
    }
    get z() {
        return this[2];
    }
    set z(value) {
        this[2] = value;
    }
    get w() {
        return this[3];
    }
    set w(value) {
        this[3] = value;
    }
}

class Line3 {
    a = new Vector3();
    b = new Vector3();
    static fromPointAndDirection(p, direction, out = new Line3()) {
        out.a.set(p);
        Vector3.add(out.a, direction, out.b);
        return out;
    }
    constructor(a = Vector3.VECTOR3_ZERO, b = Vector3.VECTOR3_RIGHT) {
        this.a.set(a);
        this.b.set(b);
    }
    fromPointAndDirection(p, direction) {
        return Line3.fromPointAndDirection(p, direction, this);
    }
}

let a00$2 = 0, a01$2 = 0, a10$2 = 0, a11$2 = 0;
let b00$2 = 0, b01$2 = 0, b10$2 = 0, b11$2 = 0, det$1 = 0;
let x$3 = 0, y$3 = 0;
const UNIT_MATRIX2_DATA = [1, 0, 0, 1];
class Matrix2 extends Float32Array {
    static UNIT_MATRIX2 = new Matrix2([1, 0, 0, 1]);
    static add = (a, b, out) => {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        out[2] = a[2] + b[2];
        out[3] = a[3] + b[3];
        return out;
    };
    static adjoint = (a, out) => {
        a00$2 = a[0];
        out[0] = a[3];
        out[1] = -a[1];
        out[2] = -a[2];
        out[3] = a00$2;
        return out;
    };
    static clone = (source) => {
        return new Matrix2(source);
    };
    static closeTo = (a, b) => {
        a00$2 = a[0];
        a10$2 = a[1];
        a01$2 = a[2];
        a11$2 = a[3];
        b00$2 = b[0];
        b10$2 = b[1];
        b01$2 = b[2];
        b11$2 = b[3];
        return (closeTo(a00$2, b00$2) &&
            closeTo(a01$2, b01$2) &&
            closeTo(a10$2, b10$2) &&
            closeTo(a11$2, b11$2));
    };
    static create = (a = UNIT_MATRIX2_DATA) => {
        return new Matrix2(a);
    };
    static determinant = (a) => {
        return a[0] * a[3] - a[1] * a[2];
    };
    static equals = (a, b) => {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
    };
    static frobNorm = (a) => {
        return Math.hypot(a[0], a[1], a[2], a[3]);
    };
    static fromArray = (source, out = new Matrix2()) => {
        out.set(source);
        return out;
    };
    static fromRotation = (rad, out = new Matrix2()) => {
        y$3 = Math.sin(rad);
        x$3 = Math.cos(rad);
        out[0] = x$3;
        out[1] = y$3;
        out[2] = -y$3;
        out[3] = x$3;
        return out;
    };
    static fromScaling = (v, out = new Matrix2()) => {
        out[0] = v[0];
        out[1] = 0;
        out[2] = 0;
        out[3] = v[1];
        return out;
    };
    static identity = (out = new Matrix2()) => {
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 1;
        return out;
    };
    static invert = (a, out = new Matrix2()) => {
        a00$2 = a[0];
        a10$2 = a[1];
        a01$2 = a[2];
        a11$2 = a[3];
        det$1 = Matrix2.determinant(a);
        if (!det$1) {
            return null;
        }
        det$1 = 1.0 / det$1;
        out[0] = a11$2 * det$1;
        out[1] = -a10$2 * det$1;
        out[2] = -a01$2 * det$1;
        out[3] = a00$2 * det$1;
        return out;
    };
    static minus = (a, b, out = new Matrix2()) => {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        out[2] = a[2] - b[2];
        out[3] = a[3] - b[3];
        return out;
    };
    static multiply = (a, b, out = new Matrix2()) => {
        a00$2 = a[0];
        a10$2 = a[1];
        a01$2 = a[2];
        a11$2 = a[3];
        b00$2 = b[0];
        b10$2 = b[1];
        b01$2 = b[2];
        b11$2 = b[3];
        out[0] = a00$2 * b00$2 + a01$2 * b10$2;
        out[1] = a10$2 * b00$2 + a11$2 * b10$2;
        out[2] = a00$2 * b01$2 + a01$2 * b11$2;
        out[3] = a10$2 * b01$2 + a11$2 * b11$2;
        return out;
    };
    static multiplyScalar = (a, b, out = new Matrix2()) => {
        out[0] = a[0] * b;
        out[1] = a[1] * b;
        out[2] = a[2] * b;
        out[3] = a[3] * b;
        return out;
    };
    static rotate = (a, rad, out = new Matrix2()) => {
        a00$2 = a[0];
        a10$2 = a[1];
        a01$2 = a[2];
        a11$2 = a[3];
        y$3 = Math.sin(rad);
        x$3 = Math.cos(rad);
        out[0] = a00$2 * x$3 + a01$2 * y$3;
        out[1] = a10$2 * x$3 + a11$2 * y$3;
        out[2] = a00$2 * -y$3 + a01$2 * x$3;
        out[3] = a10$2 * -y$3 + a11$2 * x$3;
        return out;
    };
    static scale = (a, v, out = new Matrix2()) => {
        a00$2 = a[0];
        a10$2 = a[1];
        a01$2 = a[2];
        a11$2 = a[3];
        x$3 = v[0];
        y$3 = v[1];
        out[0] = a00$2 * x$3;
        out[1] = a10$2 * x$3;
        out[2] = a01$2 * y$3;
        out[3] = a11$2 * y$3;
        return out;
    };
    static toString = (a) => {
        return `mat2(${a[0]}, ${a[1]}, ${a[2]}, ${a[3]})`;
    };
    static transpose = (a, out = new Matrix2()) => {
        if (out === a) {
            a01$2 = a[1];
            out[1] = a[2];
            out[2] = a01$2;
        }
        else {
            out[0] = a[0];
            out[1] = a[2];
            out[2] = a[1];
            out[3] = a[3];
        }
        return out;
    };
    constructor(data = UNIT_MATRIX2_DATA) {
        super(data);
    }
}

let a00$1 = 0, a01$1 = 0, a02$1 = 0, a11$1 = 0, a10$1 = 0, a12$1 = 0, a20$1 = 0, a21$1 = 0, a22$1 = 0;
let b00$1 = 0, b01$1 = 0, b02$1 = 0, b11$1 = 0, b10$1 = 0, b12$1 = 0, b20$1 = 0, b21$1 = 0, b22$1 = 0;
let x$2 = 0, y$2 = 0;
const UNIT_MATRIX3_DATA = [1, 0, 0, 0, 1, 0, 0, 0, 1];
class Matrix3 extends Float32Array {
    static UNIT_MATRIX3 = new Matrix3(UNIT_MATRIX3_DATA);
    static clone = (source) => {
        return new Matrix3(source);
    };
    static cofactor00 = (a) => {
        return a[4] * a[8] - a[5] * a[7];
    };
    static cofactor01 = (a) => {
        return a[1] * a[8] - a[7] * a[2];
    };
    static cofactor02 = (a) => {
        return a[1] * a[5] - a[4] * a[2];
    };
    static cofactor10 = (a) => {
        return a[3] * a[8] - a[6] * a[5];
    };
    static cofactor11 = (a) => {
        return a[0] * a[8] - a[6] * a[2];
    };
    static cofactor12 = (a) => {
        return a[0] * a[5] - a[3] * a[2];
    };
    static cofactor20 = (a) => {
        return a[3] * a[7] - a[6] * a[4];
    };
    static cofactor21 = (a) => {
        return a[0] * a[7] - a[6] * a[1];
    };
    static cofactor22 = (a) => {
        return a[0] * a[4] - a[3] * a[1];
    };
    static create = () => {
        return new Matrix3(UNIT_MATRIX3_DATA);
    };
    static determinant = (a) => {
        a00$1 = a[0];
        a01$1 = a[1];
        a02$1 = a[2];
        a10$1 = a[3];
        a11$1 = a[4];
        a12$1 = a[5];
        a20$1 = a[6];
        a21$1 = a[7];
        a22$1 = a[8];
        return (a00$1 * (a22$1 * a11$1 - a12$1 * a21$1) +
            a01$1 * (-a22$1 * a10$1 + a12$1 * a20$1) +
            a02$1 * (a21$1 * a10$1 - a11$1 * a20$1));
    };
    static fromArray = (source, out = new Matrix3()) => {
        out.set(source);
        return out;
    };
    static fromMatrix2 = (mat4, out = new Matrix3()) => {
        out[0] = mat4[0];
        out[1] = mat4[1];
        out[2] = 0;
        out[3] = mat4[2];
        out[4] = mat4[3];
        out[5] = 0;
        out[6] = 0;
        out[7] = 0;
        out[8] = 1;
        return out;
    };
    static fromMatrix4 = (mat4, out = new Matrix3()) => {
        out[0] = mat4[0];
        out[1] = mat4[1];
        out[2] = mat4[2];
        out[3] = mat4[4];
        out[4] = mat4[5];
        out[5] = mat4[6];
        out[6] = mat4[8];
        out[7] = mat4[9];
        out[8] = mat4[10];
        return out;
    };
    static fromRotation = (rad, out = new Matrix3()) => {
        y$2 = Math.sin(rad);
        x$2 = Math.cos(rad);
        out[0] = x$2;
        out[1] = y$2;
        out[2] = 0;
        out[3] = -y$2;
        out[4] = x$2;
        out[5] = 0;
        out[6] = 0;
        out[7] = 0;
        out[8] = 1;
        return out;
    };
    static fromScaling = (v, out = new Matrix3()) => {
        out[0] = v[0];
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = v[1];
        out[5] = 0;
        out[6] = 0;
        out[7] = 0;
        out[8] = 1;
        return out;
    };
    static fromTranslation = (v, out = new Matrix3()) => {
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 1;
        out[5] = 0;
        out[6] = v[0];
        out[7] = v[1];
        out[8] = 1;
        return out;
    };
    static identity = (out = new Matrix3()) => {
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 1;
        out[5] = 0;
        out[6] = 0;
        out[7] = 0;
        out[8] = 1;
        return out;
    };
    static invert = (a, out = new Matrix3()) => {
        a00$1 = a[0];
        a01$1 = a[1];
        a02$1 = a[2];
        a10$1 = a[3];
        a11$1 = a[4];
        a12$1 = a[5];
        a20$1 = a[6];
        a21$1 = a[7];
        a22$1 = a[8];
        b01$1 = a22$1 * a11$1 - a12$1 * a21$1;
        b11$1 = -a22$1 * a10$1 + a12$1 * a20$1;
        b21$1 = a21$1 * a10$1 - a11$1 * a20$1;
        let det = a00$1 * b01$1 + a01$1 * b11$1 + a02$1 * b21$1;
        if (!det) {
            return null;
        }
        det = 1.0 / det;
        out[0] = b01$1 * det;
        out[1] = (-a22$1 * a01$1 + a02$1 * a21$1) * det;
        out[2] = (a12$1 * a01$1 - a02$1 * a11$1) * det;
        out[3] = b11$1 * det;
        out[4] = (a22$1 * a00$1 - a02$1 * a20$1) * det;
        out[5] = (-a12$1 * a00$1 + a02$1 * a10$1) * det;
        out[6] = b21$1 * det;
        out[7] = (-a21$1 * a00$1 + a01$1 * a20$1) * det;
        out[8] = (a11$1 * a00$1 - a01$1 * a10$1) * det;
        return out;
    };
    static multiply = (a, b, out = new Matrix3()) => {
        a00$1 = a[0];
        a01$1 = a[1];
        a02$1 = a[2];
        a10$1 = a[3];
        a11$1 = a[4];
        a12$1 = a[5];
        a20$1 = a[6];
        a21$1 = a[7];
        a22$1 = a[8];
        b00$1 = b[0];
        b01$1 = b[1];
        b02$1 = b[2];
        b10$1 = b[3];
        b11$1 = b[4];
        b12$1 = b[5];
        b20$1 = b[6];
        b21$1 = b[7];
        b22$1 = b[8];
        out[0] = b00$1 * a00$1 + b01$1 * a10$1 + b02$1 * a20$1;
        out[1] = b00$1 * a01$1 + b01$1 * a11$1 + b02$1 * a21$1;
        out[2] = b00$1 * a02$1 + b01$1 * a12$1 + b02$1 * a22$1;
        out[3] = b10$1 * a00$1 + b11$1 * a10$1 + b12$1 * a20$1;
        out[4] = b10$1 * a01$1 + b11$1 * a11$1 + b12$1 * a21$1;
        out[5] = b10$1 * a02$1 + b11$1 * a12$1 + b12$1 * a22$1;
        out[6] = b20$1 * a00$1 + b21$1 * a10$1 + b22$1 * a20$1;
        out[7] = b20$1 * a01$1 + b21$1 * a11$1 + b22$1 * a21$1;
        out[8] = b20$1 * a02$1 + b21$1 * a12$1 + b22$1 * a22$1;
        return out;
    };
    static multiplyRotationMatrix = (a, b, out = new Matrix3()) => {
        a00$1 = a[0];
        a01$1 = a[1];
        a02$1 = a[2];
        a10$1 = a[3];
        a11$1 = a[4];
        a12$1 = a[5];
        a20$1 = a[6];
        a21$1 = a[7];
        a22$1 = a[8];
        b00$1 = b[0];
        b01$1 = b[1];
        b10$1 = b[3];
        b11$1 = b[4];
        out[0] = b00$1 * a00$1 + b01$1 * a10$1;
        out[1] = b00$1 * a01$1 + b01$1 * a11$1;
        out[2] = b00$1 * a02$1 + b01$1 * a12$1;
        out[3] = b10$1 * a00$1 + b11$1 * a10$1;
        out[4] = b10$1 * a01$1 + b11$1 * a11$1;
        out[5] = b10$1 * a02$1 + b11$1 * a12$1;
        out[6] = a20$1;
        out[7] = a21$1;
        out[8] = a22$1;
        return out;
    };
    static multiplyScaleMatrix = (a, b, out = new Matrix3()) => {
        a00$1 = a[0];
        a01$1 = a[1];
        a02$1 = a[2];
        a10$1 = a[3];
        a11$1 = a[4];
        a12$1 = a[5];
        a20$1 = a[6];
        a21$1 = a[7];
        a22$1 = a[8];
        b00$1 = b[0];
        b11$1 = b[4];
        out[0] = b00$1 * a00$1;
        out[1] = b00$1 * a01$1;
        out[2] = b00$1 * a02$1;
        out[3] = b11$1 * a10$1;
        out[4] = b11$1 * a11$1;
        out[5] = b11$1 * a12$1;
        out[6] = a20$1;
        out[7] = a21$1;
        out[8] = a22$1;
        return out;
    };
    static multiplyTranslateMatrix = (a, b, out = new Matrix3()) => {
        a00$1 = a[0];
        a01$1 = a[1];
        a02$1 = a[2];
        a10$1 = a[3];
        a11$1 = a[4];
        a12$1 = a[5];
        a20$1 = a[6];
        a21$1 = a[7];
        a22$1 = a[8];
        b20$1 = b[6];
        b21$1 = b[7];
        out[0] = a00$1;
        out[1] = a01$1;
        out[2] = a02$1;
        out[3] = a10$1;
        out[4] = a11$1;
        out[5] = a12$1;
        out[6] = b20$1 * a00$1 + b21$1 * a10$1 + a20$1;
        out[7] = b20$1 * a01$1 + b21$1 * a11$1 + a21$1;
        out[8] = b20$1 * a02$1 + b21$1 * a12$1 + a22$1;
        return out;
    };
    static rotate = (a, rad, out = new Matrix3()) => {
        a00$1 = a[0];
        a01$1 = a[1];
        a02$1 = a[2];
        a10$1 = a[3];
        a11$1 = a[4];
        a12$1 = a[5];
        a20$1 = a[6];
        a21$1 = a[7];
        a22$1 = a[8];
        y$2 = Math.sin(rad);
        x$2 = Math.cos(rad);
        out[0] = x$2 * a00$1 + y$2 * a10$1;
        out[1] = x$2 * a01$1 + y$2 * a11$1;
        out[2] = x$2 * a02$1 + y$2 * a12$1;
        out[3] = y$2 * a10$1 - x$2 * a00$1;
        out[4] = y$2 * a11$1 - x$2 * a01$1;
        out[5] = y$2 * a12$1 - x$2 * a02$1;
        out[6] = a20$1;
        out[7] = a21$1;
        out[8] = a22$1;
        return out;
    };
    static scale = (a, v, out = new Matrix3()) => {
        x$2 = v[0];
        y$2 = v[1];
        out[0] = x$2 * a[0];
        out[1] = x$2 * a[1];
        out[2] = x$2 * a[2];
        out[3] = y$2 * a[3];
        out[4] = y$2 * a[4];
        out[5] = y$2 * a[5];
        out[6] = a[6];
        out[7] = a[7];
        out[8] = a[8];
        return out;
    };
    static translate = (a, v, out = new Matrix3()) => {
        a00$1 = a[0];
        a01$1 = a[1];
        a02$1 = a[2];
        a10$1 = a[3];
        a11$1 = a[4];
        a12$1 = a[5];
        a20$1 = a[6];
        a21$1 = a[7];
        a22$1 = a[8];
        x$2 = v[0];
        y$2 = v[1];
        out[0] = a00$1;
        out[1] = a01$1;
        out[2] = a02$1;
        out[3] = a10$1;
        out[4] = a11$1;
        out[5] = a12$1;
        out[6] = x$2 * a00$1 + y$2 * a10$1 + a20$1;
        out[7] = x$2 * a01$1 + y$2 * a11$1 + a21$1;
        out[8] = x$2 * a02$1 + y$2 * a12$1 + a22$1;
        return out;
    };
    static transpose = (a, out = new Matrix3()) => {
        if (out === a) {
            a01$1 = a[1];
            a02$1 = a[2];
            a12$1 = a[5];
            out[1] = a[3];
            out[2] = a[6];
            out[3] = a01$1;
            out[5] = a[7];
            out[6] = a02$1;
            out[7] = a12$1;
        }
        else {
            out[0] = a[0];
            out[1] = a[3];
            out[2] = a[6];
            out[3] = a[1];
            out[4] = a[4];
            out[5] = a[7];
            out[6] = a[2];
            out[7] = a[5];
            out[8] = a[8];
        }
        return out;
    };
    constructor(data = UNIT_MATRIX3_DATA) {
        super(data);
    }
}

/* eslint-disable max-lines */
let a00 = 0, a01 = 0, a02 = 0, a03 = 0, a11 = 0, a10 = 0, a12 = 0, a13 = 0, a20 = 0, a21 = 0, a22 = 0, a23 = 0, a31 = 0, a30 = 0, a32 = 0, a33 = 0;
let b00 = 0, b01 = 0, b02 = 0, b03 = 0, b11 = 0, b10 = 0, b12 = 0, b13 = 0, b20 = 0, b21 = 0, b22 = 0, b23 = 0, b31 = 0, b30 = 0, b32 = 0, b33 = 0;
let x$1 = 0, y$1 = 0, z = 0, det = 0, len = 0, s = 0, t = 0, a = 0, b = 0, c = 0, d = 0, e = 0, f = 0;
const UNIT_MATRIX4_DATA = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
class Matrix4 extends Float32Array {
    static UNIT_MATRIX4 = new Matrix4(UNIT_MATRIX4_DATA);
    static clone = (source) => {
        return new Matrix4(source);
    };
    static create = () => {
        return new Matrix4(UNIT_MATRIX4_DATA);
    };
    static determinant = (a) => {
        a00 = a[0];
        a01 = a[1];
        a02 = a[2];
        a03 = a[3];
        a10 = a[4];
        a11 = a[5];
        a12 = a[6];
        a13 = a[7];
        a20 = a[8];
        a21 = a[9];
        a22 = a[10];
        a23 = a[11];
        a30 = a[12];
        a31 = a[13];
        a32 = a[14];
        a33 = a[15];
        b00 = a00 * a11 - a01 * a10;
        b01 = a00 * a12 - a02 * a10;
        b02 = a01 * a12 - a02 * a11;
        b03 = a20 * a31 - a21 * a30;
        b10 = a20 * a32 - a22 * a30;
        b11 = a21 * a32 - a22 * a31;
        b12 = a00 * b11 - a01 * b10 + a02 * b03;
        b13 = a10 * b11 - a11 * b10 + a12 * b03;
        b20 = a20 * b02 - a21 * b01 + a22 * b00;
        b21 = a30 * b02 - a31 * b01 + a32 * b00;
        return a13 * b12 - a03 * b13 + a33 * b20 - a23 * b21;
    };
    static fromArray = (source, out = new Matrix4()) => {
        out.set(source);
        return out;
    };
    static fromEuler = (euler, out = new Matrix4()) => {
        x$1 = euler.x;
        y$1 = euler.y;
        z = euler.z;
        a = Math.cos(x$1);
        b = Math.sin(x$1);
        c = Math.cos(y$1);
        d = Math.sin(y$1);
        e = Math.cos(z);
        f = Math.sin(z);
        if (euler.order === EulerRotationOrders.XYZ) {
            const ae = a * e, af = a * f, be = b * e, bf = b * f;
            out[0] = c * e;
            out[4] = -c * f;
            out[8] = d;
            out[1] = af + be * d;
            out[5] = ae - bf * d;
            out[9] = -b * c;
            out[2] = bf - ae * d;
            out[6] = be + af * d;
            out[10] = a * c;
        }
        else if (euler.order === EulerRotationOrders.YXZ) {
            const ce = c * e, cf = c * f, de = d * e, df = d * f;
            out[0] = ce + df * b;
            out[4] = de * b - cf;
            out[8] = a * d;
            out[1] = a * f;
            out[5] = a * e;
            out[9] = -b;
            out[2] = cf * b - de;
            out[6] = df + ce * b;
            out[10] = a * c;
        }
        else if (euler.order === EulerRotationOrders.ZXY) {
            const ce = c * e, cf = c * f, de = d * e, df = d * f;
            out[0] = ce - df * b;
            out[4] = -a * f;
            out[8] = de + cf * b;
            out[1] = cf + de * b;
            out[5] = a * e;
            out[9] = df - ce * b;
            out[2] = -a * d;
            out[6] = b;
            out[10] = a * c;
        }
        else if (euler.order === EulerRotationOrders.ZYX) {
            const ae = a * e, af = a * f, be = b * e, bf = b * f;
            out[0] = c * e;
            out[4] = be * d - af;
            out[8] = ae * d + bf;
            out[1] = c * f;
            out[5] = bf * d + ae;
            out[9] = af * d - be;
            out[2] = -d;
            out[6] = b * c;
            out[10] = a * c;
        }
        else if (euler.order === EulerRotationOrders.YZX) {
            const ac = a * c, ad = a * d, bc = b * c, bd = b * d;
            out[0] = c * e;
            out[4] = bd - ac * f;
            out[8] = bc * f + ad;
            out[1] = f;
            out[5] = a * e;
            out[9] = -b * e;
            out[2] = -d * e;
            out[6] = ad * f + bc;
            out[10] = ac - bd * f;
        }
        else if (euler.order === EulerRotationOrders.XZY) {
            const ac = a * c, ad = a * d, bc = b * c, bd = b * d;
            out[0] = c * e;
            out[4] = -f;
            out[8] = d * e;
            out[1] = ac * f + bd;
            out[5] = a * e;
            out[9] = ad * f - bc;
            out[2] = bc * f - ad;
            out[6] = b * e;
            out[10] = bd * f + ac;
        }
        // bottom row
        out[3] = 0;
        out[7] = 0;
        out[11] = 0;
        // last column
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    };
    static fromMatrix3 = (data, out = new Matrix4()) => {
        out[0] = data[0];
        out[1] = data[1];
        out[2] = data[2];
        out[3] = 0;
        out[4] = data[3];
        out[5] = data[4];
        out[6] = data[5];
        out[7] = 0;
        out[8] = data[6];
        out[9] = data[7];
        out[10] = data[8];
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    };
    static fromMatrix3MVP = (data, out = new Matrix4()) => {
        out[0] = data[0];
        out[1] = data[1];
        out[2] = 0;
        out[3] = 0;
        out[4] = data[3];
        out[5] = data[4];
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = 1;
        out[11] = 0;
        out[12] = data[6];
        out[13] = data[7];
        out[14] = 0;
        out[15] = 1;
        return out;
    };
    static fromQuaternion = (q, out = new Matrix4()) => {
        const x = q[0], y = q[1], z = q[2], w = q[3];
        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;
        const xx = x * x2;
        const yx = y * x2;
        const yy = y * y2;
        const zx = z * x2;
        const zy = z * y2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;
        out[0] = 1 - yy - zz;
        out[1] = yx + wz;
        out[2] = zx - wy;
        out[3] = 0;
        out[4] = yx - wz;
        out[5] = 1 - xx - zz;
        out[6] = zy + wx;
        out[7] = 0;
        out[8] = zx + wy;
        out[9] = zy - wx;
        out[10] = 1 - xx - yy;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    };
    static fromRotation = (rad, axis, out = new Matrix4()) => {
        x$1 = axis[0];
        y$1 = axis[1];
        z = axis[2];
        len = Math.hypot(x$1, y$1, z);
        if (len < EPSILON) {
            return null;
        }
        len = 1 / len;
        x$1 *= len;
        y$1 *= len;
        z *= len;
        s = Math.sin(rad);
        c = Math.cos(rad);
        t = 1 - c;
        out[0] = x$1 * x$1 * t + c;
        out[1] = y$1 * x$1 * t + z * s;
        out[2] = z * x$1 * t - y$1 * s;
        out[3] = 0;
        out[4] = x$1 * y$1 * t - z * s;
        out[5] = y$1 * y$1 * t + c;
        out[6] = z * y$1 * t + x$1 * s;
        out[7] = 0;
        out[8] = x$1 * z * t + y$1 * s;
        out[9] = y$1 * z * t - x$1 * s;
        out[10] = z * z * t + c;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    };
    static fromRotationX = (rad, out = new Matrix4()) => {
        s = Math.sin(rad);
        c = Math.cos(rad);
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = c;
        out[6] = s;
        out[7] = 0;
        out[8] = 0;
        out[9] = -s;
        out[10] = c;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    };
    static fromRotationY = (rad, out = new Matrix4()) => {
        s = Math.sin(rad);
        c = Math.cos(rad);
        out[0] = c;
        out[1] = 0;
        out[2] = -s;
        out[3] = 0;
        out[4] = 0;
        out[5] = 1;
        out[6] = 0;
        out[7] = 0;
        out[8] = s;
        out[9] = 0;
        out[10] = c;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    };
    static fromRotationZ = (rad, out = new Matrix4()) => {
        s = Math.sin(rad);
        c = Math.cos(rad);
        out[0] = c;
        out[1] = s;
        out[2] = 0;
        out[3] = 0;
        out[4] = -s;
        out[5] = c;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = 1;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    };
    static fromScaling = (v, out = new Matrix4()) => {
        out[0] = v[0];
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = v[1];
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = v[2];
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    };
    static fromTranslation = (v, out = new Matrix4()) => {
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = 1;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = 1;
        out[11] = 0;
        out[12] = v[0];
        out[13] = v[1];
        out[14] = v[2];
        out[15] = 1;
        return out;
    };
    static identity = (out = new Matrix4()) => {
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = 1;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = 1;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    };
    static invert = (a, out = new Matrix4()) => {
        a00 = a[0];
        a01 = a[1];
        a02 = a[2];
        a03 = a[3];
        a10 = a[4];
        a11 = a[5];
        a12 = a[6];
        a13 = a[7];
        a20 = a[8];
        a21 = a[9];
        a22 = a[10];
        a23 = a[11];
        a30 = a[12];
        a31 = a[13];
        a32 = a[14];
        a33 = a[15];
        b00 = a00 * a11 - a01 * a10;
        b01 = a00 * a12 - a02 * a10;
        b02 = a00 * a13 - a03 * a10;
        b03 = a01 * a12 - a02 * a11;
        b20 = a01 * a13 - a03 * a11;
        b21 = a02 * a13 - a03 * a12;
        b22 = a20 * a31 - a21 * a30;
        b23 = a20 * a32 - a22 * a30;
        b30 = a20 * a33 - a23 * a30;
        b31 = a21 * a32 - a22 * a31;
        b32 = a21 * a33 - a23 * a31;
        b33 = a22 * a33 - a23 * a32;
        det = b00 * b33 - b01 * b32 + b02 * b31 + b03 * b30 - b20 * b23 + b21 * b22;
        if (!det) {
            return null;
        }
        det = 1.0 / det;
        out[0] = (a11 * b33 - a12 * b32 + a13 * b31) * det;
        out[1] = (a02 * b32 - a01 * b33 - a03 * b31) * det;
        out[2] = (a31 * b21 - a32 * b20 + a33 * b03) * det;
        out[3] = (a22 * b20 - a21 * b21 - a23 * b03) * det;
        out[4] = (a12 * b30 - a10 * b33 - a13 * b23) * det;
        out[5] = (a00 * b33 - a02 * b30 + a03 * b23) * det;
        out[6] = (a32 * b02 - a30 * b21 - a33 * b01) * det;
        out[7] = (a20 * b21 - a22 * b02 + a23 * b01) * det;
        out[8] = (a10 * b32 - a11 * b30 + a13 * b22) * det;
        out[9] = (a01 * b30 - a00 * b32 - a03 * b22) * det;
        out[10] = (a30 * b20 - a31 * b02 + a33 * b00) * det;
        out[11] = (a21 * b02 - a20 * b20 - a23 * b00) * det;
        out[12] = (a11 * b23 - a10 * b31 - a12 * b22) * det;
        out[13] = (a00 * b31 - a01 * b23 + a02 * b22) * det;
        out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
        out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
        return out;
    };
    static lookAt = (eye, center, up = Vector3.VECTOR3_TOP, out = new Matrix4()) => {
        let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
        const eyex = eye[0];
        const eyey = eye[1];
        const eyez = eye[2];
        const upx = up[0];
        const upy = up[1];
        const upz = up[2];
        const centerx = center[0];
        const centery = center[1];
        const centerz = center[2];
        if (closeTo(eyex, centerx) && closeTo(eyey, centery) && closeTo(eyez, centerz)) {
            return Matrix4.identity(out);
        }
        z0 = eyex - centerx;
        z1 = eyey - centery;
        z2 = eyez - centerz;
        len = 1 / Math.hypot(z0, z1, z2);
        z0 *= len;
        z1 *= len;
        z2 *= len;
        x0 = upy * z2 - upz * z1;
        x1 = upz * z0 - upx * z2;
        x2 = upx * z1 - upy * z0;
        len = Math.hypot(x0, x1, x2);
        if (!len) {
            x0 = 0;
            x1 = 0;
            x2 = 0;
        }
        else {
            len = 1 / len;
            x0 *= len;
            x1 *= len;
            x2 *= len;
        }
        y0 = z1 * x2 - z2 * x1;
        y1 = z2 * x0 - z0 * x2;
        y2 = z0 * x1 - z1 * x0;
        len = Math.hypot(y0, y1, y2);
        if (!len) {
            y0 = 0;
            y1 = 0;
            y2 = 0;
        }
        else {
            len = 1 / len;
            y0 *= len;
            y1 *= len;
            y2 *= len;
        }
        out[0] = x0;
        out[1] = y0;
        out[2] = z0;
        out[3] = 0;
        out[4] = x1;
        out[5] = y1;
        out[6] = z1;
        out[7] = 0;
        out[8] = x2;
        out[9] = y2;
        out[10] = z2;
        out[11] = 0;
        out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
        out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
        out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
        out[15] = 1;
        return out;
    };
    static multiply = (a, b, out = new Matrix4()) => {
        a00 = a[0];
        a01 = a[1];
        a02 = a[2];
        a03 = a[3];
        a10 = a[4];
        a11 = a[5];
        a12 = a[6];
        a13 = a[7];
        a20 = a[8];
        a21 = a[9];
        a22 = a[10];
        a23 = a[11];
        a30 = a[12];
        a31 = a[13];
        a32 = a[14];
        a33 = a[15];
        b00 = b[0];
        b01 = b[1];
        b02 = b[2];
        b03 = b[3];
        out[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
        out[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
        out[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
        out[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
        b00 = b[4];
        b01 = b[5];
        b02 = b[6];
        b03 = b[7];
        out[4] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
        out[5] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
        out[6] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
        out[7] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
        b00 = b[8];
        b01 = b[9];
        b02 = b[10];
        b03 = b[11];
        out[8] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
        out[9] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
        out[10] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
        out[11] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
        b00 = b[12];
        b01 = b[13];
        b02 = b[14];
        b03 = b[15];
        out[12] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
        out[13] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
        out[14] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
        out[15] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
        return out;
    };
    // 乘以缩放矩阵
    static multiplyScaleMatrix = (a, b, out = new Matrix4()) => {
        a00 = a[0];
        a01 = a[1];
        a02 = a[2];
        a03 = a[3];
        a10 = a[4];
        a11 = a[5];
        a12 = a[6];
        a13 = a[7];
        a20 = a[8];
        a21 = a[9];
        a22 = a[10];
        a23 = a[11];
        a30 = a[12];
        a31 = a[13];
        a32 = a[14];
        a33 = a[15];
        b00 = b[0];
        out[0] = b00 * a00;
        out[1] = b00 * a01;
        out[2] = b00 * a02;
        out[3] = b00 * a03;
        b01 = b[5];
        out[4] = b01 * a10;
        out[5] = b01 * a11;
        out[6] = b01 * a12;
        out[7] = b01 * a13;
        b02 = b[10];
        out[8] = b02 * a20;
        out[9] = b02 * a21;
        out[10] = b02 * a22;
        out[11] = b02 * a23;
        out[12] = a30;
        out[13] = a31;
        out[14] = a32;
        out[15] = a33;
        return out;
    };
    // 乘以平移矩阵
    static multiplyTranslateMatrix = (a, b, out = new Matrix4()) => {
        a00 = a[0];
        a01 = a[1];
        a02 = a[2];
        a03 = a[3];
        a10 = a[4];
        a11 = a[5];
        a12 = a[6];
        a13 = a[7];
        a20 = a[8];
        a21 = a[9];
        a22 = a[10];
        a23 = a[11];
        a30 = a[12];
        a31 = a[13];
        a32 = a[14];
        a33 = a[15];
        out[0] = a00;
        out[1] = a01;
        out[2] = a02;
        out[3] = a03;
        out[4] = a10;
        out[5] = a11;
        out[6] = a12;
        out[7] = a13;
        out[8] = a20;
        out[9] = a21;
        out[10] = a22;
        out[11] = a23;
        b00 = b[12];
        b01 = b[13];
        b02 = b[14];
        out[12] = b00 * a00 + b01 * a10 + b02 * a20 + a30;
        out[13] = b00 * a01 + b01 * a11 + b02 * a21 + a31;
        out[14] = b00 * a02 + b01 * a12 + b02 * a22 + a32;
        out[15] = b00 * a03 + b01 * a13 + b02 * a23 + a33;
        return out;
    };
    static orthogonal = (left, right, bottom, top, near, far, out = new Matrix4()) => {
        c = 1 / (left - right);
        b = 1 / (bottom - top);
        a = 1 / (near - far);
        out[0] = -2 * c;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = -2 * b;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = 2 * a;
        out[11] = 0;
        out[12] = (left + right) * c;
        out[13] = (top + bottom) * b;
        out[14] = (far + near) * a;
        out[15] = 1;
        return out;
    };
    static orthogonalZ0 = (left, right, bottom, top, near, far, out = new Matrix4()) => {
        c = 1 / (left - right);
        b = 1 / (bottom - top);
        a = 1 / (near - far);
        out[0] = -2 * c;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = -2 * b;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = a;
        out[11] = 0;
        out[12] = (left + right) * c;
        out[13] = (top + bottom) * b;
        out[14] = near * a;
        out[15] = 1;
        return out;
    };
    static perspective = (fovy, aspect, near, far, out = new Matrix4()) => {
        f = 1.0 / Math.tan(fovy / 2);
        out[0] = f / aspect;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = f;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[11] = -1;
        out[12] = 0;
        out[13] = 0;
        out[15] = 0;
        if (far !== null && far !== Infinity) {
            a = 1 / (near - far);
            out[10] = (far + near) * a;
            out[14] = 2 * far * near * a;
        }
        else {
            out[10] = -1;
            out[14] = -2 * near;
        }
        return out;
    };
    static perspectiveZ0 = (fovy, aspect, near, far, out = new Matrix4()) => {
        f = 1.0 / Math.tan(fovy / 2);
        out[0] = f / aspect;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = f;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[11] = -1;
        out[12] = 0;
        out[13] = 0;
        out[15] = 0;
        if (far !== null && far !== Infinity) {
            a = 1 / (near - far);
            out[10] = far * a;
            out[14] = far * near * a;
        }
        else {
            out[10] = -1;
            out[14] = -near;
        }
        return out;
    };
    static rotate = (a, rad, axis, out = new Matrix4()) => {
        x$1 = axis[0];
        y$1 = axis[1];
        z = axis[2];
        len = Math.hypot(x$1, y$1, z);
        if (len < EPSILON) {
            return null;
        }
        len = 1 / len;
        x$1 *= len;
        y$1 *= len;
        z *= len;
        s = Math.sin(rad);
        c = Math.cos(rad);
        t = 1 - c;
        a00 = a[0];
        a01 = a[1];
        a02 = a[2];
        a03 = a[3];
        a10 = a[4];
        a11 = a[5];
        a12 = a[6];
        a13 = a[7];
        a20 = a[8];
        a21 = a[9];
        a22 = a[10];
        a23 = a[11];
        b00 = x$1 * x$1 * t + c;
        b01 = y$1 * x$1 * t + z * s;
        b02 = z * x$1 * t - y$1 * s;
        b10 = x$1 * y$1 * t - z * s;
        b11 = y$1 * y$1 * t + c;
        b12 = z * y$1 * t + x$1 * s;
        b20 = x$1 * z * t + y$1 * s;
        b21 = y$1 * z * t - x$1 * s;
        b22 = z * z * t + c;
        out[0] = a00 * b00 + a10 * b01 + a20 * b02;
        out[1] = a01 * b00 + a11 * b01 + a21 * b02;
        out[2] = a02 * b00 + a12 * b01 + a22 * b02;
        out[3] = a03 * b00 + a13 * b01 + a23 * b02;
        out[4] = a00 * b10 + a10 * b11 + a20 * b12;
        out[5] = a01 * b10 + a11 * b11 + a21 * b12;
        out[6] = a02 * b10 + a12 * b11 + a22 * b12;
        out[7] = a03 * b10 + a13 * b11 + a23 * b12;
        out[8] = a00 * b20 + a10 * b21 + a20 * b22;
        out[9] = a01 * b20 + a11 * b21 + a21 * b22;
        out[10] = a02 * b20 + a12 * b21 + a22 * b22;
        out[11] = a03 * b20 + a13 * b21 + a23 * b22;
        if (a !== out) {
            out[12] = a[12];
            out[13] = a[13];
            out[14] = a[14];
            out[15] = a[15];
        }
        return out;
    };
    static rotateX = (a, rad, out = new Matrix4()) => {
        s = Math.sin(rad);
        c = Math.cos(rad);
        a10 = a[4];
        a11 = a[5];
        a12 = a[6];
        a13 = a[7];
        a20 = a[8];
        a21 = a[9];
        a22 = a[10];
        a23 = a[11];
        if (a !== out) {
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            out[3] = a[3];
            out[12] = a[12];
            out[13] = a[13];
            out[14] = a[14];
            out[15] = a[15];
        }
        out[4] = a10 * c + a20 * s;
        out[5] = a11 * c + a21 * s;
        out[6] = a12 * c + a22 * s;
        out[7] = a13 * c + a23 * s;
        out[8] = a20 * c - a10 * s;
        out[9] = a21 * c - a11 * s;
        out[10] = a22 * c - a12 * s;
        out[11] = a23 * c - a13 * s;
        return out;
    };
    static rotateY = (a, rad, out = new Matrix4()) => {
        s = Math.sin(rad);
        c = Math.cos(rad);
        a00 = a[0];
        a01 = a[1];
        a02 = a[2];
        a03 = a[3];
        a20 = a[8];
        a21 = a[9];
        a22 = a[10];
        a23 = a[11];
        if (a !== out) {
            out[4] = a[4];
            out[5] = a[5];
            out[6] = a[6];
            out[7] = a[7];
            out[12] = a[12];
            out[13] = a[13];
            out[14] = a[14];
            out[15] = a[15];
        }
        out[0] = a00 * c - a20 * s;
        out[1] = a01 * c - a21 * s;
        out[2] = a02 * c - a22 * s;
        out[3] = a03 * c - a23 * s;
        out[8] = a00 * s + a20 * c;
        out[9] = a01 * s + a21 * c;
        out[10] = a02 * s + a22 * c;
        out[11] = a03 * s + a23 * c;
        return out;
    };
    static rotateZ = (a, rad, out = new Matrix4()) => {
        s = Math.sin(rad);
        c = Math.cos(rad);
        a00 = a[0];
        a01 = a[1];
        a02 = a[2];
        a03 = a[3];
        a10 = a[4];
        a11 = a[5];
        a12 = a[6];
        a13 = a[7];
        if (a !== out) {
            out[8] = a[8];
            out[9] = a[9];
            out[10] = a[10];
            out[11] = a[11];
            out[12] = a[12];
            out[13] = a[13];
            out[14] = a[14];
            out[15] = a[15];
        }
        out[0] = a00 * c + a10 * s;
        out[1] = a01 * c + a11 * s;
        out[2] = a02 * c + a12 * s;
        out[3] = a03 * c + a13 * s;
        out[4] = a10 * c - a00 * s;
        out[5] = a11 * c - a01 * s;
        out[6] = a12 * c - a02 * s;
        out[7] = a13 * c - a03 * s;
        return out;
    };
    static scale = (a, v, out = new Matrix4()) => {
        x$1 = v[0];
        y$1 = v[1];
        z = v[2];
        out[0] = a[0] * x$1;
        out[1] = a[1] * x$1;
        out[2] = a[2] * x$1;
        out[3] = a[3] * x$1;
        out[4] = a[4] * y$1;
        out[5] = a[5] * y$1;
        out[6] = a[6] * y$1;
        out[7] = a[7] * y$1;
        out[8] = a[8] * z;
        out[9] = a[9] * z;
        out[10] = a[10] * z;
        out[11] = a[11] * z;
        if (out !== a) {
            out[12] = a[12];
            out[13] = a[13];
            out[14] = a[14];
            out[15] = a[15];
        }
        return out;
    };
    static targetTo = (eye, target, up = Vector3.VECTOR3_TOP, out = new Matrix4()) => {
        const eyex = eye[0], eyey = eye[1], eyez = eye[2], upx = up[0], upy = up[1], upz = up[2];
        let z0 = eyex - target[0], z1 = eyey - target[1], z2 = eyez - target[2];
        let len = z0 * z0 + z1 * z1 + z2 * z2;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            z0 *= len;
            z1 *= len;
            z2 *= len;
        }
        let x0 = upy * z2 - upz * z1, x1 = upz * z0 - upx * z2, x2 = upx * z1 - upy * z0;
        len = x0 * x0 + x1 * x1 + x2 * x2;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            x0 *= len;
            x1 *= len;
            x2 *= len;
        }
        out[0] = x0;
        out[1] = x1;
        out[2] = x2;
        out[3] = 0;
        out[4] = z1 * x2 - z2 * x1;
        out[5] = z2 * x0 - z0 * x2;
        out[6] = z0 * x1 - z1 * x0;
        out[7] = 0;
        out[8] = z0;
        out[9] = z1;
        out[10] = z2;
        out[11] = 0;
        out[12] = eyex;
        out[13] = eyey;
        out[14] = eyez;
        out[15] = 1;
        return out;
    };
    static translate = (a, v, out = new Matrix4()) => {
        x$1 = v[0];
        y$1 = v[1];
        z = v[2];
        if (a === out) {
            out[12] = a[0] * x$1 + a[4] * y$1 + a[8] * z + a[12];
            out[13] = a[1] * x$1 + a[5] * y$1 + a[9] * z + a[13];
            out[14] = a[2] * x$1 + a[6] * y$1 + a[10] * z + a[14];
            out[15] = a[3] * x$1 + a[7] * y$1 + a[11] * z + a[15];
        }
        else {
            a00 = a[0];
            a01 = a[1];
            a02 = a[2];
            a03 = a[3];
            a10 = a[4];
            a11 = a[5];
            a12 = a[6];
            a13 = a[7];
            a20 = a[8];
            a21 = a[9];
            a22 = a[10];
            a23 = a[11];
            out[0] = a00;
            out[1] = a01;
            out[2] = a02;
            out[3] = a03;
            out[4] = a10;
            out[5] = a11;
            out[6] = a12;
            out[7] = a13;
            out[8] = a20;
            out[9] = a21;
            out[10] = a22;
            out[11] = a23;
            out[12] = a00 * x$1 + a10 * y$1 + a20 * z + a[12];
            out[13] = a01 * x$1 + a11 * y$1 + a21 * z + a[13];
            out[14] = a02 * x$1 + a12 * y$1 + a22 * z + a[14];
            out[15] = a03 * x$1 + a13 * y$1 + a23 * z + a[15];
        }
        return out;
    };
    static transpose = (a, out = new Matrix4()) => {
        if (out === a) {
            a01 = a[1];
            a02 = a[2];
            a03 = a[3];
            a12 = a[6];
            a13 = a[7];
            a23 = a[11];
            out[1] = a[4];
            out[2] = a[8];
            out[3] = a[12];
            out[4] = a01;
            out[6] = a[9];
            out[7] = a[13];
            out[8] = a02;
            out[9] = a12;
            out[11] = a[14];
            out[12] = a03;
            out[13] = a13;
            out[14] = a23;
        }
        else {
            out[0] = a[0];
            out[1] = a[4];
            out[2] = a[8];
            out[3] = a[12];
            out[4] = a[1];
            out[5] = a[5];
            out[6] = a[9];
            out[7] = a[13];
            out[8] = a[2];
            out[9] = a[6];
            out[10] = a[10];
            out[11] = a[14];
            out[12] = a[3];
            out[13] = a[7];
            out[14] = a[11];
            out[15] = a[15];
        }
        return out;
    };
    constructor(data = UNIT_MATRIX4_DATA) {
        super(data);
    }
}

let x$5, y$5;
/**
 * @class
 * @classdesc 极坐标
 * @implements {Mathx.IPolar}
 * @name Mathx.Polar
 * @desc 极坐标，遵守数学右手定则。规定逆时针方向为正方向。
 * @param {number} [r=0] | 距离极点距离
 * @param {number} [a=0] | 旋转弧度，规定0弧度为笛卡尔坐标系x轴方向
 */
class Polar extends Float32Array {
    /**
     * @public
     * @method create
     * @memberof Mathx.Polar
     * @desc 创建一个极坐标
     * @param {number} [r=0] 距离
     * @param {number} [a=0] 弧度
     * @returns {Mathx.Polar} 新的极坐标实例
     */
    static create(r = 0, a = 0) {
        return new Polar(r, a);
    }
    get a() {
        return this[1];
    }
    ;
    set a(v) {
        this[1] = v;
    }
    ;
    get r() {
        return this[0];
    }
    ;
    set r(v) {
        this[0] = v;
    }
    ;
    dataType = ArraybufferDataType.POLAR;
    /**
     * @public
     * @member {number} Mathx.Polar.prototype.a
     * @desc 旋转弧度
     * @default 0
     */
    /**
     * @public
     * @member {number} Mathx.Polar.prototype.r
     * @desc 距离
     * @default 0
     */
    constructor(r = 0, a = 0) {
        super(2);
        this.r = r;
        this.a = a;
    }
    /**
     * @public
     * @method Mathx.Polar.prototype.distanceTo
     * @desc 求该坐标到另一个极坐标的欧几里得距离
     * @param {Mathx.IPolar} p | 目标极坐标
     * @returns {number} 欧几里得距离
     */
    distanceTo(p) {
        return Math.sqrt(this.distanceToSquared(p));
    }
    /**
     * @public
     * @method Mathx.Polar.prototype.distanceToManhattan
     * @desc 求该坐标到另一个极坐标的曼哈顿距离
     * @param {Mathx.IPolar} p | 目标极坐标
     * @returns {number} 曼哈顿距离
     */
    distanceToManhattan({ r, a }) {
        return Math.cos(a) * r - this.x() + Math.sin(a) * r - this.y();
    }
    /**
     * @public
     * @method Mathx.Polar.prototype.distanceToSquared
     * @desc 求该坐标到另一个极坐标的欧几里得距离平方
     * @param {Mathx.IPolar} p | 目标极坐标
     * @returns {number} 欧几里得距离平方
     */
    distanceToSquared({ r, a }) {
        return this.r * this.r + r * r - 2 * r * this.r * Math.cos(a - this.a);
    }
    /**
     * @public
     * @method Mathx.Polar.prototype.fromVector2
     * @desc 将一个二维向量数据转化为自身的极坐标值
     * @param {Mathx.IVector2} vector2 | 二维向量
     * @returns {number} this
     */
    fromVector2(v) {
        x$5 = v[0];
        y$5 = v[1];
        this.r = Math.sqrt(x$5 * x$5 + y$5 * y$5);
        this.a = Math.atan2(y$5, x$5);
        return this;
    }
    /**
     * @public
     * @method Mathx.Polar.prototype.lengthManhattan
     * @desc 求自身离原点的曼哈顿距离
     * @returns {number} 曼哈顿距离
     */
    lengthManhattan() {
        return (Math.cos(this.a) + Math.sin(this.a)) * this.r;
    }
    /**
     * @public
     * @method Mathx.Polar.prototype.setA
     * @desc 设置极坐标的弧度
     * @param {number} [a=0] 角度
     * @returns {number} this
     */
    setA(a = 0) {
        this.a = a;
        return this;
    }
    /**
     * @public
     * @method Mathx.Polar.prototype.setR
     * @desc 设置极坐标的弧度
     * @param {number} [r=0] 距离
     * @returns {number} this
     */
    setR(r = 0) {
        this.r = r;
        return this;
    }
    /**
     * @public
     * @method Mathx.Polar.prototype.toJson
     * @desc 将极坐标转化为纯json对象，纯数据
     * @param {IPolar} [json] 被修改的json对象，如果不传则会新创建json对象。
     * @returns {Mathx.IPolar} json
     */
    toJson(json = { a: 0, r: 0 }) {
        json.r = this.r;
        json.a = this.a;
        return json;
    }
    /**
     * @public
     * @method Mathx.Polar.prototype.toString
     * @desc 将极坐标转化为字符串
     * @returns {string} 形式为"(r, a)"的字符串
     */
    toString() {
        return `(${this.r}, ${this.a})`;
    }
    /**
     * @public
     * @method Mathx.Polar.prototype.x
     * @desc 获取极坐标对应二维向量的x的值
     * @returns {number} x
     */
    x() {
        return Math.cos(this.a) * this.r;
    }
    /**
     * @public
     * @method Mathx.Polar.prototype.y
     * @desc 获取极坐标对应二维向量的y的值
     * @returns {number} y
     */
    y() {
        return Math.sin(this.a) * this.r;
    }
}

new Vector3();

var rndFloat = (low, high) => {
    return low + Math.random() * (high - low);
};

var rndFloatRange = (range) => {
    return range * (0.5 - Math.random());
};

var rndInt = (low, high) => {
    return low + Math.floor(Math.random() * (high - low + 1));
};

let dis, r2, d2;
const v = new Vector3();
class Ray3 {
    static at = (a, b, out = new Vector3()) => {
        return Vector3.multiplyScalar(a.direction, b, out);
    };
    static distanceToPlane = (ray, plane) => {
        const denominator = Vector3.dot(plane.normal, ray.direction);
        if (denominator === 0) {
            // line is coplanar, return origin
            if (plane.distanceToPoint(ray.position) === 0) {
                return 0;
            }
            return null;
        }
        const t = -(Vector3.dot(ray.position, plane.normal) + plane.distance) / denominator;
        return t >= 0 ? t : null;
    };
    static distanceToPoint = (a, point) => {
        return Math.sqrt(Ray3.distanceSqToPoint(a, point));
    };
    static distanceSqToPoint = (a, point) => {
        Vector3.minus(point, a.position, v);
        dis = Vector3.dot(v, a.direction);
        if (dis < 0) {
            return Vector3.distanceToSquared(a.position, point);
        }
        Vector3.multiplyScalar(a.direction, dis, v);
        Vector3.add(v, a.position, v);
        return Vector3.distanceToSquared(v, point);
    };
    static lookAt = (a, b, out = new Ray3()) => {
        if (a !== out) {
            Vector3.fromArray(a.position, 0, out.position);
        }
        Vector3.normalize(Vector3.minus(b, a.position, out.direction));
        return out;
    };
    static intersectPlanePoint = (ray, plane, out = new Vector3()) => {
        const t = Ray3.distanceToPlane(ray, plane);
        if (t === null) {
            return null;
        }
        return Ray3.at(ray, t, out);
    };
    static intersectSpherePoint = (ray, sphere, target) => {
        Vector3.minus(sphere.position, ray.position, v);
        dis = Vector3.dot(v, ray.direction);
        d2 = Vector3.dot(v, v) - dis * dis;
        r2 = sphere.radius * sphere.radius;
        if (d2 > r2)
            return null;
        const thc = Math.sqrt(r2 - d2);
        const t0 = dis - thc;
        const t1 = dis + thc;
        if (t0 < 0 && t1 < 0)
            return null;
        if (t0 < 0)
            return Ray3.at(ray, t1, target);
        return Ray3.at(ray, t0, target);
    };
    static isIntersectSphere = (ray, sphere) => {
        return Ray3.distanceSqToPoint(ray, sphere.position) <= sphere.radius * sphere.radius;
    };
    static intersectsPlane = (ray, plane) => {
        const distToPoint = plane.distanceToPoint(ray.position);
        if (distToPoint === 0) {
            return true;
        }
        const denominator = Vector3.dot(plane.normal, ray.direction);
        if (denominator * distToPoint < 0) {
            return true;
        }
        return false;
    };
    static recast = (ray, distance, out = new Ray3()) => {
        v.set(Ray3.at(ray, distance));
        out.direction.set(v);
        return out;
    };
    position = new Vector3();
    direction = new Vector3();
    constructor(position = Vector3.VECTOR3_ZERO, direction = Vector3.VECTOR3_BACK) {
        this.position.set(position);
        Vector3.normalize(direction, this.direction);
    }
}

// import Matrix3 from "../matrix/Matrix3";
const v1$1 = new Vector3(), v2$1 = new Vector3(), v0 = new Vector3(), f1 = new Vector3(), f2 = new Vector3(), f0 = new Vector3();
const ta = new Vector3();
// const ma: Matrix3 = new Matrix3();
const tb = new Vector3(), vA = new Vector3();
class Cube {
    static clampPoint = (a, point, out = new Vector3()) => {
        return Vector3.clamp(point, a.min, a.max, out);
    };
    static containsPoint = (a, b) => {
        return (b[0] >= a.min[0] &&
            b[0] <= a.max[0] &&
            b[1] >= a.min[1] &&
            b[1] <= a.max[1] &&
            b[2] >= a.min[2] &&
            b[2] <= a.max[2]);
    };
    static containsCube = (a, b) => {
        return (a.min[0] <= b.min[0] &&
            b.max[0] <= a.max[0] &&
            a.min[1] <= b.min[1] &&
            b.max[1] <= a.max[1] &&
            a.min[2] <= b.min[2] &&
            b.max[2] <= a.max[2]);
    };
    static depth = (a) => {
        return a.max[2] - a.min[2];
    };
    static equals = (a, b) => {
        return Vector3.equals(a.min, b.min) && Vector3.equals(a.max, b.max);
    };
    static getCenter = (a, out = new Vector3()) => {
        Vector3.add(a.min, a.max, out);
        return Vector3.multiplyScalar(out, 0.5, out);
    };
    static getSize = (a, out = new Vector3()) => {
        return Vector3.minus(a.max, a.min, out);
    };
    static height = (a) => {
        return a.max[1] - a.min[1];
    };
    static intersect = (a, b, out = new Cube()) => {
        Vector3.max(a.min, b.min, out.min);
        Vector3.min(a.max, b.max, out.max);
        return out;
    };
    static intersectsBox = (a, b) => {
        return !(b.max[0] < a.min[0] ||
            b.min[0] > a.max[0] ||
            b.max[1] < a.min[1] ||
            b.min[1] > a.max[1] ||
            b.max[2] < a.min[2] ||
            b.min[2] > a.max[2]);
    };
    static intersectsSphere = (a, b) => {
        Cube.clampPoint(a, b.position, ta);
        return Vector3.distanceToSquared(ta, b.position) <= b.radius * b.radius;
    };
    static intersectsTriangle = (a, b) => {
        if (Cube.isEmpty(a)) {
            return false;
        }
        Cube.getCenter(a, ta);
        Vector3.minus(a.max, ta, tb);
        // translate triangle to aabb origin
        Vector3.minus(b.a, ta, v0);
        Vector3.minus(b.b, ta, v1$1);
        Vector3.minus(b.c, ta, v2$1);
        // compute edge vectors for triangle
        Vector3.minus(v1$1, v0, f0);
        Vector3.minus(v2$1, v1$1, f1);
        Vector3.minus(v0, v2$1, f2);
        // test against axes that are given by cross product combinations of the edges of the triangle and the edges of the aabb
        // make an axis testing of each of the 3 sides of the aabb against each of the 3 sides of the triangle = 9 axis of separation
        // axis_ij = u_i x f_j (u0, u1, u2 = face normals of aabb = x,y,z axes vectors since aabb is axis aligned)
        const axes = [
            0,
            -f0[2],
            f0[1],
            0,
            -f1[2],
            f1[1],
            0,
            -f2[2],
            f2[1],
            f0[2],
            0,
            -f0[0],
            f1[2],
            0,
            -f1[0],
            f2[2],
            0,
            -f2[0],
            -f0[1],
            f0[0],
            0,
            -f1[1],
            f1[0],
            0,
            -f2[1],
            f2[0],
            0
        ];
        if (!satForAxes(axes, v0, v1$1, v2$1, tb)) {
            return false;
        }
        // test 3 face normals from the aabb
        // ta = Matrix3.identity(); ???
        if (!satForAxes(axes, v0, v1$1, v2$1, tb)) {
            return false;
        }
        // finally testing the face normal of the triangle
        // use already existing triangle edge vectors here
        Vector3.cross(f0, f1, ta);
        // axes = [_triangleNormal.x, _triangleNormal.y, _triangleNormal.z];
        return satForAxes(ta, v0, v1$1, v2$1, tb);
    };
    static isEmpty = (a) => {
        return a.max[0] < a.min[0] || a.max[0] < a.min[0] || a.max[0] < a.min[0];
    };
    static round = (a, out = new Cube()) => {
        Vector3.round(a.min, out.min);
        Vector3.round(a.max, out.max);
        return out;
    };
    static size = (a, out = new Vector3()) => {
        return Vector3.minus(a.max, a.min, out);
    };
    static stretch = (a, b, c, out = new Cube()) => {
        Vector3.add(a.min, b, out.min);
        Vector3.add(a.max, c, out.max);
        return out;
    };
    static surfaceArea = (a) => {
        Cube.getSize(a, ta);
        return (ta.x * ta.y + ta.x * ta.z + ta.y * ta.z) * 2;
    };
    static translate = (a, b, out = new Cube()) => {
        Vector3.add(a.min, b, out.min);
        Vector3.add(a.max, b, out.max);
        return out;
    };
    static union = (a, b, out = new Cube()) => {
        Vector3.min(a.min, b.min, out.min);
        Vector3.max(a.max, b.max, out.max);
        return out;
    };
    static volume = (a) => {
        return (a.max[0] - a.min[0]) * (a.max[1] - a.min[1]) * (a.max[2] - a.min[2]);
    };
    static width = (a) => {
        return a.max[0] - a.min[0];
    };
    min = new Vector3();
    max = new Vector3();
    constructor(a = new Vector3(), b = Vector3.VECTOR3_ONE) {
        Vector3.min(a, b, this.min);
        Vector3.max(a, b, this.max);
    }
}
let i, j, p0, p1, p2, r$1;
function satForAxes(axes, v0, v1, v2, extents) {
    for (i = 0, j = axes.length - 3; i <= j; i += 3) {
        Vector3.fromArray(axes, i, vA);
        // project the aabb onto the seperating axis
        r$1 =
            extents[0] * Math.abs(vA[0]) +
                extents[1] * Math.abs(vA[1]) +
                extents[2] * Math.abs(vA[2]);
        // project all 3 vertices of the triangle onto the seperating axis
        p0 = Vector3.dot(v0, vA);
        p1 = Vector3.dot(v1, vA);
        p2 = Vector3.dot(v2, vA);
        // actual test, basically see if either of the most extreme of the triangle points intersects r
        if (Math.max(-Math.max(p0, p1, p2), Math.min(p0, p1, p2)) > r$1) {
            // points of the projected triangle are outside the projected half-length of the aabb
            // the axis is seperating and we can exit
            return false;
        }
    }
    return true;
}

const v1 = new Vector3();
const v2 = new Vector3();
const v3 = new Vector3();
class Plane3 {
    static normalize(p, out = new Plane3) {
        const normal = p.normal;
        const factor = 1.0 / Vector3.norm(normal);
        Vector3.multiplyScalar(normal, factor, out.normal);
        out.distance = p.distance * factor;
        return out;
    }
    normal = new Vector3();
    distance;
    constructor(normal = Vector3.VECTOR3_TOP, distance = 0) {
        this.normal.set(normal);
        this.distance = distance;
    }
    distanceToPoint(point) {
        return Vector3.dot(this.normal, point) + this.distance;
    }
    distanceToSphere(sphere) {
        return this.distanceToPoint(sphere.position) - sphere.radius;
    }
    from(p) {
        this.distance = p.distance;
        this.normal.set(p.normal);
    }
    fromCoplanarPoints(a, b, c) {
        Vector3.minus(b, a, v1);
        Vector3.minus(c, a, v2);
        Vector3.cross(v1, v2, v3);
        Vector3.normalize(v3, v3);
        // TODO check zero vec
        return this.formCoplanarPointAndNormal(a, v3);
    }
    formCoplanarPointAndNormal(point, normal) {
        this.normal.set(normal);
        this.distance = -Vector3.dot(point, normal);
        return this;
    }
    negate() {
        this.distance *= -1;
        Vector3.negate(this.normal, this.normal);
        return this;
    }
    normalize() {
        Plane3.normalize(this, this);
        return this;
    }
    projectPoint(point, out = new Vector3()) {
        out.set(this.normal);
        Vector3.multiplyScalar(out, -this.distanceToPoint(point), out);
        return Vector3.add(out, point, out);
    }
    set(normal, distance = this.distance) {
        this.normal.set(normal);
        this.distance = distance;
        return this;
    }
}

const _vector = new Vector3();
class Frustum {
    near;
    far;
    left;
    right;
    bottom;
    top;
    constructor(matrix) {
        this.near = new Plane3();
        this.far = new Plane3();
        this.left = new Plane3();
        this.right = new Plane3();
        this.top = new Plane3();
        this.bottom = new Plane3();
        matrix && this.applyProjectionMatrix(matrix);
    }
    applyProjectionMatrix(matrix) {
        const m11 = matrix[0];
        const m12 = matrix[1];
        const m13 = matrix[2];
        const m14 = matrix[3];
        const m21 = matrix[4];
        const m22 = matrix[5];
        const m23 = matrix[6];
        const m24 = matrix[7];
        const m31 = matrix[8];
        const m32 = matrix[9];
        const m33 = matrix[10];
        const m34 = matrix[11];
        const m41 = matrix[12];
        const m42 = matrix[13];
        const m43 = matrix[14];
        const m44 = matrix[15];
        Vector3.set(m14 + m13, m24 + m23, m34 + m33, this.near.normal);
        this.near.distance = m44 + m43;
        this.near.normalize();
        Vector3.set(m14 - m13, m24 - m23, m34 - m33, this.far.normal);
        this.far.distance = m44 - m43;
        this.far.normalize();
        Vector3.set(m14 + m11, m24 + m21, m34 + m31, this.left.normal);
        this.left.distance = m44 + m41;
        this.left.normalize();
        Vector3.set(m14 - m11, m24 - m21, m34 - m31, this.right.normal);
        this.right.distance = m44 - m41;
        this.right.normalize();
        Vector3.set(m14 + m12, m24 + m22, m34 + m32, this.bottom.normal);
        this.bottom.distance = m44 + m42;
        this.bottom.normalize();
        Vector3.set(m14 - m12, m24 - m22, m34 - m32, this.top.normal);
        this.top.distance = m44 - m42;
        this.top.normalize();
        return this;
    }
    clone() {
        return new Frustum().from(this);
    }
    from(frustum) {
        this.near.from(frustum.near);
        this.far.from(frustum.far);
        this.left.from(frustum.left);
        this.right.from(frustum.right);
        this.bottom.from(frustum.bottom);
        this.top.from(frustum.top);
        return this;
    }
    intersectsSphere(sphere) {
        const p = sphere.position;
        const r = -sphere.radius;
        let distance = this.near.distanceToPoint(p);
        if (distance < r) {
            return false;
        }
        distance = this.far.distanceToPoint(p);
        if (distance < r) {
            return false;
        }
        distance = this.right.distanceToPoint(p);
        if (distance < r) {
            return false;
        }
        distance = this.left.distanceToPoint(p);
        if (distance < r) {
            return false;
        }
        distance = this.top.distanceToPoint(p);
        if (distance < r) {
            return false;
        }
        distance = this.bottom.distanceToPoint(p);
        if (distance < r) {
            return false;
        }
        return true;
    }
    intersectsBox(box) {
        let plane = this.right;
        _vector.x = plane.normal.x > 0 ? box.max.x : box.min.x;
        _vector.y = plane.normal.y > 0 ? box.max.y : box.min.y;
        _vector.z = plane.normal.z > 0 ? box.max.z : box.min.z;
        if (plane.distanceToPoint(_vector) < 0) {
            return false;
        }
        plane = this.left;
        _vector.x = plane.normal.x > 0 ? box.max.x : box.min.x;
        _vector.y = plane.normal.y > 0 ? box.max.y : box.min.y;
        _vector.z = plane.normal.z > 0 ? box.max.z : box.min.z;
        if (plane.distanceToPoint(_vector) < 0) {
            return false;
        }
        plane = this.top;
        _vector.x = plane.normal.x > 0 ? box.max.x : box.min.x;
        _vector.y = plane.normal.y > 0 ? box.max.y : box.min.y;
        _vector.z = plane.normal.z > 0 ? box.max.z : box.min.z;
        if (plane.distanceToPoint(_vector) < 0) {
            return false;
        }
        plane = this.bottom;
        _vector.x = plane.normal.x > 0 ? box.max.x : box.min.x;
        _vector.y = plane.normal.y > 0 ? box.max.y : box.min.y;
        _vector.z = plane.normal.z > 0 ? box.max.z : box.min.z;
        if (plane.distanceToPoint(_vector) < 0) {
            return false;
        }
        plane = this.near;
        _vector.x = plane.normal.x > 0 ? box.max.x : box.min.x;
        _vector.y = plane.normal.y > 0 ? box.max.y : box.min.y;
        _vector.z = plane.normal.z > 0 ? box.max.z : box.min.z;
        if (plane.distanceToPoint(_vector) < 0) {
            return false;
        }
        plane = this.far;
        _vector.x = plane.normal.x > 0 ? box.max.x : box.min.x;
        _vector.y = plane.normal.y > 0 ? box.max.y : box.min.y;
        _vector.z = plane.normal.z > 0 ? box.max.z : box.min.z;
        if (plane.distanceToPoint(_vector) < 0) {
            return false;
        }
        return true;
    }
    containsPoint(point) {
        if (this.right.distanceToPoint(point) < 0) {
            return false;
        }
        if (this.left.distanceToPoint(point) < 0) {
            return false;
        }
        if (this.top.distanceToPoint(point) < 0) {
            return false;
        }
        if (this.bottom.distanceToPoint(point) < 0) {
            return false;
        }
        if (this.near.distanceToPoint(point) < 0) {
            return false;
        }
        if (this.far.distanceToPoint(point) < 0) {
            return false;
        }
        return true;
    }
    set(right, left, top, bottom, near, far) {
        this.right.from(right);
        this.left.from(left);
        this.top.from(top);
        this.bottom.from(bottom);
        this.near.from(near);
        this.far.from(far);
        return this;
    }
}

class Rectangle2 {
    static area = (a) => {
        return (a.max[0] - a.min[0]) * (a.max[1] - a.min[1]);
    };
    static containsPoint = (rect, a) => {
        return (a[0] >= rect.min[0] && a[0] <= rect.max[0] && a[1] >= rect.min[1] && a[1] <= rect.max[1]);
    };
    static containsRectangle = (rect, box) => {
        return (rect.min[0] <= box.min[0] &&
            box.max[0] <= rect.max[0] &&
            rect.min[1] <= box.min[1] &&
            box.max[1] <= rect.max[1]);
    };
    static create = (a = Vector2.VECTOR2_ZERO, b = Vector2.VECTOR2_ONE) => {
        return new Rectangle2(a, b);
    };
    static equals = (a, b) => {
        return Vector2.equals(a.min, b.min) && Vector2.equals(a.max, b.max);
    };
    static getCenter = (a, out = Vector2.create()) => {
        Vector2.add(a.min, a.max, out);
        return Vector2.multiplyScalar(out, 0.5, out);
    };
    static getSize = (a, out = Vector2.create()) => {
        return Vector2.minus(a.max, a.min, out);
    };
    static height = (a) => {
        return a.max[1] - a.min[1];
    };
    static intersect = (a, b, out = new Rectangle2()) => {
        Vector2.max(a.min, b.min, out.min);
        Vector2.min(a.max, b.max, out.max);
        return out;
    };
    static stretch = (a, b, c, out = new Rectangle2()) => {
        Vector2.add(a.min, b, out.min);
        Vector2.add(a.max, c, out.max);
        return out;
    };
    static translate = (a, b, out = new Rectangle2()) => {
        Vector2.add(a.min, b, out.min);
        Vector2.add(a.max, b, out.max);
        return out;
    };
    static union = (a, b, out = new Rectangle2()) => {
        Vector2.min(a.min, b.min, out.min);
        Vector2.max(a.max, b.max, out.max);
        return out;
    };
    static width = (a) => {
        return a.max[0] - a.min[0];
    };
    min = new Vector2();
    max = new Vector2();
    constructor(a = Vector2.VECTOR2_ZERO, b = Vector2.VECTOR2_ONE) {
        Vector2.min(a, b, this.min);
        Vector2.max(a, b, this.max);
    }
}

let r = 0;
class Sphere {
    static boundingBox = (a, out = new Cube()) => {
        Vector3.minusScalar(a.position, a.radius, out.min);
        Vector3.addScalar(a.position, a.radius, out.max);
        return out;
    };
    static containsPoint = (a, b) => {
        return Vector3.distanceToSquared(a.position, b) <= a.radius * a.radius;
    };
    static distanceToPoint = (a, b) => {
        return Vector3.distanceTo(a.position, b) - a.radius;
    };
    static equals = (a, b) => {
        return Vector3.equals(a.position, b.position) && a.radius === b.radius;
    };
    static intersectsSphere = (a, b) => {
        r = a.radius + b.radius;
        return Vector3.distanceToSquared(a.position, b.position) <= r * r;
    };
    position = new Vector3();
    radius;
    constructor(position = Vector3.VECTOR3_ZERO, radius = 1) {
        this.position.set(position);
        this.radius = radius;
    }
}

const ab$1 = new Vector2();
const bc$1 = new Vector2();
class Triangle2 {
    static area = (t) => {
        const c = Triangle2.getABLength(t);
        const a = Triangle2.getBCLength(t);
        const b = Triangle2.getCALength(t);
        const p = (c + a + b) / 2;
        return Math.sqrt(p * (p - a) * (p - b) * (p - c));
    };
    static create = (a = new Vector2(-1, -1), b = new Vector2(1, -1), c = new Vector2(0, 1)) => {
        return new Triangle2(a, b, c);
    };
    static getABLength = (t) => {
        return Vector2.distanceTo(t.a, t.b);
    };
    static getBCLength = (t) => {
        return Vector2.distanceTo(t.b, t.c);
    };
    static getCALength = (t) => {
        return Vector2.distanceTo(t.c, t.a);
    };
    static normal = (t) => {
        Vector2.minus(t.c, t.b, bc$1);
        Vector2.minus(t.b, t.a, ab$1);
        const v = Vector2.cross(ab$1, bc$1);
        if (v > 0) {
            return 1;
        }
        if (v < 0) {
            return -1;
        }
        return 0;
    };
    static toFloat32Array = (t, out = new Float32Array(2)) => {
        out.set(t.a, 0);
        out.set(t.b, 2);
        out.set(t.c, 4);
        return out;
    };
    a;
    b;
    c;
    constructor(a = new Vector2(-1, -1), b = new Vector2(1, -1), c = new Vector2(0, 1)) {
        this.a = a;
        this.b = b;
        this.c = c;
    }
}

const ab = new Vector3();
const bc = new Vector3();
class Triangle3 {
    static area = (t) => {
        const c = Triangle3.getABLength(t);
        const a = Triangle3.getBCLength(t);
        const b = Triangle3.getCALength(t);
        const p = (c + a + b) / 2;
        return Math.sqrt(p * (p - a) * (p - b) * (p - c));
    };
    static create = (a = new Vector3(-1, -1, 0), b = new Vector3(1, -1, 0), c = new Vector3(0, 1, 0)) => {
        return { a, b, c };
    };
    static getABLength = (t) => {
        return Vector3.distanceTo(t.a, t.b);
    };
    static getBCLength = (t) => {
        return Vector3.distanceTo(t.b, t.c);
    };
    static getCALength = (t) => {
        return Vector3.distanceTo(t.c, t.a);
    };
    static normal = (t, out = Vector3.create()) => {
        Vector3.minus(t.c, t.b, bc);
        Vector3.minus(t.b, t.a, ab);
        Vector3.cross(ab, bc, out);
        return Vector3.normalize(out);
    };
    static toFloat32Array = (t, out = new Float32Array(9)) => {
        out.set(t.a, 0);
        out.set(t.b, 3);
        out.set(t.c, 6);
        return out;
    };
    a;
    b;
    c;
    constructor(a = new Vector3(-1, -1, 0), b = new Vector3(1, -1, 0), c = new Vector3(0, 1, 0)) {
        this.a = a;
        this.b = b;
        this.c = c;
    }
}

class Spherical extends Float32Array {
    static fromArray(arr, out = new Spherical) {
        out.set(arr);
        return out;
    }
    static fromVector3(v, out = new Spherical) {
        const x = v[0];
        const y = v[1];
        const z = v[2];
        out[0] = Math.sqrt(x * x + y * y + z * z);
        if (out[0] === 0) {
            out[1] = 0;
            out[2] = 0;
        }
        else {
            out[1] = Math.acos(clamp(y / out[0], -1, 1));
            out[2] = Math.atan2(x, z);
        }
        return out;
    }
    dataType = ArraybufferDataType.SPHERICAL;
    constructor(radius = 1, phi = 0, theta = 0) {
        super(3);
        this[0] = radius;
        this[1] = phi;
        this[2] = theta;
        return this;
    }
    get radius() {
        return this[0];
    }
    set radius(value) {
        this[0] = value;
    }
    get phi() {
        return this[1];
    }
    set phi(value) {
        this[1] = value;
    }
    get theta() {
        return this[2];
    }
    set theta(value) {
        this[2] = value;
    }
    fromArray(arr) {
        return Spherical.fromArray(arr, this);
    }
    toVector3(out = new Vector3()) {
        const rst = this[0] * Math.sin(this[2]);
        out[2] = rst * Math.cos(this[1]);
        out[0] = rst * Math.sin(this[1]);
        out[1] = this[0] * Math.cos(this[2]);
        return out;
    }
}

// const S4 = () => {
// 	return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
// };
/**
 * @class
 * @classdesc 数字id生成器，用于生成递增id
 * @param {number} [initValue = 0] 从几开始生成递增id
 * @implements IdGenerator.IIncreaser
 */
class IdGenerator {
    initValue;
    #value;
    /**
     * @member IdGenerator.initValue
     * @desc id从该值开始递增，在创建实例时进行设置。设置之后将无法修改。
     * @readonly
     * @public
     */
    constructor(initValue = 0) {
        this.#value = this.initValue = initValue;
    }
    /**
     * @method IdGenerator.prototype.current
     * @desc 返回当前的id
     * @readonly
     * @public
     * @returns {number} id
     */
    current() {
        return this.#value;
    }
    jumpTo(value) {
        if (this.#value < value) {
            this.#value = value;
            return true;
        }
        return false;
    }
    /**
     * @method IdGenerator.prototype.next
     * @desc 生成新的id
     * @public
     * @returns {number} id
     */
    next() {
        return ++this.#value;
    }
    /**
     * @method IdGenerator.prototype.skip
     * @desc 跳过一段值生成新的id
     * @public
     * @param {number} [value = 1] 跳过的范围，必须大于等于1
     * @returns {number} id
     */
    skip(value = 1) {
        this.#value += Math.min(1, value);
        return ++this.#value;
    }
    /**
     * @method IdGenerator.prototype.skip
     * @desc 生成新的32位uuid
     * @public
     * @returns {string} uuid
     */
    uuid() {
        // if (crypto.randomUUID) {
        // 	return (crypto as any).randomUUID();
        // } else {
        // 	return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
        // }
        return crypto.randomUUID();
    }
    /**
     * @method IdGenerator.prototype.skip
     * @desc 生成新的32位BigInt
     * @public
     * @returns {BigInt} uuid
     */
    uuidBigInt() {
        // return bi4(7) + bi4(6) + bi4(5) + bi4(4) + bi4(3) + bi4(2) + bi4(1) + bi4(0);
        const arr = crypto.getRandomValues(new Uint16Array(8));
        return (BigInt(arr[0]) * 65536n * 65536n * 65536n * 65536n * 65536n * 65536n * 65536n +
            BigInt(arr[1]) * 65536n * 65536n * 65536n * 65536n * 65536n * 65536n +
            BigInt(arr[2]) * 65536n * 65536n * 65536n * 65536n * 65536n +
            BigInt(arr[3]) * 65536n * 65536n * 65536n * 65536n +
            BigInt(arr[4]) * 65536n * 65536n * 65536n +
            BigInt(arr[5]) * 65536n * 65536n +
            BigInt(arr[6]) * 65536n +
            BigInt(arr[6]));
    }
}

const FIND_LEAVES_VISITOR$1 = {
    enter: (node, result) => {
        if (!node.children.length) {
            result.push(node);
        }
    }
};
const ARRAY_VISITOR$1 = {
    enter: (node, result) => {
        result.push(node);
    }
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const mixin$1 = (Base = Object) => {
    return class TreeNode extends Base {
        static mixin = mixin$1;
        static addChild(node, child) {
            if (TreeNode.hasAncestor(node, child)) {
                throw new Error("The node added is one of the ancestors of current one.");
            }
            node.children.push(child);
            child.parent = node;
            return node;
        }
        static depth(node) {
            if (!node.children.length) {
                return 1;
            }
            else {
                const childrenDepth = [];
                for (const item of node.children) {
                    item && childrenDepth.push(this.depth(item));
                }
                let max = 0;
                for (const item of childrenDepth) {
                    max = Math.max(max, item);
                }
                return 1 + max;
            }
        }
        static findLeaves(node) {
            const result = [];
            TreeNode.traverse(node, FIND_LEAVES_VISITOR$1, result);
            return result;
        }
        static findRoot(node) {
            if (node.parent) {
                return this.findRoot(node.parent);
            }
            return node;
        }
        static hasAncestor(node, ancestor) {
            if (!node.parent) {
                return false;
            }
            else {
                if (node.parent === ancestor) {
                    return true;
                }
                else {
                    return TreeNode.hasAncestor(node.parent, ancestor);
                }
            }
        }
        static removeChild(node, child) {
            if (node.children.includes(child)) {
                node.children.splice(node.children.indexOf(child), 1);
                child.parent = null;
            }
            return node;
        }
        static toArray(node) {
            const result = [];
            TreeNode.traverse(node, ARRAY_VISITOR$1, result);
            return result;
        }
        static traverse(node, visitor, rest) {
            visitor.enter?.(node, rest);
            visitor.visit?.(node, rest);
            for (const item of node.children) {
                item && TreeNode.traverse(item, visitor, rest);
            }
            visitor.leave?.(node, rest);
            return node;
        }
        parent = null;
        children = [];
        addChild(node) {
            return TreeNode.addChild(this, node);
        }
        depth() {
            return TreeNode.depth(this);
        }
        findLeaves() {
            return TreeNode.findLeaves(this);
        }
        findRoot() {
            return TreeNode.findRoot(this);
        }
        hasAncestor(ancestor) {
            return TreeNode.hasAncestor(this, ancestor);
        }
        removeChild(child) {
            return TreeNode.removeChild(this, child);
        }
        toArray() {
            return TreeNode.toArray(this);
        }
        traverse(visitor, rest) {
            return TreeNode.traverse(this, visitor, rest);
        }
    };
};
var TreeNode$1 = mixin$1(Object);

const IdGeneratorInstance = new IdGenerator();

let weakMapTmp;
class System extends EventFirer {
    id = IdGeneratorInstance.next();
    isSystem = true;
    name = "";
    loopTimes = 0;
    entitySet = new WeakMap();
    usedBy = [];
    cache = new WeakMap();
    autoUpdate = true;
    rule;
    _disabled = false;
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = value;
    }
    constructor(name = "", fitRule) {
        super();
        this.name = name;
        this.disabled = false;
        this.rule = fitRule;
    }
    checkUpdatedEntities(manager) {
        if (manager) {
            weakMapTmp = this.entitySet.get(manager);
            if (!weakMapTmp) {
                weakMapTmp = new Set();
                this.entitySet.set(manager, weakMapTmp);
            }
            manager.updatedEntities.forEach((item) => {
                if (this.query(item)) {
                    weakMapTmp.add(item);
                }
                else {
                    weakMapTmp.delete(item);
                }
            });
        }
        return this;
    }
    checkEntityManager(manager) {
        if (manager) {
            weakMapTmp = this.entitySet.get(manager);
            if (!weakMapTmp) {
                weakMapTmp = new Set();
                this.entitySet.set(manager, weakMapTmp);
            }
            else {
                weakMapTmp.clear();
            }
            manager.elements.forEach((item) => {
                if (this.query(item)) {
                    weakMapTmp.add(item);
                }
                else {
                    weakMapTmp.delete(item);
                }
            });
        }
        return this;
    }
    query(entity) {
        return this.rule(entity);
    }
    run(world, time, delta) {
        if (this.disabled) {
            return this;
        }
        if (world.entityManager) {
            this.entitySet.get(world.entityManager)?.forEach((item) => {
                // 此处不应该校验disabled。这个交给各自系统自行判断
                this.handle(item, time, delta, world);
            });
        }
        return this;
    }
    serialize() {
        return {};
    }
    destroy() {
        for (let i = this.usedBy.length - 1; i > -1; i--) {
            this.usedBy[i].remove(this);
        }
        return this;
    }
}

class PureSystem extends System {
    handler;
    constructor(name = "", fitRule, handler) {
        super(name, fitRule);
        this.handler = handler;
    }
    handle(entity, time, delta) {
        this.handler(entity, time, delta);
        return this;
    }
}

class Component {
    static unserialize(json) {
        const component = new Component(json.name, json.data);
        component.disabled = json.disabled;
        return component;
    }
    isComponent = true;
    id = IdGeneratorInstance.next();
    data;
    disabled = false;
    name;
    usedBy = [];
    tags;
    #dirty = false;
    get dirty() {
        return this.#dirty;
    }
    set dirty(v) {
        this.#dirty = v;
    }
    constructor(name, data, tags = []) {
        this.name = name;
        this.data = data;
        this.tags = tags;
    }
    clone() {
        return new Component(this.name, this.data, this.tags);
    }
    // 此处为只要tag标签相同就是同一类
    hasTagLabel(label) {
        for (let i = this.tags.length - 1; i > -1; i--) {
            if (this.tags[i].label === label) {
                return true;
            }
        }
        return false;
    }
    serialize() {
        return {
            data: this.data,
            disabled: this.disabled,
            id: this.id,
            name: this.name,
            tags: this.tags,
            type: "component",
        };
    }
}

// 私有全局变量，外部无法访问
let elementTmp;
const ElementChangeEvent = {
    ADD: "add",
    REMOVE: "remove",
};
class Manager extends EventFirer {
    static Events = ElementChangeEvent;
    elements = new Map();
    disabled = false;
    usedBy = [];
    isManager = true;
    add(element) {
        if (this.has(element)) {
            return this;
        }
        return this.addElementDirectly(element);
    }
    clear() {
        this.elements.clear();
        return this;
    }
    get(name) {
        if (typeof name === "number") {
            return this.elements.get(name) || null;
        }
        if (typeof name === "function" && name.prototype) {
            for (const [, item] of this.elements) {
                if (item instanceof name) {
                    return item;
                }
            }
        }
        for (const [, item] of this.elements) {
            if (item.name === name) {
                return item;
            }
        }
        return null;
    }
    has(element) {
        if (typeof element === "number") {
            return this.elements.has(element);
        }
        else if (typeof element === "string") {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for (const [_, item] of this.elements) {
                if (item.name === element) {
                    return true;
                }
            }
            return false;
        }
        else {
            return this.elements.has(element.id);
        }
    }
    remove(element) {
        if (typeof element === "number" || typeof element === "string") {
            elementTmp = this.get(element);
            if (elementTmp) {
                this.removeInstanceDirectly(elementTmp);
            }
            return this;
        }
        if (this.elements.has(element.id)) {
            return this.removeInstanceDirectly(element);
        }
        return this;
    }
    addElementDirectly(element) {
        this.elements.set(element.id, element);
        element.usedBy.push(this);
        this.elementChangedFireEvent(Manager.Events.ADD, this);
        return this;
    }
    // 必定有element情况
    removeInstanceDirectly(element) {
        this.elements.delete(element.id);
        element.usedBy.splice(element.usedBy.indexOf(this), 1);
        this.elementChangedFireEvent(Manager.Events.REMOVE, this);
        return this;
    }
    elementChangedFireEvent(type, eventObject) {
        for (const entity of this.usedBy) {
            entity.fire?.(type, eventObject);
            if (entity.usedBy) {
                for (const manager of entity.usedBy) {
                    manager.updatedEntities.add(entity);
                }
            }
        }
    }
}

var EComponentEvent;
(function (EComponentEvent) {
    EComponentEvent["ADD_COMPONENT"] = "addComponent";
    EComponentEvent["REMOVE_COMPONENT"] = "removeComponent";
})(EComponentEvent || (EComponentEvent = {}));
class ComponentManager extends Manager {
    isComponentManager = true;
    add(element) {
        if (this.has(element)) {
            return this;
        }
        const componentSet = this.checkedComponentsWithTargetTags(element);
        for (const item of componentSet) {
            this.removeInstanceDirectly(item);
        }
        return this.addElementDirectly(element);
    }
    getComponentsByClass(clazz) {
        const result = [];
        this.elements.forEach((component) => {
            if (component instanceof clazz) {
                result.push(component);
            }
        });
        return result;
    }
    getComponentByClass(clazz) {
        for (const [, component] of this.elements) {
            if (component instanceof clazz) {
                return component;
            }
        }
        return null;
    }
    getComponentsByTagLabel(label) {
        const result = [];
        this.elements.forEach((component) => {
            if (component.hasTagLabel(label)) {
                result.push(component);
            }
        });
        return result;
    }
    getComponentByTagLabel(label) {
        for (const [, component] of this.elements) {
            if (component.hasTagLabel(label)) {
                return component;
            }
        }
        return null;
    }
    // 找到所有含目标组件唯一标签一致的组件。只要有任意1个标签符合就行。此处规定名称一致的tag，unique也必须是一致的。且不可修改
    checkedComponentsWithTargetTags(component) {
        const result = new Set();
        let arr;
        for (let i = component.tags.length - 1; i > -1; i--) {
            if (component.tags[i].unique) {
                arr = this.getComponentsByTagLabel(component.tags[i].label);
                if (arr.length) {
                    for (let j = arr.length - 1; j > -1; j--) {
                        result.add(arr[j]);
                    }
                }
            }
        }
        return result;
    }
}

let arr$1;
class Entity extends TreeNode$1.mixin(EventFirer) {
    id = IdGeneratorInstance.next();
    isEntity = true;
    componentManager = null;
    disabled = false;
    name = "";
    usedBy = [];
    constructor(name = "", componentManager) {
        super();
        this.name = name;
        this.registerComponentManager(componentManager);
    }
    addComponent(component) {
        if (this.componentManager) {
            this.componentManager.add(component);
        }
        else {
            throw new Error("Current entity hasn't registered a component manager yet.");
        }
        return this;
    }
    addChild(entity) {
        super.addChild(entity);
        if (this.usedBy) {
            for (const manager of this.usedBy) {
                manager.add(entity);
            }
        }
        return this;
    }
    addTo(manager) {
        manager.add(this);
        return this;
    }
    addToWorld(world) {
        if (world.entityManager) {
            world.entityManager.add(this);
        }
        return this;
    }
    destroy() {
        for (const manager of this.usedBy) {
            manager.remove(this);
        }
        this.unregisterComponentManager();
    }
    getComponent(nameOrId) {
        return this.componentManager?.get(nameOrId) || null;
    }
    getComponentsByTagLabel(label) {
        return this.componentManager?.getComponentsByTagLabel(label) || [];
    }
    getComponentByTagLabel(label) {
        return this.componentManager?.getComponentByTagLabel(label) || null;
    }
    getComponentsByClass(clazz) {
        return this.componentManager?.getComponentsByClass(clazz) || [];
    }
    getComponentByClass(clazz) {
        return this.componentManager?.getComponentByClass(clazz) || null;
    }
    hasComponent(component) {
        return this.componentManager?.has(component) || false;
    }
    registerComponentManager(manager = new ComponentManager()) {
        this.unregisterComponentManager();
        this.componentManager = manager;
        if (!this.componentManager.usedBy.includes(this)) {
            this.componentManager.usedBy.push(this);
        }
        return this;
    }
    removeChild(entity) {
        super.removeChild(entity);
        if (this.usedBy) {
            for (const manager of this.usedBy) {
                manager.remove(entity);
            }
        }
        return this;
    }
    removeComponent(component) {
        if (this.componentManager) {
            this.componentManager.remove(component);
        }
        return this;
    }
    serialize() {
        return {};
    }
    unregisterComponentManager() {
        if (this.componentManager) {
            arr$1 = this.componentManager.usedBy;
            arr$1.splice(arr$1.indexOf(this) - 1, 1);
            this.componentManager = null;
        }
        return this;
    }
}

class EntityManager extends Manager {
    // public elements: Map<string, IEntity> = new Map();
    data = null;
    updatedEntities = new Set();
    isEntityManager = true;
    constructor(world) {
        super();
        if (world) {
            this.usedBy.push(world);
        }
    }
    createEntity(name) {
        const entity = new Entity(name);
        this.add(entity);
        return entity;
    }
    addElementDirectly(entity) {
        super.addElementDirectly(entity);
        this.updatedEntities.add(entity);
        for (const child of entity.children) {
            if (child) {
                this.add(child);
            }
        }
        return this;
    }
    removeInstanceDirectly(entity) {
        super.removeInstanceDirectly(entity);
        this.deleteEntityFromSystemSet(entity);
        for (const child of entity.children) {
            if (child) {
                this.remove(child);
            }
        }
        return this;
    }
    deleteEntityFromSystemSet(entity) {
        entity.usedBy.splice(entity.usedBy.indexOf(this), 1);
        for (const world of this.usedBy) {
            if (world.systemManager) {
                world.systemManager.elements.forEach((system) => {
                    if (system.entitySet.get(this)) {
                        system.entitySet.get(this).delete(entity);
                    }
                });
            }
        }
    }
}

let systemTmp;
const SystemEvent = {
    ADD: "add",
    AFTER_RUN: "afterRun",
    BEFORE_RUN: "beforeRun",
    REMOVE: "remove",
};
class SystemManager extends Manager {
    static Events = SystemEvent;
    disabled = false;
    elements = new Map();
    loopTimes = 0;
    usedBy = [];
    constructor(world) {
        super();
        if (world) {
            this.usedBy.push(world);
        }
    }
    add(system) {
        super.add(system);
        this.updateSystemEntitySetByAddFromManager(system);
        return this;
    }
    clear() {
        this.elements.clear();
        return this;
    }
    remove(element) {
        if (typeof element === "number" || typeof element === "string") {
            systemTmp = this.get(element);
            if (systemTmp) {
                this.removeInstanceDirectly(systemTmp);
                this.updateSystemEntitySetByRemovedFromManager(systemTmp);
                systemTmp.usedBy.splice(systemTmp.usedBy.indexOf(this), 1);
            }
            return this;
        }
        if (this.elements.has(element.id)) {
            this.removeInstanceDirectly(element);
            this.updateSystemEntitySetByRemovedFromManager(element);
            element.usedBy.splice(element.usedBy.indexOf(this), 1);
        }
        return this;
    }
    run(world, time, delta) {
        this.fire(SystemManager.Events.BEFORE_RUN, this);
        this.elements.forEach((item) => {
            item.checkUpdatedEntities(world.entityManager);
            if (!item.disabled && item.autoUpdate) {
                item.run(world, time, delta);
            }
        });
        if (world.entityManager) {
            world.entityManager.updatedEntities.clear();
        }
        this.loopTimes++;
        this.fire(SystemManager.Events.BEFORE_RUN, this);
        return this;
    }
    updateSystemEntitySetByRemovedFromManager(system) {
        for (const item of this.usedBy) {
            if (item.entityManager) {
                system.entitySet.delete(item.entityManager);
            }
        }
        return this;
    }
    updateSystemEntitySetByAddFromManager(system) {
        for (const item of this.usedBy) {
            if (item.entityManager) {
                system.checkEntityManager(item.entityManager);
            }
        }
        return this;
    }
}

let arr;
class World extends EventFirer {
    disabled = false;
    name;
    entityManager = null;
    systemManager = null;
    store = new Map();
    usedBy = [];
    id = IdGeneratorInstance.next();
    isWorld = true;
    constructor(name = "", entityManager, systemManager) {
        super();
        this.name = name;
        this.registerEntityManager(entityManager);
        this.registerSystemManager(systemManager);
    }
    add(element) {
        if (element.isEntity) {
            return this.addEntity(element);
        }
        else {
            return this.addSystem(element);
        }
    }
    addEntity(entity) {
        if (this.entityManager) {
            this.entityManager.add(entity);
        }
        else {
            throw new Error("The world doesn't have an entityManager yet.");
        }
        return this;
    }
    addSystem(system) {
        if (this.systemManager) {
            this.systemManager.add(system);
        }
        else {
            throw new Error("The world doesn't have a systemManager yet.");
        }
        return this;
    }
    clearAllEntities() {
        if (this.entityManager) {
            this.entityManager.clear();
        }
        return this;
    }
    createEntity(name) {
        return this.entityManager?.createEntity(name) || null;
    }
    hasEntity(entity) {
        if (this.entityManager) {
            return this.entityManager.has(entity);
        }
        return false;
    }
    hasSystem(system) {
        if (this.systemManager) {
            return this.systemManager.has(system);
        }
        return false;
    }
    registerEntityManager(manager) {
        this.unregisterEntityManager();
        this.entityManager = manager || new EntityManager(this);
        if (!this.entityManager.usedBy.includes(this)) {
            this.entityManager.usedBy.push(this);
        }
        return this;
    }
    registerSystemManager(manager) {
        this.unregisterSystemManager();
        this.systemManager = manager || new SystemManager(this);
        if (!this.systemManager.usedBy.includes(this)) {
            this.systemManager.usedBy.push(this);
        }
        return this;
    }
    remove(element) {
        if (element.isEntity) {
            return this.removeEntity(element);
        }
        else {
            return this.removeSystem(element);
        }
    }
    removeEntity(entity) {
        if (this.entityManager) {
            this.entityManager.remove(entity);
        }
        return this;
    }
    removeSystem(system) {
        if (this.systemManager) {
            this.systemManager.remove(system);
        }
        return this;
    }
    run(time, delta) {
        if (this.disabled) {
            return this;
        }
        if (this.systemManager) {
            this.systemManager.run(this, time, delta);
        }
        return this;
    }
    serialize() {
        return {
            id: this.id,
            name: this.name,
            type: "world",
        };
    }
    unregisterEntityManager() {
        if (this.entityManager) {
            arr = this.entityManager.usedBy;
            arr.splice(arr.indexOf(this) - 1, 1);
            this.entityManager = null;
        }
        return this;
    }
    unregisterSystemManager() {
        if (this.systemManager) {
            arr = this.systemManager.usedBy;
            arr.splice(arr.indexOf(this) - 1, 1);
            this.entityManager = null;
        }
        return this;
    }
}

// component type
const ANCHOR_2D = "anchor2";
const ANCHOR_3D = "anchor3";
const GEOMETRY = "geometry";
const MATERIAL = "material";
const MESH2 = "mesh2";
const MESH3 = "mesh3";
const SPRITE3 = "sprite3";
const MODEL_2D = "model2";
const MODEL_3D = "model3";
const PROJECTION_2D = "projection2";
const PROJECTION_3D = "projection3";
const RENDERABLE = "renderable";
const ROTATION_2D = "rotation2";
const ROTATION_3D = "rotation3";
const SCALING_2D = "scale2";
const SCALING_3D = "scale3";
const TRANSLATION_2D = "position2";
const TRANSLATION_3D = "position3";
const WORLD_MATRIX3 = "world-matrix3";
const WORLD_MATRIX4 = "world-matrix4";
const VIEWING_3D = "viewing3";
// uniform type
const SAMPLER = "sampler";
const BUFFER = "buffer";
const TEXTURE_IMAGE = "texture-image";
const TEXTURE_GPU = "texture-gpu";

var constants$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	ANCHOR_2D: ANCHOR_2D,
	ANCHOR_3D: ANCHOR_3D,
	BUFFER: BUFFER,
	GEOMETRY: GEOMETRY,
	MATERIAL: MATERIAL,
	MESH2: MESH2,
	MESH3: MESH3,
	MODEL_2D: MODEL_2D,
	MODEL_3D: MODEL_3D,
	PROJECTION_2D: PROJECTION_2D,
	PROJECTION_3D: PROJECTION_3D,
	RENDERABLE: RENDERABLE,
	ROTATION_2D: ROTATION_2D,
	ROTATION_3D: ROTATION_3D,
	SAMPLER: SAMPLER,
	SCALING_2D: SCALING_2D,
	SCALING_3D: SCALING_3D,
	SPRITE3: SPRITE3,
	TEXTURE_GPU: TEXTURE_GPU,
	TEXTURE_IMAGE: TEXTURE_IMAGE,
	TRANSLATION_2D: TRANSLATION_2D,
	TRANSLATION_3D: TRANSLATION_3D,
	VIEWING_3D: VIEWING_3D,
	WORLD_MATRIX3: WORLD_MATRIX3,
	WORLD_MATRIX4: WORLD_MATRIX4
});

class Matrix3Component extends Component {
    constructor(name, data = Matrix3.create(), tags = []) {
        super(name, data, tags);
        this.dirty = true;
    }
}
const updateModelMatrixComponent$1 = (mesh) => {
    let p3 = mesh.position;
    let r3 = mesh.rotation;
    let s3 = mesh.scaling;
    let a3 = mesh.anchor;
    let m3 = mesh.modelMatrix;
    let worldMatrix = mesh.worldMatrix;
    if (p3?.dirty || r3?.dirty || s3?.dirty || a3?.dirty) {
        Matrix3.fromArray(p3?.data || Matrix3.UNIT_MATRIX3, m3.data);
        if (r3) {
            Matrix3.multiplyRotationMatrix(m3.data, r3.data, m3.data);
        }
        if (s3) {
            Matrix3.multiplyScaleMatrix(m3.data, s3.data, m3.data);
        }
        if (a3) {
            Matrix3.multiplyTranslateMatrix(m3.data, a3.data, m3.data);
        }
        if (p3) {
            p3.dirty = false;
        }
        if (r3) {
            r3.dirty = false;
        }
        if (s3) {
            s3.dirty = false;
        }
        if (a3) {
            a3.dirty = false;
        }
    }
    if (mesh.parent) {
        let parentWorldMatrix = mesh.parent.worldMatrix?.data ?? Matrix3.UNIT_MATRIX3;
        Matrix3.multiply(parentWorldMatrix, m3.data, worldMatrix.data);
    }
    else {
        Matrix3.fromArray(m3.data, worldMatrix.data);
    }
    return m3;
};

class Anchor2 extends Matrix3Component {
    vec2 = new Vector2();
    constructor(vec = Vector2.VECTOR2_ZERO) {
        super(ANCHOR_2D, Matrix3.create(), [{
                label: ANCHOR_2D,
                unique: true
            }]);
        Vector2.fromArray(vec, 0, this.vec2);
        this.update();
    }
    get x() {
        return this.vec2[0];
    }
    set x(value) {
        this.vec2[0] = value;
        this.data[6] = -value;
        this.dirty = true;
    }
    get y() {
        return this.vec2[1];
    }
    set y(value) {
        this.vec2[1] = value;
        this.data[7] = -value;
        this.dirty = true;
    }
    set(arr) {
        this.vec2.set(arr);
        return this.update();
    }
    setXY(x, y, z) {
        this.vec2[0] = x;
        this.vec2[1] = y;
        return this.update();
    }
    update() {
        this.data[6] = -this.x;
        this.data[7] = -this.y;
        this.dirty = true;
        return this;
    }
}

class APosition2 extends Matrix3Component {
    constructor(data = Matrix3.create()) {
        super(TRANSLATION_2D, data, [{
                label: TRANSLATION_2D,
                unique: true
            }]);
    }
}

class AProjection2 extends Matrix3Component {
    constructor(data = Matrix3.create()) {
        super(PROJECTION_2D, data, [{
                label: PROJECTION_2D,
                unique: true
            }]);
    }
}

class ARotation2 extends Matrix3Component {
    constructor(data = Matrix3.create()) {
        super(ROTATION_2D, data, [{
                label: ROTATION_2D,
                unique: true
            }]);
    }
}

class AScale2 extends Matrix3Component {
    constructor(data = Matrix3.create()) {
        super(SCALING_2D, data, [{
                label: SCALING_2D,
                unique: true
            }]);
    }
}

class EuclidPosition2 extends APosition2 {
    vec2 = new Vector2();
    constructor(vec2 = new Float32Array(2)) {
        super();
        Vector2.fromArray(vec2, 0, this.vec2);
        this.update();
    }
    get x() {
        return this.vec2[0];
    }
    set x(value) {
        this.vec2[0] = value;
        this.data[6] = value;
        this.dirty = true;
    }
    get y() {
        return this.vec2[1];
    }
    set y(value) {
        this.vec2[1] = value;
        this.data[7] = value;
        this.dirty = true;
    }
    set(arr) {
        this.vec2.set(arr);
        this.data[6] = arr[0];
        this.data[7] = arr[1];
        this.dirty = true;
        return this;
    }
    setXY(x, y) {
        this.vec2[0] = x;
        this.vec2[1] = y;
        this.data[6] = x;
        this.data[7] = y;
        this.dirty = true;
        return this;
    }
    update() {
        Matrix3.fromTranslation(this.vec2, this.data);
        this.dirty = true;
        return this;
    }
}

class AngleRotation2 extends ARotation2 {
    #angle;
    data = Matrix3.identity();
    constructor(angle = 0) {
        super();
        this.#angle = angle;
        this.update();
    }
    get a() {
        return this.#angle;
    }
    set a(value) {
        this.#angle = value;
        this.update();
    }
    update() {
        Matrix3.fromRotation(this.#angle, this.data);
        this.dirty = true;
        return this;
    }
}

class PolarPosition2 extends APosition2 {
    polar = new Polar();
    constructor(radius = 0, angle = 0) {
        super();
        this.polar.r = radius;
        this.polar.a = angle;
    }
    get r() {
        return this.polar.r;
    }
    set r(value) {
        this.polar.r = value;
        this.update();
    }
    get a() {
        return this.polar[1];
    }
    set a(value) {
        this.polar[1] = value;
        this.update();
    }
    set(r, a) {
        this.polar.a = a;
        this.polar.r = r;
        return this;
    }
    update() {
        this.data[6] = this.polar.x();
        this.data[7] = this.polar.y();
        this.dirty = true;
        return this;
    }
}

class Projection2D extends AProjection2 {
    options;
    constructor(left = -window.innerWidth * 0.005, right = window.innerWidth * 0.005, bottom = -window.innerHeight * 0.005, top = window.innerHeight * 0.005) {
        super();
        this.options = {
            left,
            right,
            bottom,
            top
        };
        this.update();
    }
    get left() {
        return this.options.left;
    }
    set left(value) {
        this.options.left = value;
        this.update();
    }
    get right() {
        return this.right;
    }
    set right(value) {
        this.options.right = value;
        this.update();
    }
    get top() {
        return this.top;
    }
    set top(value) {
        this.options.top = value;
        this.update();
    }
    get bottom() {
        return this.bottom;
    }
    set bottom(value) {
        this.options.bottom = value;
        this.update();
    }
    set(left = this.left, right = this.right, bottom = this.bottom, top = this.top) {
        this.options.left = left;
        this.options.right = right;
        this.options.bottom = bottom;
        this.options.top = top;
        return this.update();
    }
    update() {
        orthogonal(this.options.left, this.options.right, this.options.bottom, this.options.top, this.data);
        this.dirty = true;
        return this;
    }
}
const orthogonal = (left, right, bottom, top, out = new Matrix3()) => {
    const c = 1 / (left - right);
    const b = 1 / (bottom - top);
    out[0] = -2 * c;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = -2 * b;
    out[5] = 0;
    // out[6] = 0;
    // out[7] = 0;
    out[6] = (left + right) * c;
    out[7] = (top + bottom) * b;
    out[8] = 1;
    return out;
};

const DEFAULT_SCALE$1 = [1, 1];
class Vector2Scale2 extends AScale2 {
    vec2;
    constructor(vec2 = new Float32Array(DEFAULT_SCALE$1)) {
        super();
        this.vec2 = vec2;
        this.update();
    }
    get x() {
        return this.vec2[0];
    }
    set x(value) {
        this.vec2[0] = value;
        this.data[0] = value;
        this.dirty = true;
    }
    get y() {
        return this.vec2[1];
    }
    set y(value) {
        this.vec2[1] = value;
        this.data[4] = value;
        this.dirty = true;
    }
    set(arr) {
        this.vec2.set(arr);
        return this.update();
    }
    setXY(x, y, z) {
        this.vec2[0] = x;
        this.vec2[1] = y;
        this.data[0] = x;
        this.data[4] = y;
        this.dirty = true;
        return this;
    }
    update() {
        Matrix3.fromScaling(this.vec2, this.data);
        return this;
    }
}

class Matrix4Component extends Component {
    constructor(name, data = Matrix4.create(), tags = []) {
        super(name, data, tags);
        this.dirty = true;
    }
}
const updateModelMatrixComponent = (mesh) => {
    let p3 = mesh.position;
    let r3 = mesh.rotation;
    let s3 = mesh.scaling;
    let a3 = mesh.anchor;
    let m3 = mesh.modelMatrix;
    let worldMatrix = mesh.worldMatrix;
    if (p3?.dirty || r3?.dirty || s3?.dirty || a3?.dirty) {
        Matrix4.fromArray(p3?.data || Matrix4.UNIT_MATRIX4, m3.data);
        if (r3) {
            Matrix4.multiply(m3.data, r3.data, m3.data);
        }
        if (s3) {
            Matrix4.multiplyScaleMatrix(m3.data, s3.data, m3.data);
        }
        if (a3) {
            Matrix4.multiplyTranslateMatrix(m3.data, a3.data, m3.data);
        }
        if (p3) {
            p3.dirty = false;
        }
        if (r3) {
            r3.dirty = false;
        }
        if (s3) {
            s3.dirty = false;
        }
        if (a3) {
            a3.dirty = false;
        }
    }
    if (mesh.parent) {
        let parentWorldMatrix = mesh.parent.worldMatrix?.data ?? Matrix4.UNIT_MATRIX4;
        Matrix4.multiply(parentWorldMatrix, m3.data, worldMatrix.data);
    }
    else {
        Matrix4.fromArray(m3.data, worldMatrix.data);
    }
    return m3;
};

class Anchor3 extends Matrix4Component {
    vec3 = new Vector3();
    constructor(vec = Vector3.VECTOR3_ZERO) {
        super(ANCHOR_3D, Matrix4.create(), [{
                label: ANCHOR_3D,
                unique: true
            }]);
        Vector3.fromArray(vec, 0, this.vec3);
        this.update();
    }
    get x() {
        return this.vec3[0];
    }
    set x(value) {
        this.vec3[0] = value;
        this.data[12] = -value;
        this.dirty = true;
    }
    get y() {
        return this.vec3[1];
    }
    set y(value) {
        this.vec3[1] = value;
        this.data[13] = -value;
        this.dirty = true;
    }
    get z() {
        return this.vec3[2];
    }
    set z(value) {
        this.vec3[2] = value;
        this.data[14] = -value;
        this.dirty = true;
    }
    set(arr) {
        this.vec3.set(arr);
        return this.update();
    }
    setXYZ(x, y, z) {
        this.vec3[0] = x;
        this.vec3[1] = y;
        this.vec3[2] = z;
        return this.update();
    }
    update() {
        this.data[12] = -this.x;
        this.data[13] = -this.y;
        this.data[14] = -this.z;
        this.dirty = true;
        return this;
    }
}

class APosition3 extends Matrix4Component {
    constructor(data = Matrix4.create()) {
        super(TRANSLATION_3D, data, [{
                label: TRANSLATION_3D,
                unique: true
            }]);
    }
}

class AProjection3 extends Matrix4Component {
    constructor(data = Matrix4.create()) {
        super(PROJECTION_3D, data, [{
                label: PROJECTION_3D,
                unique: true
            }]);
    }
}

class ARotation3 extends Matrix4Component {
    constructor(data = Matrix4.create()) {
        super(ROTATION_3D, data, [{
                label: ROTATION_3D,
                unique: true
            }]);
    }
}

class AScale3 extends Matrix4Component {
    constructor(data = Matrix4.create()) {
        super(SCALING_3D, data, [{
                label: SCALING_3D,
                unique: true
            }]);
    }
}

class EuclidPosition3 extends APosition3 {
    vec3 = new Vector3();
    constructor(vec3) {
        super();
        if (vec3) {
            Vector3.fromArray(vec3, 0, this.vec3);
        }
        this.update();
    }
    get x() {
        return this.vec3[0];
    }
    set x(value) {
        this.vec3[0] = value;
        this.data[12] = value;
        this.dirty = true;
    }
    get y() {
        return this.vec3[1];
    }
    set y(value) {
        this.vec3[1] = value;
        this.data[13] = value;
        this.dirty = true;
    }
    get z() {
        return this.vec3[2];
    }
    set z(value) {
        this.vec3[2] = value;
        this.data[14] = value;
        this.dirty = true;
    }
    set(arr) {
        this.vec3.set(arr);
        this.data[12] = arr[0];
        this.data[13] = arr[1];
        this.data[14] = arr[2];
        this.dirty = true;
        return this;
    }
    setXYZ(x, y, z) {
        this.vec3[0] = x;
        this.vec3[1] = y;
        this.vec3[2] = z;
        this.data[12] = x;
        this.data[13] = y;
        this.data[14] = z;
        this.dirty = true;
        return this;
    }
    update() {
        Matrix4.fromTranslation(this.vec3, this.data);
        this.dirty = true;
        return this;
    }
}

class EulerRotation3 extends ARotation3 {
    euler;
    constructor(euler = {
        x: 0,
        y: 0,
        z: 0,
        order: EulerAngle.ORDERS.XYZ,
    }) {
        super();
        this.euler = euler;
        this.update();
    }
    get x() {
        return this.euler.x;
    }
    set x(value) {
        this.euler.x = value;
        this.update();
    }
    get y() {
        return this.euler.y;
    }
    set y(value) {
        this.euler.y = value;
        this.update();
    }
    get z() {
        return this.euler.z;
    }
    set z(value) {
        this.euler.z = value;
        this.update();
    }
    get order() {
        return this.euler.order;
    }
    set order(value) {
        this.euler.order = value;
        this.update();
    }
    set(arr) {
        this.x = arr.x;
        this.y = arr.y;
        this.z = arr.z;
        this.order = arr.order;
        return this.update();
    }
    update() {
        Matrix4.fromEuler(this.euler, this.data);
        this.dirty = true;
        return this;
    }
}

class OrthogonalProjection extends AProjection3 {
    options;
    constructor(left = -window.innerWidth * 0.005, right = window.innerWidth * 0.005, bottom = -window.innerHeight * 0.005, top = window.innerHeight * 0.005, near = 0.01, far = 100) {
        super();
        this.options = {
            left,
            right,
            bottom,
            top,
            near,
            far,
        };
        this.update();
    }
    get left() {
        return this.options.left;
    }
    set left(value) {
        this.options.left = value;
        this.update();
    }
    get right() {
        return this.options.right;
    }
    set right(value) {
        this.options.right = value;
        this.update();
    }
    get top() {
        return this.options.top;
    }
    set top(value) {
        this.options.top = value;
        this.update();
    }
    get bottom() {
        return this.options.bottom;
    }
    set bottom(value) {
        this.options.bottom = value;
        this.update();
    }
    get near() {
        return this.options.near;
    }
    set near(value) {
        this.options.near = value;
        this.update();
    }
    get far() {
        return this.options.far;
    }
    set far(value) {
        this.options.far = value;
        this.update();
    }
    set(left = this.left, right = this.right, bottom = this.bottom, top = this.top, near = this.near, far = this.far) {
        this.options.left = left;
        this.options.right = right;
        this.options.bottom = bottom;
        this.options.top = top;
        this.options.near = near;
        this.options.far = far;
        return this.update();
    }
    update() {
        Matrix4.orthogonalZ0(this.options.left, this.options.right, this.options.bottom, this.options.top, this.options.near, this.options.far, this.data);
        this.dirty = true;
        return this;
    }
}

class PerspectiveProjection extends AProjection3 {
    options;
    constructor(fovy = Math.PI * 0.25, aspect = window.innerWidth / window.innerHeight, near = 0.01, far = 100) {
        super();
        this.options = {
            fovy,
            aspect,
            near,
            far,
        };
        this.update();
    }
    get fovy() {
        return this.options.fovy;
    }
    set fovy(value) {
        this.options.fovy = value;
        this.update();
    }
    get aspect() {
        return this.options.aspect;
    }
    set aspect(value) {
        this.options.aspect = value;
        this.update();
    }
    get near() {
        return this.options.near;
    }
    set near(value) {
        this.options.near = value;
        this.update();
    }
    get far() {
        return this.options.far;
    }
    set far(value) {
        this.options.far = value;
        this.update();
    }
    set(fovy = this.fovy, aspect = this.aspect, near = this.near, far = this.far) {
        this.options.fovy = fovy;
        this.options.aspect = aspect;
        this.options.near = near;
        this.options.far = far;
        return this.update();
    }
    update() {
        Matrix4.perspectiveZ0(this.options.fovy, this.options.aspect, this.options.near, this.options.far, this.data);
        this.dirty = true;
        return this;
    }
}

class SphericalPosition3 extends APosition3 {
    spherical = new Spherical();
    #vec3 = new Vector3();
    constructor(spherical = new Float32Array(3)) {
        super();
        Spherical.fromArray(spherical, this.spherical);
        this.update();
    }
    get radius() {
        return this.spherical[0];
    }
    set radius(value) {
        this.spherical[0] = value;
        this.update();
    }
    get phi() {
        return this.spherical[1];
    }
    set phi(value) {
        this.spherical[1] = value;
        this.update();
    }
    get theta() {
        return this.spherical[2];
    }
    set theta(value) {
        this.spherical[2] = value;
        this.update();
    }
    set(arr) {
        this.spherical.set(arr);
        return this.update();
    }
    update() {
        this.spherical.toVector3(this.#vec3);
        Matrix4.fromTranslation(this.#vec3, this.data);
        this.dirty = true;
        return this;
    }
}

const DEFAULT_SCALE = [1, 1, 1];
class Vector3Scale3 extends AScale3 {
    vec3;
    constructor(vec3 = new Float32Array(DEFAULT_SCALE)) {
        super();
        this.vec3 = Vector3.fromArray(vec3);
        this.update();
    }
    get x() {
        return this.vec3[0];
    }
    set x(value) {
        this.vec3[0] = value;
        this.data[0] = value;
        this.dirty = true;
    }
    get y() {
        return this.vec3[1];
    }
    set y(value) {
        this.vec3[1] = value;
        this.data[5] = value;
        this.dirty = true;
    }
    get z() {
        return this.vec3[1];
    }
    set z(value) {
        this.vec3[2] = value;
        this.data[10] = value;
        this.dirty = true;
    }
    set(arr) {
        if (typeof arr === 'number') {
            Vector3.fromScalar(arr, this.vec3);
        }
        else {
            this.vec3.set(arr);
        }
        return this.update();
    }
    setXYZ(x, y, z) {
        this.vec3[0] = x;
        this.vec3[1] = y;
        this.vec3[2] = z;
        this.data[0] = x;
        this.data[5] = y;
        this.data[10] = z;
        this.dirty = true;
        return this;
    }
    update() {
        Matrix4.fromScaling(this.vec3, this.data);
        return this;
    }
}

class PerspectiveProjectionX extends AProjection3 {
    options;
    constructor(fovx = Math.PI * 0.25, aspect = window.innerWidth / window.innerHeight, near = 0.01, far = 100) {
        super();
        this.options = {
            fovx,
            aspect,
            near,
            far,
        };
        this.update();
    }
    get fovx() {
        return this.options.fovx;
    }
    set fovx(value) {
        this.options.fovx = value;
        this.update();
    }
    get aspect() {
        return this.options.aspect;
    }
    set aspect(value) {
        this.options.aspect = value;
        this.update();
    }
    get near() {
        return this.options.near;
    }
    set near(value) {
        this.options.near = value;
        this.update();
    }
    get far() {
        return this.options.far;
    }
    set far(value) {
        this.options.far = value;
        this.update();
    }
    set(fovx = this.fovx, aspect = this.aspect, near = this.near, far = this.far) {
        this.options.fovx = fovx;
        this.options.aspect = aspect;
        this.options.near = near;
        this.options.far = far;
        return this.update();
    }
    update() {
        Matrix4.perspectiveZ0(this.options.fovx / this.options.aspect, this.options.aspect, this.options.near, this.options.far, this.data);
        this.dirty = true;
        return this;
    }
}

var getEuclidPosition3Proxy = (position) => {
    if (position.isEntity) {
        position = position.getComponent(TRANSLATION_3D);
    }
    return new Proxy(position, {
        get: (target, property) => {
            if (property === 'x') {
                return target.data[12];
            }
            else if (property === 'y') {
                return target.data[13];
            }
            else if (property === 'z') {
                return target.data[14];
            }
            return target[property];
        },
        set: (target, property, value) => {
            if (property === 'x') {
                target.dirty = true;
                target.data[12] = value;
                return true;
            }
            else if (property === 'y') {
                target.dirty = true;
                target.data[13] = value;
                return true;
            }
            else if (property === 'z') {
                target.dirty = true;
                target.data[14] = value;
                return true;
            }
            else if (property === 'dirty') {
                target.dirty = value;
                return true;
            }
            return false;
        },
    });
};

var getEulerRotation3Proxy = (position) => {
    if (position.isEntity) {
        position = position.getComponent(ROTATION_3D);
    }
    let euler = EulerAngle.fromMatrix4(position.data);
    return new Proxy(position, {
        get: (target, property) => {
            if (property === 'x' || property === 'y' || property === 'z' || property === 'order') {
                return euler[property];
            }
            return target[property];
        },
        set: (target, property, value) => {
            if (property === 'x' || property === 'y' || property === 'z') {
                target.dirty = true;
                euler[property] = value;
                Matrix4.fromEuler(euler, target.data);
                return true;
            }
            else if (property === 'order') {
                target.dirty = true;
                euler.order = value;
                Matrix4.fromEuler(euler, target.data);
                return true;
            }
            else if (property === 'dirty') {
                target.dirty = value;
                return true;
            }
            return false;
        },
    });
};

var index$3 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	getEuclidPosition3Proxy: getEuclidPosition3Proxy,
	getEulerRotation3Proxy: getEulerRotation3Proxy
});

class Object3 extends Entity {
    anchor;
    position;
    rotation;
    scaling;
    modelMatrix;
    worldMatrix;
    constructor(name = "Object3") {
        super(name);
        this.scaling = new Vector3Scale3();
        this.position = new EuclidPosition3();
        this.rotation = new EulerRotation3();
        this.anchor = new Anchor3();
        this.modelMatrix = new Matrix4Component(MODEL_3D, Matrix4.create(), [{
                label: MODEL_3D,
                unique: true
            }]);
        this.worldMatrix = new Matrix4Component(WORLD_MATRIX4, Matrix4.create(), [{
                label: WORLD_MATRIX4,
                unique: true
            }]);
    }
}

const DEFAULT_BLEND_STATE = {
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
};

class BufferFloat32 extends Float32Array {
    dirty = true;
    name;
    descriptor = {};
    constructor(option, name = "buffer") {
        super((option.size ?? (option.data?.length ?? 4) << 2) >> 2);
        this.name = name;
        this.descriptor.usage = option.usage ?? (GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);
        this.descriptor.size = this.byteLength;
        if (option.data) {
            this.set(option.data);
        }
    }
    set(arr, offset) {
        super.set(arr, offset);
        this.dirty = true;
    }
}

const POSITION = "position";
const VERTICES = "vertices";
const VERTICES_COLOR = "vertices_color";
const NORMAL = "normal";
const INDEX = "index";
const UV = "uv";

var constants = /*#__PURE__*/Object.freeze({
	__proto__: null,
	INDEX: INDEX,
	NORMAL: NORMAL,
	POSITION: POSITION,
	UV: UV,
	VERTICES: VERTICES,
	VERTICES_COLOR: VERTICES_COLOR
});

// 既可以是2d几何体也可以是3D几何体
class Geometry extends Component {
    /**
     * 顶点数量
     */
    count;
    /**
     * 拓扑类型
     */
    dimension;
    topology;
    /**
     * 剔除方式
     */
    cullMode;
    frontFace;
    data = [];
    tags = [{
            label: GEOMETRY,
            unique: true
        }];
    constructor(dimension, count = 0, topology = "triangle-list", cullMode = "none", data = []) {
        super(GEOMETRY, data);
        this.count = count;
        this.cullMode = cullMode;
        this.dimension = dimension;
        this.topology = topology;
        this.frontFace = "ccw";
    }
    addAttribute(name, arr, stride = arr.length / this.count, attributes = []) {
        stride = Math.floor(stride);
        if (stride * this.count < arr.length) {
            throw new Error('not fit the geometry');
        }
        if (!attributes.length) {
            attributes.push({
                name,
                offset: 0,
                length: stride
            });
        }
        this.data.push({
            name,
            data: arr,
            stride,
            attributes
        });
        this.dirty = true;
    }
    transform(matrix) {
        for (let data of this.data) {
            for (let attr of data.attributes) {
                if (attr.name === POSITION) {
                    if (this.dimension === 3) {
                        for (let i = 0; i < data.data.length; i += data.stride) {
                            transformMatrix4(data.data, matrix, i + attr.offset);
                        }
                    }
                    else {
                        for (let i = 0; i < data.data.length; i += data.stride) {
                            transformMatrix3(data.data, matrix, i + attr.offset);
                        }
                    }
                    this.dirty = true;
                    return this;
                }
            }
        }
        return this;
    }
}
let x, y;
const transformMatrix3 = (a, m, offset) => {
    x = a[offset];
    y = a[1 + offset];
    a[offset] = m[0] * x + m[3] * y + m[6];
    a[offset + 1] = m[1] * x + m[4] * y + m[7];
    return a;
};
const transformMatrix4 = (a, m, offset) => {
    let ax = a[0 + offset];
    let ay = a[1 + offset];
    let az = a[2 + offset];
    let ag = m[3 + offset] * ax + m[7] * ay + m[11] * az + m[15];
    ag = ag || 1.0;
    a[0 + offset] = (m[0] * ax + m[4] * ay + m[8] * az + m[12]) / ag;
    a[1 + offset] = (m[1] * ax + m[5] * ay + m[9] * az + m[13]) / ag;
    a[2 + offset] = (m[2] * ax + m[6] * ay + m[10] * az + m[14]) / ag;
    return a;
};

const DEFAULT_OPTIONS = {
    hasNormal: true,
    hasUV: true,
    hasIndices: false,
    combine: true,
    topology: "triangle-list",
    cullMode: "none"
};

const DEFAULT_BOX_OPTIONS = {
    ...DEFAULT_OPTIONS,
    hasIndices: true,
    combine: true,
    width: 1,
    height: 1,
    depth: 1,
    widthSegments: 1,
    heightSegments: 1,
    depthSegments: 1,
    cullMode: "back"
};
const createBox = (options = {}) => {
    let stride = 3;
    const indices = [];
    const vertices = [];
    const normals = [];
    const uvs = [];
    const { depth, height, width, depthSegments, heightSegments, widthSegments, topology, cullMode, hasUV, hasNormal, combine } = {
        ...DEFAULT_BOX_OPTIONS,
        ...options
    };
    let numberOfVertices = 0;
    buildPlane(2, 1, 0, -1, -1, depth, height, width, depthSegments, heightSegments); // px
    buildPlane(2, 1, 0, 1, -1, depth, height, -width, depthSegments, heightSegments); // nx
    buildPlane(0, 2, 1, 1, 1, width, depth, height, widthSegments, depthSegments); // py
    buildPlane(0, 2, 1, 1, -1, width, depth, -height, widthSegments, depthSegments); // ny
    buildPlane(0, 1, 2, 1, -1, width, height, depth, widthSegments, heightSegments); // pz
    buildPlane(0, 1, 2, -1, -1, width, height, -depth, widthSegments, heightSegments); // nz
    function buildPlane(u, v, w, udir, vdir, width, height, depth, gridX, gridY) {
        const segmentWidth = width / gridX;
        const segmentHeight = height / gridY;
        const widthHalf = width / 2;
        const heightHalf = height / 2;
        const depthHalf = depth / 2;
        const gridX1 = gridX + 1;
        const gridY1 = gridY + 1;
        let vertexCounter = 0;
        const vector = new Vector3();
        // generate vertices, normals and uvs
        for (let iy = 0; iy < gridY1; iy++) {
            const y = iy * segmentHeight - heightHalf;
            for (let ix = 0; ix < gridX1; ix++) {
                const x = ix * segmentWidth - widthHalf;
                // set values to correct vector component
                vector[u] = x * udir;
                vector[v] = y * vdir;
                vector[w] = depthHalf;
                // now apply vector to vertex buffer
                vertices.push(vector.x, vector.y, vector.z);
                // set values to correct vector component
                vector[u] = 0;
                vector[v] = 0;
                vector[w] = depth > 0 ? 1 : -1;
                // now apply vector to normal buffer
                normals.push(vector.x, vector.y, vector.z);
                // uvs
                uvs.push(ix / gridX);
                uvs.push(iy / gridY);
                // counters
                vertexCounter += 1;
            }
        }
        // indices
        for (let iy = 0; iy < gridY; iy++) {
            for (let ix = 0; ix < gridX; ix++) {
                const a = numberOfVertices + ix + gridX1 * iy;
                const b = numberOfVertices + ix + gridX1 * (iy + 1);
                const c = numberOfVertices + (ix + 1) + gridX1 * (iy + 1);
                const d = numberOfVertices + (ix + 1) + gridX1 * iy;
                // faces
                indices.push(a, b, d);
                indices.push(b, c, d);
            }
        }
        // update total number of vertices
        numberOfVertices += vertexCounter;
    }
    let len = indices.length, i3 = 0, strideI = 0, i2 = 0;
    // let count = len / 3;
    let geo = new Geometry(3, len, topology, cullMode);
    if (combine) {
        let pickers = [{
                name: POSITION,
                offset: 0,
                length: 3,
            }];
        if (hasNormal && hasUV) {
            stride = 8;
            pickers.push({
                name: NORMAL,
                offset: 3,
                length: 3,
            });
            pickers.push({
                name: UV,
                offset: 6,
                length: 2,
            });
        }
        else if (hasNormal) {
            stride = 6;
            pickers.push({
                name: 'normal',
                offset: 3,
                length: 3,
            });
        }
        else if (hasUV) {
            stride = 5;
            pickers.push({
                name: 'uv',
                offset: 3,
                length: 2,
            });
        }
        let result = new Float32Array(stride * len);
        for (let i = 0; i < len; i++) {
            i2 = indices[i] << 1;
            i3 = indices[i] * 3;
            strideI = i * stride;
            result[0 + strideI] = vertices[i3];
            result[1 + strideI] = vertices[i3 + 1];
            result[2 + strideI] = vertices[i3 + 2];
            if (hasNormal) {
                result[3 + strideI] = normals[i3];
                result[4 + strideI] = normals[i3 + 1];
                result[5 + strideI] = normals[i3 + 2];
                if (hasUV) {
                    result[6 + strideI] = uvs[i2];
                    result[7 + strideI] = uvs[i2 + 1];
                }
            }
            else if (hasUV) {
                result[3 + strideI] = uvs[i2];
                result[4 + strideI] = uvs[i2 + 1];
            }
        }
        geo.addAttribute(VERTICES, result, stride, pickers);
        return geo;
    }
    else {
        return geo;
    }
};

const DEFAULT_CIRCLE_OPTIONS$1 = {
    ...DEFAULT_OPTIONS,
    hasIndices: true,
    combine: true,
    segments: 32,
    angleStart: 0,
    angle: Math.PI * 2,
    radius: 1,
};
const createCircle = (options = {}) => {
    let stride = 3;
    const indices = [];
    const positions = [0, 0, 0];
    const normals = [0, 0, 1];
    const uvs = [0.5, 0.5];
    const { segments, angleStart, angle, radius, topology, cullMode, hasUV, hasNormal, combine } = {
        ...DEFAULT_CIRCLE_OPTIONS$1,
        ...options
    };
    for (let s = 0, i = 3; s <= segments; s++, i += 3) {
        const segment = angleStart + s / segments * angle;
        positions.push(radius * Math.cos(segment), radius * Math.sin(segment), 0);
        normals.push(0, 0, 1);
        uvs.push((positions[i] / radius + 1) / 2, (positions[i + 1] / radius + 1) / 2);
    }
    // indices
    for (let i = 1; i <= segments; i++) {
        indices.push(i, i + 1, 0);
    }
    let len = indices.length, i3 = 0, strideI = 0, i2 = 0;
    // let count = len / 3;
    let geo = new Geometry(3, len, topology, cullMode);
    // TODO indices 现在都是非索引版本
    if (combine) {
        let pickers = [{
                name: POSITION,
                offset: 0,
                length: 3,
            }];
        if (hasNormal && hasUV) {
            stride = 8;
            pickers.push({
                name: NORMAL,
                offset: 3,
                length: 3,
            });
            pickers.push({
                name: UV,
                offset: 6,
                length: 2,
            });
        }
        else if (hasNormal) {
            stride = 6;
            pickers.push({
                name: NORMAL,
                offset: 3,
                length: 3,
            });
        }
        else if (hasUV) {
            stride = 5;
            pickers.push({
                name: UV,
                offset: 3,
                length: 2,
            });
        }
        let result = new Float32Array(stride * len);
        for (let i = 0; i < len; i++) {
            i2 = indices[i] << 1;
            i3 = indices[i] * 3;
            strideI = i * stride;
            result[0 + strideI] = positions[i3];
            result[1 + strideI] = positions[i3 + 1];
            result[2 + strideI] = positions[i3 + 2];
            if (hasNormal) {
                result[3 + strideI] = normals[i3];
                result[4 + strideI] = normals[i3 + 1];
                result[5 + strideI] = normals[i3 + 2];
                if (hasUV) {
                    result[6 + strideI] = uvs[i2];
                    result[7 + strideI] = uvs[i2 + 1];
                }
            }
            else if (hasUV) {
                result[3 + strideI] = uvs[i2];
                result[4 + strideI] = uvs[i2 + 1];
            }
        }
        geo.addAttribute(VERTICES, result, stride, pickers);
        return geo;
    }
    else {
        // let result = new Float32Array(9);
        // result.set(t.a);
        // result.set(t.b, 3);
        // result.set(t.c, 6);
        // geo.addAttribute(POSITION, result, 3);
        // if (options.hasNormal) {
        //     result = new Float32Array(9);
        //     let normal = Triangle3.normal(t);
        //     result.set(normal, 0);
        //     result.set(normal, 3);
        //     result.set(normal, 6);
        //     geo.addAttribute(NORMAL, result, 3);
        // }
        // if (options.hasUV) {
        //     result = new Float32Array(6);
        //     result.set([0, 0], 0);
        //     result.set([1, 0], 2);
        //     result.set([0.5, 1], 4);
        //     geo.addAttribute(UV, result, 2);
        // }
        return geo;
    }
};

const DEFAULT_CYLINDER_OPTIONS = {
    ...DEFAULT_OPTIONS,
    hasIndices: true,
    combine: true,
    radiusTop: 1,
    radiusBottom: 1,
    height: 1,
    radialSegments: 32,
    heightSegments: 1,
    openEnded: false,
    thetaStart: 0,
    thetaLength: constants$2.DEG_360_RAD,
    cullMode: "back"
};
const createCylinder = (options = {}) => {
    let stride = 3;
    const indices = [];
    const vertices = [];
    const normals = [];
    const uvs = [];
    const { height, radialSegments, radiusTop, radiusBottom, heightSegments, openEnded, thetaStart, thetaLength, topology, cullMode, hasUV, hasNormal, combine } = {
        ...DEFAULT_CYLINDER_OPTIONS,
        ...options
    };
    let index = 0;
    const indexArray = [];
    const halfHeight = height / 2;
    // generate geometry
    generateTorso();
    if (openEnded === false) {
        if (radiusTop > 0)
            generateCap(true);
        if (radiusBottom > 0)
            generateCap(false);
    }
    function generateTorso() {
        const normal = new Vector3();
        const vertex = new Float32Array(3);
        // this will be used to calculate the normal
        const slope = (radiusBottom - radiusTop) / height;
        // generate vertices, normals and uvs
        for (let y = 0; y <= heightSegments; y++) {
            const indexRow = [];
            const v = y / heightSegments;
            // calculate the radius of the current row
            const radius = v * (radiusBottom - radiusTop) + radiusTop;
            for (let x = 0; x <= radialSegments; x++) {
                const u = x / radialSegments;
                const theta = u * thetaLength + thetaStart;
                const sinTheta = Math.sin(theta);
                const cosTheta = Math.cos(theta);
                // vertex
                vertex[0] = radius * sinTheta;
                vertex[1] = -v * height + halfHeight;
                vertex[2] = radius * cosTheta;
                vertices.push(vertex[0], vertex[1], vertex[2]);
                // normal
                normal[0] = sinTheta;
                normal[1] = slope;
                normal[2] = cosTheta;
                Vector3.normalize(normal, normal);
                normals.push(normal[0], normal[1], normal[2]);
                // uv
                uvs.push(u, 1 - v);
                // save index of vertex in respective row
                indexRow.push(index++);
            }
            // now save vertices of the row in our index array
            indexArray.push(indexRow);
        }
        // generate indices
        for (let x = 0; x < radialSegments; x++) {
            for (let y = 0; y < heightSegments; y++) {
                // we use the index array to access the correct indices
                const a = indexArray[y][x];
                const b = indexArray[y + 1][x];
                const c = indexArray[y + 1][x + 1];
                const d = indexArray[y][x + 1];
                // faces
                indices.push(a, b, d);
                indices.push(b, c, d);
                // update group counter
            }
        }
    }
    function generateCap(top) {
        // save the index of the first center vertex
        const centerIndexStart = index;
        const uv = new Float32Array(2);
        const vertex = new Float32Array(3);
        const radius = (top === true) ? radiusTop : radiusBottom;
        const sign = (top === true) ? 1 : -1;
        // first we generate the center vertex data of the cap.
        // because the geometry needs one set of uvs per face,
        // we must generate a center vertex per face/segment
        for (let x = 1; x <= radialSegments; x++) {
            // vertex
            vertices.push(0, halfHeight * sign, 0);
            // normal
            normals.push(0, sign, 0);
            // uv
            uvs.push(0.5, 0.5);
            // increase index
            index++;
        }
        // save the index of the last center vertex
        const centerIndexEnd = index;
        // now we generate the surrounding vertices, normals and uvs
        for (let x = 0; x <= radialSegments; x++) {
            const u = x / radialSegments;
            const theta = u * thetaLength + thetaStart;
            const cosTheta = Math.cos(theta);
            const sinTheta = Math.sin(theta);
            // vertex
            vertex[0] = radius * sinTheta;
            vertex[1] = halfHeight * sign;
            vertex[2] = radius * cosTheta;
            vertices.push(vertex[0], vertex[1], vertex[2]);
            // normal
            normals.push(0, sign, 0);
            // uv
            uv[0] = (cosTheta * 0.5) + 0.5;
            uv[1] = (sinTheta * 0.5 * sign) + 0.5;
            uvs.push(uv[0], uv[1]);
            // increase index
            index++;
        }
        // generate indices
        for (let x = 0; x < radialSegments; x++) {
            const c = centerIndexStart + x;
            const i = centerIndexEnd + x;
            if (top === true) {
                // face top
                indices.push(i, i + 1, c);
            }
            else {
                // face bottom
                indices.push(i + 1, i, c);
            }
        }
    }
    let len = indices.length, i3 = 0, strideI = 0, i2 = 0;
    let geo = new Geometry(3, len, topology, cullMode);
    if (combine) {
        let pickers = [{
                name: POSITION,
                offset: 0,
                length: 3,
            }];
        if (hasNormal && hasUV) {
            stride = 8;
            pickers.push({
                name: 'normal',
                offset: 3,
                length: 3,
            });
            pickers.push({
                name: 'uv',
                offset: 6,
                length: 2,
            });
        }
        else if (hasNormal) {
            stride = 6;
            pickers.push({
                name: 'normal',
                offset: 3,
                length: 3,
            });
        }
        else if (hasUV) {
            stride = 5;
            pickers.push({
                name: 'uv',
                offset: 3,
                length: 2,
            });
        }
        let result = new Float32Array(stride * len);
        for (let i = 0; i < len; i++) {
            i2 = indices[i] << 1;
            i3 = indices[i] * 3;
            strideI = i * stride;
            result[0 + strideI] = vertices[i3];
            result[1 + strideI] = vertices[i3 + 1];
            result[2 + strideI] = vertices[i3 + 2];
            if (hasNormal) {
                result[3 + strideI] = normals[i3];
                result[4 + strideI] = normals[i3 + 1];
                result[5 + strideI] = normals[i3 + 2];
                if (hasUV) {
                    result[6 + strideI] = uvs[i2];
                    result[7 + strideI] = uvs[i2 + 1];
                }
            }
            else if (hasUV) {
                result[3 + strideI] = uvs[i2];
                result[4 + strideI] = uvs[i2 + 1];
            }
        }
        geo.addAttribute(VERTICES, result, stride, pickers);
        return geo;
    }
    return geo;
};

const DEFAULT_PLANE_OPTIONS$1 = {
    ...DEFAULT_OPTIONS,
    hasIndices: true,
    combine: true,
    width: 1,
    height: 1,
    segmentX: 1,
    segmentY: 1,
};
const createPlane = (options = {}) => {
    const { width, height, segmentX, segmentY, topology, cullMode, hasUV, hasNormal, combine } = {
        ...DEFAULT_PLANE_OPTIONS$1,
        ...options
    };
    let stride = 3;
    const halfX = width * 0.5;
    const halfY = height * 0.5;
    const gridX = Math.max(1, Math.round(segmentX));
    const gridY = Math.max(1, Math.round(segmentY));
    const gridX1 = gridX + 1;
    const gridY1 = gridY + 1;
    const segmentWidth = width / gridX;
    const segmentHeight = height / gridY;
    const indices = [];
    const positions = [];
    const normals = [];
    const uvs = [];
    for (let iy = 0; iy < gridY1; iy++) {
        const y = iy * segmentHeight - halfY;
        for (let ix = 0; ix < gridX1; ix++) {
            const x = ix * segmentWidth - halfX;
            positions.push(x, -y, 0);
            normals.push(0, 0, 1);
            uvs.push(ix / gridX);
            uvs.push(iy / gridY);
        }
    }
    for (let iy = 0; iy < gridY; iy++) {
        for (let ix = 0; ix < gridX; ix++) {
            const a = ix + gridX1 * iy;
            const b = ix + gridX1 * (iy + 1);
            const c = (ix + 1) + gridX1 * (iy + 1);
            const d = (ix + 1) + gridX1 * iy;
            indices.push(a, b, d);
            indices.push(b, c, d);
        }
    }
    let len = indices.length, i3 = 0, strideI = 0, i2 = 0;
    // let count = len / 3;
    let geo = new Geometry(3, len, topology, cullMode);
    // TODO indices 现在都是非索引版本
    if (combine) {
        let pickers = [{
                name: POSITION,
                offset: 0,
                length: 3,
            }];
        if (hasNormal && hasUV) {
            stride = 8;
            pickers.push({
                name: 'normal',
                offset: 3,
                length: 3,
            });
            pickers.push({
                name: 'uv',
                offset: 6,
                length: 2,
            });
        }
        else if (hasNormal) {
            stride = 6;
            pickers.push({
                name: 'normal',
                offset: 3,
                length: 3,
            });
        }
        else if (hasUV) {
            stride = 5;
            pickers.push({
                name: 'uv',
                offset: 3,
                length: 2,
            });
        }
        let result = new Float32Array(stride * len);
        for (let i = 0; i < len; i++) {
            i2 = indices[i] << 1;
            i3 = indices[i] * 3;
            strideI = i * stride;
            result[0 + strideI] = positions[i3];
            result[1 + strideI] = positions[i3 + 1];
            result[2 + strideI] = positions[i3 + 2];
            if (hasNormal) {
                result[3 + strideI] = normals[i3];
                result[4 + strideI] = normals[i3 + 1];
                result[5 + strideI] = normals[i3 + 2];
                if (hasUV) {
                    result[6 + strideI] = uvs[i2];
                    result[7 + strideI] = uvs[i2 + 1];
                }
            }
            else if (hasUV) {
                result[3 + strideI] = uvs[i2];
                result[4 + strideI] = uvs[i2 + 1];
            }
        }
        // result.set(t.a);
        // result.set(t.b, stride);
        // result.set(t.c, stride + stride);
        // if (options.hasNormal) {
        //     let normal = Triangle3.normal(t);
        //     result.set(normal, 3);
        //     result.set(normal, stride + 3);
        //     result.set(normal, stride + stride + 3);
        //     pickers.push({
        //         name: 'normal',
        //         offset: 3,
        //         length: 3,
        //     });
        // }
        // if (options.hasUV) {
        //     let offset = options.hasNormal ? 6 : 3;
        //     result.set([0, 1], offset);
        //     result.set([1, 1], stride + offset);
        //     result.set([0.5, 0], stride + stride + offset);
        //     pickers.push({
        //         name: UV,
        //         offset,
        //         length: 2,
        //     });
        // }
        geo.addAttribute(VERTICES, result, stride, pickers);
        return geo;
    }
    else {
        // let result = new Float32Array(9);
        // result.set(t.a);
        // result.set(t.b, 3);
        // result.set(t.c, 6);
        // geo.addAttribute(POSITION, result, 3);
        // if (options.hasNormal) {
        //     result = new Float32Array(9);
        //     let normal = Triangle3.normal(t);
        //     result.set(normal, 0);
        //     result.set(normal, 3);
        //     result.set(normal, 6);
        //     geo.addAttribute(NORMAL, result, 3);
        // }
        // if (options.hasUV) {
        //     result = new Float32Array(6);
        //     result.set([0, 0], 0);
        //     result.set([1, 0], 2);
        //     result.set([0.5, 1], 4);
        //     geo.addAttribute(UV, result, 2);
        // }
        return geo;
    }
};

const createTriangle = (t = Triangle3.create(), options = DEFAULT_OPTIONS, topology = "triangle-list", cullMode = "none") => {
    let geo = new Geometry(3, 3, topology, cullMode);
    let stride = 3;
    if (options.combine) {
        let pickers = [{
                name: POSITION,
                offset: 0,
                length: 3,
            }];
        if (options.hasNormal && options.hasUV) {
            stride = 8;
        }
        else if (options.hasNormal) {
            stride = 6;
        }
        else if (options.hasUV) {
            stride = 5;
        }
        let result = new Float32Array(stride * 3);
        result.set(t.a);
        result.set(t.b, stride);
        result.set(t.c, stride + stride);
        if (options.hasNormal) {
            let normal = Triangle3.normal(t);
            result.set(normal, 3);
            result.set(normal, stride + 3);
            result.set(normal, stride + stride + 3);
            pickers.push({
                name: 'normal',
                offset: 3,
                length: 3,
            });
        }
        if (options.hasUV) {
            let offset = options.hasNormal ? 6 : 3;
            result.set([0, 1], offset);
            result.set([1, 1], stride + offset);
            result.set([0.5, 0], stride + stride + offset);
            pickers.push({
                name: UV,
                offset,
                length: 2,
            });
        }
        geo.addAttribute(VERTICES, result, stride, pickers);
        return geo;
    }
    else {
        let result = new Float32Array(9);
        result.set(t.a);
        result.set(t.b, 3);
        result.set(t.c, 6);
        geo.addAttribute(POSITION, result, 3);
        if (options.hasNormal) {
            result = new Float32Array(9);
            let normal = Triangle3.normal(t);
            result.set(normal, 0);
            result.set(normal, 3);
            result.set(normal, 6);
            geo.addAttribute(NORMAL, result, 3);
        }
        if (options.hasUV) {
            result = new Float32Array(6);
            result.set([0, 0], 0);
            result.set([1, 0], 2);
            result.set([0.5, 1], 4);
            geo.addAttribute(UV, result, 2);
        }
        return geo;
    }
};

const DEFAULT_SPHERE_OPTIONS = {
    ...DEFAULT_OPTIONS,
    hasIndices: true,
    combine: true,
    radius: 1,
    phiStart: 0,
    phiLength: Math.PI * 2,
    thetaStart: 0,
    thetaLength: Math.PI,
    widthSegments: 32,
    heightSegments: 32,
    cullMode: "back"
};
const createSphere = (options = {}) => {
    let stride = 3;
    const { radius, phiStart, phiLength, thetaStart, thetaLength, widthSegments, heightSegments, topology, cullMode, hasUV, hasNormal, combine } = {
        ...DEFAULT_SPHERE_OPTIONS,
        ...options,
    };
    const thetaEnd = Math.min(thetaStart + thetaLength, Math.PI);
    let index = 0;
    const grid = [];
    const vertex = new Float32Array(3);
    const normal = new Float32Array(3);
    // buffers
    const indices = [];
    const vertices = [];
    const normals = [];
    const uvs = [];
    for (let iy = 0; iy <= heightSegments; iy++) {
        const verticesRow = [];
        const v = iy / heightSegments;
        // special case for the poles
        let uOffset = 0;
        if (iy === 0 && thetaStart === 0) {
            uOffset = 0.5 / widthSegments;
        }
        else if (iy === heightSegments && thetaEnd === Math.PI) {
            uOffset = -0.5 / widthSegments;
        }
        for (let ix = 0; ix <= widthSegments; ix++) {
            const u = ix / widthSegments;
            // vertex
            vertex[0] = -radius * Math.cos(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
            vertex[1] = radius * Math.cos(thetaStart + v * thetaLength);
            vertex[2] = radius * Math.sin(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
            vertices.push(vertex[0], vertex[1], vertex[2]);
            // normal
            normal.set(Vector3.normalize(vertex));
            normals.push(normal[0], normal[1], normal[2]);
            // uv
            uvs.push(u + uOffset, v);
            verticesRow.push(index++);
        }
        grid.push(verticesRow);
    }
    for (let iy = 0; iy < heightSegments; iy++) {
        for (let ix = 0; ix < widthSegments; ix++) {
            const a = grid[iy][ix + 1];
            const b = grid[iy][ix];
            const c = grid[iy + 1][ix];
            const d = grid[iy + 1][ix + 1];
            if (iy !== 0 || thetaStart > 0)
                indices.push(a, b, d);
            if (iy !== heightSegments - 1 || thetaEnd < Math.PI)
                indices.push(b, c, d);
        }
    }
    let len = indices.length, i3 = 0, strideI = 0, i2 = 0;
    let geo = new Geometry(3, len, topology, cullMode);
    // TODO indices 现在都是非索引版本
    if (combine) {
        let pickers = [{
                name: POSITION,
                offset: 0,
                length: 3,
            }];
        if (hasNormal && hasUV) {
            stride = 8;
            pickers.push({
                name: 'normal',
                offset: 3,
                length: 3,
            });
            pickers.push({
                name: 'uv',
                offset: 6,
                length: 2,
            });
        }
        else if (hasNormal) {
            stride = 6;
            pickers.push({
                name: 'normal',
                offset: 3,
                length: 3,
            });
        }
        else if (hasUV) {
            stride = 5;
            pickers.push({
                name: 'uv',
                offset: 3,
                length: 2,
            });
        }
        let result = new Float32Array(stride * len);
        for (let i = 0; i < len; i++) {
            i2 = indices[i] << 1;
            i3 = indices[i] * 3;
            strideI = i * stride;
            result[0 + strideI] = vertices[i3];
            result[1 + strideI] = vertices[i3 + 1];
            result[2 + strideI] = vertices[i3 + 2];
            if (hasNormal) {
                result[3 + strideI] = normals[i3];
                result[4 + strideI] = normals[i3 + 1];
                result[5 + strideI] = normals[i3 + 2];
                if (hasUV) {
                    result[6 + strideI] = uvs[i2];
                    result[7 + strideI] = uvs[i2 + 1];
                }
            }
            else if (hasUV) {
                result[3 + strideI] = uvs[i2];
                result[4 + strideI] = uvs[i2 + 1];
            }
        }
        geo.addAttribute(VERTICES, result, stride, pickers);
        return geo;
    }
    return geo;
};

var index$2 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	DEFAULT_BOX_OPTIONS: DEFAULT_BOX_OPTIONS,
	DEFAULT_CIRCLE_OPTIONS: DEFAULT_CIRCLE_OPTIONS$1,
	DEFAULT_CYLINDER_OPTIONS: DEFAULT_CYLINDER_OPTIONS,
	DEFAULT_PLANE_OPTIONS: DEFAULT_PLANE_OPTIONS$1,
	DEFAULT_SPHERE_OPTIONS: DEFAULT_SPHERE_OPTIONS,
	createBox: createBox,
	createCircle: createCircle,
	createCylinder: createCylinder,
	createPlane: createPlane,
	createSphere: createSphere,
	createTriangle: createTriangle
});

const DEFAULT_CIRCLE_OPTIONS = {
    ...DEFAULT_OPTIONS,
    hasIndices: true,
    combine: true,
    segments: 32,
    angleStart: 0,
    angle: Math.PI * 2,
    radius: 1,
    cullMode: "back"
};
var createCircle2 = (options = {}) => {
    let stride = 3;
    const indices = [];
    const positions = [0, 0];
    const uvs = [0.5, 0.5];
    const { segments, angleStart, angle, radius, topology, cullMode, hasUV, combine } = {
        ...DEFAULT_CIRCLE_OPTIONS,
        ...options
    };
    for (let s = 0, i = 3; s <= segments; s++, i += 3) {
        const segment = angleStart + s / segments * angle;
        positions.push(radius * Math.cos(segment), radius * Math.sin(segment));
        uvs.push((positions[i] / radius + 1) / 2, (positions[i + 1] / radius + 1) / 2);
    }
    // indices
    for (let i = 1; i <= segments; i++) {
        indices.push(i, i + 1, 0);
    }
    let len = indices.length, i3 = 0, strideI = 0, i2 = 0;
    // let count = len / 3;
    let geo = new Geometry(2, len, topology, cullMode);
    // TODO indices 现在都是非索引版本
    if (combine) {
        let pickers = [{
                name: POSITION,
                offset: 0,
                length: 2,
            }];
        if (hasUV) {
            stride = 4;
            pickers.push({
                name: UV,
                offset: 2,
                length: 2,
            });
        }
        let result = new Float32Array(stride * len);
        for (let i = 0; i < len; i++) {
            i2 = indices[i] << 1;
            i3 = indices[i] * 2;
            strideI = i * stride;
            result[0 + strideI] = positions[i3];
            result[1 + strideI] = positions[i3 + 1];
            if (hasUV) {
                result[2 + strideI] = uvs[i2];
                result[3 + strideI] = uvs[i2 + 1];
            }
        }
        geo.addAttribute(VERTICES, result, stride, pickers);
        return geo;
    }
    else {
        // let result = new Float32Array(9);
        // result.set(t.a);
        // result.set(t.b, 3);
        // result.set(t.c, 6);
        // geo.addAttribute(POSITION, result, 3);
        // if (options.hasNormal) {
        //     result = new Float32Array(9);
        //     let normal = Triangle3.normal(t);
        //     result.set(normal, 0);
        //     result.set(normal, 3);
        //     result.set(normal, 6);
        //     geo.addAttribute(NORMAL, result, 3);
        // }
        // if (options.hasUV) {
        //     result = new Float32Array(6);
        //     result.set([0, 0], 0);
        //     result.set([1, 0], 2);
        //     result.set([0.5, 1], 4);
        //     geo.addAttribute(UV, result, 2);
        // }
        return geo;
    }
};

const DEFAULT_PLANE_OPTIONS = {
    ...DEFAULT_OPTIONS,
    hasIndices: true,
    combine: true,
    width: 1,
    height: 1,
    segmentX: 1,
    segmentY: 1,
    cullMode: "back"
};
var createPlane2 = (options = {}) => {
    const { width, height, segmentX, segmentY, topology, cullMode, hasUV, combine } = {
        ...DEFAULT_PLANE_OPTIONS,
        ...options
    };
    let stride = 3;
    const halfX = width * 0.5;
    const halfY = height * 0.5;
    const gridX = Math.max(1, Math.round(segmentX));
    const gridY = Math.max(1, Math.round(segmentY));
    const gridX1 = gridX + 1;
    const gridY1 = gridY + 1;
    const segmentWidth = width / gridX;
    const segmentHeight = height / gridY;
    const indices = [];
    const positions = [];
    const uvs = [];
    for (let iy = 0; iy < gridY1; iy++) {
        const y = iy * segmentHeight - halfY;
        for (let ix = 0; ix < gridX1; ix++) {
            const x = ix * segmentWidth - halfX;
            positions.push(x, -y);
            uvs.push(ix / gridX);
            uvs.push(iy / gridY);
        }
    }
    for (let iy = 0; iy < gridY; iy++) {
        for (let ix = 0; ix < gridX; ix++) {
            const a = ix + gridX1 * iy;
            const b = ix + gridX1 * (iy + 1);
            const c = (ix + 1) + gridX1 * (iy + 1);
            const d = (ix + 1) + gridX1 * iy;
            indices.push(a, b, d);
            indices.push(b, c, d);
        }
    }
    let len = indices.length, i3 = 0, strideI = 0, i2 = 0;
    let geo = new Geometry(2, len, topology, cullMode);
    // TODO indices 现在都是非索引版本
    if (combine) {
        let pickers = [{
                name: POSITION,
                offset: 0,
                length: 2,
            }];
        if (hasUV) {
            stride = 5;
            pickers.push({
                name: 'uv',
                offset: 2,
                length: 2,
            });
        }
        let result = new Float32Array(stride * len);
        for (let i = 0; i < len; i++) {
            i2 = indices[i] << 1;
            i3 = indices[i] * 2;
            strideI = i * stride;
            result[0 + strideI] = positions[i3];
            result[1 + strideI] = positions[i3 + 1];
            if (hasUV) {
                result[3 + strideI] = uvs[i2];
                result[4 + strideI] = uvs[i2 + 1];
            }
        }
        geo.addAttribute(VERTICES, result, stride, pickers);
        return geo;
    }
    else {
        // let result = new Float32Array(9);
        // result.set(t.a);
        // result.set(t.b, 3);
        // result.set(t.c, 6);
        // geo.addAttribute(POSITION, result, 3);
        // if (options.hasNormal) {
        //     result = new Float32Array(9);
        //     let normal = Triangle3.normal(t);
        //     result.set(normal, 0);
        //     result.set(normal, 3);
        //     result.set(normal, 6);
        //     geo.addAttribute(NORMAL, result, 3);
        // }
        // if (options.hasUV) {
        //     result = new Float32Array(6);
        //     result.set([0, 0], 0);
        //     result.set([1, 0], 2);
        //     result.set([0.5, 1], 4);
        //     geo.addAttribute(UV, result, 2);
        // }
        return geo;
    }
};

var createTriangle2 = (t = Triangle2.create(), options = DEFAULT_OPTIONS, topology = "triangle-list", cullMode = "none") => {
    let geo = new Geometry(2, 3, topology, cullMode);
    let stride = 3;
    if (options.combine) {
        let pickers = [{
                name: POSITION,
                offset: 0,
                length: 2,
            }];
        if (options.hasUV) {
            stride = 4;
        }
        let result = new Float32Array(stride * 3);
        result.set(t.a);
        result.set(t.b, stride);
        result.set(t.c, stride + stride);
        if (options.hasUV) {
            let offset = 2;
            result.set([0, 1], offset);
            result.set([1, 1], stride + offset);
            result.set([0.5, 0], stride + stride + offset);
            pickers.push({
                name: UV,
                offset,
                length: 2,
            });
        }
        geo.addAttribute(VERTICES, result, stride, pickers);
        return geo;
    }
    else {
        let result = new Float32Array(6);
        result.set(t.a);
        result.set(t.b, 2);
        result.set(t.c, 4);
        geo.addAttribute(POSITION, result, 2);
        if (options.hasUV) {
            result = new Float32Array(6);
            result.set([0, 0], 0);
            result.set([1, 0], 2);
            result.set([0.5, 1], 4);
            geo.addAttribute(UV, result, 2);
        }
        return geo;
    }
};

var index$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	createCircle2: createCircle2,
	createPlane2: createPlane2,
	createTriangle2: createTriangle2
});

class Renderable extends Component {
    tags = [{
            label: RENDERABLE,
            unique: false
        }];
    constructor(data) {
        super(RENDERABLE, data);
    }
    get geometry() {
        return this.data.geometry;
    }
    set geometry(v) {
        this.data.geometry = v;
        this.dirty = true;
    }
    get material() {
        return this.data.material;
    }
    set material(v) {
        this.data.material = v;
        this.dirty = true;
    }
}

const getColorGPU = (color, result = new ColorGPU()) => {
    if (color instanceof ColorGPU) {
        result.set(color);
    }
    else if (typeof color === "string") {
        ColorGPU.fromString(color, result);
    }
    else if (typeof color === "number") {
        ColorGPU.fromHex(color, 1, result);
    }
    else if (color instanceof ColorRGB) {
        ColorGPU.fromColorRGB(color, result);
    }
    else if (color instanceof ColorRYB) {
        ColorGPU.fromColorRYB(color, result);
    }
    else if (color instanceof ColorRGBA) {
        ColorGPU.fromColorRGBA(color, result);
    }
    else if (color instanceof ColorHSL) {
        ColorGPU.fromColorHSL(color, result);
    }
    else if (color instanceof ColorHSV) {
        ColorGPU.fromColorHSV(color, result);
    }
    else if (color instanceof ColorCMYK) {
        ColorGPU.fromColorCMYK(color, result);
    }
    else if (color instanceof Float32Array || color instanceof Array) {
        ColorGPU.fromArray(color, result);
    }
    else if (color instanceof Float32Array || color instanceof Array) {
        ColorGPU.fromArray(color, result);
    }
    else {
        if ("a" in color) {
            ColorGPU.fromJson(color, result);
        }
        else {
            ColorGPU.fromJson({
                ...color,
                a: 1
            }, result);
        }
    }
    return result;
};

class RenderSystemInCanvas extends System {
    context;
    alphaMode;
    viewport = {
        x: 0,
        y: 0,
        width: 1,
        height: 1,
        minDepth: 0,
        maxDepth: 1
    };
    id = 0;
    cache = new WeakMap();
    entitySet = new WeakMap();
    loopTimes = 0;
    name = "";
    usedBy = [];
    rendererMap = new Map();
    canvas;
    options = {
        width: 0,
        height: 0,
        resolution: 1,
        alphaMode: "",
        autoResize: false,
        clearColor: new ColorGPU(),
        noDepthTexture: false
    };
    constructor(name, options) {
        super(name, (entity) => {
            return entity.getComponent(RENDERABLE)?.data;
        });
        const element = options.element ?? document.body;
        const w = element.offsetWidth;
        const h = element.offsetHeight;
        if (element instanceof HTMLCanvasElement) {
            this.canvas = element;
        }
        else {
            this.canvas = document.createElement("canvas");
            element.appendChild(this.canvas);
        }
        this.width = options.width ?? w;
        this.height = options.height ?? h;
        this.resolution = options.resolution ?? window.devicePixelRatio;
        this.alphaMode = options.alphaMode ?? "premultiplied";
        this.clearColor = options.clearColor ?? new ColorGPU(0, 0, 0, 1);
        this.autoResize = options.autoResize ?? false;
        this.options.noDepthTexture = options.noDepthTexture ?? false;
    }
    clearColorGPU = new ColorGPU(0, 0, 0, 1);
    get clearColor() {
        return this.options.clearColor;
    }
    set clearColor(value) {
        getColorGPU(value, this.clearColorGPU);
        if (value instanceof Object) {
            this.options.clearColor = new Proxy(value, {
                get: (target, property, receiver) => {
                    const res = Reflect.get(target, property, receiver);
                    this.clearColor = target;
                    return res;
                },
            });
        }
        else {
            this.options.clearColor = value;
        }
    }
    get resolution() {
        return this.options.resolution;
    }
    set resolution(v) {
        this.options.resolution = v;
        this.resize(this.options.width, this.options.height, v);
    }
    get width() {
        return this.options.width;
    }
    set width(v) {
        this.options.width = v;
        this.resize(v, this.options.height, this.options.resolution);
    }
    get height() {
        return this.options.height;
    }
    set height(v) {
        this.options.height = v;
        this.resize(this.options.width, v, this.options.resolution);
    }
    get autoResize() {
        return this.options.autoResize;
    }
    set autoResize(v) {
        this.options.autoResize = v;
        if (v) {
            this.#turnOnAutoResize();
        }
        else {
            this.#turnOffAutoResize();
        }
    }
    #isResizeObserverConnect = false;
    #resizeObserver = new ResizeObserver((parent) => {
        if (parent[0]) {
            const div = parent[0].target;
            this.resize(div.offsetWidth, div.offsetHeight);
        }
    });
    #turnOnAutoResize = () => {
        if (this.#isResizeObserverConnect) {
            return this;
        }
        let parent = this.canvas.parentElement;
        if (parent) {
            this.#resizeObserver.observe(parent);
            this.#isResizeObserverConnect = true;
        }
        return this;
    };
    #turnOffAutoResize = () => {
        if (!this.#isResizeObserverConnect) {
            return this;
        }
        let parent = this.canvas.parentElement;
        if (parent) {
            this.#resizeObserver.unobserve(parent);
            this.#isResizeObserverConnect = false;
        }
        return this;
    };
    addRenderer(renderer) {
        if (typeof renderer.renderTypes === "string") {
            this.rendererMap.set(renderer.renderTypes, renderer);
        }
        else {
            for (let item of renderer.renderTypes) {
                this.rendererMap.set(item, renderer);
            }
        }
        return this;
    }
    destroy() {
        this.rendererMap.clear();
        return this;
    }
    resize(width, height, resolution = this.resolution) {
        this.options.width = width;
        this.options.height = height;
        this.options.resolution = resolution;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        this.canvas.width = width * resolution;
        this.canvas.height = height * resolution;
        return this;
    }
    serialize() {
        return {
            id: this.id,
            name: this.name,
            type: "RenderSystem"
        };
    }
}

class Sampler {
    dirty = true;
    descriptor = {};
    name;
    constructor(option = {}, name = "sampler") {
        this.descriptor.minFilter = option.minFilter ?? "linear";
        this.descriptor.magFilter = option.magFilter ?? "linear";
        this.descriptor.addressModeU = option.addressModeU ?? "repeat";
        this.descriptor.addressModeV = option.addressModeV ?? "repeat";
        this.descriptor.addressModeW = option.addressModeW ?? "repeat";
        this.descriptor.maxAnisotropy = option.maxAnisotropy ?? 1;
        this.descriptor.mipmapFilter = option.mipmapFilter ?? "linear";
        this.descriptor.lodMaxClamp = option.lodMaxClamp ?? 32;
        this.descriptor.lodMinClamp = option.lodMinClamp ?? 0;
        this.descriptor.compare = option.compare ?? undefined;
        this.name = name;
    }
    setAddressMode(u, v, w) {
        this.descriptor.addressModeU = u;
        this.descriptor.addressModeV = v;
        this.descriptor.addressModeW = w ?? this.descriptor.addressModeW;
        this.dirty = true;
        return this;
    }
    setFilterMode(mag, min, mipmap) {
        this.descriptor.magFilter = mag;
        this.descriptor.minFilter = min;
        this.descriptor.mipmapFilter = mipmap ?? this.descriptor.mipmapFilter;
        this.dirty = true;
        return this;
    }
    setLodClamp(min, max) {
        this.descriptor.lodMaxClamp = max;
        this.descriptor.lodMinClamp = min;
        this.dirty = true;
        return this;
    }
    setMaxAnisotropy(v) {
        this.descriptor.maxAnisotropy = v;
        this.dirty = true;
        return this;
    }
    setCompare(v) {
        this.descriptor.compare = v;
        this.dirty = true;
        return this;
    }
}

class ShaderProgram {
    descriptor = {
        code: "",
    };
    name;
    dirty;
    entryPoint = "main";
    constructor(code, name = "program") {
        this.descriptor.code = code;
        this.name = name;
        this.dirty = true;
    }
    get code() {
        return this.descriptor.code;
    }
    set code(value) {
        this.descriptor.code = value;
        this.dirty = true;
    }
}

const canvases = []; // 储存多个canvas，可能存在n个图同时画
async function drawSpriteBlock(image, width, height, frame) {
    const canvas = canvases.pop() || document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (frame.rotation) {
        ctx.rotate(-constants$2.DEG_90_RAD);
        ctx.translate(-frame.w, 0);
    }
    ctx.drawImage(image, frame.x, frame.y, frame.w, frame.h, frame.dx ?? 0, frame.dy ?? 0, frame.w, frame.h);
    const result = await createImageBitmap(canvas);
    canvases.push(canvas);
    if (frame.rotation) {
        ctx.translate(frame.w, 0);
        ctx.rotate(constants$2.DEG_90_RAD);
    }
    return result;
}

class Texture {
    data;
    dirty = true;
    name;
    descriptor = {
        size: [0, 0],
        format: "rgba8unorm",
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        mipLevelCount: 1,
        sampleCount: 1,
        dimension: "2d",
        viewFormats: [],
        label: ""
    };
    constructor(options) {
        this.descriptor.size[0] = options.size[0];
        this.descriptor.size[1] = options.size[1];
        this.descriptor.format = options.format ?? "rgba8unorm";
        this.descriptor.usage = options.usage ?? (GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT);
        this.imageBitmap = options.image;
        this.name = options.name ?? 'untitled texture';
    }
    destroy() {
        this.data?.close();
        this.data = undefined;
    }
    get width() {
        return this.descriptor.size[0];
    }
    set width(v) {
        this.descriptor.size[0] = v;
    }
    get height() {
        return this.descriptor.size[1];
    }
    set height(v) {
        this.descriptor.size[1] = v;
    }
    get imageBitmap() {
        return this.data;
    }
    set imageBitmap(img) {
        this.dirty = true;
        this.data = img;
    }
}

class AtlasTexture extends Texture {
    loaded = false;
    image;
    framesBitmap = [];
    constructor(json, name = "atlas-texture") {
        super({
            size: [json.spriteSize.w, json.spriteSize.h],
            name
        });
        this.setImage(json);
    }
    async setImage(json) {
        this.loaded = false;
        this.dirty = false;
        let img = new Image();
        img.src = json.image;
        this.image = img;
        await img.decode();
        this.imageBitmap = await drawSpriteBlock(this.image, json.spriteSize.w, json.spriteSize.h, json.frame);
        this.loaded = true;
        return this;
    }
}

class ImageBitmapTexture extends Texture {
    loaded = false;
    sizeChanged = false;
    image = new Image();
    constructor(img, width, height, name = "image-texture") {
        super({
            size: [width, height],
            name,
        });
        this.setImage(img);
    }
    async setImage(img) {
        this.loaded = false;
        this.dirty = false;
        if (typeof img === "string") {
            this.image.src = img;
        }
        else if (img instanceof ImageBitmap) {
            this.dirty = true;
            this.loaded = true;
            this.data = img;
            return this;
        }
        else {
            this.image = img;
        }
        await this.image.decode();
        this.data = await createImageBitmap(this.image);
        if (this.descriptor.size[0] !== this.data.width || this.descriptor.size[1] !== this.data.height) {
            this.sizeChanged = true;
            this.width = this.data.width;
            this.height = this.data.height;
        }
        this.dirty = true;
        this.loaded = true;
        return this;
    }
}

class SpritesheetTexture extends Texture {
    loaded = false;
    frame = 0; // 当前帧索引
    image;
    framesBitmap = [];
    constructor(json, name = "spritesheet-texture") {
        super({
            size: [json.spriteSize.w, json.spriteSize.h],
            name,
        });
        this.setImage(json);
    }
    async setImage(json) {
        this.loaded = false;
        this.dirty = false;
        let img = new Image();
        img.src = json.image;
        this.image = img;
        await img.decode();
        // canvas.width = json.spriteSize.w;
        // canvas.height = json.spriteSize.h;
        for (let item of json.frames) {
            this.framesBitmap.push(await drawSpriteBlock(this.image, json.spriteSize.w, json.spriteSize.h, item));
        }
        this.data = this.framesBitmap[0];
        this.dirty = true;
        this.loaded = true;
        return this;
    }
    setFrame(frame) {
        this.frame = frame;
        this.data = this.framesBitmap[frame];
        this.dirty = true;
    }
}

class Material {
    dirty;
    vertex;
    vertexShader;
    fragmentShader;
    blend;
    uniforms;
    constructor(vertex, fragment, uniforms = [], blend = DEFAULT_BLEND_STATE) {
        this.dirty = true;
        this.vertexShader = vertex;
        this.fragmentShader = fragment;
        this.blend = blend;
        this.uniforms = uniforms;
    }
    get vertexCode() {
        return this.vertexShader.descriptor.code;
    }
    set vertexCode(code) {
        this.vertexShader.descriptor.code = code;
        this.vertexShader.dirty = true;
        this.dirty = true;
    }
    get fragmentCode() {
        return this.vertexShader.descriptor.code;
    }
    set fragmentCode(code) {
        this.fragmentShader.descriptor.code = code;
        this.fragmentShader.dirty = true;
        this.dirty = true;
    }
}

const wgslShaders$3 = {
    vertex: `
		struct Uniforms {
			 matrix : mat4x4<f32>
	  	};
	  	@binding(0) @group(0) var<uniform> uniforms : Uniforms;

		struct VertexOutput {
			@builtin(position) position : vec4<f32>,
			@location(0) uv : vec2<f32>
		};

		@vertex fn main(@location(0) position : vec3<f32>, @location(2) uv : vec2<f32>) -> VertexOutput {
			var out: VertexOutput;
			out.position = uniforms.matrix * vec4<f32>(position, 1.0);
			out.uv = uv;
			return out;
		}
	`,
    fragment: `
		@binding(1) @group(0) var mySampler: sampler;
		@binding(2) @group(0) var myTexture: texture_2d<f32>;
		@binding(3) @group(0) var<uniform> alpha: f32;

		@fragment fn main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
			return textureSample(myTexture, mySampler, uv) * vec4<f32>(1., 1., 1., alpha);
		}
	`
};
class TextureMaterial extends Material {
    constructor(texture, sampler = new Sampler()) {
        super({
            descriptor: {
                code: wgslShaders$3.vertex,
            },
            dirty: true,
        }, {
            descriptor: {
                code: wgslShaders$3.fragment,
            },
            dirty: true,
        }, [
            {
                binding: 1,
                name: "mySampler",
                type: SAMPLER,
                value: sampler,
                dirty: true
            },
            {
                binding: 2,
                name: "myTexture",
                type: TEXTURE_IMAGE,
                value: texture,
                dirty: true
            },
            {
                binding: 3,
                dirty: true,
                name: "alpha",
                type: "buffer",
                value: new BufferFloat32({
                    size: 4,
                    data: [1],
                }),
            },
        ]);
        this.dirty = true;
    }
    get sampler() {
        return this.uniforms[0].value;
    }
    set sampler(sampler) {
        this.uniforms[0].dirty = this.dirty = true;
        this.uniforms[0].value = sampler;
    }
    get texture() {
        return this.uniforms[1].value;
    }
    set texture(texture) {
        this.uniforms[1].dirty = this.dirty = true;
        this.uniforms[1].value = texture;
    }
    get alpha() {
        return this.uniforms[2].value[0];
    }
    set alpha(alpha) {
        this.uniforms[2].dirty = this.dirty = true;
        this.uniforms[2].value[0] = alpha;
    }
    setTextureAndSampler(texture, sampler) {
        this.texture = texture;
        if (sampler) {
            this.sampler = sampler;
        }
        return this;
    }
}

class Sprite3 extends Renderable {
    static RenderType = "mesh3";
    constructor(texture, width, height) {
        super({
            type: Sprite3.RenderType,
            geometry: createPlane({
                width: width ?? texture.width,
                height: height ?? texture.height,
            }),
            material: new TextureMaterial(texture)
        });
    }
}

const checkTextureCacheReuseable = (descriptor, cache) => {
    if (descriptor.size[0] !== cache.size[0]) {
        return false;
    }
    if (descriptor.size[1] !== cache.size[1]) {
        return false;
    }
    if (descriptor.format !== cache.format) {
        return false;
    }
    if (descriptor.usage !== cache.usage) {
        return false;
    }
    if (descriptor.dimension !== cache.dimension) {
        return false;
    }
    if (descriptor.sampleCount !== cache.sampleCount) {
        return false;
    }
    if (descriptor.mipLevelCount !== cache.mipLevelCount) {
        return false;
    }
    return true;
};
const checkShaderModuleCacheReuseable = (descriptor, cache) => {
    if (descriptor.code !== cache.code) {
        return false;
    }
    return true;
};
const checkBufferCacheReuseable = (descriptor, cache) => {
    if (descriptor.size !== cache.data.size) {
        return false;
    }
    if (descriptor.usage !== cache.data.usage) {
        return false;
    }
    return true;
};
const checkSamplerCacheReuseable = (descriptor, cache) => {
    if (descriptor.addressModeU !== cache.addressModeU) {
        return false;
    }
    if (descriptor.addressModeV !== cache.addressModeV) {
        return false;
    }
    if (descriptor.addressModeW !== cache.addressModeW) {
        return false;
    }
    if (descriptor.minFilter !== cache.minFilter) {
        return false;
    }
    if (descriptor.magFilter !== cache.magFilter) {
        return false;
    }
    if (descriptor.mipmapFilter !== cache.mipmapFilter) {
        return false;
    }
    if (descriptor.maxAnisotropy !== cache.maxAnisotropy) {
        return false;
    }
    if (descriptor.lodMaxClamp !== cache.lodMaxClamp) {
        return false;
    }
    if (descriptor.lodMinClamp !== cache.lodMinClamp) {
        return false;
    }
    if (descriptor.compare !== cache.compare) {
        return false;
    }
    return true;
};
const WebGPUCacheObjectStore = {
    caches: new Map(),
    getCaches: (objects) => {
        return WebGPUCacheObjectStore.caches.get(objects);
    },
    getCache: (key, device) => {
        const caches = WebGPUCacheObjectStore.getCaches(key);
        return caches?.get(device);
    },
    clearCaches: (objects) => {
        const map = WebGPUCacheObjectStore.caches.get(objects);
        if (map) {
            map.forEach((cache) => {
                cache.data.destroy?.();
            });
            map.clear();
        }
        return WebGPUCacheObjectStore;
    },
    clearCache: (objects, device) => {
        const map = WebGPUCacheObjectStore.caches.get(objects);
        if (map) {
            const cache = map.get(device);
            if (cache) {
                cache.data.destroy?.();
                map.delete(device);
            }
        }
        return WebGPUCacheObjectStore;
    },
    createGPUTextureCache: (texture, device) => {
        let map = WebGPUCacheObjectStore.caches.get(texture);
        if (!map) {
            map = new Map();
            WebGPUCacheObjectStore.caches.set(texture, map);
        }
        let cache = map.get(device);
        if (cache) {
            if (checkTextureCacheReuseable(texture.descriptor, cache)) {
                cache.dirty = true;
                return cache;
            }
            else {
                cache.data.destroy();
            }
        }
        cache = {
            dirty: true,
            data: device.createTexture(texture.descriptor),
            ...texture.descriptor
        };
        map.set(device, cache);
        return cache;
    },
    createGPUBufferCache: (buffer, device) => {
        let map = WebGPUCacheObjectStore.caches.get(buffer);
        if (!map) {
            map = new Map();
            WebGPUCacheObjectStore.caches.set(buffer, map);
        }
        let cache = map.get(device);
        if (cache) {
            if (checkBufferCacheReuseable(buffer.descriptor, cache)) {
                cache.dirty = true;
                cache.data.label = buffer.name;
                return cache;
            }
            else {
                cache.data.destroy();
            }
        }
        cache = {
            dirty: true,
            data: device.createBuffer(buffer.descriptor),
            ...buffer.descriptor,
        };
        map.set(device, cache);
        return cache;
    },
    createGPUSamplerCache: (sampler, device) => {
        let map = WebGPUCacheObjectStore.caches.get(sampler);
        if (!map) {
            map = new Map();
            WebGPUCacheObjectStore.caches.set(sampler, map);
        }
        let cache = map.get(device);
        if (cache) {
            if (checkSamplerCacheReuseable(sampler.descriptor, cache)) {
                cache.dirty = true;
                cache.data.label = sampler.name;
                return cache;
            }
        }
        cache = {
            dirty: true,
            data: device.createSampler(sampler.descriptor),
            ...sampler.descriptor,
        };
        map.set(device, cache);
        return cache;
    },
    createGPUShaderModuleCache: (shaderProgram, device) => {
        let map = WebGPUCacheObjectStore.caches.get(shaderProgram);
        if (!map) {
            map = new Map();
            WebGPUCacheObjectStore.caches.set(shaderProgram, map);
        }
        let cache = map.get(device);
        if (cache) {
            if (checkShaderModuleCacheReuseable(shaderProgram.descriptor, cache)) {
                cache.dirty = true;
                cache.data.label = shaderProgram.name;
                return cache;
            }
        }
        cache = {
            dirty: true,
            data: device.createShaderModule(shaderProgram.descriptor),
            ...shaderProgram.descriptor,
        };
        map.set(device, cache);
        return cache;
    },
    // 一对多关系，所以原始引擎对象dirty需要和缓存对象挂钩
    setDirty: (key, device) => {
        const caches = WebGPUCacheObjectStore.getCaches(key);
        if (caches) {
            if (device) {
                const a = caches.get(device);
                if (a) {
                    a.dirty = true;
                }
            }
            else {
                caches.forEach((cache) => {
                    cache.dirty = true;
                });
            }
        }
        return WebGPUCacheObjectStore;
    },
    // 后续引擎对象的dirty需要和这个挂钩
    checkDirty: (key, device) => {
        const caches = WebGPUCacheObjectStore.getCaches(key);
        if (!caches) {
            return true;
        }
        if (device) {
            const cache = caches.get(device);
            if (cache?.dirty) {
                return true;
            }
            return false;
        }
        let result = false;
        caches.forEach((c) => {
            if (c.dirty) {
                result = true;
            }
        });
        return result;
    },
    getDirtyCache: (key, device) => {
        const caches = WebGPUCacheObjectStore.getCaches(key);
        if (!caches) {
            return null;
        }
        return caches.get(device);
    }
};

let descriptor = {
    size: 0,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true
};
var createVerticesBuffer = (device, data) => {
    descriptor.size = data.byteLength;
    let buffer = device.createBuffer(descriptor);
    new Float32Array(buffer.getMappedRange()).set(data);
    buffer.unmap();
    return buffer;
};

class WebGPUMesh2Renderer {
    static renderTypes = MESH2;
    renderTypes = MESH2;
    camera;
    entityCacheData = new Map();
    constructor(camera) {
        this.camera = camera;
    }
    clearCache() {
        this.entityCacheData.clear();
        return this;
    }
    render(entity, context) {
        let cacheData = this.entityCacheData.get(entity);
        let mesh2 = entity.getComponent(RENDERABLE);
        let material = mesh2.material;
        let geometry = mesh2.geometry;
        if (!cacheData || material.dirty || material !== cacheData.material || geometry !== cacheData.geometry) {
            cacheData = this.createCacheData(entity, context);
            this.entityCacheData.set(entity, cacheData);
        }
        else {
            // TODO update cache
            updateModelMatrixComponent$1(entity);
        }
        context.passEncoder.setPipeline(cacheData.pipeline);
        // passEncoder.setScissorRect(0, 0, 400, 225);
        // TODO 有多个attribute buffer
        for (let i = 0; i < cacheData.attributesBuffers.length; i++) {
            context.passEncoder.setVertexBuffer(i, cacheData.attributesBuffers[i]);
        }
        const mvp = cacheData.mvp;
        const mvpExt = cacheData.mvpExt;
        Matrix3.multiply(this.camera.projection.data, Matrix3.invert(updateModelMatrixComponent$1(this.camera).data), mvp);
        Matrix3.multiply(mvp, entity.worldMatrix.data, mvp);
        fromMatrix3MVP(mvp, mvpExt);
        context.device.queue.writeBuffer(cacheData.uniformBuffer, 0, mvpExt.buffer, mvpExt.byteOffset, mvpExt.byteLength);
        cacheData.uniformMap.forEach((uniform, key) => {
            if (uniform.type === BUFFER && uniform.dirty) {
                context.device.queue.writeBuffer(key, 0, uniform.value.buffer, uniform.value.byteOffset, uniform.value.byteLength);
                uniform.dirty = false;
            }
            else if (uniform.type === TEXTURE_IMAGE && (uniform.dirty || uniform.value.dirty)) {
                if (uniform.value.loaded) {
                    if (uniform.value.data) {
                        context.device.queue.copyExternalImageToTexture({ source: uniform.value.data }, { texture: key }, [uniform.value.data.width, uniform.value.data.height, 1]);
                        uniform.value.dirty = uniform.dirty = false;
                    }
                }
            }
        });
        context.passEncoder.setBindGroup(0, cacheData.uniformBindGroup);
        context.passEncoder.draw(geometry.count, 1, 0, 0);
        return this;
    }
    createCacheData(entity, context) {
        updateModelMatrixComponent$1(entity);
        let device = context.device;
        let uniformBuffer = device.createBuffer({
            size: 64,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        const mesh = entity.getComponent(RENDERABLE);
        let buffers = [];
        let geometry = mesh.geometry;
        let material = mesh.material;
        let nodes = geometry.data;
        for (let i = 0; i < nodes.length; i++) {
            buffers.push(createVerticesBuffer(device, nodes[i].data));
        }
        let pipeline = this.createPipeline(geometry, material, context);
        let groupEntries = [{
                binding: 0,
                resource: {
                    buffer: uniformBuffer,
                },
            }];
        let uniforms = material.uniforms;
        let uniformMap = new Map();
        if (uniforms) {
            for (let i = 0; i < uniforms.length; i++) {
                let uniform = uniforms[i];
                if (uniform.type === BUFFER) {
                    let buffer = device.createBuffer({
                        size: uniform.value.length * 4,
                        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
                    });
                    uniformMap.set(buffer, uniform);
                    groupEntries.push({
                        binding: uniform.binding,
                        resource: {
                            buffer
                        }
                    });
                }
                else if (uniform.type === SAMPLER) {
                    let sampler = device.createSampler(uniform.value.data);
                    uniformMap.set(sampler, uniform);
                    groupEntries.push({
                        binding: uniform.binding,
                        resource: sampler
                    });
                }
                else if (uniform.type === TEXTURE_IMAGE) {
                    let texture = uniform.value instanceof GPUTexture ? uniform.value : device.createTexture({
                        size: [uniform.value.width || uniform.value.image.naturalWidth, uniform.value.height || uniform.value.image.naturalHeight, 1],
                        format: 'rgba8unorm',
                        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
                    });
                    uniformMap.set(texture, uniform);
                    groupEntries.push({
                        binding: uniform.binding,
                        resource: texture.createView()
                    });
                }
            }
        }
        let uniformBindGroup = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: groupEntries,
        });
        return {
            mvpExt: new Matrix4(),
            mvp: new Matrix3(),
            attributesBuffers: buffers,
            uniformBuffer,
            uniformBindGroup,
            pipeline,
            uniformMap,
            material,
            geometry
        };
    }
    createPipeline(geometry, material, context) {
        const pipelineLayout = context.device.createPipelineLayout({
            bindGroupLayouts: [this.createBindGroupLayout(material, context)],
        });
        let vertexBuffers = this.parseGeometryBufferLayout(geometry);
        let stages = this.createStages(material, vertexBuffers, context);
        let pipeline = context.device.createRenderPipeline({
            layout: pipelineLayout,
            vertex: stages.vertex,
            fragment: stages.fragment,
            primitive: {
                topology: geometry.topology,
                cullMode: geometry.cullMode,
                frontFace: geometry.frontFace,
            },
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth24plus',
            },
        });
        return pipeline;
    }
    parseGeometryBufferLayout(geometry) {
        let vertexBuffers = [];
        let location = 0;
        for (let i = 0; i < geometry.data.length; i++) {
            let data = geometry.data[i];
            let attributeDescripters = [];
            for (let j = 0; j < data.attributes.length; j++) {
                attributeDescripters.push({
                    shaderLocation: location++,
                    offset: data.attributes[j].offset * data.data.BYTES_PER_ELEMENT,
                    format: "float32x" + data.attributes[j].length,
                });
            }
            vertexBuffers.push({
                arrayStride: geometry.data[i].stride * geometry.data[i].data.BYTES_PER_ELEMENT,
                attributes: attributeDescripters
            });
        }
        return vertexBuffers;
    }
    createBindGroupLayout(material, context) {
        let uniforms = material.uniforms;
        let entries = [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: 'uniform',
                }
            }
        ];
        if (uniforms) {
            for (let i = 0; i < uniforms.length; i++) {
                if (uniforms[i].type === SAMPLER) {
                    entries.push({
                        visibility: GPUShaderStage.FRAGMENT,
                        binding: uniforms[i].binding,
                        sampler: {
                            type: 'filtering'
                        },
                    });
                }
                else if (uniforms[i].type === TEXTURE_IMAGE) {
                    entries.push({
                        visibility: GPUShaderStage.FRAGMENT,
                        binding: uniforms[i].binding,
                        texture: {
                            sampleType: 'float',
                        },
                    });
                }
                else {
                    entries.push({
                        visibility: GPUShaderStage.FRAGMENT,
                        binding: uniforms[i].binding,
                        buffer: {
                            type: 'uniform',
                        }
                    });
                }
            }
        }
        return context.device.createBindGroupLayout({
            entries,
        });
    }
    createStages(material, vertexBuffers, context) {
        let vertex = {
            module: context.device.createShaderModule({
                code: material.vertexShader.descriptor.code,
            }),
            entryPoint: "main",
            buffers: vertexBuffers
        };
        let fragment = {
            module: context.device.createShaderModule({
                code: material.fragmentShader.descriptor.code,
            }),
            entryPoint: "main",
            targets: [
                {
                    format: context.preferredFormat,
                    blend: material.blend
                }
            ]
        };
        material.dirty = false;
        return {
            vertex,
            fragment
        };
    }
}
function fromMatrix3MVP(data, out = new Matrix4()) {
    out[0] = data[0];
    out[1] = data[1];
    out[2] = 0;
    out[3] = 0;
    out[4] = data[3];
    out[5] = data[4];
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = data[6];
    out[13] = data[7];
    out[14] = 0;
    out[15] = 1;
    return out;
}

class WebGPUMesh3Renderer {
    static renderTypes = MESH3;
    renderTypes = MESH3;
    camera;
    entityCacheData = new Map();
    constructor(camera) {
        this.camera = camera;
    }
    clearCache() {
        this.entityCacheData.clear();
        return this;
    }
    render(entity, context) {
        let cacheData = this.entityCacheData.get(entity);
        // 假设更换了几何体和材质则重新生成缓存
        let mesh3 = entity.getComponent(RENDERABLE);
        let material = mesh3.material;
        let geometry = mesh3.geometry;
        // TODO 哪个改了更新对应cache
        if (!cacheData || material.dirty || material !== cacheData.material || geometry !== cacheData.geometry || geometry.dirty) {
            cacheData = this.createCacheData(entity, context);
            this.entityCacheData.set(entity, cacheData);
        }
        else {
            // TODO update cache
            updateModelMatrixComponent(entity);
        }
        context.passEncoder.setPipeline(cacheData.pipeline);
        // passEncoder.setScissorRect(0, 0, 400, 225);
        // TODO 有多个attribute buffer
        for (let i = 0; i < cacheData.attributesBuffers.length; i++) {
            context.passEncoder.setVertexBuffer(i, cacheData.attributesBuffers[i]);
        }
        const mvp = cacheData.mvp;
        Matrix4.multiply(this.camera.projection.data, Matrix4.invert(updateModelMatrixComponent(this.camera).data), mvp);
        Matrix4.multiply(mvp, entity.worldMatrix.data, mvp);
        context.device.queue.writeBuffer(cacheData.uniformBuffer, 0, mvp.buffer, mvp.byteOffset, mvp.byteLength);
        cacheData.uniformMap.forEach((uniform, key) => {
            if (uniform.type === BUFFER && uniform.dirty) {
                context.device.queue.writeBuffer(key, 0, uniform.value.buffer, uniform.value.byteOffset, uniform.value.byteLength);
                uniform.dirty = false;
            }
            else if (uniform.type === TEXTURE_IMAGE && (uniform.dirty || uniform.value.dirty)) {
                if (uniform.value.loaded !== false) {
                    if (uniform.value.data) {
                        context.device.queue.copyExternalImageToTexture({ source: uniform.value.data }, { texture: key }, [uniform.value.data.width, uniform.value.data.height, 1]);
                        uniform.value.dirty = uniform.dirty = false;
                    }
                }
            }
        });
        context.passEncoder.setBindGroup(0, cacheData.uniformBindGroup);
        context.passEncoder.draw(geometry.count, 1, 0, 0);
        return this;
    }
    createCacheData(entity, context) {
        updateModelMatrixComponent(entity);
        const device = context.device;
        const uniformBuffer = device.createBuffer({
            size: 64,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        const buffers = [];
        const mesh3 = entity.getComponent(RENDERABLE);
        const geometry = mesh3.geometry;
        geometry.dirty = false;
        let material = mesh3.material;
        let nodes = geometry.data;
        for (let i = 0; i < nodes.length; i++) {
            buffers.push(createVerticesBuffer(device, nodes[i].data));
        }
        let pipeline = this.createPipeline(geometry, material, context);
        let groupEntries = [{
                binding: 0,
                resource: {
                    buffer: uniformBuffer,
                },
            }];
        let uniforms = material.uniforms;
        let uniformMap = new Map();
        if (uniforms) {
            for (let i = 0; i < uniforms.length; i++) {
                const uniform = uniforms[i];
                if (uniform.type === BUFFER) {
                    const buffer = WebGPUCacheObjectStore.createGPUBufferCache(uniform.value, device).data;
                    uniformMap.set(buffer, uniform);
                    groupEntries.push({
                        binding: uniform.binding,
                        resource: {
                            buffer
                        }
                    });
                }
                else if (uniform.type === SAMPLER) {
                    const sampler = WebGPUCacheObjectStore.createGPUSamplerCache(uniform.value, device).data;
                    uniformMap.set(sampler, uniform);
                    groupEntries.push({
                        binding: uniform.binding,
                        resource: sampler
                    });
                }
                else if (uniform.type === TEXTURE_IMAGE) {
                    uniform.value.dirty = true;
                    uniform.dirty = true;
                    const texture = WebGPUCacheObjectStore.createGPUTextureCache(uniform.value, device).data;
                    uniformMap.set(texture, uniform);
                    groupEntries.push({
                        binding: uniform.binding,
                        resource: texture.createView()
                    });
                }
            }
        }
        const uniformBindGroup = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: groupEntries,
        });
        return {
            mvp: new Float32Array(16),
            attributesBuffers: buffers,
            uniformBuffer,
            uniformBindGroup,
            pipeline,
            uniformMap,
            material,
            geometry
        };
    }
    createPipeline(geometry, material, context) {
        const pipelineLayout = context.device.createPipelineLayout({
            bindGroupLayouts: [this.createBindGroupLayout(material, context)],
        });
        const vertexBuffers = this.parseGeometryBufferLayout(geometry);
        const stages = this.createStages(material, vertexBuffers, context);
        const des = {
            layout: pipelineLayout,
            vertex: stages.vertex,
            fragment: stages.fragment,
            primitive: {
                topology: geometry.topology,
                cullMode: geometry.cullMode,
                frontFace: geometry.frontFace,
            },
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth24plus',
            }
        };
        if (context.multisample) {
            des.multisample = context.multisample;
        }
        return context.device.createRenderPipeline(des);
    }
    parseGeometryBufferLayout(geometry) {
        let vertexBuffers = [];
        let location = 0;
        for (let i = 0; i < geometry.data.length; i++) {
            let data = geometry.data[i];
            let attributeDescripters = [];
            for (let j = 0; j < data.attributes.length; j++) {
                attributeDescripters.push({
                    shaderLocation: location++,
                    offset: data.attributes[j].offset * data.data.BYTES_PER_ELEMENT,
                    format: "float32x" + data.attributes[j].length,
                });
            }
            vertexBuffers.push({
                arrayStride: geometry.data[i].stride * geometry.data[i].data.BYTES_PER_ELEMENT,
                attributes: attributeDescripters
            });
        }
        return vertexBuffers;
    }
    createBindGroupLayout(material, context) {
        let uniforms = material.uniforms;
        let entries = [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: 'uniform',
                }
            }
        ];
        if (uniforms) {
            for (let i = 0; i < uniforms.length; i++) {
                if (uniforms[i].type === SAMPLER) {
                    entries.push({
                        visibility: GPUShaderStage.FRAGMENT,
                        binding: uniforms[i].binding,
                        sampler: {
                            type: 'filtering'
                        },
                    });
                }
                else if (uniforms[i].type === TEXTURE_IMAGE) {
                    entries.push({
                        visibility: GPUShaderStage.FRAGMENT,
                        binding: uniforms[i].binding,
                        texture: {
                            sampleType: 'float',
                        },
                    });
                }
                else {
                    entries.push({
                        visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX,
                        binding: uniforms[i].binding,
                        buffer: {
                            type: 'uniform',
                        }
                    });
                }
            }
        }
        return context.device.createBindGroupLayout({
            entries,
        });
    }
    createStages(material, vertexBuffers, context) {
        let vertex = {
            module: WebGPUCacheObjectStore.createGPUShaderModuleCache(material.vertexShader, context.device).data,
            entryPoint: material.vertexShader.entryPoint ?? "main",
            buffers: vertexBuffers
        };
        let fragment = {
            module: WebGPUCacheObjectStore.createGPUShaderModuleCache(material.fragmentShader, context.device).data,
            entryPoint: material.fragmentShader.entryPoint ?? "main",
            targets: [
                {
                    format: context.preferredFormat,
                    blend: material.blend
                }
            ]
        };
        material.dirty = false;
        return {
            vertex,
            fragment
        };
    }
}

const plane = new Float32Array([
    -1, 1, 0, 0,
    1, 1, 1, 0,
    -1, -1, 0, 1,
    1, -1, 1, 1,
]);
const vertexShader$2 = `
struct VertexOutput {
    @builtin(position) position : vec4<f32>,
    @location(0) uv : vec2<f32>
}
  
@vertex
fn main(
    @location(0) position : vec2<f32>,
    @location(1) uv : vec2<f32>
) -> VertexOutput {
    var output : VertexOutput;
    output.position = vec4(position, 0., 1.);
    output.uv = uv;
    return output;
}`;
class WebGPUPostProcessingPass {
    pipeline;
    shader;
    dirty;
    verticesBuffer;
    sampler;
    name;
    constructor(name, shader) {
        this.shader = shader;
        this.name = name;
        this.dirty = true;
    }
    update(context) {
        if (!this.dirty) {
            return this;
        }
        this.sampler = context.device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear',
        });
        this.verticesBuffer = context.device.createBuffer({
            size: plane.byteLength,
            usage: GPUBufferUsage.VERTEX,
            mappedAtCreation: true,
        });
        new Float32Array(this.verticesBuffer.getMappedRange()).set(plane);
        this.verticesBuffer.unmap();
        let entries = [
            {
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT,
                sampler: {
                    type: 'filtering'
                },
            },
            {
                binding: 1,
                visibility: GPUShaderStage.FRAGMENT,
                texture: {
                    sampleType: 'float',
                },
            }
        ];
        const pipelineLayout = context.device.createPipelineLayout({
            bindGroupLayouts: [context.device.createBindGroupLayout({
                    entries,
                })],
        });
        this.pipeline = context.device.createRenderPipeline({
            layout: pipelineLayout,
            vertex: {
                module: context.device.createShaderModule({
                    code: vertexShader$2,
                }),
                entryPoint: 'main',
                buffers: [
                    {
                        arrayStride: 16,
                        attributes: [
                            {
                                // position
                                shaderLocation: 0,
                                offset: 0,
                                format: 'float32x2',
                            },
                            {
                                // uv
                                shaderLocation: 1,
                                offset: 8,
                                format: 'float32x2',
                            },
                        ],
                    },
                ],
            },
            fragment: {
                module: context.device.createShaderModule({
                    code: this.shader,
                }),
                entryPoint: 'main',
                targets: [
                    {
                        format: context.preferredFormat,
                    },
                ],
            },
            primitive: {
                topology: 'triangle-strip',
            },
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth24plus',
            },
        });
        this.dirty = false;
        return this;
    }
    render(context, texture) {
        this.update(context);
        const uniformBindGroup = context.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: this.sampler,
                },
                {
                    binding: 1,
                    resource: texture.createView(),
                },
            ],
        });
        const passEncoder = context.passEncoder;
        passEncoder.setPipeline(this.pipeline);
        passEncoder.setBindGroup(0, uniformBindGroup);
        passEncoder.setVertexBuffer(0, this.verticesBuffer);
        passEncoder.draw(4, 1, 0, 0);
    }
}

class WebGPURenderSystem extends RenderSystemInCanvas {
    static async detect(canvas = document.createElement("canvas")) {
        const gpu = canvas.getContext("webgpu");
        if (!gpu) {
            throw new Error('WebGPU not supported: ');
        }
        const adapter = await navigator?.gpu?.requestAdapter();
        if (!adapter) {
            throw new Error('WebGPU not supported: ');
        }
        const device = await adapter.requestDevice();
        if (!device) {
            throw new Error('WebGPU not supported: ');
        }
        return { gpu, adapter, device };
    }
    rendererMap = new Map();
    inited = false;
    context = undefined;
    commandEncoder;
    swapChainTexture;
    targetTexture;
    msaaTexture;
    postprocessingPasses = new Set();
    renderPassDescriptor;
    constructor(name = "WebGPU Render System", options = {}) {
        super(name, options);
        WebGPURenderSystem.detect(this.canvas).then((data) => {
            this.context = data;
            this.context.preferredFormat = navigator.gpu.getPreferredCanvasFormat();
            this.setMSAA(options.multisample ?? false);
            this.setRenderPassDescripter();
            data.gpu.configure({
                device: data.device,
                usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
                format: this.context.preferredFormat,
                alphaMode: "premultiplied"
            });
            this.targetTexture = this.context.device.createTexture({
                size: [this.canvas.width, this.canvas.height],
                format: this.context.preferredFormat,
                usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_DST | GPUTextureUsage.COPY_SRC
            });
            if (options.multisample?.count > 1) {
                this.msaaTexture = this.context.device.createTexture({
                    size: [this.canvas.width, this.canvas.height],
                    format: this.context.preferredFormat,
                    sampleCount: this.context.multisample ? (this.context.multisample.count ?? 1) : 1,
                    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
                });
            }
            this.inited = true;
        });
    }
    setMSAA(data) {
        this.endTaskQueue.push(() => {
            if (typeof data === 'boolean') {
                if (data) {
                    this.context.multisample = {
                        count: 4
                    };
                }
                else {
                    delete this.context.multisample;
                }
            }
            else {
                if (data.count === 1) {
                    delete this.context.multisample;
                }
                else {
                    this.context.multisample = data;
                }
            }
            this.setRenderPassDescripter();
            for (const renderer of this.rendererMap) {
                renderer[1].clearCache();
            }
        });
        return this;
    }
    resize(width, height, resolution = this.resolution) {
        super.resize(width, height, resolution);
        if (this.context) {
            this.setRenderPassDescripter();
            if (this.targetTexture) {
                this.targetTexture.destroy();
            }
            if (this.msaaTexture) {
                this.msaaTexture.destroy();
                this.msaaTexture = undefined;
            }
            this.targetTexture = this.context.device.createTexture({
                size: [this.canvas.width, this.canvas.height],
                format: this.context.preferredFormat,
                usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST
            });
        }
        return this;
    }
    run(world, time, delta) {
        if (!this.inited) {
            return this;
        }
        this.loopStart();
        const w = this.canvas.width;
        const h = this.canvas.height;
        const passEncoder = this.context.passEncoder;
        passEncoder.setViewport(this.viewport.x * w, this.viewport.y * h, this.viewport.width * w, this.viewport.height * h, this.viewport.minDepth, this.viewport.maxDepth);
        passEncoder.setScissorRect(this.scissor.x * w, this.scissor.y * h, this.scissor.width * w, this.scissor.height * h);
        super.run(world, time, delta);
        this.postprocess(world, time, delta);
        this.loopEnd();
        return this;
    }
    #scissor = {
        x: 0,
        y: 0,
        width: 1,
        height: 1
    };
    get scissor() {
        return this.#scissor;
    }
    set scissor(value) {
        this.#scissor = value;
    }
    handle(entity) {
        if (entity.disabled) {
            return this;
        }
        // 根据不同类别进行渲染
        this.rendererMap.get(entity.getComponent(RENDERABLE)?.data.type)?.render(entity, this.context);
        return this;
    }
    loopStart() {
        this.commandEncoder = this.context.device.createCommandEncoder();
        this.swapChainTexture = this.context.gpu.getCurrentTexture();
        if (this.context.multisample?.count > 1) {
            if (!this.msaaTexture) {
                this.msaaTexture = this.context.device.createTexture({
                    size: [this.canvas.width, this.canvas.height],
                    format: this.context.preferredFormat,
                    sampleCount: this.context.multisample ? (this.context.multisample.count ?? 1) : 1,
                    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
                });
            }
            this.renderPassDescriptor.colorAttachments[0].view = this.msaaTexture.createView();
            this.renderPassDescriptor.colorAttachments[0].resolveTarget = this.swapChainTexture.createView();
        }
        else {
            this.renderPassDescriptor.colorAttachments[0].view = this.swapChainTexture.createView();
        }
        this.context.passEncoder = this.commandEncoder.beginRenderPass(this.renderPassDescriptor);
    }
    addPostprocessingPass(pass) {
        this.postprocessingPasses.add(pass);
    }
    removePostprocessingPass(pass) {
        this.postprocessingPasses.delete(pass);
    }
    postprocess(world, time, delta) {
        this.postprocessingPasses.forEach((pass) => {
            this.context.passEncoder.end();
            this.commandEncoder.copyTextureToTexture({
                texture: this.swapChainTexture,
            }, {
                texture: this.targetTexture,
            }, [this.canvas.width, this.canvas.height]);
            this.context.passEncoder = this.commandEncoder.beginRenderPass(this.renderPassDescriptor);
            pass.render(this.context, this.targetTexture);
            // super.run(world, time, delta);
        });
    }
    loopEnd() {
        this.context.passEncoder.end();
        this.context.device.queue.submit([this.commandEncoder.finish()]);
        while (this.endTaskQueue.length) {
            this.endTaskQueue.shift()();
        }
    }
    endTaskQueue = [];
    #depthTexture;
    setRenderPassDescripter() {
        if (this.#depthTexture) {
            this.#depthTexture.destroy();
        }
        let renderPassDescriptor = {
            colorAttachments: [
                {
                    view: null,
                    loadOp: "clear",
                    clearValue: this.clearColorGPU,
                    storeOp: "store"
                }
            ]
        };
        if (!this.options.noDepthTexture) {
            this.#depthTexture = this.context.device.createTexture({
                size: { width: this.canvas.width, height: this.canvas.height, depthOrArrayLayers: 1 },
                format: "depth24plus",
                sampleCount: this.context.multisample ? (this.context.multisample.count ?? 1) : 1,
                usage: GPUTextureUsage.RENDER_ATTACHMENT
            });
            renderPassDescriptor.depthStencilAttachment = {
                view: this.#depthTexture.createView(),
                depthClearValue: 1.0,
                depthLoadOp: "clear",
                depthStoreOp: "store"
            };
        }
        this.renderPassDescriptor = renderPassDescriptor;
    }
}

const wgslShaders$2 = {
    vertex: `
		struct Uniforms {
			modelViewProjectionMatrix : mat4x4<f32>
	  	};
	  	@binding(0) @group(0) var<uniform> uniforms : Uniforms;

		struct VertexOutput {
			@builtin(position) position : vec4<f32>
		};

		@vertex fn main(@location(0) position : vec3<f32>) -> VertexOutput {
			var out: VertexOutput;
			out.position = uniforms.modelViewProjectionMatrix * vec4<f32>(position, 1.0);
			return out;
		}
	`,
    fragment: `
	  	@binding(1) @group(0) var<uniform> color : vec4<f32>;

		@fragment fn main() -> @location(0) vec4<f32> {
			return color;
		}
	`
};
class ColorMaterial extends Material {
    constructor(color = new Float32Array([1, 1, 1, 1])) {
        super({
            descriptor: {
                code: wgslShaders$2.vertex,
            },
            dirty: true
        }, {
            descriptor: {
                code: wgslShaders$2.fragment,
            },
            dirty: true
        }, [{
                name: "color",
                value: color,
                binding: 1,
                dirty: true,
                type: BUFFER
            }]);
        this.dirty = true;
    }
    setColor(r, g, b, a) {
        this.uniforms[0].value[0] = r;
        this.uniforms[0].value[1] = g;
        this.uniforms[0].value[2] = b;
        this.uniforms[0].value[3] = a;
        this.uniforms[0].dirty = true;
        return this;
    }
}

const wgslShaders$1 = {
    vertex: `
		struct Uniforms {
			modelViewProjectionMatrix : mat4x4<f32>
	  	};
	  	@binding(0) @group(0) var<uniform> uniforms : Uniforms;

		struct VertexOutput {
			@builtin(position) position : vec4<f32>
		};

		@vertex fn main(@location(0) position : vec3<f32>) -> VertexOutput {
			var out: VertexOutput;
			out.position = uniforms.modelViewProjectionMatrix * vec4<f32>(position, 1.0);
			return out;
		}
	`,
    fragment: `
	  	@binding(1) @group(0) var<uniform> color : vec4<f32>;

		@fragment fn main() -> @location(0) vec4<f32> {
			return color;
		}
	`
};
class DomMaterial extends Material {
    constructor() {
        super({
            descriptor: {
                code: wgslShaders$1.vertex,
            },
            dirty: true
        }, {
            descriptor: {
                code: wgslShaders$1.fragment,
            },
            dirty: true,
        }, [{
                name: "backgroundColor",
                value: new ColorGPU(),
                binding: 1,
                dirty: true,
                type: BUFFER
            }, {
                name: "borderColor",
                value: new ColorGPU(1, 1, 1, 1),
                binding: 2,
                dirty: true,
                type: BUFFER
            }, {
                name: "size",
                value: new Vector4(128, 32, 0, 0),
                binding: 3,
                dirty: true,
                type: BUFFER
            }, {
                name: "borderWidth",
                value: new Vector4(2, 2, 2, 2),
                binding: 4,
                dirty: true,
                type: BUFFER
            }, {
                name: "borderRadius",
                value: new Vector4(10, 10, 10, 10),
                binding: 5,
                dirty: true,
                type: BUFFER
            }]);
        this.dirty = true;
    }
    get backgroundColor() {
        return this.uniforms[0].value;
    }
    set backgroundColor(c) {
        this.uniforms[0].value = c;
        this.uniforms[0].dirty = true;
        this.dirty = true;
    }
    get borderColor() {
        return this.uniforms[1].value;
    }
    set borderColor(c) {
        this.uniforms[1].value = c;
        this.uniforms[1].dirty = true;
        this.dirty = true;
    }
    get height() {
        return this.uniforms[2].value[1];
    }
    set height(c) {
        this.uniforms[2].value[1] = c;
        this.uniforms[2].dirty = true;
        this.dirty = true;
    }
    get width() {
        return this.uniforms[2].value[0];
    }
    set width(c) {
        this.uniforms[2].value[0] = c;
        this.uniforms[2].dirty = true;
        this.dirty = true;
    }
}

const vertexShader$1 = `
struct Uniforms {
	modelViewProjectionMatrix : mat4x4<f32>
};

@binding(0) @group(0) var<uniform> uniforms : Uniforms;

struct VertexOutput {
	@builtin(position) position : vec4<f32>,
	@location(0) depth : vec4<f32>
};

@vertex fn main(@location(0) position : vec3<f32>) -> VertexOutput {
	var out: VertexOutput;
	out.position = uniforms.modelViewProjectionMatrix * vec4<f32>(position, 1.0);
	out.depth = out.position;
	return out;
}`;
const fragmentShader$1 = `
// let PackUpscale: f32 = 1.003921568627451;
// let PackFactors: vec3<f32> = vec3<f32>( 256., 256., 256. );
// let ShiftRight8: f32 = 0.00390625;
// fn packDepthToRGBA(v: f32 ) -> vec4<f32> {
// 	var r: vec4<f32> = vec4<f32>( fract( v * PackFactors ), v );
// 	r = vec4<f32>(r.x, r.y - r.x * ShiftRight8, r.z - r.y * ShiftRight8, r.w - r.z * ShiftRight8);
// 	return r * PackUpscale;
// }
@fragment fn main(@location(0) depth : vec4<f32>) -> @location(0) vec4<f32> {
	var fragCoordZ: f32 = depth.z / depth.w;
	return vec4<f32>(vec3<f32>(pow(fragCoordZ, 490.)), 1.0);
}`;
class DepthMaterial extends Material {
    constructor() {
        super({
            descriptor: {
                code: vertexShader$1,
            },
            dirty: true
        }, {
            descriptor: {
                code: fragmentShader$1,
            },
            dirty: true
        }, []);
        this.dirty = true;
    }
}

const vertexShader = `
struct Uniforms {
	modelViewProjectionMatrix : mat4x4<f32>
};
@binding(0) @group(0) var<uniform> uniforms : Uniforms;

struct VertexOutput {
	@builtin(position) position : vec4<f32>,
	@location(0) normal : vec4<f32>
};

@vertex fn main(@location(0) position : vec3<f32>, @location(1) normal : vec3<f32>) -> VertexOutput {
	var out: VertexOutput;
	out.position = uniforms.modelViewProjectionMatrix * vec4<f32>(position, 1.0);
	out.normal = abs(normalize(uniforms.modelViewProjectionMatrix * vec4<f32>(normal, 0.0)));
	return out;
}`;
const fragmentShader = `
@fragment fn main(@location(0) normal : vec4<f32>) -> @location(0) vec4<f32> {
	return vec4<f32>(normal.x, normal.y, normal.z, 1.0);
}`;
class NormalMaterial extends Material {
    constructor() {
        super({
            descriptor: {
                code: vertexShader,
            },
            dirty: true,
        }, {
            descriptor: {
                code: fragmentShader,
            },
            dirty: true,
        }, []);
        this.dirty = true;
    }
}

class ShaderMaterial extends Material {
    constructor(vertex, fragment, uniforms = [], blend) {
        super({
            descriptor: {
                code: vertex,
            },
            dirty: true,
        }, {
            descriptor: {
                code: fragment,
            },
            dirty: true,
        }, uniforms, blend);
        this.dirty = true;
    }
}

const CommonData = {
    date: new Date(),
    vs: `struct Uniforms {
        matrix: mat4x4<f32>
    }
    @binding(0) @group(0) var<uniform> uniforms: Uniforms;

    struct VertexOutput {
        @builtin(position) position: vec4<f32>,
        @location(0) uv: vec2<f32>
    }

    @vertex fn main(@location(0) position: vec3<f32>, @location(2) uv: vec2<f32>) -> VertexOutput {
        var out: VertexOutput;
        out.position = uniforms.matrix * vec4<f32>(position, 1.0);
        out.uv = uv;
        return out;
    }
    `
};
const emptyTexture = new Texture({
    size: [512, 512]
});
class ShadertoyMaterial extends Material {
    dataD;
    constructor(fs, sampler = new Sampler()) {
        super({
            descriptor: {
                code: CommonData.vs,
            },
            dirty: true,
        }, {
            descriptor: {
                code: fs,
            },
            dirty: true,
        }, [
            {
                name: "iSampler0",
                type: SAMPLER,
                value: sampler,
                binding: 1,
                dirty: true,
            },
            {
                name: "iChannel0",
                type: TEXTURE_IMAGE,
                value: emptyTexture,
                binding: 2,
                dirty: true,
            },
            {
                name: "iChannel1",
                type: TEXTURE_IMAGE,
                value: emptyTexture,
                binding: 3,
                dirty: true,
            },
            {
                name: "iChannel2",
                type: TEXTURE_IMAGE,
                value: emptyTexture,
                binding: 4,
                dirty: true,
            },
            {
                name: "iChannel3",
                type: TEXTURE_IMAGE,
                value: emptyTexture,
                binding: 5,
                dirty: true,
            },
            {
                name: "uniforms",
                type: BUFFER,
                value: new BufferFloat32({
                    size: 48,
                    data: [
                        CommonData.date.getFullYear(),
                        CommonData.date.getMonth(),
                        CommonData.date.getDate(),
                        CommonData.date.getSeconds() + CommonData.date.getMinutes() * 60 + CommonData.date.getHours() + 3600,
                        1024, 1024,
                        0, 0,
                        0,
                        0,
                        0,
                        0, // 11
                    ]
                }),
                binding: 6,
                dirty: true,
            }
        ]);
        this.dataD = CommonData.date;
        this.dirty = true;
    }
    get sampler() {
        return this.uniforms[0].value;
    }
    set sampler(sampler) {
        this.uniforms[0].dirty = this.dirty = true;
        this.uniforms[0].value = sampler;
    }
    get texture0() {
        return this.uniforms[1].value;
    }
    set texture0(texture) {
        this.uniforms[1].dirty = this.dirty = true;
        this.uniforms[1].value = texture;
    }
    get texture1() {
        return this.uniforms[2].value;
    }
    set texture1(texture) {
        this.uniforms[2].dirty = this.dirty = true;
        this.uniforms[2].value = texture;
    }
    get texture2() {
        return this.uniforms[3].value;
    }
    set texture2(texture) {
        this.uniforms[3].dirty = this.dirty = true;
        this.uniforms[3].value = texture;
    }
    get texture3() {
        return this.uniforms[4].value;
    }
    set texture3(texture) {
        this.uniforms[4].dirty = this.dirty = true;
        this.uniforms[4].value = texture;
    }
    get time() {
        return this.uniforms[5].value[8];
    }
    set time(time) {
        this.uniforms[5].dirty = this.dirty = true;
        this.uniforms[5].value[8] = time;
    }
    get mouse() {
        let u = this.uniforms[5];
        return [u.value[6], u.value[7]];
    }
    set mouse(mouse) {
        let u = this.uniforms[5];
        u.dirty = this.dirty = true;
        u.value[6] = mouse[0];
        u.value[7] = mouse[1];
    }
    get date() {
        return this.dataD;
    }
    set date(d) {
        const u = this.uniforms[5];
        u.dirty = this.dirty = true;
        u.value[0] = d.getFullYear();
        u.value[1] = d.getMonth();
        u.value[2] = d.getDate();
        u.value[3] = d.getSeconds() + d.getMinutes() * 60 + d.getHours() * 3600;
        this.dataD = d;
    }
}

const wgslShaders = {
    vertex: `
		struct Uniforms {
			 matrix : mat4x4<f32>
	  	};
		struct BitmapFont {
			channel : vec4<f32>,
			position : vec2<f32>,
			size : vec2<f32>,
			offset : vec2<f32>,
			bitmapSize : vec2<f32>,
			lineHeight : f32,
			baseLine: f32
		};
	  	@binding(0) @group(0) var<uniform> uniforms : Uniforms;
		@binding(3) @group(0) var<uniform> font: BitmapFont;

		struct VertexOutput {
			@builtin(position) position : vec4<f32>,
			@location(0) uv : vec2<f32>
		};

		@vertex fn main(@location(0) position : vec3<f32>, @location(2) uv : vec2<f32>) -> VertexOutput {
			var out: VertexOutput;
			var p = position;
			p.x *= font.size.x;
			p.y *= font.size.y;
			p.x += font.size.x * 0.5 + font.offset.x;
			p.y += -font.size.y * 0.5 - font.offset.y + font.baseLine;
			out.position = uniforms.matrix * vec4<f32>(p, 1.0);
			out.uv = uv;
			out.uv.x *= font.size.x / font.bitmapSize.x;
			out.uv.x += font.position.x / font.bitmapSize.x;
			out.uv.y *= font.size.y / font.bitmapSize.y;
			out.uv.y += font.position.y / font.bitmapSize.y;
			return out;
		}
	`,
    fragment: `
		@binding(1) @group(0) var mySampler: sampler;
		@binding(2) @group(0) var myTexture: texture_2d<f32>;

		@fragment fn main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
			return textureSample(myTexture, mySampler, uv);
		}
	`
};
class BitmapFontMaterial extends Material {
    constructor(texture, sampler = new Sampler()) {
        super({
            descriptor: {
                code: wgslShaders.vertex,
            },
            dirty: true,
        }, {
            descriptor: {
                code: wgslShaders.fragment,
            },
            dirty: true,
        }, [
            {
                binding: 1,
                name: "mySampler",
                type: SAMPLER,
                value: sampler,
                dirty: true
            },
            {
                binding: 2,
                name: "myTexture",
                type: TEXTURE_IMAGE,
                value: texture,
                dirty: true
            },
            {
                binding: 3,
                dirty: true,
                name: "alpha",
                type: "buffer",
                value: new BufferFloat32({
                    data: [
                        1, 1, 1, 1,
                        0, 0,
                        0, 0,
                        0, 0,
                        1, 1,
                        1, 1,
                        0, 0
                    ],
                }),
            },
            {
                binding: 4,
                dirty: true,
                name: "color",
                type: "buffer",
                value: new BufferFloat32({
                    data: new ColorGPU(1, 1, 1, 1),
                }),
            },
        ]);
        this.dirty = true;
    }
    #channel = new Vector4();
    #position = new Vector2();
    #size = new Vector2();
    #offset = new Vector2();
    #bitmapSize = new Vector2();
    get sampler() {
        return this.uniforms[0].value;
    }
    set sampler(sampler) {
        this.uniforms[0].dirty = this.dirty = true;
        this.uniforms[0].value = sampler;
    }
    get texture() {
        return this.uniforms[1].value;
    }
    set texture(texture) {
        this.uniforms[1].dirty = this.dirty = true;
        this.uniforms[1].value = texture;
    }
    get channel() {
        return this.#channel;
    }
    set channel(vec4) {
        this.uniforms[2].dirty = this.dirty = true;
        this.#channel.set(vec4);
        this.uniforms[2].value[0] = vec4[0];
        this.uniforms[2].value[1] = vec4[1];
        this.uniforms[2].value[2] = vec4[2];
        this.uniforms[2].value[3] = vec4[3];
    }
    get position() {
        return this.#position;
    }
    set position(vec2) {
        this.uniforms[2].dirty = this.dirty = true;
        this.#position.set(vec2);
        this.uniforms[2].value[4] = vec2[0];
        this.uniforms[2].value[5] = vec2[1];
    }
    get size() {
        return this.#size;
    }
    set size(vec2) {
        this.uniforms[2].dirty = this.dirty = true;
        this.#size.set(vec2);
        this.uniforms[2].value[6] = vec2[0];
        this.uniforms[2].value[7] = vec2[1];
    }
    get offset() {
        return this.#offset;
    }
    set offset(vec2) {
        this.uniforms[2].dirty = this.dirty = true;
        this.#offset.set(vec2);
        this.uniforms[2].value[8] = vec2[0];
        this.uniforms[2].value[9] = vec2[1];
    }
    get bitmapSize() {
        return this.#bitmapSize;
    }
    set bitmapSize(vec2) {
        this.uniforms[2].dirty = this.dirty = true;
        this.#bitmapSize.set(vec2);
        this.uniforms[2].value[10] = vec2[0];
        this.uniforms[2].value[11] = vec2[1];
    }
    setTextureAndSampler(texture, sampler) {
        this.texture = texture;
        if (sampler) {
            this.sampler = sampler;
        }
        return this;
    }
    update() {
        this.uniforms[2].dirty = this.dirty = true;
        this.uniforms[2].value[0] = this.channel[0];
        this.uniforms[2].value[1] = this.channel[1];
        this.uniforms[2].value[2] = this.channel[2];
        this.uniforms[2].value[3] = this.channel[3];
        this.uniforms[2].value[4] = this.#position[0];
        this.uniforms[2].value[5] = this.#position[1];
        this.uniforms[2].value[6] = this.#size[0];
        this.uniforms[2].value[7] = this.#size[1];
        this.uniforms[2].value[8] = this.#offset[0];
        this.uniforms[2].value[9] = this.#offset[1];
        this.uniforms[2].value[10] = this.#bitmapSize[0];
        this.uniforms[2].value[11] = this.#bitmapSize[1];
        return this;
    }
}

const CommonGeometry = createPlane({
    width: 1,
    height: 1,
});
class BitmapFontChar3 extends Renderable {
    static RenderType = "mesh3";
    charData;
    font;
    constructor(char, font) {
        super({
            type: BitmapFontChar3.RenderType,
            geometry: CommonGeometry,
            material: new BitmapFontMaterial(font.pages[char.page]),
        });
        this.charData = char;
        this.font = font;
        this.update();
    }
    update() {
        this.data.material.offset.x = this.charData.xoffset;
        this.data.material.offset.y = this.charData.yoffset;
        this.data.material.size.x = this.charData.width;
        this.data.material.size.y = this.charData.height;
        this.data.material.position.x = this.charData.x;
        this.data.material.position.y = this.charData.y;
        this.data.material.bitmapSize.x = this.font.common.scaleW;
        this.data.material.bitmapSize.y = this.font.common.scaleH;
        this.data.material.update();
        this.dirty = this.data.material.dirty = true;
        return this;
    }
    setChar(text) {
        if (typeof text === "string") {
            text = text.charCodeAt(0);
        }
        for (let i = 0, len = this.font.chars.length; i < len; i++) {
            if (this.font.chars[i].id === text) {
                this.charData = this.font.chars[i];
                return this.update();
            }
        }
        return this;
    }
}
class BitmapFontString extends Object3 {
    font;
    #text;
    #chars = [];
    style = {};
    #textPixelWidth = 0;
    constructor(str, font, name) {
        super(name ?? str);
        this.font = font;
        this.#text = str;
        this.update(str);
    }
    destroy() {
        for (let i = 0, len = this.#chars.length; i < len; i++) {
            this.#chars[i].destroy();
        }
        this.destroy();
    }
    get text() {
        return this.#text;
    }
    set text(text) {
        this.#text = text;
        this.update(this.#text);
    }
    get textAlign() {
        return this.style.textAlign;
    }
    set textAlign(value) {
        const old = this.style.textAlign;
        this.style.textAlign = value;
        if (old === value) {
            return;
        }
        const v1 = old === "right" ? 0 : (old === "center" ? 0.5 : 1);
        const v2 = value === "right" ? 0 : (value === "center" ? 0.5 : 1);
        const delta = v2 - v1;
        for (let i = 0, len = this.#text.length; i < len; i++) {
            this.#chars[i].position.x += delta * this.#textPixelWidth;
        }
    }
    update(text) {
        let x = 0;
        const oldLength = this.#chars.length;
        for (let i = 0, len = text.length; i < len; i++) {
            const e = this.#chars[i] ?? new Object3();
            let char = e.getComponentByClass(BitmapFontChar3);
            const code = text.charCodeAt(i);
            if (char) {
                char.setChar(code);
            }
            else {
                for (let i = 0, len = this.font.chars.length; i < len; i++) {
                    if (this.font.chars[i].id === code) {
                        char = new BitmapFontChar3(this.font.chars[i], this.font);
                        break;
                    }
                }
                e.addComponent(char);
                this.#chars.push(e);
            }
            e.position.x = x;
            x += char.charData.xadvance;
            this.addChild(e);
            e.disabled = false;
        }
        this.#textPixelWidth = x;
        if (this.style.textAlign === "center") {
            const h = x * 0.5;
            for (let i = 0, len = this.#text.length; i < len; i++) {
                this.#chars[i].position.x -= h;
            }
        }
        else if (this.style.textAlign === "right") {
            for (let i = 0, len = this.#text.length; i < len; i++) {
                this.#chars[i].position.x -= x;
            }
        }
        if (oldLength > this.#text.length) {
            for (let i = this.#text.length; i < oldLength; i++) {
                this.#chars[i].disabled = true;
            }
        }
    }
}

class BitmapFontManager {
    fontStore = new Map();
    addFont(json) {
        if (this.fontStore.has(json.info.face)) {
            console.log(`Font "${json.info.face}" already exists`);
            return this;
        }
        this.fontStore.set(json.info.face, json);
        return this;
    }
    createChar(charTextOrCode, fontName, fontSize) {
        if (typeof charTextOrCode === "string") {
            charTextOrCode = charTextOrCode.charCodeAt(0);
        }
        let fontData = this.fontStore.get(fontName);
        let char;
        for (let i = 0, len = fontData.chars.length; i < len; i++) {
            if (fontData.chars[i].id === charTextOrCode) {
                char = new BitmapFontChar3(fontData.chars[i], fontData);
                break;
            }
        }
        return char;
    }
}

var EngineEvents;
(function (EngineEvents) {
    EngineEvents["LOOP_STARTED"] = "loop-started";
    EngineEvents["LOOP_ENDED"] = "loop-ended";
})(EngineEvents || (EngineEvents = {}));
const DEFAULT_ENGINE_OPTIONS = {
    autoStart: true,
    container: document.body
};

class EngineTaskChunk extends EventFirer {
    static START = 'start';
    static END = 'end';
    name;
    disabled = false;
    time = 0;
    delta = 0;
    taskTimeMap = new WeakMap();
    #tasks = [];
    get tasksCount() {
        return this.#tasks.length;
    }
    constructor(name) {
        super();
        this.name = name;
    }
    addTask(task, needTimeReset) {
        this.#tasks.push(task);
        if (needTimeReset) {
            this.taskTimeMap.set(task, this.time);
        }
    }
    removeTask(task) {
        let i = this.#tasks.indexOf(task);
        if (i > -1) {
            this.#tasks.splice(i, 1);
        }
    }
    run = (time, delta) => {
        this.time = time;
        this.delta = delta;
        this.fire(EngineTaskChunk.START, this);
        let len = this.#tasks.length;
        for (let i = 0; i < len; i++) {
            const t = this.#tasks[i];
            t(time - (this.taskTimeMap.get(t) ?? 0), delta);
        }
        return this.fire(EngineTaskChunk.END, this);
    };
}

class Engine extends mixin$2(Timeline) {
    options;
    static Events = EngineEvents;
    taskChunkTimeMap = new Map();
    #taskChunks = new Map();
    constructor(options = {}) {
        super();
        this.options = {
            ...DEFAULT_ENGINE_OPTIONS,
            ...options,
        };
        if (this.options.autoStart) {
            this.start();
        }
    }
    addTask(task, needTimeReset, chunkName) {
        if (!chunkName) {
            return super.addTask(task, needTimeReset);
        }
        const chunk = this.#taskChunks.get(chunkName);
        if (!chunkName) {
            return super.addTask(task, needTimeReset);
        }
        chunk.addTask(task, needTimeReset);
        return this;
    }
    addTaskChunk(chunk, needTimeReset) {
        this.#taskChunks.set(chunk.name, chunk);
        if (needTimeReset) {
            this.taskChunkTimeMap.set(chunk, this.time);
        }
        return this;
    }
    removeTask(task, chunkName) {
        if (!chunkName) {
            super.removeTask(task);
        }
        else {
            const chunk = this.#taskChunks.get(chunkName);
            if (chunk) {
                chunk.removeTask(task);
            }
        }
        return this;
    }
    removeTaskChunk(chunk) {
        if (typeof chunk === 'string') {
            this.#taskChunks.delete(chunk);
        }
        else {
            this.#taskChunks.delete(chunk.name);
        }
        return this;
    }
    runChunk(chunk, time, delta) {
        if (chunk.disabled) {
            return this;
        }
        chunk.run(time - (this.taskChunkTimeMap.get(chunk) ?? 0), delta);
        return this;
    }
    update(time, delta) {
        this.fire(Engine.Events.LOOP_STARTED, this);
        super.update(time, delta);
        this.#taskChunks.forEach((chunk) => {
            this.runChunk(chunk, time, delta);
        });
        this.fire(Engine.Events.LOOP_ENDED, this);
        return this;
    }
}

class Object2 extends Entity {
    anchor;
    position;
    rotation;
    scaling;
    modelMatrix;
    worldMatrix;
    constructor(name = "Object3") {
        super(name);
        this.scaling = new Vector2Scale2();
        this.position = new EuclidPosition2();
        this.rotation = new AngleRotation2();
        this.anchor = new Anchor2();
        this.modelMatrix = new Matrix3Component(MODEL_2D, Matrix3.create(), [{
                label: MODEL_3D,
                unique: true
            }]);
        this.worldMatrix = new Matrix3Component(WORLD_MATRIX3, Matrix3.create(), [{
                label: WORLD_MATRIX3,
                unique: true
            }]);
    }
}

class Camera2 extends Object2 {
    projection;
    constructor(name = "Camera2", projection) {
        super(name);
        this.projection = projection;
    }
}

class Camera3 extends Object3 {
    projection;
    constructor(name = "Camera3", projection) {
        super(name);
        this.projection = projection;
    }
}

var LoadType;
(function (LoadType) {
    LoadType["JSON"] = "json";
    LoadType["BLOB"] = "blob";
    LoadType["TEXT"] = "text";
    LoadType["ARRAY_BUFFER"] = "arrayBuffer";
})(LoadType || (LoadType = {}));

class ResourceStore extends EventFirer {
    static WILL_LOAD = "willLoad";
    static LOADING = "loading";
    static LOADED = "loaded";
    static PARSED = "parsed";
    resourcesMap = new Map();
    loadItems = {
        [LoadType.TEXT]: new Map(),
        [LoadType.JSON]: new Map(),
        [LoadType.ARRAY_BUFFER]: new Map(),
        [LoadType.BLOB]: new Map(),
    };
    parsers = new Map();
    #toLoadStack = [];
    #loadingTasks = new Set();
    maxTasks = 5;
    #loadTagsMap = new Map();
    #countToParse = 0;
    getResource(name, type) {
        const map = this.resourcesMap.get(type);
        if (!map) {
            return null;
        }
        return map.get(name);
    }
    setResource(data, type, name) {
        let map = this.resourcesMap.get(type);
        if (!map) {
            map = new Map();
            this.resourcesMap.set(type, map);
        }
        if (data instanceof Array) {
            for (let i = 0, len = data.length; i < len; i++) {
                map.set(data[i].name ?? name + '_' + i, data[i]);
            }
        }
        else {
            map.set(name, data);
        }
        return this;
    }
    loadAndParse = (arr) => {
        for (let item of arr) {
            let check = this.getResource(item.name, item.type);
            if (check) {
                // 重复资源不加载
                continue;
            }
            check = this.#loadTagsMap.get(item);
            if (check) {
                // 防止一个资源连续执行多次加载
                continue;
            }
            if (item.loadParts.length) {
                for (let part of item.loadParts) {
                    this.#toLoadStack.push({
                        part,
                        belongsTo: item
                    });
                }
                this.#loadTagsMap.set(item, item.loadParts.length);
                this.#countToParse++;
            }
        }
        const toLoadLength = this.#toLoadStack.length;
        this.fire(ResourceStore.WILL_LOAD, this);
        for (let i = 0; i < toLoadLength && i < this.maxTasks; i++) {
            const part = this.#toLoadStack.pop();
            let promise = this.#loadPart(part);
            promise.finally(() => {
                this.#loadingTasks.delete(promise);
                if (this.#toLoadStack.length) {
                    this.#loadPart(this.#toLoadStack.pop());
                }
                else {
                    this.fire(ResourceStore.LOADED, this);
                }
            });
            this.#loadingTasks.add(promise);
        }
        return this;
    };
    getUrlLoaded(url, type) {
        if (type) {
            return this.loadItems[type].get(url);
        }
        let result = this.loadItems[LoadType.TEXT].get(url);
        if (result) {
            return result;
        }
        result = this.loadItems[LoadType.BLOB].get(url);
        if (result) {
            return result;
        }
        result = this.loadItems[LoadType.ARRAY_BUFFER].get(url);
        if (result) {
            return result;
        }
        result = this.loadItems[LoadType.JSON].get(url);
        if (result) {
            return result;
        }
        return null;
    }
    #loadPart = (partRecord) => {
        const part = partRecord.part;
        const len = partRecord.belongsTo.loadParts.length;
        let process = 0;
        const assets = this.getUrlLoaded(part.url, part.type);
        if (assets) {
            return new Promise((resolve) => {
                part.onLoad?.(assets);
                resolve(assets);
            });
        }
        return fetch(part.url).then((response) => {
            const { body, headers } = response;
            let size = parseInt(headers.get('content-length'), 10) || 0;
            let currentSize = 0;
            let stream;
            const reader = body.getReader();
            stream = new ReadableStream({
                start: (controller) => {
                    const push = (reader) => {
                        reader.read().then((res) => {
                            let currentReadData = res;
                            let { done, value } = res;
                            if (done) {
                                controller.close();
                                return;
                            }
                            else {
                                if (!currentReadData || !currentReadData.value) {
                                    process = 0;
                                }
                                else {
                                    const arr = currentReadData.value;
                                    process = arr.length * arr.constructor.BYTES_PER_ELEMENT;
                                }
                                currentSize += process;
                                part.onLoadProgress?.(currentSize, size, process);
                                controller.enqueue(value);
                            }
                            push(reader);
                        }).catch((e) => {
                            part.onLoadError?.(e);
                        });
                    };
                    push(reader);
                },
                cancel: () => {
                    part.onCancel?.();
                }
            });
            return new Response(stream, { headers });
        }).then((response) => {
            if (part.type === LoadType.JSON) {
                return response.json();
            }
            if (part.type === LoadType.TEXT) {
                return response.text();
            }
            if (part.type === LoadType.BLOB) {
                return response.blob();
            }
            return response.arrayBuffer();
        }).then((data) => {
            part.onLoad?.(data);
            this.loadItems[part.type ?? LoadType.ARRAY_BUFFER].set(part.url, data);
            let count = this.#loadTagsMap.get(partRecord.belongsTo);
            partRecord.belongsTo.onLoadProgress?.(len - count + 1, len);
            if (count < 2) {
                this.#loadTagsMap.delete(partRecord.belongsTo);
                partRecord.belongsTo.onLoad?.();
                this.#parserResource(partRecord.belongsTo);
            }
            else {
                this.#loadTagsMap.set(partRecord.belongsTo, count - 1);
            }
            return data;
        }).catch((e) => {
            part.onLoadError?.(e);
        });
    };
    #parserResource = (resource) => {
        let parser = this.parsers.get(resource.type);
        if (!parser) {
            resource.onParseError?.(new Error('No parser found: ' + resource.type));
        }
        const data = [];
        for (let part of resource.loadParts) {
            data.push(this.getUrlLoaded(part.url, part.type));
        }
        let result = parser(...data);
        if (result instanceof Promise) {
            return result.then((data) => {
                this.#checkAllParseAndSetResource(resource, data);
            }).catch((e) => {
                resource.onParseError?.(e);
                this.#countToParse--;
                if (!this.#countToParse) {
                    this.fire(ResourceStore.PARSED, this);
                }
            });
        }
        else {
            this.#checkAllParseAndSetResource(resource, result);
        }
        return this;
    };
    #checkAllParseAndSetResource = (resource, data) => {
        this.setResource(data, resource.type, resource.name);
        resource.onParse?.(data);
        this.#countToParse--;
        if (!this.#countToParse) {
            this.fire(ResourceStore.PARSED, this);
        }
    };
    registerParser(parser, type) {
        this.parsers.set(type, parser);
        return this;
    }
}

const AtlasParser = async (blob, json) => {
    const bitmap = await createImageBitmap(blob);
    const result = [];
    for (let i = 0, len = json.frames.length; i < len; i++) {
        const f = json.frames[i];
        const tex = new Texture({
            image: await drawSpriteBlock(bitmap, f.w, f.h, f),
            size: [f.w, f.h],
            name: f.name ?? "atlas_" + i
        });
        result.push(tex);
    }
    return result;
};

const FntParser = async (data, ...blobs) => {
    if (!data) {
        throw new Error('no data provided');
    }
    data = data.trim();
    const output = {
        pages: [],
        chars: [],
        kernings: [],
    };
    const lines = data.split(/\r\n?|\n/g);
    if (lines.length === 0) {
        throw new Error('no data in BMFont file');
    }
    for (let i = 0; i < lines.length; i++) {
        const lineData = splitLine(lines[i], i);
        if (!lineData) //skip empty lines
            continue;
        if (lineData.key === 'page') {
            if (typeof lineData.data.id !== 'number')
                throw new Error('malformed file at line ' + i + ' -- needs page id=N');
            if (typeof lineData.data.file !== 'string')
                throw new Error('malformed file at line ' + i + ' -- needs page file="path"');
            output.pages[lineData.data.id] = lineData.data.file;
        }
        else if (lineData.key === 'chars' || lineData.key === 'kernings') ;
        else if (lineData.key === 'char') {
            output.chars.push(lineData.data);
        }
        else if (lineData.key === 'kerning') {
            output.kernings.push(lineData.data);
        }
        else {
            output[lineData.key] = lineData.data;
        }
    }
    for (let i = 0, len = blobs.length; i < len; i++) {
        const bitmap = await createImageBitmap(blobs[i]);
        output.pages[i] = new Texture({
            size: [bitmap.width, bitmap.height],
            image: bitmap,
        });
    }
    return output;
};
function splitLine(line, idx) {
    line = line.replace(/\t+/g, ' ').trim();
    if (!line)
        return null;
    var space = line.indexOf(' ');
    if (space === -1)
        throw new Error("no named row at line " + idx);
    var key = line.substring(0, space);
    line = line.substring(space + 1);
    //clear "letter" field as it is non-standard and
    //requires additional complexity to parse " / = symbols
    line = line.replace(/letter=[\'\"]\S+[\'\"]/gi, '');
    line = line.split("=");
    line = line.map(function (str) {
        return str.trim().match((/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g));
    });
    var data = [];
    for (var i = 0; i < line.length; i++) {
        var dt = line[i];
        if (i === 0) {
            data.push({
                key: dt[0],
                data: ""
            });
        }
        else if (i === line.length - 1) {
            data[data.length - 1].data = parseData(dt[0]);
        }
        else {
            data[data.length - 1].data = parseData(dt[0]);
            data.push({
                key: dt[1],
                data: ""
            });
        }
    }
    var out = {
        key: key,
        data: {}
    };
    data.forEach(function (v) {
        out.data[v.key] = v.data;
    });
    return out;
}
function parseData(data) {
    if (!data || data.length === 0)
        return "";
    if (data.indexOf('"') === 0 || data.indexOf("'") === 0)
        return data.substring(1, data.length - 1);
    if (data.indexOf(',') !== -1)
        return parseIntList(data);
    return parseInt(data, 10);
}
function parseIntList(data) {
    return data.split(',').map(function (val) {
        return parseInt(val, 10);
    });
}

const MeshObjParser = async (text) => {
    const texts = text.split('\n');
    const positionArr = [];
    const normalArr = [];
    const uvArr = [];
    const positionIndicesArr = [];
    const normalIndicesArr = [];
    const uvIndicesArr = [];
    let t, ts;
    for (let i = 0, len = texts.length; i < len; i++) {
        t = texts[i];
        ts = t.split(' ');
        if (t.startsWith('v ')) {
            positionArr.push(parseFloat(ts[1]), parseFloat(ts[2]), parseFloat(ts[3]));
        }
        else if (t.startsWith('vn ')) {
            normalArr.push(parseFloat(ts[1]), parseFloat(ts[2]), parseFloat(ts[3]));
        }
        else if (t.startsWith('vt ')) {
            uvArr.push(parseFloat(ts[1]), parseFloat(ts[2]));
        }
        else if (t.startsWith('f ')) {
            if (ts[1].includes('/')) {
                let a = ts[1].split('/');
                let b = ts[2].split('/');
                let c = ts[3].split('/');
                positionIndicesArr.push(parseInt(a[0], 10), parseInt(b[0], 10), parseInt(c[0], 10));
                if (a.length === 2) {
                    uvIndicesArr.push(parseInt(a[1], 10), parseInt(b[1], 10), parseInt(c[1], 10));
                }
                else {
                    if (a[1]) {
                        uvIndicesArr.push(parseInt(a[1], 10), parseInt(b[1], 10), parseInt(c[1], 10));
                    }
                    normalIndicesArr.push(parseInt(a[2], 10), parseInt(b[2], 10), parseInt(c[2], 10));
                }
            }
            else {
                positionIndicesArr.push(parseInt(ts[1], 10), parseInt(ts[2], 10), parseInt(ts[3], 10));
            }
        }
    }
    const indicesLength = positionIndicesArr.length;
    const wholeLen = indicesLength * 3;
    const positionF32 = new Float32Array(wholeLen);
    for (let i = 0; i < indicesLength; i++) {
        let index = (positionIndicesArr[i] - 1) * 3;
        positionF32[i * 3] = positionArr[index];
        positionF32[i * 3 + 1] = positionArr[index + 1];
        positionF32[i * 3 + 2] = positionArr[index + 2];
    }
    const geo = new Geometry(3, positionIndicesArr.length, "triangle-list", "none");
    geo.addAttribute(POSITION, positionF32, 3, [
        {
            name: POSITION,
            offset: 0,
            length: 3,
        }
    ]);
    const normalLength = uvIndicesArr.length;
    if (normalLength) {
        const wholeLen = normalLength * 3;
        const positionF32 = new Float32Array(wholeLen);
        for (let i = 0; i < normalLength; i++) {
            let index = (normalIndicesArr[i] - 1) * 3;
            positionF32[i * 3] = normalArr[index];
            positionF32[i * 3 + 1] = normalArr[index + 1];
            positionF32[i * 3 + 2] = normalArr[index + 2];
        }
        geo.addAttribute(NORMAL, positionF32, 3, [
            {
                name: NORMAL,
                offset: 0,
                length: 3,
            }
        ]);
    }
    const uvLength = uvIndicesArr.length;
    if (uvLength) {
        const wholeLen = uvLength * 2;
        const positionF32 = new Float32Array(wholeLen);
        for (let i = 0; i < uvLength; i++) {
            let index = (uvIndicesArr[i] - 1) * 2;
            positionF32[i * 2] = uvArr[index];
            positionF32[i * 2 + 1] = uvArr[index + 1];
        }
        geo.addAttribute(UV, positionF32, 2, [
            {
                name: UV,
                offset: 0,
                length: 2,
            }
        ]);
    }
    return geo;
};

const TextureParser = async (blob) => {
    const bitmap = await createImageBitmap(blob);
    return new Texture({
        size: [bitmap.width, bitmap.height],
        image: bitmap,
    });
};

class HashRouteSystem extends System {
    static listeningHashChange = false;
    static count = 0; // 计数
    static listener = () => {
        HashRouteSystem.currentPath = location.hash.slice(1) || "/";
    };
    static currentPath = location.hash.slice(1) || "/";
    currentPath = "";
    constructor() {
        super("HashRouteSystem", (entity) => {
            return entity.getFirstComponentByTagLabel("HashRoute");
        });
        HashRouteSystem.count++;
        if (!HashRouteSystem.listeningHashChange) {
            HashRouteSystem.listeningHashChange = true;
            window.addEventListener("load", HashRouteSystem.listener, false);
            window.addEventListener("hashchange", HashRouteSystem.listener, false);
        }
    }
    destroy() {
        HashRouteSystem.count--;
        if (HashRouteSystem.count < 1) {
            window.removeEventListener("load", HashRouteSystem.listener, false);
            window.removeEventListener("hashchange", HashRouteSystem.listener, false);
        }
        return this;
    }
    handle(entity) {
        let routeComponents = entity.getComponentsByTagLabel("HashRoute");
        for (let i = routeComponents.length - 1; i > -1; i--) {
            routeComponents[i].route(this.currentPath, entity);
        }
        return this;
    }
    run(world, time, delta) {
        if (HashRouteSystem.currentPath === this.currentPath) {
            return this;
        }
        this.currentPath = HashRouteSystem.currentPath;
        super.run(world, time, delta);
        return this;
    }
}

const FIND_LEAVES_VISITOR = {
    enter: (node, result) => {
        if (!node.children.length) {
            result.push(node);
        }
    }
};
const ARRAY_VISITOR = {
    enter: (node, result) => {
        result.push(node);
    }
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const mixin = (Base = Object) => {
    return class TreeNode extends Base {
        static mixin = mixin;
        static addChild(node, child) {
            if (TreeNode.hasAncestor(node, child)) {
                throw new Error("The node added is one of the ancestors of current one.");
            }
            node.children.push(child);
            child.parent = node;
            return node;
        }
        static depth(node) {
            if (!node.children.length) {
                return 1;
            }
            else {
                const childrenDepth = [];
                for (const item of node.children) {
                    item && childrenDepth.push(this.depth(item));
                }
                let max = 0;
                for (const item of childrenDepth) {
                    max = Math.max(max, item);
                }
                return 1 + max;
            }
        }
        static findLeaves(node) {
            const result = [];
            TreeNode.traverse(node, FIND_LEAVES_VISITOR, result);
            return result;
        }
        static findRoot(node) {
            if (node.parent) {
                return this.findRoot(node.parent);
            }
            return node;
        }
        static hasAncestor(node, ancestor) {
            if (!node.parent) {
                return false;
            }
            else {
                if (node.parent === ancestor) {
                    return true;
                }
                else {
                    return TreeNode.hasAncestor(node.parent, ancestor);
                }
            }
        }
        static removeChild(node, child) {
            if (node.children.includes(child)) {
                node.children.splice(node.children.indexOf(child), 1);
                child.parent = null;
            }
            return node;
        }
        static toArray(node) {
            const result = [];
            TreeNode.traverse(node, ARRAY_VISITOR, result);
            return result;
        }
        static traverse(node, visitor, rest) {
            visitor.enter?.(node, rest);
            visitor.visit?.(node, rest);
            for (const item of node.children) {
                item && TreeNode.traverse(item, visitor, rest);
            }
            visitor.leave?.(node, rest);
            return node;
        }
        parent = null;
        children = [];
        addChild(node) {
            return TreeNode.addChild(this, node);
        }
        depth() {
            return TreeNode.depth(this);
        }
        findLeaves() {
            return TreeNode.findLeaves(this);
        }
        findRoot() {
            return TreeNode.findRoot(this);
        }
        hasAncestor(ancestor) {
            return TreeNode.hasAncestor(this, ancestor);
        }
        removeChild(child) {
            return TreeNode.removeChild(this, child);
        }
        toArray() {
            return TreeNode.toArray(this);
        }
        traverse(visitor, rest) {
            return TreeNode.traverse(this, visitor, rest);
        }
    };
};
var TreeNode = mixin(Object);

function fixData(data) {
    if (!data.path.startsWith("/")) {
        data.path = "/" + data.path;
    }
    return data;
}
class HashRouteComponent extends TreeNode.mixin(Component) {
    children = [];
    constructor(name, data) {
        super(name, fixData(data), [{
                label: "HashRoute",
                unique: false
            }]);
    }
    route(path, entity) {
        let p = this.data.path;
        if (path === p) {
            this.data.action(entity, true);
            for (let i = this.children.length - 1; i > -1; i--) {
                this.children[i].route("", entity);
            }
        }
        else if (path.startsWith(p)) {
            let str = path.substring(p.length);
            if (str.startsWith("/")) {
                this.data.action(entity, true);
                for (let i = this.children.length - 1; i > -1; i--) {
                    this.children[i].route(str, entity);
                }
            }
            else {
                this.data.action(entity, false);
                for (let i = this.children.length - 1; i > -1; i--) {
                    this.children[i].route("", entity);
                }
            }
        }
        else {
            this.data.action(entity, false);
            for (let i = this.children.length - 1; i > -1; i--) {
                this.children[i].route("", entity);
            }
        }
        return this;
    }
}

var TWEEN_STATE;
(function (TWEEN_STATE) {
    TWEEN_STATE[TWEEN_STATE["IDLE"] = 0] = "IDLE";
    TWEEN_STATE[TWEEN_STATE["START"] = 1] = "START";
    TWEEN_STATE[TWEEN_STATE["PAUSE"] = 2] = "PAUSE";
    TWEEN_STATE[TWEEN_STATE["STOP"] = -1] = "STOP";
})(TWEEN_STATE || (TWEEN_STATE = {}));
class Tween extends Component {
    static States = TWEEN_STATE;
    from;
    to;
    duration;
    loopTimes;
    state;
    time;
    end = false;
    loop;
    easing = index$4.Linear;
    constructor(from, to, duration = 1000, loop = 0) {
        super("tween", new Map());
        this.loop = loop;
        this.from = from;
        this.to = to;
        this.duration = duration;
        this.loopTimes = loop;
        this.state = TWEEN_STATE.IDLE;
        this.time = 0;
        this.checkKeyAndType(from, to);
    }
    reset() {
        this.loopTimes = this.loop;
        this.time = 0;
        this.state = TWEEN_STATE.IDLE;
        this.end = false;
    }
    // 检查from 和 to哪些属性是可以插值的
    checkKeyAndType(from, to) {
        let map = this.data;
        if (from instanceof Float32Array && to instanceof Float32Array) {
            if (Math.min(from.length, to.length) === 2) {
                map.set(' ', {
                    type: 'vector2',
                    origin: new Float32Array(from),
                    delta: Vector2.minus(to, from)
                });
            }
            else if (Math.min(from.length, to.length) === 3) {
                map.set(' ', {
                    type: 'vector3',
                    origin: new Float32Array(from),
                    delta: Vector3.minus(to, from)
                });
            }
            else if (Math.min(from.length, to.length) === 4) {
                map.set(' ', {
                    type: 'vector4',
                    origin: new Float32Array(from),
                    delta: Vector4.minus(to, from)
                });
            }
            return this;
        }
        for (let key in to) {
            if (key in from) {
                // TODO 目前只支持数字和F32数组插值，后续扩展
                if (typeof to[key] === 'number' && 'number' === typeof from[key]) {
                    map.set(key, {
                        type: 'number',
                        origin: from[key],
                        delta: to[key] - from[key]
                    });
                }
                else if (to[key] instanceof Float32Array && from[key] instanceof Float32Array) {
                    if (Math.min(from[key].length, to[key].length) === 2) {
                        map.set(key, {
                            type: 'vector2',
                            origin: new Float32Array(from[key]),
                            delta: Vector2.minus(to[key], from[key])
                        });
                    }
                    else if (Math.min(from[key].length, to[key].length) === 3) {
                        map.set(key, {
                            type: 'vector3',
                            origin: new Float32Array(from[key]),
                            delta: Vector3.minus(to[key], from[key])
                        });
                    }
                    else if (Math.min(from[key].length, to[key].length) === 4) {
                        map.set(key, {
                            type: 'vector4',
                            origin: new Float32Array(from[key]),
                            delta: Vector4.minus(to[key], from[key])
                        });
                    }
                }
            }
        }
        return this;
    }
}

class TweenSystem extends System {
    constructor(name = "Tween System") {
        super(name, (entity) => {
            const component = entity.getComponent("tween");
            if (!component) {
                return false;
            }
            component.time = 0;
            return true;
        });
    }
    destroy() {
        throw new Error("Method not implemented.");
    }
    handle(entity, _time, delta) {
        let tweenC = entity.getComponent("tween");
        if (tweenC.end) {
            return this;
        }
        tweenC.time += delta;
        if (tweenC.time > tweenC.duration) {
            tweenC.loopTimes--;
            if (tweenC.loopTimes >= 0) {
                tweenC.time -= tweenC.duration;
            }
            else {
                tweenC.end = true;
                tweenC.time = tweenC.duration;
            }
        }
        let map = tweenC.data;
        let from = tweenC.from;
        let rate = tweenC.easing(tweenC.time / tweenC.duration);
        if (from instanceof Float32Array) {
            let data = map.get(' ');
            if (data.type === "vector2") {
                Vector2.multiplyScalar(data.delta, rate, from);
                Vector2.add(data.delta, data.origin, from);
            }
            else if (data.type === "vector3") {
                Vector3.multiplyScalar(data.delta, rate, from);
                Vector3.add(data.delta, data.origin, from);
            }
            else if (data.type === "vector4") {
                Vector4.multiplyScalar(data.delta, rate, from);
                Vector4.add(data.delta, data.origin, from);
            }
            return this;
        }
        map.forEach((data, key) => {
            if (data.type === "number") {
                from[key] = data.origin + data.delta * rate;
            }
            else if (data.type === "vector2") {
                Vector2.multiplyScalar(data.delta, rate, from[key]);
                Vector2.add(data.delta, data.origin, from[key]);
            }
            else if (data.type === "vector3") {
                Vector3.multiplyScalar(data.delta, rate, from[key]);
                Vector3.add(data.delta, data.origin, from[key]);
            }
            else if (data.type === "vector4") {
                Vector4.multiplyScalar(data.delta, rate, from[key]);
                Vector4.add(data.delta, data.origin, from[key]);
            }
        });
        return this;
    }
}

const createCamera2 = (projection, name = "camera", world) => {
    const entity = new Camera2(name, projection);
    if (world) {
        world.addEntity(entity);
    }
    return entity;
};

const createCamera3 = (projection, name = "camera", world) => {
    const entity = new Camera3(name, projection);
    if (world) {
        world.addEntity(entity);
    }
    return entity;
};

const vs = `
struct Uniforms {
	modelViewProjectionMatrix : mat4x4<f32>
};
@binding(0) @group(0) var<uniform> uniforms : Uniforms;

struct VertexOutput {
	@builtin(position) position : vec4<f32>
};

@vertex fn main(@location(0) position : vec3<f32>) -> VertexOutput {
	var out: VertexOutput;
	out.position = uniforms.modelViewProjectionMatrix * vec4<f32>(position, 1.0);
	return out;
}
`;
const fs = `
@fragment fn main() -> @location(0) vec4<f32> {
	return vec4<f32>(1., 1., 1., 1.0);
}
`;
const DEFAULT_MATERIAL3 = new Material({
    descriptor: {
        code: vs,
    },
    dirty: true
}, {
    descriptor: {
        code: fs,
    },
    dirty: true
});

class Mesh2 extends Renderable {
    static RenderType = "mesh2";
    constructor(geometry, material = DEFAULT_MATERIAL3) {
        super({
            type: Mesh2.RenderType,
            geometry,
            material
        });
    }
}

const createMesh2 = (geometry, material = DEFAULT_MATERIAL3, name = MESH2, world) => {
    const entity = new Object2(name);
    entity.addComponent(new Mesh2(geometry, material));
    if (world) {
        world.addEntity(entity);
    }
    return entity;
};

class Mesh3 extends Renderable {
    static RenderType = "mesh3";
    constructor(geometry, material = DEFAULT_MATERIAL3) {
        super({
            type: Mesh3.RenderType,
            geometry,
            material
        });
    }
}

const createMesh3 = (geometry, material = DEFAULT_MATERIAL3, name = MESH3, world) => {
    const entity = new Object3(name);
    entity.addComponent(new Mesh3(geometry, material));
    if (world) {
        world.addEntity(entity);
    }
    return entity;
};

const createSprite3 = (texture, name = SPRITE3, world) => {
    const entity = new Object3(name);
    entity.addComponent(new Sprite3(texture));
    if (world) {
        world.addEntity(entity);
    }
    return entity;
};

var index = /*#__PURE__*/Object.freeze({
	__proto__: null,
	createCamera2: createCamera2,
	createCamera3: createCamera3,
	createMesh2: createMesh2,
	createMesh3: createMesh3,
	createSprite3: createSprite3
});

export { APosition2, APosition3, AProjection2, AProjection3, ARotation2, ARotation3, AScale2, AScale3, constants as ATTRIBUTE_NAME, Anchor2, Anchor3, AngleRotation2, ArraybufferDataType, AtlasParser, AtlasTexture, BitmapFontChar3, BitmapFontManager, BitmapFontMaterial, BitmapFontString, BufferFloat32, COLOR_HEX_MAP, constants$1 as COMPONENT_NAME, Camera2, Camera3, ColorCMYK, ColorGPU, ColorHSL, ColorHSV, ColorMaterial, ColorRGB, ColorRGBA, ColorRYB, Component, ComponentManager, index$3 as ComponentProxy, constants$2 as Constants, Cube, DEFAULT_BLEND_STATE, DEFAULT_ENGINE_OPTIONS, DEFAULT_OPTIONS, DepthMaterial, DomMaterial, EComponentEvent, index$4 as Easing, ElementChangeEvent, Engine, EngineEvents, EngineTaskChunk, Entity, index as EntityFactory, EntityManager, EuclidPosition2, EuclidPosition3, EulerAngle, EulerRotation3, EulerRotationOrders, EventFirer, FntParser, Frustum, Geometry, index$1 as Geometry2Factory, index$2 as Geometry3Factory, HashRouteComponent, HashRouteSystem, IdGeneratorInstance, ImageBitmapTexture, Line3, LoadType, Manager, Material, Matrix2, Matrix3, Matrix3Component, Matrix4, Matrix4Component, MeshObjParser, NormalMaterial, Object2, Object3, OrthogonalProjection, PerspectiveProjection, PerspectiveProjectionX, Plane3, Polar, PolarPosition2, Projection2D, PureSystem, Ray3, Rectangle2, RenderSystemInCanvas, Renderable, ResourceStore, Sampler, ShaderMaterial, ShaderProgram, ShadertoyMaterial, Sphere, Spherical, SphericalPosition3, Sprite3, SpritesheetTexture, System, SystemEvent, SystemManager, TWEEN_STATE, Texture, TextureMaterial, TextureParser, Timeline, Triangle2, Triangle3, Tween, TweenSystem, Vector2, Vector2Scale2, Vector3, Vector3Scale3, Vector4, WebGPUCacheObjectStore, WebGPUMesh2Renderer, WebGPUMesh3Renderer, WebGPUPostProcessingPass, WebGPURenderSystem, World, all, ceilPowerOfTwo, clamp, clampCircle, clampSafeCommon as clampSafe, closeTo, eventfirer, filt, fire, floorPowerOfTwo, floorToZeroCommon as floorToZero, isPowerOfTwo, lerp, mapRange, mixin$2 as mixin, on, once, randFloat, randInt, rndFloat, rndFloatRange, rndInt, sum, sumArray, times, transformMatrix3, transformMatrix4 };
