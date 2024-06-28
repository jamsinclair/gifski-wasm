# Changelog

## 2.0.2

### Fix multi-threaded import

- v2.0.1 was broken due to it missing the worker helpers. This release fixes that.

## 2.0.1

### Performance Improvements

- Noticeable speed improvement copying frame data from js to wasm. Faster encoding.

## 2.0.0

### Adds

### Breaking Changes

- Upgrades to latest upstream gifski
- Adds multi-threading support using `wasm-bindgen-rayon`
