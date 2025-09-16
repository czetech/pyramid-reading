import type { Component } from 'solid-js';
import { createSignal, createMemo } from "solid-js";
import Triangle from "./components/Triangle";

const App: Component = () => {
  const [inputText, setInputText] = createSignal("SEX");

  const lines = createMemo(() => {
    const word = inputText().trim().split(" ")[0];

    if (!word) {
      return [];
    }

    const result = [[{text: word[0]}]];
    let currentCombined = word[0];
    for (let i = 1; i < word.length; i++) {
      const nextChar = word[i];
      result.push([{text: `${currentCombined}-`}, {text: nextChar, fill: "red"}]);
      currentCombined += nextChar;
      result.push([{text: currentCombined, fill: "red"}]);
    }

    return result;
  });

  const triangleStages = createMemo(() =>
    lines().map((_, index) => lines().slice(0, index + 1))
  );

  return (
    <div class="p-8 flex flex-col h-dvh">
      <input onInput={(e) => setInputText(e.target.value)} value={inputText()} class="input input-neutral mb-8" />
      <div class="grow">
      <div class="flex gap-4 items-end. flex-wrap mb-16">
        <For each={triangleStages()}>
          {(stageLines) => <Triangle lines={stageLines} />}
        </For>
      </div>
      </div>
      <p class="w-full flex justify-center">Sponsored by softwarehouse RenčiČa</p>
    </div>
  );
};

export default App;
