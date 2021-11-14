import { Triangle3 } from "@valeera/mathx/src/shape";
import { NORMAL, POSITION, UV, VERTICES } from "../constants";
import Geometry3, { AttributePicker } from "../Geometry3";
import { DEFAULT_OPTIONS, IGeometryOptions } from "./geometryOptions";

export type ISphereGeometryOptions = {
    segments: number,
    angleStart: number,
    angle: number,
    radius: number,
} & IGeometryOptions;

export const DEFAULT_SPHERE_OPTIONS: ISphereGeometryOptions = {
    ...DEFAULT_OPTIONS,
    hasIndices: true,
    combine: true,
    segments: 32,
    angleStart: 0,
    angle: Math.PI * 2,
    radius: 1,
};


export default (options: ISphereGeometryOptions = DEFAULT_SPHERE_OPTIONS): Geometry3 => {
    let stride = 3;

    const indices = [];
    const positions = [0, 0, 0];
    const normals = [0, 0, 1];
    const uvs = [0.5, 0.5];
    const { segments, angleStart, angle, radius } = options;

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
    let count = len / 3;
    let geo = new Geometry3(len, options.topology, options.cullMode);
    console.log(indices, positions, normals, uvs);
    // TODO indices 现在都是非索引版本
    if (options.combine) {
        let pickers: AttributePicker[] = [{
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
        } else if (options.hasNormal) {
            stride = 6;
            pickers.push({
                name: 'normal',
                offset: 3,
                length: 3,
            });
        } else if (options.hasUV) {
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

            if (options.hasNormal) {
                result[3 + strideI] = normals[i3];
                result[4 + strideI] = normals[i3 + 1];
                result[5 + strideI] = normals[i3 + 2];
                if (options.hasUV) {
                    result[6 + strideI] = uvs[i2];
                    result[7 + strideI] = uvs[i2 + 1];
                }
            } else if (options.hasUV) {
                result[3 + strideI] = uvs[i2];
                result[4 + strideI] = uvs[i2 + 1];
            }
        }

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
