export const triangleLineWidth = 48;

export const triangleFontSize = 32;

export const triangleTopVertexOffset = 32;

export const getTriangleWidth = (lineCount) => lineCount * triangleLineWidth + triangleTopVertexOffset;

export const getTriangleHeight = (lineCount) => lineCount * triangleLineWidth + triangleTopVertexOffset;
