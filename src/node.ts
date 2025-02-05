// @ts-ignore
import fs from 'node:fs/promises';
import { encode as _encode, EncodeOptions, init as _init } from './encode.js';

let module: WebAssembly.Module;

async function importWasmModule(path: string): Promise<WebAssembly.Module> {
  const fileBuffer = await fs.readFile(path);
  return WebAssembly.compile(fileBuffer);
}

export async function init(): Promise<ReturnType<typeof _init>> {
  if (!module) {
    module = await importWasmModule('../pkg/gifski_wasm_bg.wasm');
  }
  return _init(module);
}

export async function encode(options: EncodeOptions): Promise<Uint8Array> {
  await init();
  return _encode(options);
}

export default encode;
