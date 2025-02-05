# Cloudflare Worker Example (ES Module Format)

For this example, we will be using the [Cloudflare Worker](https://workers.cloudflare.com/) platform to make a simple worker that encodes a gif from a set of image frames.

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

Import `encode` from the `gifski-wasm/cloudflare` module and use it to encode the gif.

```js
import encode from 'gifski-wasm/cloudflare';

const frames = [
  [255, 0, 0, 255],
  [0, 255, 0, 255],
  [0, 0, 255, 255],
];

const gif = await encode({ frames, width: 1, height: 1, fps: 1 });
```
