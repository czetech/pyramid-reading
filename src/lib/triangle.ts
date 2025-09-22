export const triangleLineWidth = 64;

export const triangleFontSize = 32;

export const triangleTopVertexOffset = 64;

export const getTriangleWidth = (lineCount) => (lineCount * triangleLineWidth + triangleTopVertexOffset * 2.5);

export const getTriangleHeight = (lineCount) => lineCount * triangleLineWidth + triangleTopVertexOffset;
