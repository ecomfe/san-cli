/**
 * @file 返回widget的位置信息
 * @author zttonly
 */

export const GRID_SIZE = 200;
export const ZOOM = 0.7;
export const getPositionStyle = (x, y) => (
    {
        left: `${x}px`,
        top: `${y}px`
    }
);
export const getSizeStyle = ({width, height, field, gridSize}) => (
    {
        width: `${width || gridSize * field.width}px`,
        height: `${height || gridSize * field.height}px`
    }
);
