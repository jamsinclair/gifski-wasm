# gifski-wasm

## ⚠️ This is an experimental package and is not recommended for production use.

Brings [gifski](https://github.com/ImageOptim/gifski) to the web. 

> gifski converts video frames to GIF animations using pngquant's fancy features for efficient cross-frame palettes and temporal dithering. It produces animated GIFs that use thousands of colors per frame.

Powered by WebAssembly ⚡️.

An example app that creates a gif from uploaded frames can be viewed at https://gifski-wasm.netlify.app.

## Installation

```shell
npm i -S gifski-wasm
# Or your favourite package manager alternative
```

## Usage

Note: You will need to either manually include the wasm files from the module directory or use a bundler like WebPack, Rollup or Vite to include them in your app/server.

### encode(options): Promise<ArrayBuffer>

Encodes and animates the frames and resolves to an Uint8Array of the gif output.

Either `fps` or `frameDurations` must be provided.
- If `fps` is provided, all frames will be encoded with the same duration.
- If `frameDurations` is provided, it must be an array of the same length as the frames array. Each value in the array will be the duration of the corresponding frame in milliseconds.

#### options
```typescript
{
  frames: Array<Uint8Array | ImageData>; // An array of Image data or RBGA data to encode
  width: number; // The width of the frames
  height: number; // The height of the frames
  fps?: number; // The frames per second of the gif
  frameDurations?: number[]; // An array of frame durations in milliseconds
  quality?: number; // The quality of the gif, 1-100. Default 80
  repeat?: number;
  resizeWidth?: number;
  resizeHeight?: number;
}
```

#### Example
```js
import encode from 'gifski-wasm';

const frames = [];
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

function getImageData (url) {
    return new Promise(resolve => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0 );
            resolve(ctx.getImageData(0, 0, img.width, img.height));
        };
    });
}

for (let i = 0; i < 24; i++) {
    frames.push(await getImageData(`/image-${i}.png`));
}

// @note, you'll need to make sure your frames are the same height and width
const frameWidth = frames[0].width;
const frameHeight = frames[0].height;
const gif = await encode({ frames, fps: 12, width: frameWidth, height: frameHeight });
```

## Faster Encoding with Web Workers

By default, the encode function will use a single thread to encode the GIF, this is very slow. If you want to speed this up you can enable multithreading with the following.

1. Import the encode method from `gifski-wasm/multi-thread`
1. Move your calls to `encode` into a [WebWorker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers).
1. Configure your web server to use the following headers (this is [a security requirement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer#security_requirements))
    - `Cross-Origin-Opener-Policy: same-origin`
    - `Cross-Origin-Embedder-Policy: require-corp`

This will still only take effect in browsers that support multithreading. If the browser does not support it, it will fallback to single threaded mode.

[See the example project for a full example](/examples/simple-gif-creator/).

## Manual WASM initialisation (not recommended)

In most situations there is no need to manually initialise the provided WebAssembly modules.
The generated glue code takes care of this and supports most web bundlers.

One exception is CloudFlare workers. The environment at this time (this could change in the future) does not allow code to be dynamically imported. It needs to be bundled at runtime. WASM modules are set as global variables or imported, depending on whether using classic or ESM cloudflare workers. See 
- [Classic Cloudflare Worker Example](/examples/cloudflare-worker/README.md)
- [ESM Cloudflare Worker Example](/examples/cloudflare-worker-esm-format/README.md)

The module exports an `init` function that can be used to manually load the wasm module.

```js
import encode, { init } from 'gifski-wasm';

// The `WASM_MODULE` variable will need to be sourced by yourself and passed as an ArrayBuffer.
await init(WASM_MODULE); 
const gif = await encode(/* Make a gif */);
```

## Known Issues

### Issues with Vite and Vue build environments

The wasm file may not be served or bundled by Vite correctly.

To solve this update your `vite.config.js` file with the `optimizeDeps` property with the module name in the exclude array.

```js
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    exclude: ["gifski-wasm"]
  }
})
```
