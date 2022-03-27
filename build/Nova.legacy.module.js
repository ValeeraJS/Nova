import EventDispatcher__default from '@valeera/eventdispatcher';
export * from '@valeera/eventdispatcher';
import IdGenerator from '@valeera/idgenerator';
import { Matrix4 } from '@valeera/mathx';
import * as mathx from '@valeera/mathx';
export { mathx as Mathx };
export * from '@valeera/x';

/*! *****************************************************************************
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
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

var EngineEvents;
(function (EngineEvents) {
    EngineEvents["INITED"] = "inited";
})(EngineEvents || (EngineEvents = {}));

var WebGPUEngine = /** @class */ (function (_super) {
    __extends(WebGPUEngine, _super);
    function WebGPUEngine(canvas) {
        if (canvas === void 0) { canvas = document.createElement("canvas"); }
        var _this = _super.call(this) || this;
        _this.inited = false;
        _this.canvas = canvas;
        WebGPUEngine.detect(canvas).then(function (_a) {
            var context = _a.context, adapter = _a.adapter, device = _a.device;
            _this.context = context;
            _this.adapter = adapter;
            _this.device = device;
            _this.inited = true;
            _this.preferredFormat = context.getPreferredFormat(adapter);
            _this.fire(EngineEvents.INITED, {
                eventKey: EngineEvents.INITED,
                target: _this
            });
        }).catch(function (error) {
            throw error;
        });
        return _this;
    }
    WebGPUEngine.detect = function (canvas) {
        var _a;
        if (canvas === void 0) { canvas = document.createElement("canvas"); }
        return __awaiter(this, void 0, void 0, function () {
            var context, adapter, device;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        context = canvas.getContext("webgpu");
                        if (!context) {
                            throw new Error('WebGPU not supported: ');
                        }
                        return [4 /*yield*/, ((_a = navigator === null || navigator === void 0 ? void 0 : navigator.gpu) === null || _a === void 0 ? void 0 : _a.requestAdapter())];
                    case 1:
                        adapter = _b.sent();
                        if (!adapter) {
                            throw new Error('WebGPU not supported: ');
                        }
                        return [4 /*yield*/, adapter.requestDevice()];
                    case 2:
                        device = _b.sent();
                        if (!device) {
                            throw new Error('WebGPU not supported: ');
                        }
                        return [2 /*return*/, { context: context, adapter: adapter, device: device }];
                }
            });
        });
    };
    WebGPUEngine.prototype.createRenderer = function () {
    };
    WebGPUEngine.Events = EngineEvents;
    return WebGPUEngine;
}(EventDispatcher__default));

var WebGLEngine = /** @class */ (function (_super) {
    __extends(WebGLEngine, _super);
    function WebGLEngine(canvas) {
        if (canvas === void 0) { canvas = document.createElement("canvas"); }
        var _this = _super.call(this) || this;
        _this.inited = false;
        _this.canvas = canvas;
        WebGLEngine.detect(canvas).then(function (_a) {
            var context = _a.context;
            _this.context = context;
            _this.inited = true;
            _this.fire(EngineEvents.INITED, {
                eventKey: EngineEvents.INITED,
                target: _this
            });
        }).catch(function (error) {
            throw error;
        });
        return _this;
    }
    WebGLEngine.detect = function (canvas) {
        if (canvas === void 0) { canvas = document.createElement("canvas"); }
        return __awaiter(this, void 0, void 0, function () {
            var context;
            return __generator(this, function (_a) {
                context = canvas.getContext("webgl");
                if (!context) {
                    throw new Error('WebGL not supported: ');
                }
                return [2 /*return*/, { context: context }];
            });
        });
    };
    WebGLEngine.prototype.createRenderer = function () {
    };
    return WebGLEngine;
}(EventDispatcher__default));

var Component = /** @class */ (function () {
    function Component(name, data) {
        if (data === void 0) { data = null; }
        this.isComponent = true;
        this.data = null;
        this.disabled = false;
        this.usedBy = [];
        this.dirty = false;
        this.name = name;
        this.data = data;
    }
    Component.prototype.clone = function () {
        return new Component(this.name, this.data);
    };
    return Component;
}());

var GEOMETRY_3D = "geometry3";
var MATERIAL = "material";
var MODEL_3D = "model3";
var PROJECTION_3D = "projection3";
var ROTATION_3D = "rotation3";
var SCALING_3D = "scale3";
var TRANSLATION_3D = "position3";
var VIEWING_3D = "viewing3";

var constants$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	GEOMETRY_3D: GEOMETRY_3D,
	MATERIAL: MATERIAL,
	MODEL_3D: MODEL_3D,
	PROJECTION_3D: PROJECTION_3D,
	ROTATION_3D: ROTATION_3D,
	SCALING_3D: SCALING_3D,
	TRANSLATION_3D: TRANSLATION_3D,
	VIEWING_3D: VIEWING_3D
});

var Geometry3 = /** @class */ (function (_super) {
    __extends(Geometry3, _super);
    function Geometry3(count, topology, cullMode, data) {
        if (count === void 0) { count = 0; }
        if (topology === void 0) { topology = "triangle-list"; }
        if (cullMode === void 0) { cullMode = "none"; }
        if (data === void 0) { data = []; }
        var _this = _super.call(this, GEOMETRY_3D, data) || this;
        _this.data = [];
        _this.count = count;
        _this.topology = topology;
        _this.cullMode = cullMode;
        return _this;
    }
    Geometry3.prototype.addAttribute = function (name, arr, stride, attributes) {
        if (stride === void 0) { stride = arr.length / this.count; }
        if (attributes === void 0) { attributes = []; }
        stride = Math.floor(stride);
        if (stride * this.count < arr.length) {
            throw new Error('not fit the geometry');
        }
        if (!attributes.length) {
            attributes.push({
                name: name,
                offset: 0,
                length: stride
            });
        }
        this.data.push({
            name: name,
            data: arr,
            stride: stride,
            attributes: attributes
        });
        this.dirty = true;
    };
    return Geometry3;
}(Component));

var POSITION = "position";
var VERTICES = "vertices";
var VERTICES_COLOR = "vertices_color";
var NORMAL = "normal";
var INDEX = "index";
var UV = "uv";

var constants = /*#__PURE__*/Object.freeze({
	__proto__: null,
	POSITION: POSITION,
	VERTICES: VERTICES,
	VERTICES_COLOR: VERTICES_COLOR,
	NORMAL: NORMAL,
	INDEX: INDEX,
	UV: UV
});

var DEFAULT_OPTIONS = {
    hasNormal: true,
    hasUV: true,
    hasIndices: false,
    combine: true,
    topology: "triangle-list",
    cullMode: "none"
};

var DEFAULT_CIRCLE_OPTIONS = __assign(__assign({}, DEFAULT_OPTIONS), { hasIndices: true, combine: true, segments: 32, angleStart: 0, angle: Math.PI * 2, radius: 1 });
var createCircle3 = (function (options) {
    if (options === void 0) { options = DEFAULT_CIRCLE_OPTIONS; }
    var stride = 3;
    var indices = [];
    var positions = [0, 0, 0];
    var normals = [0, 0, 1];
    var uvs = [0.5, 0.5];
    var segments = options.segments, angleStart = options.angleStart, angle = options.angle, radius = options.radius;
    for (var s = 0, i = 3; s <= segments; s++, i += 3) {
        var segment = angleStart + s / segments * angle;
        positions.push(radius * Math.cos(segment), radius * Math.sin(segment), 0);
        normals.push(0, 0, 1);
        uvs.push((positions[i] / radius + 1) / 2, (positions[i + 1] / radius + 1) / 2);
    }
    // indices
    for (var i = 1; i <= segments; i++) {
        indices.push(i, i + 1, 0);
    }
    var len = indices.length, i3 = 0, strideI = 0, i2 = 0;
    // let count = len / 3;
    var geo = new Geometry3(len, options.topology, options.cullMode);
    console.log(indices, positions, normals, uvs);
    // TODO indices 现在都是非索引版本
    if (options.combine) {
        var pickers = [{
                name: POSITION,
                offset: 0,
                length: 3,
            }];
        if (options.hasNormal && options.hasUV) {
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
        else if (options.hasNormal) {
            stride = 6;
            pickers.push({
                name: 'normal',
                offset: 3,
                length: 3,
            });
        }
        else if (options.hasUV) {
            stride = 5;
            pickers.push({
                name: 'uv',
                offset: 3,
                length: 2,
            });
        }
        var result = new Float32Array(stride * len);
        for (var i = 0; i < len; i++) {
            i2 = indices[i] << 1;
            i3 = indices[i] * 3;
            strideI = i * stride;
            result[0 + strideI] = positions[i3];
            result[1 + strideI] = positions[i3 + 1];
            result[2 + strideI] = positions[i3 + 2];
            if (options.hasNormal) {
                result[3 + strideI] = normals[i3];
                result[4 + strideI] = normals[i3 + 1];
                result[5 + strideI] = normals[i3 + 2];
                if (options.hasUV) {
                    result[6 + strideI] = uvs[i2];
                    result[7 + strideI] = uvs[i2 + 1];
                }
            }
            else if (options.hasUV) {
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
});

var DEFAULT_PLANE_OPTIONS = __assign(__assign({}, DEFAULT_OPTIONS), { hasIndices: true, combine: true, segmentX: 1, segmentY: 1 });
var createPlane3 = (function (width, height, options) {
    if (width === void 0) { width = 1; }
    if (height === void 0) { height = 1; }
    if (options === void 0) { options = DEFAULT_PLANE_OPTIONS; }
    var stride = 3;
    var halfX = width * 0.5;
    var halfY = height * 0.5;
    var gridX = Math.max(1, Math.round(options.segmentX));
    var gridY = Math.max(1, Math.round(options.segmentY));
    var gridX1 = gridX + 1;
    var gridY1 = gridY + 1;
    var segmentWidth = width / gridX;
    var segmentHeight = height / gridY;
    var indices = [];
    var positions = [];
    var normals = [];
    var uvs = [];
    for (var iy = 0; iy < gridY1; iy++) {
        var y = iy * segmentHeight - halfY;
        for (var ix = 0; ix < gridX1; ix++) {
            var x = ix * segmentWidth - halfX;
            positions.push(x, -y, 0);
            normals.push(0, 0, 1);
            uvs.push(ix / gridX);
            uvs.push(iy / gridY);
        }
    }
    for (var iy = 0; iy < gridY; iy++) {
        for (var ix = 0; ix < gridX; ix++) {
            var a = ix + gridX1 * iy;
            var b = ix + gridX1 * (iy + 1);
            var c = (ix + 1) + gridX1 * (iy + 1);
            var d = (ix + 1) + gridX1 * iy;
            indices.push(a, b, d);
            indices.push(b, c, d);
        }
    }
    var len = indices.length, i3 = 0, strideI = 0, i2 = 0;
    // let count = len / 3;
    var geo = new Geometry3(len, options.topology, options.cullMode);
    console.log(indices, positions, normals, uvs);
    // TODO indices 现在都是非索引版本
    if (options.combine) {
        var pickers = [{
                name: POSITION,
                offset: 0,
                length: 3,
            }];
        if (options.hasNormal && options.hasUV) {
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
        else if (options.hasNormal) {
            stride = 6;
            pickers.push({
                name: 'normal',
                offset: 3,
                length: 3,
            });
        }
        else if (options.hasUV) {
            stride = 5;
            pickers.push({
                name: 'uv',
                offset: 3,
                length: 2,
            });
        }
        var result = new Float32Array(stride * len);
        for (var i = 0; i < len; i++) {
            i2 = indices[i] << 1;
            i3 = indices[i] * 3;
            strideI = i * stride;
            result[0 + strideI] = positions[i3];
            result[1 + strideI] = positions[i3 + 1];
            result[2 + strideI] = positions[i3 + 2];
            if (options.hasNormal) {
                result[3 + strideI] = normals[i3];
                result[4 + strideI] = normals[i3 + 1];
                result[5 + strideI] = normals[i3 + 2];
                if (options.hasUV) {
                    result[6 + strideI] = uvs[i2];
                    result[7 + strideI] = uvs[i2 + 1];
                }
            }
            else if (options.hasUV) {
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
        console.log(geo);
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
});

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
var clamp = (function (val, min, max) {
    return Math.max(min, Math.min(max, val));
});

var ax, ay, az, bx, by, bz;
var create$1 = function (x, y, z, out) {
    if (x === void 0) { x = 0; }
    if (y === void 0) { y = 0; }
    if (z === void 0) { z = 0; }
    if (out === void 0) { out = new Float32Array(3); }
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
};
var cross = function (a, b, out) {
    if (out === void 0) { out = new Float32Array(3); }
    ax = a[0];
    ay = a[1];
    az = a[2];
    bx = b[0];
    by = b[1];
    bz = b[2];
    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
};
var divideScalar = function (a, b, out) {
    if (out === void 0) { out = new Float32Array(3); }
    out[0] = a[0] / b;
    out[1] = a[1] / b;
    out[2] = a[2] / b;
    return out;
};
var length = function (a) {
    return Math.sqrt(lengthSquared(a));
};
var lengthSquared = function (a) {
    return a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
};
var minus = function (a, b, out) {
    if (out === void 0) { out = new Float32Array(3); }
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
};
var normalize = function (a, out) {
    if (out === void 0) { out = new Float32Array(3); }
    return divideScalar(a, length(a) || 1, out);
};

var defaultA = [-1, -1, 0];
var defaultB = [1, -1, 0];
var defaultC = [0, 1, 0];
var ab = new Float32Array(3);
var bc = new Float32Array(3);
var create = function (a, b, c) {
    if (a === void 0) { a = new Float32Array(defaultA); }
    if (b === void 0) { b = new Float32Array(defaultB); }
    if (c === void 0) { c = new Float32Array(defaultC); }
    return { a: a, b: b, c: c };
};
var normal = function (t, out) {
    if (out === void 0) { out = create$1(); }
    minus(t.c, t.b, bc);
    minus(t.b, t.a, ab);
    cross(ab, bc, out);
    return normalize(out);
};

var createTriangle3 = (function (t, options, topology, cullMode) {
    if (t === void 0) { t = create(); }
    if (options === void 0) { options = DEFAULT_OPTIONS; }
    if (topology === void 0) { topology = "triangle-list"; }
    if (cullMode === void 0) { cullMode = "none"; }
    var geo = new Geometry3(3, topology, cullMode);
    var stride = 3;
    if (options.combine) {
        var pickers = [{
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
        var result = new Float32Array(stride * 3);
        result.set(t.a);
        result.set(t.b, stride);
        result.set(t.c, stride + stride);
        if (options.hasNormal) {
            var normal$1 = normal(t);
            result.set(normal$1, 3);
            result.set(normal$1, stride + 3);
            result.set(normal$1, stride + stride + 3);
            pickers.push({
                name: 'normal',
                offset: 3,
                length: 3,
            });
        }
        if (options.hasUV) {
            var offset = options.hasNormal ? 6 : 3;
            result.set([0, 1], offset);
            result.set([1, 1], stride + offset);
            result.set([0.5, 0], stride + stride + offset);
            pickers.push({
                name: UV,
                offset: offset,
                length: 2,
            });
        }
        geo.addAttribute(VERTICES, result, stride, pickers);
        return geo;
    }
    else {
        var result = new Float32Array(9);
        result.set(t.a);
        result.set(t.b, 3);
        result.set(t.c, 6);
        geo.addAttribute(POSITION, result, 3);
        if (options.hasNormal) {
            result = new Float32Array(9);
            var normal$1 = normal(t);
            result.set(normal$1, 0);
            result.set(normal$1, 3);
            result.set(normal$1, 6);
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
});

var index$2 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	createCircle3: createCircle3,
	createPlane3: createPlane3,
	createTriangle3: createTriangle3
});

var IdGeneratorInstance = new IdGenerator();

var weakMapTmp;
var ASystem = /** @class */ (function () {
    function ASystem(name, fitRule) {
        if (name === void 0) { name = ""; }
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
    ASystem.prototype.checkUpdatedEntities = function (manager) {
        var _this = this;
        if (manager) {
            weakMapTmp = this.entitySet.get(manager);
            if (!weakMapTmp) {
                weakMapTmp = new Set();
                this.entitySet.set(manager, weakMapTmp);
            }
            manager.updatedEntities.forEach(function (item) {
                if (_this.query(item)) {
                    weakMapTmp.add(item);
                }
                else {
                    weakMapTmp.delete(item);
                }
            });
        }
        return this;
    };
    ASystem.prototype.checkEntityManager = function (manager) {
        var _this = this;
        if (manager) {
            weakMapTmp = this.entitySet.get(manager);
            if (!weakMapTmp) {
                weakMapTmp = new Set();
                this.entitySet.set(manager, weakMapTmp);
            }
            else {
                weakMapTmp.clear();
            }
            manager.elements.forEach(function (item) {
                if (_this.query(item)) {
                    weakMapTmp.add(item);
                }
                else {
                    weakMapTmp.delete(item);
                }
            });
        }
        return this;
    };
    ASystem.prototype.query = function (entity) {
        return this.queryRule(entity);
    };
    ASystem.prototype.run = function (world) {
        var _this = this;
        var _a;
        if (world.entityManager) {
            (_a = this.entitySet.get(world.entityManager)) === null || _a === void 0 ? void 0 : _a.forEach(function (item) {
                _this.handle(item, world.store);
            });
        }
        return this;
    };
    return ASystem;
}());

// 私有全局变量，外部无法访问
var componentTmp;
var EComponentEvent;
(function (EComponentEvent) {
    EComponentEvent["ADD_COMPONENT"] = "addComponent";
    EComponentEvent["REMOVE_COMPONENT"] = "removeComponent";
})(EComponentEvent || (EComponentEvent = {}));
var ComponentManager = /** @class */ (function () {
    function ComponentManager() {
        this.elements = new Map();
        this.disabled = false;
        this.usedBy = [];
        this.isComponentManager = true;
    }
    ComponentManager.prototype.add = function (component) {
        if (this.has(component)) {
            this.removeByInstance(component);
        }
        return this.addComponentDirect(component);
    };
    ComponentManager.prototype.addComponentDirect = function (component) {
        this.elements.set(component.name, component);
        component.usedBy.push(this);
        ComponentManager.eventObject = {
            component: component,
            eventKey: ComponentManager.ADD_COMPONENT,
            manager: this,
            target: component
        };
        this.entityComponentChangeDispatch(ComponentManager.ADD_COMPONENT, ComponentManager.eventObject);
        return this;
    };
    ComponentManager.prototype.clear = function () {
        this.elements.clear();
        return this;
    };
    ComponentManager.prototype.get = function (name) {
        componentTmp = this.elements.get(name);
        return componentTmp ? componentTmp : null;
    };
    ComponentManager.prototype.has = function (component) {
        if (typeof component === "string") {
            return this.elements.has(component);
        }
        else {
            return this.elements.has(component.name);
        }
    };
    // TODO
    ComponentManager.prototype.isMixedFrom = function (componentManager) {
        console.log(componentManager);
        return false;
    };
    // TODO
    ComponentManager.prototype.mixFrom = function (componentManager) {
        console.log(componentManager);
        return this;
    };
    ComponentManager.prototype.remove = function (component) {
        return typeof component === "string"
            ? this.removeByName(component)
            : this.removeByInstance(component);
    };
    ComponentManager.prototype.removeByName = function (name) {
        componentTmp = this.elements.get(name);
        if (componentTmp) {
            this.elements.delete(name);
            componentTmp.usedBy.splice(componentTmp.usedBy.indexOf(this), 1);
            ComponentManager.eventObject = {
                component: componentTmp,
                eventKey: ComponentManager.REMOVE_COMPONENT,
                manager: this,
                target: componentTmp
            };
            this.entityComponentChangeDispatch(ComponentManager.REMOVE_COMPONENT, ComponentManager.eventObject);
        }
        return this;
    };
    ComponentManager.prototype.removeByInstance = function (component) {
        if (this.elements.has(component.name)) {
            this.elements.delete(component.name);
            component.usedBy.splice(component.usedBy.indexOf(this), 1);
            ComponentManager.eventObject = {
                component: component,
                eventKey: ComponentManager.REMOVE_COMPONENT,
                manager: this,
                target: component
            };
            this.entityComponentChangeDispatch(ComponentManager.REMOVE_COMPONENT, ComponentManager.eventObject);
        }
        return this;
    };
    ComponentManager.prototype.entityComponentChangeDispatch = function (type, eventObject) {
        var e_1, _a, e_2, _b;
        try {
            for (var _c = __values(this.usedBy), _d = _c.next(); !_d.done; _d = _c.next()) {
                var entity = _d.value;
                entity.fire(type, eventObject);
                try {
                    for (var _e = (e_2 = void 0, __values(entity.usedBy)), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var manager = _f.value;
                        manager.updatedEntities.add(entity);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    ComponentManager.ADD_COMPONENT = EComponentEvent.ADD_COMPONENT;
    ComponentManager.REMOVE_COMPONENT = EComponentEvent.REMOVE_COMPONENT;
    ComponentManager.eventObject = {
        component: null,
        eventKey: null,
        manager: null,
        target: null
    };
    return ComponentManager;
}());

var arr;
var Entity = /** @class */ (function (_super) {
    __extends(Entity, _super);
    function Entity(name, componentManager) {
        if (name === void 0) { name = ""; }
        var _this = _super.call(this) || this;
        _this.id = IdGeneratorInstance.next();
        _this.isEntity = true;
        _this.componentManager = null;
        _this.name = "";
        _this.usedBy = [];
        _this.name = name;
        _this.registerComponentManager(componentManager);
        return _this;
    }
    Entity.prototype.addComponent = function (component) {
        if (this.componentManager) {
            this.componentManager.add(component);
        }
        else {
            throw new Error("Current entity hasn't registered a component manager yet.");
        }
        return this;
    };
    Entity.prototype.addTo = function (manager) {
        manager.add(this);
        return this;
    };
    Entity.prototype.addToWorld = function (world) {
        if (world.entityManager) {
            world.entityManager.add(this);
        }
        return this;
    };
    Entity.prototype.getComponent = function (name) {
        return this.componentManager ? this.componentManager.get(name) : null;
    };
    Entity.prototype.hasComponent = function (component) {
        return this.componentManager ? this.componentManager.has(component) : false;
    };
    Entity.prototype.registerComponentManager = function (manager) {
        if (manager === void 0) { manager = new ComponentManager(); }
        this.unregisterComponentManager();
        this.componentManager = manager;
        if (!this.componentManager.usedBy.includes(this)) {
            this.componentManager.usedBy.push(this);
        }
        return this;
    };
    Entity.prototype.removeComponent = function (component) {
        if (this.componentManager) {
            this.componentManager.remove(component);
        }
        return this;
    };
    Entity.prototype.unregisterComponentManager = function () {
        if (this.componentManager) {
            arr = this.componentManager.usedBy;
            arr.splice(arr.indexOf(this) - 1, 1);
            this.componentManager = null;
        }
        return this;
    };
    return Entity;
}(EventDispatcher__default));

var systemTmp;
var ESystemEvent;
(function (ESystemEvent) {
    ESystemEvent["BEFORE_RUN"] = "beforeRun";
    ESystemEvent["AFTER_RUN"] = "afterRun";
})(ESystemEvent || (ESystemEvent = {}));
/** @class */ ((function (_super) {
    __extends(SystemManager, _super);
    function SystemManager(world) {
        var _this = _super.call(this) || this;
        _this.disabled = false;
        _this.elements = new Map();
        _this.loopTimes = 0;
        _this.usedBy = [];
        if (world) {
            _this.usedBy.push(world);
        }
        return _this;
    }
    SystemManager.prototype.add = function (system) {
        if (this.elements.has(system.name)) {
            return this;
        }
        this.elements.set(system.name, system);
        this.updateSystemEntitySetByAddFromManager(system);
        return this;
    };
    SystemManager.prototype.clear = function () {
        this.elements.clear();
        return this;
    };
    SystemManager.prototype.get = function (name) {
        systemTmp = this.elements.get(name);
        return systemTmp ? systemTmp : null;
    };
    SystemManager.prototype.has = function (element) {
        if (typeof element === "string") {
            return this.elements.has(element);
        }
        else {
            return this.elements.has(element.name);
        }
    };
    SystemManager.prototype.remove = function (system) {
        return typeof system === "string"
            ? this.removeByName(system)
            : this.removeByInstance(system);
    };
    SystemManager.prototype.removeByName = function (name) {
        systemTmp = this.elements.get(name);
        if (systemTmp) {
            this.elements.delete(name);
            this.updateSystemEntitySetByRemovedFromManager(systemTmp);
            systemTmp.usedBy.splice(systemTmp.usedBy.indexOf(this), 1);
        }
        return this;
    };
    SystemManager.prototype.removeByInstance = function (system) {
        if (this.elements.has(system.name)) {
            this.elements.delete(system.name);
            this.updateSystemEntitySetByRemovedFromManager(system);
            system.usedBy.splice(system.usedBy.indexOf(this), 1);
        }
        return this;
    };
    SystemManager.prototype.run = function (world) {
        SystemManager.eventObject.eventKey = SystemManager.BEFORE_RUN;
        SystemManager.eventObject.manager = this;
        this.fire(SystemManager.BEFORE_RUN, SystemManager.eventObject);
        this.elements.forEach(function (item) {
            item.checkUpdatedEntities(world.entityManager);
            item.run(world);
        });
        if (world.entityManager) {
            world.entityManager.updatedEntities.clear();
        }
        this.loopTimes++;
        SystemManager.eventObject.eventKey = SystemManager.AFTER_RUN;
        this.fire(SystemManager.BEFORE_RUN, SystemManager.eventObject);
        return this;
    };
    SystemManager.prototype.updateSystemEntitySetByRemovedFromManager = function (system) {
        var e_1, _a;
        try {
            for (var _b = __values(this.usedBy), _c = _b.next(); !_c.done; _c = _b.next()) {
                var item = _c.value;
                if (item.entityManager) {
                    system.entitySet.delete(item.entityManager);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return this;
    };
    SystemManager.prototype.updateSystemEntitySetByAddFromManager = function (system) {
        var e_2, _a;
        try {
            for (var _b = __values(this.usedBy), _c = _b.next(); !_c.done; _c = _b.next()) {
                var item = _c.value;
                if (item.entityManager) {
                    system.checkEntityManager(item.entityManager);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return this;
    };
    SystemManager.AFTER_RUN = ESystemEvent.AFTER_RUN;
    SystemManager.BEFORE_RUN = ESystemEvent.BEFORE_RUN;
    SystemManager.eventObject = {
        eventKey: null,
        manager: null,
        target: null
    };
    return SystemManager;
})(EventDispatcher__default));

var wgslShaders$2 = {
    vertex: "\n\t\tstruct Uniforms {\n\t\t\tmodelViewProjectionMatrix : mat4x4<f32>;\n\t  \t};\n\t  \t@binding(0) @group(0) var<uniform> uniforms : Uniforms;\n\n\t\tstruct VertexOutput {\n\t\t\t@builtin(position) position : vec4<f32>;\n\t\t};\n\n\t\t@stage(vertex) fn main(@location(0) position : vec3<f32>) -> VertexOutput {\n\t\t\tvar out: VertexOutput;\n\t\t\tout.position = uniforms.modelViewProjectionMatrix * vec4<f32>(position, 1.0);\n\t\t\treturn out;\n\t\t}\n\t",
    fragment: "\n\t\tstruct Uniforms {\n\t\t\tcolor : vec4<f32>;\n\t  \t};\n\t  \t@binding(1) @group(0) var<uniform> uniforms : Uniforms;\n\n\t\t@stage(fragment) fn main() -> @location(0) vec4<f32> {\n\t\t\treturn uniforms.color;\n\t\t}\n\t"
};
var ColorMaterial = /** @class */ (function (_super) {
    __extends(ColorMaterial, _super);
    function ColorMaterial(color) {
        if (color === void 0) { color = new Float32Array([1, 1, 1, 1]); }
        var _this = _super.call(this, "material", __assign(__assign({}, wgslShaders$2), { uniforms: [{
                    name: "color",
                    value: color,
                    binding: 1,
                    dirty: true,
                    type: "uniform-buffer",
                    buffer: {
                        type: "",
                    }
                }] })) || this;
        _this.dirty = true;
        return _this;
    }
    ColorMaterial.prototype.setColor = function (r, g, b, a) {
        if (this.data) {
            this.data.uniforms[0].value[0] = r;
            this.data.uniforms[0].value[1] = g;
            this.data.uniforms[0].value[2] = b;
            this.data.uniforms[0].value[3] = a;
            this.data.uniforms[0].dirty = true;
        }
        return this;
    };
    return ColorMaterial;
}(Component));

var vertexShader$1 = "\nstruct Uniforms {\n\tmodelViewProjectionMatrix : mat4x4<f32>;\n};\n\n@binding(0) @group(0) var<uniform> uniforms : Uniforms;\n\nstruct VertexOutput {\n\t@builtin(position) position : vec4<f32>;\n\t@location(0) depth : vec2<f32>;\n};\n\n@stage(vertex) fn main(@location(0) position : vec3<f32>) -> VertexOutput {\n\tvar out: VertexOutput;\n\tout.position = uniforms.modelViewProjectionMatrix * vec4<f32>(position, 1.0);\n\tout.depth = vec2<f32>(out.position.z, out.position.w);\n\treturn out;\n}";
var fragmentShader$1 = "\n@stage(fragment) fn main(@location(0) depth : vec2<f32>) -> @location(0) vec4<f32> {\n\tvar fragCoordZ: f32 = (depth.x / depth.y);\n\treturn vec4<f32>(fragCoordZ, fragCoordZ, fragCoordZ, 1.0);\n}";
var NormalMaterial$1 = /** @class */ (function (_super) {
    __extends(NormalMaterial, _super);
    function NormalMaterial() {
        var _this = _super.call(this, "material", {
            vertex: vertexShader$1,
            fragment: fragmentShader$1,
            uniforms: []
        }) || this;
        _this.dirty = true;
        return _this;
    }
    return NormalMaterial;
}(Component));

var vertexShader = "\nstruct Uniforms {\n\tmodelViewProjectionMatrix : mat4x4<f32>;\n};\n@binding(0) @group(0) var<uniform> uniforms : Uniforms;\n\nstruct VertexOutput {\n\t@builtin(position) position : vec4<f32>;\n\t@location(0) normal : vec4<f32>;\n};\n\n@stage(vertex) fn main(@location(0) position : vec3<f32>, @location(1) normal : vec3<f32>) -> VertexOutput {\n\tvar out: VertexOutput;\n\tout.position = uniforms.modelViewProjectionMatrix * vec4<f32>(position, 1.0);\n\tout.normal = abs(normalize(uniforms.modelViewProjectionMatrix * vec4<f32>(normal, 0.0)));\n\treturn out;\n}";
var fragmentShader = "\n@stage(fragment) fn main(@location(0) normal : vec4<f32>) -> @location(0) vec4<f32> {\n\treturn vec4<f32>(normal.x, normal.y, normal.z, 1.0);\n}";
var NormalMaterial = /** @class */ (function (_super) {
    __extends(NormalMaterial, _super);
    function NormalMaterial() {
        var _this = _super.call(this, "material", {
            vertex: vertexShader,
            fragment: fragmentShader,
            uniforms: []
        }) || this;
        _this.dirty = true;
        return _this;
    }
    return NormalMaterial;
}(Component));

var ShaderMaterial = /** @class */ (function (_super) {
    __extends(ShaderMaterial, _super);
    function ShaderMaterial(vertex, fragment, uniforms) {
        if (uniforms === void 0) { uniforms = []; }
        var _this = _super.call(this, "material", { vertex: vertex, fragment: fragment, uniforms: uniforms }) || this;
        _this.dirty = true;
        return _this;
    }
    return ShaderMaterial;
}(Component));

var Sampler = /** @class */ (function (_super) {
    __extends(Sampler, _super);
    function Sampler(option) {
        if (option === void 0) { option = {}; }
        var _this = _super.call(this, "sampler", option) || this;
        _this.data = {
            minFilter: 'linear',
            magFilter: 'linear',
        };
        _this.dirty = true;
        return _this;
    }
    Sampler.prototype.setAddressMode = function (u, v, w) {
        this.data.addressModeU = u;
        this.data.addressModeV = v;
        this.data.addressModeW = w;
        this.dirty = true;
        return this;
    };
    Sampler.prototype.setFilterMode = function (mag, min, mipmap) {
        this.data.magFilter = mag;
        this.data.minFilter = min;
        this.data.mipmapFilter = mipmap;
        this.dirty = true;
        return this;
    };
    Sampler.prototype.setLodClamp = function (min, max) {
        this.data.lodMaxClamp = max;
        this.data.lodMinClamp = min;
        return this;
    };
    Sampler.prototype.setMaxAnisotropy = function (v) {
        this.data.maxAnisotropy = v;
        return this;
    };
    Sampler.prototype.setCompare = function (v) {
        this.data.compare = v;
        return this;
    };
    return Sampler;
}(Component));

var wgslShaders$1 = {
    vertex: "\n\t\tstruct Uniforms {\n\t\t\t matrix : mat4x4<f32>;\n\t  \t};\n\t  \t@binding(0) @group(0) var<uniform> uniforms : Uniforms;\n\n\t\tstruct VertexOutput {\n\t\t\t@builtin(position) position : vec4<f32>;\n\t\t\t@location(0) uv : vec2<f32>;\n\t\t};\n\n\t\t@stage(vertex) fn main(@location(0) position : vec3<f32>, @location(2) uv : vec2<f32>) -> VertexOutput {\n\t\t\tvar out: VertexOutput;\n\t\t\tout.position = uniforms.matrix * vec4<f32>(position, 1.0);\n\t\t\tout.uv = uv;\n\t\t\treturn out;\n\t\t}\n\t",
    fragment: "\n\t\t@binding(1) @group(0) var mySampler: sampler;\n\t\t@binding(2) @group(0) var myTexture: texture_2d<f32>;\n\n\t\t@stage(fragment) fn main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {\n\t\t\treturn textureSample(myTexture, mySampler, uv);\n\t\t}\n\t"
};
var TextureMaterial = /** @class */ (function (_super) {
    __extends(TextureMaterial, _super);
    function TextureMaterial(texture, sampler) {
        if (sampler === void 0) { sampler = new Sampler(); }
        var _this = _super.call(this, "material", __assign(__assign({}, wgslShaders$1), { uniforms: [
                {
                    name: "mySampler",
                    type: "sampler",
                    value: sampler,
                    binding: 1,
                    dirty: true
                },
                {
                    name: "myTexture",
                    type: "sampled-texture",
                    value: texture,
                    binding: 2,
                    dirty: true
                }
            ] })) || this;
        _this.dirty = true;
        return _this;
    }
    Object.defineProperty(TextureMaterial.prototype, "sampler", {
        get: function () {
            return this.data.uniforms[0].value;
        },
        set: function (sampler) {
            this.data.uniforms[0].dirty = this.dirty = true;
            this.data.uniforms[0].value = sampler;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextureMaterial.prototype, "texture", {
        get: function () {
            return this.data.uniforms[1].value;
        },
        set: function (texture) {
            this.data.uniforms[1].dirty = this.dirty = true;
            this.data.uniforms[1].value = texture;
        },
        enumerable: false,
        configurable: true
    });
    TextureMaterial.prototype.setTextureAndSampler = function (texture, sampler) {
        this.texture = texture;
        if (sampler) {
            this.sampler = sampler;
        }
        return this;
    };
    return TextureMaterial;
}(Component));

var Matrix4Component = /** @class */ (function (_super) {
    __extends(Matrix4Component, _super);
    function Matrix4Component(name, data) {
        if (data === void 0) { data = Matrix4.create(); }
        var _this = _super.call(this, name, data) || this;
        _this.dirty = true;
        return _this;
    }
    return Matrix4Component;
}(Component));
var updateModelMatrixComponent = function (mesh) {
    var p3 = mesh.getComponent(TRANSLATION_3D);
    var r3 = mesh.getComponent(ROTATION_3D);
    var s3 = mesh.getComponent(SCALING_3D);
    var m3 = mesh.getComponent(MODEL_3D);
    if (!m3) {
        m3 = new Matrix4Component(MODEL_3D);
        mesh.addComponent(m3);
    }
    if ((p3 === null || p3 === void 0 ? void 0 : p3.dirty) || (r3 === null || r3 === void 0 ? void 0 : r3.dirty) || (s3 === null || s3 === void 0 ? void 0 : s3.dirty)) {
        var matrixT = (p3 === null || p3 === void 0 ? void 0 : p3.data) || Matrix4.create();
        var matrixR = (r3 === null || r3 === void 0 ? void 0 : r3.data) || Matrix4.create();
        var matrixS = (s3 === null || s3 === void 0 ? void 0 : s3.data) || Matrix4.create();
        Matrix4.multiply(matrixT, matrixR, m3.data);
        Matrix4.multiply(m3.data, matrixS, m3.data);
        if (p3) {
            p3.dirty = false;
        }
        if (r3) {
            r3.dirty = false;
        }
        if (s3) {
            s3.dirty = false;
        }
    }
    return m3;
};

var APosition3 = /** @class */ (function (_super) {
    __extends(APosition3, _super);
    function APosition3(data) {
        if (data === void 0) { data = Matrix4.create(); }
        return _super.call(this, TRANSLATION_3D, data) || this;
    }
    return APosition3;
}(Matrix4Component));

var AProjection3 = /** @class */ (function (_super) {
    __extends(AProjection3, _super);
    function AProjection3(data) {
        if (data === void 0) { data = Matrix4.create(); }
        return _super.call(this, PROJECTION_3D, data) || this;
    }
    return AProjection3;
}(Matrix4Component));

var ARotation3 = /** @class */ (function (_super) {
    __extends(ARotation3, _super);
    function ARotation3(data) {
        if (data === void 0) { data = Matrix4.create(); }
        return _super.call(this, ROTATION_3D, data) || this;
    }
    return ARotation3;
}(Matrix4Component));

var AScale3 = /** @class */ (function (_super) {
    __extends(AScale3, _super);
    function AScale3(data) {
        if (data === void 0) { data = Matrix4.create(); }
        return _super.call(this, SCALING_3D, data) || this;
    }
    return AScale3;
}(Matrix4Component));

var EuclidPosition3 = /** @class */ (function (_super) {
    __extends(EuclidPosition3, _super);
    function EuclidPosition3(vec3) {
        if (vec3 === void 0) { vec3 = new Float32Array(3); }
        var _this = _super.call(this) || this;
        _this.data = Matrix4.identity();
        _this.vec3 = vec3;
        _this.update();
        return _this;
    }
    Object.defineProperty(EuclidPosition3.prototype, "x", {
        get: function () {
            return this.vec3[0];
        },
        set: function (value) {
            this.vec3[0] = value;
            this.update();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EuclidPosition3.prototype, "y", {
        get: function () {
            return this.vec3[1];
        },
        set: function (value) {
            this.vec3[1] = value;
            this.update();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EuclidPosition3.prototype, "z", {
        get: function () {
            return this.vec3[1];
        },
        set: function (value) {
            this.vec3[2] = value;
            this.update();
        },
        enumerable: false,
        configurable: true
    });
    EuclidPosition3.prototype.set = function (arr) {
        this.vec3.set(arr);
        return this.update();
    };
    EuclidPosition3.prototype.setXYZ = function (x, y, z) {
        this.vec3[0] = x;
        this.vec3[1] = y;
        this.vec3[2] = z;
        return this.update();
    };
    EuclidPosition3.prototype.update = function () {
        Matrix4.fromTranslation(this.vec3, this.data);
        return this;
    };
    return EuclidPosition3;
}(APosition3));

var EulerRotationOrders;
(function (EulerRotationOrders) {
    EulerRotationOrders["XYZ"] = "xyz";
    EulerRotationOrders["ZXY"] = "zxy";
    EulerRotationOrders["YZX"] = "yzx";
    EulerRotationOrders["XZY"] = "xzy";
    EulerRotationOrders["ZYX"] = "zyx";
    EulerRotationOrders["YXZ"] = "yxz";
})(EulerRotationOrders || (EulerRotationOrders = {}));

/* eslint-disable max-lines */
var a00 = 0, a01 = 0, a02 = 0, a03 = 0, a11 = 0, a10 = 0, a12 = 0, a13 = 0, a20 = 0, a21 = 0, a22 = 0, a23 = 0, a31 = 0, a30 = 0, a32 = 0, a33 = 0;
var b00 = 0, b01 = 0, b02 = 0, b03 = 0, b20 = 0, b21 = 0, b22 = 0, b23 = 0, b31 = 0, b30 = 0, b32 = 0, b33 = 0;
var x = 0, y = 0, z = 0, det = 0, a = 0, b = 0, c = 0, d = 0, e = 0, f = 0;
Object.freeze([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
var fromEuler = function (euler, out) {
    if (out === void 0) { out = new Float32Array(16); }
    x = euler.x;
    y = euler.y;
    z = euler.z;
    a = Math.cos(x);
    b = Math.sin(x);
    c = Math.cos(y);
    d = Math.sin(y);
    e = Math.cos(z);
    f = Math.sin(z);
    if (euler.order === EulerRotationOrders.XYZ) {
        var ae = a * e, af = a * f, be = b * e, bf = b * f;
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
        var ce = c * e, cf = c * f, de = d * e, df = d * f;
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
        var ce = c * e, cf = c * f, de = d * e, df = d * f;
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
        var ae = a * e, af = a * f, be = b * e, bf = b * f;
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
        var ac = a * c, ad = a * d, bc = b * c, bd = b * d;
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
        var ac = a * c, ad = a * d, bc = b * c, bd = b * d;
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
var identity = function (out) {
    if (out === void 0) { out = new Float32Array(16); }
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
function invert(a, out) {
    if (out === void 0) { out = new Float32Array(16); }
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
}
var multiply = function (a, b, out) {
    if (out === void 0) { out = new Float32Array(16); }
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

var createDefault = function () {
    return {
        order: EulerRotationOrders.XYZ,
        x: 0,
        y: 0,
        z: 0
    };
};
var from = function (euler, out) {
    if (out === void 0) { out = createDefault(); }
    out.x = euler.x;
    out.y = euler.y;
    out.z = euler.z;
    out.order = euler.order;
    return out;
};
var fromMatrix4 = function (matrix, out) {
    if (out === void 0) { out = createDefault(); }
    var m11 = matrix[0], m12 = matrix[4], m13 = matrix[8];
    var m21 = matrix[1], m22 = matrix[5], m23 = matrix[9];
    var m31 = matrix[2], m32 = matrix[6], m33 = matrix[10];
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
};

var EulerRotation3 = /** @class */ (function (_super) {
    __extends(EulerRotation3, _super);
    function EulerRotation3(euler) {
        if (euler === void 0) { euler = {
            x: 0,
            y: 0,
            z: 0,
            order: EulerRotationOrders.XYZ,
        }; }
        var _this = _super.call(this) || this;
        _this.data = identity();
        _this.euler = euler;
        _this.update();
        return _this;
    }
    Object.defineProperty(EulerRotation3.prototype, "x", {
        get: function () {
            return this.euler.x;
        },
        set: function (value) {
            this.euler.x = value;
            this.update();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EulerRotation3.prototype, "y", {
        get: function () {
            return this.euler.y;
        },
        set: function (value) {
            this.euler.y = value;
            this.update();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EulerRotation3.prototype, "z", {
        get: function () {
            return this.euler.z;
        },
        set: function (value) {
            this.euler.z = value;
            this.update();
        },
        enumerable: false,
        configurable: true
    });
    EulerRotation3.prototype.set = function (arr) {
        from(arr, this.euler);
        return this.update();
    };
    EulerRotation3.prototype.update = function () {
        fromEuler(this.euler, this.data);
        return this;
    };
    return EulerRotation3;
}(ARotation3));

var PerspectiveProjection$1 = /** @class */ (function (_super) {
    __extends(PerspectiveProjection, _super);
    function PerspectiveProjection(left, right, bottom, top, near, far) {
        var _this = _super.call(this) || this;
        _this.data = new Float32Array(16);
        _this.options = {
            left: left,
            right: right,
            bottom: bottom,
            top: top,
            near: near,
            far: far,
        };
        _this.update();
        return _this;
    }
    Object.defineProperty(PerspectiveProjection.prototype, "left", {
        get: function () {
            return this.options.left;
        },
        set: function (value) {
            this.options.left = value;
            this.update();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PerspectiveProjection.prototype, "right", {
        get: function () {
            return this.right;
        },
        set: function (value) {
            this.options.right = value;
            this.update();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PerspectiveProjection.prototype, "top", {
        get: function () {
            return this.top;
        },
        set: function (value) {
            this.options.top = value;
            this.update();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PerspectiveProjection.prototype, "bottom", {
        get: function () {
            return this.bottom;
        },
        set: function (value) {
            this.options.bottom = value;
            this.update();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PerspectiveProjection.prototype, "near", {
        get: function () {
            return this.options.near;
        },
        set: function (value) {
            this.options.near = value;
            this.update();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PerspectiveProjection.prototype, "far", {
        get: function () {
            return this.options.far;
        },
        set: function (value) {
            this.options.far = value;
            this.update();
        },
        enumerable: false,
        configurable: true
    });
    PerspectiveProjection.prototype.set = function (left, right, bottom, top, near, far) {
        if (left === void 0) { left = this.left; }
        if (right === void 0) { right = this.right; }
        if (bottom === void 0) { bottom = this.bottom; }
        if (top === void 0) { top = this.top; }
        if (near === void 0) { near = this.near; }
        if (far === void 0) { far = this.far; }
        this.options.left = left;
        this.options.right = right;
        this.options.bottom = bottom;
        this.options.top = top;
        this.options.near = near;
        this.options.far = far;
        return this.update();
    };
    PerspectiveProjection.prototype.update = function () {
        Matrix4.orthogonal(this.options.left, this.options.right, this.options.bottom, this.options.top, this.options.near, this.options.far, this.data);
        this.dirty = true;
        return this;
    };
    return PerspectiveProjection;
}(AProjection3));

var PerspectiveProjection = /** @class */ (function (_super) {
    __extends(PerspectiveProjection, _super);
    function PerspectiveProjection(fovy, aspect, near, far) {
        var _this = _super.call(this) || this;
        _this.data = new Float32Array(16);
        _this.options = {
            fovy: fovy,
            aspect: aspect,
            near: near,
            far: far,
        };
        _this.update();
        return _this;
    }
    Object.defineProperty(PerspectiveProjection.prototype, "fovy", {
        get: function () {
            return this.options.fovy;
        },
        set: function (value) {
            this.options.fovy = value;
            this.update();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PerspectiveProjection.prototype, "aspect", {
        get: function () {
            return this.aspect;
        },
        set: function (value) {
            this.options.aspect = value;
            this.update();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PerspectiveProjection.prototype, "near", {
        get: function () {
            return this.options.near;
        },
        set: function (value) {
            this.options.near = value;
            this.update();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PerspectiveProjection.prototype, "far", {
        get: function () {
            return this.options.far;
        },
        set: function (value) {
            this.options.far = value;
            this.update();
        },
        enumerable: false,
        configurable: true
    });
    PerspectiveProjection.prototype.set = function (fovy, aspect, near, far) {
        if (fovy === void 0) { fovy = this.fovy; }
        if (aspect === void 0) { aspect = this.aspect; }
        if (near === void 0) { near = this.near; }
        if (far === void 0) { far = this.far; }
        this.options.fovy = fovy;
        this.options.aspect = aspect;
        this.options.near = near;
        this.options.far = far;
        return this.update();
    };
    PerspectiveProjection.prototype.update = function () {
        Matrix4.perspective(this.options.fovy, this.options.aspect, this.options.near, this.options.far, this.data);
        this.dirty = true;
        return this;
    };
    return PerspectiveProjection;
}(AProjection3));

var DEFAULT_SCALE = [1, 1, 1];
var Vector3Scale3 = /** @class */ (function (_super) {
    __extends(Vector3Scale3, _super);
    function Vector3Scale3(vec3) {
        if (vec3 === void 0) { vec3 = new Float32Array(DEFAULT_SCALE); }
        var _this = _super.call(this) || this;
        _this.data = Matrix4.identity();
        _this.vec3 = vec3;
        _this.update();
        return _this;
    }
    Object.defineProperty(Vector3Scale3.prototype, "x", {
        get: function () {
            return this.vec3[0];
        },
        set: function (value) {
            this.vec3[0] = value;
            this.update();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Vector3Scale3.prototype, "y", {
        get: function () {
            return this.vec3[1];
        },
        set: function (value) {
            this.vec3[1] = value;
            this.update();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Vector3Scale3.prototype, "z", {
        get: function () {
            return this.vec3[1];
        },
        set: function (value) {
            this.vec3[2] = value;
            this.update();
        },
        enumerable: false,
        configurable: true
    });
    Vector3Scale3.prototype.set = function (arr) {
        this.vec3.set(arr);
        return this.update();
    };
    Vector3Scale3.prototype.setXYZ = function (x, y, z) {
        this.vec3[0] = x;
        this.vec3[1] = y;
        this.vec3[2] = z;
        return this.update();
    };
    Vector3Scale3.prototype.update = function () {
        Matrix4.fromScaling(this.vec3, this.data);
        return this;
    };
    return Vector3Scale3;
}(AScale3));

var Renderable = /** @class */ (function (_super) {
    __extends(Renderable, _super);
    function Renderable(renderType) {
        return _super.call(this, Renderable.TAG_TEXT, renderType) || this;
    }
    Renderable.TAG_TEXT = "Renderable";
    return Renderable;
}(Component));

var Object3 = /** @class */ (function (_super) {
    __extends(Object3, _super);
    function Object3() {
        return _super.call(this, 'object3', true) || this;
    }
    return Object3;
}(Component));

var ImageBitmapTexture = /** @class */ (function (_super) {
    __extends(ImageBitmapTexture, _super);
    function ImageBitmapTexture(img, width, height, name) {
        if (name === void 0) { name = "image-texture"; }
        var _this = _super.call(this, name) || this;
        _this.loaded = false;
        _this.dirty = false;
        _this.width = 0;
        _this.height = 0;
        _this.sizeChanged = false;
        _this.image = new Image();
        _this.width = width;
        _this.height = height;
        _this.setImage(img);
        return _this;
    }
    ImageBitmapTexture.prototype.setImage = function (img) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.loaded = false;
                        this.dirty = false;
                        if (typeof img === "string") {
                            this.image.src = img;
                        }
                        else if (img instanceof ImageBitmap) {
                            this.dirty = true;
                            this.loaded = true;
                            this.data = img;
                            return [2 /*return*/, this];
                        }
                        else {
                            this.image = img;
                        }
                        return [4 /*yield*/, this.image.decode()];
                    case 1:
                        _b.sent();
                        _a = this;
                        return [4 /*yield*/, createImageBitmap(this.image)];
                    case 2:
                        _a.data = _b.sent();
                        if (this.width !== this.data.width || this.height !== this.data.height) {
                            this.sizeChanged = true;
                            this.width = this.data.width;
                            this.height = this.data.height;
                        }
                        this.dirty = true;
                        this.loaded = true;
                        return [2 /*return*/, this];
                }
            });
        });
    };
    return ImageBitmapTexture;
}(Component));

var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
function drawSpriteBlock(image, frame) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(image, frame.x, frame.y, frame.w, frame.h, frame.dx, frame.dy, frame.w, frame.h);
                    return [4 /*yield*/, createImageBitmap(canvas)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
var SpritesheetTexture = /** @class */ (function (_super) {
    __extends(SpritesheetTexture, _super);
    function SpritesheetTexture(json, name) {
        if (name === void 0) { name = "spritesheet-texture"; }
        var _this = _super.call(this, name) || this;
        _this.loaded = false;
        _this.dirty = false;
        _this.frame = 0; // 当前帧索引
        _this.width = 0;
        _this.height = 0;
        _this.framesBitmap = [];
        _this.width = json.spriteSize.w;
        _this.height = json.spriteSize.h;
        _this.setImage(json);
        return _this;
    }
    SpritesheetTexture.prototype.setImage = function (json) {
        return __awaiter(this, void 0, void 0, function () {
            var img, _a, _b, item, _c, _d, e_1_1;
            var e_1, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        this.loaded = false;
                        this.dirty = false;
                        img = new Image();
                        img.src = json.image;
                        this.image = img;
                        return [4 /*yield*/, img.decode()];
                    case 1:
                        _f.sent();
                        canvas.width = json.spriteSize.w;
                        canvas.height = json.spriteSize.h;
                        _f.label = 2;
                    case 2:
                        _f.trys.push([2, 7, 8, 9]);
                        _a = __values(json.frames), _b = _a.next();
                        _f.label = 3;
                    case 3:
                        if (!!_b.done) return [3 /*break*/, 6];
                        item = _b.value;
                        _d = (_c = this.framesBitmap).push;
                        return [4 /*yield*/, drawSpriteBlock(this.image, item)];
                    case 4:
                        _d.apply(_c, [_f.sent()]);
                        _f.label = 5;
                    case 5:
                        _b = _a.next();
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 9];
                    case 7:
                        e_1_1 = _f.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 9];
                    case 8:
                        try {
                            if (_b && !_b.done && (_e = _a.return)) _e.call(_a);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 9:
                        this.data = this.framesBitmap[0];
                        this.dirty = true;
                        this.loaded = true;
                        return [2 /*return*/, this];
                }
            });
        });
    };
    SpritesheetTexture.prototype.setFrame = function (frame) {
        this.frame = frame;
        this.data = this.framesBitmap[frame];
        this.dirty = true;
    };
    return SpritesheetTexture;
}(Component));

var getEuclidPosition3Proxy = (function (position) {
    if (position.isEntity) {
        position = position.getComponent(TRANSLATION_3D);
    }
    return new Proxy(position, {
        get: function (target, property) {
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
        set: function (target, property, value) {
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
            return false;
        },
    });
});

var getEulerRotation3Proxy = (function (position) {
    if (position.isEntity) {
        position = position.getComponent(ROTATION_3D);
    }
    var euler = fromMatrix4(position.data);
    return new Proxy(position, {
        get: function (target, property) {
            if (property === 'x' || property === 'y' || property === 'z' || property === 'order') {
                return euler[property];
            }
            return target[property];
        },
        set: function (target, property, value) {
            if (property === 'x' || property === 'y' || property === 'z') {
                target.dirty = true;
                euler[property] = value;
                fromEuler(euler, target.data);
                return true;
            }
            else if (property === 'order') {
                target.dirty = true;
                euler.order = value;
                fromEuler(euler, target.data);
                return true;
            }
            return false;
        },
    });
});

var index$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	getEuclidPosition3Proxy: getEuclidPosition3Proxy,
	getEulerRotation3Proxy: getEulerRotation3Proxy
});

var createJson = function (r, g, b, a) {
    if (r === void 0) { r = 0; }
    if (g === void 0) { g = 0; }
    if (b === void 0) { b = 0; }
    if (a === void 0) { a = 1; }
    return {
        r: r,
        g: g,
        b: b,
        a: a
    };
};

var Clearer = /** @class */ (function () {
    function Clearer(engine, color) {
        if (color === void 0) { color = createJson(); }
        this.engine = engine;
        this.color = color;
        console.log(engine);
        this.depthTexture = engine.device.createTexture({
            size: { width: engine.canvas.width, height: engine.canvas.height, depthOrArrayLayers: 1 },
            format: "depth24plus",
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });
        this.renderPassDescriptor = {
            colorAttachments: [
                {
                    view: null,
                    clearOp: "clear",
                    clearValue: this.color,
                    storeOp: "store"
                }
            ],
            depthStencilAttachment: {
                view: this.depthTexture.createView(),
                depthClearValue: 1.0,
                depthLoadOp: "clear",
                depthStoreOp: "store"
            }
        };
    }
    Clearer.prototype.setColor = function (color) {
        this.color = color;
        return this;
    };
    Clearer.prototype.updateColor = function (color) {
        this.color.r = color.r;
        this.color.g = color.g;
        this.color.b = color.b;
        this.color.a = color.a;
        return this;
    };
    Clearer.prototype.clear = function (commandEncoder) {
        this.renderPassDescriptor.colorAttachments[0].loadOp = "clear";
        this.renderPassDescriptor.colorAttachments[0].clearValue = this.color;
        this.renderPassDescriptor.colorAttachments[0].view = this.engine.context
            .getCurrentTexture()
            .createView();
        return commandEncoder.beginRenderPass(this.renderPassDescriptor);
    };
    return Clearer;
}());

var descriptor = {
    size: 0,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true
};
var createVerticesBuffer = (function (device, data) {
    descriptor.size = data.byteLength;
    var buffer = device.createBuffer(descriptor);
    new Float32Array(buffer.getMappedRange()).set(data);
    buffer.unmap();
    return buffer;
});

var MeshRenderer = /** @class */ (function () {
    function MeshRenderer(engine) {
        this.renderTypes = "mesh";
        this.entityCacheData = new WeakMap();
        this.engine = engine;
    }
    MeshRenderer.prototype.render = function (mesh, camera, passEncoder, _scissor) {
        var _this = this;
        var _a, _b;
        var cacheData = this.entityCacheData.get(mesh);
        if (!cacheData) {
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
        for (var i = 0; i < cacheData.attributesBuffers.length; i++) {
            passEncoder.setVertexBuffer(i, cacheData.attributesBuffers[i]);
        }
        var mvp = cacheData.mvp;
        multiply((_a = camera.getComponent(PROJECTION_3D)) === null || _a === void 0 ? void 0 : _a.data, invert(updateModelMatrixComponent(camera).data), mvp);
        multiply(mvp, (_b = mesh.getComponent(MODEL_3D)) === null || _b === void 0 ? void 0 : _b.data, mvp);
        this.engine.device.queue.writeBuffer(cacheData.uniformBuffer, 0, mvp.buffer, mvp.byteOffset, mvp.byteLength);
        cacheData.uniformMap.forEach(function (uniform, key) {
            if (uniform.type === "uniform-buffer" && uniform.dirty) {
                _this.engine.device.queue.writeBuffer(key, 0, uniform.value.buffer, uniform.value.byteOffset, uniform.value.byteLength);
                uniform.dirty = false;
            }
            else if (uniform.type === "sampled-texture" && (uniform.dirty || uniform.value.dirty)) {
                if (uniform.value.loaded) {
                    if (uniform.value.data) {
                        _this.engine.device.queue.copyExternalImageToTexture({ source: uniform.value.data }, { texture: key }, [uniform.value.data.width, uniform.value.data.height, 1]);
                        uniform.dirty = false;
                    }
                }
            }
        });
        passEncoder.setBindGroup(0, cacheData.uniformBindGroup);
        passEncoder.draw(mesh.getComponent(GEOMETRY_3D).count, 1, 0, 0);
        return this;
    };
    MeshRenderer.prototype.createCacheData = function (mesh) {
        var _a, _b, _c;
        updateModelMatrixComponent(mesh);
        var device = this.engine.device;
        var uniformBuffer = device.createBuffer({
            size: 64,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        var buffers = [];
        var nodes = (_a = mesh.getComponent(GEOMETRY_3D)) === null || _a === void 0 ? void 0 : _a.data;
        for (var i = 0; i < nodes.length; i++) {
            buffers.push(createVerticesBuffer(device, nodes[i].data));
        }
        var pipeline = this.createPipeline(mesh);
        var groupEntries = [{
                binding: 0,
                resource: {
                    buffer: uniformBuffer,
                },
            }];
        var uniforms = (_c = (_b = mesh.getComponent(MATERIAL)) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.uniforms;
        var uniformMap = new Map();
        if (uniforms) {
            for (var i = 0; i < uniforms.length; i++) {
                var uniform = uniforms[i];
                if (uniform.type === "uniform-buffer") {
                    var buffer = device.createBuffer({
                        size: uniform.value.length * 4,
                        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
                    });
                    uniformMap.set(buffer, uniform);
                    groupEntries.push({
                        binding: uniform.binding,
                        resource: {
                            buffer: buffer
                        }
                    });
                }
                else if (uniform.type === "sampler") {
                    var sampler = device.createSampler(uniform.value.data);
                    uniformMap.set(sampler, uniform);
                    groupEntries.push({
                        binding: uniform.binding,
                        resource: sampler
                    });
                }
                else if (uniform.type === "sampled-texture") {
                    var texture = device.createTexture({
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
        var uniformBindGroup = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: groupEntries,
        });
        return {
            mvp: new Float32Array(16),
            attributesBuffers: buffers,
            uniformBuffer: uniformBuffer,
            uniformBindGroup: uniformBindGroup,
            pipeline: pipeline,
            uniformMap: uniformMap
        };
    };
    MeshRenderer.prototype.createPipeline = function (mesh) {
        var pipelineLayout = this.engine.device.createPipelineLayout({
            bindGroupLayouts: [this.createBindGroupLayout(mesh)],
        });
        var stages = this.createStages(mesh);
        var geometry = mesh.getComponent(GEOMETRY_3D);
        var vertexBuffers = [];
        var location = 0;
        for (var i = 0; i < geometry.data.length; i++) {
            var data = geometry.data[i];
            var attributeDescripters = [];
            for (var j = 0; j < data.attributes.length; j++) {
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
        var pipeline = this.engine.device.createRenderPipeline({
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
    };
    MeshRenderer.prototype.createBindGroupLayout = function (mesh) {
        var _a, _b;
        var uniforms = (_b = (_a = mesh.getComponent(MATERIAL)) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.uniforms;
        var entries = [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: 'uniform',
                }
            }
        ];
        if (uniforms) {
            for (var i = 0; i < uniforms.length; i++) {
                if (uniforms[i].type === "sampler") {
                    entries.push({
                        visibility: GPUShaderStage.FRAGMENT,
                        binding: uniforms[i].binding,
                        sampler: {
                            type: 'filtering'
                        },
                    });
                }
                else if (uniforms[i].type === "sampled-texture") {
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
            entries: entries,
        });
    };
    MeshRenderer.prototype.createStages = function (mesh) {
        var material = mesh.getComponent(MATERIAL);
        var geometry = mesh.getComponent(GEOMETRY_3D);
        var vertexBuffers = [];
        var location = 0;
        for (var i = 0; i < geometry.data.length; i++) {
            var data = geometry.data[i];
            var attributeDescripters = [];
            for (var j = 0; j < data.attributes.length; j++) {
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
        var vertex = {
            module: this.engine.device.createShaderModule({
                code: (material === null || material === void 0 ? void 0 : material.data.vertex) || wgslShaders.vertex,
            }),
            entryPoint: "main",
            buffers: vertexBuffers
        };
        var fragment = {
            module: this.engine.device.createShaderModule({
                code: (material === null || material === void 0 ? void 0 : material.data.fragment) || wgslShaders.fragment,
            }),
            entryPoint: "main",
            targets: [
                {
                    format: this.engine.preferredFormat,
                }
            ]
        };
        return {
            vertex: vertex,
            fragment: fragment
        };
    };
    MeshRenderer.renderTypes = "mesh";
    return MeshRenderer;
}());
var wgslShaders = {
    vertex: "\n\t\tstruct Uniforms {\n\t\t\tmodelViewProjectionMatrix : mat4x4<f32>;\n\t  \t};\n\t  \t@binding(0) @group(0) var<uniform> uniforms : Uniforms;\n\n\t\tstruct VertexOutput {\n\t\t\t@builtin(position) Position : vec4<f32>;\n\t\t};\n\n\t\tfn mapRange(\n\t\t\tvalue: f32,\n\t\t\trange1: vec2<f32>,\n\t\t\trange2: vec2<f32>,\n\t\t) -> f32 {\n\t\t\tvar d1: f32 = range1.y - range1.x;\n\t\t\tvar d2: f32 = range2.y - range2.x;\n\t\t\n\t\t\treturn (value - d1 * 0.5) / d2 / d1;\n\t\t};\n\n\t\t@stage(vertex) fn main(@location(0) position : vec3<f32>) -> VertexOutput {\n\t\t\tvar output : VertexOutput;\n\t\t\toutput.Position = uniforms.modelViewProjectionMatrix * vec4<f32>(position, 1.0);\n\t\t\tif (output.Position.w == 1.0) {\n\t\t\t\toutput.Position.z = mapRange(output.Position.z, vec2<f32>(-1.0, 1.0), vec2<f32>(1.0, 0.0));\n\t\t\t}\n\t\t\treturn output;\n\t\t}\n\t",
    fragment: "\n\t\t@stage(fragment) fn main() -> @location(0) vec4<f32> {\n\t\t\treturn vec4<f32>(1., 1., 1., 1.0);\n\t\t}\n\t"
};

var RenderSystem = /** @class */ (function (_super) {
    __extends(RenderSystem, _super);
    function RenderSystem(engine, clearer, viewport, scissor) {
        var _this = _super.call(this, "Render System", function (entity) {
            var _a;
            return (_a = entity.getComponent(Renderable.TAG_TEXT)) === null || _a === void 0 ? void 0 : _a.data;
        }) || this;
        _this.scissor = {
            x: 0, y: 0, width: 0, height: 0,
        };
        _this.viewport = {
            x: 0, y: 0, width: 0, height: 0, minDepth: 0, maxDepth: 1
        };
        _this.engine = engine;
        _this.clearer = clearer || new Clearer(engine);
        _this.rendererMap = new Map();
        engine.context.configure({
            device: engine.device,
            format: engine.preferredFormat,
            size: [engine.canvas.clientWidth, engine.canvas.clientHeight]
        });
        _this.setScissor(scissor).setViewport(viewport);
        return _this;
    }
    RenderSystem.prototype.addRenderer = function (renderer) {
        var e_1, _a;
        if (typeof renderer.renderTypes === "string") {
            this.rendererMap.set(renderer.renderTypes, renderer);
        }
        else {
            try {
                for (var _b = __values(renderer.renderTypes), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var item = _c.value;
                    this.rendererMap.set(item, renderer);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        return this;
    };
    RenderSystem.prototype.destroy = function () {
        this.rendererMap.clear();
    };
    RenderSystem.prototype.handle = function (entity, store) {
        var _a, _b;
        // 根据不同类别进行渲染
        (_b = this.rendererMap.get((_a = entity.getComponent(Renderable.TAG_TEXT)) === null || _a === void 0 ? void 0 : _a.data)) === null || _b === void 0 ? void 0 : _b.render(entity, store.get("activeCamera"), store.get("passEncoder"));
        return this;
    };
    RenderSystem.prototype.setClearer = function (clearer) {
        this.clearer = clearer;
    };
    RenderSystem.prototype.setViewport = function (viewport) {
        this.viewport = viewport || {
            x: 0,
            y: 0,
            width: this.engine.canvas.width,
            height: this.engine.canvas.height,
            minDepth: 0,
            maxDepth: 1
        };
        return this;
    };
    RenderSystem.prototype.setScissor = function (scissor) {
        this.scissor = scissor || {
            x: 0,
            y: 0,
            width: this.engine.canvas.width,
            height: this.engine.canvas.height
        };
        return this;
    };
    RenderSystem.prototype.run = function (world) {
        var device = this.engine.device;
        var commandEncoder = device.createCommandEncoder();
        var passEncoder = this.clearer.clear(commandEncoder);
        passEncoder.setViewport(this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height, this.viewport.minDepth, this.viewport.maxDepth);
        passEncoder.setScissorRect(this.scissor.x, this.scissor.y, this.scissor.width, this.scissor.height);
        world.store.set("passEncoder", passEncoder);
        _super.prototype.run.call(this, world);
        // finish
        passEncoder.end();
        device.queue.submit([commandEncoder.finish()]);
        return this;
    };
    return RenderSystem;
}(ASystem));

var createCamera = (function (projection, name, world) {
    if (name === void 0) { name = "camera"; }
    var entity = new Entity(name);
    entity.addComponent(projection)
        .addComponent(new Matrix4Component(TRANSLATION_3D))
        .addComponent(new Matrix4Component(ROTATION_3D))
        .addComponent(new Matrix4Component(SCALING_3D))
        .addComponent(new Matrix4Component(MODEL_3D));
    if (world) {
        world.addEntity(entity);
        world.store.set("activeCamera", entity);
    }
    return entity;
});

var createMesh = (function (geometry, name, world) {
    if (name === void 0) { name = "mesh"; }
    var entity = new Entity(name);
    entity.addComponent(geometry)
        .addComponent(new Matrix4Component(TRANSLATION_3D))
        .addComponent(new Matrix4Component(ROTATION_3D))
        .addComponent(new Matrix4Component(SCALING_3D))
        .addComponent(new Matrix4Component(MODEL_3D))
        .addComponent(new Renderable("mesh"));
    if (world) {
        world.addEntity(entity);
    }
    return entity;
});

var index = /*#__PURE__*/Object.freeze({
	__proto__: null,
	createCamera: createCamera,
	createMesh: createMesh
});

export { APosition3, AProjection3, ARotation3, AScale3, constants as ATTRIBUTE_NAME, constants$1 as COMPONENT_NAME, ColorMaterial, index$1 as ComponentProxy, NormalMaterial$1 as DepthMaterial, EngineEvents, index as EntityFactory, EuclidPosition3, EulerRotation3, Geometry3, index$2 as Geometry3Factory, ImageBitmapTexture, Matrix4Component, NormalMaterial, Object3, PerspectiveProjection$1 as OrthogonalProjection, PerspectiveProjection, Renderable, Sampler, ShaderMaterial, SpritesheetTexture, TextureMaterial, Vector3Scale3, WebGLEngine, Clearer as WebGPUClearer, WebGPUEngine, MeshRenderer as WebGPUMeshRenderer, RenderSystem as WebGPURenderSystem };
