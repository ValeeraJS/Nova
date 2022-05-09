import { Matrix4 } from "@valeera/mathx";
import { SCALING_3D } from "../constants";
import Matrix4Component from "./Matrix4Component";

export default abstract class AScale3 extends Matrix4Component {
    constructor(data = Matrix4.create()) {
        super(SCALING_3D, data, [{
			label: SCALING_3D,
			unique: true
		}]);
    }
}
