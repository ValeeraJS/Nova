import { POSITION, VERTICES } from "../constants";
import Geometry, { AttributePicker } from "../Geometry";
import { DEFAULT_OPTIONS, IGeometryOptions } from "../geometryOptions";

export type IPlaneGeometryOptions = {
    width: number,
    height: number,
    segmentX: number,
    segmentY: number,
} & IGeometryOptions;

export type IPlaneGeometryOptionsInput = Partial<IPlaneGeometryOptions>;

export const DEFAULT_PLANE_OPTIONS: IPlaneGeometryOptions = {
    ...DEFAULT_OPTIONS,
    hasIndices: true,
    combine: true,
    width: 1,
    height: 1,
    segmentX: 1,
    segmentY: 1,
};


export default (options: IPlaneGeometryOptionsInput = {}): Geometry => {

    const {width, height, segmentX, segmentY, topology, cullMode, hasUV, hasNormal, combine} = {
        ...DEFAULT_PLANE_OPTIONS,
        ...options
    }

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

            positions.push(x, - y, 0);
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
            } else if (hasUV) {
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
    } else {
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
}
