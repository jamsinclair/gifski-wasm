import type { InitInput } from '../pkg/gifski_wasm.js';
import { threads } from 'wasm-feature-detect';
import { _internal_encode, EncodeOptions } from './encode';

async function initMT(moduleOrPath?: InitInput) {
  const {
    default: init,
    initThreadPool,
    encode,
  } = await import('../pkg-parallel/gifski_wasm.js');
  await init(moduleOrPath);
  await initThreadPool(globalThis.navigator.hardwareConcurrency);
  return { encode };
}

async function initST(moduleOrPath?: InitInput) {
  const { default: init, encode } = await import('../pkg/gifski_wasm.js');
  await init(moduleOrPath);
  return { encode };
}

let wasmReady: ReturnType<typeof initMT | typeof initST>;

export async function init(
  moduleOrPath?: InitInput
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

export async function encode(options: EncodeOptions): Promise<Uint8Array> {
  const { encode: wasmEncode } = await init();
  return _internal_encode(wasmEncode, options);
}

export default encode;
