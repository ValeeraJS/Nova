
import { Matrix3 } from "@valeera/mathx";
import { ROTATION_2D } from "../constants";
import Matrix3Component from "./Matrix3Component";

export default abstract class ARotation2 extends Matrix3Component {
    constructor(data = Matrix3.create()) {
        super(ROTATION_2D, data, [{
			label: ROTATION_2D,
			unique: true
		}]);
    }
}
