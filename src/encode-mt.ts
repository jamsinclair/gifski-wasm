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

function framesToBuffer (frames: Array<Uint8Array | ImageData>): Uint8Array {
    return frames.reduce<Uint8Array>((acc, frame) => {
        let _frame = (frame instanceof ImageData || "data" in frame ? frame.data : frame) as Uint8Array;
        if (acc.length === 0) {
            return new Uint8Array([..._frame]);
        }
        return new Uint8Array([...acc, ..._frame]);
      }, new Uint8Array());
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
