export { default as Timeline } from '@valeera/timeline';
import EventDispatcher, { mixin } from '@valeera/eventdispatcher';
export { default as EventFire } from '@valeera/eventdispatcher';
import IdGenerator from '@valeera/idgenerator';
import { Vector3 as Vector3$1, Constants, Triangle3, Matrix4 as Matrix4$1, EulerAngle, Vector2 as Vector2$1, Vector4 as Vector4$1, ColorGPU, ColorRGB, ColorRGBA } from '@valeera/mathx';
import * as mathx from '@valeera/mathx';
export { mathx as Mathx };
import { Component as Component$1 } from '@valeera/x';
export * from '@valeera/x';
import { TreeNode } from '@valeera/tree';

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
var DEFAULT_ENGINE_OPTIONS = {
    width: window.innerWidth,
    height: window.innerHeight,
    resolution: window.devicePixelRatio,
    autoResize: true,
};

var WebGPUEngine = /** @class */ (function (_super) {
    __extends(WebGPUEngine, _super);
    function WebGPUEngine(canvas, options) {
        if (canvas === void 0) { canvas = document.createElement("canvas"); }
        if (options === void 0) { options = {}; }
        var _this = this;
        var _a, _b, _c;
        _this = _super.call(this) || this;
        _this.inited = false;
        _this.canvas = canvas;
        _this.options = __assign(__assign({}, DEFAULT_ENGINE_OPTIONS), options);
        _this.resize((_a = options.width) !== null && _a !== void 0 ? _a : window.innerWidth, (_b = options.height) !== null && _b !== void 0 ? _b : window.innerHeight, (_c = options.resolution) !== null && _c !== void 0 ? _c : window.devicePixelRatio);
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
    WebGPUEngine.prototype.resize = function (width, height, resolution) {
        if (resolution === void 0) { resolution = this.options.resolution; }
        this.options.width = width;
        this.options.height = height;
        this.options.resolution = resolution;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        this.canvas.width = width * resolution;
        this.canvas.height = height * resolution;
        return this;
    };
    WebGPUEngine.prototype.createRenderer = function () {
    };
    WebGPUEngine.Events = EngineEvents;
    return WebGPUEngine;
}(EventDispatcher));

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
}(EventDispatcher));

var IdGeneratorInstance = new IdGenerator();

var Component = /** @class */ (function () {
    function Component(name, data) {
        this.isComponent = true;
        this.id = IdGeneratorInstance.next();
        this.disabled = false;
        this.usedBy = [];
        this.dirty = false;
        this.name = name;
        this.data = data;
    }
    Component.unserialize = function (json) {
        var component = new Component(json.name, json.data);
        component.disabled = json.disabled;
        return component;
    };
    Component.prototype.clone = function () {
        return new Component(this.name, this.data);
    };
    Component.prototype.serialize = function () {
        return {
            data: this.data,
            disabled: this.disabled,
            name: this.name,
            type: "component"
        };
    };
    return Component;
}());

var ANCHOR_3D = "anchor3";
var GEOMETRY_3D = "geometry3";
var MATERIAL = "material";
var MODEL_3D = "model3";
var PROJECTION_3D = "projection3";
var ROTATION_3D = "rotation3";
var SCALING_3D = "scale3";
var TRANSLATION_3D = "position3";
var WORLD_MATRIX = "world-matrix";
var VIEWING_3D = "viewing3";

var constants$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	ANCHOR_3D: ANCHOR_3D,
	GEOMETRY_3D: GEOMETRY_3D,
	MATERIAL: MATERIAL,
	MODEL_3D: MODEL_3D,
	PROJECTION_3D: PROJECTION_3D,
	ROTATION_3D: ROTATION_3D,
	SCALING_3D: SCALING_3D,
	TRANSLATION_3D: TRANSLATION_3D,
	WORLD_MATRIX: WORLD_MATRIX,
	VIEWING_3D: VIEWING_3D
});

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
    Geometry3.prototype.transform = function (matrix) {
        var e_1, _a, e_2, _b;
        try {
            for (var _c = __values(this.data), _d = _c.next(); !_d.done; _d = _c.next()) {
                var data = _d.value;
                try {
                    for (var _e = (e_2 = void 0, __values(data.attributes)), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var attr = _f.value;
                        if (attr.name === POSITION) {
                            for (var i = 0; i < data.data.length; i += data.stride) {
                                transformMatrix4(data.data, matrix, i + attr.offset);
                            }
                            this.dirty = true;
                            return this;
                        }
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
        return this;
    };
    return Geometry3;
}(Component));
var transformMatrix4 = function (a, m, offset) {
    var ax = a[0 + offset];
    var ay = a[1 + offset];
    var az = a[2 + offset];
    var ag = m[3 + offset] * ax + m[7] * ay + m[11] * az + m[15];
    ag = ag || 1.0;
    a[0 + offset] = (m[0] * ax + m[4] * ay + m[8] * az + m[12]) / ag;
    a[1 + offset] = (m[1] * ax + m[5] * ay + m[9] * az + m[13]) / ag;
    a[2 + offset] = (m[2] * ax + m[6] * ay + m[10] * az + m[14]) / ag;
    return a;
};

var DEFAULT_OPTIONS = {
    hasNormal: true,
    hasUV: true,
    hasIndices: false,
    combine: true,
    topology: "triangle-list",
    cullMode: "none"
};

var DEFAULT_BOX_OPTIONS = __assign(__assign({}, DEFAULT_OPTIONS), { hasIndices: true, combine: true, width: 1, height: 1, depth: 1, widthSegments: 1, heightSegments: 1, depthSegments: 1, cullMode: "back" });
var createBox3 = (function (options) {
    if (options === void 0) { options = {}; }
    var stride = 3;
    var indices = [];
    var vertices = [];
    var normals = [];
    var uvs = [];
    var _a = __assign(__assign({}, DEFAULT_BOX_OPTIONS), options), depth = _a.depth, height = _a.height, width = _a.width, depthSegments = _a.depthSegments, heightSegments = _a.heightSegments, widthSegments = _a.widthSegments, topology = _a.topology, cullMode = _a.cullMode, hasUV = _a.hasUV, hasNormal = _a.hasNormal, combine = _a.combine;
    var numberOfVertices = 0;
    buildPlane(2, 1, 0, -1, -1, depth, height, width, depthSegments, heightSegments); // px
    buildPlane(2, 1, 0, 1, -1, depth, height, -width, depthSegments, heightSegments); // nx
    buildPlane(0, 2, 1, 1, 1, width, depth, height, widthSegments, depthSegments); // py
    buildPlane(0, 2, 1, 1, -1, width, depth, -height, widthSegments, depthSegments); // ny
    buildPlane(0, 1, 2, 1, -1, width, height, depth, widthSegments, heightSegments); // pz
    buildPlane(0, 1, 2, -1, -1, width, height, -depth, widthSegments, heightSegments); // nz
    function buildPlane(u, v, w, udir, vdir, width, height, depth, gridX, gridY) {
        var segmentWidth = width / gridX;
        var segmentHeight = height / gridY;
        var widthHalf = width / 2;
        var heightHalf = height / 2;
        var depthHalf = depth / 2;
        var gridX1 = gridX + 1;
        var gridY1 = gridY + 1;
        var vertexCounter = 0;
        var vector = new Vector3$1();
        // generate vertices, normals and uvs
        for (var iy = 0; iy < gridY1; iy++) {
            var y = iy * segmentHeight - heightHalf;
            for (var ix = 0; ix < gridX1; ix++) {
                var x = ix * segmentWidth - widthHalf;
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
                uvs.push(1 - (iy / gridY));
                // counters
                vertexCounter += 1;
            }
        }
        // indices
        for (var iy = 0; iy < gridY; iy++) {
            for (var ix = 0; ix < gridX; ix++) {
                var a = numberOfVertices + ix + gridX1 * iy;
                var b = numberOfVertices + ix + gridX1 * (iy + 1);
                var c = numberOfVertices + (ix + 1) + gridX1 * (iy + 1);
                var d = numberOfVertices + (ix + 1) + gridX1 * iy;
                // faces
                indices.push(a, b, d);
                indices.push(b, c, d);
            }
        }
        // update total number of vertices
        numberOfVertices += vertexCounter;
    }
    var len = indices.length, i3 = 0, strideI = 0, i2 = 0;
    // let count = len / 3;
    var geo = new Geometry3(len, topology, cullMode);
    if (combine) {
        var pickers = [{
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
        var result = new Float32Array(stride * len);
        for (var i = 0; i < len; i++) {
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
});

var DEFAULT_CIRCLE_OPTIONS = __assign(__assign({}, DEFAULT_OPTIONS), { hasIndices: true, combine: true, segments: 32, angleStart: 0, angle: Math.PI * 2, radius: 1 });
var createCircle3 = (function (options) {
    if (options === void 0) { options = {}; }
    var stride = 3;
    var indices = [];
    var positions = [0, 0, 0];
    var normals = [0, 0, 1];
    var uvs = [0.5, 0.5];
    var _a = __assign(__assign({}, DEFAULT_CIRCLE_OPTIONS), options), segments = _a.segments, angleStart = _a.angleStart, angle = _a.angle, radius = _a.radius, topology = _a.topology, cullMode = _a.cullMode, hasUV = _a.hasUV, hasNormal = _a.hasNormal, combine = _a.combine;
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
    var geo = new Geometry3(len, topology, cullMode);
    // TODO indices 现在都是非索引版本
    if (combine) {
        var pickers = [{
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
        var result = new Float32Array(stride * len);
        for (var i = 0; i < len; i++) {
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
});

var DEFAULT_SPHERE_OPTIONS$1 = __assign(__assign({}, DEFAULT_OPTIONS), { hasIndices: true, combine: true, radiusTop: 1, radiusBottom: 1, height: 1, radialSegments: 32, heightSegments: 1, openEnded: false, thetaStart: 0, thetaLength: Constants.DEG_360_RAD, cullMode: "back" });
var createCylinder3 = (function (options) {
    if (options === void 0) { options = {}; }
    var stride = 3;
    var indices = [];
    var vertices = [];
    var normals = [];
    var uvs = [];
    var _a = __assign(__assign({}, DEFAULT_SPHERE_OPTIONS$1), options), height = _a.height, radialSegments = _a.radialSegments, radiusTop = _a.radiusTop, radiusBottom = _a.radiusBottom, heightSegments = _a.heightSegments, openEnded = _a.openEnded, thetaStart = _a.thetaStart, thetaLength = _a.thetaLength, topology = _a.topology, cullMode = _a.cullMode, hasUV = _a.hasUV, hasNormal = _a.hasNormal, combine = _a.combine;
    var index = 0;
    var indexArray = [];
    var halfHeight = height / 2;
    // generate geometry
    generateTorso();
    if (openEnded === false) {
        if (radiusTop > 0)
            generateCap(true);
        if (radiusBottom > 0)
            generateCap(false);
    }
    function generateTorso() {
        var normal = new Vector3$1();
        var vertex = new Float32Array(3);
        // this will be used to calculate the normal
        var slope = (radiusBottom - radiusTop) / height;
        // generate vertices, normals and uvs
        for (var y = 0; y <= heightSegments; y++) {
            var indexRow = [];
            var v = y / heightSegments;
            // calculate the radius of the current row
            var radius = v * (radiusBottom - radiusTop) + radiusTop;
            for (var x = 0; x <= radialSegments; x++) {
                var u = x / radialSegments;
                var theta = u * thetaLength + thetaStart;
                var sinTheta = Math.sin(theta);
                var cosTheta = Math.cos(theta);
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
        for (var x = 0; x < radialSegments; x++) {
            for (var y = 0; y < heightSegments; y++) {
                // we use the index array to access the correct indices
                var a = indexArray[y][x];
                var b = indexArray[y + 1][x];
                var c = indexArray[y + 1][x + 1];
                var d = indexArray[y][x + 1];
                // faces
                indices.push(a, b, d);
                indices.push(b, c, d);
                // update group counter
            }
        }
    }
    function generateCap(top) {
        // save the index of the first center vertex
        var centerIndexStart = index;
        var uv = new Float32Array(2);
        var vertex = new Float32Array(3);
        var radius = (top === true) ? radiusTop : radiusBottom;
        var sign = (top === true) ? 1 : -1;
        // first we generate the center vertex data of the cap.
        // because the geometry needs one set of uvs per face,
        // we must generate a center vertex per face/segment
        for (var x = 1; x <= radialSegments; x++) {
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
        var centerIndexEnd = index;
        // now we generate the surrounding vertices, normals and uvs
        for (var x = 0; x <= radialSegments; x++) {
            var u = x / radialSegments;
            var theta = u * thetaLength + thetaStart;
            var cosTheta = Math.cos(theta);
            var sinTheta = Math.sin(theta);
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
        for (var x = 0; x < radialSegments; x++) {
            var c = centerIndexStart + x;
            var i = centerIndexEnd + x;
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
    var len = indices.length, i3 = 0, strideI = 0, i2 = 0;
    var geo = new Geometry3(len, topology, cullMode);
    if (combine) {
        var pickers = [{
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
        var result = new Float32Array(stride * len);
        for (var i = 0; i < len; i++) {
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
});

var DEFAULT_PLANE_OPTIONS = __assign(__assign({}, DEFAULT_OPTIONS), { hasIndices: true, combine: true, width: 1, height: 1, segmentX: 1, segmentY: 1 });
var createPlane3 = (function (options) {
    if (options === void 0) { options = {}; }
    var _a = __assign(__assign({}, DEFAULT_PLANE_OPTIONS), options), width = _a.width, height = _a.height, segmentX = _a.segmentX, segmentY = _a.segmentY, topology = _a.topology, cullMode = _a.cullMode, hasUV = _a.hasUV, hasNormal = _a.hasNormal, combine = _a.combine;
    var stride = 3;
    var halfX = width * 0.5;
    var halfY = height * 0.5;
    var gridX = Math.max(1, Math.round(segmentX));
    var gridY = Math.max(1, Math.round(segmentY));
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
    var geo = new Geometry3(len, topology, cullMode);
    // TODO indices 现在都是非索引版本
    if (combine) {
        var pickers = [{
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
        var result = new Float32Array(stride * len);
        for (var i = 0; i < len; i++) {
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
});

var createTriangle3 = (function (t, options, topology, cullMode) {
    if (t === void 0) { t = Triangle3.create(); }
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
            var normal = Triangle3.normal(t);
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
            var normal = Triangle3.normal(t);
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
});

var DEFAULT_SPHERE_OPTIONS = __assign(__assign({}, DEFAULT_OPTIONS), { hasIndices: true, combine: true, radius: 1, phiStart: 0, phiLength: Math.PI * 2, thetaStart: 0, thetaLength: Math.PI, widthSegments: 32, heightSegments: 32, cullMode: "back" });
var createSphere3 = (function (options) {
    if (options === void 0) { options = {}; }
    var stride = 3;
    var _a = __assign(__assign({}, DEFAULT_SPHERE_OPTIONS), options), radius = _a.radius, phiStart = _a.phiStart, phiLength = _a.phiLength, thetaStart = _a.thetaStart, thetaLength = _a.thetaLength, widthSegments = _a.widthSegments, heightSegments = _a.heightSegments, topology = _a.topology, cullMode = _a.cullMode, hasUV = _a.hasUV, hasNormal = _a.hasNormal, combine = _a.combine;
    var thetaEnd = Math.min(thetaStart + thetaLength, Math.PI);
    var index = 0;
    var grid = [];
    var vertex = new Float32Array(3);
    var normal = new Float32Array(3);
    // buffers
    var indices = [];
    var vertices = [];
    var normals = [];
    var uvs = [];
    for (var iy = 0; iy <= heightSegments; iy++) {
        var verticesRow = [];
        var v = iy / heightSegments;
        // special case for the poles
        var uOffset = 0;
        if (iy === 0 && thetaStart === 0) {
            uOffset = 0.5 / widthSegments;
        }
        else if (iy === heightSegments && thetaEnd === Math.PI) {
            uOffset = -0.5 / widthSegments;
        }
        for (var ix = 0; ix <= widthSegments; ix++) {
            var u = ix / widthSegments;
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
    for (var iy = 0; iy < heightSegments; iy++) {
        for (var ix = 0; ix < widthSegments; ix++) {
            var a = grid[iy][ix + 1];
            var b = grid[iy][ix];
            var c = grid[iy + 1][ix];
            var d = grid[iy + 1][ix + 1];
            if (iy !== 0 || thetaStart > 0)
                indices.push(a, b, d);
            if (iy !== heightSegments - 1 || thetaEnd < Math.PI)
                indices.push(b, c, d);
        }
    }
    var len = indices.length, i3 = 0, strideI = 0, i2 = 0;
    var geo = new Geometry3(len, topology, cullMode);
    // TODO indices 现在都是非索引版本
    if (combine) {
        var pickers = [{
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
        var result = new Float32Array(stride * len);
        for (var i = 0; i < len; i++) {
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
});

var index$2 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	createBox3: createBox3,
	createCircle3: createCircle3,
	createCylinder3: createCylinder3,
	createPlane3: createPlane3,
	createTriangle3: createTriangle3,
	createSphere3: createSphere3
});

var DEFAULT_BLEND_STATE = {
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

var Material = /** @class */ (function (_super) {
    __extends(Material, _super);
    function Material(vertex, fragment, uniforms, blend) {
        if (uniforms === void 0) { uniforms = []; }
        if (blend === void 0) { blend = DEFAULT_BLEND_STATE; }
        var _this = _super.call(this, "material", { vertex: vertex, fragment: fragment, uniforms: uniforms, blend: blend }) || this;
        _this.dirty = true;
        return _this;
    }
    Object.defineProperty(Material.prototype, "blend", {
        get: function () {
            return this.data.blend;
        },
        set: function (blend) {
            this.data.blend = blend;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "vertexShader", {
        get: function () {
            return this.data.vertex;
        },
        set: function (code) {
            this.data.vertex = code;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Material.prototype, "fragmentShader", {
        get: function () {
            return this.data.fragment;
        },
        set: function (code) {
            this.data.fragment = code;
        },
        enumerable: false,
        configurable: true
    });
    return Material;
}(Component$1));

var wgslShaders$2 = {
    vertex: "\n\t\tstruct Uniforms {\n\t\t\tmodelViewProjectionMatrix : mat4x4<f32>\n\t  \t};\n\t  \t@binding(0) @group(0) var<uniform> uniforms : Uniforms;\n\n\t\tstruct VertexOutput {\n\t\t\t@builtin(position) position : vec4<f32>\n\t\t};\n\n\t\t@stage(vertex) fn main(@location(0) position : vec3<f32>) -> VertexOutput {\n\t\t\tvar out: VertexOutput;\n\t\t\tout.position = uniforms.modelViewProjectionMatrix * vec4<f32>(position, 1.0);\n\t\t\treturn out;\n\t\t}\n\t",
    fragment: "\n\t\tstruct Uniforms {\n\t\t\tcolor : vec4<f32>\n\t  \t};\n\t  \t@binding(1) @group(0) var<uniform> uniforms : Uniforms;\n\n\t\t@stage(fragment) fn main() -> @location(0) vec4<f32> {\n\t\t\treturn uniforms.color;\n\t\t}\n\t"
};
var ColorMaterial = /** @class */ (function (_super) {
    __extends(ColorMaterial, _super);
    function ColorMaterial(color) {
        if (color === void 0) { color = new Float32Array([1, 1, 1, 1]); }
        var _this = _super.call(this, wgslShaders$2.vertex, wgslShaders$2.fragment, [{
                name: "color",
                value: color,
                binding: 1,
                dirty: true,
                type: "uniform-buffer"
            }]) || this;
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
}(Material));

var vertexShader$1 = "\nstruct Uniforms {\n\tmodelViewProjectionMatrix : mat4x4<f32>\n};\n\n@binding(0) @group(0) var<uniform> uniforms : Uniforms;\n\nstruct VertexOutput {\n\t@builtin(position) position : vec4<f32>,\n\t@location(0) depth : vec2<f32>\n};\n\n@stage(vertex) fn main(@location(0) position : vec3<f32>) -> VertexOutput {\n\tvar out: VertexOutput;\n\tout.position = uniforms.modelViewProjectionMatrix * vec4<f32>(position, 1.0);\n\tout.depth = vec2<f32>(out.position.z, out.position.w);\n\treturn out;\n}";
var fragmentShader$1 = "\n@stage(fragment) fn main(@location(0) depth : vec2<f32>) -> @location(0) vec4<f32> {\n\tvar fragCoordZ: f32 = (depth.x / depth.y);\n\treturn vec4<f32>(fragCoordZ, fragCoordZ, fragCoordZ, 1.0);\n}";
var NormalMaterial$1 = /** @class */ (function (_super) {
    __extends(NormalMaterial, _super);
    function NormalMaterial() {
        var _this = _super.call(this, vertexShader$1, fragmentShader$1, []) || this;
        _this.dirty = true;
        return _this;
    }
    return NormalMaterial;
}(Material));

var vertexShader = "\nstruct Uniforms {\n\tmodelViewProjectionMatrix : mat4x4<f32>\n};\n@binding(0) @group(0) var<uniform> uniforms : Uniforms;\n\nstruct VertexOutput {\n\t@builtin(position) position : vec4<f32>,\n\t@location(0) normal : vec4<f32>\n};\n\n@stage(vertex) fn main(@location(0) position : vec3<f32>, @location(1) normal : vec3<f32>) -> VertexOutput {\n\tvar out: VertexOutput;\n\tout.position = uniforms.modelViewProjectionMatrix * vec4<f32>(position, 1.0);\n\tout.normal = abs(normalize(uniforms.modelViewProjectionMatrix * vec4<f32>(normal, 0.0)));\n\treturn out;\n}";
var fragmentShader = "\n@stage(fragment) fn main(@location(0) normal : vec4<f32>) -> @location(0) vec4<f32> {\n\treturn vec4<f32>(normal.x, normal.y, normal.z, 1.0);\n}";
var NormalMaterial = /** @class */ (function (_super) {
    __extends(NormalMaterial, _super);
    function NormalMaterial() {
        var _this = _super.call(this, vertexShader, fragmentShader, []) || this;
        _this.dirty = true;
        return _this;
    }
    return NormalMaterial;
}(Material));

var ShaderMaterial = /** @class */ (function (_super) {
    __extends(ShaderMaterial, _super);
    function ShaderMaterial(vertex, fragment, uniforms, blend) {
        if (uniforms === void 0) { uniforms = []; }
        var _this = _super.call(this, vertex, fragment, uniforms, blend) || this;
        _this.dirty = true;
        return _this;
    }
    return ShaderMaterial;
}(Material));

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

var CommonData = {
    date: new Date(),
    vs: "struct Uniforms {\n        matrix: mat4x4<f32>\n    }\n    @binding(0) @group(0) var<uniform> uniforms: Uniforms;\n\n    struct VertexOutput {\n        @builtin(position) position: vec4<f32>,\n        @location(0) uv: vec2<f32>\n    }\n\n    @stage(vertex) fn main(@location(0) position: vec3<f32>, @location(2) uv: vec2<f32>) -> VertexOutput {\n        var out: VertexOutput;\n        out.position = uniforms.matrix * vec4<f32>(position, 1.0);\n        out.uv = uv;\n        return out;\n    }\n    "
};
var ShadertoyMaterial = /** @class */ (function (_super) {
    __extends(ShadertoyMaterial, _super);
    function ShadertoyMaterial(fs, texture, sampler) {
        if (sampler === void 0) { sampler = new Sampler(); }
        var _this = _super.call(this, CommonData.vs, fs, [
            {
                name: "iSampler0",
                type: "sampler",
                value: sampler,
                binding: 1,
                dirty: true,
            },
            {
                name: "iChannel0",
                type: "sampled-texture",
                value: texture,
                binding: 2,
                dirty: true,
            },
            {
                name: "uniforms",
                type: "uniform-buffer",
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
        ]) || this;
        _this.dataD = CommonData.date;
        _this.dirty = true;
        return _this;
    }
    Object.defineProperty(ShadertoyMaterial.prototype, "sampler", {
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
    Object.defineProperty(ShadertoyMaterial.prototype, "texture", {
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
    Object.defineProperty(ShadertoyMaterial.prototype, "time", {
        get: function () {
            return this.data.uniforms[2].value[8];
        },
        set: function (time) {
            this.data.uniforms[2].dirty = this.dirty = true;
            this.data.uniforms[2].value[8] = time;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ShadertoyMaterial.prototype, "mouse", {
        get: function () {
            var u = this.data.uniforms[2];
            return [u.value[6], u.value[7]];
        },
        set: function (mouse) {
            var u = this.data.uniforms[2];
            u.dirty = this.dirty = true;
            u.value[6] = mouse[0];
            u.value[7] = mouse[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ShadertoyMaterial.prototype, "date", {
        get: function () {
            return this.dataD;
        },
        set: function (d) {
            var u = this.data.uniforms[2];
            u.dirty = this.dirty = true;
            u.value[0] = d.getFullYear();
            u.value[1] = d.getMonth();
            u.value[2] = d.getDate();
            u.value[3] = d.getSeconds() + d.getMinutes() * 60 + d.getHours() * 3600;
            this.dataD = d;
        },
        enumerable: false,
        configurable: true
    });
    return ShadertoyMaterial;
}(Material));

var wgslShaders$1 = {
    vertex: "\n\t\tstruct Uniforms {\n\t\t\t matrix : mat4x4<f32>\n\t  \t};\n\t  \t@binding(0) @group(0) var<uniform> uniforms : Uniforms;\n\n\t\tstruct VertexOutput {\n\t\t\t@builtin(position) position : vec4<f32>,\n\t\t\t@location(0) uv : vec2<f32>\n\t\t};\n\n\t\t@stage(vertex) fn main(@location(0) position : vec3<f32>, @location(2) uv : vec2<f32>) -> VertexOutput {\n\t\t\tvar out: VertexOutput;\n\t\t\tout.position = uniforms.matrix * vec4<f32>(position, 1.0);\n\t\t\tout.uv = uv;\n\t\t\treturn out;\n\t\t}\n\t",
    fragment: "\n\t\t@binding(1) @group(0) var mySampler: sampler;\n\t\t@binding(2) @group(0) var myTexture: texture_2d<f32>;\n\n\t\t@stage(fragment) fn main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {\n\t\t\treturn textureSample(myTexture, mySampler, uv);\n\t\t}\n\t"
};
var TextureMaterial = /** @class */ (function (_super) {
    __extends(TextureMaterial, _super);
    function TextureMaterial(texture, sampler) {
        if (sampler === void 0) { sampler = new Sampler(); }
        var _this = _super.call(this, wgslShaders$1.vertex, wgslShaders$1.fragment, [
            {
                binding: 1,
                name: "mySampler",
                type: "sampler",
                value: sampler,
                dirty: true
            },
            {
                binding: 2,
                name: "myTexture",
                type: "sampled-texture",
                value: texture,
                dirty: true
            }
        ]) || this;
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
}(Material));

var Matrix4Component = /** @class */ (function (_super) {
    __extends(Matrix4Component, _super);
    function Matrix4Component(name, data) {
        if (data === void 0) { data = Matrix4$1.create(); }
        var _this = _super.call(this, name, data) || this;
        _this.dirty = true;
        return _this;
    }
    return Matrix4Component;
}(Component));
var updateModelMatrixComponent = function (mesh) {
    var _a;
    var p3 = mesh.getComponent(TRANSLATION_3D);
    var r3 = mesh.getComponent(ROTATION_3D);
    var s3 = mesh.getComponent(SCALING_3D);
    var a3 = mesh.getComponent(ANCHOR_3D);
    var m3 = mesh.getComponent(MODEL_3D);
    var worldMatrix = mesh.getComponent(WORLD_MATRIX);
    if (!worldMatrix) {
        worldMatrix = new Matrix4Component(WORLD_MATRIX);
        mesh.addComponent(worldMatrix);
    }
    if (!m3) {
        m3 = new Matrix4Component(MODEL_3D);
        mesh.addComponent(m3);
    }
    if ((p3 === null || p3 === void 0 ? void 0 : p3.dirty) || (r3 === null || r3 === void 0 ? void 0 : r3.dirty) || (s3 === null || s3 === void 0 ? void 0 : s3.dirty) || (a3 === null || a3 === void 0 ? void 0 : a3.dirty)) {
        Matrix4$1.fromArray((p3 === null || p3 === void 0 ? void 0 : p3.data) || Matrix4$1.UNIT_MATRIX4, m3.data);
        if (r3) {
            Matrix4$1.multiply(m3.data, r3.data, m3.data);
        }
        if (s3) {
            Matrix4$1.multiply(m3.data, s3.data, m3.data);
        }
        if (a3) {
            Matrix4$1.multiply(m3.data, a3.data, m3.data);
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
        var parentWorldMatrix = ((_a = mesh.parent.getComponent(WORLD_MATRIX)) === null || _a === void 0 ? void 0 : _a.data) || Matrix4$1.UNIT_MATRIX4;
        Matrix4$1.multiply(parentWorldMatrix, m3.data, worldMatrix.data);
    }
    else {
        Matrix4$1.fromArray(m3.data, worldMatrix.data);
    }
    return m3;
};

var Anchor3 = /** @class */ (function (_super) {
    __extends(Anchor3, _super);
    function Anchor3(vec) {
        if (vec === void 0) { vec = Vector3$1.VECTOR3_ZERO; }
        var _this = _super.call(this, ANCHOR_3D, Matrix4$1.create()) || this;
        _this.vec3 = new Vector3$1();
        Vector3$1.fromArray(vec, 0, _this.vec3);
        _this.update();
        return _this;
    }
    Object.defineProperty(Anchor3.prototype, "x", {
        get: function () {
            return this.vec3[0];
        },
        set: function (value) {
            this.vec3[0] = value;
            this.data[12] = value;
            this.dirty = true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Anchor3.prototype, "y", {
        get: function () {
            return this.vec3[1];
        },
        set: function (value) {
            this.vec3[1] = value;
            this.data[13] = value;
            this.dirty = true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Anchor3.prototype, "z", {
        get: function () {
            return this.vec3[1];
        },
        set: function (value) {
            this.vec3[2] = value;
            this.data[14] = value;
            this.dirty = true;
        },
        enumerable: false,
        configurable: true
    });
    Anchor3.prototype.set = function (arr) {
        this.vec3.set(arr);
        this.data[12] = arr[0];
        this.data[13] = arr[1];
        this.data[14] = arr[2];
        this.dirty = true;
        return this;
    };
    Anchor3.prototype.setXYZ = function (x, y, z) {
        this.vec3[0] = x;
        this.vec3[1] = y;
        this.vec3[2] = z;
        this.data[12] = x;
        this.data[13] = y;
        this.data[14] = z;
        this.dirty = true;
        return this;
    };
    Anchor3.prototype.update = function () {
        Matrix4$1.fromTranslation(this.vec3, this.data);
        this.dirty = true;
        return this;
    };
    return Anchor3;
}(Matrix4Component));

var APosition3 = /** @class */ (function (_super) {
    __extends(APosition3, _super);
    function APosition3(data) {
        if (data === void 0) { data = Matrix4$1.create(); }
        return _super.call(this, TRANSLATION_3D, data) || this;
    }
    return APosition3;
}(Matrix4Component));

var AProjection3 = /** @class */ (function (_super) {
    __extends(AProjection3, _super);
    function AProjection3(data) {
        if (data === void 0) { data = Matrix4$1.create(); }
        return _super.call(this, PROJECTION_3D, data) || this;
    }
    return AProjection3;
}(Matrix4Component));

var ARotation3 = /** @class */ (function (_super) {
    __extends(ARotation3, _super);
    function ARotation3(data) {
        if (data === void 0) { data = Matrix4$1.create(); }
        return _super.call(this, ROTATION_3D, data) || this;
    }
    return ARotation3;
}(Matrix4Component));

var AScale3 = /** @class */ (function (_super) {
    __extends(AScale3, _super);
    function AScale3(data) {
        if (data === void 0) { data = Matrix4$1.create(); }
        return _super.call(this, SCALING_3D, data) || this;
    }
    return AScale3;
}(Matrix4Component));

var EuclidPosition3 = /** @class */ (function (_super) {
    __extends(EuclidPosition3, _super);
    function EuclidPosition3(vec3) {
        if (vec3 === void 0) { vec3 = new Float32Array(3); }
        var _this = _super.call(this) || this;
        _this.vec3 = new Vector3$1();
        _this.data = Matrix4$1.identity();
        Vector3$1.fromArray(vec3, 0, _this.vec3);
        _this.update();
        return _this;
    }
    Object.defineProperty(EuclidPosition3.prototype, "x", {
        get: function () {
            return this.vec3[0];
        },
        set: function (value) {
            this.vec3[0] = value;
            this.data[12] = value;
            this.dirty = true;
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
            this.data[13] = value;
            this.dirty = true;
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
            this.data[14] = value;
            this.dirty = true;
        },
        enumerable: false,
        configurable: true
    });
    EuclidPosition3.prototype.set = function (arr) {
        this.vec3.set(arr);
        this.data[12] = arr[0];
        this.data[13] = arr[1];
        this.data[14] = arr[2];
        this.dirty = true;
        return this;
    };
    EuclidPosition3.prototype.setXYZ = function (x, y, z) {
        this.vec3[0] = x;
        this.vec3[1] = y;
        this.vec3[2] = z;
        this.data[12] = x;
        this.data[13] = y;
        this.data[14] = z;
        this.dirty = true;
        return this;
    };
    EuclidPosition3.prototype.update = function () {
        Matrix4$1.fromTranslation(this.vec3, this.data);
        this.dirty = true;
        return this;
    };
    return EuclidPosition3;
}(APosition3));

var EulerRotation3 = /** @class */ (function (_super) {
    __extends(EulerRotation3, _super);
    function EulerRotation3(euler) {
        if (euler === void 0) { euler = {
            x: 0,
            y: 0,
            z: 0,
            order: EulerAngle.ORDERS.XYZ,
        }; }
        var _this = _super.call(this) || this;
        _this.data = Matrix4$1.identity();
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
    Object.defineProperty(EulerRotation3.prototype, "order", {
        get: function () {
            return this.euler.order;
        },
        set: function (value) {
            this.euler.order = value;
            this.update();
        },
        enumerable: false,
        configurable: true
    });
    EulerRotation3.prototype.set = function (arr) {
        this.x = arr.x;
        this.y = arr.y;
        this.z = arr.z;
        this.order = arr.order;
        return this.update();
    };
    EulerRotation3.prototype.update = function () {
        Matrix4$1.fromEuler(this.euler, this.data);
        this.dirty = true;
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
        Matrix4$1.orthogonal(this.options.left, this.options.right, this.options.bottom, this.options.top, this.options.near, this.options.far, this.data);
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
        Matrix4$1.perspective(this.options.fovy, this.options.aspect, this.options.near, this.options.far, this.data);
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
        _this.data = Matrix4$1.identity();
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
            this.data[0] = value;
            this.dirty = true;
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
            this.data[5] = value;
            this.dirty = true;
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
            this.data[10] = value;
            this.dirty = true;
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
        this.data[0] = x;
        this.data[5] = y;
        this.data[10] = z;
        this.dirty = true;
        return this;
    };
    Vector3Scale3.prototype.update = function () {
        Matrix4$1.fromScaling(this.vec3, this.data);
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

var canvases = []; // 储存多个canvas，可能存在n个图同时画
function drawSpriteBlock(image, width, height, frame) {
    return __awaiter(this, void 0, void 0, function () {
        var canvas, ctx, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    canvas = canvases.pop() || document.createElement("canvas");
                    ctx = canvas.getContext("2d");
                    canvas.width = width;
                    canvas.height = height;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(image, frame.x, frame.y, frame.w, frame.h, frame.dx, frame.dy, frame.w, frame.h);
                    return [4 /*yield*/, createImageBitmap(canvas)];
                case 1:
                    result = _a.sent();
                    canvases.push(canvas);
                    return [2 /*return*/, result];
            }
        });
    });
}

var Texture = /** @class */ (function (_super) {
    __extends(Texture, _super);
    function Texture(width, height, img, name) {
        if (name === void 0) { name = "texture"; }
        var _this = _super.call(this, name, img) || this;
        _this.dirty = false;
        _this.width = 0;
        _this.height = 0;
        _this.width = width;
        _this.height = height;
        return _this;
    }
    Texture.prototype.destroy = function () {
        var _a;
        (_a = this.data) === null || _a === void 0 ? void 0 : _a.close();
        this.data = undefined;
        this.width = 0;
        this.height = 0;
    };
    Object.defineProperty(Texture.prototype, "imageBitmap", {
        get: function () {
            return this.data;
        },
        set: function (img) {
            this.dirty = true;
            this.data = img;
        },
        enumerable: false,
        configurable: true
    });
    return Texture;
}(Component));

var AtlasTexture = /** @class */ (function (_super) {
    __extends(AtlasTexture, _super);
    function AtlasTexture(json, name) {
        if (name === void 0) { name = "atlas-texture"; }
        var _this = _super.call(this, json.spriteSize.w, json.spriteSize.h, null, name) || this;
        _this.loaded = false;
        _this.framesBitmap = [];
        _this.setImage(json);
        return _this;
    }
    AtlasTexture.prototype.setImage = function (json) {
        return __awaiter(this, void 0, void 0, function () {
            var img, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.loaded = false;
                        this.dirty = false;
                        img = new Image();
                        img.src = json.image;
                        this.image = img;
                        return [4 /*yield*/, img.decode()];
                    case 1:
                        _b.sent();
                        _a = this;
                        return [4 /*yield*/, drawSpriteBlock(this.image, json.spriteSize.w, json.spriteSize.h, json.frame)];
                    case 2:
                        _a.imageBitmap = _b.sent();
                        this.loaded = true;
                        return [2 /*return*/, this];
                }
            });
        });
    };
    return AtlasTexture;
}(Texture));

var ImageBitmapTexture = /** @class */ (function (_super) {
    __extends(ImageBitmapTexture, _super);
    function ImageBitmapTexture(img, width, height, name) {
        if (name === void 0) { name = "image-texture"; }
        var _this = _super.call(this, width, height, null, name) || this;
        _this.loaded = false;
        _this.sizeChanged = false;
        _this.image = new Image();
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
}(Texture));

var SpritesheetTexture = /** @class */ (function (_super) {
    __extends(SpritesheetTexture, _super);
    function SpritesheetTexture(json, name) {
        if (name === void 0) { name = "spritesheet-texture"; }
        var _this = _super.call(this, json.spriteSize.w, json.spriteSize.h, null, name) || this;
        _this.loaded = false;
        _this.frame = 0; // 当前帧索引
        _this.framesBitmap = [];
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
                        _f.label = 2;
                    case 2:
                        _f.trys.push([2, 7, 8, 9]);
                        _a = __values(json.frames), _b = _a.next();
                        _f.label = 3;
                    case 3:
                        if (!!_b.done) return [3 /*break*/, 6];
                        item = _b.value;
                        _d = (_c = this.framesBitmap).push;
                        return [4 /*yield*/, drawSpriteBlock(this.image, json.spriteSize.w, json.spriteSize.h, item)];
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
}(Texture));

var TWEEN_STATE;
(function (TWEEN_STATE) {
    TWEEN_STATE[TWEEN_STATE["IDLE"] = 0] = "IDLE";
    TWEEN_STATE[TWEEN_STATE["START"] = 1] = "START";
    TWEEN_STATE[TWEEN_STATE["PAUSE"] = 2] = "PAUSE";
    TWEEN_STATE[TWEEN_STATE["STOP"] = -1] = "STOP";
})(TWEEN_STATE || (TWEEN_STATE = {}));
var Tween = /** @class */ (function (_super) {
    __extends(Tween, _super);
    function Tween(from, to, duration, loop) {
        if (duration === void 0) { duration = 1000; }
        if (loop === void 0) { loop = 0; }
        var _this = _super.call(this, "tween", new Map()) || this;
        _this.oldLoop = loop;
        _this.from = from;
        _this.to = to;
        _this.duration = duration;
        _this.loop = loop;
        _this.state = TWEEN_STATE.IDLE;
        _this.time = 0;
        _this.checkKeyAndType(from, to);
        return _this;
    }
    Tween.prototype.reset = function () {
        this.loop = this.oldLoop;
        this.time = 0;
        this.state = TWEEN_STATE.IDLE;
    };
    // 检查from 和 to哪些属性是可以插值的
    Tween.prototype.checkKeyAndType = function (from, to) {
        var map = this.data;
        for (var key in to) {
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
    };
    Tween.States = TWEEN_STATE;
    return Tween;
}(Component$1));

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
            else if (property === 'dirty') {
                target.dirty = value;
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
    var euler = EulerAngle.fromMatrix4(position.data);
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
});

var index$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	getEuclidPosition3Proxy: getEuclidPosition3Proxy,
	getEulerRotation3Proxy: getEulerRotation3Proxy
});

var Clearer = /** @class */ (function () {
    function Clearer(engine, color) {
        if (color === void 0) { color = new ColorGPU(); }
        this.color = new ColorGPU();
        this.engine = engine;
        this.setColor(color);
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
        if (color instanceof ColorGPU) {
            this.color = color;
        }
        else if (typeof color === "string") {
            ColorGPU.fromString(color, this.color);
        }
        else if (typeof color === "number") {
            ColorGPU.fromHex(color, 1, this.color);
        }
        else if (color instanceof ColorRGB) {
            ColorGPU.fromColorRGB(color, this.color);
        }
        else if (color instanceof ColorRGBA) {
            ColorGPU.fromColorRGBA(color, this.color);
        }
        else if (color instanceof Float32Array || color instanceof Array) {
            ColorGPU.fromArray(color, this.color);
        }
        else if (color instanceof Float32Array || color instanceof Array) {
            ColorGPU.fromArray(color, this.color);
        }
        else {
            if ("a" in color) {
                ColorGPU.fromJson(color, this.color);
            }
            else {
                ColorGPU.fromJson(__assign(__assign({}, color), { a: 1 }), this.color);
            }
        }
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

var DEG_360_RAD = Math.PI * 2;
var EPSILON = Math.pow(2, -52);

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
var closeToCommon = (function (val, target, epsilon) {
    if (epsilon === void 0) { epsilon = EPSILON; }
    return Math.abs(val - target) <= epsilon;
});

var a00$2 = 0, a01$2 = 0, a10$2 = 0, a11$2 = 0;
var b00$2 = 0, b01$2 = 0, b10$2 = 0, b11$2 = 0, det$1 = 0;
var x$3 = 0, y$3 = 0;
var UNIT_MATRIX2_DATA = [1, 0, 0, 1];
/** @class */ ((function (_super) {
    __extends(Matrix2, _super);
    function Matrix2(data) {
        if (data === void 0) { data = UNIT_MATRIX2_DATA; }
        return _super.call(this, data) || this;
    }
    Matrix2.UNIT_MATRIX2 = new Matrix2(UNIT_MATRIX2_DATA);
    Matrix2.add = function (a, b, out) {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        out[2] = a[2] + b[2];
        out[3] = a[3] + b[3];
        return out;
    };
    Matrix2.adjoint = function (a, out) {
        a00$2 = a[0];
        out[0] = a[3];
        out[1] = -a[1];
        out[2] = -a[2];
        out[3] = a00$2;
        return out;
    };
    Matrix2.clone = function (source) {
        return new Matrix2(source);
    };
    Matrix2.closeTo = function (a, b) {
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
    Matrix2.create = function (a) {
        if (a === void 0) { a = UNIT_MATRIX2_DATA; }
        return new Matrix2(a);
    };
    Matrix2.determinant = function (a) {
        return a[0] * a[3] - a[1] * a[2];
    };
    Matrix2.equals = function (a, b) {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
    };
    Matrix2.frobNorm = function (a) {
        return Math.hypot(a[0], a[1], a[2], a[3]);
    };
    Matrix2.fromArray = function (source, out) {
        if (out === void 0) { out = new Matrix2(); }
        out.set(source);
        return out;
    };
    Matrix2.fromRotation = function (rad, out) {
        if (out === void 0) { out = new Matrix2(); }
        y$3 = Math.sin(rad);
        x$3 = Math.cos(rad);
        out[0] = x$3;
        out[1] = y$3;
        out[2] = -y$3;
        out[3] = x$3;
        return out;
    };
    Matrix2.fromScaling = function (v, out) {
        if (out === void 0) { out = new Matrix2(); }
        out[0] = v[0];
        out[1] = 0;
        out[2] = 0;
        out[3] = v[1];
        return out;
    };
    Matrix2.identity = function (out) {
        if (out === void 0) { out = new Matrix2(); }
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 1;
        return out;
    };
    Matrix2.invert = function (a, out) {
        if (out === void 0) { out = new Matrix2(); }
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
    Matrix2.minus = function (a, b, out) {
        if (out === void 0) { out = new Matrix2(); }
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        out[2] = a[2] - b[2];
        out[3] = a[3] - b[3];
        return out;
    };
    Matrix2.multiply = function (a, b, out) {
        if (out === void 0) { out = new Matrix2(); }
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
    Matrix2.multiplyScalar = function (a, b, out) {
        if (out === void 0) { out = new Matrix2(); }
        out[0] = a[0] * b;
        out[1] = a[1] * b;
        out[2] = a[2] * b;
        out[3] = a[3] * b;
        return out;
    };
    Matrix2.rotate = function (a, rad, out) {
        if (out === void 0) { out = new Matrix2(); }
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
    Matrix2.scale = function (a, v, out) {
        if (out === void 0) { out = new Matrix2(); }
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
    Matrix2.toString = function (a) {
        return "mat2(".concat(a[0], ", ").concat(a[1], ", ").concat(a[2], ", ").concat(a[3], ")");
    };
    Matrix2.transpose = function (a, out) {
        if (out === void 0) { out = new Matrix2(); }
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
    return Matrix2;
})(Float32Array));

var a00$1 = 0, a01$1 = 0, a02$1 = 0, a11$1 = 0, a10$1 = 0, a12$1 = 0, a20$1 = 0, a21$1 = 0, a22$1 = 0;
var b00$1 = 0, b01$1 = 0, b02$1 = 0, b11$1 = 0, b10$1 = 0, b12$1 = 0, b20$1 = 0, b21$1 = 0, b22$1 = 0;
var x$2 = 0, y$2 = 0;
var UNIT_MATRIX3_DATA = [1, 0, 0, 0, 1, 0, 0, 0, 1];
/** @class */ ((function (_super) {
    __extends(Matrix3, _super);
    function Matrix3(data) {
        if (data === void 0) { data = UNIT_MATRIX3_DATA; }
        return _super.call(this, data) || this;
    }
    Matrix3.UNIT_MATRIX3 = new Matrix3(UNIT_MATRIX3_DATA);
    Matrix3.clone = function (source) {
        return new Matrix3(source);
    };
    Matrix3.cofactor00 = function (a) {
        return a[4] * a[8] - a[5] * a[7];
    };
    Matrix3.cofactor01 = function (a) {
        return a[1] * a[8] - a[7] * a[2];
    };
    Matrix3.cofactor02 = function (a) {
        return a[1] * a[5] - a[4] * a[2];
    };
    Matrix3.cofactor10 = function (a) {
        return a[3] * a[8] - a[6] * a[5];
    };
    Matrix3.cofactor11 = function (a) {
        return a[0] * a[8] - a[6] * a[2];
    };
    Matrix3.cofactor12 = function (a) {
        return a[0] * a[5] - a[3] * a[2];
    };
    Matrix3.cofactor20 = function (a) {
        return a[3] * a[7] - a[6] * a[4];
    };
    Matrix3.cofactor21 = function (a) {
        return a[0] * a[7] - a[6] * a[1];
    };
    Matrix3.cofactor22 = function (a) {
        return a[0] * a[4] - a[3] * a[1];
    };
    Matrix3.create = function () {
        return new Matrix3(UNIT_MATRIX3_DATA);
    };
    Matrix3.determinant = function (a) {
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
    Matrix3.fromArray = function (source, out) {
        if (out === void 0) { out = new Matrix3(); }
        out.set(source);
        return out;
    };
    Matrix3.fromMatrix4 = function (mat4, out) {
        if (out === void 0) { out = new Matrix3(); }
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
    Matrix3.fromRotation = function (rad, out) {
        if (out === void 0) { out = new Matrix3(); }
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
    Matrix3.fromScaling = function (v, out) {
        if (out === void 0) { out = new Matrix3(); }
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
    Matrix3.fromTranslation = function (v, out) {
        if (out === void 0) { out = new Matrix3(); }
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
    Matrix3.identity = function (out) {
        if (out === void 0) { out = new Matrix3(); }
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
    Matrix3.invert = function (a, out) {
        if (out === void 0) { out = new Matrix3(); }
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
        var det = a00$1 * b01$1 + a01$1 * b11$1 + a02$1 * b21$1;
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
    Matrix3.multiply = function () { return function (a, b, out) {
        if (out === void 0) { out = new Matrix3(); }
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
    }; };
    Matrix3.rotate = function (a, rad, out) {
        if (out === void 0) { out = new Matrix3(); }
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
    Matrix3.scale = function (a, v, out) {
        if (out === void 0) { out = new Matrix3(); }
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
    Matrix3.translate = function (a, v, out) {
        if (out === void 0) { out = new Matrix3(); }
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
    Matrix3.transpose = function (a, out) {
        if (out === void 0) { out = new Matrix3(); }
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
    return Matrix3;
})(Float32Array));

var EulerRotationOrders;
(function (EulerRotationOrders) {
    EulerRotationOrders["XYZ"] = "xyz";
    EulerRotationOrders["ZXY"] = "zxy";
    EulerRotationOrders["YZX"] = "yzx";
    EulerRotationOrders["XZY"] = "xzy";
    EulerRotationOrders["ZYX"] = "zyx";
    EulerRotationOrders["YXZ"] = "yxz";
})(EulerRotationOrders || (EulerRotationOrders = {}));

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
var clampCommon = (function (val, min, max) {
    return Math.max(min, Math.min(max, val));
});

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
var clampSafeCommon = (function (val, a, b) {
    if (a > b) {
        return Math.max(b, Math.min(a, val));
    }
    else if (b > a) {
        return Math.max(a, Math.min(b, val));
    }
    return a;
});

var ax$1, ay$1, az$1, bx$1, by$1, bz$1;
var ag, s$2;
var Vector3 = /** @class */ (function (_super) {
    __extends(Vector3, _super);
    function Vector3(x, y, z) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (z === void 0) { z = 0; }
        var _this = _super.call(this, 3) || this;
        _this[0] = x;
        _this[1] = y;
        _this[2] = z;
        return _this;
    }
    Object.defineProperty(Vector3.prototype, "x", {
        get: function () {
            return this[0];
        },
        set: function (value) {
            this[0] = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Vector3.prototype, "y", {
        get: function () {
            return this[1];
        },
        set: function (value) {
            this[1] = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Vector3.prototype, "z", {
        get: function () {
            return this[2];
        },
        set: function (value) {
            this[2] = value;
        },
        enumerable: false,
        configurable: true
    });
    Vector3.VECTOR3_ZERO = new Float32Array([0, 0, 0]);
    Vector3.VECTOR3_ONE = new Float32Array([1, 1, 1]);
    Vector3.VECTOR3_TOP = new Float32Array([0, 1, 0]);
    Vector3.VECTOR3_BOTTOM = new Float32Array([0, -1, 0]);
    Vector3.VECTOR3_LEFT = new Float32Array([-1, 0, 0]);
    Vector3.VECTOR3_RIGHT = new Float32Array([1, 0, 0]);
    Vector3.VECTOR3_FRONT = new Float32Array([0, 0, -1]);
    Vector3.VECTOR3_BACK = new Float32Array([0, 0, 1]);
    Vector3.add = function (a, b, out) {
        if (out === void 0) { out = new Vector3(); }
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        out[2] = a[2] + b[2];
        return out;
    };
    Vector3.addScalar = function (a, b, out) {
        if (out === void 0) { out = new Vector3(); }
        out[0] = a[0] + b;
        out[1] = a[1] + b;
        out[2] = a[2] + b;
        return out;
    };
    Vector3.angle = function (a, b) {
        ax$1 = a[0];
        ay$1 = a[1];
        az$1 = a[2];
        bx$1 = b[0];
        by$1 = b[1];
        bz$1 = b[2];
        var mag1 = Math.sqrt(ax$1 * ax$1 + ay$1 * ay$1 + az$1 * az$1), mag2 = Math.sqrt(bx$1 * bx$1 + by$1 * by$1 + bz$1 * bz$1), mag = mag1 * mag2, cosine = mag && Vector3.dot(a, b) / mag;
        return Math.acos(clampCommon(cosine, -1, 1));
    };
    Vector3.clamp = function (a, min, max, out) {
        if (out === void 0) { out = new Vector3(); }
        out[0] = clampCommon(a[0], min[0], max[0]);
        out[1] = clampCommon(a[1], min[1], max[1]);
        out[2] = clampCommon(a[2], min[2], max[2]);
        return out;
    };
    Vector3.clampSafe = function (a, min, max, out) {
        if (out === void 0) { out = new Vector3(); }
        out[0] = clampSafeCommon(a[0], min[0], max[0]);
        out[1] = clampSafeCommon(a[1], min[1], max[1]);
        out[1] = clampSafeCommon(a[2], min[2], max[2]);
        return out;
    };
    Vector3.clampScalar = function (a, min, max, out) {
        if (out === void 0) { out = new Vector3(); }
        out[0] = clampCommon(a[0], min, max);
        out[1] = clampCommon(a[1], min, max);
        out[2] = clampCommon(a[2], min, max);
        return out;
    };
    Vector3.clone = function (a, out) {
        if (out === void 0) { out = new Vector3(); }
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        return out;
    };
    Vector3.closeTo = function (a, b) {
        return closeToCommon(a[0], b[0]) && closeToCommon(a[1], b[1]) && closeToCommon(a[2], b[2]);
    };
    Vector3.create = function (x, y, z, out) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (z === void 0) { z = 0; }
        if (out === void 0) { out = new Vector3(); }
        out[0] = x;
        out[1] = y;
        out[2] = z;
        return out;
    };
    Vector3.cross = function (a, b, out) {
        if (out === void 0) { out = new Vector3(); }
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
    Vector3.distanceTo = function (a, b) {
        ax$1 = b[0] - a[0];
        ay$1 = b[1] - a[1];
        az$1 = b[2] - a[2];
        return Math.hypot(ax$1, ay$1, az$1);
    };
    Vector3.distanceToManhattan = function (a, b) {
        return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
    };
    Vector3.distanceToSquared = function (a, b) {
        ax$1 = a[0] - b[0];
        ay$1 = a[1] - b[1];
        az$1 = a[2] - b[2];
        return ax$1 * ax$1 + ay$1 * ay$1 + az$1 * az$1;
    };
    Vector3.divide = function (a, b, out) {
        if (out === void 0) { out = new Vector3(); }
        out[0] = a[0] / b[0];
        out[1] = a[1] / b[1];
        out[2] = a[2] / b[2];
        return out;
    };
    Vector3.divideScalar = function (a, b, out) {
        if (out === void 0) { out = new Vector3(); }
        out[0] = a[0] / b;
        out[1] = a[1] / b;
        out[2] = a[2] / b;
        return out;
    };
    Vector3.dot = function (a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    };
    Vector3.equals = function (a, b) {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
    };
    Vector3.fromArray = function (a, offset, out) {
        if (offset === void 0) { offset = 0; }
        if (out === void 0) { out = new Vector3(); }
        out[0] = a[offset];
        out[1] = a[offset + 1];
        out[2] = a[offset + 2];
        return out;
    };
    Vector3.fromScalar = function (num, out) {
        if (out === void 0) { out = new Vector3(3); }
        out[0] = out[1] = out[2] = num;
        return out;
    };
    Vector3.fromValues = function (x, y, z, out) {
        if (out === void 0) { out = new Vector3(3); }
        out[0] = x;
        out[1] = y;
        out[2] = z;
        return out;
    };
    Vector3.hermite = function (a, b, c, d, t, out) {
        if (out === void 0) { out = new Vector3(); }
        ag = t * t;
        var factor1 = ag * (2 * t - 3) + 1;
        var factor2 = ag * (t - 2) + t;
        var factor3 = ag * (t - 1);
        var factor4 = ag * (3 - 2 * t);
        out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
        out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
        out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
        return out;
    };
    Vector3.inverse = function (a, out) {
        if (out === void 0) { out = new Vector3(); }
        out[0] = 1.0 / a[0];
        out[1] = 1.0 / a[1];
        out[2] = 1.0 / a[2];
        return out;
    };
    Vector3.norm = function (a) {
        return Math.sqrt(Vector3.lengthSquared(a));
    };
    Vector3.lengthManhattan = function (a) {
        return Math.abs(a[0]) + Math.abs(a[1]) + Math.abs(a[2]);
    };
    Vector3.lengthSquared = function (a) {
        return a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
    };
    Vector3.lerp = function (a, b, alpha, out) {
        if (out === void 0) { out = new Vector3(); }
        out[0] += (b[0] - a[0]) * alpha;
        out[1] += (b[1] - a[1]) * alpha;
        out[2] += (b[2] - a[2]) * alpha;
        return out;
    };
    Vector3.max = function (a, b, out) {
        if (out === void 0) { out = new Vector3(); }
        out[0] = Math.max(a[0], b[0]);
        out[1] = Math.max(a[1], b[1]);
        out[2] = Math.max(a[2], b[2]);
        return out;
    };
    Vector3.min = function (a, b, out) {
        if (out === void 0) { out = new Vector3(); }
        out[0] = Math.min(a[0], b[0]);
        out[1] = Math.min(a[1], b[1]);
        out[2] = Math.min(a[2], b[2]);
        return out;
    };
    Vector3.minus = function (a, b, out) {
        if (out === void 0) { out = new Vector3(); }
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        out[2] = a[2] - b[2];
        return out;
    };
    Vector3.minusScalar = function (a, b, out) {
        if (out === void 0) { out = new Vector3(); }
        out[0] = a[0] - b;
        out[1] = a[1] - b;
        out[2] = a[2] - b;
        return out;
    };
    Vector3.multiply = function (a, b, out) {
        if (out === void 0) { out = new Vector3(); }
        out[0] = a[0] * b[0];
        out[1] = a[1] * b[1];
        out[2] = a[2] * b[2];
        return out;
    };
    Vector3.multiplyScalar = function (a, scalar, out) {
        if (out === void 0) { out = new Vector3(); }
        out[0] = a[0] * scalar;
        out[1] = a[1] * scalar;
        out[2] = a[2] * scalar;
        return out;
    };
    Vector3.negate = function (a, out) {
        if (out === void 0) { out = new Vector3(); }
        out[0] = -a[0];
        out[1] = -a[1];
        out[2] = -a[2];
        return out;
    };
    Vector3.normalize = function (a, out) {
        if (out === void 0) { out = new Vector3(); }
        return Vector3.divideScalar(a, Vector3.norm(a) || 1, out);
    };
    Vector3.rotateX = function (a, b, rad, out) {
        if (out === void 0) { out = new Vector3(); }
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
    Vector3.rotateY = function (a, b, rad, out) {
        if (out === void 0) { out = new Vector3(); }
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
    Vector3.rotateZ = function (a, b, rad, out) {
        if (out === void 0) { out = new Vector3(); }
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
    Vector3.round = function (a, out) {
        if (out === void 0) { out = new Vector3(); }
        out[0] = Math.round(a[0]);
        out[1] = Math.round(a[1]);
        out[2] = Math.round(a[2]);
        return out;
    };
    Vector3.set = function (x, y, z, out) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (z === void 0) { z = 0; }
        if (out === void 0) { out = new Vector3(); }
        out[0] = x;
        out[1] = y;
        out[2] = z;
        return out;
    };
    Vector3.setNorm = function (a, len, out) {
        if (out === void 0) { out = new Vector3(); }
        return Vector3.multiplyScalar(Vector3.normalize(a, out), len, out);
    };
    Vector3.slerp = function (a, b, t, out) {
        if (out === void 0) { out = new Vector3(); }
        ag = Math.acos(Math.min(Math.max(Vector3.dot(a, b), -1), 1));
        s$2 = Math.sin(ag);
        ax$1 = Math.sin((1 - t) * ag) / s$2;
        bx$1 = Math.sin(t * ag) / s$2;
        out[0] = ax$1 * a[0] + bx$1 * b[0];
        out[1] = ax$1 * a[1] + bx$1 * b[1];
        out[2] = ax$1 * a[2] + bx$1 * b[2];
        return out;
    };
    Vector3.toString = function (a) {
        return "(".concat(a[0], ", ").concat(a[1], ", ").concat(a[2], ")");
    };
    Vector3.transformMatrix3 = function (a, m, out) {
        if (out === void 0) { out = new Vector3(); }
        ax$1 = a[0];
        ay$1 = a[1];
        az$1 = a[2];
        out[0] = ax$1 * m[0] + ay$1 * m[3] + az$1 * m[6];
        out[1] = ax$1 * m[1] + ay$1 * m[4] + az$1 * m[7];
        out[2] = ax$1 * m[2] + ay$1 * m[5] + az$1 * m[8];
        return out;
    };
    Vector3.transformMatrix4 = function (a, m, out) {
        if (out === void 0) { out = new Vector3(); }
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
    Vector3.transformQuat = function (a, q, out) {
        if (out === void 0) { out = new Vector3(); }
        var qx = q[0], qy = q[1], qz = q[2], qw = q[3];
        var x = a[0], y = a[1], z = a[2];
        // var qvec = [qx, qy, qz];
        // var uv = vec3.cross([], qvec, a);
        var uvx = qy * z - qz * y, uvy = qz * x - qx * z, uvz = qx * y - qy * x;
        // var uuv = vec3.cross([], qvec, uv);
        var uuvx = qy * uvz - qz * uvy, uuvy = qz * uvx - qx * uvz, uuvz = qx * uvy - qy * uvx;
        // vec3.scale(uv, uv, 2 * w);
        var w2 = qw * 2;
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
    return Vector3;
}(Float32Array));

/**
 * @function floorToZero
 * @desc 以0为中心取整
 * @param {number} num 数值
 * @return {number} 取整之后的结果
 * @example Mathx.roundToZero(0.8 ); // 0;
 * Mathx.roundToZero(-0.8); // 0;
 * Mathx.roundToZero(-1.1); // -1;
 */
var floorToZeroCommon = (function (num) {
    return num < 0 ? Math.ceil(num) : Math.floor(num);
});

var a00 = 0, a01 = 0, a02 = 0, a03 = 0, a11 = 0, a10 = 0, a12 = 0, a13 = 0, a20 = 0, a21 = 0, a22 = 0, a23 = 0, a31 = 0, a30 = 0, a32 = 0, a33 = 0;
var b00 = 0, b01 = 0, b02 = 0, b03 = 0, b11 = 0, b10 = 0, b12 = 0, b13 = 0, b20 = 0, b21 = 0, b22 = 0, b23 = 0, b31 = 0, b30 = 0, b32 = 0, b33 = 0;
var x$1 = 0, y$1 = 0, z = 0, det = 0, len$1 = 0, s$1 = 0, t = 0, a = 0, b = 0, c$1 = 0, d = 0, e = 0, f = 0;
var UNIT_MATRIX4_DATA = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
var Matrix4 = /** @class */ (function (_super) {
    __extends(Matrix4, _super);
    function Matrix4(data) {
        if (data === void 0) { data = UNIT_MATRIX4_DATA; }
        return _super.call(this, data) || this;
    }
    Matrix4.UNIT_MATRIX4 = new Matrix4(UNIT_MATRIX4_DATA);
    Matrix4.clone = function (source) {
        return new Matrix4(source);
    };
    Matrix4.create = function () {
        return new Matrix4(UNIT_MATRIX4_DATA);
    };
    Matrix4.determinant = function (a) {
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
    Matrix4.fromArray = function (source, out) {
        if (out === void 0) { out = new Matrix4(); }
        out.set(source);
        return out;
    };
    Matrix4.fromEuler = function (euler, out) {
        if (out === void 0) { out = new Matrix4(); }
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
            var ae = a * e, af = a * f, be = b * e, bf = b * f;
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
            var ce = c$1 * e, cf = c$1 * f, de = d * e, df = d * f;
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
            var ce = c$1 * e, cf = c$1 * f, de = d * e, df = d * f;
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
            var ae = a * e, af = a * f, be = b * e, bf = b * f;
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
            var ac = a * c$1, ad = a * d, bc = b * c$1, bd = b * d;
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
            var ac = a * c$1, ad = a * d, bc = b * c$1, bd = b * d;
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
    Matrix4.fromQuaternion = function (q, out) {
        if (out === void 0) { out = new Matrix4(); }
        var x = q[0], y = q[1], z = q[2], w = q[3];
        var x2 = x + x;
        var y2 = y + y;
        var z2 = z + z;
        var xx = x * x2;
        var yx = y * x2;
        var yy = y * y2;
        var zx = z * x2;
        var zy = z * y2;
        var zz = z * z2;
        var wx = w * x2;
        var wy = w * y2;
        var wz = w * z2;
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
    Matrix4.fromRotation = function (rad, axis, out) {
        if (out === void 0) { out = new Matrix4(); }
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
    Matrix4.fromRotationX = function (rad, out) {
        if (out === void 0) { out = new Matrix4(); }
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
    Matrix4.fromRotationY = function (rad, out) {
        if (out === void 0) { out = new Matrix4(); }
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
    Matrix4.fromRotationZ = function (rad, out) {
        if (out === void 0) { out = new Matrix4(); }
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
    Matrix4.fromScaling = function (v, out) {
        if (out === void 0) { out = new Matrix4(); }
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
    Matrix4.fromTranslation = function (v, out) {
        if (out === void 0) { out = new Matrix4(); }
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
    Matrix4.identity = function (out) {
        if (out === void 0) { out = new Matrix4(); }
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
    Matrix4.invert = function (a, out) {
        if (out === void 0) { out = new Matrix4(); }
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
    Matrix4.lookAt = function (eye, center, up, out) {
        if (up === void 0) { up = Vector3.VECTOR3_TOP; }
        if (out === void 0) { out = new Matrix4(); }
        var x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
        var eyex = eye[0];
        var eyey = eye[1];
        var eyez = eye[2];
        var upx = up[0];
        var upy = up[1];
        var upz = up[2];
        var centerx = center[0];
        var centery = center[1];
        var centerz = center[2];
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
    Matrix4.multiply = function (a, b, out) {
        if (out === void 0) { out = new Matrix4(); }
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
    Matrix4.orthogonal = function (left, right, bottom, top, near, far, out) {
        if (out === void 0) { out = new Matrix4(); }
        var lr = 1 / (left - right);
        var bt = 1 / (bottom - top);
        var nf = 1 / (near - far);
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
    Matrix4.perspective = function (fovy, aspect, near, far, out) {
        if (out === void 0) { out = new Matrix4(); }
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
    Matrix4.rotate = function (a, rad, axis, out) {
        if (out === void 0) { out = new Matrix4(); }
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
    Matrix4.rotateX = function (a, rad, out) {
        if (out === void 0) { out = new Matrix4(); }
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
    Matrix4.rotateY = function (a, rad, out) {
        if (out === void 0) { out = new Matrix4(); }
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
    Matrix4.rotateZ = function (a, rad, out) {
        if (out === void 0) { out = new Matrix4(); }
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
    Matrix4.scale = function (a, v, out) {
        if (out === void 0) { out = new Matrix4(); }
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
    Matrix4.targetTo = function (eye, target, up, out) {
        if (up === void 0) { up = Vector3.VECTOR3_TOP; }
        if (out === void 0) { out = new Matrix4(); }
        var eyex = eye[0], eyey = eye[1], eyez = eye[2], upx = up[0], upy = up[1], upz = up[2];
        var z0 = eyex - target[0], z1 = eyey - target[1], z2 = eyez - target[2];
        var len = z0 * z0 + z1 * z1 + z2 * z2;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            z0 *= len;
            z1 *= len;
            z2 *= len;
        }
        var x0 = upy * z2 - upz * z1, x1 = upz * z0 - upx * z2, x2 = upx * z1 - upy * z0;
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
    Matrix4.translate = function (a, v, out) {
        if (out === void 0) { out = new Matrix4(); }
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
    Matrix4.transpose = function (a, out) {
        if (out === void 0) { out = new Matrix4(); }
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
    return Matrix4;
}(Float32Array));

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
        var _a, _b, _c;
        var cacheData = this.entityCacheData.get(mesh);
        if (!cacheData || ((_a = mesh.getComponent(MATERIAL)) === null || _a === void 0 ? void 0 : _a.dirty)) {
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
        Matrix4.multiply((_b = camera.getComponent(PROJECTION_3D)) === null || _b === void 0 ? void 0 : _b.data, Matrix4.invert(updateModelMatrixComponent(camera).data), mvp);
        Matrix4.multiply(mvp, (_c = mesh.getComponent(WORLD_MATRIX)) === null || _c === void 0 ? void 0 : _c.data, mvp);
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
                depthCompare: 'always',
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
                    blend: material === null || material === void 0 ? void 0 : material.data.blend
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
    vertex: "\n\t\tstruct Uniforms {\n\t\t\tmodelViewProjectionMatrix : mat4x4<f32>\n\t  \t};\n\t  \t@binding(0) @group(0) var<uniform> uniforms : Uniforms;\n\n\t\tstruct VertexOutput {\n\t\t\t@builtin(position) Position : vec4<f32>\n\t\t};\n\n\t\tfn mapRange(\n\t\t\tvalue: f32,\n\t\t\trange1: vec2<f32>,\n\t\t\trange2: vec2<f32>,\n\t\t) -> f32 {\n\t\t\tvar d1: f32 = range1.y - range1.x;\n\t\t\tvar d2: f32 = range2.y - range2.x;\n\t\t\n\t\t\treturn (value - d1 * 0.5) / d2 / d1;\n\t\t};\n\n\t\t@stage(vertex) fn main(@location(0) position : vec3<f32>) -> VertexOutput {\n\t\t\tvar output : VertexOutput;\n\t\t\toutput.Position = uniforms.modelViewProjectionMatrix * vec4<f32>(position, 1.0);\n\t\t\tif (output.Position.w == 1.0) {\n\t\t\t\toutput.Position.z = mapRange(output.Position.z, vec2<f32>(-1.0, 1.0), vec2<f32>(1.0, 0.0));\n\t\t\t}\n\t\t\treturn output;\n\t\t}\n\t",
    fragment: "\n\t\t@stage(fragment) fn main() -> @location(0) vec4<f32> {\n\t\t\treturn vec4<f32>(1., 1., 1., 1.0);\n\t\t}\n\t"
};

var weakMapTmp;
var System = /** @class */ (function () {
    function System(name, fitRule) {
        if (name === void 0) { name = ""; }
        this.id = IdGeneratorInstance.next();
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
    Object.defineProperty(System.prototype, "disabled", {
        get: function () {
            return this._disabled;
        },
        set: function (value) {
            this._disabled = value;
        },
        enumerable: false,
        configurable: true
    });
    System.prototype.checkUpdatedEntities = function (manager) {
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
    System.prototype.checkEntityManager = function (manager) {
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
    System.prototype.query = function (entity) {
        return this.rule(entity);
    };
    System.prototype.run = function (world) {
        var _this = this;
        var _a;
        if (world.entityManager) {
            (_a = this.entitySet.get(world.entityManager)) === null || _a === void 0 ? void 0 : _a.forEach(function (item) {
                if (!item.disabled) {
                    _this.handle(item, world.store);
                }
            });
        }
        return this;
    };
    System.prototype.destroy = function () {
        for (var i = this.usedBy.length - 1; i > -1; i--) {
            this.usedBy[i].removeElement(this);
        }
        return this;
    };
    return System;
}());

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
            size: [engine.canvas.width, engine.canvas.height],
            compositingAlphaMode: "opaque"
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
        return this;
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
}(System));

var x = 0, y = 0, c = 0, s = 0;
var Vector2 = /** @class */ (function (_super) {
    __extends(Vector2, _super);
    function Vector2(x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        var _this = _super.call(this, 2) || this;
        _this[0] = x;
        _this[1] = y;
        return _this;
    }
    Object.defineProperty(Vector2.prototype, "x", {
        get: function () {
            return this[0];
        },
        set: function (value) {
            this[0] = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Vector2.prototype, "y", {
        get: function () {
            return this[1];
        },
        set: function (value) {
            this[1] = value;
        },
        enumerable: false,
        configurable: true
    });
    Vector2.VECTOR2_ZERO = new Float32Array([0, 0]);
    Vector2.VECTOR2_TOP = new Float32Array([0, 1]);
    Vector2.VECTOR2_BOTTOM = new Float32Array([0, -1]);
    Vector2.VECTOR2_LEFT = new Float32Array([-1, 0]);
    Vector2.VECTOR2_RIGHT = new Float32Array([1, 0]);
    Vector2.add = function (a, b, out) {
        if (out === void 0) { out = new Vector2(); }
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        return out;
    };
    Vector2.addScalar = function (a, b, out) {
        if (out === void 0) { out = new Vector2(2); }
        out[0] = a[0] + b;
        out[1] = a[1] + b;
        return out;
    };
    Vector2.angle = function (a) {
        return Math.atan2(a[1], a[0]);
    };
    Vector2.ceil = function (a, out) {
        if (out === void 0) { out = new Vector2(); }
        out[0] = Math.ceil(a[0]);
        out[1] = Math.ceil(a[1]);
        return out;
    };
    Vector2.clamp = function (a, min, max, out) {
        if (out === void 0) { out = new Vector2(); }
        out[0] = clampCommon(a[0], min[0], max[0]);
        out[1] = clampCommon(a[1], min[1], max[1]);
        return out;
    };
    Vector2.clampSafe = function (a, min, max, out) {
        if (out === void 0) { out = new Vector2(); }
        out[0] = clampSafeCommon(a[0], min[0], max[0]);
        out[1] = clampSafeCommon(a[1], min[1], max[1]);
        return out;
    };
    Vector2.clampLength = function (a, min, max, out) {
        if (out === void 0) { out = new Vector2(); }
        out[0] = clampSafeCommon(a[0], min[0], max[0]);
        out[1] = clampSafeCommon(a[1], min[1], max[1]);
        return out;
    };
    Vector2.clampScalar = function (a, min, max, out) {
        if (out === void 0) { out = new Vector2(); }
        out[0] = clampCommon(a[0], min, max);
        out[1] = clampCommon(a[1], min, max);
        return out;
    };
    Vector2.closeTo = function (a, b, epsilon) {
        if (epsilon === void 0) { epsilon = EPSILON; }
        return Vector2.distanceTo(a, b) <= epsilon;
    };
    Vector2.closeToRect = function (a, b, epsilon) {
        if (epsilon === void 0) { epsilon = EPSILON; }
        return closeToCommon(a[0], b[0], epsilon) && closeToCommon(a[1], b[1], epsilon);
    };
    Vector2.closeToManhattan = function (a, b, epsilon) {
        if (epsilon === void 0) { epsilon = EPSILON; }
        return Vector2.distanceToManhattan(a, b) <= epsilon;
    };
    Vector2.clone = function (a, out) {
        if (out === void 0) { out = new Vector2(); }
        out[0] = a[0];
        out[1] = a[1];
        return out;
    };
    Vector2.cross = function (a, b) {
        return a[0] * b[1] - a[1] * b[0];
    };
    Vector2.create = function (x, y, out) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (out === void 0) { out = new Vector2(); }
        out[0] = x;
        out[1] = y;
        return out;
    };
    Vector2.distanceTo = function (a, b) {
        x = b[0] - a[0];
        y = b[1] - a[1];
        return Math.hypot(x, y);
    };
    Vector2.distanceToManhattan = function (a, b) {
        return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    };
    Vector2.distanceToSquared = function (a, b) {
        x = a[0] - b[0];
        y = a[1] - b[1];
        return x * x + y * y;
    };
    Vector2.divide = function (a, b, out) {
        if (out === void 0) { out = new Vector2(); }
        out[0] = a[0] / b[0];
        out[1] = a[1] / b[1];
        return out;
    };
    Vector2.divideScalar = function (a, scalar, out) {
        if (out === void 0) { out = new Vector2(); }
        return Vector2.multiplyScalar(a, 1 / scalar, out);
    };
    Vector2.dot = function (a, b) {
        return a[0] * b[0] + a[1] * b[1];
    };
    Vector2.equals = function (a, b) {
        return a[0] === b[0] && a[1] === b[1];
    };
    Vector2.floor = function (a, out) {
        if (out === void 0) { out = new Vector2(); }
        out[0] = Math.floor(a[0]);
        out[1] = Math.floor(a[1]);
        return out;
    };
    Vector2.floorToZero = function (a, out) {
        if (out === void 0) { out = new Vector2(); }
        out[0] = floorToZeroCommon(a[0]);
        out[1] = floorToZeroCommon(a[1]);
        return out;
    };
    Vector2.fromArray = function (arr, index, out) {
        if (index === void 0) { index = 0; }
        if (out === void 0) { out = new Vector2(); }
        out[0] = arr[index];
        out[1] = arr[index + 1];
        return out;
    };
    Vector2.fromJson = function (j, out) {
        if (out === void 0) { out = new Vector2(); }
        out[0] = j.x;
        out[1] = j.y;
        return out;
    };
    Vector2.fromPolar = function (p, out) {
        if (out === void 0) { out = new Vector2(); }
        out[0] = Math.cos(p.a) * p.r;
        out[1] = Math.sin(p.a) * p.r;
        return out;
    };
    Vector2.fromScalar = function (value, out) {
        if (value === void 0) { value = 0; }
        if (out === void 0) { out = new Vector2(); }
        out[0] = out[1] = value;
        return out;
    };
    Vector2.inverse = function (a, out) {
        if (out === void 0) { out = new Vector2(); }
        out[0] = 1 / a[0] || 0;
        out[1] = 1 / a[1] || 0;
        return out;
    };
    Vector2.norm = function (a) {
        return Math.sqrt(a[0] * a[0] + a[1] * a[1]);
    };
    Vector2.lengthManhattan = function (a) {
        return Math.abs(a[0]) + Math.abs(a[1]);
    };
    Vector2.lengthSquared = function (a) {
        return a[0] * a[0] + a[1] * a[1];
    };
    Vector2.lerp = function (a, b, alpha, out) {
        if (out === void 0) { out = new Vector2(); }
        out[0] = (b[0] - a[0]) * alpha + a[0];
        out[1] = (b[1] - a[1]) * alpha + a[1];
        return out;
    };
    Vector2.max = function (a, b, out) {
        if (out === void 0) { out = new Vector2(); }
        out[0] = Math.max(a[0], b[0]);
        out[1] = Math.max(a[1], b[1]);
        return out;
    };
    Vector2.min = function (a, b, out) {
        if (out === void 0) { out = new Vector2(); }
        out[0] = Math.min(a[0], b[0]);
        out[1] = Math.min(a[1], b[1]);
        return out;
    };
    Vector2.minus = function (a, b, out) {
        if (out === void 0) { out = new Vector2(); }
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[0];
        return out;
    };
    Vector2.minusScalar = function (a, num, out) {
        if (out === void 0) { out = new Vector2(); }
        out[0] = a[0] - num;
        out[1] = a[1] - num;
        return out;
    };
    Vector2.multiply = function (a, b, out) {
        if (out === void 0) { out = new Vector2(); }
        out[0] = a[0] * b[0];
        out[1] = a[1] * b[1];
        return out;
    };
    Vector2.multiplyScalar = function (a, scalar, out) {
        if (out === void 0) { out = new Vector2(); }
        out[0] = a[0] * scalar;
        out[1] = a[1] * scalar;
        return out;
    };
    Vector2.negate = function (a, out) {
        if (out === void 0) { out = new Vector2(); }
        out[0] = -a[0];
        out[1] = -a[1];
        return out;
    };
    Vector2.normalize = function (a, out) {
        if (out === void 0) { out = new Vector2(); }
        return Vector2.divideScalar(a, Vector2.norm(a) || 1, out);
    };
    Vector2.random = function (norm, out) {
        if (norm === void 0) { norm = 1; }
        if (out === void 0) { out = new Vector2(); }
        x = Math.random() * DEG_360_RAD;
        out[0] = Math.cos(x) * norm;
        out[1] = Math.sin(x) * norm;
        return out;
    };
    Vector2.rotate = function (a, angle, center, out) {
        if (center === void 0) { center = Vector2.VECTOR2_ZERO; }
        if (out === void 0) { out = new Vector2(2); }
        c = Math.cos(angle);
        s = Math.sin(angle);
        x = a[0] - center[0];
        y = a[1] - center[1];
        out[0] = x * c - y * s + center[0];
        out[1] = x * s + y * c + center[1];
        return out;
    };
    Vector2.round = function (a, out) {
        if (out === void 0) { out = new Vector2(); }
        out[0] = Math.round(a[0]);
        out[1] = Math.round(a[1]);
        return out;
    };
    Vector2.set = function (x, y, out) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (out === void 0) { out = new Vector2(); }
        out[0] = x;
        out[1] = y;
        return out;
    };
    Vector2.setLength = function (a, length, out) {
        if (out === void 0) { out = new Vector2(2); }
        Vector2.normalize(a, out);
        Vector2.multiplyScalar(out, length, out);
        return out;
    };
    Vector2.toArray = function (a, arr) {
        if (arr === void 0) { arr = []; }
        arr[0] = a[0];
        arr[1] = a[1];
        return arr;
    };
    Vector2.toPalorJson = function (a, p) {
        if (p === void 0) { p = { a: 0, r: 0 }; }
        p.r = Vector2.norm(a);
        p.a = Vector2.angle(a);
        return p;
    };
    Vector2.toString = function (a) {
        return "(".concat(a[0], ", ").concat(a[1], ")");
    };
    Vector2.transformMatrix3 = function (a, m, out) {
        x = a[0];
        y = a[1];
        out[0] = m[0] * x + m[3] * y + m[6];
        out[1] = m[1] * x + m[4] * y + m[7];
        return out;
    };
    return Vector2;
}(Float32Array));

var ax, ay, az, aw, bx, by, bz, len;
var ix, iy, iz, iw;
var A, B, C, D, E, F, G, H, I, J;
var Vector4 = /** @class */ (function (_super) {
    __extends(Vector4, _super);
    function Vector4(x, y, z, w) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (z === void 0) { z = 0; }
        if (w === void 0) { w = 0; }
        var _this = _super.call(this, 4) || this;
        _this[0] = x;
        _this[1] = y;
        _this[2] = z;
        _this[3] = w;
        return _this;
    }
    Object.defineProperty(Vector4.prototype, "x", {
        get: function () {
            return this[0];
        },
        set: function (value) {
            this[0] = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Vector4.prototype, "y", {
        get: function () {
            return this[1];
        },
        set: function (value) {
            this[1] = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Vector4.prototype, "z", {
        get: function () {
            return this[2];
        },
        set: function (value) {
            this[2] = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Vector4.prototype, "w", {
        get: function () {
            return this[3];
        },
        set: function (value) {
            this[3] = value;
        },
        enumerable: false,
        configurable: true
    });
    Vector4.add = function (a, b, out) {
        if (out === void 0) { out = new Vector4(); }
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        out[2] = a[2] + b[2];
        out[3] = a[3] + b[3];
        return out;
    };
    Vector4.ceil = function (a, out) {
        if (out === void 0) { out = new Vector4(); }
        out[0] = Math.ceil(a[0]);
        out[1] = Math.ceil(a[1]);
        out[2] = Math.ceil(a[2]);
        out[3] = Math.ceil(a[3]);
        return out;
    };
    Vector4.closeTo = function (a, b) {
        return (closeToCommon(a[0], b[0]) &&
            closeToCommon(a[1], b[1]) &&
            closeToCommon(a[2], b[2]) &&
            closeToCommon(a[3], b[3]));
    };
    Vector4.create = function (x, y, z, w, out) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (z === void 0) { z = 0; }
        if (w === void 0) { w = 0; }
        if (out === void 0) { out = new Vector4(); }
        out[0] = x;
        out[1] = y;
        out[2] = z;
        out[3] = w;
        return out;
    };
    Vector4.cross = function (u, v, w, out) {
        if (out === void 0) { out = new Float32Array(4); }
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
    Vector4.distanceTo = function (a, b) {
        ax = b[0] - a[0];
        ay = b[1] - a[1];
        az = b[2] - a[2];
        aw = b[3] - a[3];
        return Math.hypot(ax, ay, az, aw);
    };
    Vector4.distanceToSquared = function (a, b) {
        ax = b[0] - a[0];
        ay = b[1] - a[1];
        az = b[2] - a[2];
        aw = b[3] - a[3];
        return ax * ax + ay * ay + az * az + aw * aw;
    };
    Vector4.divide = function (a, b, out) {
        if (out === void 0) { out = new Vector4(); }
        out[0] = a[0] / b[0];
        out[1] = a[1] / b[1];
        out[2] = a[2] / b[2];
        out[3] = a[3] / b[3];
        return out;
    };
    Vector4.dot = function (a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
    };
    Vector4.equals = function (a, b) {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
    };
    Vector4.floor = function (a, out) {
        if (out === void 0) { out = new Vector4(); }
        out[0] = Math.floor(a[0]);
        out[1] = Math.floor(a[1]);
        out[2] = Math.floor(a[2]);
        out[3] = Math.floor(a[3]);
        return out;
    };
    Vector4.fromValues = function (x, y, z, w, out) {
        if (out === void 0) { out = new Vector4(); }
        out[0] = x;
        out[1] = y;
        out[2] = z;
        out[3] = w;
        return out;
    };
    Vector4.inverse = function (a, out) {
        if (out === void 0) { out = new Vector4(); }
        out[0] = 1.0 / a[0];
        out[1] = 1.0 / a[1];
        out[2] = 1.0 / a[2];
        out[3] = 1.0 / a[3];
        return out;
    };
    Vector4.norm = function (a) {
        return Math.hypot(a[0], a[1], a[2], a[3]);
    };
    Vector4.lengthSquared = function (a) {
        ax = a[0];
        ay = a[1];
        az = a[2];
        aw = a[3];
        return ax * ax + ay * ay + az * az + aw * aw;
    };
    Vector4.lerp = function (a, b, t, out) {
        if (out === void 0) { out = new Vector4(); }
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
    Vector4.max = function (a, b, out) {
        if (out === void 0) { out = new Vector4(); }
        out[0] = Math.max(a[0], b[0]);
        out[1] = Math.max(a[1], b[1]);
        out[2] = Math.max(a[2], b[2]);
        out[3] = Math.max(a[3], b[3]);
        return out;
    };
    Vector4.min = function (a, b, out) {
        if (out === void 0) { out = new Vector4(); }
        out[0] = Math.min(a[0], b[0]);
        out[1] = Math.min(a[1], b[1]);
        out[2] = Math.min(a[2], b[2]);
        out[3] = Math.min(a[3], b[3]);
        return out;
    };
    Vector4.minus = function (a, b, out) {
        if (out === void 0) { out = new Vector4(); }
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        out[2] = a[2] - b[2];
        out[3] = a[3] - b[3];
        return out;
    };
    Vector4.multiply = function (a, b, out) {
        if (out === void 0) { out = new Vector4(); }
        out[0] = a[0] * b[0];
        out[1] = a[1] * b[1];
        out[2] = a[2] * b[2];
        out[3] = a[3] * b[3];
        return out;
    };
    Vector4.multiplyScalar = function (a, b, out) {
        if (out === void 0) { out = new Vector4(); }
        out[0] = a[0] * b;
        out[1] = a[1] * b;
        out[2] = a[2] * b;
        out[3] = a[3] * b;
        return out;
    };
    Vector4.negate = function (a, out) {
        if (out === void 0) { out = new Vector4(); }
        out[0] = -a[0];
        out[1] = -a[1];
        out[2] = -a[2];
        out[3] = -a[3];
        return out;
    };
    Vector4.normalize = function (a, out) {
        if (out === void 0) { out = new Vector4(); }
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
    Vector4.round = function (a, out) {
        if (out === void 0) { out = new Vector4(); }
        out[0] = Math.round(a[0]);
        out[1] = Math.round(a[1]);
        out[2] = Math.round(a[2]);
        out[3] = Math.round(a[3]);
        return out;
    };
    Vector4.toString = function (a) {
        return "(".concat(a[0], ", ").concat(a[1], ", ").concat(a[2], ", ").concat(a[3], ")");
    };
    Vector4.transformMatrix4 = function (a, m, out) {
        if (out === void 0) { out = new Vector4(); }
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
    Vector4.transformQuat = function (a, q, out) {
        if (out === void 0) { out = new Vector4(); }
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
    return Vector4;
}(Float32Array));

var TweenSystem = /** @class */ (function (_super) {
    __extends(TweenSystem, _super);
    function TweenSystem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TweenSystem.prototype.query = function (entity) {
        return entity.hasComponent("tween");
    };
    TweenSystem.prototype.destroy = function () {
        throw new Error("Method not implemented.");
    };
    TweenSystem.prototype.run = function (world) {
        return _super.prototype.run.call(this, world);
    };
    TweenSystem.prototype.handle = function (entity, _params) {
        var tweenC = entity.getComponent("tween");
        var map = tweenC.data;
        var from = tweenC.from;
        map.forEach(function (data, key) {
            var rate = tweenC.time / tweenC.duration;
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
    };
    return TweenSystem;
}(System));

// 私有全局变量，外部无法访问
var elementTmp;
var EElementChangeEvent;
(function (EElementChangeEvent) {
    EElementChangeEvent["ADD"] = "add";
    EElementChangeEvent["REMOVE"] = "remove";
})(EElementChangeEvent || (EElementChangeEvent = {}));
var Manager = /** @class */ (function (_super) {
    __extends(Manager, _super);
    function Manager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // private static eventObject: EventObject = {
        // 	component: null as any,
        // 	element: null as any,
        // 	eventKey: null as any,
        // 	manager: null as any
        // };
        _this.elements = new Map();
        _this.disabled = false;
        _this.usedBy = [];
        _this.isManager = true;
        return _this;
    }
    Manager.prototype.addElement = function (element) {
        if (this.has(element)) {
            this.removeElementByInstance(element);
        }
        return this.addElementDirect(element);
    };
    Manager.prototype.addElementDirect = function (element) {
        this.elements.set(element.name, element);
        element.usedBy.push(this);
        this.elementChangeDispatch(Manager.Events.ADD, this);
        return this;
    };
    Manager.prototype.clear = function () {
        this.elements.clear();
        return this;
    };
    Manager.prototype.get = function (name) {
        elementTmp = this.elements.get(name);
        return elementTmp ? elementTmp : null;
    };
    Manager.prototype.has = function (element) {
        if (typeof element === "string") {
            return this.elements.has(element);
        }
        else {
            return this.elements.has(element.name);
        }
    };
    Manager.prototype.removeElement = function (element) {
        return typeof element === "string"
            ? this.removeElementByName(element)
            : this.removeElementByInstance(element);
    };
    Manager.prototype.removeElementByName = function (name) {
        elementTmp = this.elements.get(name);
        if (elementTmp) {
            this.elements.delete(name);
            elementTmp.usedBy.splice(elementTmp.usedBy.indexOf(this), 1);
            this.elementChangeDispatch(Manager.Events.REMOVE, this);
        }
        return this;
    };
    Manager.prototype.removeElementByInstance = function (element) {
        if (this.elements.has(element.name)) {
            this.elements.delete(element.name);
            element.usedBy.splice(element.usedBy.indexOf(this), 1);
            this.elementChangeDispatch(Manager.Events.REMOVE, this);
        }
        return this;
    };
    Manager.prototype.elementChangeDispatch = function (type, eventObject) {
        var e_1, _a, e_2, _b;
        var _c, _d;
        try {
            for (var _e = __values(this.usedBy), _f = _e.next(); !_f.done; _f = _e.next()) {
                var entity = _f.value;
                (_d = (_c = entity).fire) === null || _d === void 0 ? void 0 : _d.call(_c, type, eventObject);
                if (entity.usedBy) {
                    try {
                        for (var _g = (e_2 = void 0, __values(entity.usedBy)), _h = _g.next(); !_h.done; _h = _g.next()) {
                            var manager = _h.value;
                            manager.updatedEntities.add(entity);
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_h && !_h.done && (_b = _g.return)) _b.call(_g);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    Manager.Events = EElementChangeEvent;
    return Manager;
}(EventDispatcher));

// 私有全局变量，外部无法访问
// let componentTmp: IComponent<any> | undefined;
var EComponentEvent;
(function (EComponentEvent) {
    EComponentEvent["ADD_COMPONENT"] = "addComponent";
    EComponentEvent["REMOVE_COMPONENT"] = "removeComponent";
})(EComponentEvent || (EComponentEvent = {}));
var ComponentManager = /** @class */ (function (_super) {
    __extends(ComponentManager, _super);
    function ComponentManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.isComponentManager = true;
        _this.usedBy = [];
        return _this;
    }
    return ComponentManager;
}(Manager));

var TreeNodeWithEvent = mixin(TreeNode);

var arr;
var Entity = /** @class */ (function (_super) {
    __extends(Entity, _super);
    function Entity(name, componentManager) {
        if (name === void 0) { name = ""; }
        var _this = _super.call(this) || this;
        _this.id = IdGeneratorInstance.next();
        _this.isEntity = true;
        _this.componentManager = null;
        _this.disabled = false;
        _this.name = "";
        _this.usedBy = [];
        _this.name = name;
        _this.registerComponentManager(componentManager);
        return _this;
    }
    Entity.prototype.addComponent = function (component) {
        if (this.componentManager) {
            this.componentManager.addElement(component);
        }
        else {
            throw new Error("Current entity hasn't registered a component manager yet.");
        }
        return this;
    };
    Entity.prototype.addChild = function (entity) {
        var e_1, _a;
        _super.prototype.addChild.call(this, entity);
        if (this.usedBy) {
            try {
                for (var _b = __values(this.usedBy), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var manager = _c.value;
                    manager.addElement(entity);
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
    Entity.prototype.addTo = function (manager) {
        manager.addElement(this);
        return this;
    };
    Entity.prototype.addToWorld = function (world) {
        if (world.entityManager) {
            world.entityManager.addElement(this);
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
    Entity.prototype.removeChild = function (entity) {
        var e_2, _a;
        _super.prototype.removeChild.call(this, entity);
        if (this.usedBy) {
            try {
                for (var _b = __values(this.usedBy), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var manager = _c.value;
                    manager.removeElement(entity);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        return this;
    };
    Entity.prototype.removeComponent = function (component) {
        if (this.componentManager) {
            this.componentManager.removeElement(component);
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
}(TreeNodeWithEvent));

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
        .addComponent(new Matrix4Component(WORLD_MATRIX))
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

export { APosition3, AProjection3, ARotation3, AScale3, constants as ATTRIBUTE_NAME, Anchor3, AtlasTexture, constants$1 as COMPONENT_NAME, ColorMaterial, index$1 as ComponentProxy, NormalMaterial$1 as DepthMaterial, EngineEvents, index as EntityFactory, EuclidPosition3, EulerRotation3, Geometry3, index$2 as Geometry3Factory, ImageBitmapTexture, Material, Matrix4Component, NormalMaterial, Object3, PerspectiveProjection$1 as OrthogonalProjection, PerspectiveProjection, Renderable, Sampler, ShaderMaterial, ShadertoyMaterial, SpritesheetTexture, Texture, TextureMaterial, Tween, TweenSystem, Vector3Scale3, WebGLEngine, Clearer as WebGPUClearer, WebGPUEngine, MeshRenderer as WebGPUMeshRenderer, RenderSystem as WebGPURenderSystem };
