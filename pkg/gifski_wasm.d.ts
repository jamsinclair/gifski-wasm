/* tslint:disable */
/* eslint-disable */
/**
* @param {Uint8Array} frames
* @param {number} num_of_frames
* @param {number} width
* @param {number} height
* @param {number | undefined} [fps]
* @param {Uint32Array | undefined} [frame_durations]
* @param {number | undefined} [quality]
* @param {number | undefined} [repeat]
* @param {number | undefined} [resize_width]
* @param {number | undefined} [resize_height]
* @returns {Uint8Array}
*/
export function encode(frames: Uint8Array, num_of_frames: number, width: number, height: number, fps?: number, frame_durations?: Uint32Array, quality?: number, repeat?: number, resize_width?: number, resize_height?: number): Uint8Array;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly encode: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
