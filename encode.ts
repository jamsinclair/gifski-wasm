import type { InitInput } from './pkg/gifski_wasm.js';
import initGifskiModule, { encode as gifskiEncode }  from './pkg/gifski_wasm.js';

let gifskiModule: ReturnType<typeof initGifskiModule>;

export async function init (moduleOrPath?: InitInput){
  if (!gifskiModule) {
    gifskiModule = initGifskiModule(moduleOrPath);
  }

  return gifskiModule;
}

function framesToBuffer (frames: Array<Uint8Array | ImageData>): Uint8Array {
    return frames.reduce<Uint8Array>((acc, frame) => {
        let _frame = frame instanceof ImageData || "data" in frame ? frame.data : frame;
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
  await init();

  const numOfFrames = frames.length;
  const framesBuffer = framesToBuffer(frames);

  const buffer = await gifskiEncode(framesBuffer, numOfFrames, width, height, fps, quality, repeat, resizeWidth, resizeHeight);
  if (!buffer) throw new Error('Encoding error.');

  return buffer;
}
