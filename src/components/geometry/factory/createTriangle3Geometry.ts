import { Triangle3 } from "@valeera/mathx/src/shape";
import ITriangle from "@valeera/mathx/src/shape/interfaces/ITriangle";
import { NORMAL, POSITION, UV, VERTICES } from "../constants";
import Geometry3, { AttributePicker } from "../Geometry3";
import { DEFAULT_OPTIONS, geometryOptions } from "./geometryOptions";

export default (t: ITriangle = Triangle3.create(), options: geometryOptions = DEFAULT_OPTIONS, topology: GPUPrimitiveTopology = "triangle-list", cullMode: GPUCullMode = "none"): Geometry3 => {
    let geo = new Geometry3(3, topology, cullMode);
    let stride = 3;
    if (options.combine) {
        let pickers: AttributePicker[] = [{
            name: POSITION,
            offset: 0,
            length: 3,
        }];
        if (options.hasNormal && options.hasUV) {
            stride = 10;
        } else if (options.hasNormal) {
            stride = 7;
        } else if (options.hasUV) {
            stride = 6;
        }
        let result = new Float32Array(stride * 3);
        result.set(t.a);
        result.set(t.b, stride);
        result.set(t.c, stride + stride);

        if (options.hasNormal) {
            let normal = Triangle3.normal(t);
            result.set(normal, 4);
            result.set(normal, stride + 4);
            result.set(normal, stride + stride + 4);
            pickers.push({
                name: 'normal',
                offset: 4,
                length: 3,
            });
        }
        if (options.hasUV) {
            let offset = options.hasNormal ? 8 : 4;
            result.set([0, 0], offset);
            result.set([1, 0], stride + offset);
            result.set([0.5, 1], stride + stride + offset);
            pickers.push({
                name: UV,
                offset,
                length: 2,
            });
        }
        geo.addAttribute(VERTICES, result, stride, []);
        return geo;
    } else {
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
}
