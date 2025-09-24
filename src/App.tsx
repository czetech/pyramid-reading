import type { Component } from 'solid-js';
import { createSignal, createMemo, onMount, createEffect, createResource, on } from "solid-js";
import Triangle from "./components/Triangle";
import {triangleFontSize, triangleTopVertexOffset, getTriangleWidth, getTriangleHeight} from "/src/lib/triangle.ts";
import { toPng } from 'html-to-image';
import { fontStyle } from "./lib/font.tsx";
import { createStore, reconcile } from "solid-js/store";

const App: Component = () => {
  let svgRef;

  const [inputText, setInputText] = createSignal("");
  const [inputMode, setInputMode] = createSignal("auto");
  const [rows, setRows] = createStore([]);
  const [separator, setSeparator] = createSignal("");
  const [displayMode, setDisplayMode] = createSignal("single");
  const [displayStep, setDisplayStep] = createSignal(0);

  const [downloading, setDownloading] = createSignal(false);

  const text = createMemo(() => inputText().replace(/\s\s+/g, ' ').trim());
  const textWords = createMemo(() => text() ? text().split(" ") : []);

  const autoMode = createMemo(() => {
    const textWordCount = textWords().length;
    if (!textWordCount) {
      return null;
    } else if (textWords().length === 1) {
      return "word";
    } else {
      return "phrase";
    }
  });

  const textMode = createMemo(() => {
    if (inputMode() === "auto") {
      return autoMode();
    } else {
      return inputMode();
    }
  });

  const getRowText = (row) => row.map(row => row.text).join(separator());

  createEffect(() => {
    const words = textWords();
    const rows = [];

    if (textMode() === "word") {
      if (words[0]) {
        const word = words[0];
        rows.push([{text: word[0], marked: true}]);
        let previous = word[0];
        for (let i = 1; i < word.length; i++) {
          const nextChar = word[i];
          rows.push([{text: `${previous}-`}, {text: nextChar, marked: true}]);
          previous += nextChar;
          rows.push([{text: previous, marked: true}]);
        }
      }
    } else {
      for (let i = 0; i < words.length; i++) {
        rows.push(words.slice(0, i + 1).map(word => ({text: `${word} `})));
      }
    }

    setRows(reconcile(rows));
  });

  const lineCount = createMemo(() => rows.length);

  const triangleStages = createMemo(() =>
    rows.map((_, index) => rows.slice(0, index + 1))
  );

  const getWidth = (lineCount, startLineCount) => {
    let widthSum = 0;

    for (let i = startLineCount ?? 1; i <= lineCount; i++) {
      widthSum += getTriangleWidth(i);
    }
    widthSum += Math.max((lineCount - 1), 0) * 16;

    return widthSum;
  };

  const downloadPNG = async (format) => {
    setDownloading(true);

    try {
      const svgWidth = getWidth(Math.min(lineCount(), 5));
      const svgHeight = lineCount() > 5
        ? getTriangleHeight(5) + getTriangleHeight(lineCount()) + 64
        : getTriangleHeight(lineCount());

      if (!svgRef) {
        return;
      }

      const dataUrl = await toPng(svgRef, {
        //width: svgWidth,
        //height: svgHeight,
      });

      triggerDownload(dataUrl, `pyramid-${text().replaceAll(" ", "_")}.png`);

    } catch (error) {
      console.error('Failed to download image:', error);
    } finally {
      setDownloading(false);
    }
  };

  const downloadSVG = () => {
    if (!svgRef) {
      return;
    }

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgRef);
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    triggerDownload(url, `pyramid-${text().replaceAll(" ", "_")}.svg`);
    URL.revokeObjectURL(url);
  };

  const triggerDownload = (url, filename) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
  a.click();
    document.body.removeChild(a);
  };

  createEffect(on(text, (text) => {
    setDisplayStep(0)
  }));

  const handleDisplayStep = (step) => {
    setDisplayMode("single");
    setDisplayStep(step);
  };

  const handleDisplayMultiple = () => {
    setDisplayMode("multi");
    setDisplayStep(0);
  };

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    setInputText(params.get('text') || '');
    setInputMode(params.get('mode') || 'auto');

    createEffect(() => {
      const url = new URL(window.location.toString());
      if (text()) {
        url.searchParams.set('text', text());
      } else {
        url.searchParams.delete('text');
      }
      if (inputMode() !== "auto") {
        url.searchParams.set('mode', inputMode());
      } else {
        url.searchParams.delete('mode');
      }
      window.history.replaceState(null, '', url.toString());
    });
  });

  return (
    <div class="flex h-dvh flex-col gap-y-8 items-center px-8 pb-2">
      <main class="grow flex flex-col gap-y-8 w-full">
        <fieldset class="fieldset grid-cols-2 bg-base-200 border-base-300 rounded-box border px-2">
          <legend class="fieldset-legend">Input</legend>
          <label class="label">Text</label>
          <label class="label">Mode</label>
          <input onInput={(e) => setInputText(e.target.value)} value={inputText()} class="input input-primary col-start-1" />
          <select class="select select-primary" value={inputMode()} onInput={(e) => setInputMode(e.currentTarget.value)}>
            <option value="auto">Auto{autoMode() ? ` (${autoMode()})` : null}</option>
            <option value="word">Word</option>
            <option value="phrase">Phrase</option>
          </select>
        </fieldset>
        <div class="grow">
          <div class="flex flex-col gap-y-8 items-center">
            <fieldset class="fieldset bg-base-200 border-base-300 rounded-box border grid-cols-2 gap-y-2 px-2">
              <legend class="fieldset-legend">Display</legend>
              <ul class="steps col-span-2">
                <For each={rows} fallback={<li class="step" style={{"--step-bg": "color-mix(in oklab, var(--color-base-content) 10%, transparent)", "--step-fg": "color-mix(in oklch, var(--color-base-content) 20%, #0000)"}}>…</li>}>
                  {(row, index) =>
                    <li class="step" classList={{"step-primary": displayMode() === "single" && (!displayStep() || displayStep() >= index() + 1)}} onClick={() => handleDisplayStep(index() + 1)}>{getRowText(row)}</li>
                  }
                </For>
              </ul>
              <div class="divider col-span-2" style={{"--divider-m": "0"}}>OR</div>
              <button disabled class="btn" onClick={handleDisplayMultiple} classList={{"btn-primary": displayMode() === "multi"}}>Multiple</button>
            </fieldset>
            <div class="flex gap-x-4">
            <button onClick={() => downloadPNG('png')} disabled={downloading() || !lineCount()} class="btn btn-soft btn-primary">
              {downloading() ? 'Downloading...' : 'Download as PNG'}
            </button>
            <button onClick={() => downloadSVG()} disabled={!lineCount()} class="btn btn-soft btn-primary">
              Download as SVG
            </button>
            </div>
            <div class="flex justify-center max-w-full">
            <div class="overflow-x-auto w-full">
            <svg ref={svgRef} width={getTriangleWidth(displayStep() || lineCount())} height={getTriangleHeight(displayStep() || lineCount())} viewbox={`0 0 ${getTriangleWidth(displayStep() || lineCount())} ${getTriangleHeight(displayStep() || lineCount())}`}
              style={{
                'letter-spacing': '0.1em',
              }}>
              <style innerHTML={fontStyle} />
              {/*<For each={triangleStages().slice(0, 5)}>
                {(stageLines, stageIndex) => <Triangle lines={stageLines} x={getWidth(stageIndex()) + Math.min(stageIndex(), 1) * 16} />}
              </For>
              <For each={triangleStages().slice(5, 7)}>
                {(stageLines, stageIndex) => <Triangle lines={stageLines} x={getWidth(stageIndex() ? stageIndex() + 4 : 0, 5) + Math.min(stageIndex(), 1) * 16} y={getTriangleHeight(5) + 64} />}
              </For>*/}
              <Triangle lines={rows} showRowsCount={displayStep} />
            </svg>
            </div>
            </div>
          </div>
        </div>
      </main>
      <footer class="w-full flex justify-center"><p>Sponsored by softwarehouse <a href="https://www.cze.tech/contact" target="_blank" class="text-blue-500">RenčiČa</a></p></footer>
    </div>
  );
};

export default App;
