import { Matrix4 } from "@valeera/mathx";
import { PROJECTION_3D } from "../constants";
import Matrix4Component from "./Matrix4Component";

export default abstract class AProjection3 extends Matrix4Component {
    constructor(data = Matrix4.create()) {
        super(PROJECTION_3D, data);
    }
}
