(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Engine = {}));
}(this, (function (exports) { 'use strict';

	/*! *****************************************************************************
	Copyright (c) Microsoft Corporation. All rights reserved.
	Licensed under the Apache License, Version 2.0 (the "License"); you may not use
	this file except in compliance with the License. You may obtain a copy of the
	License at http://www.apache.org/licenses/LICENSE-2.0

	THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
	WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
	MERCHANTABLITY OR NON-INFRINGEMENT.

	See the Apache Version 2.0 License for specific language governing permissions
	and limitations under the License.
	***************************************************************************** */

	function __awaiter(thisArg, _arguments, P, generator) {
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	}

	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	const mixin = (Base = Object, eventKeyList = []) => {
	    var _a;
	    return _a = class EventDispatcher extends Base {
	            constructor() {
	                super(...arguments);
	                // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	                this.eventKeyList = eventKeyList;
	                /**
	                 * store all the filters
	                 */
	                // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	                this.filters = [];
	                /**
	                 * store all the listeners by key
	                 */
	                // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	                this.listeners = new Map();
	                this.all = (listener) => {
	                    return this.filt(() => true, listener);
	                };
	                this.clearListenersByKey = (eventKey) => {
	                    this.listeners.delete(eventKey);
	                    return this;
	                };
	                this.clearAllListeners = () => {
	                    const keys = this.listeners.keys();
	                    for (const key of keys) {
	                        this.listeners.delete(key);
	                    }
	                    return this;
	                };
	                this.filt = (rule, listener) => {
	                    this.filters.push({
	                        listener,
	                        rule
	                    });
	                    return this;
	                };
	                this.fire = (eventKey, target) => {
	                    if (!this.checkEventKeyAvailable(eventKey)) {
	                        console.error("EventDispatcher couldn't dispatch the event since EventKeyList doesn't contains key: ", eventKey);
	                        return this;
	                    }
	                    const array = this.listeners.get(eventKey) || [];
	                    let len = array.length;
	                    let item;
	                    for (let i = 0; i < len; i++) {
	                        item = array[i];
	                        item.listener({
	                            eventKey,
	                            life: --item.times,
	                            target
	                        });
	                        if (item.times <= 0) {
	                            array.splice(i--, 1);
	                            --len;
	                        }
	                    }
	                    return this.checkFilt(eventKey, target);
	                };
	                this.off = (eventKey, listener) => {
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
	                };
	                this.on = (eventKey, listener) => {
	                    return this.times(eventKey, Infinity, listener);
	                };
	                this.once = (eventKey, listener) => {
	                    return this.times(eventKey, 1, listener);
	                };
	                this.times = (eventKey, times, listener) => {
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
	                };
	                this.checkFilt = (eventKey, target) => {
	                    for (const item of this.filters) {
	                        if (item.rule(eventKey, target)) {
	                            item.listener({
	                                eventKey,
	                                life: Infinity,
	                                target
	                            });
	                        }
	                    }
	                    return this;
	                };
	                this.checkEventKeyAvailable = (eventKey) => {
	                    if (this.eventKeyList.length) {
	                        return this.eventKeyList.includes(eventKey);
	                    }
	                    return true;
	                };
	            }
	        },
	        _a.mixin = mixin,
	        _a;
	};
	var EventDispatcher = mixin(Object);

	class WebGPUEngine extends EventDispatcher {
	    constructor(canvas) {
	        super();
	        this.inited = false;
	        this.canvas = canvas;
	        WebGPUEngine.detect(canvas).then(({ context, adapter, device }) => {
	            this.context = context;
	            this.adapter = adapter;
	            this.device = device;
	            this.inited = true;
	            this.fire(WebGPUEngine.INITED, {
	                eventKey: WebGPUEngine.INITED,
	                target: this
	            });
	        }).catch((error) => {
	            throw error;
	        });
	    }
	    static detect(canvas = document.createElement("canvas")) {
	        var _a;
	        return __awaiter(this, void 0, void 0, function* () {
	            const context = canvas.getContext("gpupresent");
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
	    createRenderer() {
	    }
	}
	WebGPUEngine.INITED = "inited";

	class Component {
	    constructor(name, data = null) {
	        this.isComponent = true;
	        this.data = null;
	        this.disabled = false;
	        this.usedBy = [];
	        this.dirty = false;
	        this.name = name;
	        this.data = data;
	    }
	    clone() {
	        return new Component(this.name, this.data);
	    }
	}

	class Geometry3 extends Component {
	    constructor(count = 0, topology = "triangle-list", cullMode = "front", data = []) {
	        super('geometry3', data);
	        this.data = [];
	        this.count = count;
	        this.topology = topology;
	        this.cullMode = cullMode;
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
	    static createTriangleGeometry(a = [-1, 0, 0], b = [1, 0, 0], c = [0, 1, 0]) {
	        let geo = new Geometry3(3);
	        let result = new Float32Array(9);
	        result.set(a);
	        result.set(b, 3);
	        result.set(c, 6);
	        geo.addAttribute('vertices', result, 3);
	        return geo;
	    }
	}

	const EPSILON = Math.pow(2, -52);

	var EulerRotationOrders$1;
	(function (EulerRotationOrders) {
	    EulerRotationOrders["XYZ"] = "xyz";
	    EulerRotationOrders["ZXY"] = "zxy";
	    EulerRotationOrders["YZX"] = "yzx";
	    EulerRotationOrders["XZY"] = "xzy";
	    EulerRotationOrders["ZYX"] = "zyx";
	    EulerRotationOrders["YXZ"] = "yxz";
	})(EulerRotationOrders$1 || (EulerRotationOrders$1 = {}));

	let a00$2 = 0, a01$2 = 0, a02$1 = 0, a03$1 = 0, a11$2 = 0, a10$2 = 0, a12$1 = 0, a13$1 = 0, a20$1 = 0, a21$1 = 0, a22$1 = 0, a23$1 = 0, a31$1 = 0, a30$1 = 0, a32$1 = 0, a33$1 = 0;
	let b00$2 = 0, b01$2 = 0, b02$1 = 0, b03$1 = 0, b11$2 = 0, b10$2 = 0, b12$1 = 0, b13 = 0, b20$1 = 0, b21$1 = 0, b22$1 = 0, b23 = 0, b31 = 0, b30 = 0, b32 = 0, b33 = 0;
	let x$2 = 0, y$2 = 0, z$1 = 0, det$1 = 0, len$1 = 0, s = 0, t = 0, a$1 = 0, b$1 = 0, c$1 = 0, d$1 = 0, e$1 = 0, f$1 = 0;
	const UNIT_MATRIX4_DATA$1 = Object.freeze([
	    1, 0, 0, 0,
	    0, 1, 0, 0,
	    0, 0, 1, 0,
	    0, 0, 0, 1
	]);
	const UNIT_MATRIX4 = new Float32Array(UNIT_MATRIX4_DATA$1);
	const create$3 = () => {
	    return new Float32Array(UNIT_MATRIX4_DATA$1);
	};
	const determinant$2 = (a) => {
	    a00$2 = a[0],
	        a01$2 = a[1],
	        a02$1 = a[2],
	        a03$1 = a[3];
	    a10$2 = a[4],
	        a11$2 = a[5],
	        a12$1 = a[6],
	        a13$1 = a[7];
	    a20$1 = a[8],
	        a21$1 = a[9],
	        a22$1 = a[10],
	        a23$1 = a[11];
	    a30$1 = a[12],
	        a31$1 = a[13],
	        a32$1 = a[14],
	        a33$1 = a[15];
	    b00$2 = a00$2 * a11$2 - a01$2 * a10$2;
	    b01$2 = a00$2 * a12$1 - a02$1 * a10$2;
	    b02$1 = a01$2 * a12$1 - a02$1 * a11$2;
	    b03$1 = a20$1 * a31$1 - a21$1 * a30$1;
	    b10$2 = a20$1 * a32$1 - a22$1 * a30$1;
	    b11$2 = a21$1 * a32$1 - a22$1 * a31$1;
	    b12$1 = a00$2 * b11$2 - a01$2 * b10$2 + a02$1 * b03$1;
	    b13 = a10$2 * b11$2 - a11$2 * b10$2 + a12$1 * b03$1;
	    b20$1 = a20$1 * b02$1 - a21$1 * b01$2 + a22$1 * b00$2;
	    b21$1 = a30$1 * b02$1 - a31$1 * b01$2 + a32$1 * b00$2;
	    return a13$1 * b12$1 - a03$1 * b13 + a33$1 * b20$1 - a23$1 * b21$1;
	};
	const from$2 = (a, out = new Float32Array(16)) => {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[4] = a[4];
	    out[5] = a[5];
	    out[6] = a[6];
	    out[7] = a[7];
	    out[8] = a[8];
	    out[9] = a[9];
	    out[10] = a[10];
	    out[11] = a[11];
	    out[12] = a[12];
	    out[13] = a[13];
	    out[14] = a[14];
	    out[15] = a[15];
	    return out;
	};
	const fromEuler$1 = (euler, out = new Float32Array(16)) => {
	    x$2 = euler.x;
	    y$2 = euler.y;
	    z$1 = euler.z;
	    a$1 = Math.cos(x$2), b$1 = Math.sin(x$2);
	    c$1 = Math.cos(y$2), d$1 = Math.sin(y$2);
	    e$1 = Math.cos(z$1), f$1 = Math.sin(z$1);
	    if (euler.order === EulerRotationOrders$1.XYZ) {
	        const ae = a$1 * e$1, af = a$1 * f$1, be = b$1 * e$1, bf = b$1 * f$1;
	        out[0] = c$1 * e$1;
	        out[4] = -c$1 * f$1;
	        out[8] = d$1;
	        out[1] = af + be * d$1;
	        out[5] = ae - bf * d$1;
	        out[9] = -b$1 * c$1;
	        out[2] = bf - ae * d$1;
	        out[6] = be + af * d$1;
	        out[10] = a$1 * c$1;
	    }
	    else if (euler.order === EulerRotationOrders$1.YXZ) {
	        const ce = c$1 * e$1, cf = c$1 * f$1, de = d$1 * e$1, df = d$1 * f$1;
	        out[0] = ce + df * b$1;
	        out[4] = de * b$1 - cf;
	        out[8] = a$1 * d$1;
	        out[1] = a$1 * f$1;
	        out[5] = a$1 * e$1;
	        out[9] = -b$1;
	        out[2] = cf * b$1 - de;
	        out[6] = df + ce * b$1;
	        out[10] = a$1 * c$1;
	    }
	    else if (euler.order === EulerRotationOrders$1.ZXY) {
	        const ce = c$1 * e$1, cf = c$1 * f$1, de = d$1 * e$1, df = d$1 * f$1;
	        out[0] = ce - df * b$1;
	        out[4] = -a$1 * f$1;
	        out[8] = de + cf * b$1;
	        out[1] = cf + de * b$1;
	        out[5] = a$1 * e$1;
	        out[9] = df - ce * b$1;
	        out[2] = -a$1 * d$1;
	        out[6] = b$1;
	        out[10] = a$1 * c$1;
	    }
	    else if (euler.order === EulerRotationOrders$1.ZYX) {
	        const ae = a$1 * e$1, af = a$1 * f$1, be = b$1 * e$1, bf = b$1 * f$1;
	        out[0] = c$1 * e$1;
	        out[4] = be * d$1 - af;
	        out[8] = ae * d$1 + bf;
	        out[1] = c$1 * f$1;
	        out[5] = bf * d$1 + ae;
	        out[9] = af * d$1 - be;
	        out[2] = -d$1;
	        out[6] = b$1 * c$1;
	        out[10] = a$1 * c$1;
	    }
	    else if (euler.order === EulerRotationOrders$1.YZX) {
	        const ac = a$1 * c$1, ad = a$1 * d$1, bc = b$1 * c$1, bd = b$1 * d$1;
	        out[0] = c$1 * e$1;
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
	        const ac = a$1 * c$1, ad = a$1 * d$1, bc = b$1 * c$1, bd = b$1 * d$1;
	        out[0] = c$1 * e$1;
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
	function fromQuaternion(q, out) {
	    let x = q[0], y = q[1], z = q[2], w = q[3];
	    let x2 = x + x;
	    let y2 = y + y;
	    let z2 = z + z;
	    let xx = x * x2;
	    let yx = y * x2;
	    let yy = y * y2;
	    let zx = z * x2;
	    let zy = z * y2;
	    let zz = z * z2;
	    let wx = w * x2;
	    let wy = w * y2;
	    let wz = w * z2;
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
	}
	const fromRotation$2 = (rad, axis, out) => {
	    x$2 = axis[0];
	    y$2 = axis[1];
	    z$1 = axis[2];
	    len$1 = Math.hypot(x$2, y$2, z$1);
	    if (len$1 < EPSILON) {
	        return null;
	    }
	    len$1 = 1 / len$1;
	    x$2 *= len$1;
	    y$2 *= len$1;
	    z$1 *= len$1;
	    s = Math.sin(rad);
	    c$1 = Math.cos(rad);
	    t = 1 - c$1;
	    out[0] = x$2 * x$2 * t + c$1;
	    out[1] = y$2 * x$2 * t + z$1 * s;
	    out[2] = z$1 * x$2 * t - y$2 * s;
	    out[3] = 0;
	    out[4] = x$2 * y$2 * t - z$1 * s;
	    out[5] = y$2 * y$2 * t + c$1;
	    out[6] = z$1 * y$2 * t + x$2 * s;
	    out[7] = 0;
	    out[8] = x$2 * z$1 * t + y$2 * s;
	    out[9] = y$2 * z$1 * t - x$2 * s;
	    out[10] = z$1 * z$1 * t + c$1;
	    out[11] = 0;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	    return out;
	};
	const fromRotationX = (rad, out) => {
	    s = Math.sin(rad);
	    c$1 = Math.cos(rad);
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = c$1;
	    out[6] = s;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = -s;
	    out[10] = c$1;
	    out[11] = 0;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	    return out;
	};
	const fromRotationY = (rad, out) => {
	    s = Math.sin(rad);
	    c$1 = Math.cos(rad);
	    out[0] = c$1;
	    out[1] = 0;
	    out[2] = -s;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = 1;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = s;
	    out[9] = 0;
	    out[10] = c$1;
	    out[11] = 0;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	    return out;
	};
	const fromRotationZ = (rad, out) => {
	    s = Math.sin(rad);
	    c$1 = Math.cos(rad);
	    out[0] = c$1;
	    out[1] = s;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = -s;
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
	const fromScaling$2 = (v, out = new Float32Array(16)) => {
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
	const fromTranslation$1 = (v, out = new Float32Array(16)) => {
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
	const identity$2 = (out = new Float32Array(16)) => {
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
	function invert$2(a, out = new Float32Array(16)) {
	    a00$2 = a[0],
	        a01$2 = a[1],
	        a02$1 = a[2],
	        a03$1 = a[3];
	    a10$2 = a[4],
	        a11$2 = a[5],
	        a12$1 = a[6],
	        a13$1 = a[7];
	    a20$1 = a[8],
	        a21$1 = a[9],
	        a22$1 = a[10],
	        a23$1 = a[11];
	    a30$1 = a[12],
	        a31$1 = a[13],
	        a32$1 = a[14],
	        a33$1 = a[15];
	    b00$2 = a00$2 * a11$2 - a01$2 * a10$2;
	    b01$2 = a00$2 * a12$1 - a02$1 * a10$2;
	    b02$1 = a00$2 * a13$1 - a03$1 * a10$2;
	    b03$1 = a01$2 * a12$1 - a02$1 * a11$2;
	    b20$1 = a01$2 * a13$1 - a03$1 * a11$2;
	    b21$1 = a02$1 * a13$1 - a03$1 * a12$1;
	    b22$1 = a20$1 * a31$1 - a21$1 * a30$1;
	    b23 = a20$1 * a32$1 - a22$1 * a30$1;
	    b30 = a20$1 * a33$1 - a23$1 * a30$1;
	    b31 = a21$1 * a32$1 - a22$1 * a31$1;
	    b32 = a21$1 * a33$1 - a23$1 * a31$1;
	    b33 = a22$1 * a33$1 - a23$1 * a32$1;
	    det$1 =
	        b00$2 * b33 - b01$2 * b32 + b02$1 * b31 + b03$1 * b30 - b20$1 * b23 + b21$1 * b22$1;
	    if (!det$1) {
	        return null;
	    }
	    det$1 = 1.0 / det$1;
	    out[0] = (a11$2 * b33 - a12$1 * b32 + a13$1 * b31) * det$1;
	    out[1] = (a02$1 * b32 - a01$2 * b33 - a03$1 * b31) * det$1;
	    out[2] = (a31$1 * b21$1 - a32$1 * b20$1 + a33$1 * b03$1) * det$1;
	    out[3] = (a22$1 * b20$1 - a21$1 * b21$1 - a23$1 * b03$1) * det$1;
	    out[4] = (a12$1 * b30 - a10$2 * b33 - a13$1 * b23) * det$1;
	    out[5] = (a00$2 * b33 - a02$1 * b30 + a03$1 * b23) * det$1;
	    out[6] = (a32$1 * b02$1 - a30$1 * b21$1 - a33$1 * b01$2) * det$1;
	    out[7] = (a20$1 * b21$1 - a22$1 * b02$1 + a23$1 * b01$2) * det$1;
	    out[8] = (a10$2 * b32 - a11$2 * b30 + a13$1 * b22$1) * det$1;
	    out[9] = (a01$2 * b30 - a00$2 * b32 - a03$1 * b22$1) * det$1;
	    out[10] = (a30$1 * b20$1 - a31$1 * b02$1 + a33$1 * b00$2) * det$1;
	    out[11] = (a21$1 * b02$1 - a20$1 * b20$1 - a23$1 * b00$2) * det$1;
	    out[12] = (a11$2 * b23 - a10$2 * b31 - a12$1 * b22$1) * det$1;
	    out[13] = (a00$2 * b31 - a01$2 * b23 + a02$1 * b22$1) * det$1;
	    out[14] = (a31$1 * b01$2 - a30$1 * b03$1 - a32$1 * b00$2) * det$1;
	    out[15] = (a20$1 * b03$1 - a21$1 * b01$2 + a22$1 * b00$2) * det$1;
	    return out;
	}
	const lookAt = (eye, center, up, out) => {
	    let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
	    let eyex = eye[0];
	    let eyey = eye[1];
	    let eyez = eye[2];
	    let upx = up[0];
	    let upy = up[1];
	    let upz = up[2];
	    let centerx = center[0];
	    let centery = center[1];
	    let centerz = center[2];
	    if (Math.abs(eyex - centerx) < EPSILON &&
	        Math.abs(eyey - centery) < EPSILON &&
	        Math.abs(eyez - centerz) < EPSILON) {
	        return identity$2(out);
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
	const multiply$2 = (a, b, out = new Float32Array(16)) => {
	    a00$2 = a[0],
	        a01$2 = a[1],
	        a02$1 = a[2],
	        a03$1 = a[3];
	    a10$2 = a[4],
	        a11$2 = a[5],
	        a12$1 = a[6],
	        a13$1 = a[7];
	    a20$1 = a[8],
	        a21$1 = a[9],
	        a22$1 = a[10],
	        a23$1 = a[11];
	    a30$1 = a[12],
	        a31$1 = a[13],
	        a32$1 = a[14],
	        a33$1 = a[15];
	    b00$2 = b[0],
	        b01$2 = b[1],
	        b02$1 = b[2],
	        b03$1 = b[3];
	    out[0] = b00$2 * a00$2 + b01$2 * a10$2 + b02$1 * a20$1 + b03$1 * a30$1;
	    out[1] = b00$2 * a01$2 + b01$2 * a11$2 + b02$1 * a21$1 + b03$1 * a31$1;
	    out[2] = b00$2 * a02$1 + b01$2 * a12$1 + b02$1 * a22$1 + b03$1 * a32$1;
	    out[3] = b00$2 * a03$1 + b01$2 * a13$1 + b02$1 * a23$1 + b03$1 * a33$1;
	    b00$2 = b[4];
	    b01$2 = b[5];
	    b02$1 = b[6];
	    b03$1 = b[7];
	    out[4] = b00$2 * a00$2 + b01$2 * a10$2 + b02$1 * a20$1 + b03$1 * a30$1;
	    out[5] = b00$2 * a01$2 + b01$2 * a11$2 + b02$1 * a21$1 + b03$1 * a31$1;
	    out[6] = b00$2 * a02$1 + b01$2 * a12$1 + b02$1 * a22$1 + b03$1 * a32$1;
	    out[7] = b00$2 * a03$1 + b01$2 * a13$1 + b02$1 * a23$1 + b03$1 * a33$1;
	    b00$2 = b[8];
	    b01$2 = b[9];
	    b02$1 = b[10];
	    b03$1 = b[11];
	    out[8] = b00$2 * a00$2 + b01$2 * a10$2 + b02$1 * a20$1 + b03$1 * a30$1;
	    out[9] = b00$2 * a01$2 + b01$2 * a11$2 + b02$1 * a21$1 + b03$1 * a31$1;
	    out[10] = b00$2 * a02$1 + b01$2 * a12$1 + b02$1 * a22$1 + b03$1 * a32$1;
	    out[11] = b00$2 * a03$1 + b01$2 * a13$1 + b02$1 * a23$1 + b03$1 * a33$1;
	    b00$2 = b[12];
	    b01$2 = b[13];
	    b02$1 = b[14];
	    b03$1 = b[15];
	    out[12] = b00$2 * a00$2 + b01$2 * a10$2 + b02$1 * a20$1 + b03$1 * a30$1;
	    out[13] = b00$2 * a01$2 + b01$2 * a11$2 + b02$1 * a21$1 + b03$1 * a31$1;
	    out[14] = b00$2 * a02$1 + b01$2 * a12$1 + b02$1 * a22$1 + b03$1 * a32$1;
	    out[15] = b00$2 * a03$1 + b01$2 * a13$1 + b02$1 * a23$1 + b03$1 * a33$1;
	    return out;
	};
	const orthogonal = (left, right, bottom, top, near, far, out) => {
	    let lr = 1 / (left - right);
	    let bt = 1 / (bottom - top);
	    let nf = 1 / (near - far);
	    out[0] = -2 * lr;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = -2 * bt;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = 2 * nf;
	    out[11] = 0;
	    out[12] = (left + right) * lr;
	    out[13] = (top + bottom) * bt;
	    out[14] = (far + near) * nf;
	    out[15] = 1;
	    return out;
	};
	const perspective = (fovy, aspect, near, far, out) => {
	    let f = 1.0 / Math.tan(fovy / 2), nf;
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
	    if (far != null && far !== Infinity) {
	        nf = 1 / (near - far);
	        out[10] = (far + near) * nf;
	        out[14] = 2 * far * near * nf;
	    }
	    else {
	        out[10] = -1;
	        out[14] = -2 * near;
	    }
	    return out;
	};
	const rotate$2 = (a, rad, axis, out) => {
	    x$2 = axis[0];
	    y$2 = axis[1];
	    z$1 = axis[2];
	    len$1 = Math.hypot(x$2, y$2, z$1);
	    if (len$1 < EPSILON) {
	        return null;
	    }
	    len$1 = 1 / len$1;
	    x$2 *= len$1;
	    y$2 *= len$1;
	    z$1 *= len$1;
	    s = Math.sin(rad);
	    c$1 = Math.cos(rad);
	    t = 1 - c$1;
	    a00$2 = a[0];
	    a01$2 = a[1];
	    a02$1 = a[2];
	    a03$1 = a[3];
	    a10$2 = a[4];
	    a11$2 = a[5];
	    a12$1 = a[6];
	    a13$1 = a[7];
	    a20$1 = a[8];
	    a21$1 = a[9];
	    a22$1 = a[10];
	    a23$1 = a[11];
	    b00$2 = x$2 * x$2 * t + c$1;
	    b01$2 = y$2 * x$2 * t + z$1 * s;
	    b02$1 = z$1 * x$2 * t - y$2 * s;
	    b10$2 = x$2 * y$2 * t - z$1 * s;
	    b11$2 = y$2 * y$2 * t + c$1;
	    b12$1 = z$1 * y$2 * t + x$2 * s;
	    b20$1 = x$2 * z$1 * t + y$2 * s;
	    b21$1 = y$2 * z$1 * t - x$2 * s;
	    b22$1 = z$1 * z$1 * t + c$1;
	    out[0] = a00$2 * b00$2 + a10$2 * b01$2 + a20$1 * b02$1;
	    out[1] = a01$2 * b00$2 + a11$2 * b01$2 + a21$1 * b02$1;
	    out[2] = a02$1 * b00$2 + a12$1 * b01$2 + a22$1 * b02$1;
	    out[3] = a03$1 * b00$2 + a13$1 * b01$2 + a23$1 * b02$1;
	    out[4] = a00$2 * b10$2 + a10$2 * b11$2 + a20$1 * b12$1;
	    out[5] = a01$2 * b10$2 + a11$2 * b11$2 + a21$1 * b12$1;
	    out[6] = a02$1 * b10$2 + a12$1 * b11$2 + a22$1 * b12$1;
	    out[7] = a03$1 * b10$2 + a13$1 * b11$2 + a23$1 * b12$1;
	    out[8] = a00$2 * b20$1 + a10$2 * b21$1 + a20$1 * b22$1;
	    out[9] = a01$2 * b20$1 + a11$2 * b21$1 + a21$1 * b22$1;
	    out[10] = a02$1 * b20$1 + a12$1 * b21$1 + a22$1 * b22$1;
	    out[11] = a03$1 * b20$1 + a13$1 * b21$1 + a23$1 * b22$1;
	    if (a !== out) {
	        out[12] = a[12];
	        out[13] = a[13];
	        out[14] = a[14];
	        out[15] = a[15];
	    }
	    return out;
	};
	const rotateX = (a, rad, out) => {
	    s = Math.sin(rad);
	    c$1 = Math.cos(rad);
	    a10$2 = a[4];
	    a11$2 = a[5];
	    a12$1 = a[6];
	    a13$1 = a[7];
	    a20$1 = a[8];
	    a21$1 = a[9];
	    a22$1 = a[10];
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
	    out[4] = a10$2 * c$1 + a20$1 * s;
	    out[5] = a11$2 * c$1 + a21$1 * s;
	    out[6] = a12$1 * c$1 + a22$1 * s;
	    out[7] = a13$1 * c$1 + a23$1 * s;
	    out[8] = a20$1 * c$1 - a10$2 * s;
	    out[9] = a21$1 * c$1 - a11$2 * s;
	    out[10] = a22$1 * c$1 - a12$1 * s;
	    out[11] = a23$1 * c$1 - a13$1 * s;
	    return out;
	};
	function rotateY(a, rad, out) {
	    s = Math.sin(rad);
	    c$1 = Math.cos(rad);
	    a00$2 = a[0];
	    a01$2 = a[1];
	    a02$1 = a[2];
	    a03$1 = a[3];
	    a20$1 = a[8];
	    a21$1 = a[9];
	    a22$1 = a[10];
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
	    out[0] = a00$2 * c$1 - a20$1 * s;
	    out[1] = a01$2 * c$1 - a21$1 * s;
	    out[2] = a02$1 * c$1 - a22$1 * s;
	    out[3] = a03$1 * c$1 - a23$1 * s;
	    out[8] = a00$2 * s + a20$1 * c$1;
	    out[9] = a01$2 * s + a21$1 * c$1;
	    out[10] = a02$1 * s + a22$1 * c$1;
	    out[11] = a03$1 * s + a23$1 * c$1;
	    return out;
	}
	const rotateZ = (a, rad, out) => {
	    s = Math.sin(rad);
	    c$1 = Math.cos(rad);
	    a00$2 = a[0];
	    a01$2 = a[1];
	    a02$1 = a[2];
	    a03$1 = a[3];
	    a10$2 = a[4];
	    a11$2 = a[5];
	    a12$1 = a[6];
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
	    out[0] = a00$2 * c$1 + a10$2 * s;
	    out[1] = a01$2 * c$1 + a11$2 * s;
	    out[2] = a02$1 * c$1 + a12$1 * s;
	    out[3] = a03$1 * c$1 + a13$1 * s;
	    out[4] = a10$2 * c$1 - a00$2 * s;
	    out[5] = a11$2 * c$1 - a01$2 * s;
	    out[6] = a12$1 * c$1 - a02$1 * s;
	    out[7] = a13$1 * c$1 - a03$1 * s;
	    return out;
	};
	const scale$2 = (a, v, out = new Float32Array(16)) => {
	    x$2 = v[0];
	    y$2 = v[1];
	    z$1 = v[2];
	    out[0] = a[0] * x$2;
	    out[1] = a[1] * x$2;
	    out[2] = a[2] * x$2;
	    out[3] = a[3] * x$2;
	    out[4] = a[4] * y$2;
	    out[5] = a[5] * y$2;
	    out[6] = a[6] * y$2;
	    out[7] = a[7] * y$2;
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
	const targetTo = (eye, target, up, out = new Float32Array(16)) => {
	    let eyex = eye[0], eyey = eye[1], eyez = eye[2], upx = up[0], upy = up[1], upz = up[2];
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
	const translate$1 = (a, v, out = new Float32Array(16)) => {
	    x$2 = v[0];
	    y$2 = v[1];
	    z$1 = v[2];
	    if (a === out) {
	        out[12] = a[0] * x$2 + a[4] * y$2 + a[8] * z$1 + a[12];
	        out[13] = a[1] * x$2 + a[5] * y$2 + a[9] * z$1 + a[13];
	        out[14] = a[2] * x$2 + a[6] * y$2 + a[10] * z$1 + a[14];
	        out[15] = a[3] * x$2 + a[7] * y$2 + a[11] * z$1 + a[15];
	    }
	    else {
	        a00$2 = a[0];
	        a01$2 = a[1];
	        a02$1 = a[2];
	        a03$1 = a[3];
	        a10$2 = a[4];
	        a11$2 = a[5];
	        a12$1 = a[6];
	        a13$1 = a[7];
	        a20$1 = a[8];
	        a21$1 = a[9];
	        a22$1 = a[10];
	        a23$1 = a[11];
	        out[0] = a00$2;
	        out[1] = a01$2;
	        out[2] = a02$1;
	        out[3] = a03$1;
	        out[4] = a10$2;
	        out[5] = a11$2;
	        out[6] = a12$1;
	        out[7] = a13$1;
	        out[8] = a20$1;
	        out[9] = a21$1;
	        out[10] = a22$1;
	        out[11] = a23$1;
	        out[12] = a00$2 * x$2 + a10$2 * y$2 + a20$1 * z$1 + a[12];
	        out[13] = a01$2 * x$2 + a11$2 * y$2 + a21$1 * z$1 + a[13];
	        out[14] = a02$1 * x$2 + a12$1 * y$2 + a22$1 * z$1 + a[14];
	        out[15] = a03$1 * x$2 + a13$1 * y$2 + a23$1 * z$1 + a[15];
	    }
	    return out;
	};
	const transpose$2 = (a, out = new Float32Array(16)) => {
	    if (out === a) {
	        a01$2 = a[1],
	            a02$1 = a[2],
	            a03$1 = a[3];
	        a12$1 = a[6],
	            a13$1 = a[7];
	        a23$1 = a[11];
	        out[1] = a[4];
	        out[2] = a[8];
	        out[3] = a[12];
	        out[4] = a01$2;
	        out[6] = a[9];
	        out[7] = a[13];
	        out[8] = a02$1;
	        out[9] = a12$1;
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

	var Matrix4 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		UNIT_MATRIX4: UNIT_MATRIX4,
		create: create$3,
		determinant: determinant$2,
		from: from$2,
		fromEuler: fromEuler$1,
		fromQuaternion: fromQuaternion,
		fromRotation: fromRotation$2,
		fromRotationX: fromRotationX,
		fromRotationY: fromRotationY,
		fromRotationZ: fromRotationZ,
		fromScaling: fromScaling$2,
		fromTranslation: fromTranslation$1,
		identity: identity$2,
		invert: invert$2,
		lookAt: lookAt,
		multiply: multiply$2,
		orthogonal: orthogonal,
		perspective: perspective,
		rotate: rotate$2,
		rotateX: rotateX,
		rotateY: rotateY,
		rotateZ: rotateZ,
		scale: scale$2,
		targetTo: targetTo,
		translate: translate$1,
		transpose: transpose$2
	});

	class Matrix4Component extends Component {
	    constructor(name, data = Matrix4.create()) {
	        super(name, data);
	    }
	}

	class APosition3 extends Matrix4Component {
	    constructor(data = Matrix4.create()) {
	        super('position3', data);
	    }
	}

	class AProjection3 extends Matrix4Component {
	    constructor(data = Matrix4.create()) {
	        super('projection3', data);
	    }
	}

	class ARotation3 extends Matrix4Component {
	    constructor(data = Matrix4.create()) {
	        super('rotation3', data);
	    }
	}

	class AScale3 extends Matrix4Component {
	    constructor(data = Matrix4.create()) {
	        super('scale3', data);
	    }
	}

	class EuclidPosition3 extends APosition3 {
	    constructor(vec3 = new Float32Array(3)) {
	        super();
	        this.data = new Float32Array(16);
	        this.vec3 = vec3;
	        this.update();
	    }
	    get x() {
	        return this.vec3[0];
	    }
	    set x(value) {
	        this.vec3[0] = value;
	        this.update();
	    }
	    get y() {
	        return this.vec3[1];
	    }
	    set y(value) {
	        this.vec3[1] = value;
	        this.update();
	    }
	    get z() {
	        return this.vec3[1];
	    }
	    set z(value) {
	        this.vec3[2] = value;
	        this.update();
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
	        Matrix4.fromTranslation(this.vec3, this.data);
	        return this;
	    }
	}

	var EulerRotationOrders;
	(function (EulerRotationOrders) {
	    EulerRotationOrders["XYZ"] = "xyz";
	    EulerRotationOrders["ZXY"] = "zxy";
	    EulerRotationOrders["YZX"] = "yzx";
	    EulerRotationOrders["XZY"] = "xzy";
	    EulerRotationOrders["ZYX"] = "zyx";
	    EulerRotationOrders["YXZ"] = "yxz";
	})(EulerRotationOrders || (EulerRotationOrders = {}));

	const createDefault = () => {
	    return {
	        x: 0,
	        y: 0,
	        z: 0,
	        order: EulerRotationOrders.XYZ
	    };
	};
	const from = (euler, out = createDefault()) => {
	    out.x = euler.x;
	    out.y = euler.y;
	    out.z = euler.z;
	    out.order = euler.order;
	    return out;
	};

	let a00 = 0, a01 = 0, a02 = 0, a03 = 0, a11 = 0, a10 = 0, a12 = 0, a13 = 0, a20 = 0, a21 = 0, a22 = 0, a23 = 0, a31 = 0, a30 = 0, a32 = 0, a33 = 0;
	let b00 = 0, b01 = 0, b02 = 0, b03 = 0;
	let x = 0, y = 0, z = 0, a = 0, b = 0, c = 0, d = 0, e = 0, f = 0;
	const UNIT_MATRIX4_DATA = Object.freeze([
	    1, 0, 0, 0,
	    0, 1, 0, 0,
	    0, 0, 1, 0,
	    0, 0, 0, 1
	]);
	const create = () => {
	    return new Float32Array(UNIT_MATRIX4_DATA);
	};
	const fromEuler = (euler, out = new Float32Array(16)) => {
	    x = euler.x;
	    y = euler.y;
	    z = euler.z;
	    a = Math.cos(x), b = Math.sin(x);
	    c = Math.cos(y), d = Math.sin(y);
	    e = Math.cos(z), f = Math.sin(z);
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
	const identity = (out = new Float32Array(16)) => {
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
	const multiply = (a, b, out = new Float32Array(16)) => {
	    a00 = a[0],
	        a01 = a[1],
	        a02 = a[2],
	        a03 = a[3];
	    a10 = a[4],
	        a11 = a[5],
	        a12 = a[6],
	        a13 = a[7];
	    a20 = a[8],
	        a21 = a[9],
	        a22 = a[10],
	        a23 = a[11];
	    a30 = a[12],
	        a31 = a[13],
	        a32 = a[14],
	        a33 = a[15];
	    b00 = b[0],
	        b01 = b[1],
	        b02 = b[2],
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

	class EulerRotation3 extends ARotation3 {
	    constructor(euler = {
	        x: 0,
	        y: 0,
	        z: 0,
	        order: EulerRotationOrders.XYZ,
	    }) {
	        super();
	        this.data = new Float32Array(16);
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
	    set(arr) {
	        from(arr, this.euler);
	        return this.update();
	    }
	    update() {
	        fromEuler(this.euler, this.data);
	        return this;
	    }
	}

	class PerspectiveProjection extends AProjection3 {
	    constructor(fovy, aspect, near, far) {
	        super();
	        this.data = new Float32Array(16);
	        this.fovy = fovy;
	        this.aspect = aspect;
	        this.near = near;
	        this.far = far;
	        this.update();
	    }
	    get fovy() {
	        return this.fovy;
	    }
	    set fovy(value) {
	        this.fovy = value;
	        this.update();
	    }
	    get aspect() {
	        return this.aspect;
	    }
	    set aspect(value) {
	        this.aspect = value;
	        this.update();
	    }
	    get near() {
	        return this.near;
	    }
	    set near(value) {
	        this.near = value;
	        this.update();
	    }
	    get far() {
	        return this.far;
	    }
	    set far(value) {
	        this.far = value;
	        this.update();
	    }
	    set(fovy = this.fovy, aspect = this.aspect, near = this.near, far = this.far) {
	        this.fovy = fovy;
	        this.aspect = aspect;
	        this.near = near;
	        this.far = far;
	        return this.update();
	    }
	    update() {
	        Matrix4.perspective(this.fovy, this.aspect, this.near, this.far, this.data);
	        this.dirty = true;
	        return this;
	    }
	}

	class Vector3Scale3 extends AScale3 {
	    constructor(vec3) {
	        super();
	        this.data = new Float32Array(16);
	        this.vec3 = vec3;
	        this.update();
	    }
	    get x() {
	        return this.vec3[0];
	    }
	    set x(value) {
	        this.vec3[0] = value;
	        this.update();
	    }
	    get y() {
	        return this.vec3[1];
	    }
	    set y(value) {
	        this.vec3[1] = value;
	        this.update();
	    }
	    get z() {
	        return this.vec3[1];
	    }
	    set z(value) {
	        this.vec3[2] = value;
	        this.update();
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
	        Matrix4.fromScaling(this.vec3, this.data);
	        return this;
	    }
	}

	class Renderable extends Component {
	    constructor(renderType) {
	        super(Renderable.TAG_TEXT, renderType);
	    }
	}
	Renderable.TAG_TEXT = "Renderable";

	class Object3 extends Component {
	    constructor() {
	        super('object3', true);
	    }
	}

	const createJson = (r = 0, g = 0, b = 0, a = 1) => {
	    return {
	        r,
	        g,
	        b,
	        a
	    };
	};

	class Clearer {
	    constructor(engine, color = createJson()) {
	        var _a;
	        this.engine = engine;
	        this.color = color;
	        const depthTexture = (_a = engine.device) === null || _a === void 0 ? void 0 : _a.createTexture({
	            size: { width: engine.canvas.width, height: engine.canvas.height, depthOrArrayLayers: 1 },
	            format: "depth24plus-stencil8",
	            usage: GPUTextureUsage.RENDER_ATTACHMENT
	        });
	        this.renderPassDescriptor = {
	            colorAttachments: [
	                {
	                    attachment: null,
	                    loadValue: color
	                }
	            ],
	            depthStencilAttachment: {
	                attachment: depthTexture.createView(),
	                depthLoadValue: 1.0,
	                depthStoreOp: "store",
	                stencilLoadValue: 0,
	                stencilStoreOp: "store"
	            }
	        };
	    }
	    clear(commandEncoder, swapChain) {
	        const textureView = swapChain.getCurrentTexture().createView();
	        this.renderPassDescriptor.colorAttachments[0].attachment = textureView;
	        return commandEncoder.beginRenderPass(this.renderPassDescriptor);
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

	class MeshRenderer {
	    constructor(engine) {
	        this.renderTypes = "mesh";
	        this.entityCacheData = new WeakMap();
	        this.engine = engine;
	    }
	    render(mesh, camera, passEncoder, scissor) {
	        var _a;
	        let cacheData = this.entityCacheData.get(mesh);
	        if (!cacheData) {
	            cacheData = this.createCacheData(mesh);
	        }
	        passEncoder.setPipeline(cacheData.pipeline);
	        // passEncoder.setScissorRect(0, 0, 400, 225);
	        // TODO 有多个attribute buffer
	        passEncoder.setVertexBuffer(0, cacheData.attributesBuffer);
	        const mvp = identity();
	        // TODO 视图矩阵
	        multiply((_a = camera.getComponent("projection3")) === null || _a === void 0 ? void 0 : _a.data, create(), mvp);
	        multiply(mvp, cacheData.matrixM, mvp);
	        this.engine.device.queue.writeBuffer(cacheData.uniformBuffer, 0, mvp.buffer, mvp.byteOffset, mvp.byteLength);
	        passEncoder.setBindGroup(0, cacheData.uniformBindGroup);
	        passEncoder.draw(mesh.getComponent("projection3").count, 1, 0, 0);
	        return this;
	    }
	    createCacheData(mesh) {
	        var _a, _b, _c, _d;
	        let matrixT = ((_a = mesh.getComponent('position3')) === null || _a === void 0 ? void 0 : _a.data) || create();
	        let matrixR = ((_b = mesh.getComponent('rotation3')) === null || _b === void 0 ? void 0 : _b.data) || create();
	        let matrixS = ((_c = mesh.getComponent('scale3')) === null || _c === void 0 ? void 0 : _c.data) || create();
	        let matrixM = create();
	        multiply(matrixT, matrixR, matrixM);
	        multiply(matrixM, matrixS, matrixM);
	        let uniformBuffer = this.engine.device.createBuffer({
	            size: 4 * 16,
	            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
	        });
	        // TODO
	        let attributesBuffer = createVerticesBuffer(this.engine.device, (_d = mesh.getComponent('geometry3')) === null || _d === void 0 ? void 0 : _d.data);
	        let pipeline = this.createPipeline(mesh);
	        let uniformBindGroup = this.engine.device.createBindGroup({
	            layout: pipeline.getBindGroupLayout(0),
	            entries: [
	                {
	                    binding: 0,
	                    resource: {
	                        buffer: uniformBuffer,
	                    },
	                }
	            ],
	        });
	        return {
	            attributesBuffer,
	            matrixM,
	            uniformBuffer,
	            uniformBindGroup,
	            pipeline,
	        };
	    }
	    createPipeline(mesh) {
	        const pipelineLayout = this.engine.device.createPipelineLayout({
	            bindGroupLayouts: [this.createBindGroupLayout()],
	        });
	        let stages = this.createStages();
	        let geometry = mesh.getComponent('geometry3');
	        let pipeline = this.engine.device.createRenderPipeline({
	            layout: pipelineLayout,
	            vertexStage: stages[0],
	            fragmentStage: stages[1],
	            primitiveTopology: geometry.topology,
	            colorStates: [
	                {
	                    format: "bgra8unorm"
	                }
	            ],
	            depthStencilState: {
	                depthWriteEnabled: true,
	                depthCompare: 'less',
	                format: 'depth24plus-stencil8',
	            },
	            rasterizationState: {
	                cullMode: geometry.cullMode,
	            },
	            vertexState: {
	                vertexBuffers: {
	                    arrayStride: 6 * geometry.data[0].data.BYTES_PER_ELEMENT,
	                    attributes: [{
	                            shaderLocation: 0,
	                            offset: 0,
	                            format: "float32x3"
	                        }]
	                }
	            },
	        });
	        return pipeline;
	    }
	    createBindGroupLayout() {
	        return this.engine.device.createBindGroupLayout({
	            entries: [
	                {
	                    binding: 0,
	                    visibility: GPUShaderStage.VERTEX,
	                    type: 'uniform-buffer',
	                }
	            ],
	        });
	    }
	    createStages() {
	        let vertexStage = {
	            module: this.engine.device.createShaderModule({
	                code: ``,
	            }),
	            entryPoint: wgslShaders.vertex,
	        };
	        let fragmentStage = {
	            module: this.engine.device.createShaderModule({
	                code: ``,
	            }),
	            entryPoint: wgslShaders.fragment
	        };
	        return [vertexStage, fragmentStage];
	    }
	}
	const wgslShaders = {
	    vertex: `
		[[block]] struct Uniforms {
			[[offset(0)]] modelViewProjectionMatrix : mat4x4<f32>;
	  	};
	  	[[binding(0), group(0)]] var<uniform> uniforms : Uniforms;

		[[builtin(position)]] var<out> out_position : vec4<f32>;
		[[location(0)]] var<out> out_color : vec3<f32>;
		[[location(0)]] var<in> a_position : vec3<f32>;
		[[location(1)]] var<in> a_color : vec3<f32>;
		[[stage(vertex)]]
		fn main() -> void {
			out_position = uniforms.modelViewProjectionMatrix * vec4<f32>(a_position, 1.0);
			out_color = a_color;
			return;
		}
	`,
	    fragment: `
		[[location(0)]] var<out> fragColor : vec4<f32>;
		[[location(0)]] var<in> in_color : vec3<f32>;
		[[stage(fragment)]]
		fn main() -> void {
			fragColor = vec4<f32>(in_color, 1.0);
			return;
		}
	`
	};

	/**
	 * @class
	 * @classdesc 数字id生成器，用于生成递增id
	 * @param {number} [initValue = 0] 从几开始生成递增id
	 */
	class IdGenerator {
	    constructor(initValue = 0) {
	        this.value = this.initValue = initValue;
	    }
	    current() {
	        return this.value;
	    }
	    next() {
	        return ++this.value;
	    }
	    skip(value = 1) {
	        if (value < 1) {
	            value = 1;
	        }
	        this.value += value;
	        return ++this.value;
	    }
	}

	const IdGeneratorInstance = new IdGenerator();

	let weakMapTmp;
	class ASystem {
	    constructor(name, fitRule) {
	        this.id = IdGeneratorInstance.next();
	        this.isSystem = true;
	        this.name = "";
	        this.disabled = false;
	        this.loopTimes = 0;
	        this.entitySet = new WeakMap();
	        this.usedBy = [];
	        this.name = name;
	        this.queryRule = fitRule;
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
	        return this.queryRule(entity);
	    }
	    run(world, params = {}) {
	        var _a;
	        params.world = world;
	        if (world.entityManager) {
	            (_a = this.entitySet.get(world.entityManager)) === null || _a === void 0 ? void 0 : _a.forEach((item) => {
	                this.handle(item, params);
	            });
	        }
	        return this;
	    }
	}

	class RendererSystem extends ASystem {
	    constructor(engine, clearer) {
	        super("Render System", (entity) => {
	            var _a;
	            return (_a = entity.getComponent(Renderable.TAG_TEXT)) === null || _a === void 0 ? void 0 : _a.data;
	        });
	        this.engine = engine;
	        this.clearer = clearer || new Clearer(engine);
	        this.rendererMap = new Map();
	        this.swapChain = engine.context.configureSwapChain({
	            device: engine.device,
	            format: 'bgra8unorm',
	        });
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
	    }
	    handle(entity, params) {
	        var _a, _b;
	        // 根据不同类别进行渲染
	        (_b = this.rendererMap.get((_a = entity.getComponent(Renderable.TAG_TEXT)) === null || _a === void 0 ? void 0 : _a.data)) === null || _b === void 0 ? void 0 : _b.render(entity, params.camera, params.passEncoder);
	        return this;
	    }
	    setClearer(clearer) {
	        this.clearer = clearer;
	    }
	    run(world, params) {
	        let device = this.engine.device;
	        let commandEncoder = device.createCommandEncoder();
	        let passEncoder = this.clearer.clear(commandEncoder, this.swapChain);
	        super.run(world, Object.assign(Object.assign({}, params), { passEncoder }));
	        // finish
	        passEncoder.endPass();
	        device.queue.submit([commandEncoder.finish()]);
	        return this;
	    }
	}

	exports.APosition3 = APosition3;
	exports.AProjection3 = AProjection3;
	exports.ARotation3 = ARotation3;
	exports.AScale3 = AScale3;
	exports.Clearer = Clearer;
	exports.EuclidPosition3 = EuclidPosition3;
	exports.EulerRotation3 = EulerRotation3;
	exports.Geometry3 = Geometry3;
	exports.Matrix4Component = Matrix4Component;
	exports.MeshRenderer = MeshRenderer;
	exports.Object3 = Object3;
	exports.PerspectiveProjection = PerspectiveProjection;
	exports.RenderSystem = RendererSystem;
	exports.Renderable = Renderable;
	exports.Vector3Scale3 = Vector3Scale3;
	exports.WebGPUEngine = WebGPUEngine;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=Engine.js.map
