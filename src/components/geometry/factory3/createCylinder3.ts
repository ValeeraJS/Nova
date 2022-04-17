import { Constants, Vector3 } from "@valeera/mathx";
import { POSITION, VERTICES } from "../constants";
import Geometry3, { AttributePicker } from "../Geometry3";
import { DEFAULT_OPTIONS, IGeometryOptions } from "./geometryOptions";

export type ICylinderGeometryOptions = {
    radiusTop: number,
    radiusBottom: number,
    height: number,
    radialSegments: number,
    heightSegments: number,
    openEnded: boolean,
    thetaStart: number,
    thetaLength: number
} & IGeometryOptions;

export type ICylinderGeometryOptionsInput = Partial<ICylinderGeometryOptions>;

export const DEFAULT_SPHERE_OPTIONS: ICylinderGeometryOptions = {
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


export default (options: ICylinderGeometryOptionsInput = {}): Geometry3 => {
    let stride = 3;

    const indices: number[] = [];
    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];

    const {height, radialSegments, radiusTop, radiusBottom, heightSegments, openEnded, thetaStart, thetaLength, topology, cullMode, hasUV, hasNormal, combine} = {
        ...DEFAULT_SPHERE_OPTIONS,
        ...options
    };

    let index = 0;
    const indexArray: number[][] = [];
    const halfHeight = height / 2;

    // generate geometry

    generateTorso();

    if (openEnded === false) {

        if (radiusTop > 0) generateCap(true);
        if (radiusBottom > 0) generateCap(false);

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
                vertex[1] = - v * height + halfHeight;
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

    function generateCap(top: boolean) {

        // save the index of the first center vertex
        const centerIndexStart = index;

        const uv = new Float32Array(2);
        const vertex = new Float32Array(3);

        const radius = (top === true) ? radiusTop : radiusBottom;
        const sign = (top === true) ? 1 : - 1;

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

            } else {

                // face bottom

                indices.push(i + 1, i, c);

            }

        }

    }

    let len = indices.length, i3 = 0, strideI = 0, i2 = 0;;
    let geo = new Geometry3(len, topology, cullMode);
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
