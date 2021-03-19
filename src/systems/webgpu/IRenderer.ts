import IEntity from "@valeera/x/src/interfaces/IEntity";

export default interface IRenderer {
    renderTypes: string | string[]; // 某渲染器可渲染的实例渲染标记类型
    render(entity: IEntity, camera: IEntity, passEncoder: GPURenderPassEncoder, scissor?: any): any; // 处理渲染逻辑
}
