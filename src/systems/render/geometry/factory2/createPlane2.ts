import { POSITION, VERTICES } from "../constants";
import { Geometry, AttributePicker } from "../Geometry";
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
    cullMode: "back"
};


export default (options: IPlaneGeometryOptionsInput = {}): Geometry => {

    const {width, height, segmentX, segmentY, topology, cullMode, hasUV, combine} = {
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
    const uvs = [];

    for (let iy = 0; iy < gridY1; iy++) {
        const y = iy * segmentHeight - halfY;
        for (let ix = 0; ix < gridX1; ix++) {
            const x = ix * segmentWidth - halfX;

            positions.push(x, - y);

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
        let pickers: AttributePicker[] = [{
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
