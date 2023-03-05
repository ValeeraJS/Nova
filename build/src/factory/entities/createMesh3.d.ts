import { IWorld } from "@valeera/x";
import { Object3 } from "../../entities/Object3";
import { Geometry } from "../../systems/render/geometry/Geometry";
import { IMaterial } from "../../systems/render/webgpu/material";
export declare const createMesh3: (geometry: Geometry, material?: IMaterial, name?: string, world?: IWorld) => Object3;
