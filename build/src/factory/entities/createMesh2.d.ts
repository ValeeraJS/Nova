import { IWorld } from "@valeera/x";
import { Object2 } from "../../entities/Object2";
import { Geometry } from "../../systems/render";
import { IMaterial } from "../../systems/render/IMatrial";
export declare const createMesh2: (geometry: Geometry, material?: IMaterial, name?: string, world?: IWorld) => Object2;
