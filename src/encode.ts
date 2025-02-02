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

type BaseEncodeOptions = {
  frames: Array<Uint8Array | ImageData>;
  width: number;
  height: number;
  quality?: number;
  repeat?: number;
  resizeWidth?: number;
  resizeHeight?: number;
}

type EncodeOptions = BaseEncodeOptions & {
  fps: number;
  frameDurations?: never;
} | BaseEncodeOptions & {
  fps?: never;
  frameDurations: Array<number> | Uint32Array;
}

export default async function encode({
    frames,
    width,
    height,
    fps,
    frameDurations,
    quality,
    repeat,
    resizeWidth,
    resizeHeight,
}: EncodeOptions) {
  if (frames.length === 1) {
    throw new Error('At least 2 frames are required to encode a GIF with gifski');
  }

  if (!fps && !frameDurations) {
    throw new Error('Either fps or frameDurations must be provided');
  }

  if (fps && frameDurations) {
    throw new Error('fps and frameDurations cannot be provided at the same time');
  }

  if (frameDurations && frameDurations.length !== frames.length) {
    throw new Error('The number of frame durations must match the number of frames');
  }

  await init();

  const numOfFrames = frames.length;
  const framesBuffer = framesToBuffer(frames);
  const _frameDurations = frameDurations ? new Uint32Array(frameDurations) : undefined;
  const buffer = await gifskiEncode(framesBuffer, numOfFrames, width, height, fps, _frameDurations, quality, repeat, resizeWidth, resizeHeight);
  if (!buffer) throw new Error('Encoding error.');

  return buffer;
}
