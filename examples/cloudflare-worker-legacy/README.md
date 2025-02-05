# Cloudflare Worker Example (Service Worker Format)

For this example, we will be using the [Cloudflare Worker](https://workers.cloudflare.com/) platform to make a simple worker that encodes a gif from a set of image frames.

⚠️ The example uses the legacy "Service Worker Format" which is still supported by Cloudflare Workers. If possible, we recommend using the ES Module Format which provides a better developer experience. See the [ES Module Format example](/examples/cloudflare-worker-esm-format/README.md) to see the differences.

We can use the latest Wrangler CLI to run the example locally and deploy it to Cloudflare Workers.

## Running the example locally

1. Run `npm install`
2. Run `npm run start` to start the development server
3. You can test the worker's gif encoding functionality by running the following command from your terminal. It should save the output gif to the current directory and flash red, green, and blue colors in a 4x4 grid.

```shell
curl -X POST "http://localhost:8787/" \
-H "Content-Type: application/json" \
-d '{
  "frames": [
    [255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255],
    [0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255,0,255],
    [0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255,0,0,255,255]
  ],
  "width": 4,
  "height": 4,
  "quality": 100,
  "fps": 1
}' -o output.gif
```

## Usage in Cloudflare Worker

One caveat is wrangler won't dynamically bundle the WASM modules with the worker.

You will need to ensure you configure the Worker to set these as global variables in the [wrangler.toml](wrangler.toml) file.

```
# wrangler.toml
[wasm_modules]
# Manually specify the path to the WASM module for each codec
GIFSKI_WASM = "node_modules/gifski-wasm/pkg/gifski_wasm_bg.wasm"
```

If using Wrangler v2 or above, you can also import the WASM modules from the node_modules folder [as seen in the ES Module Format example](/examples/cloudflare-worker-esm-format/README.md).

The module exports an `init` function that can be used to manually load the wasm module.

```js
import encode, { init } from 'gifski-wasm';

await init(GIFSKI_WASM); // The global variable of the wasm module needs to be defined in the wrangler.toml file
const frames = [
  [255, 0, 0, 255],
  [0, 255, 0, 255],
  [0, 0, 255, 255],
];

const gif = await encode({ frames, width: 1, height: 1, fps: 1 });
```
