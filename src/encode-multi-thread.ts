import type { InitInput } from '../pkg/gifski_wasm.js';
import { threads } from 'wasm-feature-detect';

async function initMT(moduleOrPath?: InitInput) {
  const {
      default: init,
      initThreadPool,
      encode
  } = await import('../pkg-parallel/gifski_wasm.js');
  await init(moduleOrPath);
  await initThreadPool(globalThis.navigator.hardwareConcurrency);
  return { encode };
}
  
async function initST(moduleOrPath?: InitInput) {
  const {
    default: init,
    encode
  } = await import('../pkg/gifski_wasm.js');
  await init(moduleOrPath);
  return { encode };
}
  
let wasmReady: ReturnType<typeof initMT | typeof initST>;
  
export async function init(
  moduleOrPath?: InitInput,
): Promise<ReturnType<typeof initMT | typeof initST>> {
  if (!wasmReady) {
    const hasHardwareConcurrency =
      globalThis.navigator?.hardwareConcurrency > 1;
    const isWorker =
      typeof self !== 'undefined' &&
      typeof WorkerGlobalScope !== 'undefined' &&
      self instanceof WorkerGlobalScope;

    if (isWorker && hasHardwareConcurrency && (await threads())) {
      wasmReady = initMT(moduleOrPath);
    } else {
      wasmReady = initST(moduleOrPath);
    }
  }

  return wasmReady;
}

function framesToBuffer(frames: Array<Uint8Array | ImageData>): Uint8Array {
  // Pre-calculate the total length of all frames and instantiate a buffer of that size
  // Faster than dynamically re-creating the buffer each time (previous approach)
  const totalLength = frames.reduce((acc, frame) => {
      const _frame = (frame instanceof ImageData || "data" in frame ? frame.data : frame) as Uint8Array;
      return acc + _frame.length;
  }, 0);
  const framesBuffer = new Uint8Array(totalLength);

  let offset = 0;
  frames.forEach(frame => {
      const _frame = (frame instanceof ImageData || "data" in frame ? frame.data : frame) as Uint8Array;
      framesBuffer.set(_frame, offset);
      offset += _frame.length;
  });

  return framesBuffer;
}

type EncodeOptions = {
  frames: Array<Uint8Array | ImageData>,
  width: number,
  height: number,
  fps: number,
  quality?: number,
  repeat?: number,
  resizeWidth?: number,
  resizeHeight?: number,
}

export default async function encode({
    frames,
    width,
    height,
    fps,
    quality,
    repeat,
    resizeWidth,
    resizeHeight,
}: EncodeOptions) {
  const { encode } = await init();

  const numOfFrames = frames.length;
  const framesBuffer = framesToBuffer(frames);

  const buffer = await encode(framesBuffer, numOfFrames, width, height, fps, quality, repeat, resizeWidth, resizeHeight);
  if (!buffer) throw new Error('Encoding error.');

  return buffer;
}
