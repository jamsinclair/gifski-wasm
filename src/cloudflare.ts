import { encode as _encode, EncodeOptions, init } from './encode';

import GIFSKI_WASM from '../pkg/gifski_wasm_bg.wasm';

export async function encode(options: EncodeOptions): Promise<Uint8Array> {
  await init(GIFSKI_WASM);
  return _encode(options);
}

export default encode;
