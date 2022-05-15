
import { Matrix3 } from "@valeera/mathx";
import { SCALING_2D } from "../constants";
import Matrix3Component from "./Matrix3Component";

export default abstract class AScale2 extends Matrix3Component {
    constructor(data = Matrix3.create()) {
        super(SCALING_2D, data, [{
			label: SCALING_2D,
			unique: true
		}]);
    }
}
