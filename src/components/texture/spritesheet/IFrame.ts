// 精灵图某一帧的类型
export default interface IFrame {
    w: number; // 当前的精灵块的宽度
    h: number;
    x: number; // 当前的精灵块在整个大图里的坐标
    y: number;
    dx: number; // 绘制精灵块区域的偏移坐标。因为完整的一套精灵图元素尺寸大于等于任意一个精灵块
    dy: number;
}
