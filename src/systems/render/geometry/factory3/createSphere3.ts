import { Vector3 } from "@valeera/mathx";
import { POSITION, VERTICES } from "../constants";
import Geometry, { AttributePicker } from "../Geometry";
import { DEFAULT_OPTIONS, IGeometryOptions } from "../geometryOptions";

export type ISphereGeometryOptions = {
    radius: number,
    widthSegments: number,
    heightSegments: number,
    phiStart: number,
    phiLength: number,
    thetaStart: number,
    thetaLength: number
} & IGeometryOptions;

export type ISphereGeometryOptionsInput = Partial<ISphereGeometryOptions>;

export const DEFAULT_SPHERE_OPTIONS: ISphereGeometryOptions = {
    ...DEFAULT_OPTIONS,
    hasIndices: true,
    combine: true,
    radius: 1,
    phiStart: 0,
    phiLength: Math.PI * 2,
    thetaStart: 0,
    thetaLength: Math.PI ,
    widthSegments: 32,
    heightSegments: 32,
    cullMode: "back"
};


export default (options: ISphereGeometryOptionsInput = {}): Geometry => {
    let stride = 3;

    const {radius, phiStart, phiLength, thetaStart, thetaLength, widthSegments, heightSegments, topology, cullMode, hasUV, hasNormal, combine } = {
        ...DEFAULT_SPHERE_OPTIONS,
        ...options,
    }

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

        } else if (iy === heightSegments && thetaEnd === Math.PI) {

            uOffset = - 0.5 / widthSegments;

        }

        for (let ix = 0; ix <= widthSegments; ix++) {

            const u = ix / widthSegments;

            // vertex

            vertex[0] = - radius * Math.cos(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
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

            if (iy !== 0 || thetaStart > 0) indices.push(a, b, d);
            if (iy !== heightSegments - 1 || thetaEnd < Math.PI) indices.push(b, c, d);

        }

    }

    let len = indices.length, i3 = 0, strideI = 0, i2 = 0;;
    let geo = new Geometry(3, len, topology, cullMode);

    // TODO indices 现在都是非索引版本
    if (combine) {
        let pickers: AttributePicker[] = [{
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
        } else if (hasNormal) {
            stride = 6;
            pickers.push({
                name: 'normal',
                offset: 3,
                length: 3,
            });
        } else if (hasUV) {
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
            } else if (hasUV) {
                result[3 + strideI] = uvs[i2];
                result[4 + strideI] = uvs[i2 + 1];
            }
        }

        geo.addAttribute(VERTICES, result, stride, pickers);
        return geo;
    }
    return geo;
}
