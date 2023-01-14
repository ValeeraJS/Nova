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

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const mixin$2 = (Base = Object, eventKeyList = []) => {
    return class EventFirer extends Base {
        static mixin = mixin$2;
        eventKeyList = eventKeyList;
        /**
         * store all the filters
         */
        filters = [];
        /**
         * store all the listeners by key
         */
        listeners = new Map();
        all(listener) {
            return this.filt(() => true, listener);
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
        filt(rule, listener) {
            this.filters.push({
                listener,
                rule
            });
            return this;
        }
        fire(eventKey, target) {
            if (!this.checkEventKeyAvailable(eventKey)) {
                console.error("EventDispatcher couldn't dispatch the event since EventKeyList doesn't contains key: ", eventKey);
                return this;
            }
            const array = this.listeners.get(eventKey) || [];
            let len = array.length;
            let item;
            for (let i = 0; i < len; i++) {
                item = array[i];
                item.listener(target);
                item.times--;
                if (item.times <= 0) {
                    array.splice(i--, 1);
                    --len;
                }
            }
            return this.checkFilt(eventKey, target);
        }
        off(eventKey, listener) {
            const array = this.listeners.get(eventKey);
            if (!array) {
                return this;
            }
            const len = array.length;
            for (let i = 0; i < len; i++) {
                if (array[i].listener === listener) {
                    array.splice(i, 1);
                    break;
                }
            }
            return this;
        }
        on(eventKey, listener) {
            if (eventKey instanceof Array) {
                for (let i = 0, j = eventKey.length; i < j; i++) {
                    this.times(eventKey[i], Infinity, listener);
                }
                return this;
            }
            return this.times(eventKey, Infinity, listener);
        }
        once(eventKey, listener) {
            return this.times(eventKey, 1, listener);
        }
        times(eventKey, times, listener) {
            if (!this.checkEventKeyAvailable(eventKey)) {
                console.error("EventDispatcher couldn't add the listener: ", listener, "since EventKeyList doesn't contains key: ", eventKey);
                return this;
            }
            const array = this.listeners.get(eventKey) || [];
            if (!this.listeners.has(eventKey)) {
                this.listeners.set(eventKey, array);
            }
            array.push({
                listener,
                times
            });
            return this;
        }
        checkFilt(eventKey, target) {
            for (const item of this.filters) {
                if (item.rule(eventKey, target)) {
                    item.listener(target, eventKey);
                }
            }
            return this;
        }
        checkEventKeyAvailable(eventKey) {
            if (this.eventKeyList.length) {
                return this.eventKeyList.includes(eventKey);
            }
            return true;
        }
    };
};
var EventDispatcher = mixin$2(Object);

const S4 = () => {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
};
/**
 * @class
 * @classdesc 数字id生成器，用于生成递增id
 * @param {number} [initValue = 0] 从几开始生成递增id
 * @implements IdGenerator.IIncreaser
 */
class IdGenerator {
    initValue;
    value;
    /**
     * @member IdGenerator.initValue
     * @desc id从该值开始递增，在创建实例时进行设置。设置之后将无法修改。
     * @readonly
     * @public
     */
    constructor(initValue = 0) {
        this.value = this.initValue = initValue;
    }
    /**
     * @method IdGenerator.prototype.current
     * @desc 返回当前的id
     * @readonly
     * @public
     * @returns {number} id
     */
    current() {
        return this.value;
    }
    jumpTo(value) {
        if (this.value < value) {
            this.value = value;
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
        return ++this.value;
    }
    /**
     * @method IdGenerator.prototype.skip
     * @desc 跳过一段值生成新的id
     * @public
     * @param {number} [value = 1] 跳过的范围，必须大于等于1
     * @returns {number} id
     */
    skip(value = 1) {
        if (value < 1) {
            value = 1;
        }
        this.value += value;
        return ++this.value;
    }
    /**
     * @method IdGenerator.prototype.skip
     * @desc 生成新的32位uuid
     * @public
     * @returns {string} uuid
     */
    uuid() {
        if (crypto.randomUUID) {
            return crypto.randomUUID();
        }
        else {
            return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
        }
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

const IdGeneratorInstance$1 = new IdGenerator();

class Component$1 {
    constructor(name, data, tags = []) {
        this.isComponent = true;
        this.id = IdGeneratorInstance$1.next();
        this.disabled = false;
        this.usedBy = [];
        this.dirty = false;
        this.name = name;
        this.data = data;
        this.tags = tags;
    }
    static unserialize(json) {
        const component = new Component$1(json.name, json.data);
        component.disabled = json.disabled;
        return component;
    }
    clone() {
        return new Component$1(this.name, this.data, this.tags);
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
            type: "component"
        };
    }
}

// component type
const ANCHOR_2D = "anchor2";
const ANCHOR_3D = "anchor3";
const GEOMETRY = "geometry";
const MATERIAL = "material";
const MESH2 = "mesh2";
const MESH3 = "mesh3";
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

var constants$2 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	ANCHOR_2D: ANCHOR_2D,
	ANCHOR_3D: ANCHOR_3D,
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
	SCALING_2D: SCALING_2D,
	SCALING_3D: SCALING_3D,
	TRANSLATION_2D: TRANSLATION_2D,
	TRANSLATION_3D: TRANSLATION_3D,
	WORLD_MATRIX3: WORLD_MATRIX3,
	WORLD_MATRIX4: WORLD_MATRIX4,
	VIEWING_3D: VIEWING_3D,
	SAMPLER: SAMPLER,
	BUFFER: BUFFER,
	TEXTURE_IMAGE: TEXTURE_IMAGE,
	TEXTURE_GPU: TEXTURE_GPU
});

const POSITION = "position";
const VERTICES = "vertices";
const VERTICES_COLOR = "vertices_color";
const NORMAL = "normal";
const INDEX = "index";
const UV = "uv";

var constants$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	POSITION: POSITION,
	VERTICES: VERTICES,
	VERTICES_COLOR: VERTICES_COLOR,
	NORMAL: NORMAL,
	INDEX: INDEX,
	UV: UV
});

// 既可以是2d几何体也可以是3D几何体
class Geometry extends Component$1 {
    constructor(dimension, count = 0, topology = "triangle-list", cullMode = "none", data = []) {
        super(GEOMETRY, data);
        this.data = [];
        this.tags = [{
                label: GEOMETRY,
                unique: true
            }];
        this.count = count;
        this.cullMode = cullMode;
        this.dimension = dimension;
        this.topology = topology;
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
let x$6, y$6;
const transformMatrix3 = (a, m, offset) => {
    x$6 = a[offset];
    y$6 = a[1 + offset];
    a[offset] = m[0] * x$6 + m[3] * y$6 + m[6];
    a[offset + 1] = m[1] * x$6 + m[4] * y$6 + m[7];
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

const DEG_TO_RAD = Math.PI / 180;
const DEG_360_RAD$1 = Math.PI * 2;
const DEG_90_RAD = Math.PI * 0.5;
const DEG_60_RAD = Math.PI / 3;
const DEG_45_RAD = Math.PI * 0.25;
const DEG_30_RAD = Math.PI / 6;
const EPSILON$1 = Math.pow(2, -52);
const RAD_TO_DEG = 180 / Math.PI;

var constants = /*#__PURE__*/Object.freeze({
	__proto__: null,
	DEG_30_RAD: DEG_30_RAD,
	DEG_360_RAD: DEG_360_RAD$1,
	DEG_45_RAD: DEG_45_RAD,
	DEG_60_RAD: DEG_60_RAD,
	DEG_90_RAD: DEG_90_RAD,
	DEG_TO_RAD: DEG_TO_RAD,
	EPSILON: EPSILON$1,
	RAD_TO_DEG: RAD_TO_DEG
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
    yellowgreen: 0x9acd32
};

const ArraybufferDataType$1 = {
    COLOR_GPU: "col",
    COLOR_RGB: "col_rgb",
    COLOR_RGBA: "col_rgba",
    EULER: "euler",
    MATRIX2: "mat2",
    MATRIX3: "mat3",
    MATRIX4: "mat4",
    POLAR: "polar",
    QUATERNION: "qua",
    VECTOR2: "vec2",
    VECTOR3: "vec3",
    VECTOR4: "vec4"
};

class ColorRGBA extends Uint8Array {
    static average = (color) => {
        return (color[0] + color[1] + color[2]) / 3;
    };
    static averageWeighted = (color, wr = 0.299, wg = 0.587, wb = 0.114) => {
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
    static fromHex = (hex, alpha = 255, out = new ColorRGBA()) => {
        out[0] = hex >> 16;
        out[1] = (hex >> 8) & 255;
        out[2] = hex & 255;
        out[3] = alpha;
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
            str = str.substr(1);
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
    static grayscale = (color, wr = 0.299, wg = 0.587, wb = 0.114, out = new ColorRGBA()) => {
        const gray = ColorRGBA.averageWeighted(color, wr, wg, wb);
        ColorRGBA.fromScalar(gray, color[3], out);
        return out;
    };
    length;
    dataType = ArraybufferDataType$1.COLOR_RGBA;
    constructor(r = 0, g = 0, b = 0, a = 1) {
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
        return this[4];
    }
    set a(val) {
        this[4] = val;
    }
}

class ColorRGB extends Uint8Array {
    static average = (color) => {
        return (color[0] + color[1] + color[2]) / 3;
    };
    static averageWeighted = (color, wr = 0.299, wg = 0.587, wb = 0.114) => {
        return color[0] * wr + color[1] * wg + color[2] * wb;
    };
    static clone = (color) => {
        return new ColorRGB(color[0], color[1], color[2]);
    };
    static create = (r = 0, g = 0, b = 0) => {
        return new ColorRGB(r, g, b);
    };
    static equals = (a, b) => {
        return ((a.r ?? a[0]) === (b.r ?? b[0]) &&
            (a.g ?? a[1]) === (b.g ?? b[1]) &&
            (a.b ?? a[2]) === (b.b ?? b[2]));
    };
    static fromArray = (arr, out = new ColorRGB()) => {
        out[0] = arr[0];
        out[1] = arr[1];
        out[2] = arr[2];
        return out;
    };
    static fromHex = (hex, out = new ColorRGB()) => {
        out[0] = hex >> 16;
        out[1] = (hex >> 8) & 255;
        out[2] = hex & 255;
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
            str = str.substr(1);
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
    static grayscale = (color, wr = 0.299, wg = 0.587, wb = 0.114, out = new ColorRGB()) => {
        const gray = ColorRGB.averageWeighted(color, wr, wg, wb);
        ColorRGB.fromScalar(gray, out);
        return out;
    };
    length;
    dataType = ArraybufferDataType$1.COLOR_RGB;
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

class ColorGPU extends Float32Array {
    static average = (color) => {
        return (color[0] + color[1] + color[2]) / 3;
    };
    static averageWeighted = (color, wr = 0.299, wg = 0.587, wb = 0.114) => {
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
            str = str.substr(1);
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
    static grayscale = (color, wr = 0.299, wg = 0.587, wb = 0.114, out = new ColorGPU()) => {
        const gray = ColorGPU.averageWeighted(color, wr, wg, wb);
        ColorGPU.fromScalar(gray, out);
        return out;
    };
    length;
    dataType = ArraybufferDataType$1.COLOR_GPU;
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
var clampCommon$1 = (val, min, max) => {
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
var floorToZeroCommon$1 = (num) => {
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
    v$1 = floorToZeroCommon$1(min / circle) * circle + (val % circle);
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
var clampSafeCommon$1 = (val, a, b) => {
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
var closeToCommon$1 = (val, target, epsilon = EPSILON$1) => {
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

let len$3 = 0, sum$1 = 0;
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
    len$3 = arr.length;
    for (let i = 0; i < len$3; i++) {
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

var EulerRotationOrders$1;
(function (EulerRotationOrders) {
    EulerRotationOrders["XYZ"] = "xyz";
    EulerRotationOrders["ZXY"] = "zxy";
    EulerRotationOrders["YZX"] = "yzx";
    EulerRotationOrders["XZY"] = "xzy";
    EulerRotationOrders["ZYX"] = "zyx";
    EulerRotationOrders["YXZ"] = "yxz";
})(EulerRotationOrders$1 || (EulerRotationOrders$1 = {}));

class EulerAngle extends Float32Array {
    static ORDERS = EulerRotationOrders$1;
    static clone(euler) {
        return new EulerAngle(euler.x, euler.y, euler.z, euler.order);
    }
    static create(x = 0, y = 0, z = 0, order = EulerRotationOrders$1.XYZ) {
        return new EulerAngle(x, y, z, order);
    }
    static fromMatrix4(matrix4, out = new EulerAngle()) {
        const m11 = matrix4[0], m12 = matrix4[4], m13 = matrix4[8];
        const m21 = matrix4[1], m22 = matrix4[5], m23 = matrix4[9];
        const m31 = matrix4[2], m32 = matrix4[6], m33 = matrix4[10];
        switch (out.order) {
            case EulerRotationOrders$1.XYZ:
                out.y = Math.asin(clampCommon$1(m13, -1, 1));
                if (Math.abs(m13) < 0.9999999) {
                    out.x = Math.atan2(-m23, m33);
                    out.z = Math.atan2(-m12, m11);
                }
                else {
                    out.x = Math.atan2(m32, m22);
                    out.z = 0;
                }
                break;
            case EulerRotationOrders$1.YXZ:
                out.x = Math.asin(-clampCommon$1(m23, -1, 1));
                if (Math.abs(m23) < 0.9999999) {
                    out.y = Math.atan2(m13, m33);
                    out.z = Math.atan2(m21, m22);
                }
                else {
                    out.y = Math.atan2(-m31, m11);
                    out.z = 0;
                }
                break;
            case EulerRotationOrders$1.ZXY:
                out.x = Math.asin(clampCommon$1(m32, -1, 1));
                if (Math.abs(m32) < 0.9999999) {
                    out.y = Math.atan2(-m31, m33);
                    out.z = Math.atan2(-m12, m22);
                }
                else {
                    out.y = 0;
                    out.z = Math.atan2(m21, m11);
                }
                break;
            case EulerRotationOrders$1.ZYX:
                out.y = Math.asin(-clampCommon$1(m31, -1, 1));
                if (Math.abs(m31) < 0.9999999) {
                    out.x = Math.atan2(m32, m33);
                    out.z = Math.atan2(m21, m11);
                }
                else {
                    out.x = 0;
                    out.z = Math.atan2(-m12, m22);
                }
                break;
            case EulerRotationOrders$1.YZX:
                out.z = Math.asin(clampCommon$1(m21, -1, 1));
                if (Math.abs(m21) < 0.9999999) {
                    out.x = Math.atan2(-m23, m22);
                    out.y = Math.atan2(-m31, m11);
                }
                else {
                    out.x = 0;
                    out.y = Math.atan2(m13, m33);
                }
                break;
            case EulerRotationOrders$1.XZY:
                out.z = Math.asin(-clampCommon$1(m12, -1, 1));
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
    dataType = ArraybufferDataType$1.EULER;
    constructor(x = 0, y = 0, z = 0, order = EulerRotationOrders$1.XYZ) {
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

let a00$2$1 = 0, a01$2$1 = 0, a10$2$1 = 0, a11$2$1 = 0;
let b00$2$1 = 0, b01$2$1 = 0, b10$2$1 = 0, b11$2$1 = 0, det$1$1 = 0;
let x$4 = 0, y$4 = 0;
const UNIT_MATRIX2_DATA$1 = [1, 0, 0, 1];
class Matrix2$1 extends Float32Array {
    static UNIT_MATRIX2 = new Matrix2$1(UNIT_MATRIX2_DATA$1);
    static add = (a, b, out) => {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        out[2] = a[2] + b[2];
        out[3] = a[3] + b[3];
        return out;
    };
    static adjoint = (a, out) => {
        a00$2$1 = a[0];
        out[0] = a[3];
        out[1] = -a[1];
        out[2] = -a[2];
        out[3] = a00$2$1;
        return out;
    };
    static clone = (source) => {
        return new Matrix2$1(source);
    };
    static closeTo = (a, b) => {
        a00$2$1 = a[0];
        a10$2$1 = a[1];
        a01$2$1 = a[2];
        a11$2$1 = a[3];
        b00$2$1 = b[0];
        b10$2$1 = b[1];
        b01$2$1 = b[2];
        b11$2$1 = b[3];
        return (closeToCommon$1(a00$2$1, b00$2$1) &&
            closeToCommon$1(a01$2$1, b01$2$1) &&
            closeToCommon$1(a10$2$1, b10$2$1) &&
            closeToCommon$1(a11$2$1, b11$2$1));
    };
    static create = (a = UNIT_MATRIX2_DATA$1) => {
        return new Matrix2$1(a);
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
    static fromArray = (source, out = new Matrix2$1()) => {
        out.set(source);
        return out;
    };
    static fromRotation = (rad, out = new Matrix2$1()) => {
        y$4 = Math.sin(rad);
        x$4 = Math.cos(rad);
        out[0] = x$4;
        out[1] = y$4;
        out[2] = -y$4;
        out[3] = x$4;
        return out;
    };
    static fromScaling = (v, out = new Matrix2$1()) => {
        out[0] = v[0];
        out[1] = 0;
        out[2] = 0;
        out[3] = v[1];
        return out;
    };
    static identity = (out = new Matrix2$1()) => {
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 1;
        return out;
    };
    static invert = (a, out = new Matrix2$1()) => {
        a00$2$1 = a[0];
        a10$2$1 = a[1];
        a01$2$1 = a[2];
        a11$2$1 = a[3];
        det$1$1 = Matrix2$1.determinant(a);
        if (!det$1$1) {
            return null;
        }
        det$1$1 = 1.0 / det$1$1;
        out[0] = a11$2$1 * det$1$1;
        out[1] = -a10$2$1 * det$1$1;
        out[2] = -a01$2$1 * det$1$1;
        out[3] = a00$2$1 * det$1$1;
        return out;
    };
    static minus = (a, b, out = new Matrix2$1()) => {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        out[2] = a[2] - b[2];
        out[3] = a[3] - b[3];
        return out;
    };
    static multiply = (a, b, out = new Matrix2$1()) => {
        a00$2$1 = a[0];
        a10$2$1 = a[1];
        a01$2$1 = a[2];
        a11$2$1 = a[3];
        b00$2$1 = b[0];
        b10$2$1 = b[1];
        b01$2$1 = b[2];
        b11$2$1 = b[3];
        out[0] = a00$2$1 * b00$2$1 + a01$2$1 * b10$2$1;
        out[1] = a10$2$1 * b00$2$1 + a11$2$1 * b10$2$1;
        out[2] = a00$2$1 * b01$2$1 + a01$2$1 * b11$2$1;
        out[3] = a10$2$1 * b01$2$1 + a11$2$1 * b11$2$1;
        return out;
    };
    static multiplyScalar = (a, b, out = new Matrix2$1()) => {
        out[0] = a[0] * b;
        out[1] = a[1] * b;
        out[2] = a[2] * b;
        out[3] = a[3] * b;
        return out;
    };
    static rotate = (a, rad, out = new Matrix2$1()) => {
        a00$2$1 = a[0];
        a10$2$1 = a[1];
        a01$2$1 = a[2];
        a11$2$1 = a[3];
        y$4 = Math.sin(rad);
        x$4 = Math.cos(rad);
        out[0] = a00$2$1 * x$4 + a01$2$1 * y$4;
        out[1] = a10$2$1 * x$4 + a11$2$1 * y$4;
        out[2] = a00$2$1 * -y$4 + a01$2$1 * x$4;
        out[3] = a10$2$1 * -y$4 + a11$2$1 * x$4;
        return out;
    };
    static scale = (a, v, out = new Matrix2$1()) => {
        a00$2$1 = a[0];
        a10$2$1 = a[1];
        a01$2$1 = a[2];
        a11$2$1 = a[3];
        x$4 = v[0];
        y$4 = v[1];
        out[0] = a00$2$1 * x$4;
        out[1] = a10$2$1 * x$4;
        out[2] = a01$2$1 * y$4;
        out[3] = a11$2$1 * y$4;
        return out;
    };
    static toString = (a) => {
        return `mat2(${a[0]}, ${a[1]}, ${a[2]}, ${a[3]})`;
    };
    static transpose = (a, out = new Matrix2$1()) => {
        if (out === a) {
            a01$2$1 = a[1];
            out[1] = a[2];
            out[2] = a01$2$1;
        }
        else {
            out[0] = a[0];
            out[1] = a[2];
            out[2] = a[1];
            out[3] = a[3];
        }
        return out;
    };
    constructor(data = UNIT_MATRIX2_DATA$1) {
        super(data);
    }
}

let a00$1$1 = 0, a01$1$1 = 0, a02$1$1 = 0, a11$1$1 = 0, a10$1$1 = 0, a12$1$1 = 0, a20$1$1 = 0, a21$1$1 = 0, a22$1$1 = 0;
let b00$1$1 = 0, b01$1$1 = 0, b02$1$1 = 0, b11$1$1 = 0, b10$1$1 = 0, b12$1$1 = 0, b20$1$1 = 0, b21$1$1 = 0, b22$1$1 = 0;
let x$3$1 = 0, y$3$1 = 0;
const UNIT_MATRIX3_DATA$1 = [1, 0, 0, 0, 1, 0, 0, 0, 1];
class Matrix3$1 extends Float32Array {
    static UNIT_MATRIX3 = new Matrix3$1(UNIT_MATRIX3_DATA$1);
    static clone = (source) => {
        return new Matrix3$1(source);
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
        return new Matrix3$1(UNIT_MATRIX3_DATA$1);
    };
    static determinant = (a) => {
        a00$1$1 = a[0];
        a01$1$1 = a[1];
        a02$1$1 = a[2];
        a10$1$1 = a[3];
        a11$1$1 = a[4];
        a12$1$1 = a[5];
        a20$1$1 = a[6];
        a21$1$1 = a[7];
        a22$1$1 = a[8];
        return (a00$1$1 * (a22$1$1 * a11$1$1 - a12$1$1 * a21$1$1) +
            a01$1$1 * (-a22$1$1 * a10$1$1 + a12$1$1 * a20$1$1) +
            a02$1$1 * (a21$1$1 * a10$1$1 - a11$1$1 * a20$1$1));
    };
    static fromArray = (source, out = new Matrix3$1()) => {
        out.set(source);
        return out;
    };
    static fromMatrix2 = (mat4, out = new Matrix3$1()) => {
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
    static fromMatrix4 = (mat4, out = new Matrix3$1()) => {
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
    static fromRotation = (rad, out = new Matrix3$1()) => {
        y$3$1 = Math.sin(rad);
        x$3$1 = Math.cos(rad);
        out[0] = x$3$1;
        out[1] = y$3$1;
        out[2] = 0;
        out[3] = -y$3$1;
        out[4] = x$3$1;
        out[5] = 0;
        out[6] = 0;
        out[7] = 0;
        out[8] = 1;
        return out;
    };
    static fromScaling = (v, out = new Matrix3$1()) => {
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
    static fromTranslation = (v, out = new Matrix3$1()) => {
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
    static identity = (out = new Matrix3$1()) => {
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
    static invert = (a, out = new Matrix3$1()) => {
        a00$1$1 = a[0];
        a01$1$1 = a[1];
        a02$1$1 = a[2];
        a10$1$1 = a[3];
        a11$1$1 = a[4];
        a12$1$1 = a[5];
        a20$1$1 = a[6];
        a21$1$1 = a[7];
        a22$1$1 = a[8];
        b01$1$1 = a22$1$1 * a11$1$1 - a12$1$1 * a21$1$1;
        b11$1$1 = -a22$1$1 * a10$1$1 + a12$1$1 * a20$1$1;
        b21$1$1 = a21$1$1 * a10$1$1 - a11$1$1 * a20$1$1;
        let det = a00$1$1 * b01$1$1 + a01$1$1 * b11$1$1 + a02$1$1 * b21$1$1;
        if (!det) {
            return null;
        }
        det = 1.0 / det;
        out[0] = b01$1$1 * det;
        out[1] = (-a22$1$1 * a01$1$1 + a02$1$1 * a21$1$1) * det;
        out[2] = (a12$1$1 * a01$1$1 - a02$1$1 * a11$1$1) * det;
        out[3] = b11$1$1 * det;
        out[4] = (a22$1$1 * a00$1$1 - a02$1$1 * a20$1$1) * det;
        out[5] = (-a12$1$1 * a00$1$1 + a02$1$1 * a10$1$1) * det;
        out[6] = b21$1$1 * det;
        out[7] = (-a21$1$1 * a00$1$1 + a01$1$1 * a20$1$1) * det;
        out[8] = (a11$1$1 * a00$1$1 - a01$1$1 * a10$1$1) * det;
        return out;
    };
    static multiply = (a, b, out = new Matrix3$1()) => {
        a00$1$1 = a[0];
        a01$1$1 = a[1];
        a02$1$1 = a[2];
        a10$1$1 = a[3];
        a11$1$1 = a[4];
        a12$1$1 = a[5];
        a20$1$1 = a[6];
        a21$1$1 = a[7];
        a22$1$1 = a[8];
        b00$1$1 = b[0];
        b01$1$1 = b[1];
        b02$1$1 = b[2];
        b10$1$1 = b[3];
        b11$1$1 = b[4];
        b12$1$1 = b[5];
        b20$1$1 = b[6];
        b21$1$1 = b[7];
        b22$1$1 = b[8];
        out[0] = b00$1$1 * a00$1$1 + b01$1$1 * a10$1$1 + b02$1$1 * a20$1$1;
        out[1] = b00$1$1 * a01$1$1 + b01$1$1 * a11$1$1 + b02$1$1 * a21$1$1;
        out[2] = b00$1$1 * a02$1$1 + b01$1$1 * a12$1$1 + b02$1$1 * a22$1$1;
        out[3] = b10$1$1 * a00$1$1 + b11$1$1 * a10$1$1 + b12$1$1 * a20$1$1;
        out[4] = b10$1$1 * a01$1$1 + b11$1$1 * a11$1$1 + b12$1$1 * a21$1$1;
        out[5] = b10$1$1 * a02$1$1 + b11$1$1 * a12$1$1 + b12$1$1 * a22$1$1;
        out[6] = b20$1$1 * a00$1$1 + b21$1$1 * a10$1$1 + b22$1$1 * a20$1$1;
        out[7] = b20$1$1 * a01$1$1 + b21$1$1 * a11$1$1 + b22$1$1 * a21$1$1;
        out[8] = b20$1$1 * a02$1$1 + b21$1$1 * a12$1$1 + b22$1$1 * a22$1$1;
        return out;
    };
    static multiplyRotationMatrix = (a, b, out = new Matrix3$1()) => {
        a00$1$1 = a[0];
        a01$1$1 = a[1];
        a02$1$1 = a[2];
        a10$1$1 = a[3];
        a11$1$1 = a[4];
        a12$1$1 = a[5];
        a20$1$1 = a[6];
        a21$1$1 = a[7];
        a22$1$1 = a[8];
        b00$1$1 = b[0];
        b01$1$1 = b[1];
        b10$1$1 = b[3];
        b11$1$1 = b[4];
        out[0] = b00$1$1 * a00$1$1 + b01$1$1 * a10$1$1;
        out[1] = b00$1$1 * a01$1$1 + b01$1$1 * a11$1$1;
        out[2] = b00$1$1 * a02$1$1 + b01$1$1 * a12$1$1;
        out[3] = b10$1$1 * a00$1$1 + b11$1$1 * a10$1$1;
        out[4] = b10$1$1 * a01$1$1 + b11$1$1 * a11$1$1;
        out[5] = b10$1$1 * a02$1$1 + b11$1$1 * a12$1$1;
        out[6] = a20$1$1;
        out[7] = a21$1$1;
        out[8] = a22$1$1;
        return out;
    };
    static multiplyScaleMatrix = (a, b, out = new Matrix3$1()) => {
        a00$1$1 = a[0];
        a01$1$1 = a[1];
        a02$1$1 = a[2];
        a10$1$1 = a[3];
        a11$1$1 = a[4];
        a12$1$1 = a[5];
        a20$1$1 = a[6];
        a21$1$1 = a[7];
        a22$1$1 = a[8];
        b00$1$1 = b[0];
        b11$1$1 = b[4];
        out[0] = b00$1$1 * a00$1$1;
        out[1] = b00$1$1 * a01$1$1;
        out[2] = b00$1$1 * a02$1$1;
        out[3] = b11$1$1 * a10$1$1;
        out[4] = b11$1$1 * a11$1$1;
        out[5] = b11$1$1 * a12$1$1;
        out[6] = a20$1$1;
        out[7] = a21$1$1;
        out[8] = a22$1$1;
        return out;
    };
    static multiplyTranslateMatrix = (a, b, out = new Matrix3$1()) => {
        a00$1$1 = a[0];
        a01$1$1 = a[1];
        a02$1$1 = a[2];
        a10$1$1 = a[3];
        a11$1$1 = a[4];
        a12$1$1 = a[5];
        a20$1$1 = a[6];
        a21$1$1 = a[7];
        a22$1$1 = a[8];
        b20$1$1 = b[6];
        b21$1$1 = b[7];
        out[0] = a00$1$1;
        out[1] = a01$1$1;
        out[2] = a02$1$1;
        out[3] = a10$1$1;
        out[4] = a11$1$1;
        out[5] = a12$1$1;
        out[6] = b20$1$1 * a00$1$1 + b21$1$1 * a10$1$1 + a20$1$1;
        out[7] = b20$1$1 * a01$1$1 + b21$1$1 * a11$1$1 + a21$1$1;
        out[8] = b20$1$1 * a02$1$1 + b21$1$1 * a12$1$1 + a22$1$1;
        return out;
    };
    static rotate = (a, rad, out = new Matrix3$1()) => {
        a00$1$1 = a[0];
        a01$1$1 = a[1];
        a02$1$1 = a[2];
        a10$1$1 = a[3];
        a11$1$1 = a[4];
        a12$1$1 = a[5];
        a20$1$1 = a[6];
        a21$1$1 = a[7];
        a22$1$1 = a[8];
        y$3$1 = Math.sin(rad);
        x$3$1 = Math.cos(rad);
        out[0] = x$3$1 * a00$1$1 + y$3$1 * a10$1$1;
        out[1] = x$3$1 * a01$1$1 + y$3$1 * a11$1$1;
        out[2] = x$3$1 * a02$1$1 + y$3$1 * a12$1$1;
        out[3] = y$3$1 * a10$1$1 - x$3$1 * a00$1$1;
        out[4] = y$3$1 * a11$1$1 - x$3$1 * a01$1$1;
        out[5] = y$3$1 * a12$1$1 - x$3$1 * a02$1$1;
        out[6] = a20$1$1;
        out[7] = a21$1$1;
        out[8] = a22$1$1;
        return out;
    };
    static scale = (a, v, out = new Matrix3$1()) => {
        x$3$1 = v[0];
        y$3$1 = v[1];
        out[0] = x$3$1 * a[0];
        out[1] = x$3$1 * a[1];
        out[2] = x$3$1 * a[2];
        out[3] = y$3$1 * a[3];
        out[4] = y$3$1 * a[4];
        out[5] = y$3$1 * a[5];
        out[6] = a[6];
        out[7] = a[7];
        out[8] = a[8];
        return out;
    };
    static translate = (a, v, out = new Matrix3$1()) => {
        a00$1$1 = a[0];
        a01$1$1 = a[1];
        a02$1$1 = a[2];
        a10$1$1 = a[3];
        a11$1$1 = a[4];
        a12$1$1 = a[5];
        a20$1$1 = a[6];
        a21$1$1 = a[7];
        a22$1$1 = a[8];
        x$3$1 = v[0];
        y$3$1 = v[1];
        out[0] = a00$1$1;
        out[1] = a01$1$1;
        out[2] = a02$1$1;
        out[3] = a10$1$1;
        out[4] = a11$1$1;
        out[5] = a12$1$1;
        out[6] = x$3$1 * a00$1$1 + y$3$1 * a10$1$1 + a20$1$1;
        out[7] = x$3$1 * a01$1$1 + y$3$1 * a11$1$1 + a21$1$1;
        out[8] = x$3$1 * a02$1$1 + y$3$1 * a12$1$1 + a22$1$1;
        return out;
    };
    static transpose = (a, out = new Matrix3$1()) => {
        if (out === a) {
            a01$1$1 = a[1];
            a02$1$1 = a[2];
            a12$1$1 = a[5];
            out[1] = a[3];
            out[2] = a[6];
            out[3] = a01$1$1;
            out[5] = a[7];
            out[6] = a02$1$1;
            out[7] = a12$1$1;
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
    constructor(data = UNIT_MATRIX3_DATA$1) {
        super(data);
    }
}

let ax$2, ay$2, az$2, bx$2, by$2, bz$2;
let ag$1, s$3;
class Vector3$1 extends Float32Array {
    static VECTOR3_ZERO = new Vector3$1(0, 0, 0);
    static VECTOR3_ONE = new Vector3$1(1, 1, 1);
    static VECTOR3_TOP = new Vector3$1(0, 1, 0);
    static VECTOR3_BOTTOM = new Vector3$1(0, -1, 0);
    static VECTOR3_LEFT = new Vector3$1(-1, 0, 0);
    static VECTOR3_RIGHT = new Vector3$1(1, 0, 0);
    static VECTOR3_FRONT = new Vector3$1(0, 0, -1);
    static VECTOR3_BACK = new Vector3$1(0, 0, 1);
    static add = (a, b, out = new Vector3$1()) => {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        out[2] = a[2] + b[2];
        return out;
    };
    static addScalar = (a, b, out = new Vector3$1()) => {
        out[0] = a[0] + b;
        out[1] = a[1] + b;
        out[2] = a[2] + b;
        return out;
    };
    static angle = (a, b) => {
        ax$2 = a[0];
        ay$2 = a[1];
        az$2 = a[2];
        bx$2 = b[0];
        by$2 = b[1];
        bz$2 = b[2];
        const mag1 = Math.sqrt(ax$2 * ax$2 + ay$2 * ay$2 + az$2 * az$2), mag2 = Math.sqrt(bx$2 * bx$2 + by$2 * by$2 + bz$2 * bz$2), mag = mag1 * mag2, cosine = mag && Vector3$1.dot(a, b) / mag;
        return Math.acos(clampCommon$1(cosine, -1, 1));
    };
    static clamp = (a, min, max, out = new Vector3$1()) => {
        out[0] = clampCommon$1(a[0], min[0], max[0]);
        out[1] = clampCommon$1(a[1], min[1], max[1]);
        out[2] = clampCommon$1(a[2], min[2], max[2]);
        return out;
    };
    static clampSafe = (a, min, max, out = new Vector3$1()) => {
        out[0] = clampSafeCommon$1(a[0], min[0], max[0]);
        out[1] = clampSafeCommon$1(a[1], min[1], max[1]);
        out[1] = clampSafeCommon$1(a[2], min[2], max[2]);
        return out;
    };
    static clampScalar = (a, min, max, out = new Vector3$1()) => {
        out[0] = clampCommon$1(a[0], min, max);
        out[1] = clampCommon$1(a[1], min, max);
        out[2] = clampCommon$1(a[2], min, max);
        return out;
    };
    static clone = (a, out = new Vector3$1()) => {
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        return out;
    };
    static closeTo = (a, b) => {
        return closeToCommon$1(a[0], b[0]) && closeToCommon$1(a[1], b[1]) && closeToCommon$1(a[2], b[2]);
    };
    static create = (x = 0, y = 0, z = 0, out = new Vector3$1()) => {
        out[0] = x;
        out[1] = y;
        out[2] = z;
        return out;
    };
    static cross = (a, b, out = new Vector3$1()) => {
        ax$2 = a[0];
        ay$2 = a[1];
        az$2 = a[2];
        bx$2 = b[0];
        by$2 = b[1];
        bz$2 = b[2];
        out[0] = ay$2 * bz$2 - az$2 * by$2;
        out[1] = az$2 * bx$2 - ax$2 * bz$2;
        out[2] = ax$2 * by$2 - ay$2 * bx$2;
        return out;
    };
    static distanceTo = (a, b) => {
        ax$2 = b[0] - a[0];
        ay$2 = b[1] - a[1];
        az$2 = b[2] - a[2];
        return Math.hypot(ax$2, ay$2, az$2);
    };
    static distanceToManhattan = (a, b) => {
        return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
    };
    static distanceToSquared = (a, b) => {
        ax$2 = a[0] - b[0];
        ay$2 = a[1] - b[1];
        az$2 = a[2] - b[2];
        return ax$2 * ax$2 + ay$2 * ay$2 + az$2 * az$2;
    };
    static divide = (a, b, out = new Vector3$1()) => {
        out[0] = a[0] / b[0];
        out[1] = a[1] / b[1];
        out[2] = a[2] / b[2];
        return out;
    };
    static divideScalar = (a, b, out = new Vector3$1()) => {
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
    static fromArray = (a, offset = 0, out = new Vector3$1()) => {
        out[0] = a[offset];
        out[1] = a[offset + 1];
        out[2] = a[offset + 2];
        return out;
    };
    static fromScalar = (num, out = new Vector3$1(3)) => {
        out[0] = out[1] = out[2] = num;
        return out;
    };
    static fromValues = (x, y, z, out = new Vector3$1(3)) => {
        out[0] = x;
        out[1] = y;
        out[2] = z;
        return out;
    };
    static hermite = (a, b, c, d, t, out = new Vector3$1()) => {
        ag$1 = t * t;
        const factor1 = ag$1 * (2 * t - 3) + 1;
        const factor2 = ag$1 * (t - 2) + t;
        const factor3 = ag$1 * (t - 1);
        const factor4 = ag$1 * (3 - 2 * t);
        out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
        out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
        out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
        return out;
    };
    static inverse = (a, out = new Vector3$1()) => {
        out[0] = 1.0 / a[0];
        out[1] = 1.0 / a[1];
        out[2] = 1.0 / a[2];
        return out;
    };
    static norm = (a) => {
        return Math.sqrt(Vector3$1.lengthSquared(a));
    };
    static lengthManhattan = (a) => {
        return Math.abs(a[0]) + Math.abs(a[1]) + Math.abs(a[2]);
    };
    static lengthSquared = (a) => {
        return a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
    };
    static lerp = (a, b, alpha, out = new Vector3$1()) => {
        out[0] += (b[0] - a[0]) * alpha;
        out[1] += (b[1] - a[1]) * alpha;
        out[2] += (b[2] - a[2]) * alpha;
        return out;
    };
    static max = (a, b, out = new Vector3$1()) => {
        out[0] = Math.max(a[0], b[0]);
        out[1] = Math.max(a[1], b[1]);
        out[2] = Math.max(a[2], b[2]);
        return out;
    };
    static min = (a, b, out = new Vector3$1()) => {
        out[0] = Math.min(a[0], b[0]);
        out[1] = Math.min(a[1], b[1]);
        out[2] = Math.min(a[2], b[2]);
        return out;
    };
    static minus = (a, b, out = new Vector3$1()) => {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        out[2] = a[2] - b[2];
        return out;
    };
    static minusScalar = (a, b, out = new Vector3$1()) => {
        out[0] = a[0] - b;
        out[1] = a[1] - b;
        out[2] = a[2] - b;
        return out;
    };
    static multiply = (a, b, out = new Vector3$1()) => {
        out[0] = a[0] * b[0];
        out[1] = a[1] * b[1];
        out[2] = a[2] * b[2];
        return out;
    };
    static multiplyScalar = (a, scalar, out = new Vector3$1()) => {
        out[0] = a[0] * scalar;
        out[1] = a[1] * scalar;
        out[2] = a[2] * scalar;
        return out;
    };
    static negate = (a, out = new Vector3$1()) => {
        out[0] = -a[0];
        out[1] = -a[1];
        out[2] = -a[2];
        return out;
    };
    static normalize = (a, out = new Vector3$1()) => {
        return Vector3$1.divideScalar(a, Vector3$1.norm(a) || 1, out);
    };
    static rotateX = (a, b, rad, out = new Vector3$1()) => {
        ax$2 = a[0] - b[0];
        ay$2 = a[1] - b[1];
        az$2 = a[2] - b[2];
        bx$2 = ax$2;
        by$2 = ay$2 * Math.cos(rad) - az$2 * Math.sin(rad);
        bz$2 = ay$2 * Math.sin(rad) + az$2 * Math.cos(rad);
        out[0] = bx$2 + b[0];
        out[1] = by$2 + b[1];
        out[2] = bz$2 + b[2];
        return out;
    };
    static rotateY = (a, b, rad, out = new Vector3$1()) => {
        ax$2 = a[0] - b[0];
        ay$2 = a[1] - b[1];
        az$2 = a[2] - b[2];
        bx$2 = az$2 * Math.sin(rad) + ax$2 * Math.cos(rad);
        by$2 = ay$2;
        bz$2 = az$2 * Math.cos(rad) - ax$2 * Math.sin(rad);
        out[0] = bx$2 + b[0];
        out[1] = by$2 + b[1];
        out[2] = bz$2 + b[2];
        return out;
    };
    static rotateZ = (a, b, rad, out = new Vector3$1()) => {
        ax$2 = a[0] - b[0];
        ay$2 = a[1] - b[1];
        az$2 = a[2] - b[2];
        bx$2 = ax$2 * Math.cos(rad) - ay$2 * Math.sin(rad);
        by$2 = ax$2 * Math.sin(rad) + ay$2 * Math.cos(rad);
        bz$2 = az$2;
        out[0] = bx$2 + b[0];
        out[1] = by$2 + b[1];
        out[2] = bz$2 + b[2];
        return out;
    };
    static round = (a, out = new Vector3$1()) => {
        out[0] = Math.round(a[0]);
        out[1] = Math.round(a[1]);
        out[2] = Math.round(a[2]);
        return out;
    };
    static set = (x = 0, y = 0, z = 0, out = new Vector3$1()) => {
        out[0] = x;
        out[1] = y;
        out[2] = z;
        return out;
    };
    static setNorm = (a, len, out = new Vector3$1()) => {
        return Vector3$1.multiplyScalar(Vector3$1.normalize(a, out), len, out);
    };
    static slerp = (a, b, t, out = new Vector3$1()) => {
        ag$1 = Math.acos(Math.min(Math.max(Vector3$1.dot(a, b), -1), 1));
        s$3 = Math.sin(ag$1);
        ax$2 = Math.sin((1 - t) * ag$1) / s$3;
        bx$2 = Math.sin(t * ag$1) / s$3;
        out[0] = ax$2 * a[0] + bx$2 * b[0];
        out[1] = ax$2 * a[1] + bx$2 * b[1];
        out[2] = ax$2 * a[2] + bx$2 * b[2];
        return out;
    };
    static toString = (a) => {
        return `(${a[0]}, ${a[1]}, ${a[2]})`;
    };
    static transformMatrix3 = (a, m, out = new Vector3$1()) => {
        ax$2 = a[0];
        ay$2 = a[1];
        az$2 = a[2];
        out[0] = ax$2 * m[0] + ay$2 * m[3] + az$2 * m[6];
        out[1] = ax$2 * m[1] + ay$2 * m[4] + az$2 * m[7];
        out[2] = ax$2 * m[2] + ay$2 * m[5] + az$2 * m[8];
        return out;
    };
    static transformMatrix4 = (a, m, out = new Vector3$1()) => {
        ax$2 = a[0];
        ay$2 = a[1];
        az$2 = a[2];
        ag$1 = m[3] * ax$2 + m[7] * ay$2 + m[11] * az$2 + m[15];
        ag$1 = ag$1 || 1.0;
        out[0] = (m[0] * ax$2 + m[4] * ay$2 + m[8] * az$2 + m[12]) / ag$1;
        out[1] = (m[1] * ax$2 + m[5] * ay$2 + m[9] * az$2 + m[13]) / ag$1;
        out[2] = (m[2] * ax$2 + m[6] * ay$2 + m[10] * az$2 + m[14]) / ag$1;
        return out;
    };
    static transformQuat = (a, q, out = new Vector3$1()) => {
        const qx = q[0], qy = q[1], qz = q[2], qw = q[3];
        const x = a[0], y = a[1], z = a[2];
        // var qvec = [qx, qy, qz];
        // var uv = vec3.cross([], qvec, a);
        let uvx = qy * z - qz * y, uvy = qz * x - qx * z, uvz = qx * y - qy * x;
        // var uuv = vec3.cross([], qvec, uv);
        let uuvx = qy * uvz - qz * uvy, uuvy = qz * uvx - qx * uvz, uuvz = qx * uvy - qy * uvx;
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
    length;
    dataType = ArraybufferDataType$1.VECTOR3;
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

/* eslint-disable max-lines */
let a00$3 = 0, a01$3 = 0, a02$2 = 0, a03$1 = 0, a11$3 = 0, a10$3 = 0, a12$2 = 0, a13$1 = 0, a20$2 = 0, a21$2 = 0, a22$2 = 0, a23$1 = 0, a31$1 = 0, a30$1 = 0, a32$1 = 0, a33$1 = 0;
let b00$3 = 0, b01$3 = 0, b02$2 = 0, b03$1 = 0, b11$3 = 0, b10$3 = 0, b12$2 = 0, b13$1 = 0, b20$2 = 0, b21$2 = 0, b22$2 = 0, b23$1 = 0, b31$1 = 0, b30$1 = 0, b32$1 = 0, b33$1 = 0;
let x$2$1 = 0, y$2$1 = 0, z$1 = 0, det$2 = 0, len$2 = 0, s$2$1 = 0, t$1 = 0, a$1 = 0, b$1 = 0, c$2 = 0, d$1 = 0, e$1 = 0, f$1 = 0;
const UNIT_MATRIX4_DATA$1 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
class Matrix4$1 extends Float32Array {
    static UNIT_MATRIX4 = new Matrix4$1(UNIT_MATRIX4_DATA$1);
    static clone = (source) => {
        return new Matrix4$1(source);
    };
    static create = () => {
        return new Matrix4$1(UNIT_MATRIX4_DATA$1);
    };
    static determinant = (a) => {
        a00$3 = a[0];
        a01$3 = a[1];
        a02$2 = a[2];
        a03$1 = a[3];
        a10$3 = a[4];
        a11$3 = a[5];
        a12$2 = a[6];
        a13$1 = a[7];
        a20$2 = a[8];
        a21$2 = a[9];
        a22$2 = a[10];
        a23$1 = a[11];
        a30$1 = a[12];
        a31$1 = a[13];
        a32$1 = a[14];
        a33$1 = a[15];
        b00$3 = a00$3 * a11$3 - a01$3 * a10$3;
        b01$3 = a00$3 * a12$2 - a02$2 * a10$3;
        b02$2 = a01$3 * a12$2 - a02$2 * a11$3;
        b03$1 = a20$2 * a31$1 - a21$2 * a30$1;
        b10$3 = a20$2 * a32$1 - a22$2 * a30$1;
        b11$3 = a21$2 * a32$1 - a22$2 * a31$1;
        b12$2 = a00$3 * b11$3 - a01$3 * b10$3 + a02$2 * b03$1;
        b13$1 = a10$3 * b11$3 - a11$3 * b10$3 + a12$2 * b03$1;
        b20$2 = a20$2 * b02$2 - a21$2 * b01$3 + a22$2 * b00$3;
        b21$2 = a30$1 * b02$2 - a31$1 * b01$3 + a32$1 * b00$3;
        return a13$1 * b12$2 - a03$1 * b13$1 + a33$1 * b20$2 - a23$1 * b21$2;
    };
    static fromArray = (source, out = new Matrix4$1()) => {
        out.set(source);
        return out;
    };
    static fromEuler = (euler, out = new Matrix4$1()) => {
        x$2$1 = euler.x;
        y$2$1 = euler.y;
        z$1 = euler.z;
        a$1 = Math.cos(x$2$1);
        b$1 = Math.sin(x$2$1);
        c$2 = Math.cos(y$2$1);
        d$1 = Math.sin(y$2$1);
        e$1 = Math.cos(z$1);
        f$1 = Math.sin(z$1);
        if (euler.order === EulerRotationOrders$1.XYZ) {
            const ae = a$1 * e$1, af = a$1 * f$1, be = b$1 * e$1, bf = b$1 * f$1;
            out[0] = c$2 * e$1;
            out[4] = -c$2 * f$1;
            out[8] = d$1;
            out[1] = af + be * d$1;
            out[5] = ae - bf * d$1;
            out[9] = -b$1 * c$2;
            out[2] = bf - ae * d$1;
            out[6] = be + af * d$1;
            out[10] = a$1 * c$2;
        }
        else if (euler.order === EulerRotationOrders$1.YXZ) {
            const ce = c$2 * e$1, cf = c$2 * f$1, de = d$1 * e$1, df = d$1 * f$1;
            out[0] = ce + df * b$1;
            out[4] = de * b$1 - cf;
            out[8] = a$1 * d$1;
            out[1] = a$1 * f$1;
            out[5] = a$1 * e$1;
            out[9] = -b$1;
            out[2] = cf * b$1 - de;
            out[6] = df + ce * b$1;
            out[10] = a$1 * c$2;
        }
        else if (euler.order === EulerRotationOrders$1.ZXY) {
            const ce = c$2 * e$1, cf = c$2 * f$1, de = d$1 * e$1, df = d$1 * f$1;
            out[0] = ce - df * b$1;
            out[4] = -a$1 * f$1;
            out[8] = de + cf * b$1;
            out[1] = cf + de * b$1;
            out[5] = a$1 * e$1;
            out[9] = df - ce * b$1;
            out[2] = -a$1 * d$1;
            out[6] = b$1;
            out[10] = a$1 * c$2;
        }
        else if (euler.order === EulerRotationOrders$1.ZYX) {
            const ae = a$1 * e$1, af = a$1 * f$1, be = b$1 * e$1, bf = b$1 * f$1;
            out[0] = c$2 * e$1;
            out[4] = be * d$1 - af;
            out[8] = ae * d$1 + bf;
            out[1] = c$2 * f$1;
            out[5] = bf * d$1 + ae;
            out[9] = af * d$1 - be;
            out[2] = -d$1;
            out[6] = b$1 * c$2;
            out[10] = a$1 * c$2;
        }
        else if (euler.order === EulerRotationOrders$1.YZX) {
            const ac = a$1 * c$2, ad = a$1 * d$1, bc = b$1 * c$2, bd = b$1 * d$1;
            out[0] = c$2 * e$1;
            out[4] = bd - ac * f$1;
            out[8] = bc * f$1 + ad;
            out[1] = f$1;
            out[5] = a$1 * e$1;
            out[9] = -b$1 * e$1;
            out[2] = -d$1 * e$1;
            out[6] = ad * f$1 + bc;
            out[10] = ac - bd * f$1;
        }
        else if (euler.order === EulerRotationOrders$1.XZY) {
            const ac = a$1 * c$2, ad = a$1 * d$1, bc = b$1 * c$2, bd = b$1 * d$1;
            out[0] = c$2 * e$1;
            out[4] = -f$1;
            out[8] = d$1 * e$1;
            out[1] = ac * f$1 + bd;
            out[5] = a$1 * e$1;
            out[9] = ad * f$1 - bc;
            out[2] = bc * f$1 - ad;
            out[6] = b$1 * e$1;
            out[10] = bd * f$1 + ac;
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
    static fromMatrix3 = (data, out = new Matrix4$1()) => {
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
    static fromQuaternion = (q, out = new Matrix4$1()) => {
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
    static fromRotation = (rad, axis, out = new Matrix4$1()) => {
        x$2$1 = axis[0];
        y$2$1 = axis[1];
        z$1 = axis[2];
        len$2 = Math.hypot(x$2$1, y$2$1, z$1);
        if (len$2 < EPSILON$1) {
            return null;
        }
        len$2 = 1 / len$2;
        x$2$1 *= len$2;
        y$2$1 *= len$2;
        z$1 *= len$2;
        s$2$1 = Math.sin(rad);
        c$2 = Math.cos(rad);
        t$1 = 1 - c$2;
        out[0] = x$2$1 * x$2$1 * t$1 + c$2;
        out[1] = y$2$1 * x$2$1 * t$1 + z$1 * s$2$1;
        out[2] = z$1 * x$2$1 * t$1 - y$2$1 * s$2$1;
        out[3] = 0;
        out[4] = x$2$1 * y$2$1 * t$1 - z$1 * s$2$1;
        out[5] = y$2$1 * y$2$1 * t$1 + c$2;
        out[6] = z$1 * y$2$1 * t$1 + x$2$1 * s$2$1;
        out[7] = 0;
        out[8] = x$2$1 * z$1 * t$1 + y$2$1 * s$2$1;
        out[9] = y$2$1 * z$1 * t$1 - x$2$1 * s$2$1;
        out[10] = z$1 * z$1 * t$1 + c$2;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    };
    static fromRotationX = (rad, out = new Matrix4$1()) => {
        s$2$1 = Math.sin(rad);
        c$2 = Math.cos(rad);
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = c$2;
        out[6] = s$2$1;
        out[7] = 0;
        out[8] = 0;
        out[9] = -s$2$1;
        out[10] = c$2;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    };
    static fromRotationY = (rad, out = new Matrix4$1()) => {
        s$2$1 = Math.sin(rad);
        c$2 = Math.cos(rad);
        out[0] = c$2;
        out[1] = 0;
        out[2] = -s$2$1;
        out[3] = 0;
        out[4] = 0;
        out[5] = 1;
        out[6] = 0;
        out[7] = 0;
        out[8] = s$2$1;
        out[9] = 0;
        out[10] = c$2;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    };
    static fromRotationZ = (rad, out = new Matrix4$1()) => {
        s$2$1 = Math.sin(rad);
        c$2 = Math.cos(rad);
        out[0] = c$2;
        out[1] = s$2$1;
        out[2] = 0;
        out[3] = 0;
        out[4] = -s$2$1;
        out[5] = c$2;
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
    static fromScaling = (v, out = new Matrix4$1()) => {
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
    static fromTranslation = (v, out = new Matrix4$1()) => {
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
    static identity = (out = new Matrix4$1()) => {
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
    static invert = (a, out = new Matrix4$1()) => {
        a00$3 = a[0];
        a01$3 = a[1];
        a02$2 = a[2];
        a03$1 = a[3];
        a10$3 = a[4];
        a11$3 = a[5];
        a12$2 = a[6];
        a13$1 = a[7];
        a20$2 = a[8];
        a21$2 = a[9];
        a22$2 = a[10];
        a23$1 = a[11];
        a30$1 = a[12];
        a31$1 = a[13];
        a32$1 = a[14];
        a33$1 = a[15];
        b00$3 = a00$3 * a11$3 - a01$3 * a10$3;
        b01$3 = a00$3 * a12$2 - a02$2 * a10$3;
        b02$2 = a00$3 * a13$1 - a03$1 * a10$3;
        b03$1 = a01$3 * a12$2 - a02$2 * a11$3;
        b20$2 = a01$3 * a13$1 - a03$1 * a11$3;
        b21$2 = a02$2 * a13$1 - a03$1 * a12$2;
        b22$2 = a20$2 * a31$1 - a21$2 * a30$1;
        b23$1 = a20$2 * a32$1 - a22$2 * a30$1;
        b30$1 = a20$2 * a33$1 - a23$1 * a30$1;
        b31$1 = a21$2 * a32$1 - a22$2 * a31$1;
        b32$1 = a21$2 * a33$1 - a23$1 * a31$1;
        b33$1 = a22$2 * a33$1 - a23$1 * a32$1;
        det$2 = b00$3 * b33$1 - b01$3 * b32$1 + b02$2 * b31$1 + b03$1 * b30$1 - b20$2 * b23$1 + b21$2 * b22$2;
        if (!det$2) {
            return null;
        }
        det$2 = 1.0 / det$2;
        out[0] = (a11$3 * b33$1 - a12$2 * b32$1 + a13$1 * b31$1) * det$2;
        out[1] = (a02$2 * b32$1 - a01$3 * b33$1 - a03$1 * b31$1) * det$2;
        out[2] = (a31$1 * b21$2 - a32$1 * b20$2 + a33$1 * b03$1) * det$2;
        out[3] = (a22$2 * b20$2 - a21$2 * b21$2 - a23$1 * b03$1) * det$2;
        out[4] = (a12$2 * b30$1 - a10$3 * b33$1 - a13$1 * b23$1) * det$2;
        out[5] = (a00$3 * b33$1 - a02$2 * b30$1 + a03$1 * b23$1) * det$2;
        out[6] = (a32$1 * b02$2 - a30$1 * b21$2 - a33$1 * b01$3) * det$2;
        out[7] = (a20$2 * b21$2 - a22$2 * b02$2 + a23$1 * b01$3) * det$2;
        out[8] = (a10$3 * b32$1 - a11$3 * b30$1 + a13$1 * b22$2) * det$2;
        out[9] = (a01$3 * b30$1 - a00$3 * b32$1 - a03$1 * b22$2) * det$2;
        out[10] = (a30$1 * b20$2 - a31$1 * b02$2 + a33$1 * b00$3) * det$2;
        out[11] = (a21$2 * b02$2 - a20$2 * b20$2 - a23$1 * b00$3) * det$2;
        out[12] = (a11$3 * b23$1 - a10$3 * b31$1 - a12$2 * b22$2) * det$2;
        out[13] = (a00$3 * b31$1 - a01$3 * b23$1 + a02$2 * b22$2) * det$2;
        out[14] = (a31$1 * b01$3 - a30$1 * b03$1 - a32$1 * b00$3) * det$2;
        out[15] = (a20$2 * b03$1 - a21$2 * b01$3 + a22$2 * b00$3) * det$2;
        return out;
    };
    static lookAt = (eye, center, up = Vector3$1.VECTOR3_TOP, out = new Matrix4$1()) => {
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
        if (closeToCommon$1(eyex, centerx) && closeToCommon$1(eyey, centery) && closeToCommon$1(eyez, centerz)) {
            return Matrix4$1.identity(out);
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
    static multiply = (a, b, out = new Matrix4$1()) => {
        a00$3 = a[0];
        a01$3 = a[1];
        a02$2 = a[2];
        a03$1 = a[3];
        a10$3 = a[4];
        a11$3 = a[5];
        a12$2 = a[6];
        a13$1 = a[7];
        a20$2 = a[8];
        a21$2 = a[9];
        a22$2 = a[10];
        a23$1 = a[11];
        a30$1 = a[12];
        a31$1 = a[13];
        a32$1 = a[14];
        a33$1 = a[15];
        b00$3 = b[0];
        b01$3 = b[1];
        b02$2 = b[2];
        b03$1 = b[3];
        out[0] = b00$3 * a00$3 + b01$3 * a10$3 + b02$2 * a20$2 + b03$1 * a30$1;
        out[1] = b00$3 * a01$3 + b01$3 * a11$3 + b02$2 * a21$2 + b03$1 * a31$1;
        out[2] = b00$3 * a02$2 + b01$3 * a12$2 + b02$2 * a22$2 + b03$1 * a32$1;
        out[3] = b00$3 * a03$1 + b01$3 * a13$1 + b02$2 * a23$1 + b03$1 * a33$1;
        b00$3 = b[4];
        b01$3 = b[5];
        b02$2 = b[6];
        b03$1 = b[7];
        out[4] = b00$3 * a00$3 + b01$3 * a10$3 + b02$2 * a20$2 + b03$1 * a30$1;
        out[5] = b00$3 * a01$3 + b01$3 * a11$3 + b02$2 * a21$2 + b03$1 * a31$1;
        out[6] = b00$3 * a02$2 + b01$3 * a12$2 + b02$2 * a22$2 + b03$1 * a32$1;
        out[7] = b00$3 * a03$1 + b01$3 * a13$1 + b02$2 * a23$1 + b03$1 * a33$1;
        b00$3 = b[8];
        b01$3 = b[9];
        b02$2 = b[10];
        b03$1 = b[11];
        out[8] = b00$3 * a00$3 + b01$3 * a10$3 + b02$2 * a20$2 + b03$1 * a30$1;
        out[9] = b00$3 * a01$3 + b01$3 * a11$3 + b02$2 * a21$2 + b03$1 * a31$1;
        out[10] = b00$3 * a02$2 + b01$3 * a12$2 + b02$2 * a22$2 + b03$1 * a32$1;
        out[11] = b00$3 * a03$1 + b01$3 * a13$1 + b02$2 * a23$1 + b03$1 * a33$1;
        b00$3 = b[12];
        b01$3 = b[13];
        b02$2 = b[14];
        b03$1 = b[15];
        out[12] = b00$3 * a00$3 + b01$3 * a10$3 + b02$2 * a20$2 + b03$1 * a30$1;
        out[13] = b00$3 * a01$3 + b01$3 * a11$3 + b02$2 * a21$2 + b03$1 * a31$1;
        out[14] = b00$3 * a02$2 + b01$3 * a12$2 + b02$2 * a22$2 + b03$1 * a32$1;
        out[15] = b00$3 * a03$1 + b01$3 * a13$1 + b02$2 * a23$1 + b03$1 * a33$1;
        return out;
    };
    // 乘以缩放矩阵
    static multiplyScaleMatrix = (a, b, out = new Matrix4$1()) => {
        a00$3 = a[0];
        a01$3 = a[1];
        a02$2 = a[2];
        a03$1 = a[3];
        a10$3 = a[4];
        a11$3 = a[5];
        a12$2 = a[6];
        a13$1 = a[7];
        a20$2 = a[8];
        a21$2 = a[9];
        a22$2 = a[10];
        a23$1 = a[11];
        a30$1 = a[12];
        a31$1 = a[13];
        a32$1 = a[14];
        a33$1 = a[15];
        b00$3 = b[0];
        out[0] = b00$3 * a00$3;
        out[1] = b00$3 * a01$3;
        out[2] = b00$3 * a02$2;
        out[3] = b00$3 * a03$1;
        b01$3 = b[5];
        out[4] = b01$3 * a10$3;
        out[5] = b01$3 * a11$3;
        out[6] = b01$3 * a12$2;
        out[7] = b01$3 * a13$1;
        b02$2 = b[10];
        out[8] = b02$2 * a20$2;
        out[9] = b02$2 * a21$2;
        out[10] = b02$2 * a22$2;
        out[11] = b02$2 * a23$1;
        out[12] = a30$1;
        out[13] = a31$1;
        out[14] = a32$1;
        out[15] = a33$1;
        return out;
    };
    // 乘以平移矩阵
    static multiplyTranslateMatrix = (a, b, out = new Matrix4$1()) => {
        a00$3 = a[0];
        a01$3 = a[1];
        a02$2 = a[2];
        a03$1 = a[3];
        a10$3 = a[4];
        a11$3 = a[5];
        a12$2 = a[6];
        a13$1 = a[7];
        a20$2 = a[8];
        a21$2 = a[9];
        a22$2 = a[10];
        a23$1 = a[11];
        a30$1 = a[12];
        a31$1 = a[13];
        a32$1 = a[14];
        a33$1 = a[15];
        out[0] = a00$3;
        out[1] = a01$3;
        out[2] = a02$2;
        out[3] = a03$1;
        out[4] = a10$3;
        out[5] = a11$3;
        out[6] = a12$2;
        out[7] = a13$1;
        out[8] = a20$2;
        out[9] = a21$2;
        out[10] = a22$2;
        out[11] = a23$1;
        b00$3 = b[12];
        b01$3 = b[13];
        b02$2 = b[14];
        out[12] = b00$3 * a00$3 + b01$3 * a10$3 + b02$2 * a20$2 + a30$1;
        out[13] = b00$3 * a01$3 + b01$3 * a11$3 + b02$2 * a21$2 + a31$1;
        out[14] = b00$3 * a02$2 + b01$3 * a12$2 + b02$2 * a22$2 + a32$1;
        out[15] = b00$3 * a03$1 + b01$3 * a13$1 + b02$2 * a23$1 + a33$1;
        return out;
    };
    static orthogonal = (left, right, bottom, top, near, far, out = new Matrix4$1()) => {
        c$2 = 1 / (left - right);
        b$1 = 1 / (bottom - top);
        a$1 = 1 / (near - far);
        out[0] = -2 * c$2;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = -2 * b$1;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = 2 * a$1;
        out[11] = 0;
        out[12] = (left + right) * c$2;
        out[13] = (top + bottom) * b$1;
        out[14] = (far + near) * a$1;
        out[15] = 1;
        return out;
    };
    static orthogonalZ0 = (left, right, bottom, top, near, far, out = new Matrix4$1()) => {
        c$2 = 1 / (left - right);
        b$1 = 1 / (bottom - top);
        a$1 = 1 / (near - far);
        out[0] = -2 * c$2;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = -2 * b$1;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = a$1;
        out[11] = 0;
        out[12] = (left + right) * c$2;
        out[13] = (top + bottom) * b$1;
        out[14] = near * a$1;
        out[15] = 1;
        return out;
    };
    static perspective = (fovy, aspect, near, far, out = new Matrix4$1()) => {
        f$1 = 1.0 / Math.tan(fovy / 2);
        out[0] = f$1 / aspect;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = f$1;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[11] = -1;
        out[12] = 0;
        out[13] = 0;
        out[15] = 0;
        if (far !== null && far !== Infinity) {
            a$1 = 1 / (near - far);
            out[10] = (far + near) * a$1;
            out[14] = 2 * far * near * a$1;
        }
        else {
            out[10] = -1;
            out[14] = -2 * near;
        }
        return out;
    };
    static perspectiveZ0 = (fovy, aspect, near, far, out = new Matrix4$1()) => {
        f$1 = 1.0 / Math.tan(fovy / 2);
        out[0] = f$1 / aspect;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = f$1;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[11] = -1;
        out[12] = 0;
        out[13] = 0;
        out[15] = 0;
        if (far !== null && far !== Infinity) {
            a$1 = 1 / (near - far);
            out[10] = far * a$1;
            out[14] = far * near * a$1;
        }
        else {
            out[10] = -1;
            out[14] = -near;
        }
        return out;
    };
    static rotate = (a, rad, axis, out = new Matrix4$1()) => {
        x$2$1 = axis[0];
        y$2$1 = axis[1];
        z$1 = axis[2];
        len$2 = Math.hypot(x$2$1, y$2$1, z$1);
        if (len$2 < EPSILON$1) {
            return null;
        }
        len$2 = 1 / len$2;
        x$2$1 *= len$2;
        y$2$1 *= len$2;
        z$1 *= len$2;
        s$2$1 = Math.sin(rad);
        c$2 = Math.cos(rad);
        t$1 = 1 - c$2;
        a00$3 = a[0];
        a01$3 = a[1];
        a02$2 = a[2];
        a03$1 = a[3];
        a10$3 = a[4];
        a11$3 = a[5];
        a12$2 = a[6];
        a13$1 = a[7];
        a20$2 = a[8];
        a21$2 = a[9];
        a22$2 = a[10];
        a23$1 = a[11];
        b00$3 = x$2$1 * x$2$1 * t$1 + c$2;
        b01$3 = y$2$1 * x$2$1 * t$1 + z$1 * s$2$1;
        b02$2 = z$1 * x$2$1 * t$1 - y$2$1 * s$2$1;
        b10$3 = x$2$1 * y$2$1 * t$1 - z$1 * s$2$1;
        b11$3 = y$2$1 * y$2$1 * t$1 + c$2;
        b12$2 = z$1 * y$2$1 * t$1 + x$2$1 * s$2$1;
        b20$2 = x$2$1 * z$1 * t$1 + y$2$1 * s$2$1;
        b21$2 = y$2$1 * z$1 * t$1 - x$2$1 * s$2$1;
        b22$2 = z$1 * z$1 * t$1 + c$2;
        out[0] = a00$3 * b00$3 + a10$3 * b01$3 + a20$2 * b02$2;
        out[1] = a01$3 * b00$3 + a11$3 * b01$3 + a21$2 * b02$2;
        out[2] = a02$2 * b00$3 + a12$2 * b01$3 + a22$2 * b02$2;
        out[3] = a03$1 * b00$3 + a13$1 * b01$3 + a23$1 * b02$2;
        out[4] = a00$3 * b10$3 + a10$3 * b11$3 + a20$2 * b12$2;
        out[5] = a01$3 * b10$3 + a11$3 * b11$3 + a21$2 * b12$2;
        out[6] = a02$2 * b10$3 + a12$2 * b11$3 + a22$2 * b12$2;
        out[7] = a03$1 * b10$3 + a13$1 * b11$3 + a23$1 * b12$2;
        out[8] = a00$3 * b20$2 + a10$3 * b21$2 + a20$2 * b22$2;
        out[9] = a01$3 * b20$2 + a11$3 * b21$2 + a21$2 * b22$2;
        out[10] = a02$2 * b20$2 + a12$2 * b21$2 + a22$2 * b22$2;
        out[11] = a03$1 * b20$2 + a13$1 * b21$2 + a23$1 * b22$2;
        if (a !== out) {
            out[12] = a[12];
            out[13] = a[13];
            out[14] = a[14];
            out[15] = a[15];
        }
        return out;
    };
    static rotateX = (a, rad, out = new Matrix4$1()) => {
        s$2$1 = Math.sin(rad);
        c$2 = Math.cos(rad);
        a10$3 = a[4];
        a11$3 = a[5];
        a12$2 = a[6];
        a13$1 = a[7];
        a20$2 = a[8];
        a21$2 = a[9];
        a22$2 = a[10];
        a23$1 = a[11];
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
        out[4] = a10$3 * c$2 + a20$2 * s$2$1;
        out[5] = a11$3 * c$2 + a21$2 * s$2$1;
        out[6] = a12$2 * c$2 + a22$2 * s$2$1;
        out[7] = a13$1 * c$2 + a23$1 * s$2$1;
        out[8] = a20$2 * c$2 - a10$3 * s$2$1;
        out[9] = a21$2 * c$2 - a11$3 * s$2$1;
        out[10] = a22$2 * c$2 - a12$2 * s$2$1;
        out[11] = a23$1 * c$2 - a13$1 * s$2$1;
        return out;
    };
    static rotateY = (a, rad, out = new Matrix4$1()) => {
        s$2$1 = Math.sin(rad);
        c$2 = Math.cos(rad);
        a00$3 = a[0];
        a01$3 = a[1];
        a02$2 = a[2];
        a03$1 = a[3];
        a20$2 = a[8];
        a21$2 = a[9];
        a22$2 = a[10];
        a23$1 = a[11];
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
        out[0] = a00$3 * c$2 - a20$2 * s$2$1;
        out[1] = a01$3 * c$2 - a21$2 * s$2$1;
        out[2] = a02$2 * c$2 - a22$2 * s$2$1;
        out[3] = a03$1 * c$2 - a23$1 * s$2$1;
        out[8] = a00$3 * s$2$1 + a20$2 * c$2;
        out[9] = a01$3 * s$2$1 + a21$2 * c$2;
        out[10] = a02$2 * s$2$1 + a22$2 * c$2;
        out[11] = a03$1 * s$2$1 + a23$1 * c$2;
        return out;
    };
    static rotateZ = (a, rad, out = new Matrix4$1()) => {
        s$2$1 = Math.sin(rad);
        c$2 = Math.cos(rad);
        a00$3 = a[0];
        a01$3 = a[1];
        a02$2 = a[2];
        a03$1 = a[3];
        a10$3 = a[4];
        a11$3 = a[5];
        a12$2 = a[6];
        a13$1 = a[7];
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
        out[0] = a00$3 * c$2 + a10$3 * s$2$1;
        out[1] = a01$3 * c$2 + a11$3 * s$2$1;
        out[2] = a02$2 * c$2 + a12$2 * s$2$1;
        out[3] = a03$1 * c$2 + a13$1 * s$2$1;
        out[4] = a10$3 * c$2 - a00$3 * s$2$1;
        out[5] = a11$3 * c$2 - a01$3 * s$2$1;
        out[6] = a12$2 * c$2 - a02$2 * s$2$1;
        out[7] = a13$1 * c$2 - a03$1 * s$2$1;
        return out;
    };
    static scale = (a, v, out = new Matrix4$1()) => {
        x$2$1 = v[0];
        y$2$1 = v[1];
        z$1 = v[2];
        out[0] = a[0] * x$2$1;
        out[1] = a[1] * x$2$1;
        out[2] = a[2] * x$2$1;
        out[3] = a[3] * x$2$1;
        out[4] = a[4] * y$2$1;
        out[5] = a[5] * y$2$1;
        out[6] = a[6] * y$2$1;
        out[7] = a[7] * y$2$1;
        out[8] = a[8] * z$1;
        out[9] = a[9] * z$1;
        out[10] = a[10] * z$1;
        out[11] = a[11] * z$1;
        if (out !== a) {
            out[12] = a[12];
            out[13] = a[13];
            out[14] = a[14];
            out[15] = a[15];
        }
        return out;
    };
    static targetTo = (eye, target, up = Vector3$1.VECTOR3_TOP, out = new Matrix4$1()) => {
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
    static translate = (a, v, out = new Matrix4$1()) => {
        x$2$1 = v[0];
        y$2$1 = v[1];
        z$1 = v[2];
        if (a === out) {
            out[12] = a[0] * x$2$1 + a[4] * y$2$1 + a[8] * z$1 + a[12];
            out[13] = a[1] * x$2$1 + a[5] * y$2$1 + a[9] * z$1 + a[13];
            out[14] = a[2] * x$2$1 + a[6] * y$2$1 + a[10] * z$1 + a[14];
            out[15] = a[3] * x$2$1 + a[7] * y$2$1 + a[11] * z$1 + a[15];
        }
        else {
            a00$3 = a[0];
            a01$3 = a[1];
            a02$2 = a[2];
            a03$1 = a[3];
            a10$3 = a[4];
            a11$3 = a[5];
            a12$2 = a[6];
            a13$1 = a[7];
            a20$2 = a[8];
            a21$2 = a[9];
            a22$2 = a[10];
            a23$1 = a[11];
            out[0] = a00$3;
            out[1] = a01$3;
            out[2] = a02$2;
            out[3] = a03$1;
            out[4] = a10$3;
            out[5] = a11$3;
            out[6] = a12$2;
            out[7] = a13$1;
            out[8] = a20$2;
            out[9] = a21$2;
            out[10] = a22$2;
            out[11] = a23$1;
            out[12] = a00$3 * x$2$1 + a10$3 * y$2$1 + a20$2 * z$1 + a[12];
            out[13] = a01$3 * x$2$1 + a11$3 * y$2$1 + a21$2 * z$1 + a[13];
            out[14] = a02$2 * x$2$1 + a12$2 * y$2$1 + a22$2 * z$1 + a[14];
            out[15] = a03$1 * x$2$1 + a13$1 * y$2$1 + a23$1 * z$1 + a[15];
        }
        return out;
    };
    static transpose = (a, out = new Matrix4$1()) => {
        if (out === a) {
            a01$3 = a[1];
            a02$2 = a[2];
            a03$1 = a[3];
            a12$2 = a[6];
            a13$1 = a[7];
            a23$1 = a[11];
            out[1] = a[4];
            out[2] = a[8];
            out[3] = a[12];
            out[4] = a01$3;
            out[6] = a[9];
            out[7] = a[13];
            out[8] = a02$2;
            out[9] = a12$2;
            out[11] = a[14];
            out[12] = a03$1;
            out[13] = a13$1;
            out[14] = a23$1;
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
    constructor(data = UNIT_MATRIX4_DATA$1) {
        super(data);
    }
}

let x$1$1, y$1$1;
/**
 * @class
 * @classdesc 极坐标
 * @implements {Mathx.IPolar}
 * @name Mathx.Polar
 * @desc 极坐标，遵守数学右手定则。规定逆时针方向为正方向。
 * @param {number} [r=0] | 距离极点距离
 * @param {number} [a=0] | 旋转弧度，规定0弧度为笛卡尔坐标系x轴方向
 */
class Polar {
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
    a;
    r;
    dataType = ArraybufferDataType$1.POLAR;
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
        x$1$1 = v[0];
        y$1$1 = v[1];
        this.r = Math.sqrt(x$1$1 * x$1$1 + y$1$1 * y$1$1);
        this.a = Math.atan2(y$1$1, x$1$1);
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
     * @method Mathx.Polar.prototype.set
     * @desc 设置极坐标值
     * @param {number} [r=0] 距离
     * @param {number} [a=0] 弧度
     * @returns {number} this
     */
    set(r = 0, a = 0) {
        this.r = r;
        this.a = a;
        return this;
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

let ax$1$1, ay$1$1, az$1$1, aw$1, bx$1$1, by$1$1, bz$1$1, bw;
let s$1$1 = 0, c$1$1 = 0, rad = 0, dotTmp = 0, omega = 0, len$1$1 = 0, scale0 = 0, scale1 = 0;
const tmpVec3 = new Float32Array(3);
class Quaternion extends Float32Array {
    static angleTo = (a, b) => {
        dotTmp = Quaternion.dot(a, b);
        return Math.acos(2 * dotTmp * dotTmp - 1);
    };
    static conjugate = (a, out = new Quaternion()) => {
        out[0] = -a[0];
        out[1] = -a[1];
        out[2] = -a[2];
        out[3] = a[3];
        return out;
    };
    static create = (x = 0, y = 0, z = 0, w = 1, out = new Quaternion()) => {
        out[0] = x;
        out[1] = y;
        out[2] = z;
        out[3] = w;
        return out;
    };
    static dot = (a, b) => {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
    };
    static fromAxisAngle = (axis, rad, out = new Quaternion()) => {
        rad = rad * 0.5;
        s$1$1 = Math.sin(rad);
        out[0] = s$1$1 * axis[0];
        out[1] = s$1$1 * axis[1];
        out[2] = s$1$1 * axis[2];
        out[3] = Math.cos(rad);
        return out;
    };
    static fromMatrix3 = (m, out = new Quaternion()) => {
        const fTrace = m[0] + m[4] + m[8];
        let fRoot;
        if (fTrace > 0.0) {
            fRoot = Math.sqrt(fTrace + 1.0); // 2w
            out[3] = 0.5 * fRoot;
            fRoot = 0.5 / fRoot; // 1/(4w)
            out[0] = (m[5] - m[7]) * fRoot;
            out[1] = (m[6] - m[2]) * fRoot;
            out[2] = (m[1] - m[3]) * fRoot;
        }
        else {
            let i = 0;
            if (m[4] > m[0])
                i = 1;
            if (m[8] > m[i * 3 + i])
                i = 2;
            const j = (i + 1) % 3;
            const k = (i + 2) % 3;
            fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
            out[i] = 0.5 * fRoot;
            fRoot = 0.5 / fRoot;
            out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
            out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
            out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
        }
        return out;
    };
    static identity = (out = new Quaternion()) => {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
        out[3] = 1;
        return out;
    };
    static invert = (a, out = new Quaternion()) => {
        ax$1$1 = a[0];
        ay$1$1 = a[1];
        az$1$1 = a[2];
        aw$1 = a[3];
        dotTmp = ax$1$1 * ax$1$1 + ay$1$1 * ay$1$1 + az$1$1 * az$1$1 + aw$1 * aw$1;
        if (dotTmp) {
            c$1$1 = 1.0 / dotTmp;
            out[0] = -ax$1$1 * c$1$1;
            out[1] = -ay$1$1 * c$1$1;
            out[2] = -az$1$1 * c$1$1;
            out[3] = aw$1 * c$1$1;
        }
        else {
            out[0] = 0;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
        }
        return out;
    };
    static lerp = (a, b, t, out = new Quaternion()) => {
        ax$1$1 = a[0];
        ay$1$1 = a[1];
        az$1$1 = a[2];
        aw$1 = a[3];
        out[0] = ax$1$1 + t * (b[0] - ax$1$1);
        out[1] = ay$1$1 + t * (b[1] - ay$1$1);
        out[2] = az$1$1 + t * (b[2] - az$1$1);
        out[3] = aw$1 + t * (b[3] - aw$1);
        return out;
    };
    static multiply = (a, b, out = new Quaternion()) => {
        ax$1$1 = a[0];
        ay$1$1 = a[1];
        az$1$1 = a[2];
        aw$1 = a[3];
        bx$1$1 = b[0];
        by$1$1 = b[1];
        bz$1$1 = b[2];
        bw = b[3];
        out[0] = ax$1$1 * bw + aw$1 * bx$1$1 + ay$1$1 * bz$1$1 - az$1$1 * by$1$1;
        out[1] = ay$1$1 * bw + aw$1 * by$1$1 + az$1$1 * bx$1$1 - ax$1$1 * bz$1$1;
        out[2] = az$1$1 * bw + aw$1 * bz$1$1 + ax$1$1 * by$1$1 - ay$1$1 * bx$1$1;
        out[3] = aw$1 * bw - ax$1$1 * bx$1$1 - ay$1$1 * by$1$1 - az$1$1 * bz$1$1;
        return out;
    };
    static normalize = (a, out = new Quaternion()) => {
        ax$1$1 = a[0];
        ay$1$1 = a[1];
        az$1$1 = a[2];
        aw$1 = a[3];
        len$1$1 = ax$1$1 * ax$1$1 + ay$1$1 * ay$1$1 + az$1$1 * az$1$1 + aw$1 * aw$1;
        if (len$1$1 > 0) {
            len$1$1 = 1 / Math.sqrt(len$1$1);
        }
        out[0] = ax$1$1 * len$1$1;
        out[1] = ay$1$1 * len$1$1;
        out[2] = az$1$1 * len$1$1;
        out[3] = aw$1 * len$1$1;
        return out;
    };
    static random = (out = new Quaternion()) => {
        ax$1$1 = Math.random();
        ay$1$1 = Math.random();
        az$1$1 = Math.random();
        c$1$1 = Math.sqrt(1 - ax$1$1);
        s$1$1 = Math.sqrt(ax$1$1);
        out[0] = c$1$1 * Math.sin(2.0 * Math.PI * ay$1$1);
        out[1] = c$1$1 * Math.cos(2.0 * Math.PI * ay$1$1);
        out[2] = s$1$1 * Math.sin(2.0 * Math.PI * az$1$1);
        out[3] = s$1$1 * Math.cos(2.0 * Math.PI * az$1$1);
        return out;
    };
    static rotationTo = (a, b, out = new Quaternion()) => {
        dotTmp = Vector3$1.dot(a, b);
        if (dotTmp < -1 + EPSILON$1) {
            Vector3$1.cross(Vector3$1.VECTOR3_LEFT, a, tmpVec3);
            if (Vector3$1.norm(tmpVec3) < EPSILON$1) {
                Vector3$1.cross(Vector3$1.VECTOR3_TOP, a, tmpVec3);
            }
            Vector3$1.normalize(tmpVec3, tmpVec3);
            Quaternion.fromAxisAngle(tmpVec3, Math.PI, out);
            return out;
        }
        else if (dotTmp > 1 - EPSILON$1) {
            out[0] = 0;
            out[1] = 0;
            out[2] = 0;
            out[3] = 1;
            return out;
        }
        else {
            Vector3$1.cross(tmpVec3, a, b);
            out[0] = tmpVec3[0];
            out[1] = tmpVec3[1];
            out[2] = tmpVec3[2];
            out[3] = 1 + dotTmp;
            return Quaternion.normalize(out, out);
        }
    };
    static rotateX = (a, rad, out = new Quaternion()) => {
        rad *= 0.5;
        ax$1$1 = a[0];
        ay$1$1 = a[1];
        az$1$1 = a[2];
        aw$1 = a[3];
        bx$1$1 = Math.sin(rad);
        bw = Math.cos(rad);
        out[0] = ax$1$1 * bw + aw$1 * bx$1$1;
        out[1] = ay$1$1 * bw + az$1$1 * bx$1$1;
        out[2] = az$1$1 * bw - ay$1$1 * bx$1$1;
        out[3] = aw$1 * bw - ax$1$1 * bx$1$1;
        return out;
    };
    static rotateY = (a, rad, out = new Quaternion()) => {
        rad *= 0.5;
        ax$1$1 = a[0];
        ay$1$1 = a[1];
        az$1$1 = a[2];
        aw$1 = a[3];
        by$1$1 = Math.sin(rad);
        bw = Math.cos(rad);
        out[0] = ax$1$1 * bw - az$1$1 * by$1$1;
        out[1] = ay$1$1 * bw + aw$1 * by$1$1;
        out[2] = az$1$1 * bw + ax$1$1 * by$1$1;
        out[3] = aw$1 * bw - ay$1$1 * by$1$1;
        return out;
    };
    static rotateZ = (a, rad, out = new Quaternion()) => {
        rad *= 0.5;
        ax$1$1 = a[0];
        ay$1$1 = a[1];
        az$1$1 = a[2];
        aw$1 = a[3];
        bz$1$1 = Math.sin(rad);
        bw = Math.cos(rad);
        out[0] = ax$1$1 * bw + ay$1$1 * bz$1$1;
        out[1] = ay$1$1 * bw - ax$1$1 * bz$1$1;
        out[2] = az$1$1 * bw + aw$1 * bz$1$1;
        out[3] = aw$1 * bw - az$1$1 * bz$1$1;
        return out;
    };
    static slerp = (a, b, t, out = new Quaternion()) => {
        ax$1$1 = a[0];
        ay$1$1 = a[1];
        az$1$1 = a[2];
        aw$1 = a[3];
        bx$1$1 = b[0];
        by$1$1 = b[1];
        bz$1$1 = b[2];
        bw = b[3];
        c$1$1 = ax$1$1 * bx$1$1 + ay$1$1 * by$1$1 + az$1$1 * bz$1$1 + aw$1 * bw;
        if (c$1$1 < 0.0) {
            c$1$1 = -c$1$1;
            bx$1$1 = -bx$1$1;
            by$1$1 = -by$1$1;
            bz$1$1 = -bz$1$1;
            bw = -bw;
        }
        if (1.0 - c$1$1 > EPSILON$1) {
            omega = Math.acos(c$1$1);
            s$1$1 = Math.sin(omega);
            scale0 = Math.sin((1.0 - t) * omega) / s$1$1;
            scale1 = Math.sin(t * omega) / s$1$1;
        }
        else {
            scale0 = 1.0 - t;
            scale1 = t;
        }
        out[0] = scale0 * ax$1$1 + scale1 * bx$1$1;
        out[1] = scale0 * ay$1$1 + scale1 * by$1$1;
        out[2] = scale0 * az$1$1 + scale1 * bz$1$1;
        out[3] = scale0 * aw$1 + scale1 * bw;
        return out;
    };
    static toAxisAngle = (q, outAxis) => {
        rad = Math.acos(q[3]) * 2.0;
        s$1$1 = Math.sin(rad / 2.0);
        if (s$1$1 > EPSILON$1) {
            outAxis[0] = q[0] / s$1$1;
            outAxis[1] = q[1] / s$1$1;
            outAxis[2] = q[2] / s$1$1;
        }
        else {
            outAxis[0] = 1;
            outAxis[1] = 0;
            outAxis[2] = 0;
        }
        return rad;
    };
    static toString = (a) => {
        return `quat("${a[0]}, ${a[1]}, ${a[2]}, ${a[3]})`;
    };
    length;
    dataType = ArraybufferDataType$1.QUATERNION;
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

var rndFloat = (low, high) => {
    return low + Math.random() * (high - low);
};

var rndFloatRange = (range) => {
    return range * (0.5 - Math.random());
};

var rndInt = (low, high) => {
    return low + Math.floor(Math.random() * (high - low + 1));
};

// import Matrix3 from "../matrix/Matrix3";
const v1 = new Vector3$1(), v2 = new Vector3$1(), v0 = new Vector3$1(), f1 = new Vector3$1(), f2 = new Vector3$1(), f0 = new Vector3$1();
const ta = new Vector3$1();
// const ma: Matrix3 = new Matrix3();
const tb = new Vector3$1(), vA = new Vector3$1();
const defaultMax = [1, 1, 1];
class Cube {
    static clampPoint = (a, point, out = new Vector3$1()) => {
        return Vector3$1.clamp(point, a.min, a.max, out);
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
        return Vector3$1.equals(a.min, b.min) && Vector3$1.equals(a.max, b.max);
    };
    static getCenter = (a, out = new Vector3$1()) => {
        Vector3$1.add(a.min, a.max, out);
        return Vector3$1.multiplyScalar(out, 0.5, out);
    };
    static getSize = (a, out = new Vector3$1()) => {
        return Vector3$1.minus(a.max, a.min, out);
    };
    static height = (a) => {
        return a.max[1] - a.min[1];
    };
    static intersect = (a, b, out = new Cube()) => {
        Vector3$1.max(a.min, b.min, out.min);
        Vector3$1.min(a.max, b.max, out.max);
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
        return Vector3$1.distanceToSquared(ta, b.position) <= b.radius * b.radius;
    };
    static intersectsTriangle = (a, b) => {
        if (Cube.isEmpty(a)) {
            return false;
        }
        Cube.getCenter(a, ta);
        Vector3$1.minus(a.max, ta, tb);
        // translate triangle to aabb origin
        Vector3$1.minus(b.a, ta, v0);
        Vector3$1.minus(b.b, ta, v1);
        Vector3$1.minus(b.c, ta, v2);
        // compute edge vectors for triangle
        Vector3$1.minus(v1, v0, f0);
        Vector3$1.minus(v2, v1, f1);
        Vector3$1.minus(v0, v2, f2);
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
        if (!satForAxes(axes, v0, v1, v2, tb)) {
            return false;
        }
        // test 3 face normals from the aabb
        // ta = Matrix3.identity(); ???
        if (!satForAxes(axes, v0, v1, v2, tb)) {
            return false;
        }
        // finally testing the face normal of the triangle
        // use already existing triangle edge vectors here
        Vector3$1.cross(f0, f1, ta);
        // axes = [_triangleNormal.x, _triangleNormal.y, _triangleNormal.z];
        return satForAxes(ta, v0, v1, v2, tb);
    };
    static isEmpty = (a) => {
        return a.max[0] < a.min[0] || a.max[0] < a.min[0] || a.max[0] < a.min[0];
    };
    static round = (a, out = new Cube()) => {
        Vector3$1.round(a.min, out.min);
        Vector3$1.round(a.max, out.max);
        return out;
    };
    static size = (a, out = new Vector3$1()) => {
        return Vector3$1.minus(a.max, a.min, out);
    };
    static stretch = (a, b, c, out = new Cube()) => {
        Vector3$1.add(a.min, b, out.min);
        Vector3$1.add(a.max, c, out.max);
        return out;
    };
    static surfaceArea = (a) => {
        Cube.getSize(a, ta);
        return (ta.x * ta.y + ta.x * ta.z + ta.y * ta.z) * 2;
    };
    static translate = (a, b, out = new Cube()) => {
        Vector3$1.add(a.min, b, out.min);
        Vector3$1.add(a.max, b, out.max);
        return out;
    };
    static union = (a, b, out = new Cube()) => {
        Vector3$1.min(a.min, b.min, out.min);
        Vector3$1.max(a.max, b.max, out.max);
        return out;
    };
    static volume = (a) => {
        return (a.max[0] - a.min[0]) * (a.max[1] - a.min[1]) * (a.max[2] - a.min[2]);
    };
    static width = (a) => {
        return a.max[0] - a.min[0];
    };
    min = new Vector3$1();
    max = new Vector3$1();
    constructor(a = new Vector3$1(), b = Vector3$1.fromArray(defaultMax)) {
        Vector3$1.min(a, b, this.min);
        Vector3$1.max(a, b, this.max);
    }
}
let i, j, p0, p1, p2, r$1;
function satForAxes(axes, v0, v1, v2, extents) {
    for (i = 0, j = axes.length - 3; i <= j; i += 3) {
        Vector3$1.fromArray(axes, i, vA);
        // project the aabb onto the seperating axis
        r$1 =
            extents[0] * Math.abs(vA[0]) +
                extents[1] * Math.abs(vA[1]) +
                extents[2] * Math.abs(vA[2]);
        // project all 3 vertices of the triangle onto the seperating axis
        p0 = Vector3$1.dot(v0, vA);
        p1 = Vector3$1.dot(v1, vA);
        p2 = Vector3$1.dot(v2, vA);
        // actual test, basically see if either of the most extreme of the triangle points intersects r
        if (Math.max(-Math.max(p0, p1, p2), Math.min(p0, p1, p2)) > r$1) {
            // points of the projected triangle are outside the projected half-length of the aabb
            // the axis is seperating and we can exit
            return false;
        }
    }
    return true;
}

let x$5 = 0;
let y$5 = 0;
let c$3 = 0;
let s$4 = 0;
class Vector2$1 extends Float32Array {
    static VECTOR2_ZERO = new Vector2$1(0, 0);
    static VECTOR2_TOP = new Vector2$1(0, 1);
    static VECTOR2_BOTTOM = new Vector2$1(0, -1);
    static VECTOR2_LEFT = new Vector2$1(-1, 0);
    static VECTOR2_RIGHT = new Vector2$1(1, 0);
    static VECTOR2_ONE = new Vector2$1(1, 1);
    static add = (a, b, out = new Vector2$1()) => {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        return out;
    };
    static addScalar = (a, b, out = new Vector2$1(2)) => {
        out[0] = a[0] + b;
        out[1] = a[1] + b;
        return out;
    };
    static angle = (a) => {
        return Math.atan2(a[1], a[0]);
    };
    static ceil = (a, out = new Vector2$1()) => {
        out[0] = Math.ceil(a[0]);
        out[1] = Math.ceil(a[1]);
        return out;
    };
    static clamp = (a, min, max, out = new Vector2$1()) => {
        out[0] = clampCommon$1(a[0], min[0], max[0]);
        out[1] = clampCommon$1(a[1], min[1], max[1]);
        return out;
    };
    static clampSafe = (a, min, max, out = new Vector2$1()) => {
        out[0] = clampSafeCommon$1(a[0], min[0], max[0]);
        out[1] = clampSafeCommon$1(a[1], min[1], max[1]);
        return out;
    };
    static clampLength = (a, min, max, out = new Vector2$1()) => {
        out[0] = clampSafeCommon$1(a[0], min[0], max[0]);
        out[1] = clampSafeCommon$1(a[1], min[1], max[1]);
        return out;
    };
    static clampScalar = (a, min, max, out = new Vector2$1()) => {
        out[0] = clampCommon$1(a[0], min, max);
        out[1] = clampCommon$1(a[1], min, max);
        return out;
    };
    static closeTo = (a, b, epsilon = EPSILON$1) => {
        return Vector2$1.distanceTo(a, b) <= epsilon;
    };
    static closeToRect = (a, b, epsilon = EPSILON$1) => {
        return closeToCommon$1(a[0], b[0], epsilon) && closeToCommon$1(a[1], b[1], epsilon);
    };
    static closeToManhattan = (a, b, epsilon = EPSILON$1) => {
        return Vector2$1.distanceToManhattan(a, b) <= epsilon;
    };
    static clone = (a, out = new Vector2$1()) => {
        out[0] = a[0];
        out[1] = a[1];
        return out;
    };
    static cross = (a, b) => {
        return a[0] * b[1] - a[1] * b[0];
    };
    static create = (x = 0, y = 0, out = new Vector2$1()) => {
        out[0] = x;
        out[1] = y;
        return out;
    };
    static distanceTo = (a, b) => {
        x$5 = b[0] - a[0];
        y$5 = b[1] - a[1];
        return Math.hypot(x$5, y$5);
    };
    static distanceToManhattan = (a, b) => {
        return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    };
    static distanceToSquared = (a, b) => {
        x$5 = a[0] - b[0];
        y$5 = a[1] - b[1];
        return x$5 * x$5 + y$5 * y$5;
    };
    static divide = (a, b, out = new Vector2$1()) => {
        out[0] = a[0] / b[0];
        out[1] = a[1] / b[1];
        return out;
    };
    static divideScalar = (a, scalar, out = new Vector2$1()) => {
        return Vector2$1.multiplyScalar(a, 1 / scalar, out);
    };
    static dot = (a, b) => {
        return a[0] * b[0] + a[1] * b[1];
    };
    static equals = (a, b) => {
        return a[0] === b[0] && a[1] === b[1];
    };
    static floor = (a, out = new Vector2$1()) => {
        out[0] = Math.floor(a[0]);
        out[1] = Math.floor(a[1]);
        return out;
    };
    static floorToZero = (a, out = new Vector2$1()) => {
        out[0] = floorToZeroCommon$1(a[0]);
        out[1] = floorToZeroCommon$1(a[1]);
        return out;
    };
    static fromArray = (arr, index = 0, out = new Vector2$1()) => {
        out[0] = arr[index];
        out[1] = arr[index + 1];
        return out;
    };
    static fromJson = (j, out = new Vector2$1()) => {
        out[0] = j.x;
        out[1] = j.y;
        return out;
    };
    static fromPolar = (p, out = new Vector2$1()) => {
        out[0] = Math.cos(p.a) * p.r;
        out[1] = Math.sin(p.a) * p.r;
        return out;
    };
    static fromScalar = (value = 0, out = new Vector2$1()) => {
        out[0] = out[1] = value;
        return out;
    };
    static inverse = (a, out = new Vector2$1()) => {
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
    static lerp = (a, b, alpha, out = new Vector2$1()) => {
        out[0] = (b[0] - a[0]) * alpha + a[0];
        out[1] = (b[1] - a[1]) * alpha + a[1];
        return out;
    };
    static max = (a, b, out = new Vector2$1()) => {
        out[0] = Math.max(a[0], b[0]);
        out[1] = Math.max(a[1], b[1]);
        return out;
    };
    static min = (a, b, out = new Vector2$1()) => {
        out[0] = Math.min(a[0], b[0]);
        out[1] = Math.min(a[1], b[1]);
        return out;
    };
    static minus = (a, b, out = new Vector2$1()) => {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[0];
        return out;
    };
    static minusScalar = (a, num, out = new Vector2$1()) => {
        out[0] = a[0] - num;
        out[1] = a[1] - num;
        return out;
    };
    static multiply = (a, b, out = new Vector2$1()) => {
        out[0] = a[0] * b[0];
        out[1] = a[1] * b[1];
        return out;
    };
    static multiplyScalar = (a, scalar, out = new Vector2$1()) => {
        out[0] = a[0] * scalar;
        out[1] = a[1] * scalar;
        return out;
    };
    static negate = (a, out = new Vector2$1()) => {
        out[0] = -a[0];
        out[1] = -a[1];
        return out;
    };
    static normalize = (a, out = new Vector2$1()) => {
        return Vector2$1.divideScalar(a, Vector2$1.norm(a) || 1, out);
    };
    static random = (norm = 1, out = new Vector2$1()) => {
        x$5 = Math.random() * DEG_360_RAD$1;
        out[0] = Math.cos(x$5) * norm;
        out[1] = Math.sin(x$5) * norm;
        return out;
    };
    static rotate = (a, angle, center = Vector2$1.VECTOR2_ZERO, out = new Vector2$1(2)) => {
        c$3 = Math.cos(angle);
        s$4 = Math.sin(angle);
        x$5 = a[0] - center[0];
        y$5 = a[1] - center[1];
        out[0] = x$5 * c$3 - y$5 * s$4 + center[0];
        out[1] = x$5 * s$4 + y$5 * c$3 + center[1];
        return out;
    };
    static round = (a, out = new Vector2$1()) => {
        out[0] = Math.round(a[0]);
        out[1] = Math.round(a[1]);
        return out;
    };
    static set = (x = 0, y = 0, out = new Vector2$1()) => {
        out[0] = x;
        out[1] = y;
        return out;
    };
    static setNorm = (a, length, out = new Vector2$1(2)) => {
        Vector2$1.normalize(a, out);
        Vector2$1.multiplyScalar(out, length, out);
        return out;
    };
    static toArray = (a, arr = []) => {
        arr[0] = a[0];
        arr[1] = a[1];
        return arr;
    };
    static toPalorJson = (a, p = { a: 0, r: 0 }) => {
        p.r = Vector2$1.norm(a);
        p.a = Vector2$1.angle(a);
        return p;
    };
    static toString = (a) => {
        return `(${a[0]}, ${a[1]})`;
    };
    static transformMatrix3 = (a, m, out = new Vector2$1()) => {
        x$5 = a[0];
        y$5 = a[1];
        out[0] = m[0] * x$5 + m[3] * y$5 + m[6];
        out[1] = m[1] * x$5 + m[4] * y$5 + m[7];
        return out;
    };
    length;
    dataType = ArraybufferDataType$1.VECTOR2;
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
    static create = (a = Vector2$1.create(), b = Vector2$1.create(1, 1)) => {
        return {
            max: Vector2$1.max(a, b),
            min: Vector2$1.min(a, b)
        };
    };
    static equals = (a, b) => {
        return Vector2$1.equals(a.min, b.min) && Vector2$1.equals(a.max, b.max);
    };
    static getCenter = (a, out = Vector2$1.create()) => {
        Vector2$1.add(a.min, a.max, out);
        return Vector2$1.multiplyScalar(out, 0.5, out);
    };
    static getSize = (a, out = Vector2$1.create()) => {
        return Vector2$1.minus(a.max, a.min, out);
    };
    static height = (a) => {
        return a.max[1] - a.min[1];
    };
    static intersect = (a, b, out = new Rectangle2()) => {
        Vector2$1.max(a.min, b.min, out.min);
        Vector2$1.min(a.max, b.max, out.max);
        return out;
    };
    static stretch = (a, b, c, out = new Rectangle2()) => {
        Vector2$1.add(a.min, b, out.min);
        Vector2$1.add(a.max, c, out.max);
        return out;
    };
    static translate = (a, b, out = new Rectangle2()) => {
        Vector2$1.add(a.min, b, out.min);
        Vector2$1.add(a.max, b, out.max);
        return out;
    };
    static union = (a, b, out = new Rectangle2()) => {
        Vector2$1.min(a.min, b.min, out.min);
        Vector2$1.max(a.max, b.max, out.max);
        return out;
    };
    static width = (a) => {
        return a.max[0] - a.min[0];
    };
    min = Vector2$1.create();
    max = Vector2$1.create();
    constructor(a = Vector2$1.create(), b = Vector2$1.create(1, 1)) {
        Vector2$1.min(a, b, this.min);
        Vector2$1.max(a, b, this.max);
    }
}

let r = 0;
class Sphere {
    static boundingBox = (a, out = new Cube()) => {
        Vector3$1.minusScalar(a.position, a.radius, out.min);
        Vector3$1.addScalar(a.position, a.radius, out.max);
        return out;
    };
    static containsPoint = (a, b) => {
        return Vector3$1.distanceToSquared(a.position, b) <= a.radius * a.radius;
    };
    static distanceToPoint = (a, b) => {
        return Vector3$1.distanceTo(a.position, b) - a.radius;
    };
    static equals = (a, b) => {
        return Vector3$1.equals(a.position, b.position) && a.radius === b.radius;
    };
    static intersectsSphere = (a, b) => {
        r = a.radius + b.radius;
        return Vector3$1.distanceToSquared(a.position, b.position) <= r * r;
    };
    position;
    radius;
    constructor(position = new Vector3$1(), radius = 1) {
        this.position = position;
        this.radius = radius;
    }
}

const ab$1 = new Vector2$1();
const bc$1 = new Vector2$1();
class Triangle2 {
    static area = (t) => {
        const c = Triangle2.getABLength(t);
        const a = Triangle2.getBCLength(t);
        const b = Triangle2.getCALength(t);
        const p = (c + a + b) / 2;
        return Math.sqrt(p * (p - a) * (p - b) * (p - c));
    };
    static create = (a = new Vector2$1(-1, -1), b = new Vector2$1(1, -1), c = new Vector2$1(0, 1)) => {
        return new Triangle2(a, b, c);
    };
    static getABLength = (t) => {
        return Vector2$1.distanceTo(t.a, t.b);
    };
    static getBCLength = (t) => {
        return Vector2$1.distanceTo(t.b, t.c);
    };
    static getCALength = (t) => {
        return Vector2$1.distanceTo(t.c, t.a);
    };
    static normal = (t) => {
        Vector2$1.minus(t.c, t.b, bc$1);
        Vector2$1.minus(t.b, t.a, ab$1);
        const v = Vector2$1.cross(ab$1, bc$1);
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
    constructor(a = new Vector2$1(-1, -1), b = new Vector2$1(1, -1), c = new Vector2$1(0, 1)) {
        this.a = a;
        this.b = b;
        this.c = c;
    }
}

const ab = new Vector3$1();
const bc = new Vector3$1();
class Triangle3 {
    static area = (t) => {
        const c = Triangle3.getABLength(t);
        const a = Triangle3.getBCLength(t);
        const b = Triangle3.getCALength(t);
        const p = (c + a + b) / 2;
        return Math.sqrt(p * (p - a) * (p - b) * (p - c));
    };
    static create = (a = new Vector3$1(-1, -1, 0), b = new Vector3$1(1, -1, 0), c = new Vector3$1(0, 1, 0)) => {
        return { a, b, c };
    };
    static getABLength = (t) => {
        return Vector3$1.distanceTo(t.a, t.b);
    };
    static getBCLength = (t) => {
        return Vector3$1.distanceTo(t.b, t.c);
    };
    static getCALength = (t) => {
        return Vector3$1.distanceTo(t.c, t.a);
    };
    static normal = (t, out = Vector3$1.create()) => {
        Vector3$1.minus(t.c, t.b, bc);
        Vector3$1.minus(t.b, t.a, ab);
        Vector3$1.cross(ab, bc, out);
        return Vector3$1.normalize(out);
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
    constructor(a = new Vector3$1(-1, -1, 0), b = new Vector3$1(1, -1, 0), c = new Vector3$1(0, 1, 0)) {
        this.a = a;
        this.b = b;
        this.c = c;
    }
}

let dis, r2, d2;
const v = new Vector3$1();
class Ray3 {
    static at = (a, b, out = new Vector3$1()) => {
        return Vector3$1.multiplyScalar(a.direction, b, out);
    };
    static distanceToPoint = (a, point) => {
        return Math.sqrt(Ray3.distanceSqToPoint(a, point));
    };
    static distanceSqToPoint = (a, point) => {
        Vector3$1.minus(point, a.position, v);
        dis = Vector3$1.dot(v, a.direction);
        if (dis < 0) {
            return Vector3$1.distanceToSquared(a.position, point);
        }
        Vector3$1.multiplyScalar(a.direction, dis, v);
        Vector3$1.add(v, a.position, v);
        return Vector3$1.distanceToSquared(v, point);
    };
    static lookAt = (a, b, out = new Ray3()) => {
        if (a !== out) {
            Vector3$1.fromArray(a.position, 0, out.position);
        }
        Vector3$1.normalize(Vector3$1.minus(b, a.position, out.direction));
        return out;
    };
    static intersectSphere = (ray, sphere, target) => {
        Vector3$1.minus(sphere.position, ray.position, v);
        dis = Vector3$1.dot(v, ray.direction);
        d2 = Vector3$1.dot(v, v) - dis * dis;
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
    static intersectsSphere = (ray, sphere) => {
        return Ray3.distanceSqToPoint(ray, sphere.position) <= sphere.radius * sphere.radius;
    };
    position;
    direction;
    constructor(position = new Vector3$1(), direction = new Vector3$1(0, 0, -1)) {
        this.position = position;
        this.direction = Vector3$1.normalize(direction);
    }
}

// import clampCommon from "../common/clamp";
let ax$3, ay$3, az$3, aw$2, bx$3, by$3, bz$3, len$4;
let ix$1, iy$1, iz$1, iw$1;
let A$1, B$1, C$1, D$1, E$1, F$1, G$1, H$1, I$1, J$1;
class Vector4$1 extends Float32Array {
    static VECTOR3_ZERO = new Vector4$1(0, 0, 0, 0);
    static VECTOR3_ONE = new Vector4$1(1, 1, 1, 1);
    static add = (a, b, out = new Vector4$1()) => {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        out[2] = a[2] + b[2];
        out[3] = a[3] + b[3];
        return out;
    };
    static ceil = (a, out = new Vector4$1()) => {
        out[0] = Math.ceil(a[0]);
        out[1] = Math.ceil(a[1]);
        out[2] = Math.ceil(a[2]);
        out[3] = Math.ceil(a[3]);
        return out;
    };
    static closeTo = (a, b) => {
        return (closeToCommon$1(a[0], b[0]) &&
            closeToCommon$1(a[1], b[1]) &&
            closeToCommon$1(a[2], b[2]) &&
            closeToCommon$1(a[3], b[3]));
    };
    static create = (x = 0, y = 0, z = 0, w = 0, out = new Vector4$1()) => {
        out[0] = x;
        out[1] = y;
        out[2] = z;
        out[3] = w;
        return out;
    };
    static cross = (u, v, w, out = new Vector4$1(4)) => {
        A$1 = v[0] * w[1] - v[1] * w[0];
        B$1 = v[0] * w[2] - v[2] * w[0];
        C$1 = v[0] * w[3] - v[3] * w[0];
        D$1 = v[1] * w[2] - v[2] * w[1];
        E$1 = v[1] * w[3] - v[3] * w[1];
        F$1 = v[2] * w[3] - v[3] * w[2];
        G$1 = u[0];
        H$1 = u[1];
        I$1 = u[2];
        J$1 = u[3];
        out[0] = H$1 * F$1 - I$1 * E$1 + J$1 * D$1;
        out[1] = -(G$1 * F$1) + I$1 * C$1 - J$1 * B$1;
        out[2] = G$1 * E$1 - H$1 * C$1 + J$1 * A$1;
        out[3] = -(G$1 * D$1) + H$1 * B$1 - I$1 * A$1;
        return out;
    };
    static distanceTo = (a, b) => {
        ax$3 = b[0] - a[0];
        ay$3 = b[1] - a[1];
        az$3 = b[2] - a[2];
        aw$2 = b[3] - a[3];
        return Math.hypot(ax$3, ay$3, az$3, aw$2);
    };
    static distanceToSquared = (a, b) => {
        ax$3 = b[0] - a[0];
        ay$3 = b[1] - a[1];
        az$3 = b[2] - a[2];
        aw$2 = b[3] - a[3];
        return ax$3 * ax$3 + ay$3 * ay$3 + az$3 * az$3 + aw$2 * aw$2;
    };
    static divide = (a, b, out = new Vector4$1()) => {
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
    static floor = (a, out = new Vector4$1()) => {
        out[0] = Math.floor(a[0]);
        out[1] = Math.floor(a[1]);
        out[2] = Math.floor(a[2]);
        out[3] = Math.floor(a[3]);
        return out;
    };
    static fromValues = (x, y, z, w, out = new Vector4$1()) => {
        out[0] = x;
        out[1] = y;
        out[2] = z;
        out[3] = w;
        return out;
    };
    static inverse = (a, out = new Vector4$1()) => {
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
        ax$3 = a[0];
        ay$3 = a[1];
        az$3 = a[2];
        aw$2 = a[3];
        return ax$3 * ax$3 + ay$3 * ay$3 + az$3 * az$3 + aw$2 * aw$2;
    };
    static lerp = (a, b, t, out = new Vector4$1()) => {
        ax$3 = a[0];
        ay$3 = a[1];
        az$3 = a[2];
        aw$2 = a[3];
        out[0] = ax$3 + t * (b[0] - ax$3);
        out[1] = ay$3 + t * (b[1] - ay$3);
        out[2] = az$3 + t * (b[2] - az$3);
        out[3] = aw$2 + t * (b[3] - aw$2);
        return out;
    };
    static max = (a, b, out = new Vector4$1()) => {
        out[0] = Math.max(a[0], b[0]);
        out[1] = Math.max(a[1], b[1]);
        out[2] = Math.max(a[2], b[2]);
        out[3] = Math.max(a[3], b[3]);
        return out;
    };
    static min = (a, b, out = new Vector4$1()) => {
        out[0] = Math.min(a[0], b[0]);
        out[1] = Math.min(a[1], b[1]);
        out[2] = Math.min(a[2], b[2]);
        out[3] = Math.min(a[3], b[3]);
        return out;
    };
    static minus = (a, b, out = new Vector4$1()) => {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        out[2] = a[2] - b[2];
        out[3] = a[3] - b[3];
        return out;
    };
    static multiply = (a, b, out = new Vector4$1()) => {
        out[0] = a[0] * b[0];
        out[1] = a[1] * b[1];
        out[2] = a[2] * b[2];
        out[3] = a[3] * b[3];
        return out;
    };
    static multiplyScalar = (a, b, out = new Vector4$1()) => {
        out[0] = a[0] * b;
        out[1] = a[1] * b;
        out[2] = a[2] * b;
        out[3] = a[3] * b;
        return out;
    };
    static negate = (a, out = new Vector4$1()) => {
        out[0] = -a[0];
        out[1] = -a[1];
        out[2] = -a[2];
        out[3] = -a[3];
        return out;
    };
    static normalize = (a, out = new Vector4$1()) => {
        ax$3 = a[0];
        ay$3 = a[1];
        az$3 = a[2];
        aw$2 = a[3];
        len$4 = ax$3 * ax$3 + ay$3 * ay$3 + az$3 * az$3 + aw$2 * aw$2;
        if (len$4 > 0) {
            len$4 = 1 / Math.sqrt(len$4);
        }
        out[0] = ax$3 * len$4;
        out[1] = ay$3 * len$4;
        out[2] = az$3 * len$4;
        out[3] = aw$2 * len$4;
        return out;
    };
    static round = (a, out = new Vector4$1()) => {
        out[0] = Math.round(a[0]);
        out[1] = Math.round(a[1]);
        out[2] = Math.round(a[2]);
        out[3] = Math.round(a[3]);
        return out;
    };
    static set = (x = 0, y = 0, z = 0, w = 0, out = new Vector4$1()) => {
        out[0] = x;
        out[1] = y;
        out[2] = z;
        out[4] = w;
        return out;
    };
    static setNorm = (a, length, out = new Vector4$1(2)) => {
        Vector4$1.normalize(a, out);
        Vector4$1.multiplyScalar(out, length, out);
        return out;
    };
    static toString = (a) => {
        return `(${a[0]}, ${a[1]}, ${a[2]}, ${a[3]})`;
    };
    static transformMatrix4 = (a, m, out = new Vector4$1()) => {
        ax$3 = a[0];
        ay$3 = a[1];
        az$3 = a[2];
        aw$2 = a[3];
        out[0] = m[0] * ax$3 + m[4] * ay$3 + m[8] * az$3 + m[12] * aw$2;
        out[1] = m[1] * ax$3 + m[5] * ay$3 + m[9] * az$3 + m[13] * aw$2;
        out[2] = m[2] * ax$3 + m[6] * ay$3 + m[10] * az$3 + m[14] * aw$2;
        out[3] = m[3] * ax$3 + m[7] * ay$3 + m[11] * az$3 + m[15] * aw$2;
        return out;
    };
    static transformQuat = (a, q, out = new Vector4$1()) => {
        bx$3 = a[0];
        by$3 = a[1];
        bz$3 = a[2];
        ax$3 = q[0];
        ay$3 = q[1];
        az$3 = q[2];
        aw$2 = q[3];
        ix$1 = aw$2 * bx$3 + ay$3 * bz$3 - az$3 * by$3;
        iy$1 = aw$2 * by$3 + az$3 * bx$3 - ax$3 * bz$3;
        iz$1 = aw$2 * bz$3 + ax$3 * by$3 - ay$3 * bx$3;
        iw$1 = -ax$3 * bx$3 - ay$3 * by$3 - az$3 * bz$3;
        out[0] = ix$1 * aw$2 + iw$1 * -ax$3 + iy$1 * -az$3 - iz$1 * -ay$3;
        out[1] = iy$1 * aw$2 + iw$1 * -ay$3 + iz$1 * -ax$3 - ix$1 * -az$3;
        out[2] = iz$1 * aw$2 + iw$1 * -az$3 + ix$1 * -ay$3 - iy$1 * -ax$3;
        out[3] = a[3];
        return out;
    };
    length;
    dataType = ArraybufferDataType$1.VECTOR4;
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

var Mathx_module = /*#__PURE__*/Object.freeze({
	__proto__: null,
	ArraybufferDataType: ArraybufferDataType$1,
	COLOR_HEX_MAP: COLOR_HEX_MAP,
	ColorGPU: ColorGPU,
	ColorRGB: ColorRGB,
	ColorRGBA: ColorRGBA,
	Constants: constants,
	Cube: Cube,
	Easing: index$4,
	EulerAngle: EulerAngle,
	get EulerRotationOrders () { return EulerRotationOrders$1; },
	Matrix2: Matrix2$1,
	Matrix3: Matrix3$1,
	Matrix4: Matrix4$1,
	Polar: Polar,
	Quaternion: Quaternion,
	Ray3: Ray3,
	Rectangle2: Rectangle2,
	Sphere: Sphere,
	Triangle2: Triangle2,
	Triangle3: Triangle3,
	Vector2: Vector2$1,
	Vector3: Vector3$1,
	Vector4: Vector4$1,
	ceilPowerOfTwo: ceilPowerOfTwo,
	clamp: clampCommon$1,
	clampCircle: clampCircle,
	clampSafe: clampSafeCommon$1,
	closeTo: closeToCommon$1,
	floorPowerOfTwo: floorPowerOfTwo,
	floorToZero: floorToZeroCommon$1,
	isPowerOfTwo: isPowerOfTwo,
	lerp: lerp,
	mapRange: mapRange,
	randFloat: randFloat,
	randInt: randInt,
	rndFloat: rndFloat,
	rndFloatRange: rndFloatRange,
	rndInt: rndInt,
	sum: sum,
	sumArray: sumArray
});

const DEFAULT_OPTIONS = {
    hasNormal: true,
    hasUV: true,
    hasIndices: false,
    combine: true,
    topology: "triangle-list",
    cullMode: "none"
};

const DEFAULT_BOX_OPTIONS = Object.assign(Object.assign({}, DEFAULT_OPTIONS), { hasIndices: true, combine: true, width: 1, height: 1, depth: 1, widthSegments: 1, heightSegments: 1, depthSegments: 1, cullMode: "back" });
var createBox3 = (options = {}) => {
    let stride = 3;
    const indices = [];
    const vertices = [];
    const normals = [];
    const uvs = [];
    const { depth, height, width, depthSegments, heightSegments, widthSegments, topology, cullMode, hasUV, hasNormal, combine } = Object.assign(Object.assign({}, DEFAULT_BOX_OPTIONS), options);
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
        const vector = new Vector3$1();
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

const DEFAULT_CIRCLE_OPTIONS$1 = Object.assign(Object.assign({}, DEFAULT_OPTIONS), { hasIndices: true, combine: true, segments: 32, angleStart: 0, angle: Math.PI * 2, radius: 1 });
var createCircle3 = (options = {}) => {
    let stride = 3;
    const indices = [];
    const positions = [0, 0, 0];
    const normals = [0, 0, 1];
    const uvs = [0.5, 0.5];
    const { segments, angleStart, angle, radius, topology, cullMode, hasUV, hasNormal, combine } = Object.assign(Object.assign({}, DEFAULT_CIRCLE_OPTIONS$1), options);
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

const DEFAULT_SPHERE_OPTIONS$1 = Object.assign(Object.assign({}, DEFAULT_OPTIONS), { hasIndices: true, combine: true, radiusTop: 1, radiusBottom: 1, height: 1, radialSegments: 32, heightSegments: 1, openEnded: false, thetaStart: 0, thetaLength: constants.DEG_360_RAD, cullMode: "back" });
var createCylinder3 = (options = {}) => {
    let stride = 3;
    const indices = [];
    const vertices = [];
    const normals = [];
    const uvs = [];
    const { height, radialSegments, radiusTop, radiusBottom, heightSegments, openEnded, thetaStart, thetaLength, topology, cullMode, hasUV, hasNormal, combine } = Object.assign(Object.assign({}, DEFAULT_SPHERE_OPTIONS$1), options);
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
        const normal = new Vector3$1();
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
                Vector3$1.normalize(normal, normal);
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

const DEFAULT_PLANE_OPTIONS$1 = Object.assign(Object.assign({}, DEFAULT_OPTIONS), { hasIndices: true, combine: true, width: 1, height: 1, segmentX: 1, segmentY: 1 });
var createPlane3 = (options = {}) => {
    const { width, height, segmentX, segmentY, topology, cullMode, hasUV, hasNormal, combine } = Object.assign(Object.assign({}, DEFAULT_PLANE_OPTIONS$1), options);
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

var createTriangle3 = (t = Triangle3.create(), options = DEFAULT_OPTIONS, topology = "triangle-list", cullMode = "none") => {
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

const DEFAULT_SPHERE_OPTIONS = Object.assign(Object.assign({}, DEFAULT_OPTIONS), { hasIndices: true, combine: true, radius: 1, phiStart: 0, phiLength: Math.PI * 2, thetaStart: 0, thetaLength: Math.PI, widthSegments: 32, heightSegments: 32, cullMode: "back" });
var createSphere3 = (options = {}) => {
    let stride = 3;
    const { radius, phiStart, phiLength, thetaStart, thetaLength, widthSegments, heightSegments, topology, cullMode, hasUV, hasNormal, combine } = Object.assign(Object.assign({}, DEFAULT_SPHERE_OPTIONS), options);
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
            normal.set(Vector3$1.normalize(vertex));
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

var index$3 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	createBox3: createBox3,
	createCircle3: createCircle3,
	createCylinder3: createCylinder3,
	createPlane3: createPlane3,
	createTriangle3: createTriangle3,
	createSphere3: createSphere3
});

const DEFAULT_CIRCLE_OPTIONS = Object.assign(Object.assign({}, DEFAULT_OPTIONS), { hasIndices: true, combine: true, segments: 32, angleStart: 0, angle: Math.PI * 2, radius: 1, cullMode: "back" });
var createCircle2 = (options = {}) => {
    let stride = 3;
    const indices = [];
    const positions = [0, 0];
    const uvs = [0.5, 0.5];
    const { segments, angleStart, angle, radius, topology, cullMode, hasUV, combine } = Object.assign(Object.assign({}, DEFAULT_CIRCLE_OPTIONS), options);
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

const DEFAULT_PLANE_OPTIONS = Object.assign(Object.assign({}, DEFAULT_OPTIONS), { hasIndices: true, combine: true, width: 1, height: 1, segmentX: 1, segmentY: 1, cullMode: "back" });
var createPlane2 = (options = {}) => {
    const { width, height, segmentX, segmentY, topology, cullMode, hasUV, combine } = Object.assign(Object.assign({}, DEFAULT_PLANE_OPTIONS), options);
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

var index$2 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	createCircle2: createCircle2,
	createPlane2: createPlane2,
	createTriangle2: createTriangle2
});

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

let weakMapTmp$1;
class System$1 {
    id = IdGeneratorInstance.next();
    isSystem = true;
    name = "";
    loopTimes = 0;
    entitySet = new WeakMap();
    usedBy = [];
    cache = new WeakMap();
    rule;
    _disabled = false;
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = value;
    }
    constructor(name = "", fitRule) {
        this.name = name;
        this.disabled = false;
        this.rule = fitRule;
    }
    checkUpdatedEntities(manager) {
        if (manager) {
            weakMapTmp$1 = this.entitySet.get(manager);
            if (!weakMapTmp$1) {
                weakMapTmp$1 = new Set();
                this.entitySet.set(manager, weakMapTmp$1);
            }
            manager.updatedEntities.forEach((item) => {
                if (this.query(item)) {
                    weakMapTmp$1.add(item);
                }
                else {
                    weakMapTmp$1.delete(item);
                }
            });
        }
        return this;
    }
    checkEntityManager(manager) {
        if (manager) {
            weakMapTmp$1 = this.entitySet.get(manager);
            if (!weakMapTmp$1) {
                weakMapTmp$1 = new Set();
                this.entitySet.set(manager, weakMapTmp$1);
            }
            else {
                weakMapTmp$1.clear();
            }
            manager.elements.forEach((item) => {
                if (this.query(item)) {
                    weakMapTmp$1.add(item);
                }
                else {
                    weakMapTmp$1.delete(item);
                }
            });
        }
        return this;
    }
    query(entity) {
        return this.rule(entity);
    }
    run(world) {
        if (this.disabled) {
            return this;
        }
        if (world.entityManager) {
            this.entitySet.get(world.entityManager)?.forEach((item) => {
                // 此处不应该校验disabled。这个交给各自系统自行判断
                this.handle(item, world.store);
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

class PureSystem extends System$1 {
    handler;
    constructor(name = "", fitRule, handler) {
        super(name, fitRule);
        this.handler = handler;
    }
    handle(entity, params) {
        this.handler(entity, params);
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
    dirty = false;
    tags;
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
            type: "component"
        };
    }
}

// 私有全局变量，外部无法访问
let elementTmp;
const ElementChangeEvent = {
    ADD: "add",
    REMOVE: "remove"
};
class Manager extends EventDispatcher {
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [_, item] of this.elements) {
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

// 私有全局变量，外部无法访问
// let componentTmp: IComponent<any> | undefined;
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
    getComponentsByTagLabel(label) {
        const result = [];
        for (const [_, component] of this.elements) {
            if (component.hasTagLabel(label)) {
                result.push(component);
            }
        }
        return result;
    }
    getFirstComponentByTagLabel(label) {
        for (const [_, component] of this.elements) {
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

const TreeNodeWithEvent = mixin$2(TreeNode$1);

let arr$1;
class Entity extends TreeNodeWithEvent {
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
    getFirstComponentByTagLabel(label) {
        return this.componentManager?.getFirstComponentByTagLabel(label) || null;
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
    REMOVE: "remove"
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
    run(world) {
        this.fire(SystemManager.Events.BEFORE_RUN, this);
        this.elements.forEach((item) => {
            item.checkUpdatedEntities(world.entityManager);
            if (!item.disabled) {
                item.run(world);
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
class World {
    disabled = false;
    name;
    entityManager = null;
    systemManager = null;
    store = new Map();
    usedBy = [];
    id = IdGeneratorInstance.next();
    isWorld = true;
    constructor(name = "", entityManager, systemManager) {
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
    run() {
        if (this.disabled) {
            return this;
        }
        if (this.systemManager) {
            this.systemManager.run(this);
        }
        return this;
    }
    serialize() {
        return {
            id: this.id,
            name: this.name,
            type: "world"
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

class Material extends Component {
    constructor(vertex, fragment, uniforms = [], blend = DEFAULT_BLEND_STATE) {
        super("material", { vertex, fragment, uniforms, blend });
        this.tags = [{
                label: MATERIAL,
                unique: true
            }];
        this.dirty = true;
    }
    get blend() {
        return this.data.blend;
    }
    set blend(blend) {
        this.data.blend = blend;
    }
    get vertexShader() {
        return this.data.vertex;
    }
    set vertexShader(code) {
        this.data.vertex = code;
    }
    get fragmentShader() {
        return this.data.fragment;
    }
    set fragmentShader(code) {
        this.data.fragment = code;
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
		struct Uniforms {
			color : vec4<f32>
	  	};
	  	@binding(1) @group(0) var<uniform> uniforms : Uniforms;

		@fragment fn main() -> @location(0) vec4<f32> {
			return uniforms.color;
		}
	`
};
class ColorMaterial extends Material {
    constructor(color = new Float32Array([1, 1, 1, 1])) {
        super(wgslShaders$1.vertex, wgslShaders$1.fragment, [{
                name: "color",
                value: color,
                binding: 1,
                dirty: true,
                type: BUFFER
            }]);
        this.dirty = true;
    }
    setColor(r, g, b, a) {
        if (this.data) {
            this.data.uniforms[0].value[0] = r;
            this.data.uniforms[0].value[1] = g;
            this.data.uniforms[0].value[2] = b;
            this.data.uniforms[0].value[3] = a;
            this.data.uniforms[0].dirty = true;
        }
        return this;
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
        super(vertexShader$1, fragmentShader$1, []);
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
        super(vertexShader, fragmentShader, []);
        this.dirty = true;
    }
}

class ShaderMaterial extends Material {
    constructor(vertex, fragment, uniforms = [], blend) {
        super(vertex, fragment, uniforms, blend);
        this.dirty = true;
    }
}

class Sampler extends Component$1 {
    constructor(option = {}) {
        super(SAMPLER, option);
        this.data = {
            minFilter: 'linear',
            magFilter: 'linear',
        };
        this.dirty = true;
    }
    setAddressMode(u, v, w) {
        this.data.addressModeU = u;
        this.data.addressModeV = v;
        this.data.addressModeW = w;
        this.dirty = true;
        return this;
    }
    setFilterMode(mag, min, mipmap) {
        this.data.magFilter = mag;
        this.data.minFilter = min;
        this.data.mipmapFilter = mipmap;
        this.dirty = true;
        return this;
    }
    setLodClamp(min, max) {
        this.data.lodMaxClamp = max;
        this.data.lodMinClamp = min;
        return this;
    }
    setMaxAnisotropy(v) {
        this.data.maxAnisotropy = v;
        return this;
    }
    setCompare(v) {
        this.data.compare = v;
        return this;
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
class ShadertoyMaterial extends Material {
    constructor(fs, texture, sampler = new Sampler()) {
        super(CommonData.vs, fs, [
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
                value: texture,
                binding: 2,
                dirty: true,
            },
            {
                name: "uniforms",
                type: BUFFER,
                value: new Float32Array([
                    CommonData.date.getFullYear(),
                    CommonData.date.getMonth(),
                    CommonData.date.getDate(),
                    CommonData.date.getSeconds() + CommonData.date.getMinutes() * 60 + CommonData.date.getHours() + 3600,
                    1024, 1024,
                    0, 0,
                    0, // iTime 8
                ]),
                binding: 3,
                dirty: true,
            }
        ]);
        this.dataD = CommonData.date;
        this.dirty = true;
    }
    get sampler() {
        return this.data.uniforms[0].value;
    }
    set sampler(sampler) {
        this.data.uniforms[0].dirty = this.dirty = true;
        this.data.uniforms[0].value = sampler;
    }
    get texture() {
        return this.data.uniforms[1].value;
    }
    set texture(texture) {
        this.data.uniforms[1].dirty = this.dirty = true;
        this.data.uniforms[1].value = texture;
    }
    get time() {
        return this.data.uniforms[2].value[8];
    }
    set time(time) {
        this.data.uniforms[2].dirty = this.dirty = true;
        this.data.uniforms[2].value[8] = time;
    }
    get mouse() {
        let u = this.data.uniforms[2];
        return [u.value[6], u.value[7]];
    }
    set mouse(mouse) {
        let u = this.data.uniforms[2];
        u.dirty = this.dirty = true;
        u.value[6] = mouse[0];
        u.value[7] = mouse[1];
    }
    get date() {
        return this.dataD;
    }
    set date(d) {
        let u = this.data.uniforms[2];
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

		@fragment fn main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
			return textureSample(myTexture, mySampler, uv);
		}
	`
};
class TextureMaterial extends Material {
    constructor(texture, sampler = new Sampler()) {
        super(wgslShaders.vertex, wgslShaders.fragment, [
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
            }
        ]);
        this.dirty = true;
    }
    get sampler() {
        return this.data.uniforms[0].value;
    }
    set sampler(sampler) {
        this.data.uniforms[0].dirty = this.dirty = true;
        this.data.uniforms[0].value = sampler;
    }
    get texture() {
        return this.data.uniforms[1].value;
    }
    set texture(texture) {
        this.data.uniforms[1].dirty = this.dirty = true;
        this.data.uniforms[1].value = texture;
    }
    setTextureAndSampler(texture, sampler) {
        this.texture = texture;
        if (sampler) {
            this.sampler = sampler;
        }
        return this;
    }
}

class Matrix3Component extends Component$1 {
    constructor(name, data = Matrix3$1.create(), tags = []) {
        super(name, data, tags);
        this.dirty = true;
    }
}
const updateModelMatrixComponent$1 = (mesh) => {
    var _a, _b;
    let p3 = mesh.position;
    let r3 = mesh.rotation;
    let s3 = mesh.scaling;
    let a3 = mesh.anchor;
    let m3 = mesh.modelMatrix;
    let worldMatrix = mesh.worldMatrix;
    if ((p3 === null || p3 === void 0 ? void 0 : p3.dirty) || (r3 === null || r3 === void 0 ? void 0 : r3.dirty) || (s3 === null || s3 === void 0 ? void 0 : s3.dirty) || (a3 === null || a3 === void 0 ? void 0 : a3.dirty)) {
        Matrix3$1.fromArray((p3 === null || p3 === void 0 ? void 0 : p3.data) || Matrix3$1.UNIT_MATRIX3, m3.data);
        if (r3) {
            Matrix3$1.multiplyRotationMatrix(m3.data, r3.data, m3.data);
        }
        if (s3) {
            Matrix3$1.multiplyScaleMatrix(m3.data, s3.data, m3.data);
        }
        if (a3) {
            Matrix3$1.multiplyTranslateMatrix(m3.data, a3.data, m3.data);
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
        let parentWorldMatrix = (_b = (_a = mesh.parent.worldMatrix) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : Matrix3$1.UNIT_MATRIX3;
        Matrix3$1.multiply(parentWorldMatrix, m3.data, worldMatrix.data);
    }
    else {
        Matrix3$1.fromArray(m3.data, worldMatrix.data);
    }
    return m3;
};

class Anchor2 extends Matrix3Component {
    constructor(vec = Vector2$1.VECTOR2_ZERO) {
        super(ANCHOR_2D, Matrix3$1.create(), [{
                label: ANCHOR_2D,
                unique: true
            }]);
        this.vec3 = new Vector2$1();
        Vector2$1.fromArray(vec, 0, this.vec3);
        this.update();
    }
    get x() {
        return this.vec3[0];
    }
    set x(value) {
        this.vec3[0] = value;
        this.data[6] = value;
        this.dirty = true;
    }
    get y() {
        return this.vec3[1];
    }
    set y(value) {
        this.vec3[1] = value;
        this.data[7] = value;
        this.dirty = true;
    }
    set(arr) {
        this.vec3.set(arr);
        this.data[6] = arr[0];
        this.data[7] = arr[1];
        this.dirty = true;
        return this;
    }
    setXY(x, y, z) {
        this.vec3[0] = x;
        this.vec3[1] = y;
        this.data[6] = x;
        this.data[7] = y;
        this.dirty = true;
        return this;
    }
    update() {
        Matrix3$1.fromTranslation(this.vec3, this.data);
        this.dirty = true;
        return this;
    }
}

class APosition2 extends Matrix3Component {
    constructor(data = Matrix3$1.create()) {
        super(TRANSLATION_2D, data, [{
                label: TRANSLATION_2D,
                unique: true
            }]);
    }
}

class AProjection2 extends Matrix3Component {
    constructor(data = Matrix3$1.create()) {
        super(PROJECTION_2D, data, [{
                label: PROJECTION_2D,
                unique: true
            }]);
    }
}

class ARotation2 extends Matrix3Component {
    constructor(data = Matrix3$1.create()) {
        super(ROTATION_2D, data, [{
                label: ROTATION_2D,
                unique: true
            }]);
    }
}

class AScale2 extends Matrix3Component {
    constructor(data = Matrix3$1.create()) {
        super(SCALING_2D, data, [{
                label: SCALING_2D,
                unique: true
            }]);
    }
}

class EuclidPosition2 extends APosition2 {
    constructor(vec2 = new Float32Array(2)) {
        super();
        this.vec2 = new Vector2$1();
        Vector2$1.fromArray(vec2, 0, this.vec2);
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
        Matrix3$1.fromTranslation(this.vec2, this.data);
        this.dirty = true;
        return this;
    }
}

class AngleRotation2 extends ARotation2 {
    constructor(angle = 0) {
        super();
        this.data = Matrix3$1.identity();
        this._angle = angle;
        this.update();
    }
    get angle() {
        return this._angle;
    }
    set angle(value) {
        this._angle = value;
        this.update();
    }
    update() {
        Matrix3$1.fromRotation(this._angle, this.data);
        this.dirty = true;
        return this;
    }
}

class Projection2D extends AProjection2 {
    constructor(left, right, bottom, top) {
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
const orthogonal = (left, right, bottom, top, out = new Matrix3$1()) => {
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
        Matrix3$1.fromScaling(this.vec2, this.data);
        return this;
    }
}

class Matrix4Component extends Component$1 {
    constructor(name, data = Matrix4$1.create(), tags = []) {
        super(name, data, tags);
        this.dirty = true;
    }
}
const updateModelMatrixComponent = (mesh) => {
    var _a, _b;
    let p3 = mesh.position;
    let r3 = mesh.rotation;
    let s3 = mesh.scaling;
    let a3 = mesh.anchor;
    let m3 = mesh.modelMatrix;
    let worldMatrix = mesh.worldMatrix;
    if ((p3 === null || p3 === void 0 ? void 0 : p3.dirty) || (r3 === null || r3 === void 0 ? void 0 : r3.dirty) || (s3 === null || s3 === void 0 ? void 0 : s3.dirty) || (a3 === null || a3 === void 0 ? void 0 : a3.dirty)) {
        Matrix4$1.fromArray((p3 === null || p3 === void 0 ? void 0 : p3.data) || Matrix4$1.UNIT_MATRIX4, m3.data);
        if (r3) {
            Matrix4$1.multiply(m3.data, r3.data, m3.data);
        }
        if (s3) {
            Matrix4$1.multiplyScaleMatrix(m3.data, s3.data, m3.data);
        }
        if (a3) {
            Matrix4$1.multiplyTranslateMatrix(m3.data, a3.data, m3.data);
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
        let parentWorldMatrix = (_b = (_a = mesh.parent.worldMatrix) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : Matrix4$1.UNIT_MATRIX4;
        Matrix4$1.multiply(parentWorldMatrix, m3.data, worldMatrix.data);
    }
    else {
        Matrix4$1.fromArray(m3.data, worldMatrix.data);
    }
    return m3;
};

class Anchor3 extends Matrix4Component {
    constructor(vec = Vector3$1.VECTOR3_ZERO) {
        super(ANCHOR_3D, Matrix4$1.create(), [{
                label: ANCHOR_3D,
                unique: true
            }]);
        this.vec3 = new Vector3$1();
        Vector3$1.fromArray(vec, 0, this.vec3);
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
        Matrix4$1.fromTranslation(this.vec3, this.data);
        this.dirty = true;
        return this;
    }
}

class APosition3 extends Matrix4Component {
    constructor(data = Matrix4$1.create()) {
        super(TRANSLATION_3D, data, [{
                label: TRANSLATION_3D,
                unique: true
            }]);
    }
}

class AProjection3 extends Matrix4Component {
    constructor(data = Matrix4$1.create()) {
        super(PROJECTION_3D, data, [{
                label: PROJECTION_3D,
                unique: true
            }]);
    }
}

class ARotation3 extends Matrix4Component {
    constructor(data = Matrix4$1.create()) {
        super(ROTATION_3D, data, [{
                label: ROTATION_3D,
                unique: true
            }]);
    }
}

class AScale3 extends Matrix4Component {
    constructor(data = Matrix4$1.create()) {
        super(SCALING_3D, data, [{
                label: SCALING_3D,
                unique: true
            }]);
    }
}

class EuclidPosition3 extends APosition3 {
    constructor(vec3 = new Float32Array(3)) {
        super();
        this.vec3 = new Vector3$1();
        Vector3$1.fromArray(vec3, 0, this.vec3);
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
        return this.vec3[1];
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
        Matrix4$1.fromTranslation(this.vec3, this.data);
        this.dirty = true;
        return this;
    }
}

class EulerRotation3 extends ARotation3 {
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
        Matrix4$1.fromEuler(this.euler, this.data);
        this.dirty = true;
        return this;
    }
}

class OrthogonalProjection extends AProjection3 {
    constructor(left, right, bottom, top, near, far) {
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
        Matrix4$1.orthogonalZ0(this.options.left, this.options.right, this.options.bottom, this.options.top, this.options.near, this.options.far, this.data);
        this.dirty = true;
        return this;
    }
}

class PerspectiveProjection extends AProjection3 {
    constructor(fovy, aspect, near, far) {
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
        return this.aspect;
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
        Matrix4$1.perspectiveZ0(this.options.fovy, this.options.aspect, this.options.near, this.options.far, this.data);
        this.dirty = true;
        return this;
    }
}

const DEFAULT_SCALE = [1, 1, 1];
class Vector3Scale3 extends AScale3 {
    constructor(vec3 = new Float32Array(DEFAULT_SCALE)) {
        super();
        this.vec3 = vec3;
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
        this.vec3.set(arr);
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
        Matrix4$1.fromScaling(this.vec3, this.data);
        return this;
    }
}

class Renderable extends Component$1 {
    constructor(renderType) {
        super(RENDERABLE, renderType);
        this.tags = [{
                label: RENDERABLE,
                unique: true
            }];
    }
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

const canvases = []; // 储存多个canvas，可能存在n个图同时画
function drawSpriteBlock(image, width, height, frame) {
    return __awaiter(this, void 0, void 0, function* () {
        let canvas = canvases.pop() || document.createElement("canvas");
        let ctx = canvas.getContext("2d");
        canvas.width = width;
        canvas.height = height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, frame.x, frame.y, frame.w, frame.h, frame.dx, frame.dy, frame.w, frame.h);
        let result = yield createImageBitmap(canvas);
        canvases.push(canvas);
        return result;
    });
}

class Texture extends Component$1 {
    constructor(width, height, img, name = "texture") {
        super(name, img);
        this.dirty = false;
        this.width = width;
        this.height = height;
    }
    destroy() {
        var _a;
        (_a = this.data) === null || _a === void 0 ? void 0 : _a.close();
        this.data = undefined;
        this.width = 0;
        this.height = 0;
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
    constructor(json, name = "atlas-texture") {
        super(json.spriteSize.w, json.spriteSize.h, null, name);
        this.loaded = false;
        this.framesBitmap = [];
        this.setImage(json);
    }
    setImage(json) {
        return __awaiter(this, void 0, void 0, function* () {
            this.loaded = false;
            this.dirty = false;
            let img = new Image();
            img.src = json.image;
            this.image = img;
            yield img.decode();
            this.imageBitmap = yield drawSpriteBlock(this.image, json.spriteSize.w, json.spriteSize.h, json.frame);
            this.loaded = true;
            return this;
        });
    }
}

class EngineTexture extends Component$1 {
    constructor(engine, name = "texture-gpu") {
        super(name, engine.device.createTexture({
            size: [engine.options.width, engine.options.height],
            format: engine.preferredFormat,
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        }));
        this.width = engine.options.width;
        this.height = engine.options.height;
        this.dirty = true;
    }
    destroy() {
        this.data = undefined;
        this.width = 0;
        this.height = 0;
    }
}

class ImageBitmapTexture extends Texture {
    constructor(img, width, height, name = "image-texture") {
        super(width, height, null, name);
        this.loaded = false;
        this.sizeChanged = false;
        this.image = new Image();
        this.setImage(img);
    }
    setImage(img) {
        return __awaiter(this, void 0, void 0, function* () {
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
            yield this.image.decode();
            this.data = yield createImageBitmap(this.image);
            if (this.width !== this.data.width || this.height !== this.data.height) {
                this.sizeChanged = true;
                this.width = this.data.width;
                this.height = this.data.height;
            }
            this.dirty = true;
            this.loaded = true;
            return this;
        });
    }
}

class SpritesheetTexture extends Texture {
    constructor(json, name = "spritesheet-texture") {
        super(json.spriteSize.w, json.spriteSize.h, null, name);
        this.loaded = false;
        this.frame = 0; // 当前帧索引
        this.framesBitmap = [];
        this.setImage(json);
    }
    setImage(json) {
        return __awaiter(this, void 0, void 0, function* () {
            this.loaded = false;
            this.dirty = false;
            let img = new Image();
            img.src = json.image;
            this.image = img;
            yield img.decode();
            // canvas.width = json.spriteSize.w;
            // canvas.height = json.spriteSize.h;
            for (let item of json.frames) {
                this.framesBitmap.push(yield drawSpriteBlock(this.image, json.spriteSize.w, json.spriteSize.h, item));
            }
            this.data = this.framesBitmap[0];
            this.dirty = true;
            this.loaded = true;
            return this;
        });
    }
    setFrame(frame) {
        this.frame = frame;
        this.data = this.framesBitmap[frame];
        this.dirty = true;
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
    constructor(from, to, duration = 1000, loop = 0) {
        super("tween", new Map());
        this.oldLoop = loop;
        this.from = from;
        this.to = to;
        this.duration = duration;
        this.loop = loop;
        this.state = TWEEN_STATE.IDLE;
        this.time = 0;
        this.checkKeyAndType(from, to);
    }
    reset() {
        this.loop = this.oldLoop;
        this.time = 0;
        this.state = TWEEN_STATE.IDLE;
    }
    // 检查from 和 to哪些属性是可以插值的
    checkKeyAndType(from, to) {
        let map = this.data;
        for (let key in to) {
            if (key in from) {
                // TODO 目前只支持数字和F32数组插值，后续扩展
                if (typeof to[key] === 'number' && 'number' === from[key]) {
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
                            delta: Vector2$1.minus(to[key], from[key])
                        });
                    }
                    else if (Math.min(from[key].length, to[key].length) === 3) {
                        map.set(key, {
                            type: 'vector3',
                            origin: new Float32Array(from[key]),
                            delta: Vector3$1.minus(to[key], from[key])
                        });
                    }
                    else if (Math.min(from[key].length, to[key].length) === 4) {
                        map.set(key, {
                            type: 'vector4',
                            origin: new Float32Array(from[key]),
                            delta: Vector4$1.minus(to[key], from[key])
                        });
                    }
                }
            }
        }
        return this;
    }
}
Tween.States = TWEEN_STATE;

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
                Matrix4$1.fromEuler(euler, target.data);
                return true;
            }
            else if (property === 'order') {
                target.dirty = true;
                euler.order = value;
                Matrix4$1.fromEuler(euler, target.data);
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

var index$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	getEuclidPosition3Proxy: getEuclidPosition3Proxy,
	getEulerRotation3Proxy: getEulerRotation3Proxy
});

var getColorGPU = (color, result = new ColorGPU()) => {
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
    else if (color instanceof ColorRGBA) {
        ColorGPU.fromColorRGBA(color, result);
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
            ColorGPU.fromJson(Object.assign(Object.assign({}, color), { a: 1 }), result);
        }
    }
    return result;
};

var EngineEvents;
(function (EngineEvents) {
    EngineEvents["INITED"] = "inited";
    EngineEvents["LOOP_STARTED"] = "loop-started";
    EngineEvents["LOOP_ENDED"] = "loop-ended";
})(EngineEvents || (EngineEvents = {}));
const DEFAULT_ENGINE_OPTIONS = {
    autoStart: true,
    width: window.innerWidth,
    height: window.innerHeight,
    resolution: window.devicePixelRatio,
    autoResize: false,
    noDepthTexture: false,
    clearColor: new ColorGPU(0, 0, 0, 1),
    renderToSwapChain: true,
    renderToTarget: false
};

class WebGPUEngine extends EventDispatcher.mixin(Timeline) {
    constructor(canvas = document.createElement("canvas"), options = {}) {
        var _a, _b, _c;
        super();
        this.clearColor = new ColorGPU(0, 0, 0, 1);
        this.inited = false;
        this.canvas = canvas;
        this.options = Object.assign(Object.assign({}, DEFAULT_ENGINE_OPTIONS), options);
        this.resize((_a = options.width) !== null && _a !== void 0 ? _a : window.innerWidth, (_b = options.height) !== null && _b !== void 0 ? _b : window.innerHeight, (_c = options.resolution) !== null && _c !== void 0 ? _c : window.devicePixelRatio);
        WebGPUEngine.detect(canvas).then(({ context, adapter, device }) => {
            this.context = context;
            this.adapter = adapter;
            this.device = device;
            this.inited = true;
            this.preferredFormat = navigator.gpu.getPreferredCanvasFormat();
            this.setRenderPassDescripter();
            this.targetTexture = this.device.createTexture({
                size: [this.canvas.width, this.canvas.height],
                format: this.preferredFormat,
                usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
            });
            this.fire(EngineEvents.INITED, {
                eventKey: EngineEvents.INITED,
                target: this
            });
            if (this.options.autoStart) {
                this.start();
            }
        }).catch((error) => {
            throw error;
        });
    }
    static detect(canvas = document.createElement("canvas")) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const context = canvas.getContext("webgpu");
            if (!context) {
                throw new Error('WebGPU not supported: ');
            }
            const adapter = yield ((_a = navigator === null || navigator === void 0 ? void 0 : navigator.gpu) === null || _a === void 0 ? void 0 : _a.requestAdapter());
            if (!adapter) {
                throw new Error('WebGPU not supported: ');
            }
            const device = yield adapter.requestDevice();
            if (!device) {
                throw new Error('WebGPU not supported: ');
            }
            return { context, adapter, device };
        });
    }
    resize(width, height, resolution = this.options.resolution) {
        this.options.width = width;
        this.options.height = height;
        this.options.resolution = resolution;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        this.canvas.width = width * resolution;
        this.canvas.height = height * resolution;
        return this;
    }
    setClearColor(color) {
        getColorGPU(color, this.clearColor);
        return this;
    }
    update(time, delta) {
        this.loopStart();
        super.update(time, delta);
        this.loopEnd();
        return this;
    }
    loopStart() {
        this.currentCommandEncoder = this.device.createCommandEncoder();
        this.swapChainTexture = this.context.getCurrentTexture();
        this.renderPassDescriptor.colorAttachments[0].view = this.options.renderToSwapChain ? this.swapChainTexture.createView() : this.targetTexture.createView();
        this.renderPassEncoder = this.currentCommandEncoder.beginRenderPass(this.renderPassDescriptor);
        this.fire(EngineEvents.LOOP_STARTED, this);
    }
    loopEnd() {
        this.renderPassEncoder.end();
        this.fire(EngineEvents.LOOP_ENDED, this);
        this.device.queue.submit([this.currentCommandEncoder.finish()]);
    }
    setRenderPassDescripter() {
        let renderPassDescriptor = {
            colorAttachments: [
                {
                    view: null,
                    loadOp: "clear",
                    clearValue: this.clearColor,
                    storeOp: "store"
                }
            ]
        };
        if (!this.options.noDepthTexture) {
            let depthTexture = this.device.createTexture({
                size: { width: this.canvas.width, height: this.canvas.height, depthOrArrayLayers: 1 },
                format: "depth24plus",
                usage: GPUTextureUsage.RENDER_ATTACHMENT
            });
            renderPassDescriptor.depthStencilAttachment = {
                view: depthTexture.createView(),
                depthClearValue: 1.0,
                depthLoadOp: "clear",
                depthStoreOp: "store"
            };
        }
        this.renderPassDescriptor = renderPassDescriptor;
    }
}
WebGPUEngine.Events = EngineEvents;

class WebGLEngine extends EventDispatcher {
    constructor(canvas = document.createElement("canvas")) {
        super();
        this.inited = false;
        this.canvas = canvas;
        WebGLEngine.detect(canvas).then(({ context }) => {
            this.context = context;
            this.inited = true;
            this.fire(EngineEvents.INITED, {
                eventKey: EngineEvents.INITED,
                target: this
            });
        }).catch((error) => {
            throw error;
        });
    }
    static detect(canvas = document.createElement("canvas")) {
        return __awaiter(this, void 0, void 0, function* () {
            const context = canvas.getContext("webgl");
            if (!context) {
                throw new Error('WebGL not supported: ');
            }
            return { context };
        });
    }
    createRenderer() {
    }
}

class Object3$1 extends Entity {
    constructor(name = "Object3") {
        super(name);
        this.scaling = new Vector2Scale2();
        this.position = new EuclidPosition2();
        this.rotation = new AngleRotation2();
        this.anchor = new EuclidPosition2();
        this.modelMatrix = new Matrix3Component(MODEL_2D, Matrix3$1.create(), [{
                label: MODEL_3D,
                unique: true
            }]);
        this.worldMatrix = new Matrix3Component(WORLD_MATRIX3, Matrix3$1.create(), [{
                label: WORLD_MATRIX3,
                unique: true
            }]);
    }
}

class Camera3$1 extends Object3$1 {
    constructor(name = "Camera2", projection) {
        super(name);
        this.projection = projection;
    }
}

class Object3 extends Entity {
    constructor(name = "Object3") {
        super(name);
        this.scaling = new Vector3Scale3();
        this.position = new EuclidPosition3();
        this.rotation = new EulerRotation3();
        this.anchor = new EuclidPosition3();
        this.modelMatrix = new Matrix4Component(MODEL_3D, Matrix4$1.create(), [{
                label: MODEL_3D,
                unique: true
            }]);
        this.worldMatrix = new Matrix4Component(WORLD_MATRIX4, Matrix4$1.create(), [{
                label: WORLD_MATRIX4,
                unique: true
            }]);
    }
}

class Camera3 extends Object3 {
    constructor(name = "Camera3", projection) {
        super(name);
        this.projection = projection;
    }
}

let weakMapTmp;
class System {
    constructor(name = "", fitRule) {
        this.id = IdGeneratorInstance$1.next();
        this.isSystem = true;
        this.name = "";
        this.loopTimes = 0;
        this.entitySet = new WeakMap();
        this.usedBy = [];
        this.cache = new WeakMap();
        this._disabled = false;
        this.name = name;
        this.disabled = false;
        this.rule = fitRule;
    }
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = value;
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
    run(world) {
        var _a;
        if (this.disabled) {
            return this;
        }
        if (world.entityManager) {
            (_a = this.entitySet.get(world.entityManager)) === null || _a === void 0 ? void 0 : _a.forEach((item) => {
                // 此处不应该校验disabled。这个交给各自系统自行判断
                this.handle(item, world.store);
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

class HashRouteSystem extends System {
    constructor() {
        super("HashRouteSystem", (entity) => {
            return entity.getFirstComponentByTagLabel("HashRoute");
        });
        this.currentPath = "";
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
    run(world) {
        if (HashRouteSystem.currentPath === this.currentPath) {
            return this;
        }
        this.currentPath = HashRouteSystem.currentPath;
        super.run(world);
        return this;
    }
}
HashRouteSystem.listeningHashChange = false;
HashRouteSystem.count = 0; // 计数
HashRouteSystem.listener = () => {
    HashRouteSystem.currentPath = location.hash.slice(1) || "/";
};
HashRouteSystem.currentPath = location.hash.slice(1) || "/";

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

class HashRouteComponent extends TreeNode.mixin(Component) {
    constructor(name, data) {
        if (!data.path.startsWith("/")) {
            data.path = "/" + data.path;
        }
        super(name, data, [{
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

const DEFAULT_MATERIAL = new Material(`
struct Uniforms {
	modelViewProjectionMatrix : mat4x4<f32>
  };
  @binding(0) @group(0) var<uniform> uniforms : Uniforms;

struct VertexOutput {
	@builtin(position) Position : vec4<f32>
};

fn mapRange(
	value: f32,
	range1: vec2<f32>,
	range2: vec2<f32>,
) -> f32 {
	var d1: f32 = range1.y - range1.x;
	var d2: f32 = range2.y - range2.x;

	return (value - d1 * 0.5) / d2 / d1;
};

@vertex fn main(@location(0) position : vec3<f32>) -> VertexOutput {
	var output : VertexOutput;
	output.Position = uniforms.modelViewProjectionMatrix * vec4<f32>(position, 1.0);
	if (output.Position.w == 1.0) {
		output.Position.z = mapRange(output.Position.z, vec2<f32>(-1.0, 1.0), vec2<f32>(1.0, 0.0));
	}
	return output;
}
`, `
@fragment fn main() -> @location(0) vec4<f32> {
	return vec4<f32>(1., 1., 1., 1.0);
}
`);

class Mesh2Renderer {
    constructor(engine, camera) {
        this.renderTypes = MESH2;
        this.entityCacheData = new WeakMap();
        this.engine = engine;
        this.camera = camera;
    }
    render(mesh, passEncoder) {
        var _a;
        let cacheData = this.entityCacheData.get(mesh);
        // 假设更换了几何体和材质则重新生成缓存
        let material = mesh.getFirstComponentByTagLabel(MATERIAL) || DEFAULT_MATERIAL;
        let geometry = mesh.getFirstComponentByTagLabel(GEOMETRY);
        if (!cacheData || ((_a = mesh.getFirstComponentByTagLabel(MATERIAL)) === null || _a === void 0 ? void 0 : _a.dirty) || material !== cacheData.material || geometry !== cacheData.geometry) {
            cacheData = this.createCacheData(mesh);
            this.entityCacheData.set(mesh, cacheData);
        }
        else {
            // TODO update cache
            updateModelMatrixComponent$1(mesh);
        }
        passEncoder.setPipeline(cacheData.pipeline);
        // passEncoder.setScissorRect(0, 0, 400, 225);
        // TODO 有多个attribute buffer
        for (let i = 0; i < cacheData.attributesBuffers.length; i++) {
            passEncoder.setVertexBuffer(i, cacheData.attributesBuffers[i]);
        }
        const mvp = cacheData.mvp;
        const mvpExt = cacheData.mvpExt;
        Matrix3$1.multiply(this.camera.projection.data, Matrix3$1.invert(updateModelMatrixComponent$1(this.camera).data), mvp);
        Matrix3$1.multiply(mvp, mesh.worldMatrix.data, mvp);
        Matrix4$1.fromMatrix3(mvp, mvpExt);
        this.engine.device.queue.writeBuffer(cacheData.uniformBuffer, 0, mvpExt.buffer, mvpExt.byteOffset, mvpExt.byteLength);
        cacheData.uniformMap.forEach((uniform, key) => {
            if (uniform.type === BUFFER && uniform.dirty) {
                this.engine.device.queue.writeBuffer(key, 0, uniform.value.buffer, uniform.value.byteOffset, uniform.value.byteLength);
                uniform.dirty = false;
            }
            else if (uniform.type === TEXTURE_IMAGE && (uniform.dirty || uniform.value.dirty)) {
                if (uniform.value.loaded) {
                    if (uniform.value.data) {
                        this.engine.device.queue.copyExternalImageToTexture({ source: uniform.value.data }, { texture: key }, [uniform.value.data.width, uniform.value.data.height, 1]);
                        uniform.value.dirty = uniform.dirty = false;
                    }
                }
            }
        });
        passEncoder.setBindGroup(0, cacheData.uniformBindGroup);
        passEncoder.draw(mesh.getFirstComponentByTagLabel(GEOMETRY).count, 1, 0, 0);
        return this;
    }
    createCacheData(mesh) {
        var _a, _b;
        updateModelMatrixComponent$1(mesh);
        let device = this.engine.device;
        let uniformBuffer = device.createBuffer({
            size: 64,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        let buffers = [];
        let geometry = mesh.getFirstComponentByTagLabel(GEOMETRY);
        let material = mesh.getFirstComponentByTagLabel(MATERIAL) || DEFAULT_MATERIAL;
        let nodes = geometry.data;
        for (let i = 0; i < nodes.length; i++) {
            buffers.push(createVerticesBuffer(device, nodes[i].data));
        }
        let pipeline = this.createPipeline(geometry, material);
        let groupEntries = [{
                binding: 0,
                resource: {
                    buffer: uniformBuffer,
                },
            }];
        let uniforms = (_b = (_a = mesh.getFirstComponentByTagLabel(MATERIAL)) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.uniforms;
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
            mvpExt: new Matrix4$1(),
            mvp: new Matrix3$1(),
            attributesBuffers: buffers,
            uniformBuffer,
            uniformBindGroup,
            pipeline,
            uniformMap,
            material,
            geometry
        };
    }
    createPipeline(geometry, material) {
        const pipelineLayout = this.engine.device.createPipelineLayout({
            bindGroupLayouts: [this.createBindGroupLayout(material)],
        });
        let vertexBuffers = this.parseGeometryBufferLayout(geometry);
        let stages = this.createStages(material, vertexBuffers);
        let pipeline = this.engine.device.createRenderPipeline({
            layout: pipelineLayout,
            vertex: stages.vertex,
            fragment: stages.fragment,
            primitive: {
                topology: geometry.topology,
                cullMode: geometry.cullMode,
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
    createBindGroupLayout(material) {
        let uniforms = material.data.uniforms;
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
        return this.engine.device.createBindGroupLayout({
            entries,
        });
    }
    createStages(material, vertexBuffers) {
        let vertex = {
            module: this.engine.device.createShaderModule({
                code: material.data.vertex,
            }),
            entryPoint: "main",
            buffers: vertexBuffers
        };
        let fragment = {
            module: this.engine.device.createShaderModule({
                code: material.data.fragment,
            }),
            entryPoint: "main",
            targets: [
                {
                    format: this.engine.preferredFormat,
                    blend: material === null || material === void 0 ? void 0 : material.data.blend
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
Mesh2Renderer.renderTypes = MESH2;

const DEG_360_RAD = Math.PI * 2;
const EPSILON = Math.pow(2, -52);

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
var closeToCommon = (val, target, epsilon = EPSILON) => {
    return Math.abs(val - target) <= epsilon;
};

let a00$2 = 0, a01$2 = 0, a10$2 = 0, a11$2 = 0;
let b00$2 = 0, b01$2 = 0, b10$2 = 0, b11$2 = 0, det$1 = 0;
let x$3 = 0, y$3 = 0;
const UNIT_MATRIX2_DATA = [1, 0, 0, 1];
class Matrix2 extends Float32Array {
    constructor(data = UNIT_MATRIX2_DATA) {
        super(data);
    }
}
Matrix2.UNIT_MATRIX2 = new Matrix2(UNIT_MATRIX2_DATA);
Matrix2.add = (a, b, out) => {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    return out;
};
Matrix2.adjoint = (a, out) => {
    a00$2 = a[0];
    out[0] = a[3];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = a00$2;
    return out;
};
Matrix2.clone = (source) => {
    return new Matrix2(source);
};
Matrix2.closeTo = (a, b) => {
    a00$2 = a[0];
    a10$2 = a[1];
    a01$2 = a[2];
    a11$2 = a[3];
    b00$2 = b[0];
    b10$2 = b[1];
    b01$2 = b[2];
    b11$2 = b[3];
    return (closeToCommon(a00$2, b00$2) &&
        closeToCommon(a01$2, b01$2) &&
        closeToCommon(a10$2, b10$2) &&
        closeToCommon(a11$2, b11$2));
};
Matrix2.create = (a = UNIT_MATRIX2_DATA) => {
    return new Matrix2(a);
};
Matrix2.determinant = (a) => {
    return a[0] * a[3] - a[1] * a[2];
};
Matrix2.equals = (a, b) => {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
};
Matrix2.frobNorm = (a) => {
    return Math.hypot(a[0], a[1], a[2], a[3]);
};
Matrix2.fromArray = (source, out = new Matrix2()) => {
    out.set(source);
    return out;
};
Matrix2.fromRotation = (rad, out = new Matrix2()) => {
    y$3 = Math.sin(rad);
    x$3 = Math.cos(rad);
    out[0] = x$3;
    out[1] = y$3;
    out[2] = -y$3;
    out[3] = x$3;
    return out;
};
Matrix2.fromScaling = (v, out = new Matrix2()) => {
    out[0] = v[0];
    out[1] = 0;
    out[2] = 0;
    out[3] = v[1];
    return out;
};
Matrix2.identity = (out = new Matrix2()) => {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};
Matrix2.invert = (a, out = new Matrix2()) => {
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
Matrix2.minus = (a, b, out = new Matrix2()) => {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];
    return out;
};
Matrix2.multiply = (a, b, out = new Matrix2()) => {
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
Matrix2.multiplyScalar = (a, b, out = new Matrix2()) => {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    return out;
};
Matrix2.rotate = (a, rad, out = new Matrix2()) => {
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
Matrix2.scale = (a, v, out = new Matrix2()) => {
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
Matrix2.toString = (a) => {
    return `mat2(${a[0]}, ${a[1]}, ${a[2]}, ${a[3]})`;
};
Matrix2.transpose = (a, out = new Matrix2()) => {
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

let a00$1 = 0, a01$1 = 0, a02$1 = 0, a11$1 = 0, a10$1 = 0, a12$1 = 0, a20$1 = 0, a21$1 = 0, a22$1 = 0;
let b00$1 = 0, b01$1 = 0, b02$1 = 0, b11$1 = 0, b10$1 = 0, b12$1 = 0, b20$1 = 0, b21$1 = 0, b22$1 = 0;
let x$2 = 0, y$2 = 0;
const UNIT_MATRIX3_DATA = [1, 0, 0, 0, 1, 0, 0, 0, 1];
class Matrix3 extends Float32Array {
    constructor(data = UNIT_MATRIX3_DATA) {
        super(data);
    }
}
Matrix3.UNIT_MATRIX3 = new Matrix3(UNIT_MATRIX3_DATA);
Matrix3.clone = (source) => {
    return new Matrix3(source);
};
Matrix3.cofactor00 = (a) => {
    return a[4] * a[8] - a[5] * a[7];
};
Matrix3.cofactor01 = (a) => {
    return a[1] * a[8] - a[7] * a[2];
};
Matrix3.cofactor02 = (a) => {
    return a[1] * a[5] - a[4] * a[2];
};
Matrix3.cofactor10 = (a) => {
    return a[3] * a[8] - a[6] * a[5];
};
Matrix3.cofactor11 = (a) => {
    return a[0] * a[8] - a[6] * a[2];
};
Matrix3.cofactor12 = (a) => {
    return a[0] * a[5] - a[3] * a[2];
};
Matrix3.cofactor20 = (a) => {
    return a[3] * a[7] - a[6] * a[4];
};
Matrix3.cofactor21 = (a) => {
    return a[0] * a[7] - a[6] * a[1];
};
Matrix3.cofactor22 = (a) => {
    return a[0] * a[4] - a[3] * a[1];
};
Matrix3.create = () => {
    return new Matrix3(UNIT_MATRIX3_DATA);
};
Matrix3.determinant = (a) => {
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
Matrix3.fromArray = (source, out = new Matrix3()) => {
    out.set(source);
    return out;
};
Matrix3.fromMatrix2 = (mat4, out = new Matrix3()) => {
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
Matrix3.fromMatrix4 = (mat4, out = new Matrix3()) => {
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
Matrix3.fromRotation = (rad, out = new Matrix3()) => {
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
Matrix3.fromScaling = (v, out = new Matrix3()) => {
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
Matrix3.fromTranslation = (v, out = new Matrix3()) => {
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
Matrix3.identity = (out = new Matrix3()) => {
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
Matrix3.invert = (a, out = new Matrix3()) => {
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
Matrix3.multiply = (a, b, out = new Matrix3()) => {
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
Matrix3.multiplyRotationMatrix = (a, b, out = new Matrix3()) => {
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
Matrix3.multiplyScaleMatrix = (a, b, out = new Matrix3()) => {
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
Matrix3.multiplyTranslateMatrix = (a, b, out = new Matrix3()) => {
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
Matrix3.rotate = (a, rad, out = new Matrix3()) => {
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
Matrix3.scale = (a, v, out = new Matrix3()) => {
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
Matrix3.translate = (a, v, out = new Matrix3()) => {
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
Matrix3.transpose = (a, out = new Matrix3()) => {
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

var EulerRotationOrders;
(function (EulerRotationOrders) {
    EulerRotationOrders["XYZ"] = "xyz";
    EulerRotationOrders["ZXY"] = "zxy";
    EulerRotationOrders["YZX"] = "yzx";
    EulerRotationOrders["XZY"] = "xzy";
    EulerRotationOrders["ZYX"] = "zyx";
    EulerRotationOrders["YXZ"] = "yxz";
})(EulerRotationOrders || (EulerRotationOrders = {}));

const ArraybufferDataType = {
    COLOR_GPU: "col",
    COLOR_RGB: "col_rgb",
    COLOR_RGBA: "col_rgba",
    EULER: "euler",
    MATRIX2: "mat2",
    MATRIX3: "mat3",
    MATRIX4: "mat4",
    POLAR: "polar",
    QUATERNION: "qua",
    VECTOR2: "vec2",
    VECTOR3: "vec3",
    VECTOR4: "vec4"
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
var clampCommon = (val, min, max) => {
    return Math.max(min, Math.min(max, val));
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

let ax$1, ay$1, az$1, bx$1, by$1, bz$1;
let ag, s$2;
class Vector3 extends Float32Array {
    constructor(x = 0, y = 0, z = 0) {
        super(3);
        this.dataType = ArraybufferDataType.VECTOR3;
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
Vector3.VECTOR3_ZERO = new Vector3(0, 0, 0);
Vector3.VECTOR3_ONE = new Vector3(1, 1, 1);
Vector3.VECTOR3_TOP = new Vector3(0, 1, 0);
Vector3.VECTOR3_BOTTOM = new Vector3(0, -1, 0);
Vector3.VECTOR3_LEFT = new Vector3(-1, 0, 0);
Vector3.VECTOR3_RIGHT = new Vector3(1, 0, 0);
Vector3.VECTOR3_FRONT = new Vector3(0, 0, -1);
Vector3.VECTOR3_BACK = new Vector3(0, 0, 1);
Vector3.add = (a, b, out = new Vector3()) => {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
};
Vector3.addScalar = (a, b, out = new Vector3()) => {
    out[0] = a[0] + b;
    out[1] = a[1] + b;
    out[2] = a[2] + b;
    return out;
};
Vector3.angle = (a, b) => {
    ax$1 = a[0];
    ay$1 = a[1];
    az$1 = a[2];
    bx$1 = b[0];
    by$1 = b[1];
    bz$1 = b[2];
    const mag1 = Math.sqrt(ax$1 * ax$1 + ay$1 * ay$1 + az$1 * az$1), mag2 = Math.sqrt(bx$1 * bx$1 + by$1 * by$1 + bz$1 * bz$1), mag = mag1 * mag2, cosine = mag && Vector3.dot(a, b) / mag;
    return Math.acos(clampCommon(cosine, -1, 1));
};
Vector3.clamp = (a, min, max, out = new Vector3()) => {
    out[0] = clampCommon(a[0], min[0], max[0]);
    out[1] = clampCommon(a[1], min[1], max[1]);
    out[2] = clampCommon(a[2], min[2], max[2]);
    return out;
};
Vector3.clampSafe = (a, min, max, out = new Vector3()) => {
    out[0] = clampSafeCommon(a[0], min[0], max[0]);
    out[1] = clampSafeCommon(a[1], min[1], max[1]);
    out[1] = clampSafeCommon(a[2], min[2], max[2]);
    return out;
};
Vector3.clampScalar = (a, min, max, out = new Vector3()) => {
    out[0] = clampCommon(a[0], min, max);
    out[1] = clampCommon(a[1], min, max);
    out[2] = clampCommon(a[2], min, max);
    return out;
};
Vector3.clone = (a, out = new Vector3()) => {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
};
Vector3.closeTo = (a, b) => {
    return closeToCommon(a[0], b[0]) && closeToCommon(a[1], b[1]) && closeToCommon(a[2], b[2]);
};
Vector3.create = (x = 0, y = 0, z = 0, out = new Vector3()) => {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
};
Vector3.cross = (a, b, out = new Vector3()) => {
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
Vector3.distanceTo = (a, b) => {
    ax$1 = b[0] - a[0];
    ay$1 = b[1] - a[1];
    az$1 = b[2] - a[2];
    return Math.hypot(ax$1, ay$1, az$1);
};
Vector3.distanceToManhattan = (a, b) => {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
};
Vector3.distanceToSquared = (a, b) => {
    ax$1 = a[0] - b[0];
    ay$1 = a[1] - b[1];
    az$1 = a[2] - b[2];
    return ax$1 * ax$1 + ay$1 * ay$1 + az$1 * az$1;
};
Vector3.divide = (a, b, out = new Vector3()) => {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    return out;
};
Vector3.divideScalar = (a, b, out = new Vector3()) => {
    out[0] = a[0] / b;
    out[1] = a[1] / b;
    out[2] = a[2] / b;
    return out;
};
Vector3.dot = (a, b) => {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
};
Vector3.equals = (a, b) => {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
};
Vector3.fromArray = (a, offset = 0, out = new Vector3()) => {
    out[0] = a[offset];
    out[1] = a[offset + 1];
    out[2] = a[offset + 2];
    return out;
};
Vector3.fromScalar = (num, out = new Vector3(3)) => {
    out[0] = out[1] = out[2] = num;
    return out;
};
Vector3.fromValues = (x, y, z, out = new Vector3(3)) => {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
};
Vector3.hermite = (a, b, c, d, t, out = new Vector3()) => {
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
Vector3.inverse = (a, out = new Vector3()) => {
    out[0] = 1.0 / a[0];
    out[1] = 1.0 / a[1];
    out[2] = 1.0 / a[2];
    return out;
};
Vector3.norm = (a) => {
    return Math.sqrt(Vector3.lengthSquared(a));
};
Vector3.lengthManhattan = (a) => {
    return Math.abs(a[0]) + Math.abs(a[1]) + Math.abs(a[2]);
};
Vector3.lengthSquared = (a) => {
    return a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
};
Vector3.lerp = (a, b, alpha, out = new Vector3()) => {
    out[0] += (b[0] - a[0]) * alpha;
    out[1] += (b[1] - a[1]) * alpha;
    out[2] += (b[2] - a[2]) * alpha;
    return out;
};
Vector3.max = (a, b, out = new Vector3()) => {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    return out;
};
Vector3.min = (a, b, out = new Vector3()) => {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    return out;
};
Vector3.minus = (a, b, out = new Vector3()) => {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
};
Vector3.minusScalar = (a, b, out = new Vector3()) => {
    out[0] = a[0] - b;
    out[1] = a[1] - b;
    out[2] = a[2] - b;
    return out;
};
Vector3.multiply = (a, b, out = new Vector3()) => {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    return out;
};
Vector3.multiplyScalar = (a, scalar, out = new Vector3()) => {
    out[0] = a[0] * scalar;
    out[1] = a[1] * scalar;
    out[2] = a[2] * scalar;
    return out;
};
Vector3.negate = (a, out = new Vector3()) => {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    return out;
};
Vector3.normalize = (a, out = new Vector3()) => {
    return Vector3.divideScalar(a, Vector3.norm(a) || 1, out);
};
Vector3.rotateX = (a, b, rad, out = new Vector3()) => {
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
Vector3.rotateY = (a, b, rad, out = new Vector3()) => {
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
Vector3.rotateZ = (a, b, rad, out = new Vector3()) => {
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
Vector3.round = (a, out = new Vector3()) => {
    out[0] = Math.round(a[0]);
    out[1] = Math.round(a[1]);
    out[2] = Math.round(a[2]);
    return out;
};
Vector3.set = (x = 0, y = 0, z = 0, out = new Vector3()) => {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
};
Vector3.setNorm = (a, len, out = new Vector3()) => {
    return Vector3.multiplyScalar(Vector3.normalize(a, out), len, out);
};
Vector3.slerp = (a, b, t, out = new Vector3()) => {
    ag = Math.acos(Math.min(Math.max(Vector3.dot(a, b), -1), 1));
    s$2 = Math.sin(ag);
    ax$1 = Math.sin((1 - t) * ag) / s$2;
    bx$1 = Math.sin(t * ag) / s$2;
    out[0] = ax$1 * a[0] + bx$1 * b[0];
    out[1] = ax$1 * a[1] + bx$1 * b[1];
    out[2] = ax$1 * a[2] + bx$1 * b[2];
    return out;
};
Vector3.toString = (a) => {
    return `(${a[0]}, ${a[1]}, ${a[2]})`;
};
Vector3.transformMatrix3 = (a, m, out = new Vector3()) => {
    ax$1 = a[0];
    ay$1 = a[1];
    az$1 = a[2];
    out[0] = ax$1 * m[0] + ay$1 * m[3] + az$1 * m[6];
    out[1] = ax$1 * m[1] + ay$1 * m[4] + az$1 * m[7];
    out[2] = ax$1 * m[2] + ay$1 * m[5] + az$1 * m[8];
    return out;
};
Vector3.transformMatrix4 = (a, m, out = new Vector3()) => {
    ax$1 = a[0];
    ay$1 = a[1];
    az$1 = a[2];
    ag = m[3] * ax$1 + m[7] * ay$1 + m[11] * az$1 + m[15];
    ag = ag || 1.0;
    out[0] = (m[0] * ax$1 + m[4] * ay$1 + m[8] * az$1 + m[12]) / ag;
    out[1] = (m[1] * ax$1 + m[5] * ay$1 + m[9] * az$1 + m[13]) / ag;
    out[2] = (m[2] * ax$1 + m[6] * ay$1 + m[10] * az$1 + m[14]) / ag;
    return out;
};
Vector3.transformQuat = (a, q, out = new Vector3()) => {
    const qx = q[0], qy = q[1], qz = q[2], qw = q[3];
    const x = a[0], y = a[1], z = a[2];
    // var qvec = [qx, qy, qz];
    // var uv = vec3.cross([], qvec, a);
    let uvx = qy * z - qz * y, uvy = qz * x - qx * z, uvz = qx * y - qy * x;
    // var uuv = vec3.cross([], qvec, uv);
    let uuvx = qy * uvz - qz * uvy, uuvy = qz * uvx - qx * uvz, uuvz = qx * uvy - qy * uvx;
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

/* eslint-disable max-lines */
let a00 = 0, a01 = 0, a02 = 0, a03 = 0, a11 = 0, a10 = 0, a12 = 0, a13 = 0, a20 = 0, a21 = 0, a22 = 0, a23 = 0, a31 = 0, a30 = 0, a32 = 0, a33 = 0;
let b00 = 0, b01 = 0, b02 = 0, b03 = 0, b11 = 0, b10 = 0, b12 = 0, b13 = 0, b20 = 0, b21 = 0, b22 = 0, b23 = 0, b31 = 0, b30 = 0, b32 = 0, b33 = 0;
let x$1 = 0, y$1 = 0, z = 0, det = 0, len$1 = 0, s$1 = 0, t = 0, a = 0, b = 0, c$1 = 0, d = 0, e = 0, f = 0;
const UNIT_MATRIX4_DATA = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
class Matrix4 extends Float32Array {
    constructor(data = UNIT_MATRIX4_DATA) {
        super(data);
    }
}
Matrix4.UNIT_MATRIX4 = new Matrix4(UNIT_MATRIX4_DATA);
Matrix4.clone = (source) => {
    return new Matrix4(source);
};
Matrix4.create = () => {
    return new Matrix4(UNIT_MATRIX4_DATA);
};
Matrix4.determinant = (a) => {
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
Matrix4.fromArray = (source, out = new Matrix4()) => {
    out.set(source);
    return out;
};
Matrix4.fromEuler = (euler, out = new Matrix4()) => {
    x$1 = euler.x;
    y$1 = euler.y;
    z = euler.z;
    a = Math.cos(x$1);
    b = Math.sin(x$1);
    c$1 = Math.cos(y$1);
    d = Math.sin(y$1);
    e = Math.cos(z);
    f = Math.sin(z);
    if (euler.order === EulerRotationOrders.XYZ) {
        const ae = a * e, af = a * f, be = b * e, bf = b * f;
        out[0] = c$1 * e;
        out[4] = -c$1 * f;
        out[8] = d;
        out[1] = af + be * d;
        out[5] = ae - bf * d;
        out[9] = -b * c$1;
        out[2] = bf - ae * d;
        out[6] = be + af * d;
        out[10] = a * c$1;
    }
    else if (euler.order === EulerRotationOrders.YXZ) {
        const ce = c$1 * e, cf = c$1 * f, de = d * e, df = d * f;
        out[0] = ce + df * b;
        out[4] = de * b - cf;
        out[8] = a * d;
        out[1] = a * f;
        out[5] = a * e;
        out[9] = -b;
        out[2] = cf * b - de;
        out[6] = df + ce * b;
        out[10] = a * c$1;
    }
    else if (euler.order === EulerRotationOrders.ZXY) {
        const ce = c$1 * e, cf = c$1 * f, de = d * e, df = d * f;
        out[0] = ce - df * b;
        out[4] = -a * f;
        out[8] = de + cf * b;
        out[1] = cf + de * b;
        out[5] = a * e;
        out[9] = df - ce * b;
        out[2] = -a * d;
        out[6] = b;
        out[10] = a * c$1;
    }
    else if (euler.order === EulerRotationOrders.ZYX) {
        const ae = a * e, af = a * f, be = b * e, bf = b * f;
        out[0] = c$1 * e;
        out[4] = be * d - af;
        out[8] = ae * d + bf;
        out[1] = c$1 * f;
        out[5] = bf * d + ae;
        out[9] = af * d - be;
        out[2] = -d;
        out[6] = b * c$1;
        out[10] = a * c$1;
    }
    else if (euler.order === EulerRotationOrders.YZX) {
        const ac = a * c$1, ad = a * d, bc = b * c$1, bd = b * d;
        out[0] = c$1 * e;
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
        const ac = a * c$1, ad = a * d, bc = b * c$1, bd = b * d;
        out[0] = c$1 * e;
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
Matrix4.fromMatrix3 = (data, out = new Matrix4()) => {
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
Matrix4.fromQuaternion = (q, out = new Matrix4()) => {
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
Matrix4.fromRotation = (rad, axis, out = new Matrix4()) => {
    x$1 = axis[0];
    y$1 = axis[1];
    z = axis[2];
    len$1 = Math.hypot(x$1, y$1, z);
    if (len$1 < EPSILON) {
        return null;
    }
    len$1 = 1 / len$1;
    x$1 *= len$1;
    y$1 *= len$1;
    z *= len$1;
    s$1 = Math.sin(rad);
    c$1 = Math.cos(rad);
    t = 1 - c$1;
    out[0] = x$1 * x$1 * t + c$1;
    out[1] = y$1 * x$1 * t + z * s$1;
    out[2] = z * x$1 * t - y$1 * s$1;
    out[3] = 0;
    out[4] = x$1 * y$1 * t - z * s$1;
    out[5] = y$1 * y$1 * t + c$1;
    out[6] = z * y$1 * t + x$1 * s$1;
    out[7] = 0;
    out[8] = x$1 * z * t + y$1 * s$1;
    out[9] = y$1 * z * t - x$1 * s$1;
    out[10] = z * z * t + c$1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};
Matrix4.fromRotationX = (rad, out = new Matrix4()) => {
    s$1 = Math.sin(rad);
    c$1 = Math.cos(rad);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = c$1;
    out[6] = s$1;
    out[7] = 0;
    out[8] = 0;
    out[9] = -s$1;
    out[10] = c$1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};
Matrix4.fromRotationY = (rad, out = new Matrix4()) => {
    s$1 = Math.sin(rad);
    c$1 = Math.cos(rad);
    out[0] = c$1;
    out[1] = 0;
    out[2] = -s$1;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = s$1;
    out[9] = 0;
    out[10] = c$1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};
Matrix4.fromRotationZ = (rad, out = new Matrix4()) => {
    s$1 = Math.sin(rad);
    c$1 = Math.cos(rad);
    out[0] = c$1;
    out[1] = s$1;
    out[2] = 0;
    out[3] = 0;
    out[4] = -s$1;
    out[5] = c$1;
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
Matrix4.fromScaling = (v, out = new Matrix4()) => {
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
Matrix4.fromTranslation = (v, out = new Matrix4()) => {
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
Matrix4.identity = (out = new Matrix4()) => {
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
Matrix4.invert = (a, out = new Matrix4()) => {
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
Matrix4.lookAt = (eye, center, up = Vector3.VECTOR3_TOP, out = new Matrix4()) => {
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
    if (closeToCommon(eyex, centerx) && closeToCommon(eyey, centery) && closeToCommon(eyez, centerz)) {
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
Matrix4.multiply = (a, b, out = new Matrix4()) => {
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
Matrix4.multiplyScaleMatrix = (a, b, out = new Matrix4()) => {
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
Matrix4.multiplyTranslateMatrix = (a, b, out = new Matrix4()) => {
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
Matrix4.orthogonal = (left, right, bottom, top, near, far, out = new Matrix4()) => {
    c$1 = 1 / (left - right);
    b = 1 / (bottom - top);
    a = 1 / (near - far);
    out[0] = -2 * c$1;
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
    out[12] = (left + right) * c$1;
    out[13] = (top + bottom) * b;
    out[14] = (far + near) * a;
    out[15] = 1;
    return out;
};
Matrix4.orthogonalZ0 = (left, right, bottom, top, near, far, out = new Matrix4()) => {
    c$1 = 1 / (left - right);
    b = 1 / (bottom - top);
    a = 1 / (near - far);
    out[0] = -2 * c$1;
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
    out[12] = (left + right) * c$1;
    out[13] = (top + bottom) * b;
    out[14] = near * a;
    out[15] = 1;
    return out;
};
Matrix4.perspective = (fovy, aspect, near, far, out = new Matrix4()) => {
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
Matrix4.perspectiveZ0 = (fovy, aspect, near, far, out = new Matrix4()) => {
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
Matrix4.rotate = (a, rad, axis, out = new Matrix4()) => {
    x$1 = axis[0];
    y$1 = axis[1];
    z = axis[2];
    len$1 = Math.hypot(x$1, y$1, z);
    if (len$1 < EPSILON) {
        return null;
    }
    len$1 = 1 / len$1;
    x$1 *= len$1;
    y$1 *= len$1;
    z *= len$1;
    s$1 = Math.sin(rad);
    c$1 = Math.cos(rad);
    t = 1 - c$1;
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
    b00 = x$1 * x$1 * t + c$1;
    b01 = y$1 * x$1 * t + z * s$1;
    b02 = z * x$1 * t - y$1 * s$1;
    b10 = x$1 * y$1 * t - z * s$1;
    b11 = y$1 * y$1 * t + c$1;
    b12 = z * y$1 * t + x$1 * s$1;
    b20 = x$1 * z * t + y$1 * s$1;
    b21 = y$1 * z * t - x$1 * s$1;
    b22 = z * z * t + c$1;
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
Matrix4.rotateX = (a, rad, out = new Matrix4()) => {
    s$1 = Math.sin(rad);
    c$1 = Math.cos(rad);
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
    out[4] = a10 * c$1 + a20 * s$1;
    out[5] = a11 * c$1 + a21 * s$1;
    out[6] = a12 * c$1 + a22 * s$1;
    out[7] = a13 * c$1 + a23 * s$1;
    out[8] = a20 * c$1 - a10 * s$1;
    out[9] = a21 * c$1 - a11 * s$1;
    out[10] = a22 * c$1 - a12 * s$1;
    out[11] = a23 * c$1 - a13 * s$1;
    return out;
};
Matrix4.rotateY = (a, rad, out = new Matrix4()) => {
    s$1 = Math.sin(rad);
    c$1 = Math.cos(rad);
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
    out[0] = a00 * c$1 - a20 * s$1;
    out[1] = a01 * c$1 - a21 * s$1;
    out[2] = a02 * c$1 - a22 * s$1;
    out[3] = a03 * c$1 - a23 * s$1;
    out[8] = a00 * s$1 + a20 * c$1;
    out[9] = a01 * s$1 + a21 * c$1;
    out[10] = a02 * s$1 + a22 * c$1;
    out[11] = a03 * s$1 + a23 * c$1;
    return out;
};
Matrix4.rotateZ = (a, rad, out = new Matrix4()) => {
    s$1 = Math.sin(rad);
    c$1 = Math.cos(rad);
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
    out[0] = a00 * c$1 + a10 * s$1;
    out[1] = a01 * c$1 + a11 * s$1;
    out[2] = a02 * c$1 + a12 * s$1;
    out[3] = a03 * c$1 + a13 * s$1;
    out[4] = a10 * c$1 - a00 * s$1;
    out[5] = a11 * c$1 - a01 * s$1;
    out[6] = a12 * c$1 - a02 * s$1;
    out[7] = a13 * c$1 - a03 * s$1;
    return out;
};
Matrix4.scale = (a, v, out = new Matrix4()) => {
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
Matrix4.targetTo = (eye, target, up = Vector3.VECTOR3_TOP, out = new Matrix4()) => {
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
Matrix4.translate = (a, v, out = new Matrix4()) => {
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
Matrix4.transpose = (a, out = new Matrix4()) => {
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

class Mesh3Renderer {
    constructor(engine, camera) {
        this.renderTypes = MESH3;
        this.entityCacheData = new WeakMap();
        this.engine = engine;
        this.camera = camera;
    }
    render(mesh, passEncoder) {
        var _a;
        let cacheData = this.entityCacheData.get(mesh);
        // 假设更换了几何体和材质则重新生成缓存
        let material = mesh.getFirstComponentByTagLabel(MATERIAL) || DEFAULT_MATERIAL;
        let geometry = mesh.getFirstComponentByTagLabel(GEOMETRY);
        if (!cacheData || ((_a = mesh.getFirstComponentByTagLabel(MATERIAL)) === null || _a === void 0 ? void 0 : _a.dirty) || material !== cacheData.material || geometry !== cacheData.geometry) {
            cacheData = this.createCacheData(mesh);
            this.entityCacheData.set(mesh, cacheData);
        }
        else {
            // TODO update cache
            updateModelMatrixComponent(mesh);
        }
        passEncoder.setPipeline(cacheData.pipeline);
        // passEncoder.setScissorRect(0, 0, 400, 225);
        // TODO 有多个attribute buffer
        for (let i = 0; i < cacheData.attributesBuffers.length; i++) {
            passEncoder.setVertexBuffer(i, cacheData.attributesBuffers[i]);
        }
        const mvp = cacheData.mvp;
        Matrix4.multiply(this.camera.projection.data, Matrix4.invert(updateModelMatrixComponent(this.camera).data), mvp);
        Matrix4.multiply(mvp, mesh.worldMatrix.data, mvp);
        this.engine.device.queue.writeBuffer(cacheData.uniformBuffer, 0, mvp.buffer, mvp.byteOffset, mvp.byteLength);
        cacheData.uniformMap.forEach((uniform, key) => {
            if (uniform.type === BUFFER && uniform.dirty) {
                this.engine.device.queue.writeBuffer(key, 0, uniform.value.buffer, uniform.value.byteOffset, uniform.value.byteLength);
                uniform.dirty = false;
            }
            else if (uniform.type === TEXTURE_IMAGE && (uniform.dirty || uniform.value.dirty)) {
                if (uniform.value.loaded) {
                    if (uniform.value.data) {
                        this.engine.device.queue.copyExternalImageToTexture({ source: uniform.value.data }, { texture: key }, [uniform.value.data.width, uniform.value.data.height, 1]);
                        uniform.value.dirty = uniform.dirty = false;
                    }
                }
            }
        });
        passEncoder.setBindGroup(0, cacheData.uniformBindGroup);
        passEncoder.draw(mesh.getFirstComponentByTagLabel(GEOMETRY).count, 1, 0, 0);
        return this;
    }
    createCacheData(mesh) {
        var _a, _b;
        updateModelMatrixComponent(mesh);
        let device = this.engine.device;
        let uniformBuffer = device.createBuffer({
            size: 64,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        let buffers = [];
        let geometry = mesh.getFirstComponentByTagLabel(GEOMETRY);
        let material = mesh.getFirstComponentByTagLabel(MATERIAL) || DEFAULT_MATERIAL;
        let nodes = geometry.data;
        for (let i = 0; i < nodes.length; i++) {
            buffers.push(createVerticesBuffer(device, nodes[i].data));
        }
        let pipeline = this.createPipeline(geometry, material);
        let groupEntries = [{
                binding: 0,
                resource: {
                    buffer: uniformBuffer,
                },
            }];
        let uniforms = (_b = (_a = mesh.getFirstComponentByTagLabel(MATERIAL)) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.uniforms;
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
    createPipeline(geometry, material) {
        const pipelineLayout = this.engine.device.createPipelineLayout({
            bindGroupLayouts: [this.createBindGroupLayout(material)],
        });
        let vertexBuffers = this.parseGeometryBufferLayout(geometry);
        let stages = this.createStages(material, vertexBuffers);
        let pipeline = this.engine.device.createRenderPipeline({
            layout: pipelineLayout,
            vertex: stages.vertex,
            fragment: stages.fragment,
            primitive: {
                topology: geometry.topology,
                cullMode: geometry.cullMode,
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
    createBindGroupLayout(material) {
        let uniforms = material.data.uniforms;
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
        return this.engine.device.createBindGroupLayout({
            entries,
        });
    }
    createStages(material, vertexBuffers) {
        let vertex = {
            module: this.engine.device.createShaderModule({
                code: material.data.vertex,
            }),
            entryPoint: "main",
            buffers: vertexBuffers
        };
        let fragment = {
            module: this.engine.device.createShaderModule({
                code: material.data.fragment,
            }),
            entryPoint: "main",
            targets: [
                {
                    format: this.engine.preferredFormat,
                    blend: material === null || material === void 0 ? void 0 : material.data.blend
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
Mesh3Renderer.renderTypes = MESH3;

class RenderSystem extends System {
    constructor(engine, viewport, scissor) {
        super("Render System", (entity) => {
            var _a;
            return (_a = entity.getComponent(RENDERABLE)) === null || _a === void 0 ? void 0 : _a.data;
        });
        this.scissor = {
            x: 0, y: 0, width: 0, height: 0,
        };
        this.viewport = {
            x: 0, y: 0, width: 0, height: 0, minDepth: 0, maxDepth: 1
        };
        this.engine = engine;
        this.rendererMap = new Map();
        engine.context.configure({
            device: engine.device,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
            format: engine.preferredFormat,
            alphaMode: "premultiplied"
        });
        this.setScissor(scissor).setViewport(viewport);
    }
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
    handle(entity, store) {
        var _a, _b;
        if (entity.disabled) {
            return this;
        }
        // 根据不同类别进行渲染
        (_b = this.rendererMap.get((_a = entity.getComponent(RENDERABLE)) === null || _a === void 0 ? void 0 : _a.data)) === null || _b === void 0 ? void 0 : _b.render(entity, store.get("passEncoder"));
        return this;
    }
    setViewport(viewport) {
        this.viewport = viewport || {
            x: 0,
            y: 0,
            width: this.engine.canvas.width,
            height: this.engine.canvas.height,
            minDepth: 0,
            maxDepth: 1
        };
        return this;
    }
    setScissor(scissor) {
        this.scissor = scissor || {
            x: 0,
            y: 0,
            width: this.engine.canvas.width,
            height: this.engine.canvas.height
        };
        return this;
    }
    run(world) {
        let passEncoder = this.engine.renderPassEncoder;
        passEncoder.setViewport(this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height, this.viewport.minDepth, this.viewport.maxDepth);
        passEncoder.setScissorRect(this.scissor.x, this.scissor.y, this.scissor.width, this.scissor.height);
        world.store.set("passEncoder", passEncoder);
        super.run(world);
        return this;
    }
}

let x = 0;
let y = 0;
let c = 0;
let s = 0;
class Vector2 extends Float32Array {
    constructor(x = 0, y = 0) {
        super(2);
        this.dataType = ArraybufferDataType.VECTOR2;
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
Vector2.VECTOR2_ZERO = new Vector2(0, 0);
Vector2.VECTOR2_TOP = new Vector2(0, 1);
Vector2.VECTOR2_BOTTOM = new Vector2(0, -1);
Vector2.VECTOR2_LEFT = new Vector2(-1, 0);
Vector2.VECTOR2_RIGHT = new Vector2(1, 0);
Vector2.VECTOR2_ONE = new Vector2(1, 1);
Vector2.add = (a, b, out = new Vector2()) => {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    return out;
};
Vector2.addScalar = (a, b, out = new Vector2(2)) => {
    out[0] = a[0] + b;
    out[1] = a[1] + b;
    return out;
};
Vector2.angle = (a) => {
    return Math.atan2(a[1], a[0]);
};
Vector2.ceil = (a, out = new Vector2()) => {
    out[0] = Math.ceil(a[0]);
    out[1] = Math.ceil(a[1]);
    return out;
};
Vector2.clamp = (a, min, max, out = new Vector2()) => {
    out[0] = clampCommon(a[0], min[0], max[0]);
    out[1] = clampCommon(a[1], min[1], max[1]);
    return out;
};
Vector2.clampSafe = (a, min, max, out = new Vector2()) => {
    out[0] = clampSafeCommon(a[0], min[0], max[0]);
    out[1] = clampSafeCommon(a[1], min[1], max[1]);
    return out;
};
Vector2.clampLength = (a, min, max, out = new Vector2()) => {
    out[0] = clampSafeCommon(a[0], min[0], max[0]);
    out[1] = clampSafeCommon(a[1], min[1], max[1]);
    return out;
};
Vector2.clampScalar = (a, min, max, out = new Vector2()) => {
    out[0] = clampCommon(a[0], min, max);
    out[1] = clampCommon(a[1], min, max);
    return out;
};
Vector2.closeTo = (a, b, epsilon = EPSILON) => {
    return Vector2.distanceTo(a, b) <= epsilon;
};
Vector2.closeToRect = (a, b, epsilon = EPSILON) => {
    return closeToCommon(a[0], b[0], epsilon) && closeToCommon(a[1], b[1], epsilon);
};
Vector2.closeToManhattan = (a, b, epsilon = EPSILON) => {
    return Vector2.distanceToManhattan(a, b) <= epsilon;
};
Vector2.clone = (a, out = new Vector2()) => {
    out[0] = a[0];
    out[1] = a[1];
    return out;
};
Vector2.cross = (a, b) => {
    return a[0] * b[1] - a[1] * b[0];
};
Vector2.create = (x = 0, y = 0, out = new Vector2()) => {
    out[0] = x;
    out[1] = y;
    return out;
};
Vector2.distanceTo = (a, b) => {
    x = b[0] - a[0];
    y = b[1] - a[1];
    return Math.hypot(x, y);
};
Vector2.distanceToManhattan = (a, b) => {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
};
Vector2.distanceToSquared = (a, b) => {
    x = a[0] - b[0];
    y = a[1] - b[1];
    return x * x + y * y;
};
Vector2.divide = (a, b, out = new Vector2()) => {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    return out;
};
Vector2.divideScalar = (a, scalar, out = new Vector2()) => {
    return Vector2.multiplyScalar(a, 1 / scalar, out);
};
Vector2.dot = (a, b) => {
    return a[0] * b[0] + a[1] * b[1];
};
Vector2.equals = (a, b) => {
    return a[0] === b[0] && a[1] === b[1];
};
Vector2.floor = (a, out = new Vector2()) => {
    out[0] = Math.floor(a[0]);
    out[1] = Math.floor(a[1]);
    return out;
};
Vector2.floorToZero = (a, out = new Vector2()) => {
    out[0] = floorToZeroCommon(a[0]);
    out[1] = floorToZeroCommon(a[1]);
    return out;
};
Vector2.fromArray = (arr, index = 0, out = new Vector2()) => {
    out[0] = arr[index];
    out[1] = arr[index + 1];
    return out;
};
Vector2.fromJson = (j, out = new Vector2()) => {
    out[0] = j.x;
    out[1] = j.y;
    return out;
};
Vector2.fromPolar = (p, out = new Vector2()) => {
    out[0] = Math.cos(p.a) * p.r;
    out[1] = Math.sin(p.a) * p.r;
    return out;
};
Vector2.fromScalar = (value = 0, out = new Vector2()) => {
    out[0] = out[1] = value;
    return out;
};
Vector2.inverse = (a, out = new Vector2()) => {
    out[0] = 1 / a[0] || 0;
    out[1] = 1 / a[1] || 0;
    return out;
};
Vector2.norm = (a) => {
    return Math.sqrt(a[0] * a[0] + a[1] * a[1]);
};
Vector2.lengthManhattan = (a) => {
    return Math.abs(a[0]) + Math.abs(a[1]);
};
Vector2.lengthSquared = (a) => {
    return a[0] * a[0] + a[1] * a[1];
};
Vector2.lerp = (a, b, alpha, out = new Vector2()) => {
    out[0] = (b[0] - a[0]) * alpha + a[0];
    out[1] = (b[1] - a[1]) * alpha + a[1];
    return out;
};
Vector2.max = (a, b, out = new Vector2()) => {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    return out;
};
Vector2.min = (a, b, out = new Vector2()) => {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    return out;
};
Vector2.minus = (a, b, out = new Vector2()) => {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[0];
    return out;
};
Vector2.minusScalar = (a, num, out = new Vector2()) => {
    out[0] = a[0] - num;
    out[1] = a[1] - num;
    return out;
};
Vector2.multiply = (a, b, out = new Vector2()) => {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    return out;
};
Vector2.multiplyScalar = (a, scalar, out = new Vector2()) => {
    out[0] = a[0] * scalar;
    out[1] = a[1] * scalar;
    return out;
};
Vector2.negate = (a, out = new Vector2()) => {
    out[0] = -a[0];
    out[1] = -a[1];
    return out;
};
Vector2.normalize = (a, out = new Vector2()) => {
    return Vector2.divideScalar(a, Vector2.norm(a) || 1, out);
};
Vector2.random = (norm = 1, out = new Vector2()) => {
    x = Math.random() * DEG_360_RAD;
    out[0] = Math.cos(x) * norm;
    out[1] = Math.sin(x) * norm;
    return out;
};
Vector2.rotate = (a, angle, center = Vector2.VECTOR2_ZERO, out = new Vector2(2)) => {
    c = Math.cos(angle);
    s = Math.sin(angle);
    x = a[0] - center[0];
    y = a[1] - center[1];
    out[0] = x * c - y * s + center[0];
    out[1] = x * s + y * c + center[1];
    return out;
};
Vector2.round = (a, out = new Vector2()) => {
    out[0] = Math.round(a[0]);
    out[1] = Math.round(a[1]);
    return out;
};
Vector2.set = (x = 0, y = 0, out = new Vector2()) => {
    out[0] = x;
    out[1] = y;
    return out;
};
Vector2.setNorm = (a, length, out = new Vector2(2)) => {
    Vector2.normalize(a, out);
    Vector2.multiplyScalar(out, length, out);
    return out;
};
Vector2.toArray = (a, arr = []) => {
    arr[0] = a[0];
    arr[1] = a[1];
    return arr;
};
Vector2.toPalorJson = (a, p = { a: 0, r: 0 }) => {
    p.r = Vector2.norm(a);
    p.a = Vector2.angle(a);
    return p;
};
Vector2.toString = (a) => {
    return `(${a[0]}, ${a[1]})`;
};
Vector2.transformMatrix3 = (a, m, out = new Vector2()) => {
    x = a[0];
    y = a[1];
    out[0] = m[0] * x + m[3] * y + m[6];
    out[1] = m[1] * x + m[4] * y + m[7];
    return out;
};

// import clampCommon from "../common/clamp";
let ax, ay, az, aw, bx, by, bz, len;
let ix, iy, iz, iw;
let A, B, C, D, E, F, G, H, I, J;
class Vector4 extends Float32Array {
    constructor(x = 0, y = 0, z = 0, w = 0) {
        super(4);
        this.dataType = ArraybufferDataType.VECTOR4;
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
Vector4.VECTOR3_ZERO = new Vector4(0, 0, 0, 0);
Vector4.VECTOR3_ONE = new Vector4(1, 1, 1, 1);
Vector4.add = (a, b, out = new Vector4()) => {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    return out;
};
Vector4.ceil = (a, out = new Vector4()) => {
    out[0] = Math.ceil(a[0]);
    out[1] = Math.ceil(a[1]);
    out[2] = Math.ceil(a[2]);
    out[3] = Math.ceil(a[3]);
    return out;
};
Vector4.closeTo = (a, b) => {
    return (closeToCommon(a[0], b[0]) &&
        closeToCommon(a[1], b[1]) &&
        closeToCommon(a[2], b[2]) &&
        closeToCommon(a[3], b[3]));
};
Vector4.create = (x = 0, y = 0, z = 0, w = 0, out = new Vector4()) => {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
};
Vector4.cross = (u, v, w, out = new Vector4(4)) => {
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
Vector4.distanceTo = (a, b) => {
    ax = b[0] - a[0];
    ay = b[1] - a[1];
    az = b[2] - a[2];
    aw = b[3] - a[3];
    return Math.hypot(ax, ay, az, aw);
};
Vector4.distanceToSquared = (a, b) => {
    ax = b[0] - a[0];
    ay = b[1] - a[1];
    az = b[2] - a[2];
    aw = b[3] - a[3];
    return ax * ax + ay * ay + az * az + aw * aw;
};
Vector4.divide = (a, b, out = new Vector4()) => {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    out[3] = a[3] / b[3];
    return out;
};
Vector4.dot = (a, b) => {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
};
Vector4.equals = (a, b) => {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
};
Vector4.floor = (a, out = new Vector4()) => {
    out[0] = Math.floor(a[0]);
    out[1] = Math.floor(a[1]);
    out[2] = Math.floor(a[2]);
    out[3] = Math.floor(a[3]);
    return out;
};
Vector4.fromValues = (x, y, z, w, out = new Vector4()) => {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
};
Vector4.inverse = (a, out = new Vector4()) => {
    out[0] = 1.0 / a[0];
    out[1] = 1.0 / a[1];
    out[2] = 1.0 / a[2];
    out[3] = 1.0 / a[3];
    return out;
};
Vector4.norm = (a) => {
    return Math.hypot(a[0], a[1], a[2], a[3]);
};
Vector4.lengthSquared = (a) => {
    ax = a[0];
    ay = a[1];
    az = a[2];
    aw = a[3];
    return ax * ax + ay * ay + az * az + aw * aw;
};
Vector4.lerp = (a, b, t, out = new Vector4()) => {
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
Vector4.max = (a, b, out = new Vector4()) => {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    out[3] = Math.max(a[3], b[3]);
    return out;
};
Vector4.min = (a, b, out = new Vector4()) => {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    out[3] = Math.min(a[3], b[3]);
    return out;
};
Vector4.minus = (a, b, out = new Vector4()) => {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];
    return out;
};
Vector4.multiply = (a, b, out = new Vector4()) => {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    out[3] = a[3] * b[3];
    return out;
};
Vector4.multiplyScalar = (a, b, out = new Vector4()) => {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    return out;
};
Vector4.negate = (a, out = new Vector4()) => {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = -a[3];
    return out;
};
Vector4.normalize = (a, out = new Vector4()) => {
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
};
Vector4.round = (a, out = new Vector4()) => {
    out[0] = Math.round(a[0]);
    out[1] = Math.round(a[1]);
    out[2] = Math.round(a[2]);
    out[3] = Math.round(a[3]);
    return out;
};
Vector4.set = (x = 0, y = 0, z = 0, w = 0, out = new Vector4()) => {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[4] = w;
    return out;
};
Vector4.setNorm = (a, length, out = new Vector4(2)) => {
    Vector4.normalize(a, out);
    Vector4.multiplyScalar(out, length, out);
    return out;
};
Vector4.toString = (a) => {
    return `(${a[0]}, ${a[1]}, ${a[2]}, ${a[3]})`;
};
Vector4.transformMatrix4 = (a, m, out = new Vector4()) => {
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
Vector4.transformQuat = (a, q, out = new Vector4()) => {
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

class TweenSystem extends System {
    query(entity) {
        return entity.hasComponent("tween");
    }
    destroy() {
        throw new Error("Method not implemented.");
    }
    run(world) {
        return super.run(world);
    }
    handle(entity, _params) {
        let tweenC = entity.getComponent("tween");
        let map = tweenC.data;
        let from = tweenC.from;
        map.forEach((data, key) => {
            let rate = tweenC.time / tweenC.duration;
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

var createCamera2 = (projection, name = "camera", world) => {
    const entity = new Camera3$1(name, projection);
    if (world) {
        world.addEntity(entity);
    }
    return entity;
};

var createCamera3 = (projection, name = "camera", world) => {
    const entity = new Camera3(name, projection);
    if (world) {
        world.addEntity(entity);
    }
    return entity;
};

var createMesh2 = (geometry, material = DEFAULT_MATERIAL, name = MESH2, world) => {
    const entity = new Object3$1(name);
    entity.addComponent(geometry)
        .addComponent(material)
        .addComponent(new Renderable(MESH2));
    if (world) {
        world.addEntity(entity);
    }
    return entity;
};

var createMesh3 = (geometry, material = DEFAULT_MATERIAL, name = MESH3, world) => {
    const entity = new Object3(name);
    entity.addComponent(geometry)
        .addComponent(material)
        .addComponent(new Renderable(MESH3));
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
	createMesh3: createMesh3
});

export { APosition2, APosition3, AProjection2, AProjection3, ARotation2, ARotation3, AScale2, AScale3, constants$1 as ATTRIBUTE_NAME, Anchor2, Anchor3, AngleRotation2, AtlasTexture, constants$2 as COMPONENT_NAME, Camera3$1 as Camera2, Camera3, ColorMaterial, Component, ComponentManager, index$1 as ComponentProxy, DepthMaterial, EngineEvents, EngineTexture, Entity, index as EntityFactory, EntityManager as Entitymanager, EuclidPosition2, EuclidPosition3, EulerRotation3, EventDispatcher as EventFire, Geometry, index$2 as Geometry2Factory, index$3 as Geometry3Factory, HashRouteComponent, HashRouteSystem, IdGeneratorInstance, ImageBitmapTexture, Manager, Material, Mathx_module as Mathx, Matrix3Component, Matrix4Component, NormalMaterial, Object3$1 as Object2, Object3, OrthogonalProjection, PerspectiveProjection, Projection2D, PureSystem, Renderable, Sampler, ShaderMaterial, ShadertoyMaterial, SpritesheetTexture, System$1 as System, SystemManager, Texture, TextureMaterial, Timeline, Tween, TweenSystem, Vector2Scale2, Vector3Scale3, WebGLEngine, WebGPUEngine, Mesh2Renderer as WebGPUMesh2Renderer, Mesh3Renderer as WebGPUMesh3Renderer, RenderSystem as WebGPURenderSystem, World };
