import { type Component, createSignal } from "solid-js";

const App: Component = () => {
  const [counter, setCounter] = createSignal<number>(0);
  return (
    <div class="flex h-screen items-center justify-center">
      <button
        class="cursor-pointer rounded border px-2 py-1 active:scale-95 active:opacity-95"
        onClick={() => setCounter(counter() + 1)}
      >
        Hello: {counter()}
      </button>
    </div>
  );
};

export default App;
