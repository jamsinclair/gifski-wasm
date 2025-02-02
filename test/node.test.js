import { promises as fs } from "node:fs";
import test from "ava";
import encode, { init } from "gifski-wasm";

// Polyfill for ImageData
global.ImageData = class ImageData {
  constructor(data, width, height) {
    this.data = data;
    this.width = width;
    this.height = height;
  }
};

async function importWasmModule(path) {
  const fileBuffer = await fs.readFile(path);
  return WebAssembly.compile(fileBuffer);
}

function createFrame(width, height, r, g, b) {
  const frame = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < frame.length; i += 4) {
    frame[i] = r;
    frame[i + 1] = g;
    frame[i + 2] = b;
    frame[i + 3] = 255;
  }
  return frame;
}

test("can successfully encode gif with specified fps", async (t) => {
  const gifskiWasmModule = await importWasmModule(
    "node_modules/gifski-wasm/pkg/gifski_wasm_bg.wasm"
  );
  await init(gifskiWasmModule);

  const frames = [
    createFrame(4, 4, 255, 0, 0),
    createFrame(4, 4, 0, 255, 0),
    createFrame(4, 4, 0, 0, 255),
  ];
  const data = await encode({
    frames,
    width: 4,
    height: 4,
    fps: 1,
  });
  t.assert(data instanceof Uint8Array);
});

test("can successfully encode gif with specified frame durations", async (t) => {
  const gifskiWasmModule = await importWasmModule(
    "node_modules/gifski-wasm/pkg/gifski_wasm_bg.wasm"
  );
  await init(gifskiWasmModule);

  const frames = [
    createFrame(4, 4, 255, 0, 0),
    createFrame(4, 4, 0, 255, 0),
    createFrame(4, 4, 0, 0, 255),
  ];

  const frameDurations = [1000, 1000, 3000];

  const data = await encode({
    frames,
    width: 4,
    height: 4,
    frameDurations,
  });
  t.assert(data instanceof Uint8Array);
});

test("throws error when neither frame durations and fps are provided", async (t) => {
  const gifskiWasmModule = await importWasmModule(
    "node_modules/gifski-wasm/pkg/gifski_wasm_bg.wasm"
  );
  await init(gifskiWasmModule);

  const frames = [
    createFrame(4, 4, 255, 0, 0),
    createFrame(4, 4, 0, 255, 0),
    createFrame(4, 4, 0, 0, 255),
  ];

  try  {
    await encode({
      frames,
      width: 4,
      height: 4,
    });
  } catch (error) {
    t.assert(error instanceof Error);
  }
  t.plan(1);
});

test("throws error when both frame durations and fps are provided", async (t) => {
  const gifskiWasmModule = await importWasmModule(
    "node_modules/gifski-wasm/pkg/gifski_wasm_bg.wasm"
  );
  await init(gifskiWasmModule);

  const frames = [
    createFrame(4, 4, 255, 0, 0),
    createFrame(4, 4, 0, 255, 0),
    createFrame(4, 4, 0, 0, 255),
  ];

  const frameDurations = [1000, 1000, 3000];

  try  {
    await encode({
      frames,
      width: 4,
      height: 4,
      fps: 1,
      frameDurations,
    });
  } catch (error) {
    t.assert(error instanceof Error);
  }
  t.plan(1);
});

test("throws error when frame durations length does not match frames length", async (t) => {
  const gifskiWasmModule = await importWasmModule(
    "node_modules/gifski-wasm/pkg/gifski_wasm_bg.wasm"
  );
  await init(gifskiWasmModule);

  const frames = [
    createFrame(4, 4, 255, 0, 0),
    createFrame(4, 4, 0, 255, 0),
  ];

  const frameDurations = [1000];

  try  {
    await encode({
      frames,
      width: 4,
      height: 4,
      frameDurations,
    });
  } catch (error) {
    t.assert(error instanceof Error);
  }
  t.plan(1);
});
