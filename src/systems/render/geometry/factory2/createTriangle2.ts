import { Triangle2, ITriangle2 } from "@valeera/mathx";
import { POSITION, UV, VERTICES } from "../constants";
import { Geometry, AttributePicker } from "../Geometry";
import { DEFAULT_OPTIONS, IGeometryOptions } from "../geometryOptions";

export default (t: ITriangle2 = Triangle2.create(), options: IGeometryOptions = DEFAULT_OPTIONS, topology: GPUPrimitiveTopology = "triangle-list", cullMode: GPUCullMode = "none"): Geometry => {
    let geo = new Geometry(2, 3, topology, cullMode);
    let stride = 3;
    if (options.combine) {
        let pickers: AttributePicker[] = [{
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
    } else {
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
}
