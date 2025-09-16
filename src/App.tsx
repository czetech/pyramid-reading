import type { Component } from 'solid-js';
import { createSignal, createMemo, onMount, createEffect } from "solid-js";
import Triangle from "./components/Triangle";
import {triangleFontSize, triangleTopVertexOffset, getTriangleWidth, getTriangleHeight} from "/src/lib/triangle.ts";
import { toPng } from 'html-to-image';

const App: Component = () => {
  let svgRef;

  const [inputText, setInputText] = createSignal("");
  const [downloading, setDownloading] = createSignal(false);

  const lines = createMemo(() => {
    const word = inputText().trim().split(" ")[0];

    if (!word) {
      return [];
    }

    const result = [[{text: word[0], fill: "red"}]];
    let currentCombined = word[0];
    for (let i = 1; i < word.length; i++) {
      const nextChar = word[i];
      result.push([{text: `${currentCombined}-`}, {text: nextChar, fill: "red"}]);
      currentCombined += nextChar;
      result.push([{text: currentCombined, fill: "red"}]);
    }

    return result;
  });

  const lineCount = createMemo(() => lines().length);

  const triangleStages = createMemo(() =>
    lines().map((_, index) => lines().slice(0, index + 1))
  );

  const getWidth = (lineCount, startLineCount) => {
    let widthSum = 0;

    for (let i = startLineCount ?? 1; i <= lineCount; i++) {
      widthSum += getTriangleWidth(i);
    }
    widthSum += Math.max((lineCount - 1), 0) * 16;

    return widthSum;
  };

  const downloadSVG = async (format) => {
    setDownloading(true);

    try {
      // Fetch the font file and convert it to a base64 data URL
      const fontUrl = 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVi2ZhZI2eCN5jzbjEETS9weq8-33mZKCMSbvNdgg.woff2';
      const response = await fetch(fontUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      const dataUrl = await new Promise(resolve => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });

      // Create a style element with the font-face and other styles
      const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      style.textContent = `
        @font-face {
          font-family: 'Roboto Condensed';
          src: url(${dataUrl}) format('woff2');
        }
        text {
          font-family: 'Roboto Condensed', sans-serif;
          letter-spacing: 0.05em;
        }
      `;

      // Prepend the style to the SVG
      svgRef.prepend(style);

      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svgRef);

      // Remove the style element after serialization to not affect the displayed SVG
      style.remove();

      if (format === 'svg') {
        const blob = new Blob([svgString], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        triggerDownload(url, 'image.svg');
        URL.revokeObjectURL(url);
      } else {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL(`image/${format}`);
          triggerDownload(dataUrl, `pyramid-${inputText()}.${format}`);
        };
        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgString)));
      }
    } catch (error) {
      console.error('Failed to download SVG:', error);
    } finally {
      setDownloading(false);
    }
  };

  const triggerDownload = (url, filename) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    const queryValue = params.get('text') || '';
    setInputText(queryValue);

    createEffect(() => {
      const currentVal = inputText();
      const url = new URL(window.location.toString());
      if (currentVal) {
        url.searchParams.set('text', currentVal);
      } else {
        url.searchParams.delete('text');
      }
      window.history.replaceState({}, '', url.toString());
    });
  });

  return (
    <div class="p-8 pb-2 flex flex-col h-dvh gap-y-8 items-center">
      <div class="flex gap-x-16 gap-y-8 flex-col md:flex-row max-w-xl mb-8">
      <input onInput={(e) => setInputText(e.target.value)} value={inputText()} class="input input-neutral w-full" /> 
      <button onClick={() => downloadSVG('png')} disabled={downloading() || !lineCount()} class="btn btn-soft btn-primary">
        {downloading() ? 'Downloading...' : 'Download as PNG'}
      </button>
      </div>
      <div class="overflow-x-auto w-full grow">
        <svg ref={svgRef} viewBox={`0 0 ${getWidth(Math.min(lineCount(), 5))} ${lineCount() > 5 ? getTriangleHeight(5) + getTriangleHeight(lineCount()) + 64 : getTriangleHeight(lineCount())}`}
          class="w-full h-full"
          style={{
            'max-width': `${getWidth(Math.min(lineCount(), 5))}px`,
            'max-height': `${lineCount() > 5 ? getTriangleHeight(5) + getTriangleHeight(lineCount()) + 64 : getTriangleHeight(lineCount())}px`
          }}>
          <For each={triangleStages().slice(0, 5)}>
            {(stageLines, stageIndex) => <Triangle lines={stageLines} x={getWidth(stageIndex()) + Math.min(stageIndex(), 1) * 16} />}
          </For>
          <For each={triangleStages().slice(5, 7)}>
            {(stageLines, stageIndex) => <Triangle lines={stageLines} x={getWidth(stageIndex() ? stageIndex() + 4 : 0, 5) + Math.min(stageIndex(), 1) * 16} y={getTriangleHeight(5) + 64} />}
          </For>
        </svg>
      </div>
      <div class="w-full flex justify-center"><p>Sponsored by softwarehouse <a href="https://www.cze.tech/contact" target="_blank" class="text-blue-500">RenčiČa</a></p></div>
    </div>
  );
};

export default App;
