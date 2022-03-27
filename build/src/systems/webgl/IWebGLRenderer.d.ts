/// <reference types="dist" />
import IEntity from "@valeera/x/src/interfaces/IEntity";
import IRenderer from "./../IRenderer";
export default interface IWebGLRenderer extends IRenderer {
    render(entity: IEntity, camera: IEntity, passEncoder: GPURenderPassEncoder, scissor?: any): any;
}
