import { For } from "solid-js";

export default function Triangle(props) {
  const TRIANGLE_HEIGHT = () => props.lines.length * 48 + 32; // Total height of the SVG triangle
  const TRIANGLE_WIDTH = () => TRIANGLE_HEIGHT();  // Total width of the SVG triangle's base
  const FONT_SIZE = 32;        // Font size for the text
  const STROKE_COLOR = "teal"; // Color for the triangle lines
  const TEXT_COLOR = "deeppink"; // Color for the text

  const numSections = () => props.lines.length;
  const sectionHeight = () => (TRIANGLE_HEIGHT() - 32) / numSections();

  const points = () => `${TRIANGLE_WIDTH() / 2},0 0,${TRIANGLE_HEIGHT()} ${TRIANGLE_WIDTH()},${TRIANGLE_HEIGHT()}`;

  return (
    <svg
      width={TRIANGLE_WIDTH()}
      height={TRIANGLE_HEIGHT()}
    viewBox={`-1 -1 ${TRIANGLE_WIDTH() + 2} ${TRIANGLE_HEIGHT() + 2}`}
    >
      <polygon
        points={points()}
        stroke-width="2"
        stroke="#0052d5"
        fill="#e0ebff"
      />

      <For each={props.lines}>
        {(lineText, index) => {
          // Y-coordinate for the bottom line of the current section
          const lineY = () => (index() + 1) * sectionHeight() + 32;

          // Y-coordinate for the center of the text within the current section
          const textY = () => lineY() - sectionHeight() / 2;

          // Calculate the width of the triangle at this specific Y-coordinate
          const currentWidth = () => (lineY() / TRIANGLE_HEIGHT()) * TRIANGLE_WIDTH();

          // Calculate the start and end X-coordinates for the horizontal line
          const lineStartX = () => (TRIANGLE_WIDTH() - currentWidth()) / 2;
          const lineEndX = () => lineStartX() + currentWidth();

          return (
            <>
              {/* Draw the horizontal line separator. We skip the last one because
                  it's the triangle's base, which is already drawn by the polygon. */}
              {index() < numSections() - 1 && (
                <line
                  x1={lineStartX()}
                  y1={lineY()}
                  x2={lineEndX()}
                  y2={lineY()}
                  stroke-width="2"
                  stroke="#0052d5"
                />
              )}

              {/* Text, horizontally and vertically centered within its section */}
              <text
                x={TRIANGLE_WIDTH() / 2}
                y={textY()}
                text-anchor="middle"
                dominant-baseline="middle"
                font-size={FONT_SIZE}
                font-weight="bold"
              >
                <For each={lineText}>
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
