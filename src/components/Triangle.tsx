import { For } from "solid-js";
import { createMemo } from "solid-js";

import {triangleFontSize, triangleTopVertexOffset, getTriangleWidth, getTriangleHeight} from "/src/lib/triangle.ts";

export default function Triangle(props) {
  const lineCount = createMemo(() => props.lines.length);
  const width = createMemo(() => getTriangleWidth(lineCount()));
  const height = createMemo(() => getTriangleHeight(lineCount()));
  const sectionHeight = createMemo(() => (height() - triangleTopVertexOffset) / lineCount());
  const vertices = createMemo(() => `${width() / 2},0 0,${height()} ${width()},${height()}`);

  return (
    <svg
      width={width()}
      height={height()}
      viewBox={`-1 -1 ${width() + 2} ${height() + 2}`}
      x={props.x}
      y={props.y}
      style={{"font-family": "Roboto Condensed", "letter-spacing": "0.1em"}}
    >
      <polygon
        points={vertices()}
        stroke-width="2"
        stroke="#0052d5"
        fill="#e0ebff"
      />

      <For each={props.lines}>
        {(line, index) => {
          // Y-coordinate for the bottom line of the current section
          const lineY = () => (index() + 1) * sectionHeight() + 32;

          // Y-coordinate for the center of the text within the current section
          const textY = () => lineY() - sectionHeight() / 2 + 4;

          // Calculate the width of the triangle at this specific Y-coordinate
          const currentWidth = () => (lineY() / height()) * width();

          // Calculate the start and end X-coordinates for the horizontal line
          const lineStartX = () => (width() - currentWidth()) / 2;
          const lineEndX = () => lineStartX() + currentWidth();

          return (
            <>
              {index() < lineCount() - 1 && (
                <line
                  x1={lineStartX()}
                  y1={lineY()}
                  x2={lineEndX()}
                  y2={lineY()}
                  stroke-width="2"
                  stroke="#0052d5"
                />
              )}
              <text
                x={width() / 2}
                y={textY()}
                text-anchor="middle"
                dominant-baseline="middle"
                font-size={triangleFontSize}
                font-weight="bold"
              >
                <For each={line}>
                {({text, fill}) => <tspan fill={index() + 1 === props.lines.length ? fill : null}>{text}</tspan>}
                </For>
              </text>
            </>
          );
        }}
      </For>
    </svg>
  );
}
