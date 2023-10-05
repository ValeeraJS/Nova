import { Matrix4 } from "@valeera/mathx";
import { PROJECTION_3D } from "../constants";
import Matrix4Component from "./Matrix4Component";

export default abstract class AProjection3 extends Matrix4Component {
    inverseMatrix = new Float32Array(16);
    constructor(data = Matrix4.create()) {
        super(PROJECTION_3D, data, [{
			label: PROJECTION_3D,
			unique: true
		}]);
    }

    updateProjectionInverse() {
        Matrix4.invert(this.data, this.inverseMatrix);
    }
}
