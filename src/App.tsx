import type { Component } from 'solid-js';
import { createSignal, createMemo, onMount, createEffect } from "solid-js";
import Triangle from "./components/Triangle";
import {triangleFontSize, triangleTopVertexOffset, getTriangleWidth, getTriangleHeight} from "/src/lib/triangle.ts";

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

  const getWidth = (lineCount) => {
    let widthSum = 0;

    for (let i = 1; i <= lineCount; i++) {
      widthSum += getTriangleWidth(i);
    }
    widthSum += Math.max((lineCount - 1), 0) * 16;

    return widthSum;
  };

  const downloadSVG = (format) => {
    setDownloading(true);
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgRef);

    if (format === 'svg') {
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      triggerDownload(url, 'image.svg');
      URL.revokeObjectURL(url);
      setDownloading(false);
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL(`image/${format}`);
      triggerDownload(dataUrl, `image.${format}`);
      setDownloading(false);
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgString);
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
    <div class="p-8 flex flex-col h-dvh gap-y-16 items-center">
      <div class="flex gap-x-16 gap-y-8 flex-col md:flex-row max-w-xl">
      <input onInput={(e) => setInputText(e.target.value)} value={inputText()} class="input input-neutral w-full" /> 
      <button onClick={() => downloadSVG('png')} disabled={downloading() || !lineCount()} class="btn btn-soft btn-primary">
        {downloading() ? 'Downloading...' : 'Download as PNG'}
      </button>
      </div>
      <div class="tracking-widest overflow-x-auto w-full grow">
        <svg ref={svgRef} width={getWidth(lineCount())} height={getTriangleHeight(lineCount())}>
          <For each={triangleStages()}>
            {(stageLines, stageIndex) => <Triangle lines={stageLines} x={getWidth(stageIndex()) + Math.min(stageIndex(), 1) * 16} />}
          </For>
        </svg>
      </div>
      <div class="w-full flex justify-center"><p>Sponsored by softwarehouse <a href="https://www.cze.tech/contact" target="_blank" class="text-blue-500">RenčiČa</a></p></div>
    </div>
  );
};

export default App;
