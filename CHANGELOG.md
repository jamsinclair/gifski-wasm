# Changelog

## 2.1.1

### Improvements

- Additionally, expose the `encode` function as a named export.

## 2.1.0

### New Features

- Adds support for custom frame durations. Instead of using a single fps value for all frames, you can now specify a custom duration for each frame.
  - The array of frame durations must be the same length as the frames array.
  - Each value in the array will be the duration of the corresponding frame in milliseconds.

## 2.0.2

### Fix multi-threaded import

- v2.0.1 was broken due to it missing the worker helpers. This release fixes that.

## 2.0.1

### Performance Improvements

- Noticeable speed improvement copying frame data from js to wasm. Faster encoding.

## 2.0.0

### Breaking Changes

- Upgrades to latest upstream gifski
- Adds multi-threading support using `wasm-bindgen-rayon`
