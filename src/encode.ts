import type { InitInput } from '../pkg/gifski_wasm.js';
import initGifskiModule, { encode as gifskiEncode }  from '../pkg/gifski_wasm.js';

let gifskiModule: ReturnType<typeof initGifskiModule>;

export async function init (moduleOrPath?: InitInput){
  if (!gifskiModule) {
    gifskiModule = initGifskiModule(moduleOrPath);
  }

  return gifskiModule;
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
  frames: Array<Uint8Array | ImageData>;
  width: number;
  height: number;
  fps: number;
  quality?: number;
  repeat?: number;
  resizeWidth?: number;
  resizeHeight?: number;
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
  await init();

  const numOfFrames = frames.length;
  const framesBuffer = framesToBuffer(frames);

  const buffer = await gifskiEncode(framesBuffer, numOfFrames, width, height, fps, quality, repeat, resizeWidth, resizeHeight);
  if (!buffer) throw new Error('Encoding error.');

  return buffer;
}
