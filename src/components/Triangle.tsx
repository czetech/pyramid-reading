import { For } from "solid-js";
import { createMemo, createEffect, createSignal } from "solid-js";
import { createStore, reconcile } from "solid-js/store";

import {triangleFontSize, triangleTopVertexOffset, getTriangleWidth, getTriangleHeight} from "/src/lib/triangle.ts";

export default function Triangle(props) {
  let svgRef;

  const lineCount = createMemo(() => props.lines.length);
  const width = createMemo(() => getTriangleWidth(props.showRowsCount() || lineCount(), props.textMode()));
  const height = createMemo(() => getTriangleHeight(props.showRowsCount() || lineCount()));
  const sectionHeight = createMemo(() => (height() - triangleTopVertexOffset) / (props.showRowsCount() || lineCount()));
  const vertices = createMemo(() => `${width() / 2},0 0,${height()} ${width()},${height()}`);

  const [underlineAttrs, setUnderlineAttrs] = createSignal([]);

  createEffect(() => {
    JSON.stringify(props.lines);

    const linesToDraw = [];

    svgRef.querySelectorAll('tspan[style*="opacity: 0"]').forEach(tspan => {
    
      const bbox = tspan.getBBox();
      const paddingForSpace = -4;
      const lineY = bbox.y + bbox.height + 1;

      linesToDraw.push({
        x1: bbox.x + paddingForSpace + 0,
        y1: lineY,
        x2: bbox.x + bbox.width - paddingForSpace + 0,
        y2: lineY,
      });
    });

    setUnderlineAttrs(linesToDraw);
  });

  return (
    <svg
      width={width()}
      height={height()}
      viewBox={`-1 -1 ${width() + 2} ${height() + 2}`}
      x={props.x}
      y={props.y}
      ref={svgRef}
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
                  {(word) => <><tspan fill={index() + 1 === (props.showRowsCount() || props.lines.length) && word.marked ? "red" : null} style={{"opacity": word.hide ? 0 : null, 'letter-spacing': word.hide ? '0.35em' : '0.1em'}}>{word.text}</tspan><tspan>{props.separator}</tspan></>}
                </For>
              </text>
              <For each={underlineAttrs()}>
                {(attrs) => (
                  <line
                    x1={attrs.x1}
                    y1={attrs.y1}
                    x2={attrs.x2}
                    y2={attrs.y2}
                    stroke="black"
                    stroke-width="1"
                  />
                )}
              </For>
            </>
          );
        }}
      </For>
    </svg>
  );
}
