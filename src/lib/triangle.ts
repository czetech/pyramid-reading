export const triangleLineWidth = 64;

export const triangleFontSize = 32;

export const triangleTopVertexOffset = 64;

export const getTriangleWidth = (lineCount, textMode) => (lineCount * triangleLineWidth + triangleTopVertexOffset) * (textMode === "phrase" ? 1.7 : 1);

export const getTriangleHeight = (lineCount) => lineCount * triangleLineWidth + triangleTopVertexOffset;
