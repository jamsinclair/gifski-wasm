# Cloudflare Worker Example (ES Module Format)

For this example, we will be using the [Cloudflare Worker](https://workers.cloudflare.com/) platform to upgrade images to WebP.

The example also uses the ES Module Format which is now the preferred way to use Cloudflare Workers.

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

You will need to "import" the correct WASM module manually. Behind the scenes, on deployment, the WASM modules are set as global variables.

The module exports an `init` function that can be used to manually load the wasm module.

```js
import encode, { init } from 'gifski-wasm';

// Import the correct WASM module from the node_modules folder
import GIFSKI_WASM from '../node_modules/gifski-wasm/pkg/gifski_wasm_bg.wasm';

await init(GIFSKI_WASM); // GIFSKI_WASM is the name of the imported file
const frames = [
    [255,0,0,255],
    [0,255,0,255],
    [0,0,255,255],
];

const gif = await encode({ frames, width: 1, height: 1, fps: 1 });
```
