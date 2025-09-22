import { For } from "solid-js";
import { createMemo, createEffect } from "solid-js";
import { createStore, reconcile } from "solid-js/store";

import {triangleFontSize, triangleTopVertexOffset, getTriangleWidth, getTriangleHeight} from "/src/lib/triangle.ts";

export default function Triangle(props) {
  const lineCount = createMemo(() => props.lines.length);
  const width = createMemo(() => getTriangleWidth(props.showRowsCount() || lineCount()));
  const height = createMemo(() => getTriangleHeight(props.showRowsCount() || lineCount()));
  const sectionHeight = createMemo(() => (height() - triangleTopVertexOffset) / (props.showRowsCount() || lineCount()));
  const vertices = createMemo(() => `${width() / 2},0 0,${height()} ${width()},${height()}`);

  return (
    <svg
      width={width()}
      height={height()}
      viewBox={`-1 -1 ${width() + 2} ${height() + 2}`}
      x={props.x}
      y={props.y}
    >
      <polygon
        points={vertices()}
        stroke-width="2"
        stroke="#0052d5"
        fill="#e0ebff"
      />

      <For each={props.lines.slice(0, props.showRowsCount() || props.lines.length)}>
        {(line, index) => {
          JSON.stringify(line)

          // Y-coordinate for the bottom line of the current section
          const lineY = () => (index() + 1) * sectionHeight() + triangleTopVertexOffset;

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
                  {(word) => <tspan fill={index() + 1 === (props.showRowsCount() || props.lines.length) && word.marked ? "red" : null}>{word.text}</tspan>}
                </For>
              </text>
            </>
          );
        }}
      </For>
    </svg>
  );
}
