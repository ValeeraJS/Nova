import Timeline from '@valeera/timeline';
export { default as Timeline } from '@valeera/timeline';
import EventFirer from '@valeera/eventfirer';
export { default as EventFire } from '@valeera/eventfirer';
import { Component, Entity, System } from '@valeera/x';
export * from '@valeera/x';
import { Vector3, Constants, Triangle3, Triangle2, Matrix3, Vector2, Polar, Matrix4, EulerAngle, Spherical, Vector4, ColorGPU, ColorRGB, ColorRGBA, ColorHSL } from '@valeera/mathx';
export * from '@valeera/mathx';
import { TreeNode } from '@valeera/tree';

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
	TEXTURE_GPU: TEXTURE_GPU,
	TEXTURE_IMAGE: TEXTURE_IMAGE,
	TRANSLATION_2D: TRANSLATION_2D,
	TRANSLATION_3D: TRANSLATION_3D,
	VIEWING_3D: VIEWING_3D,
	WORLD_MATRIX3: WORLD_MATRIX3,
	WORLD_MATRIX4: WORLD_MATRIX4
});

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
var createBox3 = (options = {}) => {
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
var createCircle3 = (options = {}) => {
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

const DEFAULT_SPHERE_OPTIONS$1 = {
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
    thetaLength: Constants.DEG_360_RAD,
    cullMode: "back"
};
var createCylinder3 = (options = {}) => {
    let stride = 3;
    const indices = [];
    const vertices = [];
    const normals = [];
    const uvs = [];
    const { height, radialSegments, radiusTop, radiusBottom, heightSegments, openEnded, thetaStart, thetaLength, topology, cullMode, hasUV, hasNormal, combine } = {
        ...DEFAULT_SPHERE_OPTIONS$1,
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
var createPlane3 = (options = {}) => {
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
var createSphere3 = (options = {}) => {
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

var index$3 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	createBox3: createBox3,
	createCircle3: createCircle3,
	createCylinder3: createCylinder3,
	createPlane3: createPlane3,
	createSphere3: createSphere3,
	createTriangle3: createTriangle3
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

var index$2 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	createCircle2: createCircle2,
	createPlane2: createPlane2,
	createTriangle2: createTriangle2
});

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
    tags = [{
            label: MATERIAL,
            unique: true
        }];
    constructor(vertex, fragment, uniforms = [], blend = DEFAULT_BLEND_STATE) {
        super("material", { vertex, fragment, uniforms, blend });
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

class Sampler extends Component {
    data = {
        minFilter: 'linear',
        magFilter: 'linear',
    };
    constructor(option = {}) {
        super(SAMPLER, option);
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
    dataD;
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
                    0,
                    0,
                    0,
                    0, // 11
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

class Renderable extends Component {
    tags = [{
            label: RENDERABLE,
            unique: true
        }];
    constructor(renderType) {
        super(RENDERABLE, renderType);
    }
}

const canvases = []; // 储存多个canvas，可能存在n个图同时画
async function drawSpriteBlock(image, width, height, frame) {
    let canvas = canvases.pop() || document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, frame.x, frame.y, frame.w, frame.h, frame.dx, frame.dy, frame.w, frame.h);
    let result = await createImageBitmap(canvas);
    canvases.push(canvas);
    return result;
}

class Texture extends Component {
    dirty = false;
    width;
    height;
    constructor(width, height, img, name = "texture") {
        super(name, img);
        this.width = width;
        this.height = height;
        this.imageBitmap = img;
    }
    destroy() {
        this.data?.close();
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
    loaded = false;
    image;
    framesBitmap = [];
    constructor(json, name = "atlas-texture") {
        super(json.spriteSize.w, json.spriteSize.h, null, name);
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
        super(width, height, null, name);
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
        if (this.width !== this.data.width || this.height !== this.data.height) {
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
        super(json.spriteSize.w, json.spriteSize.h, null, name);
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
    loop;
    state;
    time;
    end = false;
    loopWholeTimes;
    constructor(from, to, duration = 1000, loop = 0) {
        super("tween", new Map());
        this.loopWholeTimes = loop;
        this.from = from;
        this.to = to;
        this.duration = duration;
        this.loop = loop;
        this.state = TWEEN_STATE.IDLE;
        this.time = 0;
        this.checkKeyAndType(from, to);
    }
    reset() {
        this.loop = this.loopWholeTimes;
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

var index$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	getEuclidPosition3Proxy: getEuclidPosition3Proxy,
	getEulerRotation3Proxy: getEulerRotation3Proxy
});

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

class Engine extends EventFirer.mixin(Timeline) {
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

let Object3$1 = class Object3 extends Entity {
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
};

let Camera3$1 = class Camera3 extends Object3$1 {
    projection;
    constructor(name = "Camera2", projection) {
        super(name);
        this.projection = projection;
    }
};

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
        map.set(name, data);
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
            this.#checkAllParseAndSetResource(resource, data);
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

const TextureParser = async (blob) => {
    const bitmap = await createImageBitmap(blob);
    return new Texture(bitmap.width, bitmap.height, bitmap);
};

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

const DEFAULT_MATERIAL3 = new Material(`
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
new Material(`
struct Uniforms {
	modelViewProjectionMatrix : mat3x3<f32>
};
@binding(0) @group(0) var<uniform> uniforms : Uniforms;

struct VertexOutput {
	@builtin(position) Position : vec4<f32>
};

@vertex fn main(@location(0) position : vec3<f32>) -> VertexOutput {
	var output : VertexOutput;
	var p: vec3<f32> = uniforms.modelViewProjectionMatrix * position;
	output.Position = vec4<f32>(p.x, p.y, p.z, 1.);

	return output;
}
`, `
@fragment fn main() -> @location(0) vec4<f32> {
	return vec4<f32>(1., 1., 1., 1.0);
}
`);

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
    render(mesh, context) {
        let cacheData = this.entityCacheData.get(mesh);
        // 假设更换了几何体和材质则重新生成缓存
        let material = mesh.getFirstComponentByTagLabel(MATERIAL) || DEFAULT_MATERIAL3;
        let geometry = mesh.getFirstComponentByTagLabel(GEOMETRY);
        if (!cacheData || mesh.getFirstComponentByTagLabel(MATERIAL)?.dirty || material !== cacheData.material || geometry !== cacheData.geometry) {
            cacheData = this.createCacheData(mesh, context);
            this.entityCacheData.set(mesh, cacheData);
        }
        else {
            // TODO update cache
            updateModelMatrixComponent$1(mesh);
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
        Matrix3.multiply(mvp, mesh.worldMatrix.data, mvp);
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
        context.passEncoder.draw(mesh.getFirstComponentByTagLabel(GEOMETRY).count, 1, 0, 0);
        return this;
    }
    createCacheData(mesh, context) {
        updateModelMatrixComponent$1(mesh);
        let device = context.device;
        let uniformBuffer = device.createBuffer({
            size: 64,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        let buffers = [];
        let geometry = mesh.getFirstComponentByTagLabel(GEOMETRY);
        let material = mesh.getFirstComponentByTagLabel(MATERIAL) || DEFAULT_MATERIAL3;
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
        let uniforms = mesh.getFirstComponentByTagLabel(MATERIAL)?.data?.uniforms;
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
        return context.device.createBindGroupLayout({
            entries,
        });
    }
    createStages(material, vertexBuffers, context) {
        let vertex = {
            module: context.device.createShaderModule({
                code: material.data.vertex,
            }),
            entryPoint: "main",
            buffers: vertexBuffers
        };
        let fragment = {
            module: context.device.createShaderModule({
                code: material.data.fragment,
            }),
            entryPoint: "main",
            targets: [
                {
                    format: context.preferredFormat,
                    blend: material?.data.blend
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
    render(mesh, context) {
        let cacheData = this.entityCacheData.get(mesh);
        // 假设更换了几何体和材质则重新生成缓存
        let material = mesh.getFirstComponentByTagLabel(MATERIAL) || DEFAULT_MATERIAL3;
        let geometry = mesh.getFirstComponentByTagLabel(GEOMETRY);
        if (!cacheData || mesh.getFirstComponentByTagLabel(MATERIAL)?.dirty || material !== cacheData.material || geometry !== cacheData.geometry || geometry.dirty) {
            cacheData = this.createCacheData(mesh, context);
            this.entityCacheData.set(mesh, cacheData);
        }
        else {
            // TODO update cache
            updateModelMatrixComponent(mesh);
        }
        context.passEncoder.setPipeline(cacheData.pipeline);
        // passEncoder.setScissorRect(0, 0, 400, 225);
        // TODO 有多个attribute buffer
        for (let i = 0; i < cacheData.attributesBuffers.length; i++) {
            context.passEncoder.setVertexBuffer(i, cacheData.attributesBuffers[i]);
        }
        const mvp = cacheData.mvp;
        Matrix4.multiply(this.camera.projection.data, Matrix4.invert(updateModelMatrixComponent(this.camera).data), mvp);
        Matrix4.multiply(mvp, mesh.worldMatrix.data, mvp);
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
        context.passEncoder.draw(mesh.getFirstComponentByTagLabel(GEOMETRY).count, 1, 0, 0);
        return this;
    }
    createCacheData(mesh, context) {
        updateModelMatrixComponent(mesh);
        let device = context.device;
        let uniformBuffer = device.createBuffer({
            size: 64,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        let buffers = [];
        let geometry = mesh.getFirstComponentByTagLabel(GEOMETRY);
        geometry.dirty = true;
        let material = mesh.getFirstComponentByTagLabel(MATERIAL) || DEFAULT_MATERIAL3;
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
        let uniforms = mesh.getFirstComponentByTagLabel(MATERIAL)?.data?.uniforms;
        let uniformMap = new Map();
        if (uniforms) {
            for (let i = 0; i < uniforms.length; i++) {
                const uniform = uniforms[i];
                if (uniform.type === BUFFER) {
                    const buffer = device.createBuffer({
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
                    const sampler = device.createSampler(uniform.value.data);
                    uniformMap.set(sampler, uniform);
                    groupEntries.push({
                        binding: uniform.binding,
                        resource: sampler
                    });
                }
                else if (uniform.type === TEXTURE_IMAGE) {
                    uniform.value.dirty = true;
                    uniform.dirty = true;
                    const texture = uniform.value instanceof GPUTexture ? uniform.value : device.createTexture({
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
        return context.device.createBindGroupLayout({
            entries,
        });
    }
    createStages(material, vertexBuffers, context) {
        let vertex = {
            module: context.device.createShaderModule({
                code: material.data.vertex,
            }),
            entryPoint: "main",
            buffers: vertexBuffers
        };
        let fragment = {
            module: context.device.createShaderModule({
                code: material.data.fragment,
            }),
            entryPoint: "main",
            targets: [
                {
                    format: context.preferredFormat,
                    blend: material?.data.blend
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
    else if (color instanceof ColorHSL) {
        ColorGPU.fromColorHSL(color.h, color.s, color.l, result);
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
    currentCommandEncoder;
    swapChainTexture;
    targetTexture;
    msaaTexture;
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
                usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
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
                usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
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
        this.rendererMap.get(entity.getComponent(RENDERABLE)?.data)?.render(entity, this.context);
        return this;
    }
    loopStart() {
        this.currentCommandEncoder = this.context.device.createCommandEncoder();
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
        this.context.passEncoder = this.currentCommandEncoder.beginRenderPass(this.renderPassDescriptor);
    }
    loopEnd() {
        this.context.passEncoder.end();
        this.context.device.queue.submit([this.currentCommandEncoder.finish()]);
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

class TweenSystem extends System {
    query(entity) {
        let component = entity.getComponent("tween");
        if (!component) {
            return false;
        }
        component.time = 0;
        return true;
    }
    destroy() {
        throw new Error("Method not implemented.");
    }
    handle(entity, time, delta) {
        let tweenC = entity.getComponent("tween");
        if (tweenC.end) {
            return this;
        }
        tweenC.time += delta;
        if (tweenC.time > tweenC.duration) {
            tweenC.loop--;
            if (tweenC.loop >= 0) {
                tweenC.time -= tweenC.duration;
            }
            else {
                tweenC.end = true;
                tweenC.time = tweenC.duration;
            }
        }
        let map = tweenC.data;
        let from = tweenC.from;
        let rate = tweenC.time / tweenC.duration;
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

var createMesh2 = (geometry, material = DEFAULT_MATERIAL3, name = MESH2, world) => {
    const entity = new Object3$1(name);
    entity.addComponent(geometry)
        .addComponent(material)
        .addComponent(new Renderable(MESH2));
    if (world) {
        world.addEntity(entity);
    }
    return entity;
};

var createMesh3 = (geometry, material = DEFAULT_MATERIAL3, name = MESH3, world) => {
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

export { APosition2, APosition3, AProjection2, AProjection3, ARotation2, ARotation3, AScale2, AScale3, constants as ATTRIBUTE_NAME, Anchor2, Anchor3, AngleRotation2, AtlasTexture, constants$1 as COMPONENT_NAME, Camera3$1 as Camera2, Camera3, ColorMaterial, index$1 as ComponentProxy, DEFAULT_ENGINE_OPTIONS, DepthMaterial, Engine, EngineEvents, EngineTaskChunk, index as EntityFactory, EuclidPosition2, EuclidPosition3, EulerRotation3, Geometry, index$2 as Geometry2Factory, index$3 as Geometry3Factory, HashRouteComponent, HashRouteSystem, ImageBitmapTexture, LoadType, Material, Matrix3Component, Matrix4Component, MeshObjParser, NormalMaterial, Object3$1 as Object2, Object3, OrthogonalProjection, PerspectiveProjection, PerspectiveProjectionX, PolarPosition2, Projection2D, Renderable, ResourceStore, Sampler, ShaderMaterial, ShadertoyMaterial, SphericalPosition3, SpritesheetTexture, Texture, TextureMaterial, TextureParser, Tween, TweenSystem, Vector2Scale2, Vector3Scale3, WebGPUMesh2Renderer, WebGPUMesh3Renderer, WebGPURenderSystem, WebGPURenderSystem as WebGPURenderSystem2 };
