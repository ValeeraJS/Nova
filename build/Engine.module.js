import EventDispatcher from '@valeera/eventdispatcher';
import { Matrix4 } from '@valeera/mathx';
import IdGenerator from '@valeera/idgenerator';

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

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

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

export { APosition3, AProjection3, ARotation3, AScale3, Clearer, EuclidPosition3, EulerRotation3, Geometry3, Matrix4Component, MeshRenderer, Object3, PerspectiveProjection, RendererSystem as RenderSystem, Renderable, Vector3Scale3, WebGPUEngine };
//# sourceMappingURL=Engine.module.js.map
