import encode, { init } from 'gifski-wasm';

// mock image data
globalThis.ImageData = class ImageData {
  constructor(data, width, height) {
    this.data = data;
    this.width = width;
    this.height = height;
  }
}

/**
 * This request handler expects a body containing:
 * - frames: an array of RGBA arrays representing each frame.
 * - width: the width of the frames.
 * - height: the height of the frames.
 * - quality: the quality of the gif.
 * - fps: the frames per second of the gif.
 * 
 * It will return the binary of the gif in the response body.
 * 
 * Example worker request:
 * curl -X POST "http://localhost:8787/" \
 * -H "Content-Type: application/json" \
 * -d '{
 *   "frames": [
 *     [255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255],
 *     [0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255],
 *     [0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255]
 *   ],
 *   "width": 4,
 *   "height": 4,
 *   "quality": 100,
 *   "fps": 1
 * }' -o output.gif
 */
async function handleRequest(request, ctx) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const payload = await request.json();
  const frames = payload.frames.map(frame => new Uint8ClampedArray(frame));

  await init(GIFSKI_WASM);
  const gif = await encode({
    frames,
    width: payload.width,
    height: payload.height,
    quality: payload.quality,
    fps: payload.fps,
  });
  let response = new Response(gif, { status: 200 });
  response.headers.set('Content-Type', 'image/gif');

  return response;
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request, event));
});
